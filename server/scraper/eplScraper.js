import axios from "axios";
import * as cheerio from "cheerio";

import { pool } from "../db.ts";

let activeScrapePromise = null;

function normalizeName(name) {
  return String(name ?? "")
    .trim()
    .toLowerCase();
}

function extractTeamNameFromLink($, el) {
  const text = $(el).text();
  const title = $(el).attr("title");
  const candidate = title && title.length > text.length ? title : text;
  return normalizeName(candidate);
}

function parseIntSafe(value) {
  const n = parseInt(String(value ?? "").replace(/[^\d-]/g, ""), 10);
  return Number.isFinite(n) ? n : 0;
}

async function getOrCreateClub(name) {
  const normalized = normalizeName(name);
  if (!normalized) throw new Error("Club name is required");

  const { rows } = await pool.query(
    `
      INSERT INTO clubs (name)
      VALUES ($1)
      ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
      RETURNING id;
    `,
    [normalized],
  );

  return rows[0].id;
}

async function scrapeTable(html) {
  const $ = cheerio.load(html);

  const rows = [];
  $(".team").each((_, el) => {
    const teamName = normalizeName($(el).text());
    const root = $(el).closest("tr").length
      ? $(el).closest("tr")
      : $(el).parent();

    rows.push({
      teamName,
      played: parseIntSafe(root.find(".played").first().text()),
      win: parseIntSafe(root.find(".win").first().text()),
      draw: parseIntSafe(root.find(".draw").first().text()),
      loss: parseIntSafe(root.find(".loss").first().text()),
      goalsFor: parseIntSafe(root.find(".goals_for").first().text()),
      goalsAgainst: parseIntSafe(root.find(".goals_against").first().text()),
      points: parseIntSafe(root.find(".points").first().text()),
    });
  });

  let upserted = 0;
  for (const r of rows) {
    if (!r.teamName) continue;
    const clubId = await getOrCreateClub(r.teamName);

    await pool.query(
      `
        INSERT INTO standings (
          club_id, played, win, draw, loss, goals_for, goals_against, points
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8
        )
        ON CONFLICT (club_id) DO UPDATE SET
          played = EXCLUDED.played,
          win = EXCLUDED.win,
          draw = EXCLUDED.draw,
          loss = EXCLUDED.loss,
          goals_for = EXCLUDED.goals_for,
          goals_against = EXCLUDED.goals_against,
          points = EXCLUDED.points;
      `,
      [
        clubId,
        r.played,
        r.win,
        r.draw,
        r.loss,
        r.goalsFor,
        r.goalsAgainst,
        r.points,
      ],
    );
    upserted += 1;
  }

  return { found: rows.length, upserted };
}

