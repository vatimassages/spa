/* ============================================================
   views-terapis.js — Halaman Terapis
   1 Dashboard  2 Orderan Pelanggan  3 Laporan Hasil Kerja
   4 Slip Gaji  5 Pengaturan Akun
   ============================================================ */
'use strict';

/* ---------- 1. DASHBOARD TERAPIS ---------- */
VIEWS['terapis/dashboard'] = {
  title: 'Dashboard Terapis', async render(main) {
    await renderAsync(main, async () => {
      const d = await api('dashboard_terapis');
      main.innerHTML =
        pageHead('Dashboard Terapis', 'Jadwal dan performa Anda') +
        '<div class="stats-grid">' +
        statCard('Order Hari Ini', d.order_hari_ini, 'calendar') +
        statCard('Menunggu Konfirmasi', d.menunggu, 'clock', 'amber') +
        statCard('Selesai Bulan Ini', d.selesai_bulan, 'check', 'teal') +
        statCard('Bagi Hasil Bulan Ini', fmtIDR(d.komisi_bulan), 'wallet', 'violet') +
        '</div>' +
        '<div class="card"><h2>Jadwal Hari Ini</h2>' +
        tableWrap(['Jam', 'Kode', 'Pelanggan', 'Layanan & Total', 'Status', 'Aksi'],
          (d.orders_today || []).map(o => '<tr>' +
            '<td><b>' + esc(o.jam) + '</b></td><td>' + esc(o.kode) + '</td>' +
            '<td>' + esc(o.customer_nama) + '</td><td><b>' + fmtIDR(o.total) + '</b><div class="muted">komisi ' + fmtIDR(o.komisi_terapis) + '</div></td>' +
            '<td>' + badge(o.status) + '</td>' +
            '<td><button class="btn btn-ghost btn-sm" data-det="' + o.id + '">' + ic('eye', 14) + ' Kelola</button></td></tr>').join(''),
          'Tidak ada jadwal hari ini.') + '</div>';
      qsa('[data-det]', main).forEach(b => b.onclick = () => openOrderDetail(b.dataset.det, () => router()));
    });
  }
};

/* ---------- 2. ORDERAN DARI PELANGGAN ---------- */
VIEWS['terapis/orderan'] = {
  title: 'Orderan Pelanggan', async render(main) {
    const load = async (fStatus) => {
      const rows = (await api('list', { table: 'orders' })).rows
        .sort((a, b) => (b.tanggal + b.jam).localeCompare(a.tanggal + a.jam));
      const list = rows.filter(o => fStatus === 'semua' || !fStatus || o.status === fStatus);
      main.innerHTML =
        pageHead('Orderan dari Pelanggan', 'Konfirmasi booking, mulai, dan selesaikan treatment Anda') +
        '<div class="filter-bar"><div><label>Status</label><select id="f-status">' +
        ['semua', 'menunggu', 'dikonfirmasi', 'berlangsung', 'selesai', 'batal'].map(s =>
          '<option value="' + s + '"' + (s === (fStatus || 'semua') ? ' selected' : '') + '>' + (s === 'semua' ? 'Semua' : STATUS_MAP[s][0]) + '</option>').join('') +
        '</select></div></div>' +
        tableWrap(['Jadwal', 'Kode', 'Pelanggan', 'Cabang', 'Total', 'Komisi Anda', 'Status', 'Aksi'],
          list.map(o => '<tr>' +
            '<td>' + fmtDate(o.tanggal) + '<div class="muted">' + esc(o.jam) + '</div></td>' +
            '<td><b>' + esc(o.kode) + '</b></td><td>' + esc(o.customer_nama) + '</td><td>' + esc(o.branch_nama) + '</td>' +
            '<td>' + fmtIDR(o.total) + '</td><td><b>' + fmtIDR(o.komisi_terapis) + '</b></td>' +
            '<td>' + badge(o.status) + '</td>' +
            '<td><button class="btn btn-ghost btn-sm" data-det="' + o.id + '">' + ic('eye', 14) + ' Kelola</button></td></tr>').join(''),
          'Belum ada order untuk Anda.');
      qs('#f-status', main).onchange = e => load(e.target.value);
      qsa('[data-det]', main).forEach(b => b.onclick = () => openOrderDetail(b.dataset.det, load));
    };
    await renderAsync(main, load);
  }
};

