# SimaTrack — Master Context File
# Baca file ini sebelum mengerjakan APAPUN

---

## 🏭 Project Overview

**Nama Aplikasi:** SimaTrack  
**Klien:** Sima Arome — produsen ekstrak natural Indonesia (F&B, kosmetik, wellness)  
**Tujuan:** Menggantikan notebook, spreadsheet, dan WhatsApp dengan satu sistem terpadu  
**Core Problem:** Double data entry + production opacity  
**Hackathon:** CyberHack 2026 — ITS Surabaya  

---

## 🛠 Tech Stack

```
Frontend  : Next.js 14 (App Router) + Tailwind CSS + shadcn/ui
Backend   : Express.js + Prisma ORM
Database  : Supabase (PostgreSQL)
Auth      : JWT (jsonwebtoken) + bcryptjs
Deploy    : Vercel (frontend) + Railway (backend)
```

---

## 📁 Struktur Folder

```
simatrack/
├── CONTEXT.md                        ← File ini
│
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.js
│   ├── src/
│   │   ├── index.js                  ← Entry point Express
│   │   ├── middleware/
│   │   │   ├── auth.js               ← JWT verify
│   │   │   └── rbac.js               ← Role checking
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── suppliers.routes.js
│   │   │   ├── materials.routes.js
│   │   │   ├── products.routes.js
│   │   │   ├── deliveryOrders.routes.js
│   │   │   ├── rawLots.routes.js
│   │   │   ├── qcInspections.routes.js
│   │   │   ├── productionOrders.routes.js
│   │   │   ├── finishedLots.routes.js
│   │   │   ├── sampleDispatches.routes.js
│   │   │   └── dashboard.routes.js
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── suppliers.controller.js
│   │   │   ├── materials.controller.js
│   │   │   ├── products.controller.js
│   │   │   ├── deliveryOrders.controller.js
│   │   │   ├── rawLots.controller.js
│   │   │   ├── qcInspections.controller.js
│   │   │   ├── productionOrders.controller.js
│   │   │   ├── finishedLots.controller.js
│   │   │   ├── sampleDispatches.controller.js
│   │   │   └── dashboard.controller.js
│   │   └── utils/
│   │       ├── lotNumber.js          ← Auto-generate semua nomor
│   │       └── prisma.js             ← Prisma client singleton
│   ├── .env
│   └── package.json
│
└── frontend/
    ├── app/
    │   ├── layout.jsx
    │   ├── page.jsx                  ← Redirect ke /login atau /dashboard
    │   ├── (auth)/
    │   │   └── login/
    │   │       └── page.jsx
    │   └── (dashboard)/
    │       ├── layout.jsx            ← Sidebar + Navbar wrapper
    │       ├── dashboard/
    │       │   └── page.jsx
    │       ├── delivery-orders/
    │       │   ├── page.jsx          ← List DO
    │       │   └── new/page.jsx      ← Form buat DO baru
    │       ├── raw-lots/
    │       │   ├── page.jsx          ← List raw material lots
    │       │   └── [id]/page.jsx     ← Detail + timeline + QR
    │       ├── qc/
    │       │   └── page.jsx          ← Antrian QC pending
    │       ├── production/
    │       │   ├── page.jsx          ← Queue produksi
    │       │   ├── new/page.jsx      ← Buat production order
    │       │   └── [id]/page.jsx     ← Detail PO + inputs
    │       ├── finished-goods/
    │       │   ├── page.jsx          ← List finished goods
    │       │   └── [id]/page.jsx     ← Detail + posisi gudang + QR
    │       ├── dispatch/
    │       │   ├── page.jsx          ← List semua dispatch
    │       │   └── new/page.jsx      ← Form kirim sampel
    │       └── scan/
    │           └── page.jsx          ← QR Scanner
    ├── components/
    │   ├── ui/                       ← shadcn components
    │   ├── layout/
    │   │   ├── Sidebar.jsx
    │   │   └── Navbar.jsx
    │   ├── lots/
    │   │   ├── LotTimeline.jsx       ← Visualisasi alur status
    │   │   ├── LotStatusBadge.jsx
    │   │   └── QRDisplay.jsx
    │   └── shared/
    │       ├── DataTable.jsx
    │       ├── StatusBadge.jsx
    │       └── ConfirmDialog.jsx
    ├── lib/
    │   ├── api.js                    ← Axios instance
    │   ├── auth.js                   ← Auth helpers
    │   └── utils.js
    ├── middleware.js                 ← Route protection
    └── package.json
```

---

## 🗄 Prisma Schema (FINAL — V4)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

enum Role {
  OPERATOR
  QC_STAFF
  PPIC
  MANAGER
}

enum RawLotStatus {
  INCOMING
  QC_PENDING
  QC_APPROVED
  QC_REJECTED
  IN_QUEUE
  IN_PRODUCTION
  CONSUMED
  ON_HOLD
}

enum FinishedLotStatus {
  PRODUCED
  QC_PENDING
  QC_APPROVED
  QC_REJECTED
  IN_WAREHOUSE
  PARTIALLY_DISPATCHED
  FULLY_DISPATCHED
  ON_HOLD
}

enum ProductionStatus {
  QUEUED
  SCHEDULED
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

enum DestinationType {
  LOCAL
  EXPORT
}

enum QCResult {
  APPROVED
  REJECTED
  ON_HOLD
}

model User {
  id           String   @id @default(cuid())
  name         String
  email        String   @unique
  passwordHash String
  role         Role
  isActive     Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  createdRawLots    RawMaterialLot[]  @relation("RawLotCreator")
  rawLotStages      RawLotStage[]
  qcInspections     QCInspection[]
  productionOrders  ProductionOrder[] @relation("PPICOwner")
  finishedLotStages FinishedLotStage[]
  sampleDispatches  SampleDispatch[]
}

model Supplier {
  id          String   @id @default(cuid())
  name        String
  code        String   @unique
  contactName String?
  phone       String?
  email       String?
  address     String?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())

