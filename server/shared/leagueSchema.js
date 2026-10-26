let schemaReadyPromise = null;

export async function ensureLeagueSchema(pool) {
  if (!schemaReadyPromise) {
    schemaReadyPromise = pool
      .query(
        `SELECT
           to_regclass('public.clubs') IS NOT NULL AS clubs_exists,
           to_regclass('public.standings') IS NOT NULL AS standings_exists,
           to_regclass('public.matches') IS NOT NULL AS matches_exists`,
      )
      .then(({ rows }) => {
        const tables = rows[0];
        if (
          !tables?.clubs_exists ||
          !tables?.standings_exists ||
          !tables?.matches_exists
        ) {
          throw new Error(
            "League tables are unavailable. Apply the pending schema through the normal Publish flow.",
          );
        }
      })
      .catch((error) => {
        schemaReadyPromise = null;
        throw error;
      });
  }
  return schemaReadyPromise;
}