/* ---------- 3. LAPORAN HASIL KERJA ---------- */
VIEWS['terapis/laporan'] = {
  title: 'Laporan Hasil Kerja', async render(main) {
    const run = async () => {
      const dari = qs('#w-dari', main).value, sampai = qs('#w-sampai', main).value;
      const body = qs('#w-body', main);
      body.innerHTML = loadingHTML('Menghitung...');
      const rows = (await api('list', { table: 'orders' })).rows
        .filter(o => o.status === 'selesai' && o.tanggal >= dari && o.tanggal <= sampai)
        .sort((a, b) => b.tanggal.localeCompare(a.tanggal));
      const total = rows.reduce((a, o) => a + num(o.komisi_terapis), 0);
      const omzet = rows.reduce((a, o) => a + num(o.total), 0);
      body.innerHTML =
        '<div class="stats-grid">' +
        statCard('Jumlah Order Selesai', rows.length, 'clipboard') +
        statCard('Omzet yang Dihasilkan', fmtIDR(omzet), 'cash', 'violet') +
        statCard('Total Bagi Hasil Anda', fmtIDR(total), 'wallet', 'teal') +
        '</div>' +
        tableWrap(['Tanggal', 'Kode', 'Pelanggan', 'Cabang', 'Total Order', 'Bagi Hasil'],
          rows.map(o => '<tr><td>' + fmtDate(o.tanggal) + '</td><td>' + esc(o.kode) + '</td>' +
            '<td>' + esc(o.customer_nama) + '</td><td>' + esc(o.branch_nama) + '</td>' +
            '<td>' + fmtIDR(o.total) + '</td><td><b>' + fmtIDR(o.komisi_terapis) + '</b></td></tr>').join(''),
          'Belum ada order selesai pada periode ini.');
    };
    main.innerHTML =
      pageHead('Laporan Hasil Kerja', 'Rekap order selesai dan komisi Anda per periode') +
      '<div class="filter-bar">' +
      '<div><label>Dari</label><input type="date" id="w-dari" value="' + monthStartStr() + '"></div>' +
      '<div><label>Sampai</label><input type="date" id="w-sampai" value="' + todayStr() + '"></div>' +
      '<div><button class="btn btn-primary" id="w-go">' + ic('chart', 15) + ' Tampilkan</button></div>' +
      '<div><button class="btn btn-ghost" id="w-csv">' + ic('clipboard', 15) + ' Export CSV</button></div>' +
      '</div><div id="w-body"></div>';
    qs('#w-go', main).onclick = () => renderAsync(qs('#w-body', main), run).catch(e => toast(e.message, 'err'));
    qs('#w-csv', main).onclick = async () => {
      const rows = (await api('list', { table: 'orders' })).rows
        .filter(o => o.status === 'selesai' && o.tanggal >= qs('#w-dari', main).value && o.tanggal <= qs('#w-sampai', main).value);
      downloadCSV('laporan-kerja-' + todayStr() + '.csv',
        ['Tanggal', 'Kode', 'Pelanggan', 'Cabang', 'Total Order', 'Bagi Hasil'],
        rows.map(o => [o.tanggal, o.kode, o.customer_nama, o.branch_nama, o.total, o.komisi_terapis]));
      toast('CSV diunduh.');
    };
    renderAsync(qs('#w-body', main), run);
  }
};