  rawLots        RawMaterialLot[]
  deliveryOrders DeliveryOrder[]
}

model Material {
  id            String  @id @default(cuid())
  name          String
  code          String  @unique
  category      String
  unit          String
  shelfLifeDays Int?
  storageNote   String?
  isActive      Boolean @default(true)

  rawLots          RawMaterialLot[]
  productionInputs ProductionInput[]
}

model Product {
  id            String  @id @default(cuid())
  name          String
  code          String  @unique
  category      String
  unit          String
  shelfLifeDays Int?
  isActive      Boolean @default(true)

  finishedLots     FinishedGoodsLot[]
  productionOrders ProductionOrder[]
}

model DeliveryOrder {
  id           String   @id @default(cuid())
  doNumber     String   @unique
  receivedDate DateTime @default(now())
  notes        String?

  supplierId String
  supplier   Supplier @relation(fields: [supplierId], references: [id])

  rawLots RawMaterialLot[]
}

model RawMaterialLot {
  id            String       @id @default(cuid())
  internalLotNo String       @unique
  supplierLotNo String?
  currentStatus RawLotStatus @default(INCOMING)
  initialQty    Float
  receivedDate  DateTime     @default(now())
  manufacturedDate DateTime?
  expiryDate    DateTime?
  notes         String?
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt

  deliveryOrderId String?
  deliveryOrder   DeliveryOrder? @relation(fields: [deliveryOrderId], references: [id])

  supplierId  String
  supplier    Supplier @relation(fields: [supplierId], references: [id])

  materialId  String
  material    Material @relation(fields: [materialId], references: [id])

  createdById String
  createdBy   User     @relation("RawLotCreator", fields: [createdById], references: [id])

  stages           RawLotStage[]
  qcInspections    QCInspection[]
  productionInputs ProductionInput[]
}

model RawLotStage {
  id        String       @id @default(cuid())
  stage     RawLotStatus
  notes     String?
  timestamp DateTime     @default(now())

  rawLotId String
  rawLot   RawMaterialLot @relation(fields: [rawLotId], references: [id])

  actorId String
  actor   User   @relation(fields: [actorId], references: [id])
}

model QCInspection {
  id           String   @id @default(cuid())
  result       QCResult
  inspectedAt  DateTime @default(now())
  colorScore   Int?
  odorScore    Int?
  textureScore Int?
  moistureLevel Float?
  notes        String?

  rawLotId      String?
  rawLot        RawMaterialLot?   @relation(fields: [rawLotId], references: [id])

  finishedLotId String?
  finishedLot   FinishedGoodsLot? @relation(fields: [finishedLotId], references: [id])

  inspectedById String
  inspectedBy   User   @relation(fields: [inspectedById], references: [id])
}

model ProductionOrder {
  id            String           @id @default(cuid())
  orderNumber   String           @unique
  status        ProductionStatus @default(QUEUED)
  priority      Int              @default(0)
  targetQty     Float
  actualQty     Float?
  scheduledDate DateTime?
  startedAt     DateTime?
  completedAt   DateTime?
  notes         String?
  createdAt     DateTime         @default(now())
  updatedAt     DateTime         @updatedAt

  productId   String
  product     Product @relation(fields: [productId], references: [id])

  createdById String
  createdBy   User   @relation("PPICOwner", fields: [createdById], references: [id])

  inputs       ProductionInput[]
  finishedLots FinishedGoodsLot[]
}

model ProductionInput {
  id      String   @id @default(cuid())
  qtyUsed Float
  usedAt  DateTime @default(now())

  productionOrderId String
  productionOrder   ProductionOrder @relation(fields: [productionOrderId], references: [id])

  rawLotId   String
  rawLot     RawMaterialLot @relation(fields: [rawLotId], references: [id])

  materialId String
  material   Material @relation(fields: [materialId], references: [id])
}

model FinishedGoodsLot {
  id                String            @id @default(cuid())
  lotNumber         String            @unique
  currentStatus     FinishedLotStatus @default(PRODUCED)
  quantity          Float
  unit              String
  warehouseZone     String?
  warehousePosition String?
  producedAt        DateTime          @default(now())
  expiryDate        DateTime?
  notes             String?
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt

  productId String
  product   Product @relation(fields: [productId], references: [id])

  productionOrderId String
  productionOrder   ProductionOrder @relation(fields: [productionOrderId], references: [id])

  stages           FinishedLotStage[]
  qcInspections    QCInspection[]
  sampleDispatches SampleDispatch[]
}

model FinishedLotStage {
  id        String            @id @default(cuid())
  stage     FinishedLotStatus
  notes     String?
  timestamp DateTime          @default(now())

  finishedLotId String
  finishedLot   FinishedGoodsLot @relation(fields: [finishedLotId], references: [id])

  actorId String
  actor   User   @relation(fields: [actorId], references: [id])
}

model SampleDispatch {
  id                String          @id @default(cuid())
  dispatchNumber    String          @unique
  customerName      String
  customerEmail     String?
  customerPhone     String?
  destination       DestinationType
  country           String?
  quantity          Float
  unit              String
  dispatchDate      DateTime        @default(now())
  trackingNumber    String?
  receivedConfirmed Boolean         @default(false)
  receivedAt        DateTime?
  notes             String?

  finishedLotId String
  finishedLot   FinishedGoodsLot @relation(fields: [finishedLotId], references: [id])

  dispatchedById String
  dispatchedBy   User   @relation(fields: [dispatchedById], references: [id])
}
```

---

## 🔐 RBAC — Siapa Bisa Apa

```
OPERATOR
  ✅ Buat DeliveryOrder
  ✅ Buat RawMaterialLot dari DeliveryOrder
  ✅ Update status lot ke QC_PENDING
  ✅ Update FinishedGoodsLot warehouseZone + warehousePosition
  ✅ Scan QR code
  ❌ Approve/reject QC
  ❌ Buat ProductionOrder

QC_STAFF
  ✅ Lihat semua lot status QC_PENDING
  ✅ Buat QCInspection (raw lot + finished lot)
  ✅ Status otomatis berubah setelah QC
  ❌ Buat lot baru
  ❌ Buat production order

