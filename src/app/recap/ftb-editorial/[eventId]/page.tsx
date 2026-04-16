import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { loadRecap, photoUrl } from "@/data/feed-the-block/recap/bundle";
import { getSession } from "@/lib/auth";
import { fmt, fmtNum } from "@/lib/utils";
import { estimatedImpact } from "@/data/feed-the-block/series";
import { EditorialClient } from "./EditorialClient";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { eventId: string };
}): Promise<Metadata> {
  const bundle = await loadRecap(params.eventId);
  if (!bundle) return { title: "Feed The Block — Recap" };

  const parseIntSafe = (s?: string) =>
    s ? parseInt(s.replace(/[^\d-]/g, ""), 10) || 0 : 0;
  const visits = parseIntSafe(
    bundle.data.metrics.find((m) => m.metricName === "Total Visits")?.metricValue,
  );
  const yoy =
    bundle.data.metrics.find((m) => m.metricName === "Visits YoY")?.metricValue ??
    "—";
  const hotelCrossover = bundle.data.hotels.reduce((s, h) => s + h.visitors, 0);
  const impact = estimatedImpact(hotelCrossover);

  const title = `${bundle.headliner} at Feed The Block — Post-Event Recap`;
  const description =
    visits > 0
      ? `${fmtNum(visits)} visitors · ${yoy} YoY · ${fmt(impact)} direct economic impact · Placer.ai measured`
      : `Post-event recap for ${bundle.headliner} on ${bundle.eventDate}`;

  const ogImage =
    bundle.photos.hero
      ? photoUrl(bundle.photoPathKey, bundle.photos.hero.slug, 1920)
      : "/feed-the-block/logo.png";

  return {
    title,
    description,
    robots: { index: false, follow: false },
    openGraph: {
      title,
      description,
      type: "article",
      images: [{ url: ogImage, width: 1920, height: 1280, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function EditorialRecapPage({
  params,
}: {
  params: { eventId: string };
}) {
  const bundle = await loadRecap(params.eventId);
  if (!bundle) notFound();

  // Drafts require an admin session; no public code-gate access.
  let previewAuthed = false;
  if (bundle.status === "draft") {
    const session = await getSession();
    if (!session || session.role !== "admin") notFound();
    previewAuthed = true;
  }

  return <EditorialClient bundle={bundle} previewAuthed={previewAuthed} />;
}
