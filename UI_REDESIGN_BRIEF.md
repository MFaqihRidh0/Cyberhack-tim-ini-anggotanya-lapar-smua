# SimaTrack — UI Redesign Brief
# Baca ini sebelum menyentuh satu baris CSS pun

---

## 🎯 Konteks Proyek

SimaTrack adalah platform manajemen operasional manufaktur untuk **Sima Arome** — 
produsen ekstrak natural Indonesia (vanili, jahe, pandan, kayu manis) yang produknya 
dipakai oleh brand F&B, kosmetik, dan wellness.

Aplikasi ini dipakai oleh:
- **Operator gudang** — di lapangan, sering pakai HP, perlu UI yang cepat dibaca
- **QC Staff** — perlu lihat status dan form inspeksi dengan jelas
- **PPIC** — perlu kelola jadwal produksi dan antrian lot
- **Manager** — perlu overview dan laporan

Ini adalah submission untuk **CyberHack 2026 hackathon** — juri akan menilai 
Enterprise Readiness (30%) dan UX/Design (20%). Tampilan harus terlihat 
**production-ready, profesional, dan memorable**.

---

## 🎨 Arah Desain — "Industrial Organic"

### Konsep
Sima Arome adalah perusahaan yang mengolah bahan-bahan alami (rempah, buah, 
herbal) menjadi ekstrak premium. UI-nya harus mencerminkan dua sisi ini:
- **Industrial** — manufaktur, presisi, data-driven, terstruktur
- **Organic** — natural, hangat, bumi, autentik

Hasilnya: tampilan yang **bersih dan profesional** dengan **sentuhan hangat** 
yang membedakannya dari dashboard manufaktur generik yang dingin dan kaku.

### Tone Visual
```
Bukan: Dashboard SaaS generic yang biru-putih dingin
Bukan: Tampilan ERP korporat yang kaku dan membosankan
Tapi:  Platform modern yang terasa seperti dibangun khusus untuk industri 
       ekstrak natural — hangat, dapat dipercaya, dan efisien
```

---

## 🎨 Design System

### Typography
```css
/* Display / Heading besar */
font-family: 'DM Serif Display', serif;   /* Untuk H1, nama halaman utama */

/* UI / Body */
font-family: 'DM Sans', sans-serif;       /* Untuk semua teks UI */

/* Data / Monospace */
font-family: 'JetBrains Mono', monospace; /* Untuk lot number, kode, angka */
```

Import di globals.css:
```css
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
```

### Color Palette
```css
:root {
  /* === PRIMARY — Amber/Orange (brand Sima Arome) === */
  --color-primary-50:  #FFF8ED;
  --color-primary-100: #FFEECF;
  --color-primary-200: #FFD98A;
  --color-primary-300: #FFBC45;
  --color-primary-400: #FFA012;  /* ← Main brand color */
  --color-primary-500: #F97316;  /* ← CTA, active states */
  --color-primary-600: #C2580A;
  --color-primary-700: #9A3F07;
  --color-primary-800: #7C2E04;
  --color-primary-900: #431502;

  /* === NEUTRAL — Warm Gray (bukan cold gray!) === */
  --color-neutral-50:  #FAFAF8;  /* ← Page background */
  --color-neutral-100: #F5F4F0;  /* ← Card background */
  --color-neutral-200: #ECEAE3;  /* ← Border, divider */
  --color-neutral-300: #D6D3C8;  /* ← Subtle border */
  --color-neutral-400: #A8A49A;  /* ← Placeholder text */
  --color-neutral-500: #7D7A72;  /* ← Secondary text */
  --color-neutral-600: #57544E;  /* ← Body text */
  --color-neutral-700: #3D3B36;  /* ← Strong text */
  --color-neutral-800: #28261F;  /* ← Heading */
  --color-neutral-900: #16140E;  /* ← Display heading */

  /* === SEMANTIC COLORS === */
  --color-success-bg:   #ECFDF5;
  --color-success-text: #065F46;
  --color-success-border: #6EE7B7;

  --color-warning-bg:   #FFFBEB;
  --color-warning-text: #92400E;
  --color-warning-border: #FCD34D;

  --color-danger-bg:    #FEF2F2;
  --color-danger-text:  #991B1B;
  --color-danger-border: #FCA5A5;

  --color-info-bg:      #EFF6FF;
  --color-info-text:    #1E40AF;
  --color-info-border:  #93C5FD;

  --color-purple-bg:    #F5F3FF;
  --color-purple-text:  #4C1D95;
  --color-purple-border: #C4B5FD;

  /* === SIDEBAR === */
  --sidebar-bg: #1C1A14;         /* ← Dark warm, seperti kayu gelap */
  --sidebar-text: #E8E4D9;
  --sidebar-text-muted: #8A8479;
  --sidebar-active-bg: #2E2B22;
  --sidebar-active-text: #FFA012;
  --sidebar-border: #2E2B22;

  /* === LAYOUT === */
  --page-bg: #FAFAF8;
  --card-bg: #FFFFFF;
  --card-border: #ECEAE3;
  --card-shadow: 0 1px 3px rgba(22, 20, 14, 0.06), 
                 0 1px 2px rgba(22, 20, 14, 0.04);
  --card-shadow-hover: 0 4px 12px rgba(22, 20, 14, 0.08),
                       0 2px 4px rgba(22, 20, 14, 0.06);

  /* === SPACING & RADIUS === */
  --radius-sm:  6px;
  --radius-md:  10px;
  --radius-lg:  14px;
  --radius-xl:  20px;
  --radius-full: 9999px;
}
```

