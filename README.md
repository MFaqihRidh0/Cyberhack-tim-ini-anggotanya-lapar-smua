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
| 📥 **Delivery Order** | Catat penerimaan kiriman bahan baku dari supplier. Setiap item otomatis membuat *Raw Material Lot*. |
| 📦 **Raw Material Lot** | Lacak setiap lot bahan baku — nomor lot internal, qty, kadaluarsa, dan riwayat statusnya. |
| 🔬 **QC Inspection** | Inspeksi mutu (warna, aroma, tekstur, kadar air) untuk bahan baku **dan** produk jadi. Hasil: Approved / Rejected / On Hold. |
| 🏭 **Production Order** | Kelola antrian & proses produksi — dari penjadwalan, pemakaian bahan baku, hingga output produk jadi. |
| 🏬 **Finished Goods** | Lacak produk jadi di gudang, beserta zona & posisi penyimpanan. |
| 🚚 **Sample Dispatch** | Kirim sampel ke customer (lokal & ekspor), lengkap dengan nomor resi & konfirmasi penerimaan. |
| 🧾 **Master Data** | Kelola data master Supplier, Material, dan Product. |
| 📱 **QR Code** | Generate & scan QR di tiap lot untuk pelacakan cepat di lapangan. |
| 📊 **Dashboard** | Ringkasan real-time seluruh operasi pabrik. |
| 🔐 **RBAC** | 4 peran dengan hak akses berbeda — tiap orang hanya melihat & mengubah apa yang menjadi tanggung jawabnya. |

---

## 👤 Peran & Hak Akses (RBAC)

Setiap pengguna punya peran, dan tiap peran punya menu serta wewenang ubah status yang berbeda.

### 🟠 OPERATOR — Gudang
Menjaga gerbang masuk & keluar barang fisik.
- Mencatat **Delivery Order** & menerima **Raw Material Lot**
- Mengirim lot ke QC (`Incoming → QC Pending`)
- Memindahkan produk jadi ke gudang (`QC Approved → In Warehouse`) & set lokasi rak

### 🟢 QC_STAFF — Quality Control
Penjaga mutu bahan baku & produk jadi.
- Melakukan **QC Inspection** (skor warna, aroma, tekstur, kadar air)
- Memutuskan hasil: `QC Pending → QC Approved / QC Rejected`

### 🔵 PPIC — Production Planning & Inventory Control
Mengatur jadwal & jalannya produksi.
- Membuat & mengelola **Production Order**
- Memajukan lot ke produksi (`QC Approved → In Queue → In Production → Consumed`)
- Menjalankan status produksi (`Queued → Scheduled → In Progress → Completed`)

### 🟣 MANAGER — Akses Penuh
Mengawasi seluruh operasi + mengelola data master.
- **Semua** wewenang di atas
- Mengelola **Master Data** (Supplier, Material, Product)
- Melakukan **Sample Dispatch** ke customer

> 🔒 **Read-only otomatis:** Pengguna yang tidak berwenang atas suatu status tetap **bisa melihat** statusnya, namun dropdown update dinonaktifkan.

---

## 🔄 Alur Data (End-to-End)

```
                                  ┌──────────────────┐
   SUPPLIER ──▶ DELIVERY ORDER ──▶│ RAW MATERIAL LOT │──▶ QC INSPECTION
                                  └──────────────────┘         │
                                                               ▼
                                                       ┌───────────────┐
                                  SAMPLE DISPATCH ◀─────│ PRODUCTION    │
                                       ▲               │  ORDER         │
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

---

## 🛠 Tech Stack

| Layer | Teknologi |
|-------|-----------|
| **Frontend** | Next.js 14 (App Router), React, Tailwind CSS, React Query, react-hot-toast |
| **Backend** | Express.js + Prisma ORM |
| **Database** | PostgreSQL (Supabase) |
| **Auth** | JWT (jsonwebtoken) + bcryptjs |
| **Deploy** | AWS Amplify |

---

## 🚀 Menjalankan Secara Lokal

Project terdiri dari **dua bagian**: `backend` (Express, port 3001) dan `frontend` (Next.js, port 3000).

```bash
# Clone repository
git clone https://github.com/MFaqihRidh0/Cyberhack-tim-ini-anggotanya-lapar-smua.git
cd Cyberhack-tim-ini-anggotanya-lapar-smua
```

**1️⃣ Jalankan Backend**
```bash
cd backend
npm install
npx prisma generate
npm run dev          # berjalan di http://localhost:3001
```

**2️⃣ Jalankan Frontend** (terminal baru)
```bash
cd frontend
npm install
# buat .env.local berisi:  NEXT_PUBLIC_API_URL=http://localhost:3001/api
npm run dev          # berjalan di http://localhost:3000
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
# 1. Matikan semua proses di port 3000, 3001, 3002
@(3000,3002,3003) | ForEach-Object {
  $p = (Get-NetTCPConnection -LocalPort $_ -ErrorAction SilentlyContinue).OwningProcess
  if ($p) { Stop-Process -Id $p -Force; Write-Host "Killed port $_" }
}

# 2. Hapus cache .next (di folder frontend)
cd frontend
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue

# 3. Jalankan ulang frontend
npm run dev
```

**macOS / Linux (bash):**
```bash
# Hapus cache dan restart
cd frontend
rm -rf .next && npm run dev
```

### Kondisi 3 — Perubahan di Backend (Express)
Backend **tidak** memiliki hot reload otomatis. Setiap ada perubahan di folder `backend/src`:
```powershell
# Matikan proses di port 3001
$p = (Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue).OwningProcess
if ($p) { Stop-Process -Id $p -Force }

# Jalankan ulang backend (di folder backend)
cd backend
node src/index.js
```

### Kondisi 4 — Setelah `git pull` dari teammate
```powershell
# 1. Pull perubahan
git pull origin main

# 2. Install dependency baru (jika ada)
cd backend && npm install
cd ../frontend && npm install    # atau: cd .. && cd frontend && npm install

# 3. Hapus cache frontend & restart
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
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
.
├── frontend/                  ← Next.js App (UI)
│   ├── app/
│   │   ├── (auth)/            ← Halaman login
│   │   └── (dashboard)/       ← Semua halaman dashboard
│   │       ├── master/        ← Master Data (suppliers, materials, products)
│   │       ├── raw-lots/      ← Raw material tracking
│   │       ├── qc/            ← QC inspections
│   │       ├── production/    ← Production orders
│   │       ├── finished-goods/← Finished goods
│   │       └── dispatch/      ← Sample dispatch
│   ├── components/            ← Komponen React (Sidebar, Navbar, QR, dll)
│   └── lib/                   ← Utilities, API client, auth
│
├── backend/                   ← Express.js API
│   ├── src/
│   │   ├── controllers/       ← Logika tiap modul
│   │   ├── routes/            ← Definisi endpoint
│   │   └── middleware/        ← Auth & RBAC
│   └── prisma/
│       ├── schema.prisma      ← Skema database
│       └── seed.js            ← Data awal (akun demo, supplier, dll)
│
└── amplify.yml                ← Konfigurasi build AWS Amplify
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
