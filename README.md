# SimaTrack — Sima Arome Tracking System

Sistem terpadu pelacakan bahan baku dan produksi untuk **Sima Arome** — produsen ekstrak natural Indonesia (F&B, kosmetik, wellness).

> 🏆 CyberHack 2026 — ITS Surabaya

## 🌐 Live Demo

**App:** https://main.dse5t6tuz3w2n.amplifyapp.com

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router) + Tailwind CSS |
| Backend | Next.js API Routes + Prisma ORM |
| Database | Supabase (PostgreSQL) via Buildpad |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Deploy | AWS Amplify |

## 📦 Fitur Utama

- **Delivery Order** — Catat penerimaan bahan baku dari supplier
- **Raw Material Lot Tracking** — Lacak setiap lot bahan baku dari masuk hingga habis
- **QC Inspection** — Inspeksi kualitas bahan baku dan produk jadi
- **Production Order** — Kelola antrian dan proses produksi
- **Finished Goods** — Lacak produk jadi di gudang
- **Sample Dispatch** — Kirim sampel ke customer (lokal & ekspor)
- **QR Code** — Generate & scan QR untuk setiap lot
- **Dashboard** — Ringkasan real-time seluruh operasi
- **RBAC** — 4 role dengan akses berbeda (Operator, QC Staff, PPIC, Manager)

## 🚀 Cara Install Lokal

```bash
# Clone repository
git clone https://github.com/MFaqihRidh0/Cyberhack-tim-ini-anggotanya-lapar-smua.git
cd Cyberhack-tim-ini-anggotanya-lapar-smua/frontend

# Install dependencies
npm install

# Setup environment (buat file .env.local)
cp .env.local.example .env.local
# Edit .env.local dengan credentials database

# Generate Prisma client
npx prisma generate

# Jalankan development server
npm run dev
```

Buka http://localhost:3000

## 🔐 Test Credentials

| Role | Email | Password |
|------|-------|----------|
| OPERATOR | operator@sima.com | password123 |
| QC_STAFF | qc@sima.com | password123 |
| PPIC | ppic@sima.com | password123 |
| MANAGER | manager@sima.com | password123 |

## 🔄 Alur Data

```
Supplier → Delivery Order → Raw Material Lot → QC Inspection
    → Production Order → Finished Goods Lot → QC → Warehouse → Dispatch
```

## 📁 Struktur Project

```
├── frontend/           ← Next.js App (Frontend + API Routes)
│   ├── app/
│   │   ├── (auth)/     ← Login page
│   │   ├── (dashboard)/ ← All dashboard pages
│   │   └── api/        ← Backend API routes
│   ├── components/     ← React components
│   ├── lib/            ← Utilities & server-side logic
│   └── prisma/         ← Database schema & migrations
├── backend/            ← Express.js backend (legacy, for reference)
├── CONTEXT.md          ← Master context file
└── amplify.yml         ← AWS Amplify build config
```

## 👥 Tim

**Tim Ini Anggotanya Lapar Smua** — CyberHack 2026
| Nama | NRP |
|------|-------|
| Ahmad Wildan Fawwaz | 5027241001 |
| Hanif Mawla Faizi | 5027241064 |  |
| Yasykur Khalis Jati Maulana Yuwono | 5027241112 |
| M. Faqih Ridho | 5027241123 |
