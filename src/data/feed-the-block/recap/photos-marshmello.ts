export interface Photo {
  slug: string;
  alt: string;
  credit: string;
  caption?: string;
}

export const photoUrl = (slug: string, size: 640 | 1280 | 1920): string =>
  `/feed-the-block/img/marshmello/${slug}-${size}.jpg`;

export const MARSHMELLO_PHOTOS = {
  // Full-bleed hero for "The Event" section — maximum scale
  hero: {
    slug: "packed-streets-hudson",
    alt: "Packed streets during Marshmello's Feed The Block set",
    credit: "Jesse Hudson",
    caption: "Fremont East at capacity during the Marshmello set · April 2, 2026",
  },
  // Iconic polaroid — Marshmello atop the Forest House Art Car
  polaroid: {
    slug: "forest-house-hudson",
    alt: "Marshmello on the Forest House Art Car at Feed The Block",
    credit: "Jesse Hudson",
    caption: "Atop the Forest House Art Car.",
  },
  // Portrait of the headliner
  portrait: {
    slug: "marshmello-portrait-greer",
    alt: "Marshmello at Feed The Block",
    credit: "Mike Greer",
    caption: "Marshmello · Fremont East · April 2, 2026",
  },
  // Supporting shots for gallery strips
  gallery: [
    {
      slug: "packed-crowd-greer-1",
      alt: "Marshmello plays to a packed crowd at Feed The Block",
      credit: "Mike Greer",
    },
    {
      slug: "packed-crowd-greer-2",
      alt: "Marshmello plays to a packed crowd during Feed The Block",
      credit: "Mike Greer",
    },
    {
      slug: "crowd-view-hudson",
      alt: "Crowd view during Marshmello at Feed The Block",
      credit: "Jesse Hudson",
    },
  ] as Photo[],
};
