# PRD — Nanami Kitchen (Aplikasi Pemesanan Makanan)

Dokumen ini merangkum seluruh halaman, fungsi, fitur, aturan bisnis, dan data yang ada di aplikasi Nanami Kitchen.

---

## 1. Ringkasan Produk

Nanami Kitchen adalah aplikasi web (mobile-first, PWA) untuk pemesanan makanan dengan dua mode: **delivery** dan **pickup**. Aplikasi memiliki tiga sudut pandang:

1. **Pelanggan** — menjelajah menu, memesan, membayar, melacak pesanan, mengelola profil.
2. **Admin / Operasional Dapur** — mengelola pesanan harian, stok, menu, pelanggan, laporan.
3. **Owner / Pemilik Bisnis** — ringkasan bisnis, keuangan, outlet, staf, promo, log aktivitas.

**Target pengguna:** pelanggan rumah tangga/kantor di sekitar outlet, serta tim dapur dan pemilik usaha.

**Prinsip desain:** tema gelap elegan dengan aksen emas, tipografi tegas, navigasi bawah (bottom nav) khas aplikasi mobile.

---

## 2. Status Teknis

| Aspek             | Kondisi saat ini                                                         |
| ----------------- | ------------------------------------------------------------------------ |
| Kerangka aplikasi | React + TanStack Start (routing berbasis file)                           |
| Tampilan          | Tailwind CSS + komponen UI shadcn, token warna semantik                  |
| Penyimpanan data  | Lokal di perangkat (browser storage), belum ada server/database          |
| Akun pengguna     | Simulasi lokal (email + password disimpan di perangkat)                  |
| Pembayaran        | Simulasi (transfer bank / e-wallet / bayar di tempat), belum ada gateway |
| PWA               | Ada manifest, service worker, dan prompt "Install App"                   |

> Catatan: karena data tersimpan di perangkat, data tidak sinkron antar perangkat dan akan hilang bila penyimpanan browser dibersihkan. Untuk produksi, dibutuhkan backend (database, autentikasi, pembayaran).

---

## 3. Daftar Halaman

### 3.1 Area Pelanggan

| Rute             | Halaman           | Fungsi utama                                                                                                                  |
| ---------------- | ----------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `/`              | Beranda           | Welcome screen bermerek, carousel promo, kategori, menu unggulan, akses cepat keranjang                                       |
| `/menu`          | Kerangka menu     | Layout induk untuk daftar & detail menu                                                                                       |
| `/menu/`         | Daftar Menu       | Pencarian, filter kategori (Foods, Snacks, Drinks, Combos, Others), status tersedia/habis, harga                              |
| `/menu/$itemId`  | Detail Menu       | Foto, deskripsi, harga, estimasi masak, pilihan varian/topping (single & multi), catatan, tambah ke keranjang                 |
| `/cart`          | Keranjang         | Daftar item, ubah jumlah, hapus, catatan, subtotal, lanjut checkout                                                           |
| `/checkout`      | Checkout          | Pilih pickup/delivery, alamat, jarak & ongkir, voucher, metode pembayaran, ringkasan total, buat pesanan                      |
| `/address`       | Alamat Pengiriman | Isi/ubah alamat pengiriman, catatan kurir, dan tempel titik Google Maps untuk menghitung jarak & ongkir otomatis              |
| `/saved-address` | Alamat Tersimpan  | Daftar alamat favorit, pilih, tambah, hapus                                                                                   |
| `/vouchers`      | Voucher & Promo   | Daftar voucher aktif, syarat minimum belanja, pakai voucher                                                                   |
| `/order-success` | Pesanan Berhasil  | Konfirmasi pesanan, kode pesanan, instruksi pembayaran, poin didapat                                                          |
| `/orders`        | Riwayat Pesanan   | Daftar semua pesanan beserta status dan total                                                                                 |
| `/tracking`      | Lacak Pesanan     | Status real-time: Menunggu Pembayaran → Dimasak → Siap Diambil / Dalam Pengiriman → Selesai (atau Dibatalkan), estimasi waktu |
| `/profile`       | Profil            | Data pengguna, poin loyalitas, alamat, ubah password, keluar (sign out)                                                       |
| `/login`         | Masuk             | Masuk dengan email + password                                                                                                 |
| `/register`      | Daftar            | Buat akun: nama lengkap, WhatsApp, alamat (opsional), email, password + konfirmasi                                            |
| `/auth`          | (pengalihan)      | Diarahkan otomatis ke `/login`                                                                                                |

### 3.2 Area Admin (Operasional)

