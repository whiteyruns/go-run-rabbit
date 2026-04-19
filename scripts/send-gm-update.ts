/**
 * One-off: sends the GM dashboard-update email (drafted in
 * data/oddyssey-sessions/gm-update-draft.html) via Resend.
 *
 * Usage: tsx scripts/send-gm-update.ts
 *
 * Reads RESEND_API_KEY from .env.local like the recap API routes do.
 */
import fs from "fs/promises";
import path from "path";
import { Resend } from "resend";

async function main() {
  const htmlPath = path.resolve("data/oddyssey-sessions/gm-update-draft.html");
  const html = await fs.readFile(htmlPath, "utf-8");

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("RESEND_API_KEY is not set — cannot send.");
    process.exit(1);
  }

  const resend = new Resend(apiKey);

  const { data, error } = await resend.emails.send({
    from: "Keith @ Go Run Rabbit <keith@gorunrabbit.com>",
    to: ["bpereyda@area15.com"],
    cc: ["keith@gorunrabbit.com"],
    subject: "Oddyssey Dashboard Update · Third-party tickets now tracked",
    html,
  });

  if (error) {
    console.error("Resend error:", error);
    process.exit(1);
  }
  console.log("Sent. id =", data?.id);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
