import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function ArtistsListPage() {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/login");

  const artists = await prisma.artist.findMany({
    orderBy: { stageName: "asc" },
    include: { _count: { select: { recaps: true } } },
  });

  return (
    <div className="max-w-5xl mx-auto px-8 py-10">
      <div className="flex items-center justify-between mb-2">
        <Link
          href="/corner-bar-management/feed-the-block"
          className="text-xs opacity-60 hover:opacity-100"
        >
          &larr; Feed The Block
        </Link>
      </div>
      <div className="flex items-center justify-between mb-8 mt-4">
        <h1 className="text-3xl font-bold">Artist Library</h1>
        <Link
          href="/corner-bar-management/feed-the-block/artists/new"
          className="px-4 py-2 bg-[#aea2ff] text-[#1f0078] text-xs uppercase tracking-widest font-semibold hover:opacity-85"
        >
          + New Artist
        </Link>
      </div>

      {artists.length === 0 ? (
        <div className="border border-[rgba(174,162,255,0.12)] px-6 py-12 text-center opacity-60">
          No artists yet. Add the first one to reuse across recaps.
        </div>
      ) : (
        <div className="border border-[rgba(174,162,255,0.12)]">
          {artists.map((a, i) => (
            <Link
              key={a.id}
              href={`/corner-bar-management/feed-the-block/artists/${a.id}/edit`}
              className={`flex items-center justify-between px-6 py-4 hover:bg-[rgba(174,162,255,0.04)] ${
                i > 0 ? "border-t border-[rgba(174,162,255,0.08)]" : ""
              }`}
            >
              <div>
                <div className="font-semibold text-lg">{a.stageName}</div>
                <div className="text-xs opacity-60">
                  {a.realName} · {a.nationality} · {a.yearsActive}
                </div>
              </div>
              <div className="text-[10px] uppercase tracking-widest opacity-50">
                {a._count.recaps} recap{a._count.recaps === 1 ? "" : "s"}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
