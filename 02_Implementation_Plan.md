# Implementation Plan — Nanami Kitchen PWA Update

**Basis:** PRD v1.1.0 (01_PRD_Nanami_Kitchen_Update.md)
**Tujuan:** Panduan teknis eksekusi, dipecah per fase, dengan referensi file/route/schema yang terdampak (mengacu struktur tech stack: TanStack Start + Nitro + PostgreSQL).

---

## Fase 0 — Persiapan

1. Backup database production sebelum migrasi schema.
2. Buat branch git terpisah: `feature/client-feedback-sept2026`.
3. Jalankan seluruh perubahan schema lewat migration script baru (jangan edit langsung `db:push` lama) agar rollback mudah.

---

## Fase 1 — Perubahan Autentikasi (Prioritas #1)

### Schema

```sql
ALTER TABLE orders ADD COLUMN IF NOT EXISTS account_id VARCHAR(50);
-- nullable: NULL = guest order, terisi jika customer login
```

### Kode yang Terdampak

- `src/components/AuthGuard.tsx`
  - Ubah logic: hanya gate route berprefix `/admin` dan `/owner`.
  - Untuk `/profile`, `/orders`, `/saved-address`: gate ringan — redirect ke `/login?redirect=<path>` HANYA saat route ini diakses langsung, bukan sebagai gate global root.
  - Route publik (tidak digate sama sekali): `/`, `/menu`, `/menu/$itemId`, `/cart`, `/checkout`, `/order-success`, `/tracking`, `/address`, `/vouchers`.
- `src/routes/checkout.tsx`
  - Tahap alamat: hilangkan asumsi user harus login; field nama/WA/alamat diisi manual untuk guest.
  - Saat submit order (`saveOrderDb`), sertakan `account_id` HANYA jika user sedang login (ambil dari session/store), else `NULL`.
- `src/routes/order-success.tsx`
  - Generate & tampilkan **kode tracking unik** (bisa reuse `order.code`) sebagai link `/tracking?code=NK-XXXX` yang bisa diakses tanpa login.
- `src/routes/tracking.tsx`
  - Tambahkan mode akses via query param `code` (untuk guest) selain mode akses via akun login (list riwayat).
- `src/routes/login.tsx`
  - Tambahkan tombol "Continue as Guest" / tombol close agar login tidak terasa sebagai gate wajib bagi customer yang salah masuk ke halaman ini.
  - Tambahkan integrasi Google Sign-In (OAuth) — perlu setup provider baru (lihat Fase 5).

### Testing

- [ ] Buka `/` di incognito → tidak diarahkan ke login.
- [ ] Selesaikan full checkout tanpa login → order tersimpan, `account_id = NULL`.
- [ ] Akses `/admin` tanpa login → redirect `/login`.
- [ ] Login sebagai `user`, order → `account_id` terisi sesuai akun.
- [ ] Akses `/tracking?code=NK-xxxx` tanpa login → status order tampil.

---

## Fase 2 — Order Management Page (Admin) — Kritis

### Route Baru

- `src/routes/admin.orders-management.tsx` (atau rename `admin.orders.tsx` yang sudah ada jika memang itu yang dimaksud — cek dulu apakah `/admin/orders` existing sudah cukup dekat dengan requirement, kemungkinan hanya perlu di-redesign, bukan dibuat baru dari nol).

### Requirement UI

- Tabel/list dengan kolom: Order ID + waktu, Data pelanggan (nama, WA, tipe), ringkasan item + customization + special request, total + metode bayar, badge status berwarna.
- Tab filter status: `Pending Payment → Paid/Cooking → Ready/Out for Delivery → Completed/Cancelled`.
- Search bar: filter by nama pelanggan atau Order ID.
- Action button di tiap baris: ubah status (dropdown atau tombol next-status).
- Posisi sidebar: pindahkan ke bawah "Overview", gantikan posisi tab "Finance" (Finance tetap ada tapi dipindah, cek dengan client urutan barunya — lihat Open Question tambahan di bawah).

### Server Function

- Reuse `saveOrderDb` untuk update status — pastikan partial update (status only) tidak menimpa field lain.
- Tambahkan server function baru jika perlu: `searchOrdersDb({ query, statusFilter })` untuk search+filter di level DB (hindari fetch semua order ke client jika data besar).

### Testing

- [ ] Filter per status berfungsi dan menampilkan count yang benar.
- [ ] Search by nama & Order ID mengembalikan hasil tepat.
- [ ] Update status tersimpan dan langsung reflect di Kitchen Board (`/admin` kanban) — pastikan satu sumber data.

---

## Fase 3 — Sistem Kustomisasi Produk Dinamis di CMS — Kritis

