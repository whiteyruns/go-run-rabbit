import { redirect } from "next/navigation";
import { isFhAdminFromCookies } from "@/lib/forest-house/fh-auth";
import RunOfShowClient from "../../../components/RunOfShowClient";
import { readRunOfShow } from "@/lib/forest-house/run-of-show-storage";
import { EVENT_CREW_PREDICATES } from "@/lib/forest-house/run-of-show-seed";
import { readAllCrew } from "@/lib/forest-house/storage";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Run of Show — EDC Parade 2026",
};

const SLUG = "edc-parade";

export default async function EdcParadeRunOfShow() {
  if (!(await isFhAdminFromCookies())) {
    redirect("/forest-house/admin/login");
  }
  const [data, allCrew] = await Promise.all([
    readRunOfShow(SLUG),
    readAllCrew(),
  ]);
  const predicate = EVENT_CREW_PREDICATES[SLUG];
  const registeredCrew = allCrew
    .filter(predicate)
    .sort((a, b) => a.name.localeCompare(b.name));
  return (
    <RunOfShowClient
      slug={SLUG}
      initial={data}
      registeredCrew={registeredCrew}
    />
  );
}
