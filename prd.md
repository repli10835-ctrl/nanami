# PRODUCT REQUIREMENT DOCUMENT (PRD)

# NANAMI KITCHEN — CLOUD KITCHEN & FOOD ORDERING PLATFORM

**Versi Dokumen:** 1.0.0  
**Status Proyek:** Production Ready  
**Arsitektur:** Full-Stack SSR (TanStack Start + Nitro + PostgreSQL)  
**Terakhir Diperbarui:** 2026-09-16

---

## DAFTAR ISI

1. [Ringkasan Eksekutif & Visi Produk](#1-ringkasan-eksekutif--visi-produk)
2. [Arsitektur Teknis & Tech Stack](#2-arsitektur-teknis--tech-stack)
3. [Manajemen Peran & Akses (RBAC)](#3-manajemen-peran--akses-rbac)
4. [Katalog Halaman & Navigasi Rute (File-Based Routing)](#4-katalog-halaman--navigasi-rute-file-based-routing)
5. [Daftar Fitur Utama & Spesifikasi Fungsional](#5-daftar-fitur-utama--spesifikasi-fungsional)
6. [Skema & Struktur Database (PostgreSQL)](#6-skema--struktur-database-postgresql)
7. [Spesifikasi Server RPC & Server Functions (API)](#7-spesifikasi-server-rpc--server-functions-api)
8. [Alur Penggunaan Sistem (End-to-End User Workflows)](#8-alur-penggunaan-sistem-end-to-end-user-workflows)
9. [Logika Bisnis & Perhitungan Khusus](#9-logika-bisnis--perhitungan-khusus)
10. [Panduan Operasional, Lingkungan (.env), dan Deployment](#10-panduan-operasional-lingkungan-env-dan-deployment)

---

## 1. Ringkasan Eksekutif & Visi Produk

**Nanami Kitchen** adalah aplikasi web full-stack modern terintegrasi untuk operasi restoran dan _cloud kitchen_. Aplikasi ini dirancang untuk menyatukan tiga pilar utama bisnis kuliner:

1. **Storefront Pelanggan (Customer Facing):** Pengalaman pemesanan makanan cepat, responsif, hemat kuota data, dengan dukungan PWA (Progressive Web App), kustomisasi variasi menu, kalkulasi ongkos kirim presisi berbasis radius/titik Google Maps, sistem loyalty point, serta checkout otomatis via WhatsApp.
2. **Operasional Dapur & Admin (Kitchen & Admin Operations):** Pipeline pesanan real-time bergaya Kanban (Kitchen Board) dengan pengatur waktu durasi masak (_timer alert_), pencetakan struk kasir (_thermal receipt printer_), manajemen stok cepat (_instant stock toggle_), serta CRUD katalog menu lengkap.
3. **Kendali Bisnis & Eksekutif (Owner Executive Suite):** Dasbor keuangan komprehensif, analisis metode pembayaran, CMS (_Content Management System_) visual untuk kustomisasi logo/banner/slogan tanpa koding, manajemen voucher diskon, multi-outlet directory, manajemen akun staf, dan audit trail transaksi.

---

## 2. Arsitektur Teknis & Tech Stack

| Komponen                        | Teknologi                                        | Keterangan & Peran                                                                                                                    |
| :------------------------------ | :----------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------ |
| **Framework Inti**              | TanStack Start (v1.168.32)                       | Server-Side Rendering (SSR) & isomorphic rendering berbasis React 19.                                                                 |
| **Router**                      | TanStack Router (v1.170.18)                      | Routing berbasis berkas (_file-based routing_) dengan type-safety penuh.                                                              |
| **Server Engine**               | Nitro (v3.0.260603-beta)                         | Mesin server aplikasi; dikonfigurasi dengan preset **`node-server`** untuk deployment Node.js mandiri / PM2 di VPS.                   |
| **UI Library**                  | React 19 + Radix UI Primitives                   | Komponen UI aksesibel (Dialog, Sheet, Tabs, Accordion, Dropdown, Toggle).                                                             |
| **Styling**                     | Tailwind CSS (v4.2.1) + tw-animate-css           | Sistem utility CSS modern, responsif untuk layar mobile hingga desktop.                                                               |
| **Ikonografi**                  | Lucide React                                     | Ikon grafis vektor konsisten di seluruh antarmuka.                                                                                    |
| **Grafik & Visualisasi**        | Recharts (v2.15.4)                               | Diagram tren penjualan, grafik omset harian/bulanan di panel laporan.                                                                 |
| **Database Driver**             | PostgreSQL (`postgres` v3.4.9)                   | Driver native PostgreSQL berkecepatan tinggi dengan proteksi SQL Injection.                                                           |
| **State Management**            | Isomorphic Custom Store (`useSyncExternalStore`) | Store reaktif dengan selector stabil dan sinkronisasi dua arah ke database server.                                                    |
| **Mode Ketahanan (Resilience)** | In-Memory Fallback System                        | Jika koneksi PostgreSQL offline/unreachable, aplikasi secara aman dan senyap beralih ke state lokal tanpa menyebabkan crash pada SSR. |
| **Validasi Form**               | React Hook Form + Zod                            | Validasi skema tipe data formulir input.                                                                                              |

---

## 3. Manajemen Peran & Akses (RBAC)

Sistem menerapkan kontrol akses berbasis peran (_Role-Based Access Control_) yang dikawal secara ketat melalui komponen gerbang `AuthGuard` (`src/components/AuthGuard.tsx`):

| Role                    | Kode    | Hak Akses & Wewenang                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Akses Rute                                                                                                                            |
| :---------------------- | :------ | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------ |
| **Customer (User)**     | `user`  | • Melihat menu, promo, dan FAQ toko.<br>• Menambah pesanan ke keranjang & kustomisasi opsi.<br>• Mengatur alamat & titik Google Maps.<br>• Melakukan checkout WhatsApp.<br>• Melacak status pesanan secara live.<br>• Mengumpulkan & menukarkan poin loyalitas.<br>• Mengelola daftar alamat favorit dan profil.                                                                                                                                                         | `/`, `/menu/*`, `/cart`, `/checkout`, `/order-success`, `/orders`, `/tracking`, `/address`, `/saved-address`, `/vouchers`, `/profile` |
| **Staff / Kitchen**     | `staff` | • Memantau antrean pesanan dapur (Kitchen Board).<br>• Mengubah status pesanan (_Incoming &rarr; Cooking &rarr; Ready &rarr; Completed_).<br>• Mencetak struk dapur / kasir.<br>• Mengatur ketersediaan stok menu harian.                                                                                                                                                                                                                                                | `/admin` (Kitchen View), `/admin/orders`, `/admin/stock`                                                                              |
| **Admin**               | `admin` | • Seluruh akses Staff / Kitchen.<br>• Manajemen CRUD Menu Makanan & Minuman.<br>• Pengaturan harga, foto, kategori, dan grup variasi.<br>• Manajemen data pelanggan.<br>• Akses laporan operasional dan ekspor.<br>• Pengaturan jam operasional dan radius toko.                                                                                                                                                                                                         | Semua rute `/admin/*` + hak akses Customer                                                                                            |
| **Owner (Super Admin)** | `owner` | • Hak akses penuh atas seluruh modul sistem.<br>• Laporan keuangan, rincian omset, dan margin laba.<br>• Pengaturan CMS storefront (logo, banner, slogan, announcement bar, welcome screen).<br>• Live Simulator pratinjau tampilan toko.<br>• Manajemen kode voucher dan promosi.<br>• Manajemen akun staf, kasir, dan penugasan role.<br>• Pengaturan tarif pengiriman dan faktor rute.<br>• Audit trail / log aktivitas sistem.<br>• Manajemen multi-outlet (cabang). | Semua rute (`/*`, `/admin/*`, `/owner/*`)                                                                                             |

### Akun Demo Bawaan untuk Pengujian Instan:

- **Demo User:** `user@nanami.id` | Kata Sandi: `user123`
- **Demo Admin:** `admin@nanami.id` | Kata Sandi: `admin123`
- **Demo Owner:** `owner@nanami.id` | Kata Sandi: `owner123`

---

## 4. Katalog Halaman & Navigasi Rute (File-Based Routing)

### 4.1 Rute Autentikasi & Gerbang Masuk

- **`/login` (`src/routes/login.tsx`)**: Halaman masuk akun menggunakan email dan kata sandi, dilengkapi tombol _Quick Switch Demo Account_ (User, Admin, Owner) untuk pengujian cepat.
- **`/register` (`src/routes/register.tsx`)**: Halaman pembuatan akun pelanggan baru (Nama, Email, Nomor Telepon/WhatsApp, dan Kata Sandi).
- **`/auth` (`src/routes/auth.tsx`)**: Halaman gerbang universal yang mengarahkan pengguna ke alur login atau registrasi.

### 4.2 Rute Pelanggan (Customer Facing)

- **`/` (`src/routes/index.tsx`)**: Beranda utama toko (Storefront). Memuat:
  - _Welcome Screen_ interaktif saat pertama kali berkunjung.
  - _Running Announcement Bar_ (info/promo/peringatan toko).
  - Header brand dan logo dinamis dari CMS.
  - Banner promosi geser (_Promo Carousel_).
  - Navigasi cepat kategori menu (Foods, Snacks, Drinks, Combos, Others).
  - Daftar menu populer dengan tombol tambah cepat ke keranjang.
  - Toggle tipe pesanan (Pickup / Delivery) serta indikator jam buka (_Open/Closed_).
  - Bagian FAQ (_Accordion FAQ_) interaktif.
  - Tentang kami dan tombol kontak WhatsApp toko.
- **`/menu` (`src/routes/menu.index.tsx`)**: Katalog menu lengkap dengan fitur pencarian teks instan, filter multi-kategori, dan tampilan kartu hidangan lengkap dengan harga serta lencana (_Halal, Spicy, Vegan_).
- **`/menu/$itemId` (`src/routes/menu.$itemId.tsx`)**: Halaman detail item hidangan tertentu, pemilihan ukuran (_Regular / Large_), tingkat kepedasan (_Mild / Medium / Hot_), ekstra topping (_Telur, Keju, Sambal_), dan catatan instruksi khusus ke dapur.
- **`/cart` (`src/routes/cart.tsx`)**: Halaman keranjang belanja. Menampilkan daftar item yang dipilih, pengubah kuantitas (+/-), input kode voucher diskon, subtotal, estimasi ongkos kirim, dan tombol navigasi ke checkout.
- **`/checkout` (`src/routes/checkout.tsx`)**: Alur checkout 3 tahap terpadu:
  1.  _Tahap Alamat:_ Nama penerima, nomor WhatsApp, alamat detail, catatan pengantaran, dan jarak pengiriman.
  2.  _Tahap Pembayaran:_ Pilihan metode bayar (E-Wallet: GoPay/OVO/Dana/ShopeePay, Transfer Bank / EFT, Cash on Delivery / Bayar di Tempat), nomor rekening dan nama pemilik bank toko dengan tombol salin instan.
  3.  _Tahap Konfirmasi:_ Rincian total akhir (subtotal + ongkir - diskon voucher), poin loyalitas yang akan didapat, serta tombol generator pesan WhatsApp otomatis untuk memproses pesanan ke nomor admin dapur.
- **`/order-success` (`src/routes/order-success.tsx`)**: Halaman konfirmasi sukses setelah pesanan dibuat, kode struk transaksi (contoh: `NK-4821`), rincian instruksi transfer, dan tautan langsung ke pelacakan status pesanan.
- **`/orders` (`src/routes/orders.tsx`)**: Riwayat pesanan yang pernah dibuat oleh pelanggan, status pengerjaan saat ini, riwayat pesanan selesai, dan tombol pelacakan langsung.
- **`/tracking` (`src/routes/tracking.tsx`)**: Layar pelacakan pesanan visual real-time dengan status bertahap:
  1.  _Waiting for Payment_ (Menunggu Konfirmasi Bayar)
  2.  _Preparing Your Order / Cooking_ (Dapur Sedang Memasak)
  3.  _Out for Delivery / Ready for Pickup_ (Kurir Menuju Lokasi / Pesanan Siap Diambil)
  4.  _Completed_ (Pesanan Selesai Dinikmati)
- **`/address` (`src/routes/address.tsx`)**: Kalkulator jarak pengiriman. Pengguna dapat menempelkan URL Google Maps lokasi mereka atau mengetik koordinat latitude/longitude untuk menghitung jarak presisi dan estimasi ongkir otomatis.
- **`/saved-address` (`src/routes/saved-address.tsx`)**: Manajemen buku alamat tersimpan milik pelanggan (tambah alamat rumah, kantor, apartemen, atau hapus alamat lama).
- **`/vouchers` (`src/routes/vouchers.tsx`)**: Halaman katalog voucher diskon yang tersedia. Pengguna dapat melihat ketentuan minimum belanja, masa berlaku, dan menyalin kode promo dengan satu kali klik.
- **`/profile` (`src/routes/profile.tsx`)**: Halaman profil akun pelanggan. Menampilkan kartu saldo Poin Loyalitas Nanami, nama, email, nomor telepon, pintasan riwayat order, alamat tersimpan, voucher promo, form ubah kata sandi, dan tombol keluar akun (_Sign Out_).

### 4.3 Rute Operasional Admin (`/admin/*`)

- **`/admin` (`src/routes/admin.index.tsx`)**: Dashboard utama Admin yang menggabungkan:
  - Stat Card Overview: Total Pendapatan, Menu Aktif, Pesanan Dapur Aktif, Voucher & Cabang Aktif.
  - Tab Switcher: Beralih antara **Kitchen Order Pipeline (Kanban Board)** dan **Application CRUD Modules**.
  - Pintasan cepat ke modul Menu, Promosi, CMS, Orders, Cabang, dan Staf.
- **`/admin/menu` (`src/routes/admin.menu.tsx`)**: Panel CRUD Menu lengkap:
  - Form modal tambah/edit hidangan: Nama, Kategori, Harga, Foto/URL, Menit Persiapan (_Prep Time_), Lencana (_Badges_), Stok Awal, dan Pengelompokan Variasi/Topping.
  - Pencarian dan penyaringan menu.
  - Aksi Hapus menu (_Delete_) dengan konfirmasi aman.
- **`/admin/orders` (`src/routes/admin.orders.tsx`)**: Tabel manajemen pesanan harian. Admin dapat memfilter berdasarkan status (_All, Pending, Cooking, Ready, Completed, Cancelled_), menandai pesanan lunas (_Mark Paid_), mengubah status pengantaran, dan mencetak struk transaksi (_Print Receipt_).
- **`/admin/stock` (`src/routes/admin.stock.tsx`)**: Panel kontrol ketersediaan stok instan. Menampilkan sakelar cepat (_Toggle Switch_) per menu untuk mengaktifkan status "Tersedia" atau "Habis (Sold Out)" serta pengaturan angka sisa stok.
- **`/admin/customers` (`src/routes/admin.customers.tsx`)**: Direktori data pelanggan terdaftar, nomor kontak, akumulasi belanja, serta saldo poin loyalitas pelanggan.
- **`/admin/reports` (`src/routes/admin.reports.tsx`)**: Laporan penjualan dan analitik berbasis grafik Recharts (Tren Omset, Distribusi Kategori Terlaris, dan Ringkasan Rata-rata Nilai Pesanan).
- **`/admin/settings` (`src/routes/admin.settings.tsx`)**: Konfigurasi operasional: Sakelar Buka/Tutup Toko (_Store Open/Close_), Sakelar Opsi Pengiriman (_Delivery On/Off_), Sakelar Pengambilan di Tempat (_Pickup On/Off_), Jam Buka Toko, Nomor WhatsApp Kasir, dan Kata Sandi Master Admin.

### 4.4 Rute Eksekutif & Pemilik Toko (`/owner/*`)

- **`/owner` (`src/routes/owner.index.tsx`)**: Dasbor eksekutif pemilik bisnis. Menampilkan performa omset harian/mingguan/bulanan, metrik margin laba kotor, item menu paling laris (_Top Selling_), serta ringkasan aktivitas terkini.
- **`/owner/finance` (`src/routes/owner.finance.tsx`)**: Laporan keuangan mendalam: Rekap total pendapatan, rincian per metode pembayaran (E-Wallet vs Bank Transfer vs COD), total akumulasi diskon voucher yang diklaim, dan total subsidi/biaya pengiriman.
- **`/owner/menu` (`src/routes/owner.menu.tsx`)**: Tinjauan katalog menu dari perspektif pemilik usaha.
- **`/owner/cms` (`src/routes/owner.cms.tsx`)**: Sistem Manajemen Konten Storefront interaktif:
  - Pengaturan identitas brand (Nama Brand, Suffix Brand, Slogan, Deskripsi Usaha, URL Logo kustom).
  - Kustomisasi Teks & Gambar Hero Banner.
  - Pengaturan Teks Pengumuman Berjalan (_Announcement Bar_) dengan tipe info, promo, atau warning.
  - Konfigurasi _Welcome Splash Screen_ (Judul, Subjudul, Gambar Sambutan, dan Durasi Tampil dalam Detik).
  - Kelola tautan media sosial (Instagram, TikTok, WhatsApp, Google Maps URL).
  - CRUD Pertanyaan Umum (FAQ) untuk storefront pelanggan.
- **`/owner/preview` (`src/routes/owner.preview.tsx`)**: Simulator bingkai smartphone (_Live Mobile Preview Frame_) yang memungkinkan pemilik melihat perubahan CMS dan katalog secara _real-time_ seperti yang dilihat oleh pelanggan di layar ponsel.
- **`/owner/vouchers` (`src/routes/owner.vouchers.tsx`)**: Manajemen voucher promosi: Buat kode promo baru, tentukan tipe potongan (persentase `%` atau potongan tetap `Rp`), tetapkan batas minimum belanja (_Min Spend_), dan sakelar aktivasi kode.
- **`/owner/outlets` (`src/routes/owner.outlets.tsx`)**: Direktori cabang gerai (Outlets): Menambah cabang baru, alamat lengkap cabang, jam operasional masing-masing cabang, serta status aktif/tutup per cabang.
- **`/owner/shipping` (`src/routes/owner.shipping.tsx`)**: Konfigurasi tarif logistik pengiriman:
  - Biaya dasar pengantaran (_Base Delivery Fee_).
  - Tarif per kilometer (_Fee per Km_).
  - Biaya ongkir minimum yang ditagihkan (_Minimum Fee_).
  - Radius pengantaran maksimum yang dilayani (_Max Radius in Km_).
  - Ambang batas Gratis Ongkir (_Free Delivery Above Subtotal_).
  - Titik koordinat toko (Latitude & Longitude) serta _Faktor Rute Jalanan_ (misal: 1.3x jarak lurus udara).
- **`/owner/staff` (`src/routes/owner.staff.tsx`)**: Manajemen akun staf, kasir, dan admin: Tambah akun staf baru, penetapan role (_Owner / Admin / Staff_), nomor kontak, email, dan sakelar status aktifasi akun.
- **`/owner/settings` (`src/routes/owner.settings.tsx`)**: Pengaturan master akun rekening bank tujuan transfer (Nama Bank, Nomor Rekening, Nama Pemilik Rekening, Nomor Akun E-Wallet) dan parameter poin loyalitas.
- **`/owner/audit` (`src/routes/owner.audit.tsx`)**: Catatan jejak audit (_Audit Trail Log_) dari seluruh aktivitas penting sistem (pembuatan pesanan baru, perubahan status masak, perubahan konfigurasi harga).

---

## 5. Daftar Fitur Utama & Spesifikasi Fungsional

### 5.1 Dynamic Product Customizer & Cart System

- **Pilihan Variasi Fleksibel:** Setiap hidangan mendukung opsi pilihan tunggal (_single choice_, contoh: Level Kepedasan, Ukuran Porsi) dan pilihan ganda (_multi choice_, contoh: Tambahan Telur Mata Sapi, Ekstra Keju Mozzarella).
- **Kalkulasi Harga Variasi Otomatis:** Harga unit hidangan bertambah secara otomatis sesuai nilai harga topping/opsi yang dipilih.
- **Instruksi Khusus (Cooking Notes):** Pelanggan dapat meninggalkan pesan per item (contoh: "jangan pakai daun bawang", "sambal dipisah").

### 5.2 Smart Delivery Calculator (Google Maps + Haversine)

- Menggunakan formula matematika **Haversine** (`src/lib/geo.ts`) untuk menghitung jarak bulat bumi antara koordinat toko dan koordinat pelanggan.
- Mendukung parser tautan Google Maps otomatis: Pelanggan dapat menyalin tautan peta dari aplikasi Google Maps atau menempel koordinat format `"lat,lng"`.
- Mendukung **Faktor Rute (Route Factor)**: Mengalikan jarak garis lurus dengan faktor rute (default 1.3) untuk mengestimasi jarak tempuh jalan raya aktual secara akurat.
- Proteksi batas radius: Sistem otomatis memblokir checkout delivery jika alamat pelanggan melebihi `maxRadiusKm` yang ditetapkan pemilik toko.

### 5.3 WhatsApp Direct Order Integration

- Setelah pesanan dikonfirmasi pada halaman checkout, sistem menyusun teks pesan pesanan yang terformat rapi dengan emoji, nomor kode order, daftar hidangan beserta opsi topping, rincian subtotal, diskon voucher, ongkir, alamat penerima, metode bayar, dan instruksi bukti transfer.
- Pesan langsung diarahkan ke nomor WhatsApp resmi kasir/admin melalui protokol `https://wa.me/{nomor}?text={encoded_message}`.

### 5.4 Kitchen Order Pipeline (Kanban Board)

- Didesain khusus untuk operasional tablet / layar monitor di area dapur.
- Pesanan dikelompokkan ke dalam 4 kolom kanban:
  1.  **Incoming:** Pesanan baru yang menunggu verifikasi pembayaran.
  2.  **In Progress / Cooking:** Pesanan sedang dimasak oleh tim dapur.
  3.  **Ready:** Pesanan sudah selesai dipacking dan siap diantar kurir atau diambil pelanggan.
  4.  **Completed:** Pesanan selesai diantar/diambil hari ini.
- Dilengkapi indikator peringatan waktu terlambat (_Late Alert_): Pesanan yang berada di dapur lebih dari 30 menit akan otomatis ditandai dengan badge merah berkedip.

### 5.5 Thermal Receipt Printing System

- Fitur cetak struk kasir (_thermal receipt printing_) langsung dari browser via fungsi `printReceipt()` (`src/lib/receipt.ts`).
- Menghasilkan layout struk monokrom standar 58mm / 80mm yang memuat logo brand, kode order, waktu cetak, detail baris pesanan, catatan topping, subtotal, diskon voucher, ongkos kirim, total akhir, nama pelanggan, dan pesan terima kasih.

### 5.6 Customer Loyalty Points Engine

- Setiap kali pesanan berhasil dibuat, pelanggan yang terdaftar mendapatkan poin loyalitas otomatis yang dihitung berdasarkan kelipatan nilai transaksi (default: kelipatan Rp 10.000 memperoleh sejumlah poin tertentu sesuai `pointsPer10k`).
- Saldo poin tercatat di akun pelanggan pada tabel `accounts` dan dapat dipantau di halaman `/profile`.

### 5.7 Visual Storefront CMS Engine

- Pemilik toko dapat memodifikasi seluruh aset visual beranda tanpa perlu menyentuh kode program:
  - Penggantian logo dan slogan toko secara instan.
  - Pengubahan teks promosi berjalan pada _announcement bar_.
  - Pengaturan layar sambutan (_Welcome Screen_) interaktif beserta durasi tayangnya.
  - Penambahan daftar tanya jawab umum (FAQ) pelanggan.
  - Penyuntingan tautan akun Instagram, TikTok, WhatsApp, dan lokasi Google Maps.

---

## 6. Skema & Struktur Database (PostgreSQL)

Database menggunakan PostgreSQL dengan 8 tabel utama yang telah diindeks untuk performa tinggi:

### 6.1 Tabel `app_settings`

Menyimpan konfigurasi parameter toko dan operasional secara terpusat dalam bentuk dokumen JSONB.

```sql
CREATE TABLE IF NOT EXISTS app_settings (
  id VARCHAR(50) PRIMARY KEY, -- Nilai: 'main_settings'
  data JSONB NOT NULL         -- Objek Settings lengkap
);
```

### 6.2 Tabel `cms_content`

Menyimpan konfigurasi konten visual dan teks storefront.

```sql
CREATE TABLE IF NOT EXISTS cms_content (
  id VARCHAR(50) PRIMARY KEY, -- Nilai: 'main_cms'
  data JSONB NOT NULL         -- Objek CmsContent lengkap
);
```

### 6.3 Tabel `menu_items`

Menyimpan seluruh katalog makanan, minuman, dan paket combo.

```sql
CREATE TABLE IF NOT EXISTS menu_items (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  category VARCHAR(100) NOT NULL, -- 'Foods' | 'Snacks' | 'Drinks' | 'Combos' | 'Others'
  image TEXT,
  available BOOLEAN NOT NULL DEFAULT TRUE,
  prep_minutes INTEGER NOT NULL DEFAULT 15,
  badges JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array string: ["Halal-friendly", "Spicy"]
  stock INTEGER,                             -- Nullable jika tidak membatasi stok
  groups JSONB NOT NULL DEFAULT '[]'::jsonb  -- Definisi variasi & topping
);
```

### 6.4 Tabel `orders`

Menyimpan seluruh transaksi pemesanan yang masuk.

```sql
CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(50) PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,          -- Kode struk pesanan (e.g. 'NK-7892')
  created_at BIGINT NOT NULL,                -- Timestamp milidetik
  type VARCHAR(20) NOT NULL,                 -- 'pickup' | 'delivery'
  lines JSONB NOT NULL,                      -- Array item pesanan (CartLine[])
  subtotal NUMERIC NOT NULL,
  discount NUMERIC NOT NULL,
  voucher_code VARCHAR(50),
  delivery_fee NUMERIC NOT NULL,
  total NUMERIC NOT NULL,
  status VARCHAR(50) NOT NULL,               -- 'Pending Payment' | 'Cooking' | 'Out for Delivery' | 'Ready for Pickup' | 'Completed' | 'Cancelled'
  paid BOOLEAN NOT NULL DEFAULT FALSE,
  payment_method VARCHAR(100) NOT NULL,      -- 'ewallet' | 'bank' | 'cod'
  points_earned INTEGER NOT NULL DEFAULT 0,
  eta_minutes INTEGER NOT NULL DEFAULT 15,
  customer JSONB NOT NULL                    -- { name, phone, address, deliveryNote }
);
```

### 6.5 Tabel `promos`

Menyimpan daftar banner promosi geser pada carousel beranda.

```sql
CREATE TABLE IF NOT EXISTS promos (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  subtitle TEXT NOT NULL,
  badge VARCHAR(100) NOT NULL,
  image_url TEXT,
  link TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE
);
```

### 6.6 Tabel `vouchers`

Menyimpan kode kupon diskon toko.

```sql
CREATE TABLE IF NOT EXISTS vouchers (
  code VARCHAR(50) PRIMARY KEY,              -- e.g. 'NANAMI20'
  type VARCHAR(20) NOT NULL,                 -- 'percent' | 'fixed'
  value NUMERIC NOT NULL,                    -- Nilai potongan (persen atau rupiah)
  min_spend NUMERIC NOT NULL,                -- Syarat minimum subtotal
  active BOOLEAN NOT NULL DEFAULT TRUE
);
```

### 6.7 Tabel `accounts`

Menyimpan kredensial pengguna, pelanggan, dan hak akses.

```sql
CREATE TABLE IF NOT EXISTS accounts (
  id VARCHAR(50) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'user',  -- 'user' | 'admin' | 'owner'
  address TEXT,
  addresses JSONB NOT NULL DEFAULT '[]'::jsonb,
  points INTEGER NOT NULL DEFAULT 0
);
```

### 6.8 Tabel `staff`

Menyimpan data anggota tim dapur, admin, dan supervisor.

```sql
CREATE TABLE IF NOT EXISTS staff (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(100) NOT NULL,
  role VARCHAR(50) NOT NULL,                 -- 'owner' | 'admin' | 'staff'
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at BIGINT NOT NULL
);
```

---

## 7. Spesifikasi Server RPC & Server Functions (API)

Aplikasi memanfaatkan fitur **Server Functions** TanStack Start (`createServerFn`) di file `src/lib/server-functions.ts` yang dieksekusi secara eksklusif di lingkungan server Node.js:

| Nama Fungsi        | HTTP Method | Validasi Payload     | Deskripsi & Operasi Database                                                                                                                                                      |
| :----------------- | :---------- | :------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `getDatabaseState` | `GET`       | _None_               | Mengambil seluruh state awal aplikasi dari PostgreSQL (settings, CMS, menu, orders, promos, vouchers, accounts, staff) dalam satu pemanggilan terpadu saat inisialisasi aplikasi. |
| `saveMenuItemDb`   | `POST`      | `MenuItem` object    | Menyimpan atau memperbarui data menu hidangan (Upsert via `ON CONFLICT (id) DO UPDATE`).                                                                                          |
| `deleteMenuItemDb` | `POST`      | `id: string`         | Menghapus hidangan menu dari database PostgreSQL berdasarkan ID.                                                                                                                  |
| `saveOrderDb`      | `POST`      | `Order` object       | Menyimpan pesanan baru atau memperbarui status bayar/tahap masak pesanan yang ada.                                                                                                |
| `saveVoucherDb`    | `POST`      | `Voucher` object     | Menyimpan atau memperbarui kupon diskon (Upsert via `ON CONFLICT (code) DO UPDATE`).                                                                                              |
| `deleteVoucherDb`  | `POST`      | `code: string`       | Menghapus kode voucher diskon dari database.                                                                                                                                      |
| `savePromoDb`      | `POST`      | `Promo` object       | Menyimpan atau memperbarui banner promosi di carousel beranda.                                                                                                                    |
| `deletePromoDb`    | `POST`      | `id: string`         | Menghapus banner promosi dari database.                                                                                                                                           |
| `saveAccountDb`    | `POST`      | `Account` object     | Menyimpan pendaftaran pengguna baru atau memperbarui saldo poin/alamat pelanggan.                                                                                                 |
| `saveStaffDb`      | `POST`      | `StaffMember` object | Menyimpan atau memperbarui akun staf dan hak akses role.                                                                                                                          |
| `saveSettingsDb`   | `POST`      | `Settings` object    | Menyimpan seluruh konfigurasi operasional toko ke tabel `app_settings`.                                                                                                           |
| `saveCmsDb`        | `POST`      | `CmsContent` object  | Menyimpan seluruh teks, logo, banner, dan FAQ toko ke tabel `cms_content`.                                                                                                        |

---

## 8. Alur Penggunaan Sistem (End-to-End User Workflows)

### Alur 1: Pelanggan Memesan Makanan (Customer Order Journey)

```
[Buka Halaman Utama /]
         ↓
[Lihat Promo & Kategori] ──→ [Cari Menu di /menu]
         ↓
[Pilih Item Hidangan] ──→ [Pilih Variasi & Topping di Sheet/Detail]
         ↓
[Tambah ke Keranjang] ──→ [Buka /cart]
         ↓
[Masukkan Voucher Diskon] ──→ [Pilih Opsi: Pickup atau Delivery]
         ↓
[Ke Halaman /checkout]
    ├── Langkah 1: Isi Nama, HP, & Alamat (Hitung Jarak Google Maps)
    ├── Langkah 2: Pilih Metode Bayar (E-Wallet / Bank Transfer / COD)
    └── Langkah 3: Konfirmasi Pesanan & Klik "Order via WhatsApp"
         ↓
[Dialihkan ke WhatsApp Kasir Toko dengan Format Pesanan Otomatis]
         ↓
[Pesanan Tercatat di Sistem & Pelanggan Dapat Memantau di /tracking]
```

### Alur 2: Dapur Memproses Pesanan (Kitchen Pipeline Workflow)

```
[Pesanan Baru Masuk via Web / WhatsApp]
         ↓
[Tampil di Kolom "Incoming" pada /admin Kitchen Board]
         ↓
[Kasir Memeriksa Bukti Transfer & Mengklik "Start cooking"]
         ↓
[Pesanan Berpindah ke Kolom "In Progress / Cooking"]
(Jika durasi persiapan > 30 menit, muncul indikator LATE merah)
         ↓
[Makanan Selesai Dimasak & Dipacking] ──→ [Klik "Print Receipt" (Cetak Struk)]
         ↓
[Dapur Mengklik "Mark ready"]
         ↓
[Pesanan Berpindah ke "Out for Delivery" (Kurir) atau "Ready for Pickup" (Pelanggan)]
         ↓
[Pesanan Diterima Pelanggan & Ditandai "Completed"]
```

### Alur 3: Pemilik Mengubah Branding & Pengumuman Toko (Owner CMS Workflow)

```
[Owner Masuk ke Akun di /login]
         ↓
[Membuka Panel /owner/cms]
         ↓
[Mengubah Teks Pengumuman Berjalan / Ganti Logo / Ubah Durasi Splash Screen]
         ↓
[Buka Tab /owner/preview untuk Memverifikasi Visual di Simulator Layar HP]
         ↓
[Klik Simpan & Konten Langsung Aktif di Seluruh Pengguna Secara Real-Time]
```

---

## 9. Logika Bisnis & Perhitungan Khusus

### 9.1 Formula Kalkulasi Ongkos Kirim (`deliveryFeeFor`)

Ongkos kirim dihitung berdasarkan rumus matematis berikut:

1.  Jika tipe pesanan adalah **`pickup`**, maka `Delivery Fee = 0`.
2.  Jika nilai subtotal belanja $\ge$ `settings.freeDeliveryAbove` (dan nilai ambang batas $> 0$), maka `Delivery Fee = 0` (Gratis Ongkir).
3.  Untuk pengantaran reguler:
    $$\text{Biaya Terhitung} = \text{BaseFee} + (\text{DistanceKm} \times \text{FeePerKm})$$
4.  Total biaya yang ditagihkan adalah nilai tertinggi antara Biaya Terhitung dan Biaya Minimum:
    $$\text{Final Delivery Fee} = \max(\text{MinFee}, \text{Round}(\text{Biaya Terhitung}))$$

### 9.2 Perhitungan Jarak Koordinat (Formula Haversine)

Perhitungan jarak antara lokasi outlet $(\text{lat}_1, \text{lng}_1)$ dan lokasi pembeli $(\text{lat}_2, \text{lng}_2)$:
$$\Delta\text{lat} = \text{rad}(\text{lat}_2 - \text{lat}_1), \quad \Delta\text{lng} = \text{rad}(\text{lng}_2 - \text{lng}_1)$$
$$a = \sin^2\left(\frac{\Delta\text{lat}}{2}\right) + \cos(\text{rad}(\text{lat}_1)) \cdot \cos(\text{rad}(\text{lat}_2)) \cdot \sin^2\left(\frac{\Delta\text{lng}}{2}\right)$$
$$c = 2 \cdot \text{atan2}(\sqrt{a}, \sqrt{1 - a})$$
$$\text{Jarak Tempuh (Km)} = (6371 \times c) \times \text{RouteFactor}$$

### 9.3 Validasi Kupon Diskon Voucher (`discountFor`)

- **Voucher Tipe Persentase (`percent`):**
  $$\text{Diskon} = \text{Subtotal} \times \left(\frac{\text{Nilai}}{100}\right)$$
- **Voucher Tipe Potongan Tetap (`fixed`):**
  $$\text{Diskon} = \min(\text{Subtotal}, \text{Nilai})$$
- _Catatan:_ Jika $\text{Subtotal} < \text{MinSpend}$, maka nilai diskon adalah 0 dan voucher tidak dapat diaplikasikan.

---

## 10. Panduan Operasional, Lingkungan (.env), dan Deployment

### 10.1 Variabel Lingkungan (`.env`)

Pastikan berkas `.env` telah dikonfigurasi di root direktori proyek:

```env
# Koneksi Database PostgreSQL
DATABASE_URL=postgresql://postgres:KATA_SANDI@localhost:5432/NANAMIKITCHEN

# Port Server Aplikasi (Wajib disesuaikan dengan alokasi port VPS Anda)
PORT=5000

# Mode Lingkungan
NODE_ENV=production
```

### 10.2 Perintah Setup Database

Inisialisasi tabel dan data benih (_seed data_) dapat dijalankan langsung melalui skrip bawaan:

```bash
# Membuat seluruh tabel PostgreSQL yang dibutuhkan:
npm run db:push

# Mengisi data awal katalog menu, promo, voucher, dan akun demo:
npm run db:seed
```

### 10.3 Panduan Build & Menjalankan Aplikasi di VPS dengan PM2

Karena konfigurasi Vite telah disetel menggunakan preset Nitro **`node-server`**, proses kompilasi menghasilkan server Node.js murni di direktori `.output/`:

```bash
# 1. Menarik pembaruan kode terbaru
git pull origin main

# 2. Memasang dependensi
npm install

# 3. Mengompilasi aplikasi untuk produksi
npm run build

# 4. Menjalankan / Memulai ulang layanan dengan PM2
pm2 restart nanami-kitchen || pm2 start npm --name "nanami-kitchen" -- run start

# 5. Memeriksa status dan log server
pm2 logs nanami-kitchen
```

### 10.4 Konfigurasi Nginx Reverse Proxy (Contoh Konfigurasi)

```nginx
server {
    listen 80;
    server_name kitchen.domainanda.com;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

_Dokumen ini merupakan spesifikasi acuan resmi pengembangan dan operasional platform Nanami Kitchen._
