/**
 * One-shot migration: convert the code-owned Marshmello recap into a
 * DB-backed FtbRecap so it can carry tickets data and be edited from
 * the admin UI.
 *
 * Usage (run on Mac Mini against production DB):
 *   npx tsx scripts/migrate-marshmello-to-db.ts /path/to/orders.csv
 *
 * Idempotent — safe to re-run; updates in place.
 */
import { PrismaClient } from "@prisma/client";
import { readFileSync } from "node:fs";
import { marshmello } from "../src/data/feed-the-block/artists/marshmello";
import { marshmelloApr2 } from "../src/data/feed-the-block/marshmello-apr2";
import { MARSHMELLO_PHOTOS } from "../src/data/feed-the-block/recap/photos-marshmello";
import { getSponsorsForEvent } from "../src/data/feed-the-block/recap/event-sponsors";
import { aggregateTicketsCSV } from "../src/lib/tickets-aggregator";

const prisma = new PrismaClient();
const EVENT_ID = "marshmello-apr2-2026";

async function main() {
  const csvPath = process.argv[2];
  if (!csvPath) {
    console.error("Usage: tsx scripts/migrate-marshmello-to-db.ts <orders.csv>");
    process.exit(1);
  }

  // 1. Upsert artist
  const artist = await prisma.artist.upsert({
    where: { stageName: marshmello.stageName },
    update: {
      realName: marshmello.realName,
      born: marshmello.born,
      nationality: marshmello.nationality,
      yearsActive: marshmello.yearsActive,
      signature: marshmello.signature,
      bio: marshmello.bio,
      genres: JSON.stringify(marshmello.genres),
      hits: JSON.stringify(marshmello.hits),
      albums: JSON.stringify(marshmello.albums),
      collaborations: JSON.stringify(marshmello.collaborations),
      milestones: JSON.stringify(marshmello.milestones),
      reach: JSON.stringify(marshmello.reach),
      outreachExamples: JSON.stringify(marshmello.outreachExamples),
    },
    create: {
      stageName: marshmello.stageName,
      realName: marshmello.realName,
      born: marshmello.born,
      nationality: marshmello.nationality,
      yearsActive: marshmello.yearsActive,
      signature: marshmello.signature,
      bio: marshmello.bio,
      genres: JSON.stringify(marshmello.genres),
      hits: JSON.stringify(marshmello.hits),
      albums: JSON.stringify(marshmello.albums),
      collaborations: JSON.stringify(marshmello.collaborations),
      milestones: JSON.stringify(marshmello.milestones),
      reach: JSON.stringify(marshmello.reach),
      outreachExamples: JSON.stringify(marshmello.outreachExamples),
    },
  });
  console.log("✓ Artist:", artist.stageName, `(${artist.id})`);

  // 2. Aggregate tickets CSV
  const csvText = readFileSync(csvPath, "utf-8");
  const tickets = aggregateTicketsCSV(csvText);
  if (tickets.totalOrders === 0) {
    throw new Error("CSV produced 0 rows — check the file.");
  }
  console.log(
    `✓ Aggregated ${tickets.totalOrders.toLocaleString()} orders, ${tickets.geographic.zipsAnalyzed.toLocaleString()} valid ZIPs`,
  );

  // 3. Upsert recap (published)
  const photos = {
    hero: MARSHMELLO_PHOTOS.hero,
    polaroid: MARSHMELLO_PHOTOS.polaroid,
    portrait: MARSHMELLO_PHOTOS.portrait,
    gallery: MARSHMELLO_PHOTOS.gallery,
  };
  const sponsors = getSponsorsForEvent(EVENT_ID);

  const recap = await prisma.ftbRecap.upsert({
    where: { eventId: EVENT_ID },
    update: {
      headliner: marshmelloApr2.headliner,
      eventDate: marshmelloApr2.eventDate,
      eventDay: marshmelloApr2.eventDay,
      status: "published",
      publishedAt: new Date(),
      artistId: artist.id,
      placerData: JSON.stringify(marshmelloApr2.data),
      coverage: JSON.stringify(marshmelloApr2.coverage),
      photos: JSON.stringify(photos),
      sponsors: JSON.stringify(sponsors),
      tickets: JSON.stringify(tickets),
    },
    create: {
      eventId: EVENT_ID,
      headliner: marshmelloApr2.headliner,
      eventDate: marshmelloApr2.eventDate,
      eventDay: marshmelloApr2.eventDay,
      status: "published",
      publishedAt: new Date(),
      artistId: artist.id,
      placerData: JSON.stringify(marshmelloApr2.data),
      coverage: JSON.stringify(marshmelloApr2.coverage),
      photos: JSON.stringify(photos),
      sponsors: JSON.stringify(sponsors),
      tickets: JSON.stringify(tickets),
    },
  });
  console.log(`✓ Recap ${recap.eventId} (${recap.status})`);

  // Photos for this event live at /feed-the-block/img/marshmello/, but the
  // DB-backed recap looks for /feed-the-block/img/<eventId>/. Caller must
  // create the symlink:
  //   ln -sf marshmello public/feed-the-block/img/marshmello-apr2-2026
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
