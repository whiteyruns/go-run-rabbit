import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { SendClient } from "./SendClient";

export const dynamic = "force-dynamic";

export default async function SendRecapPage({
  params,
}: {
  params: { eventId: string };
}) {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/login");

  const recap = await prisma.ftbRecap.findUnique({
    where: { eventId: params.eventId },
    include: {
      recipients: { orderBy: { sentAt: "desc" } },
    },
  });
  if (!recap) notFound();

  const groups = await prisma.ftbRecipientGroup.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="max-w-5xl mx-auto px-8 py-10">
      <Link
        href="/corner-bar-management/feed-the-block/recaps"
        className="text-xs opacity-60 hover:opacity-100"
      >
        &larr; Recaps
      </Link>
      <h1 className="text-3xl font-bold mt-4">
        Send{" "}
        <span className="opacity-50 font-normal">·</span>{" "}
        <span className="opacity-80">{recap.headliner}</span>
      </h1>
      <p className="text-xs opacity-60 mt-1">
        {recap.eventDate} ·{" "}
        <span
          className={
            recap.status === "published"
              ? "text-[#00eefc]"
              : "text-[#c9912b]"
          }
        >
          {recap.status}
        </span>
      </p>

      {recap.status !== "published" && (
        <div className="mt-6 bg-[rgba(201,145,43,0.1)] border border-[#c9912b] px-4 py-3 text-sm">
          Recap is in draft. Publish it before sending.
        </div>
      )}

      <SendClient
        eventId={recap.eventId}
        canSend={recap.status === "published"}
        groups={groups.map((g) => ({
          id: g.id,
          name: g.name,
          emails: JSON.parse(g.emails),
        }))}
        history={recap.recipients.map((r) => ({
          id: r.id,
          email: r.email,
          name: r.name,
          group: r.group,
          sentAt: r.sentAt?.toISOString() ?? null,
          deliveredAt: r.deliveredAt?.toISOString() ?? null,
          openedAt: r.openedAt?.toISOString() ?? null,
        }))}
      />
    </div>
  );
}
