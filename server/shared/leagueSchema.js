export async function initializeLeagueSchema(pool) {
  // If a previous attempt created SERIAL sequences without creating tables
  // (e.g., crash during migration), Postgres can error on CREATE TABLE because
  // the default SERIAL sequence name already exists. This guard makes init
  // idempotent for those cases.
  await pool.query(`
    DO $$
    BEGIN
      IF to_regclass('public.clubs') IS NULL AND to_regclass('public.clubs_id_seq') IS NOT NULL THEN
        EXECUTE 'DROP SEQUENCE public.clubs_id_seq';
      END IF;
      IF to_regclass('public.standings') IS NULL AND to_regclass('public.standings_id_seq') IS NOT NULL THEN
        EXECUTE 'DROP SEQUENCE public.standings_id_seq';
      END IF;
      IF to_regclass('public.matches') IS NULL AND to_regclass('public.matches_id_seq') IS NOT NULL THEN
        EXECUTE 'DROP SEQUENCE public.matches_id_seq';
      END IF;
    END
    $$;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS clubs (
      id SERIAL PRIMARY KEY,
      name TEXT UNIQUE,
      logo TEXT
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS standings (
      id SERIAL PRIMARY KEY,
      club_id INT REFERENCES clubs(id),
      played INT,
      win INT,
      draw INT,
      loss INT,
      goals_for INT,
      goals_against INT,
      points INT,
      UNIQUE (club_id)
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS matches (
      id SERIAL PRIMARY KEY,
      home_team_id INT REFERENCES clubs(id),
      away_team_id INT REFERENCES clubs(id),
      home_score INT,
      away_score INT,
      match_date TIMESTAMP,
      status TEXT,
      UNIQUE (home_team_id, away_team_id, match_date)
    );
  `);
}

let schemaReadyPromise = null;

export async function ensureLeagueSchema(pool) {
  if (!schemaReadyPromise) {
    schemaReadyPromise = initializeLeagueSchema(pool).catch((error) => {
      schemaReadyPromise = null;
      throw error;
    });
  }
  return schemaReadyPromise;
}

