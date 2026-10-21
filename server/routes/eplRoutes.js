import { Router } from "express";

import { pool } from "../db.ts";
import { authenticateAdminPermission } from "../middleware/authMiddleware.ts";
import { ensureLeagueSchema } from "../shared/leagueSchema.js";

const router = Router();

function toDisplayName(name) {
  return String(name ?? "")
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function normalizeClubName(name) {
  return String(name ?? "").trim().replace(/\s+/g, " ").toLowerCase();
}

function parseStandingInput(body) {
  const name = normalizeClubName(body?.name);
  if (!name || name.length > 100) {
    throw new Error("Enter a club name (up to 100 characters).");
  }

  const rawLogo = String(body?.logo ?? "").trim();
  const logo = rawLogo || null;
  if (
    logo &&
    !/^https?:\/\//i.test(logo) &&
    !/^\/uploads\/[a-zA-Z0-9._/-]+$/.test(logo)
  ) {
    throw new Error("Club logo must be an http(s) URL or an uploaded image path.");
  }

  const fields = [
    ["played", "played"],
    ["win", "win"],
    ["draw", "draw"],
    ["loss", "loss"],
    ["goalsFor", "goals_for"],
    ["goalsAgainst", "goals_against"],
    ["points", "points"],
  ];
  const values = {};
  for (const [inputName, fieldName] of fields) {
    const value = Number(body?.[inputName]);
    if (!Number.isSafeInteger(value) || value < 0) {
      throw new Error(`${inputName} must be a non-negative whole number.`);
    }
    values[fieldName] = value;
  }

  if (values.win + values.draw + values.loss > values.played) {
    throw new Error("Wins, draws, and losses cannot exceed matches played.");
  }

  return { name, logo, ...values };
}

function serializeStanding(row) {
  return {
    clubId: row.club_id,
    name: toDisplayName(row.club_name),
    logo: row.club_logo,
    played: row.played ?? 0,
    win: row.win ?? 0,
    draw: row.draw ?? 0,
    loss: row.loss ?? 0,
    goalsFor: row.goals_for ?? 0,
    goalsAgainst: row.goals_against ?? 0,
    goalDiff: (row.goals_for ?? 0) - (row.goals_against ?? 0),
    points: row.points ?? 0,
  };
}

const standingSelect = `
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
`;

router.get("/admin/epl/standings", authenticateAdminPermission("league"), async (_req, res) => {
  try {
    await ensureLeagueSchema(pool);
    const result = await pool.query(
      `${standingSelect}
       ORDER BY s.points DESC,
                (s.goals_for - s.goals_against) DESC,
                s.goals_for DESC,
                c.name ASC`,
    );
    res.json(result.rows.map(serializeStanding));
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

router.post("/admin/epl/standings", authenticateAdminPermission("league"), async (req, res) => {
  let input;
  try {
    input = parseStandingInput(req.body);
  } catch (error) {
    return res.status(400).json({
      error: error instanceof Error ? error.message : "Invalid league row.",
    });
  }

  const client = await pool.connect();
  try {
    await ensureLeagueSchema(pool);
    await client.query("BEGIN");
    const clubResult = await client.query(
      `INSERT INTO clubs (name, logo)
       VALUES ($1, $2)
       ON CONFLICT (name) DO NOTHING
       RETURNING id`,
      [input.name, input.logo],
    );
    let clubId = clubResult.rows[0]?.id;
    if (!clubId) {
      const existingClub = await client.query(
        "SELECT id FROM clubs WHERE name = $1 FOR UPDATE",
        [input.name],
      );
      clubId = existingClub.rows[0]?.id;
      if (!clubId) throw new Error("Could not find the selected club.");

      const existingStanding = await client.query(
        "SELECT 1 FROM standings WHERE club_id = $1",
        [clubId],
      );
      if (existingStanding.rows[0]) {
        await client.query("ROLLBACK");
        return res
          .status(409)
          .json({ error: "That club is already in the League Table. Edit its row instead." });
      }
      if (input.logo) {
        await client.query("UPDATE clubs SET logo = $1 WHERE id = $2", [
          input.logo,
          clubId,
        ]);
      }
    }
    await client.query(
      `INSERT INTO standings (
         club_id, played, win, draw, loss, goals_for, goals_against, points
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        clubId,
        input.played,
        input.win,
        input.draw,
        input.loss,
        input.goals_for,
        input.goals_against,
        input.points,
      ],
    );
    await client.query("COMMIT");

    const result = await pool.query(
      `${standingSelect} WHERE c.id = $1`,
      [clubId],
    );
    res.status(201).json(serializeStanding(result.rows[0]));
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    if (error?.code === "23505") {
      return res.status(409).json({ error: "That club name is already in use." });
    }
    res.status(500).json({
      error: error instanceof Error ? error.message : String(error),
    });
  } finally {
    client.release();
  }
});

router.patch(
  "/admin/epl/standings/:clubId",
  authenticateAdminPermission("league"),
  async (req, res) => {
    const clubId = Number(req.params.clubId);
    if (!Number.isSafeInteger(clubId) || clubId < 1) {
      return res.status(400).json({ error: "Invalid club ID." });
    }

    let input;
    try {
      input = parseStandingInput(req.body);
    } catch (error) {
      return res.status(400).json({
        error: error instanceof Error ? error.message : "Invalid league row.",
      });
    }

    const client = await pool.connect();
    try {
      await ensureLeagueSchema(pool);
      await client.query("BEGIN");
      const clubResult = await client.query(
        "UPDATE clubs SET name = $1, logo = $2 WHERE id = $3 RETURNING id",
        [input.name, input.logo, clubId],
      );
      if (!clubResult.rows[0]) {
        await client.query("ROLLBACK");
        return res.status(404).json({ error: "Club not found." });
      }
      await client.query(
        `INSERT INTO standings (
           club_id, played, win, draw, loss, goals_for, goals_against, points
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (club_id) DO UPDATE SET
           played = EXCLUDED.played,
           win = EXCLUDED.win,
           draw = EXCLUDED.draw,
           loss = EXCLUDED.loss,
           goals_for = EXCLUDED.goals_for,
           goals_against = EXCLUDED.goals_against,
           points = EXCLUDED.points`,
        [
          clubId,
          input.played,
          input.win,
          input.draw,
          input.loss,
          input.goals_for,
          input.goals_against,
          input.points,
        ],
      );
      await client.query("COMMIT");

      const result = await pool.query(
        `${standingSelect} WHERE c.id = $1`,
        [clubId],
      );
      res.json(serializeStanding(result.rows[0]));
    } catch (error) {
      await client.query("ROLLBACK").catch(() => {});
      if (error?.code === "23505") {
        return res
          .status(409)
          .json({ error: "That club name is already in use." });
      }
      res.status(500).json({
        error: error instanceof Error ? error.message : String(error),
      });
    } finally {
      client.release();
    }
  },
);

router.delete(
  "/admin/epl/standings/:clubId",
  authenticateAdminPermission("league"),
  async (req, res) => {
    const clubId = Number(req.params.clubId);
    if (!Number.isSafeInteger(clubId) || clubId < 1) {
      return res.status(400).json({ error: "Invalid club ID." });
    }
    try {
      await ensureLeagueSchema(pool);
      const result = await pool.query(
        "DELETE FROM standings WHERE club_id = $1 RETURNING club_id",
        [clubId],
      );
      if (!result.rows[0]) {
        return res.status(404).json({ error: "League row not found." });
      }
      res.json({
        success: true,
        message: "The standings row was removed; club and match history remain.",
      });
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : String(error),
      });
    }
  },
);

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

