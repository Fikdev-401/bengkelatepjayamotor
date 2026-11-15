# Bengkel Atep Jaya Motor

Website landing page + panel admin untuk bengkel motor. Pengunjung bisa melihat
layanan dan membuat booking; pesanan langsung masuk ke dashboard admin, lalu
pelanggan diarahkan ke WhatsApp bengkel untuk konfirmasi. Tidak ada payment
gateway — pembayaran dilakukan langsung di bengkel.

## Struktur

```
.
├── frontend/            # React + Vite (landing page & dashboard admin)
│   ├── src/pages/       # LandingPage, admin/Login, Dashboard, Orders, Services
│   ├── src/components/  # Navbar, BookingForm, ServiceCard, Modal, dll.
│   ├── src/config/      # Profil bengkel (WA, alamat, jam buka)
│   ├── src/lib/         # API client, format, template pesan WhatsApp
│   └── src/styles.css   # Seluruh styling landing & admin
└── backend/             # Express + Prisma + MySQL
    ├── prisma/
    │   ├── schema.prisma
    │   ├── migrations/  # Migrasi awal
    │   └── seed.js      # Admin + 8 contoh layanan
    └── src/
        ├── routes/      # Endpoint publik & /admin
        ├── controllers/ # Auth, layanan, pesanan, statistik
        ├── middleware/  # JWT auth, error handler
        └── utils/       # Validasi input
```

## Fitur

**Landing page**
- Hero, layanan, tentang, keunggulan, cara pesan, testimoni, kontak, footer — responsif.
- Daftar layanan diambil dari API (bukan hardcode).
- Form booking: nama, WhatsApp, motor, nopol, layanan, tanggal, keluhan.
- Setelah booking tersimpan, muncul kode pesanan dan tombol **Lanjutkan ke WhatsApp**
  dengan pesan yang sudah terisi otomatis (kode booking, layanan, jadwal, keluhan).
- Semua CTA WhatsApp memakai satu nomor yang diatur lewat `VITE_SHOP_WHATSAPP`.
- Halaman **Cek Status Booking** (`/cek-booking`) untuk melacak pesanan dengan kode
  booking, lengkap dengan timeline status. Halaman ini hanya menampilkan data
  ringkasan — nomor HP dan catatan internal admin tidak ikut ditampilkan.

**Dashboard admin** (`/admin`)
- Login JWT (email + password).
- Statistik: menunggu konfirmasi, sedang dikerjakan, selesai bulan ini, total pesanan.
- Daftar pesanan + filter status, pencarian kode/nama/HP, pagination.
- Detail pesanan: ubah status (`PENDING`, `CONFIRMED`, `IN_PROGRESS`, `COMPLETED`,
  `CANCELLED`), catatan admin, dan tombol chat pelanggan.
- CRUD layanan: tambah, ubah, hapus, aktif/nonaktif, tandai favorit, atur urutan.

## Prasyarat

- Node.js 20+ (diuji pada Node 26)
- MySQL 8+ / MariaDB
- npm

## 1. Menyiapkan backend

```bash
cd backend
npm install
```

Buat database:

```sql
CREATE DATABASE atep_jaya_motor CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Salin environment lalu sesuaikan:

```bash
cp .env.example .env
```

Isi penting di `backend/.env`:

```env
DATABASE_URL="mysql://root:password@localhost:3306/atep_jaya_motor"
JWT_SECRET="kunci-rahasia-panjang-dan-acak"
SEED_ADMIN_EMAIL=admin@atepjayamotor.com
SEED_ADMIN_PASSWORD=admin12345
```

Jalankan migrasi, seed, dan server:

```bash
npm run prisma:migrate     # membuat tabel dari prisma/migrations
npm run seed               # membuat akun admin + 8 layanan contoh
npm run dev                # http://localhost:4000/api
```

> Untuk production gunakan `npm run prisma:deploy` (bukan `migrate dev`).

Akun admin hasil seed:

| Email | Password |
| --- | --- |
| `admin@atepjayamotor.com` | `admin12345` |

Segera ganti password/akun ini sebelum website dipublikasikan.

## 2. Menyiapkan frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev                # http://localhost:5173
```

Saat development, Vite mem-proxy `/api` ke port backend yang tertulis di
`backend/.env` (default `4000`), jadi `VITE_API_URL` boleh dikosongkan. Untuk
production isi dengan URL API lengkap, misalnya
`https://api.atepjayamotor.com/api`.

