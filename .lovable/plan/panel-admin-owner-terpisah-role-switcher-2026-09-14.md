# Panel Admin & Owner terpisah + Role Switcher

Aplikasi sudah punya rangka panel Admin dan Owner. Rencana ini memisahkan peran keduanya secara jelas, melengkapi fitur yang diminta, dan menambah switcher peran untuk preview.

## 1. Panel Admin — fokus operasional dapur

- **Papan dapur (baru, jadi halaman utama Admin)**: 4 kolom status — Masuk, Sedang diproses, Siap, Selesai. Tiap kartu pesanan menampilkan kode, nama pembeli, item, total, waktu tunggu, dan tombol untuk memindahkan ke tahap berikutnya. Layar kecil menampilkan kolom sebagai tab yang bisa digeser.
- **Stok harian**: halaman khusus berisi daftar menu dengan tombol Tersedia/Habis, pencarian, filter kategori, dan tombol "tandai semua tersedia" untuk reset pagi. Admin tidak bisa menambah/menghapus menu.
- **Pesanan harian & riwayat**: daftar pesanan hari ini beserta ringkasan (jumlah pesanan, omzet, rata-rata waktu masak) dan riwayat singkat 7 hari terakhir.
- Menu samping Admin dirapikan menjadi: Papan Dapur, Pesanan Harian, Stok Menu, Pelanggan, Operasional.

## 2. Panel Owner — akses penuh

- **Ringkasan performa**: kartu penjualan hari ini / minggu / bulan, total pesanan, rata-rata nilai pesanan, menu terlaris, grafik tren penjualan sederhana.
- **Katalog menu dengan CRUD lengkap**: tambah, ubah, dan hapus item. Form mencakup nama, deskripsi, harga, kategori, gambar (pilih dari galeri gambar yang ada atau tempel alamat gambar), waktu masak, label, dan status tersedia. Termasuk pratinjau kartu menu seperti yang dilihat pembeli.
- **Manajemen akun & staf**: daftar staf dengan pengaturan peran Owner/Admin/Staff, aktif/nonaktif, undang anggota baru, hapus, plus tabel ringkasan hak akses. Data staf dipindah ke penyimpanan aplikasi agar tidak hilang saat pindah halaman.
- **Pengaturan restoran**: identitas toko, jam buka, kontak WhatsApp, layanan delivery/pickup, biaya antar, dan rekening pembayaran.

## 3. Switcher peran untuk preview

Tombol mengapung yang rapi di sudut layar, tersedia di semua halaman, untuk berpindah cepat antara tampilan Pembeli, Admin, dan Owner. Menandai peran yang sedang aktif dan menutup diri saat tidak digunakan.

## Catatan teknis

- Halaman baru/diubah: `admin.index` (papan dapur), `admin.orders` (harian + riwayat), `admin.stock` (menggantikan `admin.menu`), `owner.index`, `owner.menu`, `owner.staff`, `owner.settings`.
- Komponen baru: `KitchenBoard`, `StockPanel`, `MenuCrudPanel`, `RoleSwitcher`; `DashboardShell` menerima daftar navigasi per peran yang diperbarui.
- `src/lib/store.ts` ditambah daftar `staff` beserta aksi simpan/hapus/ubah peran, dan field identitas toko pada settings. Semua tetap tersimpan lokal di peramban — belum ada basis data/login sungguhan, jadi switcher peran hanya untuk tahap preview.
- Setiap halaman baru mendapat judul dan deskripsi sendiri.