/* ---------- 4. SLIP GAJI ---------- */
VIEWS['terapis/gaji'] = {
  title: 'Slip Gaji', async render(main) {
    await renderAsync(main, async () => {
      const slips = (await api('list', { table: 'payslips' })).rows
        .sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
      const belum = slips.filter(s => s.status === 'belum_dibayar')
        .reduce((a, s) => a + num(s.total_komisi), 0);
      main.innerHTML =
        pageHead('Slip Gaji Terapis', 'Riwayat slip bagi hasil yang diterbitkan owner') +
        '<div class="stats-grid">' +
        statCard('Total Slip', slips.length, 'clipboard') +
        statCard('Belum Dibayar', fmtIDR(belum), 'wallet', 'rose') +
        '</div>' +
        tableWrap(['Slip', 'Periode', 'Jumlah Order', 'Total Komisi', 'Status', 'Tanggal Bayar'],
          slips.map(s => '<tr><td><b>' + esc(s.id) + '</b></td>' +
            '<td>' + fmtDate(s.dari) + ' — ' + fmtDate(s.sampai) + '</td><td>' + s.jumlah_order + '</td>' +
            '<td><b>' + fmtIDR(s.total_komisi) + '</b></td><td>' + badge(s.status) + '</td>' +
            '<td>' + (s.tanggal_bayar ? fmtDate(s.tanggal_bayar) : '-') + '</td></tr>').join(''),
          'Belum ada slip gaji. Owner menerbitkan slip dari menu Gaji & Slip.');
    });
  }
};

/* ---------- 5. PENGATURAN AKUN TERAPIS ---------- */
VIEWS['terapis/pengaturan'] = VIEWS['pelanggan/pengaturan'] = {
  title: 'Pengaturan Akun', async render(main) {
    const s = Session.get().user;
    main.innerHTML =
      pageHead('Pengaturan Akun', 'Perbarui profil dan password Anda') +
      '<div class="card" style="max-width:560px"><h2>Profil Saya</h2><div class="form-grid">' +
      '<div class="full"><label>Nama Lengkap</label><input id="pf-nama" value="' + esc(s.nama) + '"></div>' +
      '<div><label>No. HP / WA</label><input id="pf-phone" value="' + esc(s.phone || '') + '"></div>' +
      '<div><label>Username</label><input value="' + esc(s.username) + '" readonly></div>' +
      '</div><button class="btn btn-primary" id="pf-save" style="margin-top:14px">' + ic('check', 15) + ' Simpan Profil</button></div>' +
      '<div class="card" style="max-width:560px"><h2>Ganti Password</h2><div class="form-grid">' +
      '<div class="full"><label>Password Lama</label><input type="password" id="pf-old"></div>' +
      '<div><label>Password Baru</label><input type="password" id="pf-new"></div>' +
      '<div><label>Ulangi Password Baru</label><input type="password" id="pf-new2"></div>' +
      '</div><button class="btn btn-primary" id="pf-pass" style="margin-top:14px">' + ic('settings', 15) + ' Ganti Password</button></div>';

    qs('#pf-save', main).onclick = async () => {
      try {
        const u = await api('profile_save', { nama: qs('#pf-nama', main).value, phone: qs('#pf-phone', main).value });
        Session.set({ token: Session.get().token, user: Object.assign(Session.get().user, { nama: u.nama, phone: u.phone }) });
        toast('Profil disimpan.'); buildShell();
      } catch (err) { toast(err.message, 'err'); }
    };
    qs('#pf-pass', main).onclick = async () => {
      const lama = qs('#pf-old', main).value, baru = qs('#pf-new', main).value, ulang = qs('#pf-new2', main).value;
      if (!lama || !baru) { toast('Isi password lama dan baru.', 'err'); return; }
      if (baru !== ulang) { toast('Ulangi password tidak sama.', 'err'); return; }
      try { await api('profile_save', { password_lama: lama, password_baru: baru }); toast('Password berhasil diganti.'); qsa('#pf-old,#pf-new,#pf-new2', main).forEach(i => i.value = ''); }
      catch (err) { toast(err.message, 'err'); }
    };
  }
};

/* ============================================================
   views-pelanggan.js — Halaman Pelanggan
   1 Dashboard (daftar, respon, proses)  2 Booking Spa
   3 Pesanan Saya  4 Pengaturan Akun
   ============================================================ */
'use strict';