PPIC
  ✅ Buat + kelola ProductionOrder
  ✅ Set priority antrian produksi
  ✅ Input ProductionInput (bahan baku yang dipakai)
  ✅ Update status PO (SCHEDULED → IN_PROGRESS → COMPLETED)
  ✅ Input actualQty saat COMPLETED (trigger auto-create FinishedGoodsLot)
  ❌ Approve QC
  ❌ Buat dispatch

MANAGER
  ✅ Semua akses di atas
  ✅ Buat SampleDispatch
  ✅ Lihat dashboard + summary
  ✅ Lihat semua laporan
  ✅ Manage master data (Supplier, Material, Product)
  ✅ Manage Users
```

---

## 🔄 Alur Data — One Source of Truth

```
[SUPPLIER DATANG]
Operator input DeliveryOrder (doNumber, supplierId)
        ↓
[BAHAN BAKU MASUK]
Operator buat RawMaterialLot dari DO
(internalLotNo auto-generate: SA-RM-YYYYMMDD-XXX)
(supplierLotNo dari surat jalan)
        ↓
[QC BAHAN BAKU]
QC Staff buka antrian QC_PENDING
Input QCInspection sekali (colorScore, odorScore, result)
→ Status lot otomatis berubah (QC_APPROVED / QC_REJECTED)
        ↓
[ANTRIAN PPIC]
PPIC lihat lot QC_APPROVED
Buat ProductionOrder (orderNumber auto-generate: PO-YYYYMMDD-XXX)
Set priority + scheduledDate
Pilih RawMaterialLot → input ProductionInput.qtyUsed
→ remainingQty dihitung otomatis (tidak diinput manual)
        ↓
[PRODUKSI]
PPIC update status → IN_PROGRESS
Saat selesai: input actualQty SEKALI
→ Sistem auto-create FinishedGoodsLot
  (lotNumber: SA-FG-YYYYMMDD-XXX, quantity = actualQty)
        ↓
[QC PRODUK JADI]
QC Staff input QCInspection untuk FinishedGoodsLot
→ Status berubah QC_APPROVED
        ↓
[GUDANG]
Operator set warehouseZone + warehousePosition
→ Status: IN_WAREHOUSE
        ↓
[PENGIRIMAN SAMPEL]
Manager buat SampleDispatch
(dispatchNumber auto-generate: SD-YYYYMMDD-XXX)
Pilih LOCAL atau EXPORT
Customer konfirmasi → update receivedConfirmed
```

---

## 🌐 API Endpoints

```
AUTH
POST   /api/auth/login
GET    /api/auth/me

MASTER DATA (MANAGER only)
GET    /api/suppliers
POST   /api/suppliers
GET    /api/materials
POST   /api/materials
GET    /api/products
POST   /api/products

DELIVERY ORDERS
GET    /api/delivery-orders
POST   /api/delivery-orders          ← OPERATOR+
GET    /api/delivery-orders/:id

RAW MATERIAL LOTS
GET    /api/raw-lots                 ← filter: status, materialId, supplierId
POST   /api/raw-lots                 ← OPERATOR+
GET    /api/raw-lots/:id             ← include stages, qcInspections, supplier, material
PATCH  /api/raw-lots/:id/status      ← update status manual
GET    /api/raw-lots/:id/remaining   ← computed remainingQty

QC INSPECTIONS
GET    /api/qc-inspections           ← filter: pending, type
POST   /api/qc-inspections           ← QC_STAFF+ (auto-update lot status)
GET    /api/qc-inspections/:id

PRODUCTION ORDERS
GET    /api/production-orders        ← filter: status, sorted by priority
POST   /api/production-orders        ← PPIC+
GET    /api/production-orders/:id    ← include inputs, finishedLots
PATCH  /api/production-orders/:id    ← update status, actualQty
POST   /api/production-orders/:id/inputs  ← tambah bahan baku

FINISHED GOODS
GET    /api/finished-lots
GET    /api/finished-lots/:id        ← include stages, qcInspections, dispatches
PATCH  /api/finished-lots/:id/warehouse  ← update posisi gudang

SAMPLE DISPATCH
GET    /api/sample-dispatches
POST   /api/sample-dispatches        ← MANAGER only
PATCH  /api/sample-dispatches/:id/confirm  ← konfirmasi terima

DASHBOARD
GET    /api/dashboard/summary        ← cards: total lot, pending QC, dll
GET    /api/dashboard/activity       ← recent activity feed
```

---

## 📦 Response Format (WAJIB KONSISTEN)

```javascript
// Success
{
  "success": true,
  "data": { ... },
  "message": "Berhasil"
}

// Error
{
  "success": false,
  "data": null,
  "message": "Pesan error yang jelas"
}

// List dengan pagination
{
  "success": true,
  "data": [ ... ],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 20
  }
}
```

---

## 🔢 Auto-Generate Number Format

```javascript
// Raw Material Lot
SA-RM-YYYYMMDD-XXX   → SA-RM-20240528-001

// Finished Goods Lot  
SA-FG-YYYYMMDD-XXX   → SA-FG-20240528-001

// Production Order
PO-YYYYMMDD-XXX      → PO-20240528-001

// Sample Dispatch
SD-YYYYMMDD-XXX      → SD-20240528-001

// XXX = 3 digit urut per hari, reset tiap hari
// Jika sudah ada SA-RM-20240528-003, berikutnya SA-RM-20240528-004
```

---

## 🎨 UI/UX Rules

```
Color Palette:
- Primary   : #F97316 (orange — brand Sima Arome)
- Secondary : #1D4ED8 (blue)
- Success   : #16A34A (green)
- Danger    : #DC2626 (red)
- Warning   : #CA8A04 (yellow)
- Background: #F8FAFC
- Text      : #1E293B

