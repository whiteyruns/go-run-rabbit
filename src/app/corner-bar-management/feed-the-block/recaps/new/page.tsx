import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { EVENTS } from "@/data/feed-the-block/events";
import { getSponsorsForEvent } from "@/data/feed-the-block/recap/event-sponsors";
import { RecapForm } from "../RecapForm";

export const dynamic = "force-dynamic";

export default async function NewRecapPage() {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/login");

  const artists = await prisma.artist.findMany({
    select: { id: true, stageName: true },
    orderBy: { stageName: "asc" },
  });

  const cloneTemplates = EVENTS.map((e) => ({
    id: e.id,
    label: `${e.headliner} · ${e.eventDate}`,
    placerData: e.data,
    coverage: e.coverage,
    sponsors: getSponsorsForEvent(e.id),
  }));

  return (
    <div className="max-w-5xl mx-auto px-8 py-10">
      <Link
        href="/corner-bar-management/feed-the-block/recaps"
        className="text-xs opacity-60 hover:opacity-100"
      >
        &larr; Recaps
      </Link>
      <h1 className="text-3xl font-bold mt-4 mb-8">New Recap</h1>
      <RecapForm artists={artists} cloneTemplates={cloneTemplates} isNew />
    </div>
  );
}