### Schema

Ubah struktur `menu_items.groups` (JSONB) menjadi eksplisit mendukung toggle & harga bebas:

```json
[
  {
    "id": "grp_spicy",
    "name": "Spicy Level",
    "type": "single",
    "enabled": true,
    "options": [
      { "id": "opt_mild", "label": "Mild", "priceDelta": 0 },
      { "id": "opt_medium", "label": "Medium", "priceDelta": 0 },
      { "id": "opt_hot", "label": "Extra Hot", "priceDelta": 5 }
    ]
  }
]
```

Tambah kolom:

```sql
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS special_request_enabled BOOLEAN NOT NULL DEFAULT TRUE;
```

### Kode yang Terdampak

- `src/routes/admin.menu.tsx` — form modal edit produk:
  - Tambah UI toggle ON/OFF per grup kustomisasi.
  - Tambah UI "add option" dinamis (nama + harga add-on, harga boleh kosong/0).
  - Tambah toggle "Special Request enabled" per produk.
- `src/routes/menu.$itemId.tsx` — halaman detail produk customer:
  - Render grup kustomisasi HANYA yang `enabled: true`.
  - Render kolom Special Request HANYA jika `special_request_enabled = true`.
  - Pastikan opsi dengan `priceDelta = 0` tampil tanpa label harga.
- `src/lib/cart-store.ts` (atau setara) — pastikan struktur cart line menyimpan pilihan customization + special request text, dan diteruskan utuh ke `/cart`, `/checkout`, dan pesan WhatsApp.

### Testing

- [ ] Toggle OFF suatu grup di admin → grup tidak muncul di halaman customer.
- [ ] Tambah opsi baru dari admin tanpa deploy kode → langsung muncul di frontend.
- [ ] Opsi harga 0 tampil tanpa "+Rp0" / "+N$0".
- [ ] Special request text muncul di ringkasan cart, checkout, struk, dan pesan WhatsApp.

---

## Fase 4 — Redesain UI Customer (Home, Kategori, Katalog)

### Komponen Terdampak

- `src/routes/index.tsx` — Home:
  - Hapus logo header, perbesar hero banner jadi full-width.
  - Pindahkan toggle Pickup/Delivery ke atas.
  - Ganti kategori icon → pill button text-only.
  - Search bar → icon-only, gabung ke baris kategori.
- Komponen katalog (kemungkinan `src/components/MenuList.tsx` atau sejenis):
  - Rename section → "Must Try!", grid 2x2, image aspect-ratio 1:1 (CSS `aspect-square object-cover`).
  - Implement ScrollSpy: gunakan `IntersectionObserver` per section kategori untuk update `activeCategory` state, sync ke tab kategori atas.
- `src/routes/owner.cms.tsx` — tambah kontrol:
  - Pilih produk mana yang masuk grid "Must Try!" (`app_settings.mustTryItemIds`).
  - Atur urutan kategori (`app_settings.categoryOrder`) — drag & drop atau input urutan angka.
  - Rename label kategori custom.
- Bottom nav component — hapus entry "Menu".

### Testing

- [ ] Scroll katalog → tab kategori aktif berpindah otomatis sesuai section yang terlihat.
- [ ] Ubah urutan/isi Must Try dari CMS → langsung berubah di customer view tanpa deploy.

---

## Fase 5 — Payment, VAT, dan Lokalisasi Mata Uang

### Schema

```sql
-- Tambahan di app_settings.data (JSONB), contoh key baru:
-- { "vatPercent": 15, "vatEnabled": true, "codEnabled": true, "currencySymbol": "N$" }
```

### Kode Terdampak

- `src/routes/checkout.tsx` — ganti daftar metode e-wallet: hapus GoPay/OVO/DANA/ShopeePay, tambah "eWallet / Pay2Cell". COD ditampilkan kondisional berdasar `codEnabled`.
- Semua titik yang menampilkan harga (`src/lib/currency.ts` atau util format harga) — ganti format dari `R` ke `N$`, ambil simbol dari `app_settings.currencySymbol` agar fleksibel ke depan.
- `src/routes/owner.settings.tsx` — tambah field VAT percent + toggle enabled.
- Perhitungan total di checkout/cart: tambahkan baris VAT jika `vatEnabled = true`, hitung `subtotal × vatPercent/100`, tampilkan sebelum total akhir. Update juga formula di §9 PRD lama (deliveryFeeFor tidak berubah, tapi total akhir checkout perlu tambah VAT line).
- Update `printReceipt()` (`src/lib/receipt.ts`) dan generator pesan WhatsApp agar ikut menampilkan baris VAT & pakai simbol N$.

### Testing

