import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { EVENTS } from "@/data/feed-the-block/events";
import { getSponsorsForEvent } from "@/data/feed-the-block/recap/event-sponsors";
import { RecapForm, type RecapFormValues } from "../../RecapForm";
import { PhotoManager } from "../../PhotoManager";

export const dynamic = "force-dynamic";

export default async function EditRecapPage({
  params,
}: {
  params: { eventId: string };
}) {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/login");

  const recap = await prisma.ftbRecap.findUnique({
    where: { eventId: params.eventId },
  });
  if (!recap) notFound();

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

  const initial: Partial<RecapFormValues> = {
    eventId: recap.eventId,
    status: recap.status === "published" ? "published" : "draft",
    headliner: recap.headliner,
    eventDate: recap.eventDate,
    eventDay: recap.eventDay,
    artistId: recap.artistId,
    placerDataText: JSON.stringify(JSON.parse(recap.placerData), null, 2),
    coverage: JSON.parse(recap.coverage),
    photos: JSON.parse(recap.photos),
    sponsors: JSON.parse(recap.sponsors),
  };

  return (
    <div className="max-w-5xl mx-auto px-8 py-10">
      <Link
        href="/corner-bar-management/feed-the-block/recaps"
        className="text-xs opacity-60 hover:opacity-100"
      >
        &larr; Recaps
      </Link>
      <div className="flex items-center justify-between mt-4 mb-8">
        <h1 className="text-3xl font-bold">
          {recap.headliner}{" "}
          <span className="text-sm opacity-50 font-normal">· {recap.eventDate}</span>
        </h1>
        <span
          className={`text-[10px] uppercase tracking-widest px-3 py-1 ${
            recap.status === "published"
              ? "bg-[#00eefc] text-[#0e0e11]"
              : "bg-[#c9912b] text-[#0e0e11]"
          }`}
        >
          {recap.status}
        </span>
      </div>
      <RecapForm
        initial={initial}
        artists={artists}
        cloneTemplates={cloneTemplates}
        isNew={false}
      />

      <div className="mt-16 pt-10 border-t border-[rgba(174,162,255,0.12)]">
        <h2 className="text-xl font-bold mb-6">Photos</h2>
        <PhotoManager
          eventId={recap.eventId}
          initial={JSON.parse(recap.photos)}
        />
      </div>
    </div>
  );
}
