# PRD — Nanami Kitchen PWA (Update Berdasarkan Feedback Client)

**Versi:** 1.1.0
**Tanggal:** September 2026
**Status:** Draft — untuk implementasi berdasarkan Feedback List Preview Review
**Basis:** PRD v1.0.0 (Nanami Kitchen) + Feedback List Client (Sept 2026)

---

## 1. Latar Belakang & Tujuan

Aplikasi Nanami Kitchen sudah berjalan (v1.0.0) dan sedang dalam tahap _preview review_ bersama client. Client menargetkan pasar **Namibia** (mata uang N$, layanan eWallet lokal "Pay2Cell"), sehingga sebagian requirement adalah lokalisasi, sebagian lagi perbaikan UX/UI, dan satu perubahan struktural besar: **model autentikasi**.

Tujuan dokumen ini: menerjemahkan seluruh feedback menjadi requirement yang jelas, dengan acceptance criteria, agar bisa langsung dieksekusi oleh tim dev / AI coding agent tanpa ambiguitas.

---

## 2. Perubahan Kunci #1 — Model Autentikasi (Keputusan Final)

> **Keputusan:** Login **hanya wajib** untuk role `admin` dan `owner`. Role `user` (customer) **tidak wajib login** untuk browse menu, kustomisasi, dan checkout.

### 2.1 Perilaku Baru per Role

| Role                               | Wajib Login?                                                                           | Alasan                                                          |
| ---------------------------------- | -------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| `user` (Customer)                  | **Tidak** — guest checkout diizinkan penuh                                             | Mengurangi friksi order, sesuai instruksi client di feedback #1 |
| `user` (Customer) — opsional login | Ya, jika ingin akses `/profile`, `/orders` (riwayat), poin loyalitas, alamat tersimpan | Fitur-fitur ini butuh identitas akun                            |
| `staff`                            | **Ya**, selalu                                                                         | Akses `/admin` Kitchen Board & operasional dapur                |
| `admin`                            | **Ya**, selalu                                                                         | Akses penuh `/admin/*`                                          |
| `owner`                            | **Ya**, selalu                                                                         | Akses penuh `/owner/*`                                          |

### 2.2 Alur Guest Checkout

