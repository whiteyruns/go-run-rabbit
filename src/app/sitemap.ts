import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://gorunrabbit.com", lastModified: new Date(), changeFrequency: "monthly", priority: 1 },
    { url: "https://gorunrabbit.com/login", lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: "https://gorunrabbit.com/venue/commonwealth", lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: "https://gorunrabbit.com/venue/laundry-room", lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: "https://gorunrabbit.com/venue/we-all-scream", lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: "https://gorunrabbit.com/venue/discopussy", lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: "https://gorunrabbit.com/venue/lucky-day", lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: "https://gorunrabbit.com/venue/park-on-fremont", lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: "https://gorunrabbit.com/venue/cheapshot", lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: "https://gorunrabbit.com/venue/la-mona-rosa", lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: "https://gorunrabbit.com/venue/doberman", lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
  ];
}
