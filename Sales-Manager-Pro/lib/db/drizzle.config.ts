import { defineConfig } from "drizzle-kit";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));

// Load monorepo root .env for DATABASE_URL
dotenv.config({ path: path.resolve(here, "../../.env"), quiet: true });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

export default defineConfig({
  // Use a relative path; absolute Windows paths can confuse schema discovery.
  schema: "./src/schema/index.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
