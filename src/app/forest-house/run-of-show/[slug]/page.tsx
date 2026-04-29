import { notFound } from "next/navigation";
import { isFhRosFromCookies } from "@/lib/forest-house/fh-auth";
import { readRunOfShow } from "@/lib/forest-house/run-of-show-storage";
import {
  EVENT_CREW_PREDICATES,
  isKnownEventSlug,
} from "@/lib/forest-house/run-of-show-seed";
import { readAllCrew } from "@/lib/forest-house/storage";
import RunOfShow from "../../components/RunOfShow";
import RosGateForm from "../../components/RosGateForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Run of Show — ForestHouse",
  robots: { index: false, follow: false },
};

export default async function PublicRunOfShow({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!isKnownEventSlug(slug)) notFound();

  if (!(await isFhRosFromCookies())) {
    return <RosGateForm slug={slug} />;
  }

  const [data, allCrew] = await Promise.all([
    readRunOfShow(slug),
    readAllCrew(),
  ]);
  const predicate = EVENT_CREW_PREDICATES[slug];
  const registeredCrew = allCrew
    .filter(predicate)
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <RunOfShow
      data={data}
      slug={slug}
      registeredCrew={registeredCrew}
      publicView
    />
  );
}