async function scrapeTableBeSoccer(html) {
  const $ = cheerio.load(html);

  // Try to find a real HTML table that contains the "PTS" header.
  const standingsTable = $("table")
    .toArray()
    .map((el) => $(el))
    .find(($t) => {
      const text = $t.text().toUpperCase();
      return (
        text.includes("PTS") &&
        text.includes("MP") &&
        text.includes("GF") &&
        text.includes("GA")
      );
    });

  if (!standingsTable) return { found: 0, upserted: 0 };

  const headerCells = standingsTable
    .find("tr")
    .first()
    .find("th,td")
    .toArray()
    .map((c) => normalizeName($(c).text()));
  const idx = {
    pts: headerCells.findIndex((h) => h === "pts"),
    mp: headerCells.findIndex((h) => h === "mp"),
    w: headerCells.findIndex((h) => h === "w"),
    d: headerCells.findIndex((h) => h === "d"),
    l: headerCells.findIndex((h) => h === "l"),
    gf: headerCells.findIndex((h) => h === "gf"),
    ga: headerCells.findIndex((h) => h === "ga"),
  };

  const dataRows = standingsTable.find("tr").slice(1).toArray();
  const parsed = [];

  for (const tr of dataRows) {
    const $tr = $(tr);
    const teamLink = $tr.find('a[href*="/team/"]').first();
    const teamName = teamLink.length
      ? extractTeamNameFromLink($, teamLink)
      : normalizeName($tr.find("td").first().text());
    if (!teamName) continue;

    const cells = $tr
      .find("td")
      .toArray()
      .map((c) => $(c).text());

    const points =
      idx.pts >= 0 ? parseIntSafe(cells[idx.pts]) : parseIntSafe(cells[0]);
    const played =
      idx.mp >= 0 ? parseIntSafe(cells[idx.mp]) : parseIntSafe(cells[1]);
    const win = idx.w >= 0 ? parseIntSafe(cells[idx.w]) : 0;
    const draw = idx.d >= 0 ? parseIntSafe(cells[idx.d]) : 0;
    const loss = idx.l >= 0 ? parseIntSafe(cells[idx.l]) : 0;
    const goalsFor = idx.gf >= 0 ? parseIntSafe(cells[idx.gf]) : 0;
    const goalsAgainst = idx.ga >= 0 ? parseIntSafe(cells[idx.ga]) : 0;

    parsed.push({
      teamName,
      played,
      win,
      draw,
      loss,
      goalsFor,
      goalsAgainst,
      points,
    });
  }

  let upserted = 0;
  for (const r of parsed) {
    const clubId = await getOrCreateClub(r.teamName);
    await pool.query(
      `
        INSERT INTO standings (
          club_id, played, win, draw, loss, goals_for, goals_against, points
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8
        )
        ON CONFLICT (club_id) DO UPDATE SET
          played = EXCLUDED.played,
          win = EXCLUDED.win,
          draw = EXCLUDED.draw,
          loss = EXCLUDED.loss,
          goals_for = EXCLUDED.goals_for,
          goals_against = EXCLUDED.goals_against,
          points = EXCLUDED.points;
      `,
      [
        clubId,
        r.played,
        r.win,
        r.draw,
        r.loss,
        r.goalsFor,
        r.goalsAgainst,
        r.points,
      ],
    );
    upserted += 1;
  }

  return { found: parsed.length, upserted };
}

function parseScore(scoreText) {
  const raw = String(scoreText ?? "").trim();
  if (!raw) return null;
  const m = raw.match(/(\d+)\s*[-:]\s*(\d+)/);
  if (!m) return null;
  return { home: parseInt(m[1], 10), away: parseInt(m[2], 10) };
}

function parseDate(value) {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return null;
  // Normalize precision so one fixture maps to one record key.
  d.setUTCSeconds(0, 0);
  return d;
}

async function scrapeMatches(html) {
  const $ = cheerio.load(html);

  const matches = [];
  $(".home-team").each((_, el) => {
    const homeName = normalizeName($(el).text());
    const root = $(el).closest("tr").length
      ? $(el).closest("tr")
      : $(el).parent();

    const awayName = normalizeName(root.find(".away-team").first().text());
    const scoreText = root.find(".score").first().text();
    const dateText = root.find(".date").first().text();

    const score = parseScore(scoreText);
    const matchDate = parseDate(dateText);
    const status = score ? "finished" : "upcoming";

    matches.push({
      homeName,
      awayName,
      homeScore: score?.home ?? null,
      awayScore: score?.away ?? null,
      matchDate,
      status,
    });
  });

  let upserted = 0;
  for (const m of matches) {
    if (!m.homeName || !m.awayName || !m.matchDate) continue;

    const homeId = await getOrCreateClub(m.homeName);
    const awayId = await getOrCreateClub(m.awayName);

    await pool.query(
      `
        INSERT INTO matches (
          home_team_id, away_team_id, home_score, away_score, match_date, status
        ) VALUES (
          $1, $2, $3, $4, $5, $6
        )
        ON CONFLICT (home_team_id, away_team_id, match_date) DO UPDATE SET
          home_score = EXCLUDED.home_score,
          away_score = EXCLUDED.away_score,
          status = EXCLUDED.status;
      `,
      [homeId, awayId, m.homeScore, m.awayScore, m.matchDate, m.status],
    );
    upserted += 1;
  }

  return { found: matches.length, upserted };
}