Status Badge Colors:
- INCOMING          → gray
- QC_PENDING        → yellow
- QC_APPROVED       → green
- QC_REJECTED       → red
- IN_QUEUE          → blue
- IN_PRODUCTION     → orange
- CONSUMED          → gray (muted)
- ON_HOLD           → purple

Font: Inter (Google Fonts)
Component Library: shadcn/ui
Icon Library: lucide-react
```

---

## 🌱 Seed Data (untuk testing)

```
Users:
- operator@sima.com / password123 (OPERATOR)
- qc@sima.com / password123 (QC_STAFF)
- ppic@sima.com / password123 (PPIC)
- manager@sima.com / password123 (MANAGER)

Suppliers (5):
- PT Rempah Nusantara (SUP-001)
- CV Herbal Indonesia (SUP-002)
- PT Buah Tropis (SUP-003)
- CV Alam Segar (SUP-004)
- PT Botanika Prima (SUP-005)

Materials (8):
- Vanili Madagascar (MAT-VNL, Rempah, kg, 365 hari)
- Jahe Merah (MAT-JHM, Rempah, kg, 180 hari)
- Pandan Wangi (MAT-PDN, Herbal, kg, 90 hari)
- Kayu Manis (MAT-KYM, Rempah, kg, 365 hari)
- Bunga Telang (MAT-BGT, Herbal, kg, 120 hari)
- Serai (MAT-SRI, Herbal, kg, 90 hari)
- Lemon (MAT-LMN, Buah, kg, 30 hari)
- Mangga (MAT-MNG, Buah, kg, 14 hari)

Products (5):
- Ekstrak Vanili 10x (PRD-EVN, Ekstrak Cair, liter)
- Ekstrak Jahe Merah (PRD-EJM, Ekstrak Cair, liter)
- Bubuk Pandan (PRD-BPD, Bubuk, kg)
- Ekstrak Kayu Manis (PRD-EKM, Ekstrak Cair, liter)
- Bubuk Lemon (PRD-BLM, Bubuk, kg)

Raw Material Lots (10 dengan berbagai status):
- 3 lot INCOMING
- 2 lot QC_PENDING
- 2 lot QC_APPROVED
- 1 lot IN_PRODUCTION
- 1 lot QC_REJECTED
- 1 lot CONSUMED

Production Orders (3):
- 1 QUEUED
- 1 IN_PROGRESS
- 1 COMPLETED (dengan FinishedGoodsLot)

Finished Goods (2):
- 1 IN_WAREHOUSE
- 1 PARTIALLY_DISPATCHED

Sample Dispatches (3):
- 1 LOCAL confirmed
- 1 LOCAL pending
- 1 EXPORT pending
```

---

---
---

# 🗺 SEGMEN PENGERJAAN — URUTAN & MODEL

---

## ⚠️ Aturan Penting Sebelum Mulai

```
1. Selalu baca CONTEXT.md sebelum mengerjakan segment apapun
2. Jangan skip segment — kerjakan berurutan
3. Setiap segment harus SELESAI dan TESTED sebelum lanjut
4. Simpan semua output ke file sebelum tutup sesi
5. Jika ada konflik dengan CONTEXT.md, CONTEXT.md yang menang
```

---

## SEGMENT 1 — Project Setup & Database
### 🤖 Gunakan: Claude Sonnet (cukup, tugas straightforward)
### ⏱ Estimasi: 1-2 jam
### 👤 Dikerjakan oleh: Backend Dev

```
PROMPT UNTUK CLAUDE CODE:

"Baca CONTEXT.md. Kerjakan SEGMENT 1:

1. Inisialisasi project backend:
   - Buat folder backend/
   - npm init -y
   - Install: express prisma @prisma/client dotenv cors 
     jsonwebtoken bcryptjs express-validator
   - Buat .env dengan variabel: DATABASE_URL, DIRECT_URL, JWT_SECRET, PORT

2. Setup Prisma:
   - npx prisma init
   - Copy schema dari CONTEXT.md ke prisma/schema.prisma
   - Buat file src/utils/prisma.js (singleton Prisma client)

3. Buat file backend/src/index.js:
   - Express setup dengan cors, json middleware
   - Health check endpoint: GET /health
   - Error handling middleware global
   - PORT dari .env

4. Buat prisma/seed.js:
   - Seed semua data dari bagian Seed Data di CONTEXT.md
   - Password hash menggunakan bcryptjs
   - Jalankan: npx prisma db seed

SELESAIKAN SEMUA, lalu konfirmasi dengan menjalankan:
npx prisma migrate dev --name init
node src/index.js (pastikan server jalan di port yang benar)"
```

**Checklist selesai:**
- [ ] Server jalan tanpa error
- [ ] `GET /health` return 200
- [ ] Database ter-migrate
- [ ] Seed data masuk ke Supabase

---

## SEGMENT 2 — Auth & Middleware
### 🤖 Gunakan: Claude Sonnet
### ⏱ Estimasi: 1 jam
### 👤 Dikerjakan oleh: Backend Dev

```
PROMPT UNTUK CLAUDE CODE:

"Baca CONTEXT.md. Segment 1 sudah selesai. Kerjakan SEGMENT 2:

1. Buat src/utils/lotNumber.js:
   - Fungsi generateLotNumber(prefix, prismaModel)
   - prefix: 'SA-RM', 'SA-FG', 'PO', 'SD'
   - Format: PREFIX-YYYYMMDD-XXX (3 digit urut per hari)
   - Cek database untuk urut terakhir hari ini, lanjutkan dari sana

2. Buat src/middleware/auth.js:
   - Fungsi verifyToken: extract JWT dari Authorization header
   - Attach user object ke req.user
   - Return 401 jika token invalid/expired

3. Buat src/middleware/rbac.js:
   - Fungsi allowRoles(...roles): middleware factory
   - Contoh pakai: router.post('/', verifyToken, allowRoles('MANAGER','PPIC'), controller)
   - Return 403 jika role tidak sesuai

4. Buat src/controllers/auth.controller.js + src/routes/auth.routes.js:
   - POST /api/auth/login: validasi email+password, return JWT (expires 8h)
   - GET /api/auth/me: return user data (tanpa passwordHash)

