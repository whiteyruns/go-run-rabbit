import { redirect } from "next/navigation";
import { isFhAdminFromCookies } from "@/lib/forest-house/fh-auth";
import RunOfShow from "../../../components/RunOfShow";
import {
  DEFAULT_HEAVY_EQUIPMENT,
  type RunOfShowData,
} from "@/lib/forest-house/run-of-show-data";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Run of Show — Cinco de Mayo 2026",
};

const DATA: RunOfShowData = {
  eventName: "Cinco de Mayo",
  eventSubtitle: "East Fremont Block Party · Tuesday, May 5, 2026",
  location: "East Fremont Street, Las Vegas",
  dates: [
    { label: "Build Date", value: "Monday, May 4" },
    { label: "Event Date", value: "Tuesday, May 5" },
    { label: "Strike Date", value: "Wednesday, May 6" },
  ],
  schedule: [
    {
      item: "Build-Out (Partial)",
      date: "Mon 5/4",
      time: "10:00a",
      duration: "7:00",
      notes: "Park on Fremont · Strike Team",
      lead: "Stefano Kajatt",
    },
    {
      item: "Show Call",
      date: "Tue 5/5",
      time: "9:00a",
      duration: "—",
      notes: "Full team on-site",
      lead: "Keith White",
    },
    {
      item: "Block Party",
      date: "Tue 5/5",
      time: "5:00p",
      duration: "4:30",
      notes: "5:00p – 9:30p · show run",
      lead: "—",
    },
    {
      item: "Strike / Breakdown",
      date: "Wed 5/6",
      time: "8:00a",
      duration: "6:00",
      notes: "Strike Team",
      lead: "Stefano Kajatt",
    },
  ],
  clientResponsibilities: [
    "Ensure adequate security for the duration of the event.",
    "Ensure adequate power for the duration of the event.",
    "10×10 BOH tent.",
    "Work passes w/ access to catering tent (10).",
    "Traffic control / street closure coordination for East Fremont.",
  ],
  heavyEquipment: [...DEFAULT_HEAVY_EQUIPMENT],
  lastUpdated: "April 21, 2026 · v2",
};

export default async function CincoRunOfShow() {
  if (!(await isFhAdminFromCookies())) {
    redirect("/forest-house/admin/login");
  }
  return <RunOfShow data={DATA} />;
}