async function scrapeMatchesBeSoccer(html) {
  const $ = cheerio.load(html);

  const parsed = [];

  // Heuristic: many fixtures/results are rendered as <tr> rows with 2 team links.
  $("tr").each((_, tr) => {
    const $tr = $(tr);
    const teamLinks = $tr.find('a[href*="/team/"]').toArray();
    if (teamLinks.length < 2) return;

    const homeName = extractTeamNameFromLink($, teamLinks[0]);
    const awayName = extractTeamNameFromLink($, teamLinks[1]);
    if (!homeName || !awayName) return;

    const rowText = $tr.text().replace(/\s+/g, " ").trim();
    const score = parseScore(rowText);

    const timeEl = $tr.find("time").first();
    const datetimeAttr = timeEl.attr("datetime");
    const dateCandidate =
      datetimeAttr ||
      $tr.find('[class*="date"]').first().text() ||
      $tr.find("[data-date]").first().attr("data-date") ||
      "";
    const matchDate = parseDate(dateCandidate);
    if (!matchDate) return;

    parsed.push({
      homeName,
      awayName,
      homeScore: score?.home ?? null,
      awayScore: score?.away ?? null,
      matchDate,
      status: score ? "finished" : "upcoming",
    });
  });

  // De-dupe (same match could appear multiple times in the page)
  const key = (m) => `${m.homeName}|${m.awayName}|${m.matchDate.toISOString()}`;
  const unique = Array.from(new Map(parsed.map((m) => [key(m), m])).values());

  let upserted = 0;
  for (const m of unique) {
    const homeId = await getOrCreateClub(m.homeName);
    const awayId = await getOrCreateClub(m.awayName);

    await pool.query(
      `
        INSERT INTO matches (
          home_team_id, away_team_id, home_score, away_score, match_date, status
        ) VALUES (
          $1, $2, $3, $4, $5, $6
        )
        ON CONFLICT (home_team_id, away_team_id, match_date) DO UPDATE SET
          home_score = EXCLUDED.home_score,
          away_score = EXCLUDED.away_score,
          status = EXCLUDED.status;
      `,
      [homeId, awayId, m.homeScore, m.awayScore, m.matchDate, m.status],
    );
    upserted += 1;
  }

  return { found: unique.length, upserted };
}

async function runEthiopianLeagueScrape() {
  const tableUrl =
    process.env.EPL_TABLE_URL ??
    "https://www.besoccer.com/competition/table/premier_league_ethiopia";
  const matchesUrl =
    process.env.EPL_MATCHES_URL ??
    "https://www.besoccer.com/competition/scores/premier_league_ethiopia";

  try {
    const headers = {
      "user-agent": "Mozilla/5.0 (compatible; MechalEPLScraper/1.0)",
    };
    const [tableRes, matchesRes] = await Promise.all([
      axios.get(tableUrl, { timeout: 30000, headers }),
      axios.get(matchesUrl, { timeout: 30000, headers }),
    ]);

    let table = await scrapeTable(tableRes.data);
    if (!table.found) {
      table = await scrapeTableBeSoccer(tableRes.data);
    }

    let matches = await scrapeMatches(matchesRes.data);
    if (!matches.found) {
      matches = await scrapeMatchesBeSoccer(matchesRes.data);
    }

    return { ok: true, table, matches };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export function isEplScrapeRunning() {
  return activeScrapePromise !== null;
}

export async function scrapeEthiopianLeague() {
  if (activeScrapePromise) {
    return activeScrapePromise;
  }

  activeScrapePromise = (async () => {
    try {
      return await runEthiopianLeagueScrape();
    } finally {
      activeScrapePromise = null;
    }
  })();

  return activeScrapePromise;
}
