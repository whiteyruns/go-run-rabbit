# Oddyssey Food Inclusions — Ticketure Auto-Pull

Headless Playwright scraper that logs into the AREA15 Ticketure admin, exports the Oddyssey Manor attendee list for a given date, and drops the CSV into `data/oddyssey-food/pulls/` for the Food Inclusions Dashboard to consume.

## Setup (Mac Mini)

1. Install Playwright browsers once (if not already):
   ```
   cd ~/apps/go-rabbit-web
   npx playwright install chromium
   ```

2. Add the following to `~/apps/go-rabbit-web/.env.local` (**never commit**):
   ```
   TICKETURE_BASE_URL=https://area15.ticketure.com
   TICKETURE_ACCOUNT=area15
   TICKETURE_EMAIL=keith@gorunrabbit.com
   TICKETURE_PASSWORD=<your-ticketure-password>
   TICKETURE_EVENT_ID=aae027cd-6f4b-a4dc-7c8e-d7390487d5b1
   ```

3. Test it manually with a visible browser the first time so we can verify
   the login + export selectors work:
   ```
   cd ~/apps/go-rabbit-web
   npx tsx scripts/oddyssey-food-pull.ts --headless=false
   ```

   If anything fails, a screenshot lands at `data/oddyssey-food/pulls/last-error.png`.

## Usage

```
# Today's date (Pacific local)
npx tsx scripts/oddyssey-food-pull.ts

# A specific date
npx tsx scripts/oddyssey-food-pull.ts --date=2026-04-17

# Explicit UTC range
npx tsx scripts/oddyssey-food-pull.ts --from=2026-04-17T07:00:00.000Z --until=2026-04-18T07:00:00.000Z
```

Output:
- `data/oddyssey-food/pulls/attendees-<date>-<timestamp>.csv`
- `data/oddyssey-food/pulls/latest.csv` (always the most recent)
- `data/oddyssey-food/pulls/latest.json` (metadata)

## Cron (Mac Mini, every 30 min on show days)

Shows run Thursday–Sunday evenings with a 2:30 PM PT cutoff. Recommended schedule pulls fresh CSVs through the day and freezes at the cutoff:

```
# Edit crontab: crontab -e
# Every 30 minutes from 9 AM to 2:30 PM, Thursday–Sunday, Pacific time.
# PATH needs nvm's node so `npx` resolves correctly.
PATH=/Users/white/.nvm/versions/node/v22.22.0/bin:/usr/local/bin:/usr/bin:/bin
0,30 9-14 * * 4,5,6,0 cd /Users/white/apps/go-rabbit-web && /Users/white/.nvm/versions/node/v22.22.0/bin/npx tsx scripts/oddyssey-food-pull.ts >> /Users/white/apps/go-rabbit-web/logs/oddyssey-pull.log 2>&1
```

One more final pull at 12:15 AM each show night to capture the end-of-service `ticket_state` redemptions:
```
15 0 * * 5,6,0,1 cd /Users/white/apps/go-rabbit-web && /Users/white/.nvm/versions/node/v22.22.0/bin/npx tsx scripts/oddyssey-food-pull.ts --date=$(date -v-1d +\%Y-\%m-\%d) >> /Users/white/apps/go-rabbit-web/logs/oddyssey-pull.log 2>&1
```

## From the dashboard

The Upload page has an **"Auto-Pull from Ticketure"** panel with a **Pull Now** button. Clicking it:
1. `POST /api/oddyssey-food/pull` spawns `npx tsx scripts/oddyssey-food-pull.ts` on the server
2. Reads `latest.csv` + `latest.json`
3. Runs the normal ingest pipeline (parser → normalizer → auto-assign)
4. The page immediately shows the new data

Manual CSV drag-and-drop still works as a fallback.
