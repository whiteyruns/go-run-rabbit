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
    { label: "Build Dates", value: "May 3 & 4" },
    { label: "Event Date", value: "Tuesday, May 5" },
    { label: "Strike Date", value: "Wednesday, May 6" },
  ],
  schedule: [
    {
      item: "Transport",
      date: "Sun 5/3",
      time: "8:00a",
      duration: "1:30",
      notes: "Knight Transportation → East Fremont",
      lead: "Keith White",
    },
    {
      item: "Build-Out",
      date: "Sun 5/3",
      time: "9:30a",
      duration: "8:00",
      notes: "Strike Team",
      lead: "Stefano Kajatt",
    },
    {
      item: "Build-Out / Sound Test",
      date: "Mon 5/4",
      time: "9:00a",
      duration: "8:00",
      notes: "Strike Team / Auralux",
      lead: "Mike Saporita",
    },
    {
      item: "Light Test",
      date: "Mon 5/4",
      time: "6:00p",
      duration: "2:00",
      notes: "Auralux",
      lead: "Mike Saporita",
    },
    {
      item: "Show Call",
      date: "Tue 5/5",
      time: "TBD",
      duration: "—",
      notes: "Full team on-site",
      lead: "Keith White",
    },
    {
      item: "Sound Check",
      date: "Tue 5/5",
      time: "TBD",
      duration: "1:00",
      notes: "Auralux",
      lead: "Mike Saporita",
    },
    {
      item: "Block Party",
      date: "Tue 5/5",
      time: "TBD",
      duration: "TBD",
      notes: "Show run — sound, lights, lasers live",
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
    {
      item: "Transport Out",
      date: "Wed 5/6",
      time: "2:00p",
      duration: "1:30",
      notes: "Back to storage yard",
      lead: "Keith White",
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
  lastUpdated: "April 21, 2026",
};

export default async function CincoRunOfShow() {
  if (!(await isFhAdminFromCookies())) {
    redirect("/forest-house/admin/login");
  }
  return <RunOfShow data={DATA} />;
}