---

## 🏗 Layout Structure

### Sidebar
```
Width: 220px (fixed)
Background: var(--sidebar-bg) = #1C1A14 (dark warm)

Header:
- Logo icon: flame/leaf SVG berwarna --color-primary-500
- Text "SimaTrack" font DM Serif Display, warna --sidebar-active-text

Navigation items:
- Icon (lucide) + Label
- Active: background --sidebar-active-bg, text --sidebar-active-text, 
          left border 3px solid --color-primary-500
- Hover: background rgba(255,255,255,0.05)
- Padding: 10px 16px, border-radius 8px, margin 2px 8px

Footer (bottom of sidebar):
- Avatar circle dengan inisial nama user
- Nama + role
- Background sedikit lebih terang dari sidebar
```

### Main Content Area
```
Background: var(--page-bg)
Padding: 32px
Max-width: tidak dibatasi (full width - sidebar)

Topbar:
- Height: 56px
- Background: white
- Border-bottom: 1px solid var(--card-border)
- Konten: breadcrumb kiri, user actions kanan
- Shadow: sangat subtle
```

### Page Header Pattern
```
Setiap halaman punya header yang konsisten:
┌─────────────────────────────────────────────┐
│ [Icon] Nama Halaman          [Action Button] │
│ Deskripsi singkat halaman                    │
└─────────────────────────────────────────────┘
```

---

## 📦 Component Patterns

### 1. Cards
```css
.card {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--card-shadow);
  padding: 20px 24px;
  transition: box-shadow 0.15s ease;
}
.card:hover {
  box-shadow: var(--card-shadow-hover);
}
```

### 2. Metric Cards (Dashboard)
```
┌──────────────────────────┐
│ 🔷 [Icon]                │
│                          │
│ 24                       │  ← Angka besar, DM Serif Display
│ Raw Material Lots        │  ← Label kecil, muted
│                          │
│ ──────────────────────   │
│ ↑ 8 QC Pending  · 3 ↓   │  ← Sub-stats kecil dengan warna
└──────────────────────────┘

Style:
- Icon di circle background warna pastel
- Angka utama: 36px, font DM Serif Display, --color-neutral-900
- Label: 13px, --color-neutral-500
- Border-left accent: 3px solid [warna sesuai kategori]
```

### 3. Status Badges
```css
/* Template dasar */
.badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 10px;
  border-radius: var(--radius-full);
  font-size: 12px;
  font-weight: 500;
  font-family: 'DM Sans', sans-serif;
}

/* Dot indicator */
.badge::before {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}
```

