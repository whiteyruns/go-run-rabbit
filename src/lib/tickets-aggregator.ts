/**
 * Aggregates a BLOCKPARTY.VEGAS-style ticket-orders CSV into the
 * `TicketsAggregate` shape attached to FtbRecap. Discards row-level data
 * (names, DOBs, phones) — only counts and bins survive.
 *
 * Expected CSV layout (5 metadata header lines, then column header, then rows):
 *   Order#, Order Date, Order Time, First Name, Last Name, DOB, Gender,
 *   Primary Phone, Zip
 */

export interface TicketsAggregate {
  totalOrders: number;
  uploadedAt: string; // ISO
  source: string; // freeform — "BLOCKPARTY.VEGAS Orders"
  registrationByDay: { date: string; count: number }[];
  registrationByHour: { hour: number; count: number }[]; // event-day only
  eventDay: string | null; // detected as the heaviest day (most rows)
  geographic: {
    zipsAnalyzed: number;
    nevadaCount: number;
    otherCount: number;
    topStates: { state: string; count: number; pct: number }[];
  };
  gender: {
    n: number;
    breakdown: { label: string; count: number; pct: number }[];
  };
  age: {
    n: number;
    median: number;
    buckets: { range: string; count: number; pct: number }[];
  };
}

interface Row {
  order: string;
  date: string;
  time: string;
  dob: string;
  gender: string;
  zip: string;
}

const AGE_BUCKETS: { label: string; min: number; max: number }[] = [
  { label: "Under 21", min: 0, max: 20 },
  { label: "21–24", min: 21, max: 24 },
  { label: "25–29", min: 25, max: 29 },
  { label: "30–34", min: 30, max: 34 },
  { label: "35–44", min: 35, max: 44 },
  { label: "45+", min: 45, max: 999 },
];

export function aggregateTicketsCSV(csvText: string): TicketsAggregate {
  const rows = parseCSV(csvText);

  // Day curve
  const dayCounts = new Map<string, number>();
  for (const r of rows) {
    if (!r.date) continue;
    dayCounts.set(r.date, (dayCounts.get(r.date) ?? 0) + 1);
  }
  const registrationByDay = Array.from(dayCounts.entries())
    .filter(([d]) => /^\d{4}-\d{2}-\d{2}$/.test(d))
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }));

  // Detect event day = heaviest day
  let eventDay: string | null = null;
  let maxCount = -1;
  for (const { date, count } of registrationByDay) {
    if (count > maxCount) {
      maxCount = count;
      eventDay = date;
    }
  }

  // Hour curve (event day only)
  const hourCounts = new Map<number, number>();
  if (eventDay) {
    for (const r of rows) {
      if (r.date !== eventDay) continue;
      const h = parseHour(r.time);
      if (h == null) continue;
      hourCounts.set(h, (hourCounts.get(h) ?? 0) + 1);
    }
  }
  const registrationByHour = Array.from(hourCounts.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([hour, count]) => ({ hour, count }));

  // Geographic
  let nevadaCount = 0;
  let otherCount = 0;
  const stateCounts = new Map<string, number>();
  let zipsAnalyzed = 0;
  for (const r of rows) {
    const zip = (r.zip || "").trim();
    if (!/^\d{5}$/.test(zip)) continue;
    zipsAnalyzed++;
    const state = stateForZip(zip);
    stateCounts.set(state, (stateCounts.get(state) ?? 0) + 1);
    if (state === "Nevada") nevadaCount++;
    else otherCount++;
  }
  const topStates = Array.from(stateCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([state, count]) => ({
      state,
      count,
      pct: zipsAnalyzed > 0 ? (count / zipsAnalyzed) * 100 : 0,
    }));

  // Gender
  const genderCounts = new Map<string, number>();
  for (const r of rows) {
    const g = (r.gender || "").trim();
    if (!g) continue;
    genderCounts.set(g, (genderCounts.get(g) ?? 0) + 1);
  }
  const genderTotal = Array.from(genderCounts.values()).reduce(
    (s, n) => s + n,
    0,
  );
  const genderBreakdown = Array.from(genderCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([raw, count]) => ({
      label: prettyGender(raw),
      count,
      pct: genderTotal > 0 ? (count / genderTotal) * 100 : 0,
    }));

  // Age (compute relative to event year if known, else current year)
  const referenceYear = eventDay ? parseInt(eventDay.slice(0, 4), 10) : new Date().getFullYear();
  const ages: number[] = [];
  for (const r of rows) {
    const dob = r.dob;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dob)) continue;
    const yob = parseInt(dob.slice(0, 4), 10);
    const age = referenceYear - yob;
    if (age >= 13 && age <= 100) ages.push(age);
  }
  ages.sort((a, b) => a - b);
  const median = ages.length > 0 ? ages[Math.floor(ages.length / 2)] : 0;
  const ageBucketCounts = AGE_BUCKETS.map((b) => ({
    range: b.label,
    count: ages.filter((a) => a >= b.min && a <= b.max).length,
    pct: 0,
  }));
  const ageTotal = ages.length;
  for (const b of ageBucketCounts) {
    b.pct = ageTotal > 0 ? (b.count / ageTotal) * 100 : 0;
  }

  return {
    totalOrders: rows.length,
    uploadedAt: new Date().toISOString(),
    source: "BLOCKPARTY.VEGAS Orders",
    registrationByDay,
    registrationByHour,
    eventDay,
    geographic: {
      zipsAnalyzed,
      nevadaCount,
      otherCount,
      topStates,
    },
    gender: { n: genderTotal, breakdown: genderBreakdown },
    age: { n: ageTotal, median, buckets: ageBucketCounts },
  };
}