| Rute               | Halaman                | Fungsi utama                                                                                                                     |
| ------------------ | ---------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `/admin`           | Kerangka Admin         | Kunci akses admin (password), navigasi panel                                                                                     |
| `/admin/`          | Papan Dapur            | Antrian pesanan masuk, ubah status pesanan, tandai lunas                                                                         |
| `/admin/orders`    | Pesanan Harian         | Semua pesanan hari ini, filter status, detail pesanan                                                                            |
| `/admin/menu`      | Kelola Menu            | Tambah/ubah/hapus item, harga, kategori, foto, varian, ketersediaan                                                              |
| `/admin/stock`     | Stok Menu Harian       | Atur sisa stok per item, aktif/nonaktifkan item, set semua tersedia/habis                                                        |
| `/admin/customers` | Data Pelanggan         | Daftar pelanggan, kontak, jumlah pesanan, nilai belanja                                                                          |
| `/admin/reports`   | Laporan Penjualan      | Omzet, jumlah pesanan, item terlaris, grafik ringkas                                                                             |
| `/admin/settings`  | Pengaturan Operasional | Buka/tutup toko, aktif/nonaktif delivery & pickup, jam buka, ongkir dasar & per km, radius maksimal, rekening/e-wallet, WhatsApp |

### 3.3 Area Owner (Pemilik)