Status color mapping:
```
INCOMING          → bg:#F5F4F0  text:#57544E  dot:#A8A49A  (neutral)
QC_PENDING        → bg:#FFFBEB  text:#92400E  dot:#F59E0B  (warning)
QC_APPROVED       → bg:#ECFDF5  text:#065F46  dot:#10B981  (success)
QC_REJECTED       → bg:#FEF2F2  text:#991B1B  dot:#EF4444  (danger)
IN_QUEUE          → bg:#EFF6FF  text:#1E40AF  dot:#3B82F6  (info)
IN_PRODUCTION     → bg:#FFF8ED  text:#9A3F07  dot:#F97316  (primary)
CONSUMED          → bg:#F5F4F0  text:#7D7A72  dot:#D6D3C8  (muted)
ON_HOLD           → bg:#F5F3FF  text:#4C1D95  dot:#8B5CF6  (purple)
PRODUCED          → bg:#EFF6FF  text:#1E40AF  dot:#3B82F6  (info)
IN_WAREHOUSE      → bg:#ECFDF5  text:#065F46  dot:#10B981  (success)
DISPATCHED        → bg:#F5F3FF  text:#4C1D95  dot:#8B5CF6  (purple)
```

### 4. Lot Number Display
```
Lot number adalah identitas utama setiap record — tampilkan dengan istimewa:

┌────────────────────────────────┐
│ SA-RM-20240528-001             │
└────────────────────────────────┘

Style:
- font-family: 'JetBrains Mono', monospace
- font-size: 13px
- font-weight: 500
- background: var(--color-neutral-100)
- border: 1px solid var(--color-neutral-200)
- padding: 4px 10px
- border-radius: var(--radius-sm)
- color: var(--color-neutral-800)
- letter-spacing: 0.02em
```

### 5. Timeline (Lot Stage History)
```
Tampilan vertikal dengan connector line:

●── [INCOMING]         Operator Sima    ← nama actor
│   Bahan masuk dari supplier           ← notes
│   28 Mei 2024, 09:15
│
●── [QC_APPROVED]      QC Staff         
│   Warna bagus, aroma kuat             
│   28 Mei 2024, 11:30
│
◉── [IN_PRODUCTION]    ← ACTIVE (lebih besar, warna primary)
    Sedang diproduksi

Style:
- Connector line: 2px solid var(--color-neutral-200)
- Dot inactive: 10px circle, border 2px solid var(--color-neutral-300)
- Dot active: 14px circle, background --color-primary-500, 
              ring: 4px solid var(--color-primary-100)
- Stage label: font-weight 600, sesuai warna status badge
- Actor: font-size 12px, muted
- Timestamp: font-size 11px, monospace, muted
```

### 6. Data Tables
```css
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

thead th {
  background: var(--color-neutral-50);
  border-bottom: 1px solid var(--color-neutral-200);
  padding: 10px 16px;
  text-align: left;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-neutral-500);
}

tbody tr {
  border-bottom: 1px solid var(--color-neutral-100);
  transition: background 0.1s;
}

tbody tr:hover {
  background: var(--color-neutral-50);
  cursor: pointer;
}

tbody td {
  padding: 12px 16px;
  color: var(--color-neutral-700);
}
```

### 7. Buttons
```css
/* Primary */
.btn-primary {
  background: var(--color-primary-500);
  color: white;
  border: none;
  padding: 9px 18px;
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 500;
  font-family: 'DM Sans', sans-serif;
  cursor: pointer;
  transition: background 0.15s, transform 0.1s;
  display: inline-flex;
  align-items: center;
  gap: 7px;
}
.btn-primary:hover { background: var(--color-primary-600); }
.btn-primary:active { transform: scale(0.98); }

/* Secondary */
.btn-secondary {
  background: white;
  color: var(--color-neutral-700);
  border: 1px solid var(--color-neutral-200);
  /* ... same padding/radius/font ... */
}
.btn-secondary:hover { background: var(--color-neutral-50); }

/* Danger */
.btn-danger {
  background: var(--color-danger-bg);
  color: var(--color-danger-text);
  border: 1px solid var(--color-danger-border);
}
```

### 8. Form Inputs
```css
.input {
  width: 100%;
  padding: 9px 13px;
  border: 1px solid var(--color-neutral-200);
  border-radius: var(--radius-md);
  font-size: 14px;
  font-family: 'DM Sans', sans-serif;
  color: var(--color-neutral-800);
  background: white;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.input:focus {
  outline: none;
  border-color: var(--color-primary-400);
  box-shadow: 0 0 0 3px var(--color-primary-100);
}

.input::placeholder {
  color: var(--color-neutral-400);
}

label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-neutral-600);
  margin-bottom: 6px;
}
```

