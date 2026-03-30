import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/dashboard", "/client", "/api"] },
    sitemap: "https://gorunrabbit.com/sitemap.xml",
  };
}
