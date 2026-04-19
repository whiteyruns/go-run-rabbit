/**
 * One-off: exercises the weekend-recap parsers end-to-end against the
 * local xlsx copies in ~/tmp-upload-test so we can verify everything
 * writes correctly before Keith sends the GM to the UI.
 *
 * Usage: tsx scripts/weekend-recap-test-upload.ts
 */
import fs from "fs";
import path from "path";
import { parseManorWorkbook } from "@/app/oddyssey-manor/admin/weekend-recap/parser-manor";
import { parseNoirWorkbook } from "@/app/oddyssey-manor/admin/weekend-recap/parser-noir";
import { upsertVenueNight, writeYTDRollup } from "@/app/oddyssey-manor/admin/weekend-recap/lib";

const DEFAULT_YEAR = 2026;
const UPLOAD_DIR = path.join(process.env.HOME || "/Users/white", "tmp-upload-test");

async function main() {
  const manorPath = path.join(UPLOAD_DIR, "MANOR P&L.xlsx");
  const noirPath = path.join(UPLOAD_DIR, "NOIR Budgets & Reports.xlsx");

  console.log("=== Manor P&L ===");
  if (fs.existsSync(manorPath)) {
    const buf = fs.readFileSync(manorPath);
    const result = parseManorWorkbook(buf, DEFAULT_YEAR);
    console.log(`  nights parsed: ${result.nights.length}`);
    console.log(`  ytd months with actualNet: ${result.ytd.filter((m) => m.actualNet != null).length}`);
    if (result.warnings.length) console.log(`  warnings:`, result.warnings);
    const anchors = new Set<string>();
    for (const n of result.nights) anchors.add(await upsertVenueNight(n));
    await writeYTDRollup({ venue: "manor", year: DEFAULT_YEAR, rows: result.ytd, lastUploadedAt: null });
    console.log(`  weekends touched: ${[...anchors].sort().join(", ")}`);
  } else {
    console.log(`  ${manorPath} missing — skipping`);
  }

  console.log("\n=== Noir Budgets & Reports ===");
  if (fs.existsSync(noirPath)) {
    const buf = fs.readFileSync(noirPath);
    const result = parseNoirWorkbook(buf, DEFAULT_YEAR);
    console.log(`  nights parsed: ${result.nights.length}`);
    console.log(`  ytd months with actualNet: ${result.ytd.filter((m) => m.actualNet != null).length}`);
    if (result.warnings.length) console.log(`  warnings:`, result.warnings);
    const anchors = new Set<string>();
    for (const n of result.nights) anchors.add(await upsertVenueNight(n));
    await writeYTDRollup({ venue: "noir", year: DEFAULT_YEAR, rows: result.ytd, lastUploadedAt: null });
    console.log(`  weekends touched: ${[...anchors].sort().join(", ")}`);
  } else {
    console.log(`  ${noirPath} missing — skipping`);
  }

  console.log("\n=== Files on disk ===");
  const dataDir = path.resolve(process.cwd(), "data/oddyssey/weekend-recap");
  if (fs.existsSync(dataDir)) {
    for (const f of fs.readdirSync(dataDir).sort()) console.log(`  ${f}`);
    const ytdDir = path.join(dataDir, "ytd");
    if (fs.existsSync(ytdDir)) for (const f of fs.readdirSync(ytdDir).sort()) console.log(`  ytd/${f}`);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