---

## 📄 Halaman per Halaman

### Login Page
```
Layout: Full screen, centered card
Background: 
  - Gradient sangat subtle dari #FAFAF8 ke #F5F3EE
  - Pattern botanis sangat halus (SVG inline, opacity 0.04)
    motif daun/tanaman di background

Card:
  - Width: 400px
  - Background: white
  - Shadow: besar dan soft
    box-shadow: 0 20px 60px rgba(22, 20, 14, 0.12)
  - Border-radius: 20px
  - Padding: 40px

Header card:
  - Logo icon (flame + leaf) centered, 48px
  - "SimaTrack" — DM Serif Display, 28px, --color-primary-600
  - "Sima Arome Manufacturing System" — 13px, muted

Form:
  - Label + Input pattern standar
  - Tombol "Masuk" full-width, primary orange
  - Test accounts box: background --color-neutral-50, 
    border dashed, font monospace 12px
```

### Dashboard
```
Header section:
  - "Selamat datang, [Nama]!" — DM Serif Display 24px
  - Tanggal hari ini — muted
  - Jika ada alert (QC pending banyak, lot akan expired) → 
    banner notifikasi di bawah header

Metric cards (3 kolom):
  Raw Material Lots  |  Production Orders  |  Finished Goods
  
  Setiap card punya:
  - Icon di circle pastel (16px icon, 40px circle)
  - Angka besar DM Serif Display
  - Sub-stats berwarna

Recent Activity feed:
  - Card penuh lebar
  - List item: [icon status] [lotNumber mono] [stage badge] 
               [actor] [timestamp muted]
  - Max 10 item, tombol "Lihat Semua"
```

### Raw Lots List
```
Header: "Raw Material Lots" + tombol "+ Buat Lot Baru"
Filter tabs: Semua | Incoming | QC Pending | Approved | Rejected | dst

Table columns:
  - Lot Number (monospace, clickable)
  - Material (dengan category badge)
  - Supplier
  - Qty (angka + unit)
  - Received Date
  - Expiry Date (merah jika < 30 hari)
  - Status Badge
  - Action (→ detail)

Empty state jika tidak ada data:
  - Ilustrasi kecil
  - "Belum ada lot bahan baku"
  - Tombol buat baru
```

### Raw Lot Detail
```
Layout: 2 kolom (detail + sidebar)

Kolom kiri (flex-grow):
  - Header: LotNumber besar (monospace), Status badge
  - Info cards: Material, Supplier, Qty Awal, Remaining Qty, 
                Received, Expiry
  - Section "Riwayat QC": list QCInspection dengan scores
  - Section "Dipakai di Produksi": list ProductionInput

Sidebar kanan (320px):
  - Timeline stages (component LotTimeline)
  - QR Code display + tombol download + print
  - Tombol update status (sesuai role)
```

### QC Page
```
Layout: tabs Bahan Baku | Produk Jadi

List lot QC_PENDING:
  - Card per lot (bukan table)
  - Tiap card: lotNumber, material/product, supplier, qty, umur pending
  - Tombol "Inspect" → modal

Modal Inspeksi:
  - Title: "Inspeksi QC — [lotNumber]"
  - Slider skor 1-10 untuk Color, Odor, Texture (visual slider dengan label)
  - Input kadar air
  - Textarea notes
  - 3 tombol: APPROVED (hijau) | ON HOLD (kuning) | REJECTED (merah)
```

### Production Order List & Detail
```
List: Tabel dengan kolom order#, product, target qty, 
      scheduled date, priority badge, status

Detail:
  - Header: orderNumber, status, product
  - Progress bar visual: QUEUED → SCHEDULED → IN_PROGRESS → COMPLETED
  - Section "Bahan Baku": tabel input + form tambah (jika PPIC)
  - Tombol aksi sesuai status saat ini
  - Jika IN_PROGRESS: form input actualQty untuk complete
```

---

## ✨ Detail Finishing yang Membuat Beda

