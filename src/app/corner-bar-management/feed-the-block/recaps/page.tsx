import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { EVENTS } from "@/data/feed-the-block/events";

export const dynamic = "force-dynamic";

export default async function RecapsListPage() {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/login");

  const dbRecaps = await prisma.ftbRecap.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      artist: { select: { stageName: true } },
      _count: { select: { recipients: true } },
    },
  });

  const dbIds = new Set(dbRecaps.map((r) => r.eventId));
  const codeRecaps = EVENTS.filter((e) => !dbIds.has(e.id));

  return (
    <div className="max-w-5xl mx-auto px-8 py-10">
      <Link
        href="/corner-bar-management/feed-the-block"
        className="text-xs opacity-60 hover:opacity-100"
      >
        &larr; Feed The Block
      </Link>
      <div className="flex items-center justify-between mt-4 mb-8">
        <h1 className="text-3xl font-bold">Recaps</h1>
        <div className="flex gap-3">
          <Link
            href="/corner-bar-management/feed-the-block/artists"
            className="px-4 py-2 border border-[#aea2ff] text-[#aea2ff] text-xs uppercase tracking-widest font-semibold hover:bg-[#aea2ff] hover:text-[#1f0078]"
          >
            Artists
          </Link>
          <Link
            href="/corner-bar-management/feed-the-block/recaps/new"
            className="px-4 py-2 bg-[#aea2ff] text-[#1f0078] text-xs uppercase tracking-widest font-semibold hover:opacity-85"
          >
            + New Recap
          </Link>
        </div>
      </div>

      <section>
        <h2 className="text-[10px] uppercase tracking-widest opacity-60 mb-3">
          Managed Recaps
        </h2>
        {dbRecaps.length === 0 ? (
          <div className="border border-[rgba(174,162,255,0.12)] px-6 py-12 text-center opacity-60 mb-10">
            No managed recaps yet. Create one to get started.
          </div>
        ) : (
          <div className="border border-[rgba(174,162,255,0.12)] mb-10">
            {dbRecaps.map((r, i) => (
              <div
                key={r.id}
                className={`flex items-center justify-between px-6 py-4 ${
                  i > 0 ? "border-t border-[rgba(174,162,255,0.08)]" : ""
                }`}
              >
                <Link
                  href={`/corner-bar-management/feed-the-block/recaps/${r.eventId}/edit`}
                  className="flex-1 hover:opacity-80"
                >
                  <div className="font-semibold text-lg">
                    {r.headliner}{" "}
                    <span className="text-xs opacity-40 font-normal">·</span>{" "}
                    <span className="text-xs opacity-60 font-normal">
                      {r.eventDate}
                    </span>
                  </div>
                  <div className="text-xs opacity-60 mt-1">
                    {r.artist?.stageName ?? "no artist"} · {r._count.recipients} sent ·{" "}
                    <span
                      className={
                        r.status === "published"
                          ? "text-[#00eefc]"
                          : "text-[#c9912b]"
                      }
                    >
                      {r.status}
                    </span>
                  </div>
                </Link>
                <div className="flex gap-3 items-center">
                  {r.status === "published" && (
                    <a
                      href={`/recap/ftb-editorial/${r.eventId}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] uppercase tracking-widest text-[#00eefc] hover:underline"
                    >
                      View
                    </a>
                  )}
                  <Link
                    href={`/corner-bar-management/feed-the-block/recaps/${r.eventId}/send`}
                    className="text-[10px] uppercase tracking-widest text-[#aea2ff] hover:underline"
                  >
                    Send
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {codeRecaps.length > 0 && (
        <section>
          <h2 className="text-[10px] uppercase tracking-widest opacity-60 mb-3">
            Legacy Recaps (code-owned)
          </h2>
          <div className="border border-[rgba(174,162,255,0.12)]">
            {codeRecaps.map((e, i) => (
              <div
                key={e.id}
                className={`flex items-center justify-between px-6 py-4 ${
                  i > 0 ? "border-t border-[rgba(174,162,255,0.08)]" : ""
                }`}
              >
                <div>
                  <div className="font-semibold text-lg">
                    {e.headliner}{" "}
                    <span className="text-xs opacity-40 font-normal">·</span>{" "}
                    <span className="text-xs opacity-60 font-normal">
                      {e.eventDate}
                    </span>
                  </div>
                  <div className="text-xs opacity-40 mt-1">Code-owned · read only</div>
                </div>
                <a
                  href={`/recap/ftb-editorial/${e.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] uppercase tracking-widest text-[#00eefc] hover:underline"
                >
                  View
                </a>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