## Alur booking → WhatsApp

1. Pengunjung memilih layanan (tombol **Booking** mengisi form otomatis).
2. Form dikirim → `POST /api/orders` menyimpan pesanan dengan kode
   `AJM-YYMMDD-XXXX` dan status `PENDING`.
3. Pesanan **langsung muncul** di dashboard admin.
4. Di halaman sukses, pengunjung menekan **Lanjutkan ke WhatsApp**. Pesan WA
   terbuka otomatis berisi kode booking, nama, layanan, jadwal, dan keluhan.
5. Admin mengonfirmasi jadwal lewat WA, lalu memperbarui status di dashboard.
6. Pelanggan dapat memantau status kapan saja di `/cek-booking` dengan memasukkan
   kode booking (bisa lewat menu **Cek Booking** atau tautan di halaman sukses).

## Endpoint API

| Method | Endpoint | Akses | Keterangan |
| --- | --- | --- | --- |
| GET | `/api/health` | publik | Cek server |
| POST | `/api/auth/login` | publik | Login admin |
| GET | `/api/auth/me` | admin | Profil admin |
| GET | `/api/services` | publik | Layanan aktif |
| GET | `/api/services/:slug` | publik | Detail layanan |
| POST | `/api/orders` | publik | Buat booking |
| GET | `/api/orders/track/:code` | publik | Cek status booking dari kode |
| GET | `/api/admin/stats` | admin | Statistik dashboard |
| GET | `/api/admin/orders` | admin | List pesanan (`status`, `search`, `page`, `limit`) |
| GET | `/api/admin/orders/:id` | admin | Detail pesanan |
| PATCH | `/api/admin/orders/:id` | admin | Ubah `status` / `adminNote` |
| GET | `/api/admin/services` | admin | Semua layanan (termasuk nonaktif) |
| POST | `/api/admin/services` | admin | Tambah layanan |
| PUT | `/api/admin/services/:id` | admin | Ubah layanan |
| DELETE | `/api/admin/services/:id` | admin | Hapus layanan |

Contoh membuat booking:

```bash
curl -X POST http://localhost:4000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "Budi",
    "phone": "081234567890",
    "serviceId": 1,
    "vehicle": "Honda Vario 160",
    "preferredDate": "2026-11-20",
    "complaint": "Suara mesin kasar"
  }'
```

## Kustomisasi sebelum dipublikasikan

Data berikut masih berupa contoh — wajib diganti:

- **Nomor WhatsApp** → `frontend/.env` (`VITE_SHOP_WHATSAPP`, format `62...`
  tanpa `+`/spasi). Nomor tampilan di website otomatis mengikuti nilai ini.
- **Alamat, jam buka, statistik, email** → `frontend/src/config/site.js`.
  Alamat dipakai untuk link dan peta Google Maps.
- **Konten hero, tentang, testimoni, keunggulan** → `frontend/src/pages/LandingPage.jsx`.
- **Layanan & harga** → lewat dashboard admin, atau `backend/prisma/seed.js`
  untuk data awal.
- **Akun admin** → variabel `SEED_ADMIN_*` sebelum menjalankan seed, dan
  `JWT_SECRET` yang kuat di production.

## Deploy (ringkas)

1. Backend: set `NODE_ENV=production`, `DATABASE_URL`, `JWT_SECRET` kuat,
   `FRONTEND_URL=https://domain-anda.com`; jalankan `npm ci`,
   `npm run prisma:deploy`, lalu `npm start`.
2. Frontend: set `VITE_API_URL=https://api.domain-anda.com/api`, jalankan
   `npm ci && npm run build`, lalu sajikan folder `frontend/dist` (Nginx,
   Vercel, Netlify, dll). Pastikan routing SPA diarahkan ke `index.html`
   agar `/admin` bisa diakses langsung.
3. Login ke `/admin`, ganti akun/password admin, lalu sesuaikan layanan.

## Perintah berguna

```bash
# backend
npm run dev              # server dengan watch
npm run start            # production
npm run prisma:studio    # lihat database secara visual
npm run prisma:deploy    # migrasi di production
npm run seed             # seed ulang (idempoten)

# frontend
npm run dev
npm run build
npm run preview
```
