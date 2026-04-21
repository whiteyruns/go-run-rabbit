import { redirect } from "next/navigation";
import { isFhAdminFromCookies } from "@/lib/forest-house/fh-auth";
import RunOfShowClient from "../../../components/RunOfShowClient";
import { readRunOfShow } from "@/lib/forest-house/run-of-show-storage";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Run of Show — Cinco de Mayo 2026",
};

const SLUG = "cinco-de-mayo";

export default async function CincoRunOfShow() {
  if (!(await isFhAdminFromCookies())) {
    redirect("/forest-house/admin/login");
  }
  const data = await readRunOfShow(SLUG);
  return <RunOfShowClient slug={SLUG} initial={data} />;
}
