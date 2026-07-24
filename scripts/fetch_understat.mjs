/**
 * Fetch Arsenal's 2025/26 Understat data and cache it to data/raw/.
 *
 * Understat sits behind a Cloudflare JS challenge, so a plain HTTP request gets
 * a stripped page. We drive the locally-installed Google Chrome via
 * puppeteer-core (which does NOT bundle its own Chromium), let it execute the
 * challenge like a real browser, then read the page's JS globals directly:
 *
 *   datesData   -> one entry per match: teams, goals, and per-match xG for/against
 *   playersData -> per-player season aggregates (apps, minutes, goals, xG, ...)
 *
 * This is the only network step in the whole project. Its output is committed
 * so the app + notebook run fully offline afterwards.
 *
 * Usage:  node scripts/fetch_understat.mjs
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const OUT = resolve(ROOT, "data/raw/understat_arsenal_2025.json");

const CHROME =
  process.env.CHROME_PATH ||
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const TEAM = "Arsenal";
const SEASON = "2025"; // Understat season key: 2025 == 2025/26 campaign
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/120.0 Safari/537.36";

async function main() {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: "new",
    args: ["--no-sandbox", "--disable-gpu"],
  });
  try {
    const page = await browser.newPage();
    await page.setUserAgent(UA);
    const url = `https://understat.com/team/${TEAM}/${SEASON}`;
    console.log(`Loading ${url} ...`);
    await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });

    const data = await page.evaluate(() => {
      const get = (k) => (typeof window[k] !== "undefined" ? window[k] : null);
      return {
        dates: get("datesData"),
        players: get("playersData"),
        statistics: get("statisticsData"),
      };
    });

    if (!data.dates || !data.players) {
      throw new Error(
        "Understat globals not found - Cloudflare may not have cleared. Retry."
      );
    }

    const payload = {
      source: "understat.com",
      team: TEAM,
      season: "2025/2026",
      url,
      fetched_note:
        "Extracted from Understat page JS globals (datesData, playersData) " +
        "via puppeteer-core driving local Chrome.",
      dates: data.dates,
      players: data.players,
      statistics: data.statistics,
    };

    mkdirSync(dirname(OUT), { recursive: true });
    writeFileSync(OUT, JSON.stringify(payload, null, 2));
    const results = data.dates.filter((d) => d.isResult).length;
    console.log(
      `Saved ${data.players.length} players and ${results} played matches -> ${OUT}`
    );
  } finally {
    await browser.close();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