- [ ] Semua harga tampil dengan simbol N$ (admin form, preview, cart, checkout, struk, WhatsApp).
- [ ] VAT toggle OFF → tidak ada baris VAT di total manapun.
- [ ] COD toggle OFF → opsi COD hilang dari checkout.

---

## Fase 6 — Manual Save System (CMS Admin/Owner)

### Pola Implementasi

- Buat hook/komponen reusable, misal `useUnsavedChanges()`:
  - Track dirty state form (bandingkan snapshot awal vs current).
  - Sticky save bar muncul di bawah layar saat dirty = true.
  - Intercept navigasi (route change / tab close) → tampilkan modal konfirmasi via TanStack Router's `beforeLoad`/`blocker` API atau `window.onbeforeunload` untuk reload/close tab.
- Terapkan di halaman: `owner.settings.tsx`, `owner.shipping.tsx`, `owner.cms.tsx`, `admin.menu.tsx` (form produk), `admin.settings.tsx`.
- Hapus semua pemanggilan auto-save (`onChange` langsung trigger `saveXDb`) — ganti jadi update local state saja, submit hanya saat klik Save.

### Testing

- [ ] Ubah field tanpa save, coba pindah halaman → muncul modal konfirmasi.
- [ ] Klik Save → badge "Unsaved changes" hilang, data tersimpan ke DB.
- [ ] Refresh browser tanpa save → perubahan tidak tersimpan (sesuai ekspektasi, bukan bug).

---

## Fase 7 — Media Gallery, CMS Content Actions, Customer/Staff Split

### Schema

```sql
CREATE TABLE IF NOT EXISTS media_assets (
  id VARCHAR(50) PRIMARY KEY,
  url TEXT NOT NULL,
  filename VARCHAR(255) NOT NULL,
  uploaded_at BIGINT NOT NULL,
  used_by_menu_ids JSONB NOT NULL DEFAULT '[]'::jsonb
);
```

### Kode Terdampak

- Modal "Media Gallery" baru, dipanggil dari `admin.menu.tsx` (form produk) dan sebagai halaman/tab tersendiri di admin.
  - List gambar dengan [Preview] [Delete] (validasi: cek `used_by_menu_ids`, blok delete jika masih dipakai, tampilkan warning).
- `src/routes/owner.cms.tsx` — tiap item konten (banner, announcement, FAQ, dll) diberi tombol [Edit] [Delete] [Toggle Active]. Perlu extend struktur `cms_content.data` agar tiap array item punya field `active: boolean`.
- Pemisahan `owner.staff.tsx` (internal only: owner/admin/staff) vs halaman baru `admin.customers.tsx` yang sudah ada — pastikan cukup dipisah scope-nya di UI (staff table tetap dari tabel `staff`, customer tetap dari `accounts` role `user`), tambahkan tombol [+ Add New] manual untuk customer di `admin.customers.tsx`.

---

## Fase 8 — Lokalisasi Bahasa (Terakhir, low-risk)

- Audit seluruh string hardcoded Bahasa Indonesia di komponen customer & admin.
- Ganti sesuai daftar di PRD §3.7 (Lihat→View, Foods→Meals, dst).
- Rekomendasi: pertimbangkan file `i18n/en.json` terpisah agar ke depan mudah menambah bahasa lain, meski untuk versi ini hanya satu bahasa aktif (Inggris).

---

## Urutan Eksekusi yang Disarankan

1. Fase 1 (Auth) — fondasi, banyak fase lain bergantung pada ini.
2. Fase 2 (Order Management) — kebutuhan operasional harian client, dampak bisnis tertinggi.
3. Fase 3 (Kustomisasi Produk CMS) — kompleksitas tinggi, butuh waktu paling lama.
4. Fase 5 (Payment/VAT/Currency) — relatif independen, bisa paralel dengan Fase 3.
5. Fase 6 (Manual Save) — terapkan sambil menyentuh tiap halaman settings di fase lain.
6. Fase 4 (UI Redesign Home/Katalog) — bisa paralel oleh developer frontend berbeda.
7. Fase 7 (Media Gallery, CMS actions, Customer/Staff split) — nice-to-have, kerjakan setelah kritis selesai.
8. Fase 8 (Lokalisasi bahasa) — terakhir, sapu bersih sebelum rilis final.

## Definition of Done (Keseluruhan)

- Semua acceptance criteria per fase di atas lulus.
- Regression test: alur admin/owner login & kitchen board tidak rusak.
- Tidak ada sisa referensi "Rp", "R", atau nama e-wallet Indonesia di codebase customer-facing.
- `npm run build` sukses tanpa error, deploy ke staging untuk review client sebelum production.
