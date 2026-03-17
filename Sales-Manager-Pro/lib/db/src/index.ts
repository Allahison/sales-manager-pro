import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";
import dotenv from "dotenv";
import path from "node:path";

const { Pool } = pg;

export function createDb(connectionString: string) {
  const pool = new Pool({
    connectionString,
  });

  return drizzle(pool, { schema });
}

let _db: ReturnType<typeof createDb> | null = null;

function ensureEnvLoaded() {
  if (process.env.DATABASE_URL) return;

  const cwd = process.cwd();
  const candidates = [
    path.resolve(cwd, ".env"),
    path.resolve(cwd, "../../.env"),
    path.resolve(cwd, "../../../.env"),
  ];

  for (const envPath of candidates) {
    const result = dotenv.config({ path: envPath, quiet: true, override: true });
    if (!result.error && process.env.DATABASE_URL) return;
  }
}

export function getDb() {
  if (_db) return _db;
  ensureEnvLoaded();
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      'DATABASE_URL is not set. Create a ".env" file at the workspace root and set DATABASE_URL.'
    );
  }
  _db = createDb(connectionString);
  return _db;
}

export const db = getDb();

export * from "./schema";