- Pelanggan tanpa akun bisa: lihat menu → kustomisasi item → tambah ke cart → checkout (isi nama, no. WhatsApp, alamat manual) → generate pesan WhatsApp → order tercatat di DB dengan `account_id = NULL`.
- Pelacakan pesanan guest (`/tracking`) tetap bisa diakses via **kode order** (link unik dikirim di halaman `/order-success`, tanpa perlu login), bukan lewat daftar riwayat akun.
- Poin loyalitas **tidak diberikan** untuk guest order (poin hanya untuk akun terdaftar) — perlu dikonfirmasi ke client apakah guest harus didorong register saat checkout untuk dapat poin (lihat Open Question #1).

### 2.3 Login Tetap Tersedia untuk Customer (Opsional, Bukan Gate)

- Tombol "Login / Daftar" tetap ada di `/profile` atau ikon akun di header — bukan pop-up wajib di awal buka app.
- Tambahan requirement dari feedback: **Google Sign-In** untuk mempercepat alur opsional ini.

### 2.4 Dampak ke `AuthGuard`

- `AuthGuard` saat ini (asumsi) menerapkan proteksi di level root/layout. Perlu diubah agar:
  - Rute `/`, `/menu/*`, `/cart`, `/checkout`, `/order-success`, `/tracking`, `/vouchers` → publik, tidak digate.
  - Rute `/profile`, `/orders` (riwayat pesanan pelanggan login), `/saved-address`, `/address` (jika terhubung akun) → digate, redirect ke `/login` hanya saat diakses.
  - Rute `/admin/*` dan `/owner/*` → tetap digate ketat seperti sekarang, cek role `staff/admin` dan `owner`.

### 2.5 Acceptance Criteria

- [ ] User baru buka PWA langsung lihat Home tanpa diminta login.
- [ ] User bisa menyelesaikan seluruh alur order (menu → cart → checkout → WhatsApp) tanpa membuat akun.
- [ ] Order guest tersimpan di tabel `orders` dengan referensi customer non-akun (lihat perubahan schema di Implementation Plan).
- [ ] Mencoba akses `/admin` atau `/owner` tanpa login → redirect ke `/login`.
- [ ] Mencoba akses `/profile` tanpa login → redirect ke `/login` dengan opsi kembali setelah login.

---

## 3. Ringkasan Seluruh Requirement (Mapping dari Feedback List)

### 3.1 Auth & Onboarding

| #   | Requirement                                                          | Prioritas |
| --- | -------------------------------------------------------------------- | --------- |
| A1  | Guest checkout untuk customer (lihat §2)                             | Tinggi    |
| A2  | Google Sign-In sebagai opsi login tambahan                           | Sedang    |
| A3  | Verifikasi PWA install prompt (Add to Home Screen) aktif & berfungsi | Rendah    |
| A4  | Browser Geolocation prompt aktif saat tombol lokasi ditekan          | Sedang    |

### 3.2 Customer PWA — Home & Navigasi

| #   | Requirement                                                                                   | Prioritas |
| --- | --------------------------------------------------------------------------------------------- | --------- |
| H1  | Hapus logo text "Nanami Kitchen" dari header Home; logo hanya muncul di splash/loading screen | Sedang    |
| H2  | Hero banner promo full-width, menempel di paling atas layar (gaya Fore Coffee/KFC)            | Sedang    |
| H3  | Toggle Pickup/Delivery dipindah ke atas — tepat di bawah hero banner / di atas search bar     | Sedang    |
| H4  | Kategori: hapus ikon, ubah jadi text-only pill button                                         | Sedang    |
| H5  | Search bar diubah jadi ikon search yang menyatu di baris kategori (kanan)                     | Sedang    |
| H6  | Bottom nav: hapus tab "Menu" (katalog sudah full di Home)                                     | Rendah    |

### 3.3 Customer PWA — Katalog Menu

| #   | Requirement                                                                        | Prioritas |
| --- | ---------------------------------------------------------------------------------- | --------- |
| M1  | Rename section "Popular Menu" → **"Must Try!"**, pindah ke paling atas katalog     | Tinggi    |
| M2  | Layout grid 2x2 untuk "Must Try!" (4–6 produk), foto rasio 1:1                     | Sedang    |
| M3  | Setelah "Must Try!", lanjut ke list vertikal per kategori (infinite scroll)        | Tinggi    |
| M4  | ScrollSpy: tab kategori otomatis aktif sesuai section yang sedang terlihat         | Tinggi    |
| M5  | Nama kategori, urutan section, & isi grid "Must Try!" dikustomisasi penuh dari CMS | Tinggi    |

### 3.4 Customer PWA — Produk & Kustomisasi

| #   | Requirement                                                                                                                 | Prioritas           |
| --- | --------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| P1  | Sistem toggle ON/OFF grup kustomisasi per produk (mis. Spicy Level ON untuk Mie, OFF untuk Gudeg)                           | **Tinggi (kritis)** |
| P2  | Admin bisa tambah opsi varian + harga add-on bebas tanpa perlu developer                                                    | **Tinggi (kritis)** |
| P3  | Jika harga add-on = 0/kosong → tampil nama opsi tanpa harga                                                                 | Sedang              |
| P4  | Kolom Special Request/Kitchen Notes aktif di SEMUA produk, toggle on/off per produk, otomatis diteruskan ke cart & checkout | Tinggi              |

### 3.5 Customer PWA — Pembayaran

| #   | Requirement                                                                               | Prioritas |
| --- | ----------------------------------------------------------------------------------------- | --------- |
| PM1 | Ganti opsi e-wallet Indonesia (GoPay/OVO/DANA/ShopeePay) → "eWallet / Pay2Cell" (Namibia) | Tinggi    |
| PM2 | Fitur Cash on Delivery bisa on/off dari Owner Settings                                    | Sedang    |

### 3.6 Admin & Owner Panel

| #   | Requirement                                                                                                                                                                                 | Prioritas                       |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| O1  | **Order Management page baru** di sidebar admin (posisi: bawah Overview, gantikan tab Finance) — tabel pesanan scannable dengan search, filter status, tab alur status, action ganti status | **Tinggi (kritis)**             |
| O2  | Hapus autosave di semua halaman setting; tambah tombol **[Save Changes]** eksplisit + badge "Unsaved changes" + modal konfirmasi saat keluar halaman                                        | **Tinggi (kritis)**             |
| O3  | Toggle Availability produk lebih jelas (Toggle Switch, bukan tombol kecil)                                                                                                                  | Rendah                          |
| O4  | Ganti simbol mata uang R (Rand) → **N$** (Namibia Dollar) di semua input & preview harga                                                                                                    | **Tinggi (kritis, lokalisasi)** |
| O5  | Tombol [+ New Category] instan di samping dropdown kategori                                                                                                                                 | Sedang                          |
| O6  | VAT/Pajak 15% dengan angka yang bisa diubah admin + toggle on/off                                                                                                                           | Sedang                          |
| O7  | Media Gallery Library — tab/modal untuk kelola foto produk (reuse, preview, delete dengan validasi jika masih dipakai)                                                                      | Sedang                          |
| O8  | Tombol Edit/Delete/Toggle Active pada setiap item Content CMS (Hero Banner, Announcement, Promo Banner, Welcome Screen, Contact & Socials, FAQ)                                             | Sedang                          |
| O9  | Hero/Promo banner di sisi CMS: full-width guide + rekomendasi aspect ratio (16:9 atau 2:1) ditampilkan di form upload                                                                       | Rendah                          |
| O10 | Pisahkan modul "Accounts & Staff" (internal only) dari "Customers" (pelanggan PWA) — buat tab Customers terpisah dengan +Add New & edit manual                                              | Sedang                          |
| O11 | Konfirmasi & lengkapi: apakah semua elemen konten (topping, ukuran, urutan kategori, FAQ) sudah punya kontrol CMS-nya — audit + tambal yang masih hardcoded                                 | **Tinggi (kritis)**             |

### 3.7 Konsistensi Bahasa (Lokalisasi UI)

| #   | Requirement                                                                                                                                                                                                                                                                         | Prioritas |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| L1  | Standarisasi seluruh teks UI ke Bahasa Inggris (PWA & Dashboard) — hapus campuran ID/EN                                                                                                                                                                                             | Sedang    |
| L2  | Perbaikan spesifik: "Lihat"→"View/See Details", "Foods"→"Meals", "Pertanyaan Umum (FAQ)"→"Frequently Asked Questions (FAQ)", "Open now"→"Open Now", "All time"→"All Time", "Vouchers & Promo"→"Vouchers & Promos", "Special request"→"Special Request", "Add to cart"→"Add to Cart" | Sedang    |

---

## 4. Perubahan Skema Data yang Diperlukan (Ringkasan)

> Detail teknis lengkap ada di **Implementation Plan**. Ringkasan dampak schema:

1. **`orders`** — `customer` JSONB tetap menampung data guest; tambah kolom `account_id VARCHAR(50) NULL` (nullable, FK opsional ke `accounts.id`) untuk order dari user yang login.
2. **`menu_items.groups`** — perlu extend struktur JSONB agar setiap grup kustomisasi punya field `enabled: boolean` (toggle ON/OFF) dan opsi mendukung `priceDelta` (boleh 0).
3. **`menu_items`** — tambah field `specialRequestEnabled: boolean` (default true) untuk toggle kolom catatan per produk.
4. **`app_settings`** — tambah field baru: `vatPercent`, `vatEnabled`, `codEnabled`, `mustTryItemIds` (array), `categoryOrder` (array), `currencySymbol` (default `"N$"`).
5. **Tabel baru `media_assets`** — untuk Media Gallery: `id, url, filename, uploaded_at, used_by_menu_ids (JSONB)`.
6. **`cms_content`** — extend struktur agar tiap item (banner, FAQ, dll) punya `active: boolean` per baris agar toggle show/hide berfungsi.

---

## 5. Non-Functional Requirements

- Perubahan auth **tidak boleh** merusak sesi admin/owner yang sudah berjalan (test regresi login admin wajib lulus).
- Semua perubahan CMS baru (toggle kustomisasi, VAT, media gallery) harus tetap kompatibel dengan data lama (migrasi non-destruktif, gunakan default value saat field belum ada).
- Manual save system tidak boleh menghapus data yang sudah tersimpan sebelumnya jika admin batal menyimpan (cukup discard perubahan lokal).
- Perubahan mata uang R→N$ harus konsisten di seluruh titik (form admin, preview, struk cetak, pesan WhatsApp, halaman customer).

---

## 6. Out of Scope (Versi Ini)

- Migrasi/merge riwayat order guest ke akun setelah pelanggan register belakangan (bisa jadi requirement v1.2).
- Payment gateway langsung (Pay2Cell tetap manual/transfer seperti bank transfer saat ini, hanya ganti label & branding).
- Multi-bahasa (bahasa ganda ID/EN toggle) — requirement saat ini hanya standarisasi ke satu bahasa (Inggris).

---

## 7. Open Questions untuk Client

1. Apakah guest checkout tetap berhak dapat poin loyalitas jika mengisi nomor WhatsApp yang sama dengan akun terdaftar? Atau poin murni hanya untuk order saat login?
2. Untuk tracking order guest — apakah cukup via link unik di halaman order-success, atau perlu halaman "cek pesanan" dengan input kode order manual?
3. Apakah VAT 15% berlaku untuk semua kategori produk, atau ada pengecualian (mis. minuman)?
4. Untuk pemisahan modul Accounts & Staff vs Customers — apakah data customer lama (yang sudah ada di tabel `accounts` dengan role `user`) perlu dipindah/dilabeli ulang, atau cukup dipisah secara tampilan saja?
