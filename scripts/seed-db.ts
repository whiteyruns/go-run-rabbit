/**
 * Seed the SQLite database with:
 * 1. Admin + client users
 * 2. All 9 CBM venues
 *
 * Run: npx tsx scripts/seed-db.ts
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const venues = [
  { id: "commonwealth", name: "Commonwealth", address: "525 E Fremont St", zone: "Fremont East", capacity: 300, sqft: 6000, type: "Cocktail Bar / Nightclub", features: '["Rooftop","Stage","Speakeasy (Laundry Room)"]', daysOpen: 7, weeklyTraffic: 3500, notes: "Flagship venue. Two-story with rooftop dance floor. Premium brand placement opportunities." },
  { id: "laundry-room", name: "The Laundry Room", address: "Inside Commonwealth", zone: "Fremont East", capacity: 20, sqft: 500, type: "Speakeasy", features: '["Reservation-Only","Intimate Setting"]', daysOpen: 5, weeklyTraffic: 200, notes: "Ultra-premium positioning. Ideal for luxury spirit partnerships." },
  { id: "we-all-scream", name: "We All Scream", address: "517 E Fremont St", zone: "Fremont East", capacity: 1000, sqft: 10000, type: "Nightclub / Ice Creamery", features: '["Rooftop","Stage","Multi-Level","Back Patio"]', daysOpen: 7, weeklyTraffic: 5500, notes: "Largest venue. Massive untapped sponsorship potential across multiple levels." },
  { id: "discopussy", name: "Discopussy", address: "512 E Fremont St", zone: "Fremont East", capacity: 500, sqft: 6500, type: "House/Techno Nightclub", features: '["Stage","LED Disco-Octopus","Dance Floor"]', daysOpen: 5, weeklyTraffic: 3000, notes: "High-energy EDM crowd. Strong alignment with energy drink and spirit brands." },
  { id: "lucky-day", name: "Lucky Day", address: "516 E Fremont St", zone: "Fremont East", capacity: 103, sqft: 3000, type: "Tequila & Mezcal Bar", features: '["15,000-LED Canopy","Mezcal Focus"]', daysOpen: 7, weeklyTraffic: 1400, notes: "Natural tequila/mezcal house. Premium agave brands compete for placement." },
  { id: "park-on-fremont", name: "Park On Fremont", address: "506 E Fremont St", zone: "Fremont East", capacity: 198, sqft: 5000, type: "Restaurant & Bar", features: '["Front Patio","Back Patio","Full Kitchen"]', daysOpen: 7, weeklyTraffic: 2200, notes: "Original CBM restaurant. Established food + beverage program." },
  { id: "cheapshot", name: "Cheapshot", address: "1028 Fremont St, Ste 100", zone: "Fremont East", capacity: 99, sqft: 3000, type: "Variety Showroom & Bar", features: '["Stage","Intimate Showroom","Live Entertainment"]', daysOpen: 5, weeklyTraffic: 900, notes: "Live entertainment venue. Brand integration during shows is high-value." },
  { id: "la-mona-rosa", name: "La Mona Rosa", address: "100 S 6th St", zone: "Fremont East", capacity: 212, sqft: 3500, type: "Mexican Restaurant & Bar", features: '["Stage","Full Kitchen","Patio","Dining Room"]', daysOpen: 7, weeklyTraffic: 1800, notes: "Mexican cuisine positions well for agave spirits. Patio activations during Block Party." },
  { id: "doberman", name: "Doberman Drawing Room", address: "1025 S 1st St (Arts District)", zone: "Arts District", capacity: 100, sqft: 3400, type: "Social Club / Cocktail Bar", features: '["Membership Program","Atrium Garden","Private Events"]', daysOpen: 6, weeklyTraffic: 800, notes: "Newest venue. Premium/luxury positioning. First CBM venue outside Fremont East." },
];

async function main() {
  console.log("Seeding database...\n");

  // Users
  const adminHash = await bcrypt.hash("gorunrabbit2026", 10);
  const clientHash = await bcrypt.hash("cornerbar2026", 10);

  await prisma.user.upsert({
    where: { email: "keith@gorunrabbit.com" },
    update: {},
    create: { email: "keith@gorunrabbit.com", name: "Keith", password: adminHash, role: "admin" },
  });
  console.log("  Admin user: keith@gorunrabbit.com / gorunrabbit2026");

  await prisma.user.upsert({
    where: { email: "ryan@cornerbar.com" },
    update: {},
    create: { email: "ryan@cornerbar.com", name: "Ryan", password: clientHash, role: "client" },
  });
  console.log("  Client user: ryan@cornerbar.com / cornerbar2026");

  // Venues
  for (const venue of venues) {
    await prisma.venue.upsert({
      where: { id: venue.id },
      update: venue,
      create: venue,
    });
  }
  console.log(`  ${venues.length} venues seeded`);

  console.log("\nDone!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
