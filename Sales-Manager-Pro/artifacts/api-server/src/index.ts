// 🔥 MUST BE FIRST: load monorepo root .env (pnpm --filter runs with package cwd)
import dotenv from "dotenv";
import path from "node:path";

dotenv.config({
  // `pnpm --filter @workspace/api-server run dev` runs with cwd = artifacts/api-server
  // so the monorepo root .env is at ../../.env from here.
  path: path.resolve(process.cwd(), "../../.env"),
  override: true,
  quiet: true,
});

import app from "./app";

// ===== Environment Validation =====

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("❌ DATABASE_URL is not defined in .env file");
}

const rawPort = process.env.PORT;

// Default port fallback
const port = rawPort ? Number(rawPort) : 3000;

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`❌ Invalid PORT value: "${rawPort}"`);
}

// ===== Server Start =====

app.listen(port, () => {
  console.log("=================================");
  console.log("🚀 Server Started Successfully");
  console.log(`📡 Port: ${port}`);
  console.log("=================================");
});