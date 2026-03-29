/**
 * Seed pipeline with realistic brand deals to populate the inventory grid.
 * Run: npx tsx scripts/seed-inventory.ts
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const deals = [
  {
    id: "deal-casamigos-house",
    brandName: "Casamigos",
    category: "Tequila / Mezcal",
    tier: "headline",
    status: "closed",
    value: 95000,
    notes: "House pour + featured cocktails at tequila-forward venues. Signed Q1 2026.",
    dealPoints: [
      { type: "House / Well Pour", venues: ["lucky-day", "la-mona-rosa"], status: "active" },
      { type: "Featured Cocktail / Menu Inclusion", venues: ["lucky-day", "la-mona-rosa", "commonwealth"], status: "active" },
      { type: "Back Bar Placement", venues: ["lucky-day", "la-mona-rosa", "commonwealth", "doberman"], status: "active" },
    ],
  },
  {
    id: "deal-titos-well",
    brandName: "Tito's Handmade Vodka",
    category: "Vodka",
    tier: "supporting",
    status: "closed",
    value: 65000,
    notes: "Well vodka across high-volume nightlife venues.",
    dealPoints: [
      { type: "House / Well Pour", venues: ["we-all-scream", "discopussy", "commonwealth"], status: "active" },
      { type: "Back Bar Placement", venues: ["we-all-scream", "discopussy", "commonwealth", "park-on-fremont"], status: "active" },
    ],
  },
  {
    id: "deal-modelo-draft",
    brandName: "Modelo",
    category: "Beer / Hard Seltzer",
    tier: "supporting",
    status: "closed",
    value: 45000,
    notes: "Draft line deal — Modelo Especial featured tap at restaurant venues.",
    dealPoints: [
      { type: "Tap Handle / Draft Line", venues: ["park-on-fremont", "la-mona-rosa", "commonwealth"], status: "active" },
      { type: "Back Bar Placement", venues: ["park-on-fremont", "la-mona-rosa", "cheapshot"], status: "active" },
    ],
  },
  {
    id: "deal-macallan-laundry",
    brandName: "Macallan",
    category: "Whiskey / Bourbon",
    tier: "activation",
    status: "closed",
    value: 36000,
    notes: "Premium whiskey placement in speakeasy + social club.",
    dealPoints: [
      { type: "House / Well Pour", venues: ["laundry-room"], status: "active" },
      { type: "Back Bar Placement", venues: ["laundry-room", "doberman"], status: "active" },
      { type: "Featured Cocktail / Menu Inclusion", venues: ["laundry-room", "doberman"], status: "active" },
    ],
  },
  {
    id: "deal-clase-azul-lucky",
    brandName: "Clase Azul",
    category: "Tequila / Mezcal",
    tier: "activation",
    status: "closed",
    value: 42000,
    notes: "Premium mezcal/tequila display and featured pours at Lucky Day.",
    dealPoints: [
      { type: "Back Bar Placement", venues: ["lucky-day"], status: "active" },
      { type: "Glassware / Branded Serveware", venues: ["lucky-day"], status: "active" },
    ],
  },
  {
    id: "deal-absolut-disco",
    brandName: "Absolut",
    category: "Vodka",
    tier: "activation",
    status: "closed",
    value: 30000,
    notes: "Nightclub vodka partnership with Discopussy.",
    dealPoints: [
      { type: "House / Well Pour", venues: ["discopussy"], status: "active" },
      { type: "LED / Digital Signage", venues: ["discopussy"], status: "active" },
    ],
  },
  {
    id: "deal-don-julio-rosa",
    brandName: "Don Julio",
    category: "Tequila / Mezcal",
    tier: "supporting",
    status: "closed",
    value: 38000,
    notes: "Featured tequila at La Mona Rosa Mexican restaurant.",
    dealPoints: [
      { type: "Featured Cocktail / Menu Inclusion", venues: ["la-mona-rosa"], status: "active" },
      { type: "Back Bar Placement", venues: ["la-mona-rosa"], status: "active" },
      { type: "Staff Training / Brand Ambassador", venues: ["la-mona-rosa"], status: "active" },
    ],
  },
  // Prospects
  {
    id: "deal-redbull-prospect",
    brandName: "Red Bull",
    category: "Energy Drinks",
    tier: "headline",
    status: "contacted",
    value: 120000,
    notes: "EDM venues + Block Party — natural fit. Zero energy drink presence currently.",
    nextAction: "Schedule meeting with regional rep",
    nextActionDate: new Date("2026-04-10"),
    dealPoints: [
      { type: "House / Well Pour", venues: ["discopussy", "we-all-scream"], status: "offered" },
      { type: "Event Activation / Sampling", venues: ["commonwealth", "we-all-scream"], status: "offered" },
      { type: "LED / Digital Signage", venues: ["discopussy", "we-all-scream"], status: "offered" },
      { type: "Social Media / Content", venues: [], status: "offered" },
    ],
  },
  {
    id: "deal-woodford-prospect",
    brandName: "Woodford Reserve",
    category: "Whiskey / Bourbon",
    tier: "supporting",
    status: "prospect",
    value: 55000,
    notes: "Premium bourbon — Doberman Drawing Room is perfect for this brand.",
    dealPoints: [
      { type: "House / Well Pour", venues: ["doberman", "commonwealth"], status: "offered" },
      { type: "Featured Cocktail / Menu Inclusion", venues: ["doberman"], status: "offered" },
      { type: "Back Bar Placement", venues: ["doberman", "commonwealth", "cheapshot"], status: "offered" },
    ],
  },
];

async function main() {
  console.log("Seeding inventory deals...\n");

  for (const deal of deals) {
    await prisma.pipelineDeal.upsert({
      where: { id: deal.id },
      update: {
        dealPoints: JSON.stringify(deal.dealPoints),
        status: deal.status,
      },
      create: {
        id: deal.id,
        brandName: deal.brandName,
        category: deal.category,
        tier: deal.tier,
        status: deal.status,
        value: deal.value,
        notes: deal.notes || null,
        venues: null,
        dealPoints: JSON.stringify(deal.dealPoints),
        nextAction: (deal as { nextAction?: string }).nextAction || null,
        nextActionDate: (deal as { nextActionDate?: Date }).nextActionDate || null,
      },
    });
    console.log(`  ✓ ${deal.brandName} — ${deal.tier} — ${deal.status}`);
  }

  console.log(`\nDone! ${deals.length} deals seeded.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
