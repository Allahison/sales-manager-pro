import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import crypto from "node:crypto";
import pg from "pg";

const here = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(here, "../../../.env"), quiet: true });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is missing (check root .env)");
  process.exit(1);
}

function hashPassword(password) {
  return crypto
    .createHash("sha256")
    .update(password + "sales_salt_2024")
    .digest("hex");
}

const users = [
  {
    name: "Admin",
    email: "admin@store.com",
    password: "admin123",
    role: "admin",
  },
  {
    name: "John (Staff)",
    email: "john@store.com",
    password: "sales123",
    role: "salesman",
  },
];

const { Client } = pg;
const client = new Client({ connectionString });
await client.connect();

for (const u of users) {
  await client.query(
    `
    insert into users (name, email, password, role)
    values ($1, $2, $3, $4)
    on conflict (email) do update
      set name = excluded.name,
          password = excluded.password,
          role = excluded.role
    `,
    [u.name, u.email, hashPassword(u.password), u.role],
  );
}

const { rows } = await client.query(
  "select id, name, email, role, created_at from users order by id asc;",
);

console.log("Seeded users:");
for (const r of rows) {
  console.log(`${r.id}\t${r.email}\t${r.role}\t${r.name}`);
}

await client.end();

