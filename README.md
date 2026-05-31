<div align="center">

# 🍃 SimaTrack

### dibuat oleh — **Tim Ini Anggotanya Lapar Smua**
#### 🏆 CyberHack 2026 · ITS Surabaya

<br/>

**Sistem terpadu pelacakan bahan baku & produksi untuk Sima Arome**
_Produsen ekstrak natural Indonesia — F&B, kosmetik, & wellness._

<br/>

![Next.js](https://img.shields.io/badge/Next.js_14-000000?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![AWS Amplify](https://img.shields.io/badge/AWS_Amplify-FF9900?style=for-the-badge&logo=awsamplify&logoColor=white)

**🌐 Live Demo → [main.dse5t6tuz3w2n.amplifyapp.com](https://main.dse5t6tuz3w2n.amplifyapp.com)**

</div>

---

## 📖 Tentang Project

**SimaTrack** menjawab satu masalah inti di pabrik ekstrak natural: **ketertelusuran (traceability)**.

Setiap kilogram bahan baku yang masuk dari supplier harus bisa dilacak — dari gerbang penerimaan, lolos QC, masuk antrian produksi, diolah menjadi produk jadi, sampai akhirnya sampel dikirim ke customer lokal maupun ekspor. Tanpa sistem, semua ini berjalan lewat **form kertas dan approval WhatsApp** yang mudah hilang dan sulit diaudit.

SimaTrack menggantikan itu dengan satu platform digital:

> **Satu sistem, tanpa batas ketertelusuran** — dari penerimaan bahan baku sampai pengiriman sampel.

---

## ✨ Apa yang Bisa Dilakukan

| Modul | Fungsi |
|-------|--------|
| 📊 **Dashboard** | Ringkasan real-time seluruh operasi pabrik — jumlah lot aktif, QC pending, aktivitas terbaru. |
| 📥 **Delivery Order** | Catat penerimaan kiriman bahan baku dari supplier. Setiap item otomatis membuat *Raw Material Lot* berstatus `INCOMING`. |
| 📦 **Raw Material Lot** | Lacak setiap lot bahan baku — nomor lot internal, qty sisa, tanggal kadaluarsa, riwayat status, dan QR code. |
| 🔬 **QC Inspection** | Inspeksi mutu (warna, aroma, tekstur, kadar air) untuk bahan baku **dan** produk jadi. Hasil: Approved / Rejected / On Hold. |
| 🏭 **Production Order** | Kelola antrian & proses produksi — penjadwalan, pemakaian bahan baku, hingga output produk jadi. |
| 🏬 **Finished Goods** | Lacak produk jadi — zona & posisi gudang, riwayat status, dan QR code. |
| 🚚 **Sample Dispatch** | Kirim sampel ke customer (lokal & ekspor), lengkap dengan nomor resi & konfirmasi penerimaan. |
| 🧾 **Master Data** | Kelola data master Supplier, Material, dan Product. |
| 📱 **QR Code** | Generate & scan QR di tiap lot untuk pelacakan cepat di lapangan. Semua role bisa melihat QR; download & cetak label khusus OPERATOR. |
| 🔐 **RBAC** | 4 peran dengan hak akses berbeda — tiap orang hanya melihat & mengubah apa yang menjadi tanggung jawabnya. |

---

## 👤 Peran & Hak Akses (RBAC)

Setiap pengguna punya peran, dan tiap peran mendapat menu serta wewenang yang berbeda.

> **Semua role** mendapat akses ke **Dashboard** dan **Scan QR**.

### 🟠 OPERATOR — Gudang
Menjaga gerbang masuk & keluar barang fisik.

**Menu:** Delivery Orders · Raw Materials · Finished Goods

| Aksi | Wewenang |
|------|----------|
| Buat Delivery Order | ✅ |
| Terima Delivery Order (`INCOMING → RECEIVED`) | ✅ |
| Update status Raw Material Lot | ✅ |
| Update status Finished Goods Lot | ✅ |
| Set lokasi gudang produk jadi | ✅ |
| **Download & cetak label QR** | ✅ (eksklusif) |

---

### 🟢 QC_STAFF — Quality Control
Penjaga mutu bahan baku & produk jadi.

**Menu:** QC Inspections · Raw Materials · Finished Goods

| Aksi | Wewenang |
|------|----------|
| Buat QC Inspection (skor warna, aroma, tekstur, kadar air) | ✅ |
| Putuskan hasil QC (`QC_PENDING → QC_APPROVED / QC_REJECTED`) | ✅ |
| Update status Raw Material Lot | ✅ |
| Update status Finished Goods Lot | ✅ |

---

### 🔵 PPIC — Production Planning & Inventory Control
Mengatur jadwal & jalannya produksi.

**Menu:** Production Orders · Raw Materials · Finished Goods

| Aksi | Wewenang |
|------|----------|
| Buat & kelola Production Order | ✅ |
| Majukan status produksi (`QUEUED → SCHEDULED → IN_PROGRESS → COMPLETED`) | ✅ |
| Update status Raw Material Lot | ✅ |

---

### 🟣 MANAGER — Akses Penuh
Mengawasi seluruh operasi + mengelola data master.

**Menu:** Semua menu OPERATOR + QC Inspections + Production Orders + Sample Dispatch + Master Data

| Aksi | Wewenang |
|------|----------|
| Semua wewenang OPERATOR, QC_STAFF, PPIC | ✅ |
| Buat Sample Dispatch ke customer | ✅ (eksklusif) |
| Kelola Master Data (Supplier, Material, Product) | ✅ (eksklusif) |

---

> 🔒 **Read-only otomatis:** Pengguna yang tidak berwenang atas suatu status tetap **bisa melihat** data, namun dropdown update dinonaktifkan.

---

## 🔄 Alur Data (End-to-End)

```
                                  ┌──────────────────┐
   SUPPLIER ──▶ DELIVERY ORDER ──▶│ RAW MATERIAL LOT │──▶ QC INSPECTION
                                  └──────────────────┘         │
                                                               ▼
                                                       ┌───────────────┐
                                  SAMPLE DISPATCH ◀─────│ PRODUCTION    │
                                       ▲               │  ORDER        │
                                       │               └───────────────┘
                                  ┌────┴───────┐               │
                                  │ FINISHED   │◀── QC ────────┘
                                  │ GOODS LOT  │
                                  └────────────┘
```

### Siklus Status Raw Material Lot
```
INCOMING → QC_PENDING → QC_APPROVED → IN_QUEUE → IN_PRODUCTION → CONSUMED
                     └─▶ QC_REJECTED                    (ON_HOLD kapan saja)
```

### Siklus Status Finished Goods Lot
```
PRODUCED → QC_PENDING → QC_APPROVED → IN_WAREHOUSE → PARTIALLY_DISPATCHED → FULLY_DISPATCHED
                     └─▶ QC_REJECTED                       (ON_HOLD kapan saja)
```

### Siklus Status Production Order
```
QUEUED → SCHEDULED → IN_PROGRESS → COMPLETED   (CANCELLED kapan saja)
```

### Siklus Status Delivery Order
```
INCOMING → RECEIVED
```

---

## 🛠 Tech Stack

| Layer | Teknologi |
|-------|-----------|
| **Frontend** | Next.js 14 (App Router), React, Tailwind CSS, @tanstack/react-query, react-hot-toast |
| **API Routes** | Next.js Route Handlers (`app/api/*`) → Supabase (snake_case, production path) |
| **Backend** | Express.js + Prisma ORM (backup/reference, port 3001) |
| **Database** | PostgreSQL via Supabase |
| **Auth** | JWT (jsonwebtoken) + bcryptjs |
| **QR Code** | `qrcode` npm package — PNG 400px, brand colors |
| **Deploy** | AWS Amplify |

---

## 🚀 Menjalankan Secara Lokal

Project terdiri dari **dua folder utama**: `frontend/` (Next.js) dan `backend/` (Express).

```bash
# Clone repository
git clone https://github.com/MFaqihRidh0/Cyberhack-tim-ini-anggotanya-lapar-smua.git
cd Cyberhack-tim-ini-anggotanya-lapar-smua
```

**1️⃣ Jalankan Frontend (Next.js)**
```bash
cd frontend
npm install

# Buat file frontend/.env.local dengan isi:
# NEXT_PUBLIC_API_URL=/api

npm run dev          # berjalan di http://localhost:3000
```

**2️⃣ Jalankan Backend** *(opsional — hanya diperlukan jika Next.js API routes tidak tersedia)*
```bash
cd backend
npm install
npx prisma generate
node src/index.js    # berjalan di http://localhost:3001
```

Buka **http://localhost:3000** 🎉

---

## 🔁 Cara Update Setelah Ada Perubahan Kode

### Kondisi 1 — Perubahan kecil (edit komponen/halaman)
Next.js Hot Reload biasanya otomatis. Kalau tidak langsung berubah di browser:
```
Ctrl + Shift + R       ← hard refresh browser (hapus cache browser)
```

### Kondisi 2 — Perubahan tidak muncul setelah restart `npm run dev`
Penyebabnya adalah cache `.next` yang stale. Lakukan langkah berikut:

**Windows (PowerShell):**
```powershell
# 1. Matikan semua proses di port 3000, 3001, 3002, 3003
@(3000,3001,3002,3003) | ForEach-Object {
  $p = (Get-NetTCPConnection -LocalPort $_ -ErrorAction SilentlyContinue).OwningProcess
  if ($p) { Stop-Process -Id $p -Force; Write-Host "Killed port $_" }
}

# 2. Hapus cache .next (di folder frontend)
Remove-Item -Recurse -Force frontend\.next -ErrorAction SilentlyContinue

# 3. Jalankan ulang frontend
cd frontend
npm run dev
```

**macOS / Linux (bash):**
```bash
rm -rf frontend/.next && cd frontend && npm run dev
```

### Kondisi 3 — Perubahan di Backend (Express)
Backend **tidak** memiliki hot reload otomatis. Setiap ada perubahan di folder `backend/src`:
```powershell
# Matikan proses di port 3001
$p = (Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue).OwningProcess
if ($p) { Stop-Process -Id $p -Force }

# Jalankan ulang backend
cd backend
node src/index.js
```

### Kondisi 4 — Setelah `git pull` dari teammate
```powershell
# 1. Pull perubahan
git pull origin main

# 2. Install dependency baru (jika ada)
cd frontend; npm install; cd ..
cd backend; npm install; cd ..

# 3. Hapus cache frontend & restart
Remove-Item -Recurse -Force frontend\.next -ErrorAction SilentlyContinue
cd frontend
npm run dev
```

> ⚠️ **Aturan umum:** Kalau ada yang aneh di UI (layout rusak, halaman blank, error chunk), selalu coba **hapus `.next` dulu** sebelum lapor bug.

---

## 🔐 Akun Demo

| Peran | Email | Password |
|-------|-------|----------|
| 🟠 **Operator** | `operator@sima.com` | `SimaArome@2026` |
| 🟢 **QC Staff** | `qc@sima.com` | `SimaArome@2026` |
| 🔵 **PPIC** | `ppic@sima.com` | `SimaArome@2026` |
| 🟣 **Manager** | `manager@sima.com` | `SimaArome@2026` |

> 💡 Login sebagai **Manager** untuk melihat seluruh fitur termasuk Master Data & Sample Dispatch.

---

## 📁 Struktur Project

```
.                                  ← Root = Next.js app (frontend)
├── app/
│   ├── (auth)/
│   │   └── login/                 ← Halaman login
│   ├── (dashboard)/               ← Semua halaman dashboard
│   │   ├── layout.jsx
│   │   ├── dashboard/             ← Ringkasan operasi
│   │   ├── delivery-orders/       ← Penerimaan kiriman (list, new, [id])
│   │   ├── raw-lots/              ← Raw material tracking (list, new, [id])
│   │   ├── qc/                    ← QC inspections
│   │   ├── production/            ← Production orders (list, new, [id])
│   │   ├── finished-goods/        ← Finished goods (list, [id])
│   │   ├── dispatch/              ← Sample dispatch (list, new, [id])
│   │   ├── master/                ← Master data (suppliers, materials, products)
│   │   └── scan/                  ← QR code scanner (semua role)
│   └── api/                       ← Next.js API routes → Supabase
│       ├── auth/                  ← login, me
│       ├── delivery-orders/       ← CRUD + [id]/receive
│       ├── raw-lots/              ← CRUD + [id]/status, [id]/qr
│       ├── qc-inspections/        ← CRUD
│       ├── production-orders/     ← CRUD + [id]/inputs
│       ├── finished-lots/         ← CRUD + [id]/status, [id]/warehouse, [id]/qr
│       ├── sample-dispatches/     ← CRUD + [id]/confirm
│       ├── materials/             ← Master data
│       ├── products/              ← Master data
│       ├── suppliers/             ← Master data
│       ├── dashboard/summary/     ← Ringkasan dashboard
│       ├── traceability/          ← Ketertelusuran lot
│       └── audit-log/             ← Log aktivitas
│
├── components/
│   ├── layout/                    ← Sidebar, Navbar
│   ├── lots/                      ← LotTimeline, QRDisplay
│   └── shared/                    ← StatusBadge, StatusSelect
│
├── lib/
│   ├── api.js                     ← Axios client
│   ├── auth.js                    ← Auth helpers (client)
│   ├── utils.js                   ← formatDate, formatNumber, dll
│   └── server/                    ← Server-only: db, auth, audit, lotNumber
│
├── backend/                       ← Express.js API (backup/reference)
│   ├── src/
│   │   ├── controllers/           ← Logika tiap modul
│   │   ├── routes/                ← Definisi endpoint
│   │   ├── middleware/            ← Auth & RBAC
│   │   └── utils/                 ← prisma, lotNumber, qrcode
│   └── prisma/
│       ├── schema.prisma          ← Skema database
│       └── seed.js                ← Data awal (akun demo, supplier, dll)
│
├── package.json                   ← Frontend dependencies
├── next.config.mjs
├── tailwind.config.js
└── amplify.yml                    ← Konfigurasi build AWS Amplify
```

---

## 👥 Tim — Ini Anggotanya Lapar Smua

| Nama | NRP |
|------|-----|
| Ahmad Wildan Fawwaz | 5027241001 |
| Hanif Mawla Faizi | 5027241064 |
| Yasykur Khalis Jati Maulana Yuwono | 5027241112 |
| M. Faqih Ridho | 5027241123 |

<div align="center">

<br/>

**Dibuat dengan 🍃 untuk CyberHack 2026 · ITS Surabaya**

</div>
