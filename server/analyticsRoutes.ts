import { createHash } from "node:crypto";
import type { Express, Request, RequestHandler } from "express";
import { pool } from "./db";
import { authenticateAdminPermission } from "./middleware/authMiddleware";

type AnalyticsRange = "24h" | "7d" | "30d" | "90d";
type DeviceCategory = "mobile" | "tablet" | "desktop" | "unknown";

const rangeDays: Record<AnalyticsRange, number> = {
  "24h": 1,
  "7d": 7,
  "30d": 30,
  "90d": 90,
};
const activeVisitorWindowMs = 5 * 60 * 1000;
const ingestRateLimit = new Map<string, { windowStartedAt: number; count: number }>();
const analyticsCache = new Map<
  AnalyticsRange,
  { expiresAt: number; data: Record<string, unknown> }
>();
let lastRateLimitPruneAt = 0;
let cleanupRunning = false;

function normalizePagePath(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const path = value.trim();
  if (
    !path.startsWith("/") ||
    path.startsWith("//") ||
    path.length > 512 ||
    /[?#\u0000-\u001f]/.test(path)
  ) {
    return null;
  }

  if (
    path === "/admin" ||
    path.startsWith("/admin/") ||
    path === "/member" ||
    path.startsWith("/member/")
  ) {
    return null;
  }

  return path;
}

function normalizeReferrerHost(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const host = value.trim().toLowerCase();
  if (
    host.length === 0 ||
    host.length > 255 ||
    !/^[a-z0-9.-]+$/.test(host) ||
    host.startsWith(".") ||
    host.endsWith(".") ||
    host.includes("..")
  ) {
    return null;
  }
  return host;
}

function normalizeDeviceCategory(value: unknown): DeviceCategory {
  if (
    value === "mobile" ||
    value === "tablet" ||
    value === "desktop"
  ) {
    return value;
  }
  return "unknown";
}

function allowPageviewRequest(req: Request): boolean {
  const now = Date.now();
  if (now - lastRateLimitPruneAt > 60_000) {
    ingestRateLimit.forEach((value, key) => {
      if (now - value.windowStartedAt > 60_000) ingestRateLimit.delete(key);
    });
    lastRateLimitPruneAt = now;
  }

  const address = req.ip || req.socket.remoteAddress || "unknown";
  const key = createHash("sha256").update(address).digest("hex");
  const current = ingestRateLimit.get(key);
  if (!current || now - current.windowStartedAt >= 60_000) {
    ingestRateLimit.set(key, { windowStartedAt: now, count: 1 });
    return true;
  }

  current.count += 1;
  return current.count <= 120;
}

async function purgeExpiredPageviews() {
  if (cleanupRunning) return;
  cleanupRunning = true;
  try {
    for (let batch = 0; batch < 5; batch += 1) {
      const expiredPageviews = await pool.query(`
        WITH expired AS (
          SELECT id
          FROM visitor_pageviews
          WHERE created_at < NOW() - INTERVAL '12 months'
          ORDER BY created_at
          LIMIT 10000
        )
        DELETE FROM visitor_pageviews AS pageview
        USING expired
        WHERE pageview.id = expired.id
      `);
      const expiredSessions = await pool.query(`
        WITH expired AS (
          SELECT session_hash
          FROM visitor_sessions
          WHERE started_at < NOW() - INTERVAL '12 months'
          ORDER BY started_at
          LIMIT 10000
        )
        DELETE FROM visitor_sessions AS visitor_session
        USING expired
        WHERE visitor_session.session_hash = expired.session_hash
      `);
      if (
        (expiredPageviews.rowCount ?? 0) < 10_000 &&
        (expiredSessions.rowCount ?? 0) < 10_000
      ) {
        break;
      }
    }
  } catch {
    // The table may not exist until the additive migration has been applied.
  } finally {
    cleanupRunning = false;
  }
}

const analyticsReadPermission: RequestHandler =
  authenticateAdminPermission("dashboard");

export function registerAnalyticsRoutes(app: Express) {
  const cleanupTimer = setInterval(() => {
    void purgeExpiredPageviews();
  }, 6 * 60 * 60 * 1000);
  cleanupTimer.unref();
  void purgeExpiredPageviews();

  app.post("/api/analytics/pageview", async (req, res) => {
    if (!allowPageviewRequest(req)) {
      return res.status(429).json({ error: "Too many analytics events" });
    }

    const body =
      req.body && typeof req.body === "object" && !Array.isArray(req.body)
        ? req.body
        : {};
    const rawSessionId =
      typeof body.sessionId === "string" ? body.sessionId.trim() : "";
    if (!/^[a-f0-9-]{36}$/i.test(rawSessionId)) {
      return res.status(400).json({ error: "Invalid analytics session" });
    }

    const pagePath = normalizePagePath(body.pagePath);
    if (!pagePath) {
      return res.status(400).json({ error: "Invalid analytics page path" });
    }

    const sessionHash = createHash("sha256").update(rawSessionId).digest("hex");
    const referrerHost = normalizeReferrerHost(body.referrerHost);
    const deviceCategory = normalizeDeviceCategory(body.deviceCategory);

    try {
      await pool.query(
        `WITH pageview AS (
           INSERT INTO visitor_pageviews
             (session_hash, page_path, referrer_host, device_category)
           VALUES ($1, $2, $3, $4)
           RETURNING id
         )
         INSERT INTO visitor_sessions
           (session_hash, current_page_path, referrer_host, device_category)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (session_hash) DO UPDATE
         SET current_page_path = EXCLUDED.current_page_path,
             referrer_host = COALESCE(visitor_sessions.referrer_host, EXCLUDED.referrer_host),
             device_category = EXCLUDED.device_category,
             last_seen_at = NOW()`,
        [sessionHash, pagePath, referrerHost, deviceCategory],
      );
      return res.status(204).end();
    } catch {
      return res.status(503).json({ error: "Analytics are temporarily unavailable" });
    }
  });

  app.post("/api/analytics/heartbeat", async (req, res) => {
    if (!allowPageviewRequest(req)) {
      return res.status(429).json({ error: "Too many analytics events" });
    }

    const body =
      req.body && typeof req.body === "object" && !Array.isArray(req.body)
        ? req.body
        : {};
    const rawSessionId =
      typeof body.sessionId === "string" ? body.sessionId.trim() : "";
    if (!/^[a-f0-9-]{36}$/i.test(rawSessionId)) {
      return res.status(400).json({ error: "Invalid analytics session" });
    }

    const pagePath = normalizePagePath(body.pagePath);
    if (!pagePath) {
      return res.status(400).json({ error: "Invalid analytics page path" });
    }

    const sessionHash = createHash("sha256").update(rawSessionId).digest("hex");
    const deviceCategory = normalizeDeviceCategory(body.deviceCategory);
    try {
      await pool.query(
        `INSERT INTO visitor_sessions
          (session_hash, current_page_path, device_category)
         VALUES ($1, $2, $3)
         ON CONFLICT (session_hash) DO UPDATE
         SET current_page_path = EXCLUDED.current_page_path,
             device_category = EXCLUDED.device_category,
             last_seen_at = NOW()`,
        [sessionHash, pagePath, deviceCategory],
      );
      return res.status(204).end();
    } catch {
      return res.status(503).json({ error: "Analytics are temporarily unavailable" });
    }
  });

  app.get(
    "/api/admin/analytics",
    analyticsReadPermission,
    async (req, res) => {
      const rawRange = req.query.range;
      const range: AnalyticsRange =
        rawRange === "24h" ||
        rawRange === "7d" ||
        rawRange === "30d" ||
        rawRange === "90d"
          ? rawRange
          : "7d";

      const now = new Date();
      const isHourly = range === "24h";
      const bucketUnit = isHourly ? "hour" : "day";
      const rangeStart = new Date(now.getTime() - rangeDays[range] * 86_400_000);
      const bucketSize = isHourly ? 3_600_000 : 86_400_000;
      const firstBucket = isHourly
        ? Math.floor(now.getTime() / bucketSize) * bucketSize -
          23 * bucketSize
        : Math.floor(now.getTime() / bucketSize) * bucketSize -
          (rangeDays[range] - 1) * bucketSize;
      const trendStart = new Date(firstBucket);
      const bucketCount = isHourly ? 24 : rangeDays[range];
      const cached = analyticsCache.get(range);
      if (cached && cached.expiresAt > now.getTime()) {
        return res.json(cached.data);
      }

      try {
        const [
          summaryResult,
          activeResult,
          trendResult,
          topPagesResult,
          sourcesResult,
          devicesResult,
          activePagesResult,
        ] = await Promise.all([
          pool.query(
            `WITH sessions AS (
               SELECT pageview.session_hash,
                      COUNT(*)::int AS pageviews,
                      EXTRACT(
                        EPOCH FROM COALESCE(visitor_session.last_seen_at, MAX(pageview.created_at))
                        - MIN(pageview.created_at)
                      )::float AS duration_seconds
               FROM visitor_pageviews AS pageview
               LEFT JOIN visitor_sessions AS visitor_session
                 ON visitor_session.session_hash = pageview.session_hash
               WHERE pageview.created_at >= $1
               GROUP BY pageview.session_hash, visitor_session.last_seen_at
             )
             SELECT COUNT(*)::int AS sessions,
                    COALESCE(SUM(pageviews), 0)::int AS pageviews,
                    COALESCE(
                      ROUND(
                        COUNT(*) FILTER (WHERE pageviews = 1)::numeric
                        * 100 / NULLIF(COUNT(*), 0),
                        1
                      ),
                      0
                    )::float AS bounce_rate,
                    COALESCE(AVG(duration_seconds), 0)::float AS average_session_seconds
             FROM sessions`,
            [rangeStart],
          ),
          pool.query(
            `SELECT COUNT(DISTINCT session_hash)::int AS active_visitors
             FROM visitor_sessions
             WHERE last_seen_at >= NOW() - INTERVAL '5 minutes'`,
          ),
          pool.query(
            `SELECT TO_CHAR(
                      DATE_TRUNC($1, created_at AT TIME ZONE 'UTC'),
                      'YYYY-MM-DD"T"HH24:MI:SS'
                    ) AS bucket,
                    COUNT(*)::int AS pageviews,
                    COUNT(DISTINCT session_hash)::int AS sessions
             FROM visitor_pageviews
             WHERE created_at >= $2
             GROUP BY 1
             ORDER BY 1`,
            [bucketUnit, trendStart],
          ),
          pool.query(
            `SELECT page_path AS path,
                    COUNT(*)::int AS pageviews,
                    COUNT(DISTINCT session_hash)::int AS visitors
             FROM visitor_pageviews
             WHERE created_at >= $1
             GROUP BY page_path
             ORDER BY pageviews DESC, path ASC
             LIMIT 8`,
            [rangeStart],
          ),
          pool.query(
            `SELECT COALESCE(NULLIF(referrer_host, ''), 'Direct') AS source,
                    COUNT(DISTINCT session_hash)::int AS visits,
                    COUNT(*)::int AS pageviews
             FROM visitor_pageviews
             WHERE created_at >= $1
             GROUP BY 1
             ORDER BY visits DESC, source ASC
             LIMIT 8`,
            [rangeStart],
          ),
          pool.query(
            `SELECT device_category AS device,
                    COUNT(DISTINCT session_hash)::int AS visitors
             FROM visitor_pageviews
             WHERE created_at >= $1
             GROUP BY device_category
             ORDER BY visitors DESC`,
            [rangeStart],
          ),
          pool.query(
            `SELECT current_page_path AS path, COUNT(*)::int AS visitors
             FROM visitor_sessions
             WHERE last_seen_at >= NOW() - INTERVAL '5 minutes'
             GROUP BY current_page_path
             ORDER BY visitors DESC, path ASC
             LIMIT 5`,
          ),
        ]);

        const trendByBucket = new Map(
          trendResult.rows.map((row) => [
            Date.parse(`${row.bucket}Z`),
            {
              pageviews: Number(row.pageviews) || 0,
              visitors: Number(row.sessions) || 0,
            },
          ]),
        );
        const trend = Array.from({ length: bucketCount }, (_, index) => {
          const timestamp = firstBucket + index * bucketSize;
          const value = trendByBucket.get(timestamp);
          return {
            bucket: new Date(timestamp).toISOString(),
            pageviews: value?.pageviews ?? 0,
            visitors: value?.visitors ?? 0,
          };
        });

        const summary = summaryResult.rows[0] ?? {};
        const responseData = {
          range,
          updatedAt: now.toISOString(),
          activeVisitors: Number(activeResult.rows[0]?.active_visitors) || 0,
          visitors: Number(summary.sessions) || 0,
          pageviews: Number(summary.pageviews) || 0,
          bounceRate: Number(summary.bounce_rate) || 0,
          averageSessionSeconds:
            Number(summary.average_session_seconds) || 0,
          trend,
          topPages: topPagesResult.rows.map((row) => ({
            path: String(row.path),
            pageviews: Number(row.pageviews) || 0,
            visitors: Number(row.visitors) || 0,
          })),
          sources: sourcesResult.rows.map((row) => ({
            source: String(row.source),
            visits: Number(row.visits) || 0,
            visitors: Number(row.visitors) || 0,
          })),
          devices: devicesResult.rows.map((row) => ({
            device: String(row.device),
            visitors: Number(row.visitors) || 0,
          })),
          activePages: activePagesResult.rows.map((row) => ({
            path: String(row.path),
            visitors: Number(row.visitors) || 0,
          })),
        };
        analyticsCache.set(range, {
          expiresAt: now.getTime() + 10_000,
          data: responseData,
        });
        return res.json(responseData);
      } catch {
        return res.status(503).json({
          error:
            "Visitor analytics are not ready. Apply the analytics database migration and try again.",
        });
      }
    },
  );
}
