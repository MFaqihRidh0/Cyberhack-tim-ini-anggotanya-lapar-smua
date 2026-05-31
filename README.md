<div align="center">

# 🍃 SimaTrack

### built by — **Tim Ini Anggotanya Lapar Smua**
#### 🏆 CyberHack 2026 · ITS Surabaya

<br/>

**Integrated raw material & production tracking system for Sima Arome**
_Indonesia's natural extract manufacturer — F&B, cosmetics, & wellness._

<br/>

![Next.js](https://img.shields.io/badge/Next.js_14-000000?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![AWS Amplify](https://img.shields.io/badge/AWS_Amplify-FF9900?style=for-the-badge&logo=awsamplify&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

**🌐 Live Demo → [main.dse5t6tuz3w2n.amplifyapp.com](https://main.dse5t6tuz3w2n.amplifyapp.com)**

</div>

---

## Table of Contents

- [Problem Statement](#problem-statement)
- [Solution Overview](#solution-overview)
- [Screenshots](#screenshots)
- [Architecture](#architecture)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Demo Accounts](#demo-accounts)
- [Deployment](#deployment)
- [Project Structure](#project-structure)
- [API Reference](#api-reference)
- [Role-Based Access Control](#role-based-access-control)
- [Security](#security)
- [Team](#team)

---

## Problem Statement

Sima Arome, an Indonesian natural extract manufacturer, relies on **paper forms and WhatsApp approvals** to manage its entire supply chain — from raw material intake to sample delivery. This approach creates:

- **No traceability** — impossible to track which batch of vanilla came from which supplier and went into which product
- **Audit failures** — paper records are lost, incomplete, or illegible
- **QC bottlenecks** — inspection results are communicated informally with no permanent record
- **Production blindspots** — PPIC has no real-time view of material availability or production queue status

---

## Solution Overview

**SimaTrack** is a full-stack manufacturing traceability platform that replaces paper-based processes with a single digital system.

> **One system, zero limits on traceability** — from raw material intake to sample dispatch.

Every kilogram of raw material that enters the factory is assigned a **lot number**, tracked through QC, scheduled for production, converted into a finished good, and traced all the way to the customer — with a complete audit trail at every step. Each lot also has a **QR code** that can be scanned on the factory floor for instant status lookup.

---

## Screenshots

> 🌐 See the full live application at **[main.dse5t6tuz3w2n.amplifyapp.com](https://main.dse5t6tuz3w2n.amplifyapp.com)**

Login with any of the [Demo Accounts](#demo-accounts) to explore all features. The Manager account provides full access to every module including Master Data and Sample Dispatch.

---

## Architecture

SimaTrack uses a **Next.js-first architecture**. All production API calls go through Next.js Route Handlers (`frontend/app/api/*`), which connect directly to Supabase (PostgreSQL). An Express.js backend in `backend/` exists as a reference implementation.

```
Browser
  │
  ▼
Next.js 14 (App Router)          ← frontend/
  ├── app/(dashboard)/*          ← React UI pages
  ├── app/api/*                  ← API Route Handlers (server-side)
  │     └── Supabase (PostgreSQL) ← direct DB access via service role key
  └── middleware.js              ← route protection

Express.js + Prisma              ← backend/  (reference/backup)
  └── PostgreSQL (same DB)
```

### Raw Material Lot Status Flow
```
INCOMING → QC_PENDING → QC_APPROVED → IN_QUEUE → IN_PRODUCTION → CONSUMED
                     └─▶ QC_REJECTED                    (ON_HOLD at any time)
```

### Finished Goods Lot Status Flow
```
PRODUCED → QC_PENDING → QC_APPROVED → IN_WAREHOUSE → PARTIALLY_DISPATCHED → FULLY_DISPATCHED
                     └─▶ QC_REJECTED                       (ON_HOLD at any time)
```

### Production Order Status Flow
```
QUEUED → SCHEDULED → IN_PROGRESS → COMPLETED   (CANCELLED at any time)
```

### Delivery Order Status Flow
```
INCOMING → RECEIVED
```

---

## Features

| Module | Description |
|--------|-------------|
| 📊 **Dashboard** | Real-time summary of all factory operations — active lots, QC pending, recent activity. |
| 📥 **Delivery Orders** | Record incoming shipments from suppliers. Each item automatically creates a Raw Material Lot with `INCOMING` status. |
| 📦 **Raw Material Lots** | Track every raw material batch — internal lot number, remaining qty, expiry date, status history, and QR code. |
| 🔬 **QC Inspections** | Quality inspection (color, aroma, texture, moisture) for raw materials and finished goods. Results: Approved / Rejected / On Hold. |
| 🏭 **Production Orders** | Manage the production queue — scheduling, raw material consumption, and finished goods output. |
| 🏬 **Finished Goods** | Track finished products in the warehouse — storage zone & position, status history, and QR code. |
| 🚚 **Sample Dispatch** | Send samples to customers (domestic & export), with tracking number and delivery confirmation. |
| 🧾 **Master Data** | Manage Supplier, Material, and Product records. |
| 📱 **QR Code** | Generate & scan QR codes on every lot for fast field tracking. All roles can view QR; download & print label available to OPERATOR and MANAGER only. |
| 🔐 **RBAC** | 4 roles with distinct access levels — each person only sees and modifies what belongs to their responsibility. |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 14 (App Router), React, Tailwind CSS, @tanstack/react-query, react-hot-toast |
| **API Routes** | Next.js Route Handlers (`frontend/app/api/*`) → Supabase (snake_case, production path) |
| **Backend** | Express.js + Prisma ORM (backup/reference, port 3001) |
| **Database** | PostgreSQL via Supabase |
| **Authentication** | JWT (jsonwebtoken) + bcryptjs |
| **QR Code** | `qrcode` npm package — 400px PNG, brand colors |
| **Deployment** | AWS Amplify |

---

## Getting Started

The project has two main folders: `frontend/` (Next.js) and `backend/` (Express).

```bash
# Clone the repository
git clone https://github.com/MFaqihRidh0/Cyberhack-tim-ini-anggotanya-lapar-smua.git
cd Cyberhack-tim-ini-anggotanya-lapar-smua
```

**1️⃣ Run Frontend (Next.js)**
```bash
cd frontend
npm install
npm run dev          # runs at http://localhost:3000
```

**2️⃣ Run Backend** *(optional — only needed if Next.js API routes are unavailable)*
```bash
cd backend
npm install
npx prisma generate
node src/index.js    # runs at http://localhost:3001
```

Open **http://localhost:3000** 🎉

### Troubleshooting

**Changes not appearing after restart:**
```powershell
# Windows (PowerShell) — kill ports and clear Next.js cache
@(3000,3001,3002,3003) | ForEach-Object {
  $p = (Get-NetTCPConnection -LocalPort $_ -ErrorAction SilentlyContinue).OwningProcess
  if ($p) { Stop-Process -Id $p -Force }
}
Remove-Item -Recurse -Force frontend\.next -ErrorAction SilentlyContinue
cd frontend && npm run dev
```

```bash
# macOS / Linux
rm -rf frontend/.next && cd frontend && npm run dev
```

**After `git pull` from a teammate:**
```powershell
git pull origin main
cd frontend; npm install; cd ..
cd backend; npm install; cd ..
Remove-Item -Recurse -Force frontend\.next -ErrorAction SilentlyContinue
cd frontend; npm run dev
```

> ⚠️ **General rule:** If the UI looks broken (blank page, layout error, chunk error) — always try **deleting `.next`** before reporting a bug.

---

## Environment Variables

### Frontend (`frontend/.env.local`)

| Variable | Value | Description |
|----------|-------|-------------|
| `NEXT_PUBLIC_API_URL` | `/api` | Base URL for API calls. Use `/api` to route through Next.js handlers (Supabase). Set to `http://localhost:3001/api` only if running against the Express backend. |

> The Supabase URL and service role key are currently embedded as fallbacks in `frontend/lib/server/db.js`. For production, move them to environment variables.

### Backend (`backend/.env`)

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string (Supabase) |
| `JWT_SECRET` | Secret key for signing JWT tokens |
| `PORT` | Server port (default: 3001) |

---

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| 🟠 **Operator** | `operator@sima.com` | `SimaArome@2026` |
| 🟢 **QC Staff** | `qc@sima.com` | `SimaArome@2026` |
| 🔵 **PPIC** | `ppic@sima.com` | `SimaArome@2026` |
| 🟣 **Manager** | `manager@sima.com` | `SimaArome@2026` |

> 💡 Log in as **Manager** to access all features including Master Data and Sample Dispatch.

---

## Deployment

SimaTrack is deployed on **AWS Amplify** with automatic CI/CD from the `main` branch.

**Live URL:** [main.dse5t6tuz3w2n.amplifyapp.com](https://main.dse5t6tuz3w2n.amplifyapp.com)

The `amplify.yml` at the project root configures the build:

```yaml
version: 1
applications:
  - frontend:
      phases:
        preBuild:
          commands:
            - npm install
        build:
          commands:
            - npm run build
      artifacts:
        baseDirectory: .next
        files:
          - '**/*'
      cache:
        paths:
          - node_modules/**
          - .next/cache/**
    appRoot: frontend
```

Every push to `main` triggers a new Amplify build automatically. The Express backend is not deployed — all production API calls go through Next.js Route Handlers.

---

## Project Structure

```
.
├── frontend/                      ← Next.js app (cd frontend && npm run dev)
│   ├── app/
│   │   ├── (auth)/
│   │   │   └── login/             ← Login page
│   │   ├── (dashboard)/           ← All dashboard pages
│   │   │   ├── layout.jsx
│   │   │   ├── dashboard/         ← Operations summary
│   │   │   ├── delivery-orders/   ← Shipment intake (list, new, [id])
│   │   │   ├── raw-lots/          ← Raw material tracking (list, new, [id])
│   │   │   ├── qc/                ← QC inspections
│   │   │   ├── production/        ← Production orders (list, new, [id])
│   │   │   ├── finished-goods/    ← Finished goods (list, [id])
│   │   │   ├── dispatch/          ← Sample dispatch (list, new, [id])
│   │   │   ├── master/            ← Master data (suppliers, materials, products)
│   │   │   └── scan/              ← QR code scanner (all roles)
│   │   └── api/                   ← Next.js API routes → Supabase
│   │       ├── auth/              ← login, me
│   │       ├── delivery-orders/   ← CRUD + [id]/receive
│   │       ├── raw-lots/          ← CRUD + [id]/status, [id]/qr
│   │       ├── qc-inspections/    ← CRUD
│   │       ├── production-orders/ ← CRUD + [id]/inputs
│   │       ├── finished-lots/     ← CRUD + [id]/status, [id]/warehouse, [id]/qr
│   │       ├── sample-dispatches/ ← CRUD + [id]/confirm
│   │       ├── materials/         ← Master data
│   │       ├── products/          ← Master data
│   │       ├── suppliers/         ← Master data
│   │       ├── dashboard/summary/ ← Dashboard summary
│   │       ├── traceability/      ← Lot traceability
│   │       └── audit-log/         ← Activity log
│   ├── components/
│   │   ├── layout/                ← Sidebar, Navbar
│   │   ├── lots/                  ← LotTimeline, QRDisplay
│   │   └── shared/                ← StatusBadge, StatusSelect
│   ├── lib/
│   │   ├── api.js                 ← Axios client with JWT interceptor
│   │   ├── auth.js                ← Client-side auth helpers
│   │   ├── utils.js               ← formatDate, formatNumber, etc.
│   │   └── server/                ← Server-only: db, auth, audit, lotNumber
│   ├── prisma/
│   │   ├── schema.prisma          ← Database schema (Supabase)
│   │   └── seed.js                ← Seed data
│   ├── package.json
│   ├── next.config.mjs
│   ├── tailwind.config.js
│   └── middleware.js
│
├── backend/                       ← Express.js API (cd backend && node src/index.js)
│   ├── src/
│   │   ├── controllers/           ← Module logic
│   │   ├── routes/                ← Endpoint definitions
│   │   ├── middleware/            ← Auth & RBAC
│   │   └── utils/                 ← prisma, lotNumber, qrcode
│   └── prisma/
│       ├── schema.prisma          ← Database schema
│       └── seed.js                ← Seed data (demo accounts, suppliers, etc.)
│
├── LICENSE
├── amplify.yml                    ← AWS Amplify build config
└── README.md
```

---

## API Reference

All API routes are Next.js Route Handlers under `frontend/app/api/`. Authentication is required for all endpoints via `Authorization: Bearer <token>` header.

### Authentication

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/login` | Public | Login with email & password. Returns JWT token. |
| `GET` | `/api/auth/me` | All | Get current authenticated user. |

### Raw Material Lots

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| `GET` | `/api/raw-lots` | All | List all raw material lots. |
| `POST` | `/api/raw-lots` | OPERATOR, MANAGER | Create a new raw material lot. |
| `GET` | `/api/raw-lots/:id` | All | Get lot detail with stages & QC history. |
| `PATCH` | `/api/raw-lots/:id/status` | All | Update lot status. |
| `GET` | `/api/raw-lots/:id/qr` | All | Generate QR code image (PNG). |

### Delivery Orders

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| `GET` | `/api/delivery-orders` | All | List all delivery orders. |
| `POST` | `/api/delivery-orders` | OPERATOR, MANAGER | Create a delivery order (auto-creates raw lots). |
| `GET` | `/api/delivery-orders/:id` | All | Get delivery order detail. |
| `PATCH` | `/api/delivery-orders/:id/receive` | OPERATOR, MANAGER | Mark delivery as received. |

### Finished Goods Lots

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| `GET` | `/api/finished-lots` | All | List all finished goods lots. |
| `GET` | `/api/finished-lots/:id` | All | Get lot detail. |
| `PATCH` | `/api/finished-lots/:id/status` | OPERATOR, QC_STAFF, MANAGER | Update lot status. |
| `PATCH` | `/api/finished-lots/:id/warehouse` | OPERATOR, MANAGER | Set warehouse zone & position. |
| `GET` | `/api/finished-lots/:id/qr` | All | Generate QR code image (PNG). |

### QC Inspections

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| `GET` | `/api/qc-inspections` | All | List all QC inspections. |
| `POST` | `/api/qc-inspections` | QC_STAFF, MANAGER | Submit a QC inspection result. |

### Production Orders

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| `GET` | `/api/production-orders` | All | List all production orders. |
| `POST` | `/api/production-orders` | PPIC, MANAGER | Create a production order. |
| `GET` | `/api/production-orders/:id` | All | Get production order detail. |
| `PATCH` | `/api/production-orders/:id` | PPIC, MANAGER | Update production order status. |

### Sample Dispatches

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| `GET` | `/api/sample-dispatches` | All | List all sample dispatches. |
| `POST` | `/api/sample-dispatches` | MANAGER | Create a sample dispatch. |
| `PATCH` | `/api/sample-dispatches/:id/confirm` | All | Confirm delivery received by customer. |

### Master Data

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| `GET/POST` | `/api/materials` | GET: All · POST: MANAGER | List or create materials. |
| `GET/POST` | `/api/products` | GET: All · POST: MANAGER | List or create products. |
| `GET/POST` | `/api/suppliers` | GET: All · POST: MANAGER | List or create suppliers. |

---

## Role-Based Access Control

Every user has one role, and each role gets a specific set of menus and permissions.

> **All roles** have access to **Dashboard** and **Scan QR**.

### 🟠 OPERATOR — Warehouse

**Menu:** Delivery Orders · Raw Materials · Finished Goods

| Action | Access |
|--------|--------|
| Create & receive Delivery Orders | ✅ |
| Update Raw Material Lot status | ✅ |
| Update Finished Goods Lot status | ✅ |
| Set warehouse location for finished goods | ✅ |
| **Download & print QR label** | ✅ |

### 🟢 QC_STAFF — Quality Control

**Menu:** QC Inspections · Raw Materials · Finished Goods

| Action | Access |
|--------|--------|
| Submit QC inspections (color, aroma, texture, moisture) | ✅ |
| Approve or reject lots (`QC_PENDING → QC_APPROVED / QC_REJECTED`) | ✅ |
| Update Raw Material Lot status | ✅ |
| Update Finished Goods Lot status | ✅ |

### 🔵 PPIC — Production Planning & Inventory Control

**Menu:** Production Orders · Raw Materials · Finished Goods

| Action | Access |
|--------|--------|
| Create & manage Production Orders | ✅ |
| Advance production status (`QUEUED → SCHEDULED → IN_PROGRESS → COMPLETED`) | ✅ |
| Update Raw Material Lot status | ✅ |

### 🟣 MANAGER — Full Access

**Menu:** All menus from above + Sample Dispatch + Master Data

| Action | Access |
|--------|--------|
| All OPERATOR, QC_STAFF, and PPIC actions | ✅ |
| **Download & print QR label** | ✅ |
| Create Sample Dispatches to customers | ✅ (exclusive) |
| Manage Master Data (Suppliers, Materials, Products) | ✅ (exclusive) |

> 🔒 **Read-only by default:** Users without update permission can still **view** all statuses, but the update dropdown is disabled.

---

## Security

- **Authentication:** All API routes require a valid JWT token passed via `Authorization: Bearer <token>` header. Tokens expire after 8 hours.
- **Password hashing:** User passwords are hashed with `bcryptjs` before storage. Plain-text passwords are never persisted.
- **Role enforcement:** Every write endpoint checks the user's role server-side using `checkRole()`. Frontend UI restrictions are secondary — the API is the source of truth.
- **Row-Level Security:** Supabase RLS is enabled on all tables via migrations.
- **Environment secrets:** The Supabase service role key and JWT secret are kept out of version control via `.gitignore` (`.env*.local`, `backend/.env`).

---

## Team

| Name | NRP |
|------|-----|
| Ahmad Wildan Fawwaz | 5027241001 |
| Hanif Mawla Faizi | 5027241064 |
| Yasykur Khalis Jati Maulana Yuwono | 5027241112 |
| M. Faqih Ridho | 5027241123 |

---

## License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for full details.

Copyright © 2026 Tim Ini Anggotanya Lapar Smua

<div align="center">

<br/>

**Built with 🍃 for CyberHack 2026 · ITS Surabaya**

</div>