5. Daftarkan route di src/index.js

Gunakan response format dari CONTEXT.md (success, data, message)"
```

**Checklist selesai:**
- [ ] `POST /api/auth/login` berhasil return token
- [ ] `GET /api/auth/me` dengan token valid return user
- [ ] Request tanpa token return 401
- [ ] Request role salah return 403

---

## SEGMENT 3 — Master Data API
### 🤖 Gunakan: Claude Sonnet
### ⏱ Estimasi: 1 jam
### 👤 Dikerjakan oleh: Backend Dev

```
PROMPT UNTUK CLAUDE CODE:

"Baca CONTEXT.md. Segment 1-2 sudah selesai. Kerjakan SEGMENT 3:

Buat controller + routes untuk 3 master data:
1. Suppliers: GET list, POST create, GET :id, PATCH :id (isActive toggle)
2. Materials: GET list, POST create, GET :id, PATCH :id
3. Products: GET list, POST create, GET :id, PATCH :id

Semua endpoint:
- Gunakan verifyToken middleware
- POST/PATCH hanya MANAGER (gunakan allowRoles)
- GET bisa semua role yang login
- Include filter isActive=true di GET list by default
- Response format dari CONTEXT.md

Daftarkan semua routes di index.js dengan prefix /api"
```

**Checklist selesai:**
- [ ] CRUD suppliers, materials, products berjalan
- [ ] Non-MANAGER tidak bisa POST/PATCH

---

## SEGMENT 4 — Core Lot Tracking API (Backend Utama)
### 🤖 Gunakan: Claude Opus ← WAJIB OPUS
### ⏱ Estimasi: 3-4 jam
### 👤 Dikerjakan oleh: Backend Dev
### ⚠️ Ini segment terpenting — logika bisnis paling kompleks

```
PROMPT UNTUK CLAUDE CODE:

"Baca CONTEXT.md dengan sangat teliti terutama bagian Alur Data.
Kerjakan SEGMENT 4 — ini adalah core business logic SimaTrack:

=== BAGIAN A: Delivery Order ===
File: controllers/deliveryOrders.controller.js
- POST /api/delivery-orders: buat DO baru (OPERATOR+)
  Body: { doNumber, supplierId, receivedDate?, notes? }
- GET /api/delivery-orders: list semua DO (include supplier, count rawLots)
- GET /api/delivery-orders/:id: detail DO (include rawLots dengan status)

=== BAGIAN B: Raw Material Lot ===
File: controllers/rawLots.controller.js
- POST /api/raw-lots: buat lot baru (OPERATOR+)
  Body: { deliveryOrderId?, supplierId, materialId, initialQty, 
          supplierLotNo?, manufacturedDate?, expiryDate?, notes? }
  - Auto-generate internalLotNo (SA-RM-YYYYMMDD-XXX)
  - Auto-create RawLotStage pertama (INCOMING)
  
- GET /api/raw-lots: list dengan filter (status, materialId, supplierId, search)
  Include: material, supplier, _count stages
  
- GET /api/raw-lots/:id: detail lengkap
  Include: material, supplier, deliveryOrder, stages (dengan actor),
           qcInspections (dengan inspectedBy), productionInputs
  Computed field: remainingQty = initialQty - SUM(productionInputs.qtyUsed)
  
- PATCH /api/raw-lots/:id/status: update status manual
  Body: { status, notes }
  - Validasi transisi status yang valid
  - Auto-create RawLotStage baru
  - Hanya role yang sesuai RBAC yang boleh update ke status tertentu

=== BAGIAN C: QC Inspection ===
File: controllers/qcInspections.controller.js
- POST /api/qc-inspections: buat hasil QC (QC_STAFF+)
  Body: { rawLotId? atau finishedLotId?, result, colorScore?,
          odorScore?, textureScore?, moistureLevel?, notes? }
  - Validasi: hanya salah satu (rawLotId ATAU finishedLotId) yang diisi
  - Setelah save:
    * Jika rawLotId: update RawMaterialLot.currentStatus
      (APPROVED → QC_APPROVED, REJECTED → QC_REJECTED, ON_HOLD → ON_HOLD)
      Auto-create RawLotStage baru
    * Jika finishedLotId: update FinishedGoodsLot.currentStatus
      Auto-create FinishedLotStage baru
      
- GET /api/qc-inspections: list dengan filter (type: raw/finished, result, pending)
  Include: rawLot.material, finishedLot.product, inspectedBy

Semua menggunakan response format dari CONTEXT.md.
Pastikan tidak ada double input — data mengalir sesuai alur di CONTEXT.md."
```

**Checklist selesai:**
- [ ] Buat DO → buat RawLot dari DO (supplier tidak diinput ulang)
- [ ] internalLotNo auto-generate dengan format benar
- [ ] remainingQty computed (bukan field tersimpan)
- [ ] QC approve → status lot otomatis berubah
- [ ] RawLotStage tercatat di setiap perubahan status

---

## SEGMENT 5 — Production & Finished Goods API
### 🤖 Gunakan: Claude Opus ← WAJIB OPUS
### ⏱ Estimasi: 2-3 jam
### 👤 Dikerjakan oleh: Backend Dev
### ⚠️ Ada trigger otomatis saat production COMPLETED

```
PROMPT UNTUK CLAUDE CODE:

"Baca CONTEXT.md. Segment 1-4 sudah selesai. Kerjakan SEGMENT 5:

=== BAGIAN A: Production Order ===
File: controllers/productionOrders.controller.js

- POST /api/production-orders: buat PO baru (PPIC+)
  Body: { productId, targetQty, scheduledDate?, priority?, notes? }
  - Auto-generate orderNumber (PO-YYYYMMDD-XXX)
  - Default status: QUEUED

- GET /api/production-orders: list PO
  Include: product, createdBy, _count inputs, _count finishedLots
  Sort: priority DESC, scheduledDate ASC
  Filter: status

