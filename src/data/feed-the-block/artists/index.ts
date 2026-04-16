import { marshmello } from "./marshmello";
import type { ArtistProfile } from "./types";

export type { ArtistProfile } from "./types";

// Keyed by eventId — see src/data/feed-the-block/events.ts for ids.
const ARTIST_BY_EVENT: Record<string, ArtistProfile> = {
  "marshmello-apr2-2026": marshmello,
};

export const getArtistForEvent = (eventId: string): ArtistProfile | undefined =>
  ARTIST_BY_EVENT[eventId];
