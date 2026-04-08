import { Router } from "express";

import { pool } from "../db.ts";
import { ensureLeagueSchema } from "../shared/leagueSchema.js";

const router = Router();

function toDisplayName(name) {
  return String(name ?? "")
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

router.get("/epl", async (_req, res) => {
  try {
    await ensureLeagueSchema(pool);

    const standingsResult = await pool.query(
      `
        SELECT
          s.played,
          s.win,
          s.draw,
          s.loss,
          s.goals_for,
          s.goals_against,
          s.points,
          c.id AS club_id,
          c.name AS club_name,
          c.logo AS club_logo
        FROM standings s
        JOIN clubs c ON c.id = s.club_id
        ORDER BY
          s.points DESC,
          (s.goals_for - s.goals_against) DESC,
          s.goals_for DESC,
          c.name ASC;
      `,
    );

    const matchesResult = await pool.query(
      `
        SELECT
          m.home_score,
          m.away_score,
          m.match_date,
          m.status,
          hc.id AS home_team_id,
          hc.name AS home_team_name,
          hc.logo AS home_team_logo,
          ac.id AS away_team_id,
          ac.name AS away_team_name,
          ac.logo AS away_team_logo
        FROM matches m
        JOIN clubs hc ON hc.id = m.home_team_id
        JOIN clubs ac ON ac.id = m.away_team_id
        ORDER BY m.match_date DESC;
      `,
    );

    const standings = standingsResult.rows.map((r) => ({
      clubId: r.club_id,
      name: toDisplayName(r.club_name),
      logo: r.club_logo,
      played: r.played,
      win: r.win,
      draw: r.draw,
      loss: r.loss,
      goalsFor: r.goals_for,
      goalsAgainst: r.goals_against,
      goalDiff: (r.goals_for ?? 0) - (r.goals_against ?? 0),
      points: r.points,
    }));

    const matches = matchesResult.rows.map((r) => ({
      homeTeam: {
        id: r.home_team_id,
        name: toDisplayName(r.home_team_name),
        logo: r.home_team_logo,
      },
      awayTeam: {
        id: r.away_team_id,
        name: toDisplayName(r.away_team_name),
        logo: r.away_team_logo,
      },
      homeScore: r.home_score,
      awayScore: r.away_score,
      matchDate: r.match_date,
      status: r.status,
    }));

    const finished = matches
      .filter((m) => m.status === "finished")
      .sort((a, b) => new Date(b.matchDate).getTime() - new Date(a.matchDate).getTime());
    const upcoming = matches
      .filter((m) => m.status === "upcoming")
      .sort((a, b) => new Date(a.matchDate).getTime() - new Date(b.matchDate).getTime());

    res.json({
      ok: true,
      standings,
      matches,
      finished,
      upcoming,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

export default router;

