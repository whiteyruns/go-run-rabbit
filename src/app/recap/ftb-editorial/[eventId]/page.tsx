import { notFound } from "next/navigation";
import { loadRecap } from "@/data/feed-the-block/recap/bundle";
import { getSession } from "@/lib/auth";
import { EditorialClient } from "./EditorialClient";

export const dynamic = "force-dynamic";

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
