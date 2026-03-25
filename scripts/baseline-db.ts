/**
 * Marks all migrations in drizzle/meta/_journal.json as already applied
 * in the target database WITHOUT running the SQL.
 *
 * Use this once when adopting Drizzle migrations on a DB that was set up
 * via push or manual SQL (i.e. the schema already exists).
 *
 * Usage:
 *   bun scripts/baseline-db.ts           # dev DB (DATABASE_URL_DEV)
 *   bun scripts/baseline-db.ts --prod    # prod DB (DATABASE_URL)
 */

import { readFileSync } from "fs";
import pg from "pg";

const isProd = process.argv.includes("--prod");
const connectionString = isProd ? process.env.DATABASE_URL : process.env.DATABASE_URL_DEV;

if (!connectionString) {
  console.error(`Missing env var: ${isProd ? "DATABASE_URL" : "DATABASE_URL_DEV"}`);
  process.exit(1);
}

const journal = JSON.parse(readFileSync("drizzle/meta/_journal.json", "utf-8")) as {
  entries: { idx: number; tag: string; when: number }[];
};

const client = new pg.Client({ connectionString });
await client.connect();

await client.query(`
  CREATE TABLE IF NOT EXISTS "__drizzle_migrations" (
    id        SERIAL PRIMARY KEY,
    hash      TEXT   NOT NULL,
    created_at BIGINT
  )
`);

for (const entry of journal.entries) {
  const { rows } = await client.query(
    `SELECT id FROM "__drizzle_migrations" WHERE hash = $1`,
    [entry.tag],
  );
  if (rows.length > 0) {
    console.log(`  already applied: ${entry.tag}`);
  } else {
    await client.query(
      `INSERT INTO "__drizzle_migrations" (hash, created_at) VALUES ($1, $2)`,
      [entry.tag, entry.when],
    );
    console.log(`  baselined: ${entry.tag}`);
  }
}

await client.end();
console.log(`\nDone (${isProd ? "prod" : "dev"}).`);
