import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const here = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(here, "../../../.env"), quiet: true });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is missing (check root .env)");
  process.exit(1);
}

const { Client } = pg;

const client = new Client({ connectionString });
await client.connect();

const { rows } = await client.query(
  "select tablename from pg_tables where schemaname='public' order by tablename;",
);

if (rows.length === 0) {
  console.log("(no public tables found)");
} else {
  for (const r of rows) console.log(r.tablename);
}

await client.end();
