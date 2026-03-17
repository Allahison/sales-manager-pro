# 🚀 Sales Manager Pro

Sales Manager Pro is a full-stack web application to streamline sales operations, manage customers, and track sales performance with a modern, responsive UI and a scalable API.

---

## 🔥 Highlights
- Customer & sales management (CRUD)
- Dashboard-style insights (charts/summary views)
- Modern UI components + responsive layout
- API server with typed validation and database access

---

## 🛠️ Tech Stack
- **Frontend**: React + Vite, Tailwind CSS, Radix UI
- **Backend**: Node.js (Express)
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM + Drizzle Kit
- **Monorepo**: pnpm workspaces, TypeScript

---

## 📁 Project Structure (Monorepo)
- `artifacts/sales-app/` — Frontend (Vite + React)
- `artifacts/api-server/` — Backend (Express API)
- `lib/db/` — DB schema + Drizzle config
- `lib/api-zod/`, `lib/api-client-react/`, `lib/api-spec/` — Shared libraries

---

## ⚙️ Prerequisites
- Node.js (LTS recommended)
- pnpm
- PostgreSQL (local or cloud)

---

## 🔐 Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DB_NAME
PORT=3000
Setup
pnpm install
🗄️ Database Setup (Drizzle)
pnpm -C lib/db push
▶️ Run in Development
1️⃣ Start API Server
pnpm -C artifacts/api-server dev
2️⃣ Start Frontend
pnpm -C artifacts/sales-app dev

Frontend runs on Vite dev server

API server runs on PORT (default: 3000)

📦 Build
pnpm run build
🧪 Type Checking
pnpm run typecheck
