import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are the CBM Dashboard Agent — an AI assistant for Corner Bar Management's sponsorship intelligence platform.

You have access to tools that query the CBM database. Use them to answer questions about:
- Pipeline deals (brands, categories, status, deal points, values)
- Inventory (what's sold vs available at each venue)
- Venues (9 venues across Fremont East + Arts District)
- POS data (drink sales, if loaded)

The 9 CBM venues are: Commonwealth, The Laundry Room, We All Scream, Discopussy, Lucky Day, Park On Fremont, Cheapshot, La Mona Rosa, Doberman Drawing Room.

Your name is Disco. You're friendly but professional — a little personality goes a long way.

Format your responses with markdown:
- Use **bold** for brand names and dollar values
- Use bullet lists for deal points and venue lists
- Keep answers concise — 2-4 short paragraphs max
- Use \`code\` formatting for specific numbers or percentages
- Never use headers larger than ### in your responses`;

const tools: Anthropic.Tool[] = [
  {
    name: "query_pipeline",
    description: "Query pipeline deals. Can filter by status (prospect, contacted, meeting, proposal, negotiation, closed, lost), category, or brand name. Returns deal details including deal points and venues.",
    input_schema: {
      type: "object" as const,
      properties: {
        status: { type: "string", description: "Filter by deal status" },
        category: { type: "string", description: "Filter by category (e.g. 'Tequila / Mezcal', 'Vodka')" },
        brandName: { type: "string", description: "Search by brand name (partial match)" },
      },
    },
  },
  {
    name: "query_venues",
    description: "Get venue information — capacity, traffic, features, current sponsors",
    input_schema: {
      type: "object" as const,
      properties: {
        venueId: { type: "string", description: "Specific venue ID (e.g. 'commonwealth', 'lucky-day')" },
      },
    },
  },
  {
    name: "query_inventory",
    description: "Check what deal points are sold vs available at specific venues or across the portfolio. Returns which brands hold which placements.",
    input_schema: {
      type: "object" as const,
      properties: {
        venueId: { type: "string", description: "Filter to a specific venue" },
        dealPointType: { type: "string", description: "Filter to a specific deal point type (e.g. 'House / Well Pour', 'Back Bar Placement')" },
      },
    },
  },
  {
    name: "query_pos_data",
    description: "Query POS/drink sales data if available. Can get top sellers, revenue by venue, category breakdown.",
    input_schema: {
      type: "object" as const,
      properties: {
        venueId: { type: "string", description: "Filter to a specific venue" },
        limit: { type: "number", description: "Number of results to return" },
      },
    },
  },
  {
    name: "get_summary_stats",
    description: "Get high-level portfolio statistics — total deals, pipeline value, closed value, venue count, inventory fill rate",
    input_schema: {
      type: "object" as const,
      properties: {},
    },
  },
];

async function executeTool(name: string, input: Record<string, unknown>): Promise<string> {
  switch (name) {
    case "query_pipeline": {
      const where: Record<string, unknown> = {};
      if (input.status) where.status = input.status;
      if (input.category) where.category = { contains: input.category as string };
      if (input.brandName) where.brandName = { contains: input.brandName as string };
      const deals = await prisma.pipelineDeal.findMany({ where, orderBy: { updatedAt: "desc" } });
      return JSON.stringify(deals.map(d => ({
        ...d,
        dealPoints: d.dealPoints ? JSON.parse(d.dealPoints) : [],
        venues: d.venues ? JSON.parse(d.venues) : [],
      })));
    }

    case "query_venues": {
      if (input.venueId) {
        const venue = await prisma.venue.findUnique({ where: { id: input.venueId as string } });
        return JSON.stringify(venue);
      }
      const venues = await prisma.venue.findMany();
      return JSON.stringify(venues.map(v => ({
        id: v.id, name: v.name, capacity: v.capacity, sqft: v.sqft,
        weeklyTraffic: v.weeklyTraffic, type: v.type, zone: v.zone,
        features: JSON.parse(v.features),
      })));
    }

    case "query_inventory": {
      const deals = await prisma.pipelineDeal.findMany({
        where: { status: { not: "lost" } },
      });
      const inventory: { dealPoint: string; venue: string; brand: string; status: string; category: string }[] = [];
      for (const deal of deals) {
        const points = deal.dealPoints ? JSON.parse(deal.dealPoints) : [];
        for (const dp of points) {
          for (const vid of dp.venues) {
            if (input.venueId && vid !== input.venueId) continue;
            if (input.dealPointType && dp.type !== input.dealPointType) continue;
            inventory.push({
              dealPoint: dp.type, venue: vid,
              brand: deal.brandName, status: dp.status, category: deal.category,
            });
          }
        }
      }
      return JSON.stringify(inventory);
    }

    case "query_pos_data": {
      const where: Record<string, unknown> = {};
      if (input.venueId) where.venueId = input.venueId;
      const limit = (input.limit as number) || 10;
      const records = await prisma.pOSRecord.groupBy({
        by: ["menuItem"],
        where,
        _sum: { qtySold: true, grossSales: true },
        orderBy: { _sum: { qtySold: "desc" } },
        take: limit,
      });
      if (records.length === 0) return "No POS data loaded. Sample data can be loaded from the POS Data page.";
      return JSON.stringify(records);
    }

    case "get_summary_stats": {
      const [totalDeals, closedDeals, venues, posCount] = await Promise.all([
        prisma.pipelineDeal.count(),
        prisma.pipelineDeal.findMany({ where: { status: "closed" } }),
        prisma.venue.count(),
        prisma.pOSRecord.count(),
      ]);
      const pipelineValue = closedDeals.reduce((s, d) => s + (d.value || 0), 0);
      const allDeals = await prisma.pipelineDeal.findMany({ where: { status: { not: "lost" } } });
      let totalSlots = 0, soldSlots = 0;
      for (const deal of allDeals) {
        const points = deal.dealPoints ? JSON.parse(deal.dealPoints) : [];
        for (const dp of points) {
          for (let _i = 0; _i < dp.venues.length; _i++) {
            totalSlots++;
            if (dp.status === "active" || dp.status === "confirmed") soldSlots++;
          }
        }
      }
      return JSON.stringify({
        totalDeals, closedDeals: closedDeals.length, venues,
        closedValue: pipelineValue,
        totalPipelineValue: allDeals.reduce((s, d) => s + (d.value || 0), 0),
        inventorySlots: totalSlots, soldSlots,
        fillRate: totalSlots > 0 ? `${((soldSlots / totalSlots) * 100).toFixed(1)}%` : "0%",
        posRecords: posCount,
      });
    }

    default:
      return "Unknown tool";
  }
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { messages } = await request.json();
  if (!messages || !Array.isArray(messages)) {
    return NextResponse.json({ error: "Messages required" }, { status: 400 });
  }

  let response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    tools,
    messages,
  });

  // Handle tool use loop
  while (response.stop_reason === "tool_use") {
    const toolUseBlocks = response.content.filter(
      (b): b is Anthropic.ToolUseBlock => b.type === "tool_use"
    );

    const toolResults = await Promise.all(
      toolUseBlocks.map(async (block) => ({
        type: "tool_result" as const,
        tool_use_id: block.id,
        content: await executeTool(block.name, block.input as Record<string, unknown>),
      }))
    );

    response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      tools,
      messages: [
        ...messages,
        { role: "assistant", content: response.content },
        { role: "user", content: toolResults },
      ],
    });
  }

  const textContent = response.content.find(
    (b): b is Anthropic.TextBlock => b.type === "text"
  );

  return NextResponse.json({ response: textContent?.text || "No response" });
}
