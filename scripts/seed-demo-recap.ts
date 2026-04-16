/**
 * Seeds a "demo-marshmello" recap with sample recipients so the screenshot
 * automation has something realistic to capture. Run with:
 *   npx tsx scripts/seed-demo-recap.ts seed
 *   npx tsx scripts/seed-demo-recap.ts cleanup
 */
import { PrismaClient } from "@prisma/client";
import { marshmello } from "../src/data/feed-the-block/artists/marshmello";
import { marshmelloApr2 } from "../src/data/feed-the-block/marshmello-apr2";
import { MARSHMELLO_PHOTOS } from "../src/data/feed-the-block/recap/photos-marshmello";
import { getSponsorsForEvent } from "../src/data/feed-the-block/recap/event-sponsors";

const prisma = new PrismaClient();
const DEMO_EVENT_ID = "demo-marshmello";
const DEMO_ARTIST_NAME = "Marshmello (Demo)";

async function seed() {
  await cleanup();

  const artist = await prisma.artist.create({
    data: {
      stageName: DEMO_ARTIST_NAME,
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

  const recap = await prisma.ftbRecap.create({
    data: {
      eventId: DEMO_EVENT_ID,
      headliner: marshmelloApr2.headliner,
      eventDate: marshmelloApr2.eventDate,
      eventDay: marshmelloApr2.eventDay,
      status: "published",
      publishedAt: new Date(),
      artistId: artist.id,
      placerData: JSON.stringify(marshmelloApr2.data),
      coverage: JSON.stringify(marshmelloApr2.coverage),
      photos: JSON.stringify({
        hero: MARSHMELLO_PHOTOS.hero,
        polaroid: MARSHMELLO_PHOTOS.polaroid,
        portrait: MARSHMELLO_PHOTOS.portrait,
        gallery: MARSHMELLO_PHOTOS.gallery,
      }),
      sponsors: JSON.stringify(getSponsorsForEvent("marshmello-apr2-2026")),
    },
  });

  // Sample recipients with mixed delivery/open state
  const now = new Date();
  const earlier = (mins: number) => new Date(now.getTime() - mins * 60_000);
  await prisma.ftbRecapRecipient.createMany({
    data: [
      {
        recapId: recap.id,
        email: "steve.hill@lvcva.com",
        name: "Steve Hill",
        group: "LVCVA",
        sentAt: earlier(120),
        deliveredAt: earlier(119),
        openedAt: earlier(95),
      },
      {
        recapId: recap.id,
        email: "kerry.bubolz@cityoflasvegas.com",
        name: "Kerry Bubolz",
        group: "City",
        sentAt: earlier(120),
        deliveredAt: earlier(119),
        openedAt: earlier(60),
      },
      {
        recapId: recap.id,
        email: "alan.feldman@diageo.com",
        name: "Alan Feldman",
        group: "Diageo",
        sentAt: earlier(120),
        deliveredAt: earlier(118),
        openedAt: null,
      },
      {
        recapId: recap.id,
        email: "press@vegasreview.com",
        name: "John Katsilometes",
        group: "Media",
        sentAt: earlier(120),
        deliveredAt: earlier(119),
        openedAt: earlier(80),
      },
    ],
  });

  // Saved group
  await prisma.ftbRecipientGroup.upsert({
    where: { name: "Founding Sponsors" },
    create: {
      name: "Founding Sponsors",
      emails: JSON.stringify([
        { email: "steve.hill@lvcva.com", name: "Steve Hill" },
        { email: "kerry.bubolz@cityoflasvegas.com", name: "Kerry Bubolz" },
        { email: "alan.feldman@diageo.com", name: "Alan Feldman" },
      ]),
    },
    update: {},
  });

  console.log(`Seeded ${DEMO_EVENT_ID} (recap ${recap.id})`);
}

async function cleanup() {
  await prisma.ftbRecap.deleteMany({ where: { eventId: DEMO_EVENT_ID } });
  await prisma.artist.deleteMany({ where: { stageName: DEMO_ARTIST_NAME } });
  await prisma.ftbRecipientGroup.deleteMany({
    where: { name: "Founding Sponsors" },
  });
  console.log("Cleaned up demo data.");
}

const cmd = process.argv[2];
if (cmd === "seed") seed().finally(() => prisma.$disconnect());
else if (cmd === "cleanup") cleanup().finally(() => prisma.$disconnect());
else {
  console.log("Usage: tsx scripts/seed-demo-recap.ts [seed|cleanup]");
  process.exit(1);
}
