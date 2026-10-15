# Vati Massage Spa — Sistem Manajemen Spa

Aplikasi web **Vati Massage Spa** yang dapat diakses oleh **Owner (admin)**, **Terapis**, dan **Pelanggan**.

- **Frontend**: HTML/CSS/JS murni (statik — siap di-hosting di **GitHub Pages**)
- **Backend**: **Google Apps Script** (REST API) + **Google Sheets** sebagai database
- **Menu**: Hamburger / Navigation Drawer (off-canvas) untuk semua peran
- **Bahasa**: Indonesia

---

## Fitur per Peran

### 1. Owner / Admin
1. **Dashboard** terapis & pelanggan (omzet, komisi, order harian, grafik 7 hari)
2. **Data Terapis** — tambah/edit terapis + akun login + **pengaturan gaji bagi hasil (%)**
3. **Data Pelanggan** — daftar & kelola pelanggan
4. **Orderan**:
   - **Kategori Jenis Layanan (Treatment Menu)** — kelola layanan per kategori + harga
   - **Atribut & Filter Pilihan (Customization Menu)** — pilihan tambahan saat booking (aroma, ekstra, preferensi terapis, dll. + harga tambahan)
   - **Menu Manajemen & Transaksi Pengguna** — konfirmasi order, tugaskan terapis, tandai lunas, order walk-in
5. **Laporan** — omzet, komisi, pendapatan bersih, per layanan/terapis/cabang, grafik harian, export CSV
6. **Gaji & Slip** — terbitkan slip gaji bagi hasil per terapis per periode
7. **Akun Cabang** — kelola cabang
8. **Pengaturan** — identitas perusahaan, komisi default, kelola semua akun

### 2. Terapis
1. **Dashboard** terapis (jadwal hari ini, komisi bulan ini)
2. **Orderan** dari pelanggan (konfirmasi → mulai → selesaikan)
3. **Laporan hasil kerja** per periode + export CSV
4. **Slip gaji** (bagi hasil yang diterbitkan owner)
5. **Pengaturan akun** (profil & password)

### 3. Pelanggan
1. **Dashboard** (status: daftar → respon → proses → selesai)
2. **Booking pijat SPA** — pilih cabang, treatment menu, atribut/pilihan tambahan, jadwal, terapis
3. **Pesanan saya** — riwayat + batalkan booking yang belum dikonfirmasi
4. **Pengaturan akun** (profil & password)

---

## Alur Kerja Order

```
Pelanggan booking  →  MENUNGGU KONFIRMASI  →  DIKONFIRMASI (terapis/admin)
                   →  BERLANGSUNG (mulai treatment)  →  SELESAI
Owner: tandai LUNAS + metode bayar → komisi terapis tercatat → terbitkan slip gaji
```

**Bagi hasil**: setiap order menyimpan persentase komisi terapis. Prioritas: komisi khusus layanan → persentase terapis → komisi default perusahaan (Pengaturan). Komisi dihitung dari harga layanan (tidak termasuk ekstra/tambahan).

---

## CARA DEPLOY

### A. Backend — Google Apps Script + Sheets

1. Buka [sheets.new](https://sheets.new) untuk membuat **Google Spreadsheet** baru (ini menjadi database).
2. Menu **Ekstensi → Apps Script**.
3. Hapus isi `Code.gs`, tempel seluruh isi file **`backend/Code.gs`** dari proyek ini.
4. Klik **Simpan**, lalu pilih fungsi **`setup`** di dropdown dan klik **Run** (Jalankan).
   - Izinkan semua permintaan izin (Advanced → Go to project → Allow).
   - Semua sheet tabel + data awal otomatis dibuat.
5. Klik **Deploy → New deployment** (Deploy → Deployment baru).
   - Type: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
6. Salin **URL Web App** (berakhiran `/exec`).
7. Edit **`assets/js/config.js`**, isi `API_URL` dengan URL tadi:
   ```js
   const CFG = { APP_NAME: 'Vati Massage Spa', API_URL: 'https://script.google.com/macros/s/xxxxx/exec', ... };
   ```

> **Akun awal**: username `admin`, password `admin123`. **Segera ganti** di menu Pengaturan → Kelola Akun.
> Akun demo lain (dibuat oleh `setup`): terapis `sari/terapis123`, pelanggan `dewi/pelanggan123`.

### B. Frontend — GitHub Pages

1. Buat repository GitHub, misal `vati-massage-spa`.
2. Upload **seluruh isi folder ini kecuali `backend/`** (folder backend tidak wajib, tapi boleh ikut sebagai arsip):
   ```
   index.html
   assets/img/logo.jpg
   assets/css/style.css
   assets/js/*.js
   ```
3. Buka **Settings → Pages** → Source: **Deploy from a branch** → Branch: `main` / `(root)` → Save.
4. Tunggu 1–2 menit, lalu buka `https://username.github.io/vati-massage-spa/`.

### C. Mode Demo (opsional, tanpa backend)

Jika `API_URL` di `config.js` dikosongkan (`''`), aplikasi berjalan dalam **Mode Demo**:
data contoh disimpan di browser (localStorage) — cocok untuk latihan/peragaan tanpa server.
Batasan: data tidak tersinkron antar perangkat.

---

## Struktur Proyek

```
vati-massage-spa/
├── index.html              # Halaman utama (shell aplikasi)
├── backend/
│   └── Code.gs             # API Apps Script (tempel ke Apps Script editor)
└── assets/
    ├── img/logo.jpg        # Logo (favicon, topbar, drawer, halaman login)
    ├── css/style.css       # Tema spa
    └── js/
        ├── config.js       # URL API (WAJIB diisi untuk produksi)
        ├── mock.js         # Data demo (mode tanpa server)
        ├── api.js          # Klien API + sesi
        ├── ui.js           # Komponen UI (modal, toast, tabel, ikon)
        ├── app.js          # Router, drawer/hamburger, login/register
        ├── views-booking.js# Form booking + detail order (dipakai bersama)
        ├── views-admin.js  # Halaman Owner
        └── views-terapis.js# Halaman Terapis & Pelanggan
```

## Catatan Teknis

- Permintaan dikirim `POST` (body JSON `text/plain`) — pola standar Apps Script agar bebas masalah CORS.
- Password disimpan **hash SHA-256** di sheet `users`.
- Sesi token berlaku 7 hari (sheet `tokens`).
- Menghapus data yang masih dipakai order akan otomatis menjadi **nonaktif** (riwayat tetap aman).
- Format uang Rupiah, zona waktu `Asia/Jakarta`.
