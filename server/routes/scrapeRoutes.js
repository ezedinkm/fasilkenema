import { Router } from "express";

import { isEplScrapeRunning, scrapeEthiopianLeague } from "../scraper/eplScraper.js";
import { authenticateAdminPermission } from "../middleware/authMiddleware.ts";

const router = Router();

router.post("/scrape", authenticateAdminPermission("league"), async (_req, res) => {
  try {
    const alreadyRunning = isEplScrapeRunning();
    const result = await scrapeEthiopianLeague();
    res.status(alreadyRunning ? 202 : 200).json({
      ...result,
      deduplicated: alreadyRunning,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

export default router;

