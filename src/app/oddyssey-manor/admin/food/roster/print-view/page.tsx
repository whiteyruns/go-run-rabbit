import fs from "fs";
import path from "path";
import { RosterPrint } from "@/components/oddyssey-food/RosterPrint";
import { buildStateFromCsv } from "@/lib/oddyssey-food/build-state";
import { buildRoster } from "@/lib/oddyssey-food/roster";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const LATEST_CSV = path.resolve(process.cwd(), "data/oddyssey-food/pulls/latest.csv");

function todayInPT(): string {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Los_Angeles",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return fmt.format(new Date());
}

export default async function RosterPrintViewPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; all?: string }>;
}) {
  const params = await searchParams;
  const dateParam = params.date;
  const showAll = params.all === "1";

  let csv: string;
  try {
    csv = fs.readFileSync(LATEST_CSV, "utf-8");
  } catch {
    return (
      <div style={{ padding: 40, fontFamily: "Arial, sans-serif" }}>
        <h1>No roster data</h1>
        <p>{`Expected ${LATEST_CSV} but the file isn't present.`}</p>
      </div>
    );
  }

  const { state } = buildStateFromCsv("latest.csv", csv);
  // Server-side render uses empty assignments map — manual UI overrides
  // (location, package type, walk-ups) live in browser localStorage and
  // are not visible to the server. Auto-derived fields from the CSV
  // (derived_package_types etc.) are populated by buildStateFromCsv.
  const allSections = buildRoster(state, {});

  const targetDate = dateParam ?? todayInPT();
  const sections = showAll
    ? allSections
    : allSections.filter((s) => s.session_date === targetDate);

  if (sections.length === 0) {
    return (
      <div style={{ padding: 40, fontFamily: "Arial, sans-serif" }}>
        <h1>No sessions for {targetDate}</h1>
        <p>
          The CSV has {allSections.length} date section(s) but none match{" "}
          <code>{targetDate}</code>. Add <code>?all=1</code> to see every date,
          or <code>?date=YYYY-MM-DD</code> for a specific one.
        </p>
      </div>
    );
  }

  return (
    <RosterPrint sections={sections} snapshotAt={state.source.uploaded_at} />
  );
}