### 1. Expiry Warning
```
Lot dengan expiryDate < 30 hari → row background subtle warning
Lot dengan expiryDate < 7 hari → badge merah "Segera Kadaluarsa"
Lot sudah expired → badge gelap "Kadaluarsa", row di-dim
```

### 2. Empty States
Setiap halaman yang bisa kosong harus punya empty state yang baik:
```
[Icon relevan — 48px, warna muted]
[Judul singkat]
[Deskripsi singkat kenapa kosong]
[Tombol CTA jika ada aksi yang bisa dilakukan]
```

### 3. Loading States
```
- Table loading: skeleton rows (animated pulse)
- Cards loading: skeleton blocks
- Jangan spinner polos — gunakan skeleton yang meniru layout konten
```

### 4. Feedback Toast
```
Posisi: top-center atau bottom-right
Style konsisten dengan color system:
- Success: green bg + check icon
- Error: red bg + x icon
- Duration: 3 detik auto-dismiss
```

### 5. Hover States di Table
```
Row hover: background var(--color-neutral-50)
Cursor: pointer
Transition: 100ms ease
```

### 6. Lot Number Selalu Monospace
Di manapun lot number muncul (tabel, card, timeline, badge) —
selalu gunakan font JetBrains Mono. Ini membuat angka lot 
terlihat presisi dan profesional.

---

## 🚫 Yang HARUS Dihindari

```
❌ Warna biru-putih dingin ala SaaS generic
❌ Font Inter/Roboto untuk semua teks
❌ Tabel tanpa hover state
❌ Status badge tanpa dot indicator
❌ Angka besar dengan font biasa (pakai DM Serif Display)
❌ Sidebar putih (pakai dark sidebar --sidebar-bg)
❌ Shadow yang terlalu gelap atau tidak ada sama sekali
❌ Gray yang terlalu dingin (semua gray harus warm)
❌ Tombol tanpa transition/hover
❌ Empty state kosong (harus ada ilustrasi + CTA)
❌ Lot number dengan font biasa
```

---

## 📐 Implementasi — Urutan Prioritas

Kerjakan dalam urutan ini untuk impact maksimal:

### Priority 1 — Global (Paling Impact, Kerjakan Dulu)
```
1. globals.css — semua CSS variables + font import
2. Sidebar — dark warm sidebar dengan nav items yang benar
3. Layout wrapper — topbar + main content area
4. StatusBadge component — dipakai di semua halaman
5. LotNumber component — monospace display
```

### Priority 2 — Dashboard
```
6. Metric cards — dengan icon circle + angka DM Serif
7. Recent activity feed — timeline mini
```

### Priority 3 — Core Pages
```
8. Table component — dengan hover, loading skeleton, empty state
9. Raw Lots list + detail
10. QC page + modal inspeksi dengan slider score
```

### Priority 4 — Secondary Pages
```
11. Production Order pages
12. Finished Goods + Dispatch pages
13. Login page redesign
14. QR display & scanner pages
```

---

## 💬 Prompt Template untuk Claude Code

Gunakan format ini untuk setiap sesi redesign:

```
Baca UI_REDESIGN_BRIEF.md dan CONTEXT.md.

Kerjakan [Priority X — nama komponen]:

File yang perlu diubah:
- [path file]

Yang harus diimplementasikan:
- [spesifik dari brief di atas]

Jangan ubah logika/data fetching — 
hanya ubah styling dan tampilan visual.
Gunakan CSS variables dari brief, bukan hardcode hex.
```

---

## 🎯 Hasil Akhir yang Diharapkan

Ketika juri membuka SimaTrack, kesan pertama yang harus mereka dapat:

> "Ini tidak terlihat seperti project hackathon biasa. 
>  Ini terlihat seperti produk sungguhan yang dibangun 
>  dengan sangat memperhatikan detail."

Indikator berhasil:
- ✅ Sidebar gelap yang elegant dan berbeda dari default
- ✅ Warna warm (bukan cold gray/blue) di seluruh aplikasi  
- ✅ Lot number selalu monospace dan mudah dibaca
- ✅ Status badge konsisten dengan dot + warna yang tepat
- ✅ Timeline yang jelas dan informatif
- ✅ Dashboard yang langsung memberikan informasi tanpa perlu scroll
- ✅ Setiap halaman punya empty state yang baik
- ✅ Transisi dan hover yang smooth
