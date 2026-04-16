import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ArtistForm, type ArtistFormValues } from "../../ArtistForm";

export default async function EditArtistPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/login");

  const artist = await prisma.artist.findUnique({ where: { id: params.id } });
  if (!artist) notFound();

  const initial: ArtistFormValues = {
    id: artist.id,
    stageName: artist.stageName,
    realName: artist.realName,
    born: artist.born,
    nationality: artist.nationality,
    yearsActive: artist.yearsActive,
    signature: artist.signature,
    bio: artist.bio,
    genres: JSON.parse(artist.genres),
    hits: JSON.parse(artist.hits),
    milestones: JSON.parse(artist.milestones),
    reach: JSON.parse(artist.reach),
  };

  return (
    <div className="max-w-5xl mx-auto px-8 py-10">
      <Link
        href="/corner-bar-management/feed-the-block/artists"
        className="text-xs opacity-60 hover:opacity-100"
      >
        &larr; Artist Library
      </Link>
      <h1 className="text-3xl font-bold mt-4 mb-8">{artist.stageName}</h1>
      <ArtistForm initial={initial} />
    </div>
  );
}
