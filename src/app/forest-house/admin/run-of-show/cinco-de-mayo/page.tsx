import { redirect } from "next/navigation";
import { isFhAdminFromCookies } from "@/lib/forest-house/fh-auth";
import RunOfShowClient from "../../../components/RunOfShowClient";
import { readRunOfShow } from "@/lib/forest-house/run-of-show-storage";
import { EVENT_CREW_PREDICATES } from "@/lib/forest-house/run-of-show-seed";
import { readAllCrew } from "@/lib/forest-house/storage";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Run of Show — Cinco de Mayo 2026",
};

const SLUG = "cinco-de-mayo";

export default async function CincoRunOfShow() {
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
