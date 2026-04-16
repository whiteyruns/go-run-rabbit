import type { ArtistProfile } from "./types";

export const marshmello: ArtistProfile = {
  id: "marshmello",
  stageName: "Marshmello",
  realName: "Christopher Comstock",
  born: "May 19, 1992 · Philadelphia, PA",
  nationality: "American",
  genres: ["Electronic Dance Music", "Future Bass", "Trap", "Festival Trap", "Dubstep"],
  yearsActive: "2015–present",
  signature: "Custom white marshmallow-shaped helmet worn at every public appearance",
  bio: `Marshmello — Christopher Comstock — is one of the most commercially successful electronic artists of the last decade. Known for his signature white marshmallow helmet, he built a global audience through chart-topping crossover hits with Khalid, Selena Gomez, Bastille, Anne-Marie, and the Jonas Brothers. His Fortnite in-game concert remains one of the largest virtual live events ever staged. He headlines the world's biggest festivals year-round and lands consistently in the top tier of streaming, touring, and brand-partnership economics in electronic music.`,

  // Social / platform reach. Snapshots as of 2026-Q1 public data.
  reach: [
    { platform: "YouTube", metric: "58.4M", label: "subscribers" },
    { platform: "YouTube", metric: "17.6B", label: "total views" },
    { platform: "Spotify", metric: "Top-tier", label: "dance/electronic artist" },
    { platform: "Global fanbase", metric: "Billions", label: "of streams across catalog" },
  ],

  // Selected charting tracks (not exhaustive).
  hits: [
    { title: "Happier", feature: "Bastille", peak: "#2 Billboard Hot 100" },
    { title: "Silence", feature: "Khalid" },
    { title: "Wolves", feature: "Selena Gomez" },
    { title: "Friends", feature: "Anne-Marie" },
    { title: "Alone", peak: "#28 Billboard Hot 100" },
    { title: "Slow Motion", feature: "Jonas Brothers", released: "January 2025" },
  ],

  albums: [
    { title: "Joytime", year: 2016 },
    { title: "Joytime II", year: 2018 },
    { title: "Joytime III", year: 2019 },
    { title: "Shockwave", year: 2021, note: "Grammy nominated · Best Dance/Electronic Album" },
    { title: "Sugar Papi", year: 2023 },
  ],

  collaborations: [
    "Khalid",
    "Selena Gomez",
    "Bastille",
    "Anne-Marie",
    "Juice WRLD",
    "Logic",
    "Jonas Brothers",
    "Halsey",
    "CHVRCHES",
    "BTS",
  ],

  milestones: [
    "Fortnite in-game concert — one of the largest virtual live events in history",
    "2021 UEFA Champions League Final opening ceremony headliner",
    "MTV EMA Best Electronic (2018)",
    "Grammy nomination — Best Dance/Electronic Album (Shockwave, 2022)",
    "Multiple iHeartRadio Music Award wins",
    "Launched pop-punk band Underbrook as lead vocalist (2024)",
  ],

  // Example social outreach around the FTB activation — swap placeholders
  // for actual URLs/screenshots once the social team delivers assets.
  outreachExamples: [
    {
      platform: "Instagram",
      handle: "@marshmellomusic",
      note: "Event announcement reshared by official channels (placeholder — assets from social team pending)",
    },
    {
      platform: "TikTok",
      handle: "@marshmellomusic",
      note: "Show clips and set highlights (placeholder — assets pending)",
    },
  ],
};
