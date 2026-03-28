/**
 * Seed pipeline with closed Feed the Block deals
 * Run: npx tsx scripts/seed-pipeline.ts
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding pipeline deals...\n");

  // LVCVA — Closed
  await prisma.pipelineDeal.upsert({
    where: { id: "ftb-lvcva-2026" },
    update: {},
    create: {
      id: "ftb-lvcva-2026",
      brandName: "LVCVA",
      category: "Municipal / Tourism",
      tier: "presenting",
      status: "closed",
      value: 200000,
      contactName: null,
      contactEmail: null,
      notes: "Las Vegas Convention & Visitors Authority. Feed the Block 2026 presenting sponsor. Deal closed.",
      venues: null,
      dealPoints: JSON.stringify([
        { type: "Event Activation / Sampling", venues: ["commonwealth", "we-all-scream", "discopussy"], status: "active" },
        { type: "LED / Digital Signage", venues: ["commonwealth", "we-all-scream"], status: "active" },
        { type: "Social Media / Content", venues: [], status: "active" },
      ]),
      nextAction: null,
      nextActionDate: null,
    },
  });
  console.log("  ✓ LVCVA — $250K — Closed");

  // City of Las Vegas — Closed
  await prisma.pipelineDeal.upsert({
    where: { id: "ftb-city-lv-2026" },
    update: {},
    create: {
      id: "ftb-city-lv-2026",
      brandName: "City of Las Vegas",
      category: "Municipal / Government",
      tier: "headline",
      status: "closed",
      value: 200000,
      contactName: null,
      contactEmail: null,
      notes: "City of Las Vegas annual sponsorship. $200K for Feed the Block 2026 event series. Funds production, content capture, security, and regional marketing outreach.",
      venues: null,
      dealPoints: JSON.stringify([
        { type: "Event Activation / Sampling", venues: ["commonwealth", "we-all-scream", "discopussy", "la-mona-rosa"], status: "active" },
        { type: "Social Media / Content", venues: [], status: "active" },
        { type: "LED / Digital Signage", venues: ["commonwealth", "we-all-scream"], status: "active" },
      ]),
      nextAction: null,
      nextActionDate: null,
    },
  });
  console.log("  ✓ City of Las Vegas — $200K — Closed");

  // Example prospect — Casamigos
  await prisma.pipelineDeal.upsert({
    where: { id: "prospect-casamigos" },
    update: {},
    create: {
      id: "prospect-casamigos",
      brandName: "Casamigos",
      category: "Tequila / Mezcal",
      tier: "headline",
      status: "prospect",
      value: 95000,
      contactName: null,
      contactEmail: null,
      notes: "Natural fit — already house pour at Lucky Day. Cross-venue tequila trail opportunity.",
      venues: JSON.stringify(["lucky-day", "la-mona-rosa", "commonwealth"]),
      dealPoints: JSON.stringify([
        { type: "House / Well Pour", venues: ["lucky-day", "la-mona-rosa", "commonwealth"], status: "offered" },
        { type: "Featured Cocktail / Menu Inclusion", venues: ["lucky-day", "la-mona-rosa", "park-on-fremont"], status: "offered" },
        { type: "Back Bar Placement", venues: ["lucky-day", "la-mona-rosa", "commonwealth", "doberman"], status: "offered" },
        { type: "Event Activation / Sampling", venues: ["commonwealth"], status: "offered" },
      ]),
      nextAction: "Pull depletion data and build pitch deck",
      nextActionDate: new Date("2026-04-05"),
    },
  });
  console.log("  ✓ Casamigos — $95K — Prospect (with deal points)");

  console.log("\nDone! 3 pipeline deals seeded.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
