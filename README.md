# Sales Management System (NEXUS Enterprise POS)

## Overview

A full-stack, production-ready Sales Management Web Application (POS system) for retail stores. Built with React + Vite frontend and Express + PostgreSQL backend in a pnpm monorepo.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React, Vite, Tailwind CSS, shadcn/ui, Recharts, Framer Motion
- **Backend**: Express 5, Node.js
- **Database**: PostgreSQL + Drizzle ORM
- **Auth**: Token-based (stored in localStorage, sent as Bearer header)
- **Validation**: Zod, drizzle-zod
- **API codegen**: Orval (from OpenAPI spec)
- **State management**: React Query (@tanstack/react-query)

## Default Login Credentials

- **Admin**: admin@store.com / admin123
- **Staff**: john@store.com / sales123

## Structure

```text
artifacts/
  api-server/          # Express API server (port 8080, served at /api)
  sales-app/           # React + Vite frontend (served at /)
lib/
  api-spec/            # OpenAPI spec + Orval codegen config
  api-client-react/    # Generated React Query hooks (+ token injection in custom-fetch.ts)
  api-zod/             # Generated Zod schemas
  db/                  # Drizzle ORM schema + DB connection
scripts/
  src/seed.ts          # Database seed script
```

## Features

- **Authentication**: Role-based auth (Admin / Salesman), token stored in localStorage
- **Dashboard**: KPI stats, 7-day sales chart, recent orders, low stock alerts
- **Products**: Full CRUD, category filter, search, stock management
- **POS/Sales**: Product search, cart, discounts, checkout, receipt
- **Customers**: Full CRUD, purchase history
- **Orders**: Sales history, order details, refunds (admin)
- **Inventory**: Stock levels, low stock alerts, quick updates
- **Reports**: Sales charts (daily/monthly), top products, profit analysis
- **Expenses**: Expense tracking (rent, utilities, salaries, etc.)
- **Settings**: Store name, currency, tax %, low stock threshold (admin only)
- **User Management**: Add/edit/delete staff (admin only)

## Database Schema

Tables: `users`, `products`, `customers`, `orders`, `order_items`, `expenses`, `settings`, `sessions`

## Key Files

- `artifacts/sales-app/src/App.tsx` — Router + auth guards
- `artifacts/sales-app/src/hooks/use-auth.tsx` — Auth context
- `artifacts/sales-app/src/pages/` — All pages
- `artifacts/api-server/src/routes/` — API route handlers
- `lib/db/src/schema/` — Database table definitions
- `lib/api-spec/openapi.yaml` — OpenAPI contract

## Commands

- `pnpm --filter @workspace/db run push` — Push DB schema
- `pnpm --filter @workspace/scripts run seed` — Seed database
- `pnpm --filter @workspace/api-spec run codegen` — Regenerate API client
- `pnpm --filter @workspace/api-server run dev`— Backend (API server)
- `pnpm --filter @workspace/sales-app run dev`— Frontend (Vite)

## Commands

## 🚀 Deployment

This project is deployed and live at:

🔗 **Live Demo:** sales-manager-pro-henna.vercel.app

### 📦 Deployment Platform
- Vercel
- Render