/* ---------- 1. DASHBOARD PELANGGAN ---------- */
VIEWS['pelanggan/dashboard'] = {
  title: 'Dashboard Saya', async render(main) {
    await renderAsync(main, async () => {
      const d = await api('dashboard_pelanggan');
      main.innerHTML =
        pageHead('Dashboard Pelanggan', 'Pantau booking Anda: daftar, respon spa, dan proses treatment',
          '<a class="btn btn-primary" href="#/pelanggan/booking">' + ic('calendar', 16) + ' Booking Spa Sekarang</a>') +
        '<div class="step-cards">' +
        '<div class="step-card"><div class="num">' + d.menunggu + '</div><div class="lbl">Daftar Booking<br>(menunggu respon)</div></div>' +
        '<div class="step-card"><div class="num">' + d.dikonfirmasi + '</div><div class="lbl">Respon Spa<br>(terkonfirmasi)</div></div>' +
        '<div class="step-card"><div class="num">' + d.berlangsung + '</div><div class="lbl">Proses<br>(sedang treatment)</div></div>' +
        '<div class="step-card"><div class="num">' + d.selesai + '</div><div class="lbl">Selesai<br>(riwayat)</div></div>' +
        '</div>' +
        '<div class="card"><h2>Booking Aktif</h2>' +
        tableWrap(['Jadwal', 'Kode', 'Cabang', 'Terapis', 'Total', 'Status', 'Aksi'],
          (d.aktif || []).map(o => '<tr>' +
            '<td>' + fmtDate(o.tanggal) + '<div class="muted">' + esc(o.jam) + '</div></td>' +
            '<td><b>' + esc(o.kode) + '</b></td><td>' + esc(o.branch_nama) + '</td>' +
            '<td>' + (o.therapist_nama ? esc(o.therapist_nama) : '<span class="muted">menunggu penugasan</span>') + '</td>' +
            '<td>' + fmtIDR(o.total) + '</td><td>' + badge(o.status) + '</td>' +
            '<td><button class="btn btn-ghost btn-sm" data-det="' + o.id + '">' + ic('eye', 14) + ' Detail</button></td></tr>').join(''),
          'Tidak ada booking aktif. Yuk booking sekarang!') + '</div>';
      qsa('[data-det]', main).forEach(b => b.onclick = () => openOrderDetail(b.dataset.det, () => router()));
    });
  }
};

/* ---------- 2. BOOKING SPA ---------- */
VIEWS['pelanggan/booking'] = {
  title: 'Booking Spa', async render(main) {
    await renderBooking(main, { adminMode: false });
  }
};

/* ---------- 3. PESANAN SAYA ---------- */
VIEWS['pelanggan/pesanan'] = {
  title: 'Pesanan Saya', async render(main) {
    const load = async (fStatus) => {
      const rows = (await api('list', { table: 'orders' })).rows
        .sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
      const list = rows.filter(o => fStatus === 'semua' || !fStatus || o.status === fStatus);
      main.innerHTML =
        pageHead('Pesanan Saya', 'Riwayat dan status seluruh booking Anda',
          '<a class="btn btn-primary" href="#/pelanggan/booking">' + ic('plus', 16) + ' Booking Baru</a>') +
        '<div class="filter-bar"><div><label>Status</label><select id="f-status">' +
        ['semua', 'menunggu', 'dikonfirmasi', 'berlangsung', 'selesai', 'batal'].map(s =>
          '<option value="' + s + '"' + (s === (fStatus || 'semua') ? ' selected' : '') + '>' + (s === 'semua' ? 'Semua' : STATUS_MAP[s][0]) + '</option>').join('') +
        '</select></div></div>' +
        tableWrap(['Jadwal', 'Kode', 'Cabang', 'Terapis', 'Total', 'Status', 'Bayar', 'Aksi'],
          list.map(o => '<tr>' +
            '<td>' + fmtDate(o.tanggal) + '<div class="muted">' + esc(o.jam) + '</div></td>' +
            '<td><b>' + esc(o.kode) + '</b></td><td>' + esc(o.branch_nama) + '</td>' +
            '<td>' + esc(o.therapist_nama || '-') + '</td><td>' + fmtIDR(o.total) + '</td>' +
            '<td>' + badge(o.status) + '</td><td>' + (o.status_bayar ? badge(o.status_bayar) : '-') + '</td>' +
            '<td><button class="btn btn-ghost btn-sm" data-det="' + o.id + '">' + ic('eye', 14) + ' Detail</button></td></tr>').join(''),
          'Belum ada pesanan.');
      qs('#f-status', main).onchange = e => load(e.target.value);
      qsa('[data-det]', main).forEach(b => b.onclick = () => openOrderDetail(b.dataset.det, load));
    };
    await renderAsync(main, load);
  }
};
