// Applies db/migrations/*.sql in order, once each. Usage: node --env-file=.env.local scripts/migrate.mjs
import { Pool } from "@neondatabase/serverless";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set");
const pool = new Pool({ connectionString: url });
const dir = join(import.meta.dirname, "..", "db", "migrations");

await pool.query(`create table if not exists schema_migrations (name text primary key, applied_at timestamptz not null default now())`);
const { rows } = await pool.query(`select name from schema_migrations`);
const done = new Set(rows.map((r) => r.name));

for (const file of readdirSync(dir).filter((f) => f.endsWith(".sql")).sort()) {
  if (done.has(file)) continue;
  const client = await pool.connect();
  try {
    await client.query("begin");
    await client.query(readFileSync(join(dir, file), "utf8"));
    await client.query("insert into schema_migrations(name) values ($1)", [file]);
    await client.query("commit");
    console.log("applied", file);
  } catch (e) {
    await client.query("rollback");
    console.error("failed", file, e.message);
    process.exitCode = 1;
    break;
  } finally {
    client.release();
  }
}
await pool.end();
