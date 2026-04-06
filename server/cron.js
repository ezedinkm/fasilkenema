import cron from "node-cron";

import { scrapeEthiopianLeague } from "./scraper/eplScraper.js";

let schedulerStarted = false;

async function runScrape(reason) {
  try {
    const result = await scrapeEthiopianLeague();
    if (!result.ok) {
      console.error(
        `[cron] Ethiopian league scrape failed (${reason}):`,
        result.error,
      );
      return;
    }
    console.log(`[cron] Ethiopian league scrape done (${reason}):`, result);
  } catch (error) {
    console.error(
      `[cron] Unexpected scraper error (${reason}):`,
      error instanceof Error ? (error.stack ?? error.message) : error,
    );
  }
}

export async function startEplScheduler() {
  if (schedulerStarted) return;
  schedulerStarted = true;

  const scrapeOnStartup = process.env.EPL_SCRAPE_ON_STARTUP !== "false";
  if (scrapeOnStartup) {
    await runScrape("startup");
  }

  cron.schedule("0 */6 * * *", async () => {
    await runScrape("schedule");
  });
}
