/**
 * Barrel-file re-exporting all CBM data constants and their types.
 */

export { venues } from "./venues";
export type { Venue } from "./venues";

export { sponsorshipCategories } from "./categories";
export type { SponsorshipCategory, SponsorshipStatus } from "./categories";

export { feedTheBlock } from "./feed-the-block";
export type { FeedTheBlock, ConfirmedSponsor, SponsorshipTier } from "./feed-the-block";

export { guestJourneys, crossVenueStats } from "./guest-journeys";
export type { GuestJourney, JourneyTouchpoint, CrossVenueStats } from "./guest-journeys";

export { vegasTentpoles } from "./tentpoles";
export type { VegasTentpole, TentpoleTier } from "./tentpoles";

export { salesRoadmap } from "./sales-roadmap";
export type { SalesRoadmap, RoadmapPhase, RoadmapItem } from "./sales-roadmap";

export { venueProfiles } from "./venue-profiles";
export type { VenueProfile, DrinkMix, SpiritMix } from "./venue-profiles";

export { DRINK_CATALOG, SPIRIT_CATEGORIES, MENU_GROUPS } from "./drink-catalog";
export type { DrinkItem, SpiritCategory, MenuGroup } from "./drink-catalog";