- GET /api/production-orders/:id: detail
  Include: product, inputs(+rawLot+material), finishedLots, createdBy

- PATCH /api/production-orders/:id: update PO (PPIC+)
  Body: { status?, scheduledDate?, priority?, actualQty?, notes? }
  
  ⚠️ LOGIKA KRITIS — saat status berubah ke COMPLETED:
  1. actualQty wajib ada
  2. Auto-create FinishedGoodsLot:
     { lotNumber: SA-FG-..., productId, productionOrderId,
       quantity: actualQty, unit: product.unit,
       status: PRODUCED }
  3. Auto-create FinishedLotStage (PRODUCED)
  4. Update semua RawMaterialLot yang dipakai → status CONSUMED
     (jika remainingQty = 0 setelah dikurangi)
  5. Set completedAt = now()

- POST /api/production-orders/:id/inputs: tambah bahan baku (PPIC+)
  Body: { rawLotId, materialId, qtyUsed }
  - Validasi: qtyUsed <= remainingQty lot tersebut
  - Validasi: rawLot.currentStatus harus QC_APPROVED atau IN_QUEUE
  - Update rawLot status → IN_PRODUCTION jika belum

=== BAGIAN B: Finished Goods ===
File: controllers/finishedLots.controller.js

- GET /api/finished-lots: list (filter: status, productId)
  Include: product, productionOrder, _count sampleDispatches

- GET /api/finished-lots/:id: detail
  Include: product, productionOrder(+inputs+rawLots),
           stages(+actor), qcInspections(+inspectedBy),
           sampleDispatches(+dispatchedBy)

- PATCH /api/finished-lots/:id/warehouse: update posisi gudang (OPERATOR+)
  Body: { warehouseZone, warehousePosition }
  - Jika status masih PRODUCED atau QC_APPROVED:
    Update status → IN_WAREHOUSE
    Auto-create FinishedLotStage (IN_WAREHOUSE)

=== BAGIAN C: Sample Dispatch ===
File: controllers/sampleDispatches.controller.js

- POST /api/sample-dispatches: kirim sampel (MANAGER only)
  Body: { finishedLotId, customerName, customerEmail?,
          customerPhone?, destination, country?, quantity, unit,
          trackingNumber?, notes? }
  - Auto-generate dispatchNumber (SD-YYYYMMDD-XXX)
  - Validasi: destination=EXPORT wajib ada country
  - Update FinishedGoodsLot status:
    * Jika quantity dispatch < lot quantity → PARTIALLY_DISPATCHED
    * Jika quantity dispatch >= lot quantity → FULLY_DISPATCHED
  - Auto-create FinishedLotStage

- GET /api/sample-dispatches: list (filter: destination, confirmed)
  Include: finishedLot(+product), dispatchedBy

- PATCH /api/sample-dispatches/:id/confirm: konfirmasi terima (MANAGER+)
  Body: { receivedAt? }
  - Set receivedConfirmed = true, receivedAt = now()"
```

**Checklist selesai:**
- [ ] Saat PO COMPLETED → FinishedGoodsLot auto-terbuat
- [ ] qtyUsed tidak bisa melebihi remainingQty
- [ ] Dispatch EXPORT wajib ada country
- [ ] Status finished lot update otomatis setelah dispatch

---

## SEGMENT 6 — Dashboard API + QR Code
### 🤖 Gunakan: Claude Sonnet
### ⏱ Estimasi: 1 jam
### 👤 Dikerjakan oleh: Backend Dev

```
PROMPT UNTUK CLAUDE CODE:

"Baca CONTEXT.md. Segment 1-5 sudah selesai. Kerjakan SEGMENT 6:

=== BAGIAN A: Dashboard ===
File: controllers/dashboard.controller.js

GET /api/dashboard/summary — return:
{
  rawLots: {
    total, incoming, qcPending, qcApproved, inProduction, rejected
  },
  productionOrders: {
    total, queued, scheduled, inProgress, completed
  },
  finishedGoods: {
    total, inWarehouse, dispatched
  },
  recentActivity: [
    // 10 aktivitas terbaru dari RawLotStage + FinishedLotStage
    // Include: lotNumber, stage, actor.name, timestamp
  ]
}

=== BAGIAN B: QR Code ===
Install: npm install qrcode

Tambahkan endpoint di rawLots.routes.js dan finishedLots.routes.js:
- GET /api/raw-lots/:id/qr
- GET /api/finished-lots/:id/qr

Response: PNG buffer dengan Content-Type: image/png
QR content: JSON string berisi:
{
  type: 'RAW_LOT' atau 'FINISHED_LOT',
  id: lot.id,
  lotNumber: lot.internalLotNo atau lot.lotNumber,
  material/product: nama,
  status: currentStatus
}"
```

**Checklist selesai:**
- [ ] Dashboard summary return data akurat
- [ ] QR code ter-generate sebagai image
- [ ] QR bisa di-scan dan return data lot

---

## SEGMENT 7 — Frontend Foundation
### 🤖 Gunakan: Claude Sonnet
### ⏱ Estimasi: 2 jam
### 👤 Dikerjakan oleh: Frontend Dev A

```
PROMPT UNTUK CLAUDE CODE:

"Baca CONTEXT.md. Backend sudah selesai (Segment 1-6). 
Kerjakan SEGMENT 7 — Frontend Foundation:

1. Inisialisasi Next.js 14:
   npx create-next-app@latest frontend --typescript=false 
   --tailwind --eslint --app --src-dir=false
   
   Install tambahan:
   npm install axios @tanstack/react-query react-hot-toast
   npm install lucide-react react-qr-code html5-qrcode
   npx shadcn@latest init
   npx shadcn@latest add button card badge input label 
     select dialog table tabs

2. Buat lib/api.js:
   - Axios instance dengan baseURL dari env
   - Request interceptor: attach JWT dari localStorage
   - Response interceptor: redirect ke /login jika 401

3. Buat lib/auth.js:
   - Fungsi: login(email, pass), logout(), getUser(), isLoggedIn()
   - Simpan token di localStorage key: 'simatrack_token'

