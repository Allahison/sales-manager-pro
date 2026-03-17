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

const cols = await client.query(
  "select column_name, data_type from information_schema.columns where table_schema='public' and table_name='users' order by ordinal_position;",
);
console.log("users columns:");
for (const c of cols.rows) console.log(`- ${c.column_name}: ${c.data_type}`);

const rows = await client.query(
  "select id, name, email, role, created_at from users order by id asc limit 10;",
);
console.log("\nusers sample rows:");
for (const r of rows.rows) console.log(r);

await client.end();

