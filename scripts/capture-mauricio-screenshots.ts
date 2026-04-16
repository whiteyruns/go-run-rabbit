/**
 * Captures the screenshots referenced in public/docs/mauricio-recap-guide.html.
 * Requires:
 *   - Dev server running at BASE_URL (default http://localhost:3102)
 *   - Demo recap seeded:  npx tsx scripts/seed-demo-recap.ts seed
 *   - Symlink:  public/feed-the-block/img/demo-marshmello -> marshmello
 *
 * Run:  npx tsx scripts/capture-mauricio-screenshots.ts
 */
import { chromium, type Page } from "playwright";
import path from "node:path";
import { mkdir } from "node:fs/promises";

const BASE = process.env.BASE_URL || "http://localhost:3102";
const PASSWORD = process.env.SITE_PASSWORD || "cbm2026";
const OUT = path.resolve(__dirname, "..", "public", "docs", "mauricio");
const DEMO = "demo-marshmello";

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  // 01 — login screen (clean state, no auth)
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
  await snap(page, "01-login.png");

  // Authenticate via API so cookie sticks
  const loginRes = await page.request.post(`${BASE}/api/auth/login`, {
    data: { password: PASSWORD },
  });
  if (!loginRes.ok()) throw new Error(`Login failed: ${loginRes.status()}`);

  // 02 — CBM FTB hub (auth required)
  await page.goto(`${BASE}/corner-bar-management`, { waitUntil: "networkidle" });
  // Click through the cbm hub gate (cbm2026)
  const cbmInput = await page.$('input[type="password"]');
  if (cbmInput) {
    await cbmInput.fill(PASSWORD);
    await page.keyboard.press("Enter");
    await page.waitForTimeout(500);
  }
  await page.goto(`${BASE}/corner-bar-management/feed-the-block`, {
    waitUntil: "networkidle",
  });
  await page.waitForTimeout(800);
  await snap(page, "02-cbm-hub.png", { fullPage: false });

  // 03 — artist form (empty)
  await page.goto(
    `${BASE}/corner-bar-management/feed-the-block/artists/new`,
    { waitUntil: "networkidle" },
  );
  await page.waitForTimeout(400);
  // Pre-fill a few fields so the screenshot looks active
  await fillByLabel(page, "Stage Name *", "Marshmello");
  await fillByLabel(page, "Real Name *", "Christopher Comstock");
  await fillByLabel(page, "Nationality *", "American");
  await fillByLabel(page, "Years Active *", "2015–present");
  await snap(page, "03-artist-form.png");

  // 04 — new recap basics (empty + a few example fields)
  await page.goto(
    `${BASE}/corner-bar-management/feed-the-block/recaps/new`,
    { waitUntil: "networkidle" },
  );
  await page.waitForTimeout(400);
  await fillByLabel(page, "Event ID (URL slug) *", "marshmello-apr2-2026");
  await fillByLabel(page, "Headliner *", "Marshmello");
  await fillByLabel(page, "Event Date *", "April 2, 2026");
  await fillByLabel(page, "Day of Week *", "Wednesday");
  await snap(page, "04-new-recap-basics.png", { fullPage: false });

  // 05 — clone-template dropdown opened (capture the area)
  await page.evaluate(() => {
    const sel = document.querySelectorAll("select");
    for (const s of Array.from(sel)) {
      if (
        s.previousElementSibling?.textContent?.toLowerCase().includes("clone")
      ) {
        s.size = 4;
      }
    }
  });
  await page.waitForTimeout(200);
  await snap(page, "05-clone-template.png", { fullPage: false });

  // 06 — sponsors section: add 3 rows + fill them
  // scroll to sponsors area
  const sponsorAdd = await page.getByRole("button", { name: /Add Sponsor/i });
  await sponsorAdd.click();
  await sponsorAdd.click();
  await sponsorAdd.click();
  await page.waitForTimeout(200);
  // Fill them
  const placeholders = ["LVCVA", "City of Las Vegas", "Diageo"];
  const roles = [
    "Founding Municipal Partner",
    "Founding Municipal Partner",
    "Spirits & Beverage Partner",
  ];
  const cats = ["Tourism", "Government", "Beverage"];
  const nameInputs = await page.$$('input[placeholder="Name"]');
  const roleInputs = await page.$$(
    'input[placeholder="Role (e.g. Founding Municipal Partner)"]',
  );
  const catInputs = await page.$$('input[placeholder="Category"]');
  for (let i = 0; i < 3; i++) {
    if (nameInputs[i]) await nameInputs[i].fill(placeholders[i]);
    if (roleInputs[i]) await roleInputs[i].fill(roles[i]);
    if (catInputs[i]) await catInputs[i].fill(cats[i]);
  }
  await page.waitForTimeout(200);
  // scroll to sponsors fieldset
  await page.evaluate(() => {
    const legend = Array.from(document.querySelectorAll("legend")).find((l) =>
      l.textContent?.toLowerCase().includes("sponsors"),
    );
    legend?.scrollIntoView({ block: "start", behavior: "instant" as ScrollBehavior });
    window.scrollBy(0, -80);
  });
  await page.waitForTimeout(200);
  await snap(page, "06-sponsors.png", { fullPage: false });

  // 07 — photo upload UI (need DB recap to navigate to)
  await page.goto(
    `${BASE}/corner-bar-management/feed-the-block/recaps/${DEMO}/edit`,
    { waitUntil: "networkidle" },
  );
  await page.waitForTimeout(800);
  // scroll to Photos section
  await page.evaluate(() => {
    const h = Array.from(document.querySelectorAll("h2")).find(
      (n) => n.textContent === "Photos",
    );
    h?.scrollIntoView({ block: "start", behavior: "instant" as ScrollBehavior });
    window.scrollBy(0, -80);
  });
  await page.waitForTimeout(300);
  await snap(page, "07-photo-upload.png", { fullPage: false });

  // 09 — published status (top of edit page)
  await page.goto(
    `${BASE}/corner-bar-management/feed-the-block/recaps/${DEMO}/edit`,
    { waitUntil: "networkidle" },
  );
  await page.waitForTimeout(500);
  await snap(page, "09-published.png", { fullPage: false });

  // 08 — recap public page in draft state — temp unpublish for screenshot, then republish
  await page.request.post(
    `${BASE}/api/ftb-admin/recaps/${DEMO}/publish`,
    {
      data: { action: "unpublish" },
    },
  );
  await page.goto(`${BASE}/recap/ftb-editorial/${DEMO}`, {
    waitUntil: "networkidle",
  });
  await page.waitForTimeout(700);
  await snap(page, "08-draft-preview.png", { fullPage: false });
  // republish
  await page.request.post(
    `${BASE}/api/ftb-admin/recaps/${DEMO}/publish`,
    { data: { action: "publish" } },
  );

  // 10 — send page with pasted recipients
  await page.goto(
    `${BASE}/corner-bar-management/feed-the-block/recaps/${DEMO}/send`,
    { waitUntil: "networkidle" },
  );
  await page.waitForTimeout(500);
  await page.fill(
    "textarea",
    "Steve Hill <steve.hill@lvcva.com>\nKerry Bubolz <kerry.bubolz@cityoflasvegas.com>\nAlan Feldman <alan.feldman@diageo.com>\npress@vegasreview.com\nJohn Katsilometes, jkat@lvrj.com\nMauricio Morales <mauricio@cornerbarmanagement.com>",
  );
  await page.fill('input[placeholder="group tag (optional)"]', "LVCVA Quarterly");
  await page.waitForTimeout(300);
  await snap(page, "10-send-paste.png", { fullPage: false });

  // 11 — synthetic "send results" via DOM injection (no real send)
  await page.evaluate(() => {
    const main = document.querySelector("main") || document.body;
    const sect = document.createElement("section");
    sect.innerHTML = `
      <h2 style="font-family: 'Inter', sans-serif; font-size: 10px; letter-spacing: 0.3em; text-transform: uppercase; opacity: 0.6; margin: 32px 0 12px;">Send Results</h2>
      <div style="border: 1px solid rgba(174,162,255,0.12);">
        ${[
          "steve.hill@lvcva.com",
          "kerry.bubolz@cityoflasvegas.com",
          "alan.feldman@diageo.com",
          "press@vegasreview.com",
          "jkat@lvrj.com",
          "mauricio@cornerbarmanagement.com",
        ]
          .map(
            (e, i) => `
          <div style="display:flex;justify-content:space-between;padding:8px 16px;font-size:12px;${i > 0 ? "border-top:1px solid rgba(174,162,255,0.08);" : ""}">
            <span>${e}</span>
            <span style="color:#00eefc;">Sent</span>
          </div>`,
          )
          .join("")}
      </div>`;
    main.appendChild(sect);
    sect.scrollIntoView({ block: "start", behavior: "instant" as ScrollBehavior });
    window.scrollBy(0, -80);
  });
  await page.waitForTimeout(200);
  await snap(page, "11-send-results.png", { fullPage: false });

  // 12 — send history (already populated by seed)
  await page.goto(
    `${BASE}/corner-bar-management/feed-the-block/recaps/${DEMO}/send`,
    { waitUntil: "networkidle" },
  );
  await page.waitForTimeout(500);
  await page.evaluate(() => {
    const h = Array.from(document.querySelectorAll("h2")).find((n) =>
      n.textContent?.toLowerCase().includes("history"),
    );
    h?.scrollIntoView({ block: "start", behavior: "instant" as ScrollBehavior });
    window.scrollBy(0, -80);
  });
  await page.waitForTimeout(300);
  await snap(page, "12-history.png", { fullPage: false });

  await browser.close();
  console.log("Screenshots written to", OUT);
}

async function snap(
  page: Page,
  name: string,
  opts: { fullPage?: boolean } = {},
) {
  const { fullPage = false } = opts;
  await page.screenshot({
    path: path.join(OUT, name),
    fullPage,
  });
  console.log(" ✓", name);
}

async function fillByLabel(page: Page, label: string, value: string) {
  // Find <label> with matching text, then the next input/textarea
  const handle = await page.evaluateHandle((label) => {
    const labels = Array.from(document.querySelectorAll("label"));
    const found = labels.find((l) => l.textContent?.trim() === label);
    if (!found) return null;
    const wrap = found.parentElement;
    return wrap?.querySelector("input, textarea") ?? null;
  }, label);
  const el = handle.asElement();
  if (el) {
    await (el as { fill: (v: string) => Promise<void> }).fill(value);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