4. Buat middleware.js (Next.js middleware):
   - Protect semua route /dashboard/* 
   - Redirect ke /login jika tidak ada token
   - Redirect ke /dashboard jika sudah login dan akses /login

5. Buat app/(auth)/login/page.jsx:
   - Form email + password
   - Gunakan warna primary #F97316 (orange) sesuai CONTEXT.md
   - Tampilkan logo/nama SimaTrack
   - Error handling jika login gagal

6. Buat app/(dashboard)/layout.jsx:
   - Sidebar dengan menu sesuai role user
   - Navbar dengan nama user + tombol logout
   - Wrapper untuk semua dashboard pages

7. Buat komponen components/layout/Sidebar.jsx:
   Menu items berdasarkan role:
   - Semua role: Dashboard, Raw Lots, Finished Goods, Scan QR
   - OPERATOR+: Delivery Orders
   - QC_STAFF+: QC Inspections
   - PPIC+: Production Orders
   - MANAGER: Dispatch, Master Data"
```

**Checklist selesai:**
- [ ] Login page tampil dan bisa login
- [ ] Redirect ke dashboard setelah login
- [ ] Sidebar tampil dengan menu sesuai role
- [ ] Logout bersihkan token dan redirect ke login

---

## SEGMENT 8 — Frontend Core Pages
### 🤖 Gunakan: Claude Opus ← WAJIB OPUS
### ⏱ Estimasi: 4-5 jam
### 👤 Dikerjakan oleh: Frontend Dev A + C (bagi halaman)
### ⚠️ Halaman paling banyak dan paling complex UI-nya

```
PROMPT UNTUK CLAUDE CODE (Dev A):

"Baca CONTEXT.md. Segment 7 sudah selesai.
Kerjakan SEGMENT 8A — halaman utama:

=== Dashboard Page ===
File: app/(dashboard)/dashboard/page.jsx
- Fetch GET /api/dashboard/summary
- Tampilkan summary cards:
  * Total Raw Lots + breakdown status
  * Total Production Orders + breakdown
  * Total Finished Goods
- Recent Activity feed (timeline style)
- Gunakan warna dari CONTEXT.md

=== Delivery Orders ===
File: app/(dashboard)/delivery-orders/page.jsx
- Tabel list DO dengan kolom: doNumber, supplier, tanggal, jumlah lot
- Tombol 'Buat DO Baru'

File: app/(dashboard)/delivery-orders/new/page.jsx  
- Form: doNumber, pilih supplier (dropdown), tanggal, notes
- Setelah submit → redirect ke halaman buat RawLot dengan DO ini

=== Raw Lots Pages ===
File: app/(dashboard)/raw-lots/page.jsx
- Tabel list dengan filter status (tabs/dropdown)
- Kolom: internalLotNo, material, supplier, qty, status badge, expiry
- StatusBadge warna sesuai CONTEXT.md
- Klik row → ke detail

File: app/(dashboard)/raw-lots/[id]/page.jsx
- Header: lotNumber, status badge, material, supplier
- Cards: qty awal, remaining qty, expiry date
- Timeline stages (LotTimeline component)
- QC Inspection history
- Tombol update status (sesuai role)
- QR Code display (fetch dari /api/raw-lots/:id/qr)"
```

```
PROMPT UNTUK CLAUDE CODE (Dev C):

"Baca CONTEXT.md. Segment 7 sudah selesai.
Kerjakan SEGMENT 8B — halaman produksi & dispatch:

=== QC Page ===
File: app/(dashboard)/qc/page.jsx
- Tabs: 'Bahan Baku' | 'Produk Jadi'
- List lot dengan status QC_PENDING
- Tombol 'Inspect' per lot → buka form QCInspection
- Form: colorScore (1-10), odorScore (1-10), textureScore (1-10),
  moistureLevel, result (APPROVED/REJECTED/ON_HOLD), notes

=== Production Order Pages ===
File: app/(dashboard)/production/page.jsx
- List PO sorted by priority
- Status tabs + filter
- Tampilkan progress (QUEUED → SCHEDULED → IN_PROGRESS → COMPLETED)

File: app/(dashboard)/production/new/page.jsx
- Form: pilih product, targetQty, scheduledDate, priority, notes
- Setelah submit → redirect ke detail PO untuk tambah bahan baku

File: app/(dashboard)/production/[id]/page.jsx
- Header: orderNumber, status, product, target qty
- Section 'Bahan Baku Dipakai': list ProductionInput + form tambah input
- Tombol update status sesuai alur (PPIC only)
- Jika status IN_PROGRESS: tampil form input actualQty untuk complete

=== Finished Goods Pages ===
File: app/(dashboard)/finished-goods/page.jsx
- List finished goods + filter status
- Kolom: lotNumber, product, qty, warehouse position, status

File: app/(dashboard)/finished-goods/[id]/page.jsx
- Detail + form update warehouse position (jika OPERATOR)
- QC history
- Dispatch history
- QR code display

=== Dispatch Page ===
File: app/(dashboard)/dispatch/page.jsx + new/page.jsx
- List semua dispatch + filter LOCAL/EXPORT
- Form buat dispatch baru (MANAGER only):
  pilih finishedLot, customerName, LOCAL/EXPORT, country (jika EXPORT),
  quantity, trackingNumber
- Tombol 'Konfirmasi Terima' untuk yang belum confirmed"
```

**Checklist selesai:**
- [ ] Semua halaman tampil data dari API
- [ ] Filter dan status badge berfungsi
- [ ] Form create berjalan dan data tersimpan
- [ ] Status update dari UI mengubah data di backend

---

## SEGMENT 9 — QR Scanner + LotTimeline Component
### 🤖 Gunakan: Claude Sonnet
### ⏱ Estimasi: 1-2 jam
### 👤 Dikerjakan oleh: Frontend Dev C

```
PROMPT UNTUK CLAUDE CODE:

"Baca CONTEXT.md. Segment 8 sudah selesai. Kerjakan SEGMENT 9:

=== QR Scanner Page ===
File: app/(dashboard)/scan/page.jsx
- Gunakan library html5-qrcode
- Scan QR → parse JSON → redirect ke halaman detail lot yang sesuai:
  * type RAW_LOT → /raw-lots/:id
  * type FINISHED_LOT → /finished-lots/:id
- Tampilkan preview kamera
- Handle error: kamera tidak ada, QR tidak valid

=== LotTimeline Component ===
File: components/lots/LotTimeline.jsx
Props: stages (array of RawLotStage atau FinishedLotStage)
- Tampilkan timeline vertikal
- Setiap item: icon status, nama stage, actor, timestamp
- Status terakhir di-highlight (active)
- Gunakan warna status dari CONTEXT.md

=== QRDisplay Component ===
File: components/lots/QRDisplay.jsx
Props: lotId, lotType ('raw' atau 'finished'), lotNumber
- Fetch image dari /api/[type]-lots/:id/qr
- Tampilkan QR code sebagai <img>
- Tombol download QR
- Tombol print"
```

**Checklist selesai:**
- [ ] Kamera aktif dan bisa scan QR
- [ ] Scan redirect ke halaman yang benar
- [ ] Timeline tampil dengan benar dan urut
- [ ] QR bisa di-download

---

## SEGMENT 10 — Polish, Deploy & Dummy Data
### 🤖 Gunakan: Claude Sonnet
### ⏱ Estimasi: 2-3 jam
### 👤 Dikerjakan oleh: Semua

```
PROMPT UNTUK CLAUDE CODE:

"Baca CONTEXT.md. Semua segment sudah selesai. Kerjakan SEGMENT 10:

=== Polish ===
1. Pastikan semua loading state ada (skeleton/spinner)
2. Pastikan semua error state ada (toast notification)
3. Pastikan semua form ada validasi client-side
4. Cek responsive di mobile (operator pakai HP di lapangan)
5. Pastikan semua angka angka terformat (qty, tanggal)

=== Dummy Data Realistis ===
Update prisma/seed.js dengan data yang lebih realistis:
- Nama customer yang masuk akal (PT Indofood, CV Bakers, dll)
- Lot number dengan tanggal yang berbeda-beda
- QC score yang bervariasi
- Beberapa lot yang rejected dengan alasan jelas
- Production order dengan berbagai status

=== Deploy ===
Frontend (Vercel):
- Buat file frontend/.env.production
- NEXT_PUBLIC_API_URL=https://[railway-url]
- Push ke GitHub → connect ke Vercel
- Set environment variable di Vercel dashboard

Backend (Railway):
- Buat Procfile: web: node src/index.js
- Set environment variables di Railway:
  DATABASE_URL, DIRECT_URL, JWT_SECRET, PORT
- Deploy dari GitHub

=== README.md ===
Buat README.md di root project berisi:
- Deskripsi singkat SimaTrack
- Screenshot/GIF demo
- Tech stack
- Cara install lokal (step by step)
- Test credentials (email + password tiap role)
- Link live demo
- Link demo video"
```

**Checklist selesai:**
- [ ] Frontend live di Vercel
- [ ] Backend live di Railway
- [ ] Semua fitur berjalan di production
- [ ] README lengkap
- [ ] Test dengan semua 4 akun role

---

## 📊 Ringkasan Semua Segment

| Seg | Nama | Model | Estimasi | Dev |
|-----|------|-------|----------|-----|
| 1 | Project Setup & Database | Sonnet | 1-2 jam | Backend |
| 2 | Auth & Middleware | Sonnet | 1 jam | Backend |
| 3 | Master Data API | Sonnet | 1 jam | Backend |
| 4 | Core Lot Tracking API | **Opus** | 3-4 jam | Backend |
| 5 | Production & Finished Goods API | **Opus** | 2-3 jam | Backend |
| 6 | Dashboard API + QR | Sonnet | 1 jam | Backend |
| 7 | Frontend Foundation | Sonnet | 2 jam | Frontend A |
| 8 | Frontend Core Pages | **Opus** | 4-5 jam | Frontend A+C |
| 9 | QR Scanner + Components | Sonnet | 1-2 jam | Frontend C |
| 10 | Polish + Deploy | Sonnet | 2-3 jam | Semua |
| | **TOTAL** | | **~18-24 jam** | |

---

## 🚨 Kapan Harus Pakai Opus vs Sonnet

```
Gunakan OPUS untuk:
✅ Segment 4 — logika bisnis kompleks (computed qty, status transitions)
✅ Segment 5 — trigger otomatis saat production completed
✅ Segment 8 — banyak halaman, banyak state, integrasi API kompleks
✅ Debugging bug yang tidak ketemu-ketemu
✅ Merancang ulang arsitektur jika ada masalah fundamental

Gunakan SONNET untuk:
✅ Setup boilerplate (Segment 1, 2, 3)
✅ CRUD sederhana tanpa logika kompleks
✅ Frontend komponen visual (Segment 9)
✅ Deploy dan konfigurasi (Segment 10)
✅ Perbaikan minor / typo / styling
✅ Semua pekerjaan yang instruksinya sudah sangat jelas
```

---

## ✅ Definition of Done (Sebelum Submit)

```
Backend:
□ Semua endpoint di CONTEXT.md berjalan
□ Auth + RBAC berfungsi benar
□ Tidak ada double input dalam alur data
□ remainingQty selalu computed, tidak disimpan
□ Auto-generate lot number konsisten
□ Seed data lengkap dan realistis

Frontend:
□ Login berjalan untuk semua 4 role
□ Setiap role melihat menu yang sesuai
□ Semua CRUD dari UI ke database berjalan
□ QR generate dan scan berjalan
□ Timeline lot tampil urut dan akurat
□ Responsive di mobile

Deployment:
□ Frontend live di Vercel
□ Backend live di Railway
□ Environment variables aman (tidak di-commit)
□ README dengan instruksi install + test credentials
□ Demo video 3 menit sudah direkam
```
