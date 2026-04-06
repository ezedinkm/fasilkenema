import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";
import "dotenv/config";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

const statementTimeoutMs =
  parseInt(process.env.DB_STATEMENT_TIMEOUT_MS ?? "30000", 10) || 30000;

const poolConfig: pg.PoolConfig = {
  connectionString: process.env.DATABASE_URL,
  max: parseInt(process.env.DB_POOL_MAX ?? "20", 10) || 20,
  idleTimeoutMillis:
    parseInt(process.env.DB_POOL_IDLE_TIMEOUT_MS ?? "30000", 10) || 30000,
  connectionTimeoutMillis:
    parseInt(process.env.DB_POOL_CONNECT_TIMEOUT_MS ?? "10000", 10) || 10000,
};

export const pool = new Pool(poolConfig);

pool.on("connect", (client) => {
  client.query(`SET statement_timeout = ${statementTimeoutMs}`).catch((err) => {
    console.error(
      "[db] Failed to set statement_timeout on new connection:",
      err,
    );
  });
});

export const db = drizzle(pool, { schema });

// import { drizzle } from "drizzle-orm/neon-serverless";
// import { Pool, neonConfig } from "@neondatabase/serverless";
// import ws from "ws"; import * as schema from "@shared/schema";
// neonConfig.webSocketConstructor = ws;
// const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
// export const db = drizzle({ client: pool, schema });