// ---------- helpers ----------

function parseCSV(text: string): Row[] {
  // Strip the 5 metadata header rows + the column header row, then parse.
  const lines = text.split(/\r?\n/);
  // Find the "Order#" header line — first column starts with "Order#"
  let headerIdx = -1;
  for (let i = 0; i < Math.min(20, lines.length); i++) {
    if (lines[i].startsWith("Order#")) {
      headerIdx = i;
      break;
    }
  }
  if (headerIdx === -1) return [];

  const out: Row[] = [];
  for (let i = headerIdx + 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line || !line.trim()) continue;
    const cols = splitCSVLine(line);
    if (cols.length < 9) continue;
    const order = cols[0]?.trim();
    if (!order) continue;
    out.push({
      order,
      date: cols[1]?.trim() ?? "",
      time: cols[2]?.trim() ?? "",
      dob: cols[5]?.trim() ?? "",
      gender: cols[6]?.trim() ?? "",
      zip: cols[8]?.trim() ?? "",
    });
  }
  return out;
}

function splitCSVLine(line: string): string[] {
  // Handles double-quoted fields and embedded commas.
  const out: string[] = [];
  let cur = "";
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQ) {
      if (c === '"' && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (c === '"') {
        inQ = false;
      } else {
        cur += c;
      }
    } else if (c === '"') {
      inQ = true;
    } else if (c === ",") {
      out.push(cur);
      cur = "";
    } else {
      cur += c;
    }
  }
  out.push(cur);
  return out;
}

function parseHour(timeStr: string): number | null {
  // "09:53 PM PDT" → 21
  const m = timeStr.match(/^(\d{1,2}):\d{2}\s*([AP]M)/i);
  if (!m) return null;
  let h = parseInt(m[1], 10);
  const meridian = m[2].toUpperCase();
  if (meridian === "PM" && h !== 12) h += 12;
  else if (meridian === "AM" && h === 12) h = 0;
  return h;
}