| Rute              | Halaman          | Fungsi utama                                                                                                                                                                |
| ----------------- | ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/owner`          | Kerangka Owner   | Navigasi panel pemilik                                                                                                                                                      |
| `/owner/`         | Ringkasan Bisnis | KPI utama: penjualan, pesanan, rata-rata nilai pesanan, tren                                                                                                                |
| `/owner/finance`  | Laporan Keuangan | Pendapatan, diskon, ongkir, ringkasan per periode                                                                                                                           |
| `/owner/menu`     | Katalog Menu     | Tinjauan katalog & harga lintas outlet                                                                                                                                      |
| `/owner/outlets`  | Outlet           | Data outlet, alamat, status operasional                                                                                                                                     |
| `/owner/shipping` | Tarif Ongkir     | Titik Google Maps lokasi usaha, tarif per km, biaya dasar, ongkir minimum, gratis ongkir, radius maksimal, faktor jalan, dan simulasi ongkir ke titik Google Maps pelanggan |
| `/owner/staff`    | Akun & Staf      | Daftar staf, peran (owner/admin/staff), tambah/ubah/hapus                                                                                                                   |
| `/owner/vouchers` | Promo & Voucher  | Buat voucher (persen/nominal), minimum belanja, aktif/nonaktif; kelola banner promo                                                                                         |
| `/owner/settings` | Pengaturan Toko  | Identitas toko, tagline, alamat, aturan poin loyalitas                                                                                                                      |
| `/owner/audit`    | Log Aktivitas    | Riwayat perubahan penting oleh admin/owner                                                                                                                                  |

---

## 4. Fitur Fungsional Detail

### 4.1 Akun & Autentikasi

- **Daftar:** nama lengkap, nomor WhatsApp, alamat (opsional), email, password (min. 6 karakter) + konfirmasi.
- **Validasi:** format email, panjang password, kesesuaian konfirmasi, format nomor WhatsApp, batas panjang setiap isian.
- **Masuk:** email + password, pesan galat bila kombinasi salah.
- **Tampil/sembunyikan password** pada kolom password.
- **Ubah password** dari halaman profil (perlu password lama).
- **Keluar** mengembalikan aplikasi ke mode tamu dan mengunci panel admin.
- Email yang sudah terdaftar tidak bisa dipakai dua kali.
- Alamat yang diisi saat daftar otomatis tersimpan sebagai alamat pengiriman.

### 4.2 Katalog & Pemesanan

- Kategori: Foods, Snacks, Drinks, Combos, Others.
- Pencarian nama menu, badge (mis. terlaris/pedas), estimasi waktu masak.
- Varian pilihan: grup tipe **single** (pilih satu) dan **multi** (pilih banyak), masing-masing bisa menambah harga.
- Catatan khusus per item.
- Keranjang mengambang (floating cart) muncul saat ada item.
- Stok: item dengan stok 0 atau dinonaktifkan tidak dapat dipesan.

### 4.3 Checkout & Pembayaran

- Mode **pickup** (tanpa ongkir) atau **delivery** (ongkir dihitung dari jarak, lihat 4.8).
- Voucher: potongan persen atau nominal, dengan syarat minimum belanja; hanya voucher aktif yang berlaku.
- Metode pembayaran: transfer bank, e-wallet, atau bayar di tempat (ditandai lunas oleh admin).
- Ringkasan: subtotal, diskon, ongkir, total akhir.
- Setelah pesanan dibuat: kode pesanan unik, estimasi waktu, dan poin loyalitas dihitung otomatis (berdasarkan aturan poin per Rp10.000).

### 4.4 Status Pesanan

`Pending Payment` → `Cooking` → `Out for Delivery` / `Ready for Pickup` → `Completed`, dengan kemungkinan `Cancelled`. Admin mengubah status; pelanggan melihat perubahannya di halaman pelacakan.

### 4.5 Loyalitas

- Poin bertambah otomatis setiap pesanan selesai sesuai aturan di pengaturan toko.
- Poin ditampilkan di halaman profil.

### 4.6 Operasional Toko

- Toko dapat dibuka/ditutup; saat tutup pemesanan dihentikan.
- Delivery dan pickup dapat diaktifkan terpisah.
- Jam operasional, kontak WhatsApp, dan detail pembayaran dapat diubah.

### 4.7 Peran & Akses

- **Pelanggan:** seluruh area pelanggan.
- **Admin:** panel operasional, terbuka setelah memasukkan password admin.
- **Owner:** panel pemilik (bisnis, keuangan, staf, promo, audit).
- Tersedia pengalih peran (role switcher) untuk berpindah tampilan saat demo.

### 4.8 Ongkir Berbasis Titik Google Maps

- Owner menentukan **titik lokasi usaha** di halaman `/owner/shipping` dengan menempel tautan Google Maps atau koordinat (`lat,lng`).
- Pelanggan menempel **titik Google Maps** miliknya di halaman `/address`; sistem membaca koordinat dari tautan maupun teks koordinat.
- Jarak dihitung garis lurus (haversine) lalu dikalikan **faktor jalan** (standar 1,3) untuk memperkirakan jarak tempuh nyata; jarak dibulatkan ke 0,1 km.
- Rumus ongkir: `biaya dasar + (jarak tagihan × tarif per km)`, dibulatkan ke kelipatan Rp500, minimal sebesar **ongkir minimum**.
- **Gratis ongkir** berlaku bila subtotal mencapai ambang yang ditetapkan (0 = fitur nonaktif).
- Alamat di luar **radius maksimal** ditandai sebagai di luar jangkauan.
- Halaman owner menyediakan **simulasi** (tempel titik pelanggan + subtotal) dan **tabel contoh tarif** per jarak.

### 4.9 PWA & Lainnya

- Dapat dipasang ke layar utama (prompt instalasi), ikon dan manifest tersedia.
- Navigasi bawah untuk berpindah cepat: Beranda, Menu, Keranjang, Pesanan, Profil.
- Notifikasi ringan (toast) untuk konfirmasi aksi.
- Judul dan deskripsi unik (SEO) di setiap halaman.

---

## 5. Model Data Utama

| Entitas     | Isi                                                                                                                                                |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| MenuItem    | nama, deskripsi, harga, kategori, foto, ketersediaan, waktu masak, badge, stok, grup varian                                                        |
| CartLine    | item, jumlah, harga satuan, pilihan varian, catatan                                                                                                |
| Order       | kode, waktu, tipe (pickup/delivery), item, subtotal, diskon, voucher, ongkir, total, status, status bayar, metode bayar, poin, ETA, data pelanggan |
| Voucher     | kode, tipe (persen/nominal), nilai, minimum belanja, aktif                                                                                         |
| Promo       | judul, subjudul, badge                                                                                                                             |
| Profile     | nama, telepon, email, alamat, daftar alamat, poin, status masuk                                                                                    |
| Account     | email, password, nama, telepon                                                                                                                     |
| StaffMember | nama, peran (owner/admin/staff)                                                                                                                    |
| Settings    | identitas toko, status buka, delivery/pickup, ongkir, radius, rekening, e-wallet, jam buka, aturan poin, password admin                            |

---

## 6. Batasan Saat Ini

1. Data hanya tersimpan di perangkat — tidak ada sinkronisasi antar perangkat maupun antar pengguna.
2. Password disimpan secara lokal tanpa enkripsi — tidak layak untuk data nyata.
3. Pembayaran masih simulasi; belum ada verifikasi transaksi otomatis.
4. Belum ada notifikasi email/WhatsApp otomatis.
5. Belum ada pemulihan password lewat email.

---

## 7. Rencana Pengembangan Berikutnya (Rekomendasi)

1. Aktifkan backend: akun asli, database pesanan, dan hak akses berbasis peran.
2. Integrasi pembayaran (transfer otomatis / QRIS / kartu) dan konfirmasi otomatis.
3. Notifikasi status pesanan via WhatsApp atau email.
4. Lupa password dan verifikasi email.
5. Dashboard analitik lanjutan dan dukungan multi-outlet penuh.
