import type { Metadata } from "next";
import { getFeaturedEvent } from "@/components/oddyssey/featured-events";

// Dynamic per-event OG metadata. The Pride flyer becomes the share
// preview image so /events/pride-jun-05 etc. surface as designed when
// the link drops on IG, SMS, or iMessage. Title is `absolute` to keep
// the root "%s | Go Run Rabbit" template out of event share previews.

interface Props {
  params: { slug: string };
}

export function generateMetadata({ params }: Props): Metadata {
  const event = getFeaturedEvent(params.slug);
  if (!event) {
    return {
      title: { absolute: "Event Not Found — Oddyssey" },
      icons: { icon: [{ url: "/oddyssey-manor/events/icon.svg", type: "image/svg+xml", sizes: "any" }] },
    };
  }
  const title = `${event.title} — Oddyssey ${event.venue} · ${event.date}`;
  const description = `${event.tagline} ${event.blurb}`.trim();
  const ogImage = event.poster ?? "/oddyssey/manor.webp";
  // Events currently all run at Noir → purple mark. Manor events
  // would override per-event when added.
  const iconUrl = "/oddyssey-manor/events/icon.svg";
  return {
    title: { absolute: title },
    description,
    icons: { icon: [{ url: iconUrl, type: "image/svg+xml", sizes: "any" }] },
    openGraph: {
      title,
      description: event.tagline,
      type: "article",
      siteName: "Oddyssey",
      images: [{ url: ogImage, alt: `${event.title} flyer` }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: event.tagline,
      images: [ogImage],
    },
  };
}

export default function EventLayout({ children }: { children: React.ReactNode }) {
  return children;
}