function prettyGender(raw: string): string {
  const s = raw.toUpperCase().trim();
  if (s === "MALE") return "Male";
  if (s === "FEMALE") return "Female";
  if (s === "NON_BINARY" || s === "NONBINARY") return "Non-binary";
  if (s === "PREFER_NOT_TO_SAY") return "Prefer not to say";
  return raw.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Maps a 5-digit US ZIP to a state name using ZIP3 prefix ranges.
 * Source: USPS ZIP code prefix list.
 */
export function stateForZip(zip5: string): string {
  if (!/^\d{5}$/.test(zip5)) return "Unknown";
  const z3 = parseInt(zip5.slice(0, 3), 10);
  // Northeast
  if (z3 === 5) return "Massachusetts";
  if (z3 >= 10 && z3 <= 27) return "Massachusetts";
  if (z3 === 28 || z3 === 29) return "Rhode Island";
  if (z3 >= 30 && z3 <= 38) return "New Hampshire";
  if (z3 >= 39 && z3 <= 49) return "Maine";
  if (z3 >= 50 && z3 <= 59) return "Vermont";
  if (z3 >= 60 && z3 <= 69) return "Connecticut";
  if (z3 >= 70 && z3 <= 89) return "New Jersey";
  if (z3 >= 100 && z3 <= 149) return "New York";
  if (z3 >= 150 && z3 <= 196) return "Pennsylvania";
  if (z3 >= 197 && z3 <= 199) return "Delaware";
  if (z3 >= 200 && z3 <= 205) return "DC";
  if (z3 >= 206 && z3 <= 219) return "Maryland";
  if (z3 >= 220 && z3 <= 246) return "Virginia";
  if (z3 >= 247 && z3 <= 269) return "West Virginia";
  // Southeast
  if (z3 >= 270 && z3 <= 289) return "North Carolina";
  if (z3 >= 290 && z3 <= 299) return "South Carolina";
  if ((z3 >= 300 && z3 <= 319) || z3 === 398 || z3 === 399) return "Georgia";
  if (z3 >= 320 && z3 <= 349) return "Florida";
  if (z3 >= 350 && z3 <= 369) return "Alabama";
  if (z3 >= 370 && z3 <= 385) return "Tennessee";
  if (z3 >= 386 && z3 <= 397) return "Mississippi";
  // Midwest
  if (z3 >= 400 && z3 <= 427) return "Kentucky";
  if (z3 >= 430 && z3 <= 459) return "Ohio";
  if (z3 >= 460 && z3 <= 479) return "Indiana";
  if (z3 >= 480 && z3 <= 499) return "Michigan";
  if (z3 >= 500 && z3 <= 528) return "Iowa";
  if (z3 >= 530 && z3 <= 549) return "Wisconsin";
  if (z3 >= 550 && z3 <= 567) return "Minnesota";
  if (z3 >= 570 && z3 <= 577) return "South Dakota";
  if (z3 >= 580 && z3 <= 588) return "North Dakota";
  if (z3 >= 590 && z3 <= 599) return "Montana";
  if (z3 >= 600 && z3 <= 629) return "Illinois";
  if (z3 >= 630 && z3 <= 658) return "Missouri";
  if (z3 >= 660 && z3 <= 679) return "Kansas";
  if (z3 >= 680 && z3 <= 693) return "Nebraska";
  // South Central
  if (z3 >= 700 && z3 <= 714) return "Louisiana";
  if (z3 >= 716 && z3 <= 729) return "Arkansas";
  if (z3 >= 730 && z3 <= 749) return "Oklahoma";
  if (z3 >= 750 && z3 <= 799) return "Texas";
  // Mountain
  if (z3 >= 800 && z3 <= 816) return "Colorado";
  if (z3 >= 820 && z3 <= 831) return "Wyoming";
  if (z3 >= 832 && z3 <= 838) return "Idaho";
  if (z3 >= 840 && z3 <= 847) return "Utah";
  if (z3 >= 850 && z3 <= 865) return "Arizona";
  if (z3 >= 870 && z3 <= 884) return "New Mexico";
  if (z3 >= 889 && z3 <= 898) return "Nevada";
  // West Coast / Pacific
  if (z3 >= 900 && z3 <= 961) return "California";
  if ((z3 >= 967 && z3 <= 968) || z3 === 969) return "Hawaii";
  if (z3 >= 970 && z3 <= 979) return "Oregon";
  if (z3 >= 980 && z3 <= 994) return "Washington";
  if (z3 >= 995 && z3 <= 999) return "Alaska";
  return "Unknown";
}
