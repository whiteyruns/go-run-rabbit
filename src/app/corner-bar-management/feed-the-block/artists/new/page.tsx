import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { ArtistForm } from "../ArtistForm";

export default async function NewArtistPage() {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/login");

  return (
    <div className="max-w-5xl mx-auto px-8 py-10">
      <Link
        href="/corner-bar-management/feed-the-block/artists"
        className="text-xs opacity-60 hover:opacity-100"
      >
        &larr; Artist Library
      </Link>
      <h1 className="text-3xl font-bold mt-4 mb-8">New Artist</h1>
      <ArtistForm />
    </div>
  );
}
