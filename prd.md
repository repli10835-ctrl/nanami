# PRODUCT REQUIREMENT DOCUMENT (PRD)

# NANAMI KITCHEN — CLOUD KITCHEN & FOOD ORDERING PLATFORM

**Versi Dokumen:** 1.3.0  
**Status Proyek:** Production Ready & Live  
**Arsitektur:** Full-Stack SSR (TanStack Start + Nitro + PostgreSQL / In-Memory Resilient Fallback)  
**Mata Uang & Wilayah Target:** N$ (Namibia Dollar) / Wilayah Namibia & Windhoek  
**Terakhir Diperbarui:** 2026-09-16

---

## DAFTAR ISI

1. [Ringkasan Eksekutif & Visi Produk](#1-ringkasan-eksekutif--visi-produk)
2. [Arsitektur Teknis & Tech Stack](#2-arsitektur-teknis--tech-stack)
3. [Manajemen Peran, Akses (RBAC), & Alur Guest Checkout](#3-manajemen-peran-akses-rbac--alur-guest-checkout)
4. [Katalog Halaman, Struktur Navigasi, & Rute (File-Based Routing)](#4-katalog-halaman-struktur-navigasi--rute-file-based-routing)
   - 4.1 [Rute Autentikasi & Status Social Sign-In](#41-rute-autentikasi--status-social-sign-in)
   - 4.2 [Rute Storefront Pelanggan, Top Bar Minimalis, & 4-Tab Bottom Nav](#42-rute-storefront-pelanggan-top-bar-minimalis--4-tab-bottom-nav)
   - 4.3 [Rute Operasional Admin & Struktur Sidebar](#43-rute-operasional-admin--struktur-sidebar)
   - 4.4 [Rute Eksekutif & Pemilik Toko (Owner Suite)](#44-rute-eksekutif--pemilik-toko-owner-suite)
5. [Daftar Fitur Utama & Spesifikasi Fungsional](#5-daftar-fitur-utama--spesifikasi-fungsional)
   - 5.1 [Storefront Pelanggan, Header Tanpa Logo, & Navigasi ScrollSpy](#51-storefront-pelanggan-header-tanpa-logo--navigasi-scrollspy)
   - 5.2 [Kustomisasi Produk, Badges, Estimasi Masak, & Standar 5 Kategori CMS](#52-kustomisasi-produk-badges-estimasi-masak--standar-5-kategori-cms)
   - 5.3 [Berbagi Menu & Keranjang (Web Share API & WhatsApp Direct Share)](#53-berbagi-menu--keranjang-web-share-api--whatsapp-direct-share)
   - 5.4 [Kalkulator Ongkos Kirim Presisi & Geolokasi GPS Otomatis](#54-kalkulator-ongkos-kirim-presisi--geolokasi-gps-otomatis)
   - 5.5 [Kontrol Status Operasional Toko & Validasi Layanan Checkout](#55-kontrol-status-operasional-toko--validasi-layanan-checkout)
   - 5.6 [Perpajakan (VAT 15%) & Metode Pembayaran Lokal (Pay2Cell, Bank, COD)](#56-perpajakan-vat-15--metode-pembayaran-lokal-pay2cell-bank-cod)
   - 5.7 [Checkout WhatsApp Otomatis & Standarisasi Bahasa Inggris](#57-checkout-whatsapp-otomatis--standarisasi-bahasa-inggris)
   - 5.8 [Operasional Dapur: Kitchen Kanban Board & Alert Keterlambatan](#58-operasional-dapur-kitchen-kanban-board--alert-keterlambatan)
   - 5.9 [Manajemen Pesanan Admin, Posisi Sidebar Orders, & Rekap Penjualan 7 Hari](#59-manajemen-pesanan-admin-posisi-sidebar-orders--rekap-penjualan-7-hari)
   - 5.10 [Pencetakan Struk Kasir Termal & Fitur Thermal Auto-Print](#510-pencetakan-struk-kasir-termal--fitur-thermal-auto-print)
   - 5.11 [Poin Loyalitas Pelanggan](#511-poin-loyalitas-pelanggan)
   - 5.12 [Visual Storefront CMS & Live Smartphone Simulator](#512-visual-storefront-cms--live-smartphone-simulator)
   - 5.13 [Media Gallery & Manajemen Aset Foto Produk](#513-media-gallery--manajemen-aset-foto-produk)
   - 5.14 [Manual Save System & Proteksi Unsaved Changes](#514-manual-save-system--proteksi-unsaved-changes)
   - 5.15 [Pemisahan Akun Staf Internal vs Direktori Pelanggan](#515-pemisahan-akun-staf-internal-vs-direktori-pelanggan)
6. [Skema & Struktur Database (PostgreSQL)](#6-skema--struktur-database-postgresql)
7. [Spesifikasi Server RPC & Server Functions (API)](#7-spesifikasi-server-rpc--server-functions-api)
8. [Alur Penggunaan Sistem (End-to-End User Workflows)](#8-alur-penggunaan-sistem-end-to-end-user-workflows)
9. [Logika Bisnis & Formula Perhitungan](#9-logika-bisnis--formula-perhitungan)
10. [Panduan Operasional, Variabel Lingkungan (.env), dan Deployment](#10-panduan-operasional-variabel-lingkungan-env-dan-deployment)

---

## 1. Ringkasan Eksekutif & Visi Produk

**Nanami Kitchen** adalah platform web aplikasi full-stack modern terintegrasi yang dirancang untuk operasi restoran dan _cloud kitchen_. Aplikasi ini berfokus pada kecepatan, efisiensi operasional, dan kepuasan pelanggan dengan menyatukan tiga pilar utama:

1. **Storefront Pelanggan Bebas Hambatan (Customer PWA):** Memungkinkan pelanggan menjelajah menu, memilih variasi, melihat waktu persiapan dan lencana diet/alergen, mengisi instruksi khusus dapur, menghitung ongkos kirim berbasis koordinat Google Maps atau tombol GPS otomatis, serta menyelesaikan pesanan tanpa wajib membuat akun (**Guest Checkout**) melalui integrasi checkout WhatsApp otomatis dengan mata uang **Namibia Dollar (N$)**.
2. **Operasional Dapur & Manajemen Pesanan Real-Time (Kitchen & Admin Operations):** Pipeline pesanan dua arah yang menyediakan tampilan visual **Kitchen Kanban Board** (dengan sistem peringatan keterlambatan masak >30 menit), tabel **Order Management** komprehensif untuk kasir, pencetakan struk kasir termal (58mm/80mm) dengan fitur **Thermal Auto-Print** saat pesanan mulai dimasak, tab rekap penjualan 7 hari, sakelar ketersediaan stok cepat (_instant stock toggle_), serta Media Gallery untuk foto hidangan.
3. **Kendali Bisnis & Manajemen Konten Eksekutif (Owner Executive Suite):** Dasbor keuangan, audit trail transaksi, CMS visual (_Content Management System_) untuk mengatur hero banner, announcement bar, welcome splash screen, urutan kategori, dan koleksi "Must Try!" dengan simulator layar ponsel _real-time_, serta sistem penyimpanan manual terproteksi (_Manual Save & Unsaved Changes Prompt_).

---

## 2. Arsitektur Teknis & Tech Stack

| Komponen                  | Teknologi                                        | Keterangan & Peran                                                                                                                                       |
| :------------------------ | :----------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Framework Inti**        | TanStack Start (v1.168.32)                       | Server-Side Rendering (SSR) dan isomorphic state hydration berbasis React 19.                                                                            |
| **Router**                | TanStack Router (v1.170.18)                      | Routing berbasis berkas (_file-based routing_) dengan type-safety menyeluruh di klien dan server.                                                        |
| **Server Engine**         | Nitro (v3.0.260603-beta)                         | Mesin server aplikasi; dikonfigurasi dengan preset **`node-server`** untuk deployment Node.js / container mandiri.                                       |
| **UI Library**            | React 19 + Radix UI Primitives                   | Komponen UI aksesibel tingkat tinggi (Dialog, Sheet, Tabs, Accordion, Dropdown, Toggle, Tooltip).                                                        |
| **Styling & Animasi**     | Tailwind CSS (v4.2.1) + tw-animate-css           | Sistem utility CSS modern berkecepatan tinggi, responsif untuk mobile hingga desktop.                                                                    |
| **Ikonografi**            | Lucide React (v0.575.0)                          | Ikon grafis vektor konsisten di seluruh storefront dan dashboard.                                                                                        |
| **Grafik & Analitik**     | Recharts (v2.15.4)                               | Diagram tren omset, perbandingan metode pembayaran, dan grafik kategori terlaris.                                                                        |
| **Database Driver**       | PostgreSQL (`postgres` v3.4.9)                   | Driver native PostgreSQL berkecepatan tinggi dengan proteksi SQL injection via tagged templates.                                                         |
| **Resilience / Fallback** | In-Memory Local Store                            | Jika `DATABASE_URL` belum disetel atau database PostgreSQL tidak dapat diakses, sistem beralih otomatis ke in-memory store tanpa membuat aplikasi crash. |
| **State Management**      | Isomorphic Custom Store (`useSyncExternalStore`) | Store reaktif dengan selector stabil, sinkronisasi dua arah ke database, dan caching teroptimasi.                                                        |
| **Format Mata Uang**      | `src/lib/currency.ts`                            | Pemformat terpusat menggunakan simbol **N$** (Namibia Dollar) dan locale `en-ZA`.                                                                        |
| **PWA & Offline**         | Service Worker (`/public/sw.js`) + Manifest      | Dukungan install home screen (Add to Home Screen), caching aset statis, dan prompt instalasi.                                                            |

---

## 3. Manajemen Peran, Akses (RBAC), & Alur Guest Checkout

Sistem menerapkan kontrol akses berbasis peran (_Role-Based Access Control_) yang dikawal oleh komponen gerbang `AuthGuard` (`src/components/AuthGuard.tsx`):

### 3.1 Matriks Peran & Wewenang

| Role                    | Kode    | Hak Akses & Wewenang                                                                                                                                                                                                               | Status Login                              | Akses Rute                                                                                   |
| :---------------------- | :------ | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------- | :------------------------------------------------------------------------------------------- |
| **Guest (Tamu)**        | _-_     | Melihat menu, filter kategori, kustomisasi varian, keranjang, kalkulasi ongkir, GPS otomatis, checkout WhatsApp, dan pelacakan order via kode transaksi (`?code=NK-xxxx`).                                                      | **Tidak Wajib**                           | `/`, `/menu/*`, `/cart`, `/checkout`, `/order-success`, `/tracking`, `/address`, `/vouchers` |
| **Customer (User)**     | `user`  | Seluruh fitur Guest + akumulasi Poin Loyalitas Nanami, riwayat pesanan akun terdaftar, dan buku alamat tersimpan.                                                                                                                  | Opsional (Wajib jika buka profil/riwayat) | Semua rute publik + `/profile`, `/orders`, `/saved-address`                                  |
| **Kitchen Staff**       | `staff` | Memantau antrean pesanan dapur (Kitchen Board), mengubah status masak (_Incoming &rarr; Cooking &rarr; Ready &rarr; Completed_), mencetak struk kasir, dan sakelar ketersediaan stok menu harian.                                  | **Wajib**                                 | `/admin` (Kitchen View), `/admin/orders`, `/admin/stock`                                     |
| **Admin**               | `admin` | Seluruh akses Staff + CRUD Menu Makanan & Minuman lengkap, Media Gallery, manajemen data pelanggan, laporan penjualan operasional, dan pengaturan operasional toko.                                                                | **Wajib**                                 | Seluruh rute `/admin/*` + hak akses Customer                                                 |
| **Owner (Super Admin)** | `owner` | Hak akses penuh atas seluruh modul sistem: Laporan keuangan & laba, CMS visual storefront, Live Simulator, manajemen voucher, manajemen outlet cabang, konfigurasi tarif logistik, manajemen akun staf, dan audit trail transaksi. | **Wajib**                                 | Seluruh rute aplikasi (`/*`, `/admin/*`, `/owner/*`)                                         |

### 3.2 Alur Guest Checkout

- Pelanggan baru tidak dipaksa melihat pop-up login saat pertama kali membuka aplikasi.
- Formulir checkout mengizinkan pengisian manual nama penerima, nomor WhatsApp, alamat pengantaran, dan titik Google Maps / tombol GPS otomatis.
- Kolom `account_id` pada tabel `orders` bernilai `NULL` untuk pesanan tamu (_guest_), dan terisi ID akun jika pelanggan sedang masuk (_logged in_).
- Setelah checkout berhasil, pelanggan tamu diberikan tautan pelacakan instan `/tracking?code={order.code}`.

### 3.3 Akun Demo Bawaan untuk Pengujian Instan:

- **Demo Customer:** `user@nanami.id` | Kata Sandi: `user123`
- **Demo Admin:** `admin@nanami.id` | Kata Sandi: `admin123`
- **Demo Owner:** `owner@nanami.id` | Kata Sandi: `owner123`

---

## 4. Katalog Halaman, Struktur Navigasi, & Rute (File-Based Routing)

### 4.1 Rute Autentikasi & Status Social Sign-In

- **`/login` (`src/routes/login.tsx`)**: Halaman masuk akun menggunakan email dan kata sandi native, dilengkapi tombol "Continue to Storefront as Guest" untuk melanjutkan belanja tanpa akun. Kredensial untuk role Owner, Admin, dan Staff tersimpan aman di `.env`.
- **`/register` (`src/routes/register.tsx`)**: Halaman pendaftaran akun pelanggan baru (Nama, Email, Nomor Telepon/WhatsApp, dan Kata Sandi).
- **`/auth` (`src/routes/auth.tsx`)**: Halaman gerbang universal yang mengarahkan pengguna ke alur masuk atau daftar.
- **Status Social Sign-In (Google OAuth):** Berdasarkan arsitektur *Zero-Friction Cloud Kitchen*, sistem memprioritaskan alur **Guest Checkout** instan tanpa hambatan registrasi. Autentikasi akun internal dan pelanggan ditangani melalui formulir kredensial native (email/password). Widget *Quick Demo Account* sengaja ditiadakan untuk menjaga tampilan antarmuka yang bersih dan profesional bagi produksi.

### 4.2 Rute Storefront Pelanggan, Top Bar Minimalis, & 4-Tab Bottom Nav

- **Top Bar Header Minimalis (Tanpa Logo Brand):** Header beranda storefront dirancang bersih tanpa logo gambar/teks besar. Logo brand sengaja dialokasikan secara eksklusif pada *Welcome Splash Screen*, layar muat (*loading*), dan panel manajemen admin/owner. Header beranda hanya memuat nama toko teks ringkas, lencana status operasional (`Open Now` berwarna hijau atau `Closed` berwarna merah), serta pintasan keranjang belanja pesanan.
- **Struktur 4-Tab Bottom Navigation Bar:** Batang navigasi bawah (`src/components/BottomNav.tsx`) khusus menampilkan **4 tab utama**:
  1. **Home (`/`)**: Ikon rumah — akses langsung ke etalase utama dan katalog ScrollSpy.
  2. **Cart (`/cart`)**: Ikon tas belanja — dilengkapi lencana angka (*badge count*) jumlah item aktif di keranjang.
  3. **Orders (`/orders`)**: Ikon struk — daftar riwayat transaksi pesanan dan status aktif.
  4. **Profile (`/profile`)**: Ikon pengguna — akun pelanggan, saldo Poin Loyalitas Nanami, dan buku alamat tersimpan.
  - _Catatan Desain:_ Tab **"Menu"** secara sengaja **ditiadakan** dari batang navigasi bawah karena seluruh katalog hidangan telah menyatu secara alami di halaman beranda melalui bilah pil kategori dan ScrollSpy otomatis. Rute `/menu` tetap dipertahankan sebagai rute katalog penuh mandiri.
- **`/` (`src/routes/index.tsx`)**: Beranda utama toko (Storefront) yang mengintegrasikan:
  - _Welcome Splash Screen_ interaktif dengan logo toko dan durasi tayang yang dapat dikustomisasi via CMS.
  - _Running Announcement Bar_ (info, promo, atau peringatan).
  - _Hero Banner_ promosi full-width di bagian teratas layar.
  - Selektor tipe pesanan (🛍️ Pickup / 🚚 Delivery) di bawah hero banner dan di atas bilah pencarian.
  - Navigasi pill kategori teks horizontal dengan tombol pencarian terintegrasi.
  - Bagian **Must Try!** dalam format grid 2x2 responsif (4 hingga 6 item pilihan).
  - Daftar katalog hidangan vertikal per kategori dengan integrasi **ScrollSpy**.
  - Bagian FAQ (_Frequently Asked Questions_) model akordeon.
  - Cerita tentang toko (_About Story_) dan tombol kontak WhatsApp kasir.
- **`/menu` (`src/routes/menu.index.tsx`)**: Katalog menu lengkap dengan bilah pencarian, filter kategori cepat, lencana hidangan (_Halal-friendly, Spicy, Vegan_), dan tombol tambah cepat.
- **`/menu/$itemId` (`src/routes/menu.$itemId.tsx`)**: Halaman detail item makanan:
  - Foto hidangan dengan rasio penuh dan tombol favorit (_Heart_).
  - Tombol berbagi (_Share_) terintegrasi Web Share API dan WhatsApp direct share.
  - Lencana diet/alergen (`badges`) dan estimasi waktu masak (`prepMinutes`).
  - Pemilihan ukuran (_Size_), tingkat kepedasan (_Spice Level_), dan ekstra topping dengan rincian harga add-on.
  - Kolom catatan instruksi dapur (_Special Request_).
  - Tombol tambah ke keranjang dengan kalkulasi harga dinamis.
- **`/cart` (`src/routes/cart.tsx`)**: Halaman keranjang belanja:
  - Tombol berbagi keranjang (_Share Cart_) via WhatsApp atau Web Share API.
  - Rincian baris pesanan beserta opsi varian dan catatan dapur, pengubah jumlah (+/-), tombol hapus item atau kosongkan keranjang.
  - Input kode voucher diskon dengan validasi syarat minimal belanja.
  - Ringkasan biaya: subtotal, kalkulasi PPN/VAT 15% (jika aktif), estimasi ongkir, dan navigasi ke checkout.
- **`/checkout` (`src/routes/checkout.tsx`)**: Alur checkout terpadu 3 langkah:
  1. _Langkah Alamat & Penerima:_ Nama, nomor telepon, alamat lengkap, catatan pengantaran, tombol deteksi lokasi otomatis (**"Use GPS"**), dan input manual koordinat Google Maps.
  2. _Langkah Pembayaran:_ Pemilihan metode (eWallet / Pay2Cell, Bank Transfer / EFT, Cash on Delivery / COD), rincian rekening tujuan transfer dengan tombol salin instan.
  3. _Langkah Konfirmasi & Pesan:_ Validasi status buka toko & layanan aktif, rincian item subtotal, VAT 15%, diskon kupon, ongkir, total akhir, serta tombol generator pesan WhatsApp ke admin dapur.
- **`/order-success` (`src/routes/order-success.tsx`)**: Halaman konfirmasi sukses setelah pesanan dibuat, kode transaksi unik (e.g. `NK-4821`), instruksi pembayaran, dan tombol langsung ke pelacakan pesanan.
- **`/orders` (`src/routes/orders.tsx`)**: Riwayat pesanan akun terdaftar beserta status pengerjaan saat ini.
- **`/tracking` (`src/routes/tracking.tsx`)**: Layar pelacakan status pesanan real-time. Mendukung akses via query param `?code=NK-xxxx` untuk pelanggan tamu atau daftar riwayat untuk pengguna login.
- **`/address` (`src/routes/address.tsx`)**: Kalkulator estimasi jarak dan biaya pengiriman dengan integrasi tombol **"Use Current Location"** berbasis Web Geolocation API serta input tautan Google Maps.
- **`/saved-address` (`src/routes/saved-address.tsx`)**: Manajemen buku alamat tersimpan (Rumah, Kantor, Apartemen) untuk pengguna login.
- **`/vouchers` (`src/routes/vouchers.tsx`)**: Katalog voucher promosi aktif dengan syarat minimal belanja dan tombol salin kode promo.
- **`/profile` (`src/routes/profile.tsx`)**: Profil pelanggan: saldo Poin Loyalitas Nanami, pintasan riwayat order, alamat tersimpan, form ubah kata sandi, dan tombol keluar akun (_Sign Out_).

### 4.3 Rute Operasional Admin & Struktur Sidebar

Susunan menu sidebar Admin dirancang berurutan sesuai alur prioritas kerja harian operasional dapur dan kasir:

1. **Kitchen Board (`/admin`)**: Dashboard pemantau pipeline pesanan dapur (Kitchen Kanban).
2. **Order Management (`/admin/orders`)**: Tabel manajemen pesanan kasir, sakelar Thermal Auto-Print, dan tab rekap penjualan 7 hari.
3. **Menu Catalog (CRUD) (`/admin/menu`)**: Panel kelola hidangan makanan/minuman, grup opsi, dan Special Request.
4. **Media Library (`/admin/media`)**: Galeri aset foto produk dengan pelacak relasi item menu.
5. **Stock Availability (`/admin/stock`)**: Sakelar instan ketersediaan hidangan (Available/Sold Out) dan kuota stok.
6. **Customers (`/admin/customers`)**: Direktori data pelanggan PWA (role `user`), saldo poin, dan belanja kumulatif.
7. **Reports & Analytics (`/admin/reports`)**: Diagram analitik omset, distribusi kategori, dan nilai rata-rata pesanan.
8. **Operations & Settings (`/admin/settings`)**: Konfigurasi jam operasional, buka/tutup toko, nomor WhatsApp, dan Sticky Save Bar.

- _Staf Dapur (`staff`)_ memiliki akses ringkas terbatas ke 3 menu esensial: **Kitchen Board**, **Order Management**, dan **Stock Availability**.

### 4.4 Rute Eksekutif & Pemilik Toko (Owner Suite)

Susunan menu sidebar Owner (`OWNER_NAV`) menempatkan manajemen pesanan di posisi strategis teratas menggantikan slot finance:

1. **Overview (`/owner`)**: Dasbor performa bisnis menyeluruh pemilik usaha.
2. **Order Management (`/admin/orders`)**: **Ditempatkan tepat di bawah Overview** untuk akses kilat pemilik memantau transaksi masuk harian.
3. **Finance (`/owner/finance`)**: Laporan laba kotor, perbandingan metode pembayaran, dan potongan voucher.
4. **Catalog (`/owner/menu`)**: Tinjauan katalog menu dari perspektif eksekutif.
5. **Media Library (`/admin/media`)**: Manajemen perpustakaan aset foto produk.
6. **Content CMS (`/owner/cms`)**: CMS visual storefront: hero banner, announcement, splash screen, urutan kategori, must-try, dan FAQ.
7. **Live Preview (`/owner/preview`)**: Simulator bingkai smartphone interaktif real-time.
8. **Vouchers & Promos (`/owner/vouchers`)**: Pembuatan kupon diskon (persen/nominal tetap) dan syarat minimal belanja.
9. **Accounts & Staff (`/owner/staff`)**: Manajemen staf internal (Owner, Admin, Kitchen Staff).
10. **Outlets (`/owner/outlets`)**: Manajemen cabang restoran dan jam buka gerai.
11. **Delivery Rates (`/owner/shipping`)**: Parameter tarif pengiriman, koordinat dapur, dan Route Factor.
12. **Store Settings (`/owner/settings`)**: Konfigurasi rekening bank, eWallet Pay2Cell, VAT 15%, dan Poin Loyalitas.
13. **Activity Logs (`/owner/audit`)**: Catatan log audit sistem untuk setiap aksi krusial.

---

## 5. Daftar Fitur Utama & Spesifikasi Fungsional

### 5.1 Storefront Pelanggan: Format Mobile Terkunci di Seluruh Perangkat & Navigasi ScrollSpy

- **Tata Letak Mobile Terkunci di Seluruh Perangkat (Mobile-First Canvas):** Seluruh antarmuka storefront publik (`/`, `/menu`, `/cart`, `/checkout`, `/order-success`, `/tracking`, `/address`, `/saved-address`, `/vouchers`, `/profile`) dikunci secara ketat dalam format layar smartphone (`max-w-md` / 448px) yang diposisikan di tengah viewport desktop dengan latar gelap elegan dan bayangan halus. Hal ini memastikan pengalaman visual, proporsi kartu, tombol aksi bawah (*sticky bottom nav & action bar*), dan interaksi sentuh tetap 100% konsisten dan identik di layar ponsel, tablet, maupun monitor desktop lebar tanpa ekspansi kolom yang merusak proporsi desain.
- **Hero Banner:** Gambar promosi horizontal di bagian atas layar dengan ketinggian yang lebih lapang (`h-44 sm:h-48`), sudut membulat bawah (`rounded-b-2xl`), dan gradasi pelindung teks kontras tinggi. Menampilkan label kurasi *"Nanami Kitchen signature dish"*, lencana kategori *"Delivery"* dengan ikon armada pengiriman, judul penawaran utama (*"Free delivery over N$ 250"*), dan subjudul keterangan cakupan (*"Within 5 km radius of our kitchen"*) serta tombol aksi *"Order Now"*.
- **Order Mode Selector:** Tombol sakelar mode _Pickup_ (Ambil Sendiri) atau _Delivery_ (Pesan Antar) yang diletakkan tepat di bawah hero banner dan di atas bilah pencarian.
- **Top Bar Minimalis:** Header utama hanya menampilkan teks nama toko dan lencana status operasional (`Open Now` / `Closed`), membebaskan area pandang atas dari keberadaan logo ganda yang redundan.
- **Category Pills & Inline Search:** Tombol kategori berbentuk kapsul teks tanpa ikon yang ringkas, dilengkapi tombol pemicu pencarian di ujung kanan bilah.
- **Must Try! Grid (4–6 Item):** Menampilkan 4 hingga 6 produk unggulan hasil kurasi CMS (`mustTryItemIds`) dalam format grid 2x2 responsif dengan gambar rasio 1:1 (_square aspect-ratio_).
- **ScrollSpy Real-Time:** Menggunakan `IntersectionObserver` pada kontainer katalog vertikal; pill kategori di bagian atas akan otomatis aktif dan tersorot sesuai dengan bagian hidangan yang sedang terlihat di viewport pengguna.
- **Sidebar Dashboard Collapsible & Scrollable:** Bilah navigasi samping dasbor (`DashboardShell`) dilengkapi tombol penciut/pelebar (*collapse toggle*) dengan penyimpanan status di `localStorage`, penyesuaian otomatis lebar (dari `w-64` menjadi `w-16` dalam kondisi menciut beserta tooltip label menu), bilah gulir halus (*custom scrollbar* `sidebar-scroll`) agar menu tidak pernah terpotong pada monitor dengan ketinggian terbatas, serta drawer mobile geser dengan tombol menu hamburger.

### 5.2 Kustomisasi Produk, Badges, Estimasi Masak, & Standar 5 Kategori CMS

- **Badges & Prep Time:** Halaman detail menu menampilkan lencana diet/alergen (misal: `Halal-friendly`, `Spicy`, `Vegan`) serta perkiraan waktu penyajian (misal: `Prep ~15 mins` dengan ikon jam).
- **Standarisasi 5 Kategori Sistem vs CMS:** Untuk menjamin integritas skema data dan kestabilan tautan ScrollSpy di beranda, sistem menetapkan 5 kategori baku: **`Meals`**, **`Snacks`**, **`Drinks`**, **`Combos`**, dan **`Others`**. Formulir pembuatan menu (`/admin/menu`) sengaja menggunakan dropdown 5 kategori terstandardisasi ini (tanpa tombol sembarangan "+ New Category") agar tidak merusak filter beranda. Pemilik dapat mengkustomisasi urutan tampil (`categoryOrder`) dan mengganti label penamaan kategori (`categoryNames`) secara fleksibel melalui Visual CMS (`/owner/cms`).
- **Toggle Grup Variasi:** Pemilik/Admin dapat mengaktifkan atau menonaktifkan grup variasi tertentu per produk melalui CMS (misal: Level Pedas diaktifkan untuk hidangan mie/bento, tetapi dinonaktifkan untuk hidangan penutup).
- **Penetapan Harga Add-On Bebas:** Admin dapat menambahkan pilihan varian baru dengan nilai harga tambahan (`priceDelta`) berapapun. Opsi dengan nilai `0` otomatis ditampilkan bersih tanpa label harga tambahan (misal: "Mild", bukan "Mild +N$0").
- **Special Request (Catatan Dapur):** Setiap hidangan memiliki sakelar `specialRequestEnabled`. Jika aktif, formulir pemesanan menyediakan kolom catatan khusus pelanggan (misal: "jangan pakai daun bawang", "sambal dipisah") yang diteruskan utuh ke keranjang, checkout, cetakan struk kasir, dan pesan WhatsApp.

### 5.3 Berbagi Menu & Keranjang (Web Share API & WhatsApp Direct Share)

- **Share Menu Item (`/menu/$itemId`):** Tombol bagikan di pojok kanan atas memicu native Web Share API (pada perangkat mobile/browser yang mendukung) atau membuka WhatsApp web/aplikasi dengan pesan berisi nama menu, deskripsi, dan tautan langsung ke halaman produk.
- **Share Cart (`/cart`):** Tombol bagikan di header keranjang menyusun daftar pesanan lengkap beserta kuantitas dan total tagihan untuk dibagikan ke teman atau keluarga via WhatsApp.

### 5.4 Kalkulator Ongkos Kirim Presisi & Geolokasi GPS Otomatis

- **Tombol GPS Otomatis ("Use Current Location" / "Use GPS"):** Tersedia di halaman `/address` dan langsung di kartu alamat `/checkout`. Menggunakan Web Geolocation API (`navigator.geolocation.getCurrentPosition`) dengan presisi tinggi untuk membaca koordinat lintang dan bujur pelanggan secara instan tanpa perlu mengetik manual.
- **Kalkulasi Haversine + Route Factor:** Menghitung jarak lengkung bumi dari koordinat toko dapur di Windhoek (`lat: -22.5609, lng: 17.0658`) ke lokasi pelanggan, dikalikan `routeFactor` (default 1.3) untuk mendapatkan estimasi jarak tempuh jalan raya aktual.
- **Proteksi Radius Pengiriman:** Menolak pesanan antar jika jarak pengantaran melampaui `settings.maxRadiusKm` (default 25 km).

### 5.5 Kontrol Status Operasional Toko & Validasi Layanan Checkout

- **Sakelar Buka/Tutup Toko (`storeOpen`):** Jika toko ditutup oleh manajemen, pelanggan tetap dapat melihat menu, namun tombol checkout dinonaktifkan dengan peringatan jelas: *"The store is currently closed. Checkout is disabled."*
- **Sakelar Layanan Antar (`deliveryOn`) & Ambil Sendiri (`pickupOn`):** Admin dapat mematikan salah satu layanan secara terpisah saat cuaca buruk atau kurir penuh. Alur checkout akan memvalidasi pilihan layanan pelanggan dan memberikan pesan peringatan jika layanan yang dipilih sedang tidak aktif.

### 5.6 Perpajakan (VAT 15%) & Metode Pembayaran Lokal (Pay2Cell, Bank, COD)

- **PPN / VAT:** Nilai persentase pajak yang dapat disesuaikan (default 15%) dengan sakelar hidup/mati (`vatEnabled`). Jika aktif, sistem menghitung nominal pajak dari subtotal dan menampilkannya secara transparan pada ringkasan pembayaran.
- **eWallet Lokal (Pay2Cell):** Opsi pembayaran dompet digital yang disesuaikan dengan ekosistem perbankan Namibia (menggantikan e-wallet non-lokal).
- **Transfer Bank / EFT:** Instruksi rekening bank toko lengkap dengan tombol salin satu kali klik (_one-tap copy_).
- **Cash on Delivery (COD):** Pembayaran di tempat yang dapat diaktifkan atau dinonaktifkan secara global melalui pengaturan toko (`codEnabled`).

### 5.7 Checkout WhatsApp Otomatis & Standarisasi Bahasa Inggris

- Seluruh mikro-antarmuka (*microcopy*) storefront dan panel operasi telah distandardisasi dalam format bahasa Inggris bisnis formal yang konsisten (antara lain: `"Open Now"`, `"Closed"`, `"Add to Cart"`, `"Must Try!"`, `"Order via WhatsApp"`, `"Use Current Location"`, `"Prep ~15 mins"`, `"7-Day Sales Recap"`).
- Menyusun pesan pesanan WhatsApp terformat rapi yang memuat:
  - Kode struk unik (e.g. `#NK-7892`).
  - Rincian penerima, nomor kontak, dan alamat pengantaran.
  - Daftar hidangan, opsi variasi, dan catatan _Special Request_.
  - Rincian keuangan: Subtotal, VAT 15%, Diskon Voucher, Ongkir, dan Total Pembayaran (menggunakan simbol **N$**).
  - Metode pembayaran yang dipilih dan petunjuk konfirmasi pesanan.
- Menghubungkan pengguna langsung ke WhatsApp kasir toko via tautan standar `https://wa.me/{nomor}?text={encoded}`.

### 5.8 Operasional Dapur: Kitchen Kanban Board & Alert Keterlambatan

- Tampilan monitor dapur responsif dengan 4 kolom status:
  1. **Incoming:** Pesanan baru yang masuk menunggu konfirmasi pembayaran.
  2. **In Progress / Cooking:** Pesanan sedang dimasak oleh tim dapur.
  3. **Ready:** Pesanan telah siap di dapur untuk diambil pelanggan atau kurir.
  4. **Completed:** Pesanan yang telah selesai diserahkan hari ini.
- **Late Alert (>30 Menit):** Indikator visual berupa lencana peringatan merah berkedip untuk pesanan yang berada di status pengerjaan dapur melebihi 30 menit.

### 5.9 Manajemen Pesanan Admin, Posisi Sidebar Orders, & Rekap Penjualan 7 Hari

- **Posisi Prioritas Sidebar:** Rute `/admin/orders` ditempatkan langsung di bawah *Overview* pada panel Owner dan tepat di bawah *Kitchen Board* pada panel Admin untuk kecepatan navigasi pemrosesan pesanan.
- Tabel pesanan komprehensif di rute `/admin/orders` yang dilengkapi:
  - Kotak pencarian instan berdasarkan nomor kode order atau nama pelanggan.
  - Tab penyaring status (_All, Pending Payment, Paid/Cooking, Ready/Out for Delivery, Completed/Cancelled_).
  - Filter tipe pesanan (_All, Delivery, Pickup_) dan filter rentang tanggal (_All Dates, Today, Last 7 Days, This Month_).
  - Sakelar status pelunasan (_Mark Paid_) dan aksi status pengerjaan dapur berikutnya.
  - Tab **7-Day Sales Recap:** Memperlihatkan ringkasan omset harian, jumlah pesanan, dan rata-rata nominal pesanan selama 7 hari terakhir.

### 5.10 Pencetakan Struk Kasir Termal & Fitur Thermal Auto-Print

- **Thermal Printing Standard:** Fungsi cetak langsung dari browser (`src/lib/receipt.ts`) yang kompatibel dengan printer termal POS kasir/dapur ukuran 58mm dan 80mm.
- **Thermal Auto-Print Toggle:** Sakelar di header `/admin/orders` yang dapat diaktifkan (`Thermal Auto-Print: ON`). Ketika aktif, perpindahan status pesanan ke tahap "Cooking" secara otomatis memicu cetak struk dapur termal tanpa perlu menekan tombol cetak secara manual.
- **Format Struk:** Memuat identitas brand toko, nomor kontak, kode pesanan, tanggal/waktu transaksi, baris item hidangan beserta rincian variasi & catatan khusus, subtotal, baris VAT 15%, diskon voucher, ongkir, total akhir, nama penerima, alamat pengantaran, dan pesan penutup.

### 5.11 Poin Loyalitas Pelanggan

- Pelanggan yang masuk ke akun terdaftar memperoleh poin loyalitas otomatis dari setiap transaksi sukses berdasarkan parameter `pointsPer10k`.
- Saldo poin tercatat di tabel `accounts` dan dapat dipantau di halaman `/profile`.

### 5.12 Visual Storefront CMS & Live Smartphone Simulator

- Modul `/owner/cms` memungkinkan pemilik memperbarui konten visual toko tanpa menulis kode:
  - Logo toko, nama brand, slogan, dan deskripsi usaha.
  - Teks dan gambar hero banner dengan panduan rasio aspek (16:9 / 2:1).
  - Pesan pengumuman berjalan (_Announcement Bar_).
  - Layar sambutan (_Welcome Screen_) interaktif beserta durasi tayang.
  - Penataan urutan kategori menu (_Category Order_) dan penamaan ulang kategori (_Category Names_).
  - Pemilihan produk yang tampil pada grid "Must Try!".
  - CRUD daftar pertanyaan umum (FAQ) pelanggan dengan toggle aktif/nonaktif per butir.
  - Tautan media sosial (Instagram, TikTok, WhatsApp, Google Maps).
- Simulator `/owner/preview` menampilkan pratinjau tampilan beranda dalam bingkai smartphone secara _real-time_.

### 5.13 Media Gallery & Manajemen Aset Foto Produk

- Halaman dedicated `/admin/media` untuk mengunggah dan mengelola koleksi foto hidangan.
- Fitur penelusuran penggunaan aset (`used_by_menu_ids`): Sistem memvalidasi dan memblokir penghapusan foto yang masih terhubung ke item menu aktif untuk mencegah terjadinya _broken image_.

### 5.14 Manual Save System & Proteksi Unsaved Changes

- Menghilangkan penyimpanan otomatis (_autosave_) yang berisiko pada formulir pengaturan admin dan CMS.
- Komponen `StickySaveBar` dan hook pelacak perubahan (`useUnsavedChanges`):
  - Memunculkan bilah simpan melayang dengan lencana "Unsaved changes" saat ada modifikasi data lokal.
  - Tombol eksplisit `[Save Changes]` untuk melakukan komit perubahan ke database server.
  - Interseptor navigasi (`UnsavedChangesPrompt`) yang menampilkan modal dialog konfirmasi jika pengguna mencoba berpindah halaman sebelum menyimpan perubahan.

### 5.15 Pemisahan Akun Staf Internal vs Direktori Pelanggan

- Modul **Staff Management** (`/owner/staff`) khusus mengelola data pengguna internal toko (Owner, Admin, Kitchen Staff) pada tabel `staff`.
- Modul **Customer Directory** (`/admin/customers`) khusus menampilkan data akun pelanggan PWA (role `user`) pada tabel `accounts`, riwayat belanja, dan akumulasi poin, terpisah dari hak akses sistem.

---

## 6. Skema & Struktur Database (PostgreSQL)

Database menggunakan 9 tabel terindeks dengan tipe data native dan dokumen JSONB terstruktur:

### 6.1 Tabel `app_settings`

Menyimpan konfigurasi parameter toko, tarif ongkir, rekening bank, dan pengaturan perpajakan.

```sql
CREATE TABLE IF NOT EXISTS app_settings (
  id VARCHAR(50) PRIMARY KEY, -- Nilai tetap: 'main_settings'
  data JSONB NOT NULL         -- Objek Settings lengkap
);
```

_Struktur data JSONB mencakup:_ `currencySymbol` (N$), `storeName`, `storeOpen`, `deliveryOn`, `pickupOn`, `codEnabled`, `vatEnabled`, `vatPercent`, `whatsapp`, `baseFee`, `feePerKm`, `minFee`, `maxRadiusKm`, `freeDeliveryAbove`, `routeFactor`, `storeLat`, `storeLng`, `bankName`, `bankAccount`, `bankHolder`, `ewallet`, `pointsPer10k`, `adminPassword`.

### 6.2 Tabel `cms_content`

Menyimpan seluruh konfigurasi tampilan visual dan teks storefront pelanggan.

```sql
CREATE TABLE IF NOT EXISTS cms_content (
  id VARCHAR(50) PRIMARY KEY, -- Nilai tetap: 'main_cms'
  data JSONB NOT NULL         -- Objek CmsContent lengkap
);
```

_Struktur data JSONB mencakup:_ `brandName`, `tagline`, `logoUrl`, `heroImage`, `heroActive`, `announcement`, `welcomeScreen`, `socials`, `aboutStory`, `faqs`, `mustTryItemIds`, `categoryOrder`, `categoryNames`.

### 6.3 Tabel `menu_items`

Menyimpan katalog hidangan makanan, minuman, dan paket combo.

```sql
CREATE TABLE IF NOT EXISTS menu_items (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  category VARCHAR(100) NOT NULL,                    -- 'Meals' | 'Snacks' | 'Drinks' | 'Combos' | 'Others'
  image TEXT,
  available BOOLEAN NOT NULL DEFAULT TRUE,
  prep_minutes INTEGER NOT NULL DEFAULT 15,
  badges JSONB NOT NULL DEFAULT '[]'::jsonb,        -- Array string: ["Halal-friendly", "Spicy"]
  stock INTEGER,                                    -- Nullable jika kuota tidak dibatasi
  groups JSONB NOT NULL DEFAULT '[]'::jsonb,        -- Array OptionGroup (dengan toggle enabled & priceDelta)
  special_request_enabled BOOLEAN NOT NULL DEFAULT TRUE
);
```

### 6.4 Tabel `orders`

Menyimpan riwayat seluruh transaksi pemesanan yang masuk.

```sql
CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(50) PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,                 -- Kode struk transaksi (e.g. 'NK-7892')
  created_at BIGINT NOT NULL,                       -- Timestamp milidetik
  type VARCHAR(20) NOT NULL,                        -- 'pickup' | 'delivery'
  lines JSONB NOT NULL,                             -- Array CartLine[]
  subtotal NUMERIC NOT NULL,
  vat_amount NUMERIC DEFAULT 0,                     -- Nilai nominal VAT
  vat_percent NUMERIC DEFAULT 15,                   -- Persentase tarif VAT
  discount NUMERIC NOT NULL,
  voucher_code VARCHAR(50),
  delivery_fee NUMERIC NOT NULL,
  total NUMERIC NOT NULL,
  status VARCHAR(50) NOT NULL,                      -- 'Pending Payment' | 'Cooking' | 'Out for Delivery' | 'Ready for Pickup' | 'Completed' | 'Cancelled'
  paid BOOLEAN NOT NULL DEFAULT FALSE,
  payment_method VARCHAR(100) NOT NULL,             -- 'ewallet' | 'bank' | 'cod'
  points_earned INTEGER NOT NULL DEFAULT 0,
  eta_minutes INTEGER NOT NULL DEFAULT 15,
  customer JSONB NOT NULL,                          -- { name, phone, address, deliveryNote }
  account_id VARCHAR(50)                            -- Nullable (NULL = Guest order, terisi jika login)
);
```

### 6.5 Tabel `media_assets`

Menyimpan metadata foto produk untuk perpustakaan media gallery.

```sql
CREATE TABLE IF NOT EXISTS media_assets (
  id VARCHAR(50) PRIMARY KEY,
  url TEXT NOT NULL,
  filename VARCHAR(255) NOT NULL,
  uploaded_at BIGINT NOT NULL,
  used_by_menu_ids JSONB NOT NULL DEFAULT '[]'::jsonb
);
```

### 6.6 Tabel `promos`

Menyimpan daftar spanduk promosi berjalan pada carousel beranda.

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

### 6.7 Tabel `vouchers`

Menyimpan kode kupon promosi dan diskon toko.

```sql
CREATE TABLE IF NOT EXISTS vouchers (
  code VARCHAR(50) PRIMARY KEY,                     -- e.g. 'NANAMI10'
  type VARCHAR(20) NOT NULL,                        -- 'percent' | 'fixed'
  value NUMERIC NOT NULL,
  min_spend NUMERIC NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE
);
```

### 6.8 Tabel `accounts`

Menyimpan akun pengguna terdaftar dan data profil pelanggan.

```sql
CREATE TABLE IF NOT EXISTS accounts (
  id VARCHAR(50) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'user',         -- 'user' | 'admin' | 'owner' | 'staff'
  address TEXT,
  addresses JSONB NOT NULL DEFAULT '[]'::jsonb,
  points INTEGER NOT NULL DEFAULT 0
);
```

### 6.9 Tabel `staff`

Menyimpan daftar staf internal restoran dan penugasan peran kerja.

```sql
CREATE TABLE IF NOT EXISTS staff (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(100) NOT NULL,
  role VARCHAR(50) NOT NULL,                        -- 'owner' | 'admin' | 'staff'
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at BIGINT NOT NULL
);
```

---

## 7. Spesifikasi Server RPC & Server Functions (API)

Aplikasi memanfaatkan **Server Functions** TanStack Start (`createServerFn`) di berkas `src/lib/server-functions.ts` yang berjalan aman di sisi server:

| Nama Server Function      | Tipe   | Validasi Input                              | Deskripsi Operasi                                                                                                                          |
| :------------------------ | :----- | :------------------------------------------ | :----------------------------------------------------------------------------------------------------------------------------------------- |
| `getDatabaseState`        | `GET`  | _None_                                      | Mengambil seluruh state terpadu (settings, CMS, menu, orders, promos, vouchers, accounts, staff, media assets) saat inisialisasi aplikasi. |
| `saveMenuItemDb`          | `POST` | `MenuItem`                                  | Upsert hidangan menu ke tabel `menu_items` (termasuk `groups` dan `special_request_enabled`).                                              |
| `deleteMenuItemDb`        | `POST` | `{ id: string }`                            | Menghapus item menu hidangan dari database.                                                                                                |
| `saveOrderDb`             | `POST` | `Order`                                     | Menyimpan transaksi baru (dengan `account_id` opsional) atau memperbarui status pengerjaan dan status pelunasan pesanan.                   |
| `searchOrdersDb`          | `POST` | `{ query?: string, statusFilter?: string }` | Pencarian dan penyaringan pesanan di tingkat database berdasarkan nama, kode, atau status.                                                 |
| `saveVoucherDb`           | `POST` | `Voucher`                                   | Menyimpan atau memperbarui kupon diskon di tabel `vouchers`.                                                                               |
| `deleteVoucherDb`         | `POST` | `{ code: string }`                          | Menghapus kode kupon diskon.                                                                                                               |
| `savePromoDb`             | `POST` | `Promo`                                     | Menyimpan atau memperbarui banner carousel promosi di tabel `promos`.                                                                      |
| `deletePromoDb`           | `POST` | `{ id: string }`                            | Menghapus banner promosi.                                                                                                                  |
| `saveAccountDb`           | `POST` | `Account`                                   | Menyimpan atau memperbarui akun pelanggan di tabel `accounts`.                                                                             |
| `deleteAccountDb`         | `POST` | `{ id: string }`                            | Menghapus data akun pelanggan dari sistem.                                                                                                 |
| `saveStaffDb`             | `POST` | `StaffMember`                               | Menyimpan atau memperbarui anggota tim internal di tabel `staff`.                                                                          |
| `deleteStaffDb`           | `POST` | `{ id: string }`                            | Menghapus akun staf internal.                                                                                                              |
| `saveSettingsDb`          | `POST` | `Settings`                                  | Menyimpan konfigurasi operasional toko, tarif, dan pajak ke tabel `app_settings`.                                                          |
| `saveCmsDb`               | `POST` | `CmsContent`                                | Menyimpan konfigurasi konten visual, urutan kategori, must-try, dan FAQ ke tabel `cms_content`.                                            |
| `saveMediaAssetDb`        | `POST` | `MediaAsset`                                | Menyimpan metadata aset foto produk baru ke tabel `media_assets`.                                                                          |
| `deleteMediaAssetDb`      | `POST` | `{ id: string }`                            | Menghapus aset foto setelah memvalidasi bahwa aset tidak sedang digunakan oleh menu manapun.                                               |
| `updateMediaAssetUsageDb` | `POST` | `{ assetId: string, menuIds: string[] }`    | Memperbarui daftar relasi menu yang menggunakan aset foto terkait.                                                                         |

---

## 8. Alur Penggunaan Sistem (End-to-End User Workflows)

### Alur 1: Pelanggan Tamu Memesan Makanan (Guest Checkout Journey)

```
[Buka Halaman Utama /]
         ↓
[Lihat Welcome Screen & Banner Promo] ──→ [Telusuri Katalog via ScrollSpy]
         ↓
[Pilih Item Makanan di /menu/$id] ──→ [Lihat Badges & Waktu Masak] ──→ [Pilih Opsi & Catatan Dapur]
         ↓
[Tambah ke Keranjang] ──→ [Buka /cart] ──→ [Opsi Bagikan Keranjang / Share Cart]
         ↓
[Terapkan Voucher Promo] ──→ [Pilih Mode: 🛍️ Pickup atau 🚚 Delivery]
         ↓
[Buka Halaman /checkout (Tanpa Wajib Login)]
     ├── Langkah 1: Masukkan Nama, No. WhatsApp, & Alamat (Deteksi Lokasi via Tombol "Use GPS")
     ├── Langkah 2: Pilih Metode Bayar (Pay2Cell / Bank Transfer / COD)
     └── Langkah 3: Validasi Status Toko & Tinjau Rincian (Subtotal + VAT 15% - Diskon + Ongkir)
         ↓
[Klik "Order via WhatsApp"] ──→ [Dialihkan ke WhatsApp Kasir dengan Teks Terformat]
         ↓
[Pesanan Tercatat di Sistem & Pelanggan Mendapat Link /tracking?code=NK-xxxx]
```

### Alur 2: Operasional Dapur & Pemrosesan Pesanan (Kitchen & Admin Flow)

```
[Pesanan Baru Masuk dari Web / WhatsApp]
         ↓
[Otomatis Muncul di Kolom "Incoming" pada Kitchen Board & Tabel /admin/orders]
         ↓
[Kasir Memeriksa Bukti Transfer & Mengklik "Start cooking"]
         ↓
[Pesanan Berpindah ke Kolom "In Progress / Cooking"]
     ├── Jika Thermal Auto-Print Aktif (ON) ──→ Struk Otomatis Tercetak ke Printer Kasir/Dapur
     └── Jika pesanan di dapur > 30 menit ──→ Muncul lencana peringatan LATE merah berkedip
         ↓
[Makanan Selesai Dimasak & Dipacking] ──→ [Klik "Mark ready" / "Print Receipt"]
         ↓
[Pesanan Berpindah ke Kolom "Ready" (Siap Diambil / Diantar Kurir)]
         ↓
[Pesanan Diterima Pelanggan & Ditandai "Completed"]
```

### Alur 3: Kustomisasi Konten & Manajemen Toko (Owner CMS Flow)

```
[Owner Masuk ke Akun di /login]
         ↓
[Membuka Panel /owner/cms atau /owner/settings]
         ↓
[Ubah Hero Banner / Atur Urutan Kategori / Tambah FAQ / Ganti Tarif Ongkir]
         ↓
[Bilah Melayang StickySaveBar Muncul Menampilkan "Unsaved changes"]
         ↓
[Buka Tab /owner/preview untuk Memverifikasi Visual di Simulator Layar HP]
         ↓
[Klik Tombol [Save Changes] ── Perubahan Tersimpan Aman ke Database Server]
```

---

## 9. Logika Bisnis & Formula Perhitungan

### 9.1 Formula Ongkos Kirim (`deliveryFeeFor`)

1. Jika tipe pesanan adalah **`pickup`**, maka:
   $$\text{Delivery Fee} = 0$$
2. Jika nilai subtotal belanja $\ge$ `settings.freeDeliveryAbove` (dan nilai ambang batas $> 0$), maka:
   $$\text{Delivery Fee} = 0 \quad (\text{Gratis Ongkir})$$
3. Untuk pesanan pengantaran reguler:
   $$\text{Biaya Terhitung} = \text{BaseFee} + (\text{DistanceKm} \times \text{FeePerKm})$$
4. Ongkos kirim final yang ditagihkan adalah nilai maksimum antara Biaya Terhitung dan Biaya Minimum:
   $$\text{Final Delivery Fee} = \max(\text{MinFee}, \text{Round}(\text{Biaya Terhitung}))$$

### 9.2 Formula Jarak Koordinat (Haversine + Route Factor)

Menghitung jarak lengkung bumi antara koordinat toko $(\text{lat}_1, \text{lng}_1)$ dan lokasi pemesan $(\text{lat}_2, \text{lng}_2)$:
$$\Delta\text{lat} = \text{rad}(\text{lat}_2 - \text{lat}_1), \quad \Delta\text{lng} = \text{rad}(\text{lng}_2 - \text{lng}_1)$$
$$a = \sin^2\left(\frac{\Delta\text{lat}}{2}\right) + \cos(\text{rad}(\text{lat}_1)) \cdot \cos(\text{rad}(\text{lat}_2)) \cdot \sin^2\left(\frac{\Delta\text{lng}}{2}\right)$$
$$c = 2 \cdot \text{atan2}(\sqrt{a}, \sqrt{1 - a})$$
$$\text{Jarak Tempuh Jalan Raya (Km)} = (6371 \times c) \times \text{RouteFactor}$$

### 9.3 Formula Pajak (VAT 15%)

Jika `settings.vatEnabled = true`:
$$\text{VAT Amount} = \text{Subtotal} \times \left(\frac{\text{vatPercent}}{100}\right)$$
$$\text{Grand Total} = \text{Subtotal} + \text{VAT Amount} - \text{Diskon Voucher} + \text{Delivery Fee}$$

### 9.4 Formula Diskon Voucher (`discountFor`)

- **Tipe Persentase (`percent`):**
  $$\text{Diskon} = \text{Subtotal} \times \left(\frac{\text{Nilai}}{100}\right)$$
- **Tipe Nominal Tetap (`fixed`):**
  $$\text{Diskon} = \min(\text{Subtotal}, \text{Nilai})$$
- _Ketentuan:_ Jika $\text{Subtotal} < \text{MinSpend}$, maka $\text{Diskon} = 0$.

---

## 10. Panduan Operasional, Variabel Lingkungan (.env), dan Deployment

### 10.1 Variabel Lingkungan (`.env`)

```env
# Koneksi Database PostgreSQL (Opsional - otomatis fallback ke in-memory jika kosong/unreachable)
DATABASE_URL=postgresql://postgres:password@localhost:5432/nanamikitchen

# Kredensial Login Internal (.env)
OWNER_EMAIL=owner@nanami.id
OWNER_PASSWORD=owner123

ADMIN_EMAIL=admin@nanami.id
ADMIN_PASSWORD=admin123

STAFF_EMAIL=staff@nanami.id
STAFF_PASSWORD=staff123

# Port Dev/Production Server
PORT=3000

# Mode Lingkungan
NODE_ENV=production
```

### 10.2 Perintah Setup Database & Testing

```bash
# Menguji alur migrasi dan regresi fungsional sistem
npx tsx src/scripts/test-phase4-regression-musttry.ts
npx tsx src/scripts/test-phase4-regression-category.ts
npx tsx src/scripts/test-phase5-regression.ts

# Memeriksa kualitas kode dan sintaksis
npm run lint

# Format berkas kode sesuai panduan
npm run format

# Membangun aplikasi untuk lingkungan produksi
npm run build

# Menjalankan server aplikasi
npm run start
```

### 10.3 Konfigurasi Reverse Proxy Nginx (Contoh Deployment)

```nginx
server {
    listen 80;
    server_name order.nanamikitchen.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
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

_Dokumen ini merupakan spesifikasi acuan resmi terlengkap dari sistem Nanami Kitchen yang merefleksikan seluruh arsitektur kode, skema basis data, dan fungsionalitas operasional terkini._
