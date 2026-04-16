import { prisma } from "@/lib/db";
import { findEvent } from "../events";
import { getArtistForEvent } from "../artists";
import { getSponsorsForEvent, type EventSponsor } from "./event-sponsors";
import { MARSHMELLO_PHOTOS } from "./photos-marshmello";
import type { PlacerEventDataset, DataCoverage } from "../types";
import type { ArtistProfile } from "../artists/types";
import type { TicketsAggregate } from "@/lib/tickets-aggregator";

export interface RecapPhoto {
  slug: string;
  alt: string;
  credit: string;
  caption?: string;
}

export interface RecapPhotos {
  hero?: RecapPhoto;
  polaroid?: RecapPhoto;
  portrait?: RecapPhoto;
  gallery: RecapPhoto[];
}

export interface RecapBundle {
  source: "db" | "code";
  status: "draft" | "published";
  eventId: string;
  photoPathKey: string; // subdir under /public/feed-the-block/img/
  headliner: string;
  eventDate: string;
  eventDay: string;
  data: PlacerEventDataset;
  coverage: DataCoverage;
  artist: ArtistProfile | null;
  sponsors: EventSponsor[];
  photos: RecapPhotos;
  tickets: TicketsAggregate | null;
}

export const photoUrl = (
  pathKey: string,
  slug: string,
  size: 640 | 1280 | 1920,
): string => `/feed-the-block/img/${pathKey}/${slug}-${size}.jpg`;

/**
 * Tries DB first, then falls back to code registry for the three
 * legacy events (marshmello-apr2-2026, diplo-oct27-2025, major-lazer-sep12-2025).
 */
export async function loadRecap(eventId: string): Promise<RecapBundle | null> {
  const dbRow = await prisma.ftbRecap.findUnique({
    where: { eventId },
    include: { artist: true },
  });

  if (dbRow) {
    const artistJson: ArtistProfile | null = dbRow.artist
      ? {
          id: dbRow.artist.id,
          stageName: dbRow.artist.stageName,
          realName: dbRow.artist.realName,
          born: dbRow.artist.born,
          nationality: dbRow.artist.nationality,
          genres: JSON.parse(dbRow.artist.genres),
          yearsActive: dbRow.artist.yearsActive,
          signature: dbRow.artist.signature,
          bio: dbRow.artist.bio,
          reach: JSON.parse(dbRow.artist.reach),
          hits: JSON.parse(dbRow.artist.hits),
          albums: JSON.parse(dbRow.artist.albums),
          collaborations: JSON.parse(dbRow.artist.collaborations),
          milestones: JSON.parse(dbRow.artist.milestones),
          outreachExamples: JSON.parse(dbRow.artist.outreachExamples),
        }
      : null;

    return {
      source: "db",
      status: dbRow.status === "published" ? "published" : "draft",
      eventId: dbRow.eventId,
      photoPathKey: dbRow.eventId,
      headliner: dbRow.headliner,
      eventDate: dbRow.eventDate,
      eventDay: dbRow.eventDay,
      data: JSON.parse(dbRow.placerData),
      coverage: JSON.parse(dbRow.coverage),
      artist: artistJson,
      sponsors: JSON.parse(dbRow.sponsors),
      photos: JSON.parse(dbRow.photos),
      tickets: dbRow.tickets ? JSON.parse(dbRow.tickets) : null,
    };
  }

  const event = findEvent(eventId);
  if (!event) return null;

  const photos: RecapPhotos =
    eventId === "marshmello-apr2-2026"
      ? {
          hero: MARSHMELLO_PHOTOS.hero,
          polaroid: MARSHMELLO_PHOTOS.polaroid,
          portrait: MARSHMELLO_PHOTOS.portrait,
          gallery: MARSHMELLO_PHOTOS.gallery,
        }
      : { gallery: [] };

  const photoPathKey = eventId === "marshmello-apr2-2026" ? "marshmello" : eventId;

  return {
    source: "code",
    status: "published",
    eventId,
    photoPathKey,
    headliner: event.headliner,
    eventDate: event.eventDate,
    eventDay: event.eventDay,
    data: event.data,
    coverage: event.coverage,
    artist: getArtistForEvent(eventId) ?? null,
    sponsors: getSponsorsForEvent(eventId),
    photos,
    tickets: null,
  };
}
