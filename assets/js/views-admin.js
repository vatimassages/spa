/* ============================================================
   views-admin.js — Halaman Owner/Admin
   1 Dashboard  2 Terapis  3 Pelanggan  4 Layanan  5 Atribut
   6 Orderan    7 Laporan  8 Gaji       9 Cabang   10 Pengaturan
   ============================================================ */
'use strict';

/* ---------- 1. DASHBOARD ---------- */
VIEWS['admin/dashboard'] = {
  title: 'Dashboard', async render(main) {
    await renderAsync(main, async () => {
      const d = await api('dashboard_admin');
      main.innerHTML =
        pageHead('Dashboard Owner', 'Ringkasan performa spa hari ini dan bulan ini') +
        '<div class="stats-grid">' +
        statCard('Terapis Aktif', d.terapis_aktif, 'users') +
        statCard('Total Pelanggan', d.pelanggan_total, 'user') +
        statCard('Order Hari Ini', d.order_hari_ini, 'calendar', 'teal') +
        statCard('Menunggu Konfirmasi', d.order_menunggu, 'clock', 'amber') +
        statCard('Omzet Bulan Ini', fmtIDR(d.omzet_bulan), 'cash', 'violet') +
        statCard('Komisi Terapis (bulan ini)', fmtIDR(d.komisi_bulan), 'wallet', 'rose') +
        '</div>' +
        '<div class="card"><h2>Omzet 7 Hari Terakhir (order selesai)</h2>' + barChart(d.chart || []) + '</div>' +
        '<div class="card"><h2>Order Terbaru</h2>' +
        tableWrap(['Kode', 'Jadwal', 'Pelanggan', 'Terapis', 'Total', 'Status'],
          (d.recent_orders || []).map(o => '<tr>' +
            '<td><b>' + esc(o.kode) + '</b></td>' +
            '<td>' + fmtDate(o.tanggal) + '<div class="muted">' + esc(o.jam) + '</div></td>' +
            '<td>' + esc(o.customer_nama) + '</td><td>' + (o.therapist_nama ? esc(o.therapist_nama) : '<span class="muted">belum ada</span>') + '</td>' +
            '<td><b>' + fmtIDR(o.total) + '</b></td><td>' + badge(o.status) + '</td></tr>').join(''),
          'Belum ada order.') +
        '</div>';
    });
  }
};

/* ---------- 2. DATA TERAPIS ---------- */
VIEWS['admin/terapis'] = {
  title: 'Data Terapis', async render(main) {
    const load = async () => {
      const [terapis, branches] = await Promise.all([
        api('list', { table: 'therapists' }).then(r => r.rows),
        api('list', { table: 'branches' }).then(r => r.rows)
      ]);
      const brNama = id => { const b = branches.find(x => x.id === id); return b ? b.nama : '-'; };
      main.innerHTML =
        pageHead('Data Terapis', 'Kelola terapis, cabang, dan persentase bagi hasil',
          '<button class="btn btn-primary" id="btn-add">' + ic('plus', 16) + ' Tambah Terapis</button>') +
        tableWrap(['Nama', 'Kontak', 'Gender', 'Keahlian', 'Cabang', 'Bagi Hasil', 'Status', 'Aksi'],
          terapis.map(t => '<tr>' +
            '<td><div class="cell-nama">' + (t.foto ? '<img class="ava-sm" src="' + esc(t.foto) + '" alt="">' : '<span class="ava-sm foto-empty">' + ic('user', 16) + '</span>') + '<b>' + esc(t.nama) + '</b></div></td><td>' + esc(t.phone || '-') + '</td>' +
            '<td>' + badge(t.gender) + '</td><td>' + esc(t.keahlian || '-') + '</td>' +
            '<td>' + esc(brNama(t.branch_id)) + '</td>' +
            '<td><b>' + num(t.komisi_pct) + '%</b> <span class="muted">untuk terapis</span></td>' +
            '<td>' + badge(t.status) + '</td>' +
            '<td>' + rowActions([
              { icon: 'edit', title: 'Edit', attr: 'data-edit="' + t.id + '"' },
              { icon: 'trash', title: 'Hapus', cls: 'danger', attr: 'data-del="' + t.id + '"' }
            ]) + '</td></tr>').join(''),
          'Belum ada terapis. Klik "Tambah Terapis".');

      qs('#btn-add', main).onclick = () => terapisForm(null, branches);
      qsa('[data-edit]', main).forEach(b => b.onclick = () => terapisForm(terapis.find(t => t.id === b.dataset.edit), branches));
      qsa('[data-del]', main).forEach(b => b.onclick = async () => {
        const t = terapis.find(x => x.id === b.dataset.del);
        if (!(await confirmDialog('Hapus terapis?', 'Terapis "' + t.nama + '" akan dihapus. Jika punya riwayat order, akun dinonaktifkan saja.'))) return;
        try {
          const r = await api('delete', { table: 'therapists', id: t.id });
          toast(r.deactivated ? 'Terapis memiliki riwayat order — status dinonaktifkan.' : 'Terapis dihapus.');
          load();
        } catch (err) { toast(err.message, 'err'); }
      });
    };
    await renderAsync(main, load);
  }
};
function terapisForm(t, branches) {
  formModal({
    title: t ? 'Edit Terapis' : 'Tambah Terapis', wide: true,
    fields: [
      { name: 'nama', label: 'Nama Lengkap', required: true, value: t && t.nama },
      { name: 'phone', label: 'No. HP / WA', value: t && t.phone },
      { name: 'gender', label: 'Gender', type: 'select', options: [{ v: 'wanita', l: 'Wanita' }, { v: 'pria', l: 'Pria' }], value: t ? t.gender : 'wanita' },
      { name: 'keahlian', label: 'Keahlian', placeholder: 'cth: Balinese Massage', value: t && t.keahlian },
      { name: 'branch_id', label: 'Cabang', type: 'select', required: true, options: branches.map(b => ({ v: b.id, l: b.nama })), value: t && t.branch_id },
      { name: 'komisi_pct', label: 'Bagi Hasil Terapis (%)', type: 'number', min: 0, max: 100, required: true, hint: 'Persentase dari harga layanan yang diterima terapis', value: t ? t.komisi_pct : 40 },
      { name: 'status', label: 'Status', type: 'select', options: [{ v: 'aktif', l: 'Aktif' }, { v: 'nonaktif', l: 'Nonaktif' }], value: t ? t.status : 'aktif' },
      { name: 'foto', label: 'Foto Terapis', type: 'image', full: true, hint: 'Foto tampil di menu Foto Terapis untuk pelanggan', value: t && t.foto },
      !t ? { name: 'username', label: 'Username Login', required: true, hint: 'Untuk akun terapis masuk aplikasi' } : null,
      !t ? { name: 'password', label: 'Password Login', type: 'password', required: true } : null
    ].filter(Boolean),
    onSubmit: async v => {
      v.komisi_pct = num(v.komisi_pct);
      await api('save', { table: 'therapists', record: t ? Object.assign({ id: t.id }, v) : v });
      toast(t ? 'Data terapis diperbarui.' : 'Terapis baru ditambahkan.');
      router();
    }
  });
}

/* ---------- 3. DATA PELANGGAN ---------- */
VIEWS['admin/pelanggan'] = {
  title: 'Data Pelanggan', async render(main) {
    await renderAsync(main, async () => {
      const rows = (await api('list', { table: 'customers' })).rows;
      main.innerHTML =
        pageHead('Data Pelanggan', 'Semua pelanggan terdaftar',
          '<input type="text" id="src" class="filter-bar" placeholder="Cari nama / HP..." style="max-width:230px;padding:8px 12px;border:1.5px solid var(--line);border-radius:10px;background:#fff">') +
        '<div id="tbl"></div>';

      function paint(filter) {
        const f = (filter || '').toLowerCase();
        const list = rows.filter(c => !f || (c.nama + ' ' + c.phone).toLowerCase().includes(f));
        qs('#tbl', main).innerHTML = tableWrap(['Nama', 'No. HP', 'Alamat', 'Terdaftar', 'Status', 'Aksi'],
          list.map(c => '<tr><td><b>' + esc(c.nama) + '</b></td><td>' + esc(c.phone || '-') + '</td>' +
            '<td>' + esc(c.alamat || '-') + '</td><td class="muted">' + fmtDate(c.created_at) + '</td>' +
            '<td>' + badge(c.status) + '</td>' +
            '<td>' + rowActions([
              { icon: 'edit', title: 'Edit', attr: 'data-edit="' + c.id + '"' },
              { icon: 'trash', title: 'Hapus', cls: 'danger', attr: 'data-del="' + c.id + '"' }
            ]) + '</td></tr>').join(''),
          'Tidak ada pelanggan.');
        qsa('[data-edit]', main).forEach(b => b.onclick = () => {
          const c = rows.find(x => x.id === b.dataset.edit);
          formModal({
            title: 'Edit Pelanggan',
            fields: [
              { name: 'nama', label: 'Nama', required: true, value: c.nama },
              { name: 'phone', label: 'No. HP', value: c.phone },
              { name: 'alamat', label: 'Alamat', type: 'textarea', full: true, value: c.alamat },
              { name: 'status', label: 'Status', type: 'select', options: [{ v: 'aktif', l: 'Aktif' }, { v: 'nonaktif', l: 'Nonaktif' }], value: c.status }
            ],
            onSubmit: async v => { await api('save', { table: 'customers', record: Object.assign({ id: c.id }, v) }); toast('Pelanggan diperbarui.'); router(); }
          });
        });
        qsa('[data-del]', main).forEach(b => b.onclick = async () => {
          const c = rows.find(x => x.id === b.dataset.del);
          if (!(await confirmDialog('Hapus pelanggan?', '"' + c.nama + '" akan dihapus dari daftar.'))) return;
          try {
            const r = await api('delete', { table: 'customers', id: c.id });
            toast(r.deactivated ? 'Pelanggan punya riwayat order — dinonaktifkan.' : 'Pelanggan dihapus.');
            router();
          } catch (err) { toast(err.message, 'err'); }
        });
      }
      qs('#src', main).oninput = e => paint(e.target.value);
      paint('');
    });
  }
};

/* ---------- 4. JENIS LAYANAN (TREATMENT MENU) ---------- */
VIEWS['admin/layanan'] = {
  title: 'Jenis Layanan', async render(main) {
    const load = async () => {
      const rows = (await api('list', { table: 'services' })).rows;
      const cats = [...new Set(rows.map(s => s.kategori))];
      main.innerHTML =
        pageHead('Kategori Jenis Layanan (Treatment Menu)', 'Daftar treatment yang bisa dipesan pelanggan beserta harga',
          '<button class="btn btn-primary" id="btn-add">' + ic('plus', 16) + ' Tambah Layanan</button>') +
        cats.map(c => '<div class="card"><h2>' + esc(c) + '</h2>' +
          tableWrap(['Layanan', 'Durasi', 'Harga', 'Komisi Khusus', 'Status', 'Aksi'],
            rows.filter(s => s.kategori === c).map(s => '<tr>' +
              '<td><b>' + esc(s.nama) + '</b><div class="muted">' + esc(s.deskripsi || '') + '</div></td>' +
              '<td>' + esc(s.durasi ? s.durasi + ' mnt' : '-') + '</td><td><b>' + fmtIDR(s.harga) + '</b></td>' +
              '<td>' + (s.komisi_pct ? num(s.komisi_pct) + '%' : '<span class="muted">ikut terapis</span>') + '</td>' +
              '<td>' + badge(s.status) + '</td>' +
              '<td>' + rowActions([
                { icon: 'edit', title: 'Edit', attr: 'data-edit="' + s.id + '"' },
                { icon: 'trash', title: 'Hapus', cls: 'danger', attr: 'data-del="' + s.id + '"' }
              ]) + '</td></tr>').join(''), '') + '</div>').join('') ||
        '<div class="empty">Belum ada layanan. Klik "Tambah Layanan".</div>';

      const form = s => formModal({
        title: s ? 'Edit Layanan' : 'Tambah Layanan', wide: true,
        fields: [
          { name: 'nama', label: 'Nama Layanan', required: true, value: s && s.nama },
          { name: 'kategori', label: 'Kategori', required: true, hint: 'Kategori yang sudah ada: ' + (cats.join(', ') || '-'), value: s ? s.kategori : '' },
          { name: 'durasi', label: 'Durasi (menit)', type: 'number', min: 0, value: s && s.durasi },
          { name: 'harga', label: 'Harga (Rp)', type: 'number', min: 0, required: true, value: s && s.harga },
          { name: 'komisi_pct', label: 'Komisi Khusus (%)', type: 'number', min: 0, max: 100, hint: 'Kosongkan untuk ikut persentase terapis', value: s ? s.komisi_pct : '' },
          { name: 'deskripsi', label: 'Deskripsi', type: 'textarea', full: true, value: s && s.deskripsi },
          { name: 'status', label: 'Status', type: 'select', options: [{ v: 'aktif', l: 'Aktif' }, { v: 'nonaktif', l: 'Nonaktif' }], value: s ? s.status : 'aktif' }
        ],
        onSubmit: async v => {
          await api('save', { table: 'services', record: s ? Object.assign({ id: s.id }, v) : v });
          toast('Layanan disimpan.'); router();
        }
      });
      const addBtn = qs('#btn-add', main);
      if (addBtn) addBtn.onclick = () => form(null);
      qsa('[data-edit]', main).forEach(b => b.onclick = () => form(rows.find(s => s.id === b.dataset.edit)));
      qsa('[data-del]', main).forEach(b => b.onclick = async () => {
        const s = rows.find(x => x.id === b.dataset.del);
        if (!(await confirmDialog('Hapus layanan?', '"' + s.nama + '" akan dihapus.'))) return;
        try { await api('delete', { table: 'services', id: s.id }); toast('Layanan dihapus.'); router(); }
        catch (err) { toast(err.message, 'err'); }
      });
    };
    await renderAsync(main, load);
  }
};

/* ---------- 5. ATRIBUT & FILTER PILIHAN ---------- */
VIEWS['admin/atribut'] = {
  title: 'Atribut & Filter', async render(main) {
    let selected = null;
    const load = async () => {
      const [attrs, opts] = await Promise.all([
        api('list', { table: 'attributes' }).then(r => r.rows),
        api('list', { table: 'attribute_options' }).then(r => r.rows)
      ]);
      if (!selected && attrs.length) selected = attrs[0].id;
      const cur = attrs.find(a => a.id === selected);

      main.innerHTML =
        pageHead('Atribut & Filter Pilihan (Customization Menu)', 'Pilihan tambahan yang muncul saat pelanggan booking',
          '<button class="btn btn-primary" id="btn-add">' + ic('plus', 16) + ' Tambah Atribut</button>') +
        '<div class="card"><h2>Daftar Atribut</h2>' +
        tableWrap(['Nama Atribut', 'Jenis', 'Jumlah Pilihan', 'Aksi'],
          attrs.map(a => '<tr class="' + (a.id === selected ? 'row-sel' : '') + '"><td><b>' + esc(a.nama) + '</b></td>' +
            '<td>' + (a.tipe === 'jamak' ? 'Pilih beberapa' : 'Pilih satu') + '</td>' +
            '<td>' + opts.filter(o => o.attribute_id === a.id).length + '</td>' +
            '<td>' + rowActions([
              { icon: 'eye', title: 'Lihat pilihan', attr: 'data-sel="' + a.id + '"' },
              { icon: 'edit', title: 'Edit', attr: 'data-edit="' + a.id + '"' },
              { icon: 'trash', title: 'Hapus', cls: 'danger', attr: 'data-del="' + a.id + '"' }
            ]) + '</td></tr>').join(''),
          'Belum ada atribut.') + '</div>' +
        (cur ? '<div class="card"><h2>Pilihan untuk: ' + esc(cur.nama) + '</h2>' +
          '<button class="btn btn-ghost btn-sm" id="btn-add-opt" style="margin-bottom:10px">' + ic('plus', 14) + ' Tambah Pilihan</button>' +
          tableWrap(['Pilihan', 'Harga Tambahan', 'Aksi'],
            opts.filter(o => o.attribute_id === cur.id).map(o => '<tr><td>' + esc(o.label) + '</td>' +
              '<td>' + (num(o.harga_extra) ? '+' + fmtIDR(o.harga_extra) : 'Gratis') + '</td>' +
              '<td>' + rowActions([
                { icon: 'edit', title: 'Edit', attr: 'data-oedit="' + o.id + '"' },
                { icon: 'trash', title: 'Hapus', cls: 'danger', attr: 'data-odel="' + o.id + '"' }
              ]) + '</td></tr>').join(''),
            'Belum ada pilihan.') + '</div>' : '');

      qs('#btn-add', main).onclick = () => formModal({
        title: 'Tambah Atribut',
        fields: [
          { name: 'nama', label: 'Nama Atribut', required: true, placeholder: 'cth: Aroma Minyak' },
          { name: 'tipe', label: 'Jenis Pilihan', type: 'select', options: [{ v: 'pilihan', l: 'Pilih salah satu' }, { v: 'jamak', l: 'Boleh pilih beberapa' }] }
        ],
        onSubmit: async v => { await api('save', { table: 'attributes', record: v }); toast('Atribut ditambahkan.'); router(); }
      });
      const addOpt = qs('#btn-add-opt', main);
      if (addOpt) addOpt.onclick = () => optForm(null, cur);
      qsa('[data-sel]', main).forEach(b => b.onclick = () => { selected = b.dataset.sel; load(); });
      qsa('[data-edit]', main).forEach(b => b.onclick = () => {
        const a = attrs.find(x => x.id === b.dataset.edit);
        formModal({
          title: 'Edit Atribut',
          fields: [
            { name: 'nama', label: 'Nama Atribut', required: true, value: a.nama },
            { name: 'tipe', label: 'Jenis Pilihan', type: 'select', options: [{ v: 'pilihan', l: 'Pilih salah satu' }, { v: 'jamak', l: 'Boleh pilih beberapa' }], value: a.tipe }
          ],
          onSubmit: async v => { await api('save', { table: 'attributes', record: Object.assign({ id: a.id }, v) }); toast('Atribut diperbarui.'); router(); }
        });
      });
      qsa('[data-del]', main).forEach(b => b.onclick = async () => {
        if (!(await confirmDialog('Hapus atribut?', 'Atribut beserta seluruh pilihannya akan dihapus.'))) return;
        await api('delete', { table: 'attributes', id: b.dataset.del }); toast('Atribut dihapus.'); router();
      });
      qsa('[data-oedit]', main).forEach(b => b.onclick = () => optForm(opts.find(o => o.id === b.dataset.oedit), cur));
      qsa('[data-odel]', main).forEach(b => b.onclick = async () => {
        if (!(await confirmDialog('Hapus pilihan?', 'Pilihan ini akan dihapus dari atribut.'))) return;
        await api('delete', { table: 'attribute_options', id: b.dataset.odel }); toast('Pilihan dihapus.'); router();
      });
    };
    function optForm(o, attr) {
      formModal({
        title: o ? 'Edit Pilihan' : 'Tambah Pilihan — ' + attr.nama,
        fields: [
          { name: 'label', label: 'Label Pilihan', required: true, value: o && o.label },
          { name: 'harga_extra', label: 'Harga Tambahan (Rp)', type: 'number', min: 0, value: o ? o.harga_extra : 0, hint: '0 = gratis' }
        ],
        onSubmit: async v => {
          const rec = o ? Object.assign({ id: o.id }, v) : Object.assign({ attribute_id: attr.id }, v);
          await api('save', { table: 'attribute_options', record: rec });
          toast('Pilihan disimpan.'); router();
        }
      });
    }
    await renderAsync(main, load);
  }
};

/* ---------- 6. ORDERAN & TRANSAKSI ---------- */
VIEWS['admin/orderan'] = {
  title: 'Orderan & Transaksi', async render(main) {
    const load = async (fStatus, fSearch) => {
      const rows = (await api('list', { table: 'orders' })).rows
        .sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
      const f = (fSearch || '').toLowerCase();
      const list = rows.filter(o =>
        (fStatus === 'semua' || !fStatus || o.status === fStatus) &&
        (!f || (o.kode + ' ' + o.customer_nama + ' ' + o.therapist_nama).toLowerCase().includes(f)));

      main.innerHTML =
        pageHead('Menu Manajemen & Transaksi Pengguna', 'Kelola seluruh order: konfirmasi, tugaskan terapis, selesaikan, dan catat pembayaran',
          '<button class="btn btn-primary" id="btn-new">' + ic('plus', 16) + ' Order Baru (Walk-in)</button>') +
        '<div class="filter-bar">' +
        '<div><label>Status</label><select id="f-status">' +
        ['semua', 'menunggu', 'dikonfirmasi', 'berlangsung', 'selesai', 'batal'].map(s =>
          '<option value="' + s + '"' + (s === (fStatus || 'semua') ? ' selected' : '') + '>' + (s === 'semua' ? 'Semua Status' : STATUS_MAP[s][0]) + '</option>').join('') +
        '</select></div>' +
        '<div style="flex:1"><label>Cari</label><input id="f-search" placeholder="Kode, pelanggan, terapis..." value="' + esc(fSearch || '') + '"></div>' +
        '</div><div id="tbl"></div>';

      function paint() {
        qs('#tbl', main).innerHTML = tableWrap(['Kode', 'Jadwal', 'Pelanggan', 'Terapis', 'Cabang', 'Total', 'Status', 'Bayar', 'Aksi'],
          list.map(o => '<tr>' +
            '<td><b>' + esc(o.kode) + '</b></td>' +
            '<td>' + fmtDate(o.tanggal) + '<div class="muted">' + esc(o.jam) + '</div></td>' +
            '<td>' + esc(o.customer_nama) + '</td><td>' + (o.therapist_nama ? esc(o.therapist_nama) : '<span class="muted">belum ada</span>') + '</td>' +
            '<td>' + esc(o.branch_nama) + '</td><td><b>' + fmtIDR(o.total) + '</b></td>' +
            '<td>' + badge(o.status) + '</td><td>' + (o.status_bayar ? badge(o.status_bayar) : '<span class="muted">-</span>') + '</td>' +
            '<td>' + rowActions([{ icon: 'eye', title: 'Detail & kelola', attr: 'data-det="' + o.id + '"' }]) + '</td></tr>').join(''),
          'Tidak ada order.');
        qsa('[data-det]', main).forEach(b => b.onclick = () => openOrderDetail(b.dataset.det, load));
      }
      qs('#f-status', main).onchange = e => load(e.target.value, qs('#f-search', main).value);
      let deb; qs('#f-search', main).oninput = e => { clearTimeout(deb); deb = setTimeout(() => load(qs('#f-status', main).value, e.target.value), 300); };
      qs('#btn-new', main).onclick = () => renderBooking(main, { adminMode: true });
      paint();
    };
    await renderAsync(main, load);
  }
};

/* ---------- 7. LAPORAN ---------- */
VIEWS['admin/laporan'] = {
  title: 'Laporan', async render(main) {
    let rep = null;
    main.innerHTML =
      pageHead('Laporan', 'Rekap pendapatan, komisi bagi hasil, dan analisa penjualan') +
      '<div class="filter-bar">' +
      '<div><label>Dari Tanggal</label><input type="date" id="r-dari" value="' + monthStartStr() + '"></div>' +
      '<div><label>Sampai Tanggal</label><input type="date" id="r-sampai" value="' + monthEndStr() + '"></div>' +
      '<div><button class="btn btn-primary" id="r-go">' + ic('chart', 15) + ' Tampilkan</button></div>' +
      '<div><button class="btn btn-ghost" id="r-csv">' + ic('clipboard', 15) + ' Export CSV</button></div>' +
      '</div><div id="r-body"><div class="empty">Pilih periode lalu klik "Tampilkan".</div></div>';

    async function run() {
      const dari = qs('#r-dari', main).value, sampai = qs('#r-sampai', main).value;
      if (!dari || !sampai) { toast('Isi kedua tanggal.', 'err'); return; }
      const body = qs('#r-body', main);
      body.innerHTML = loadingHTML('Menghitung laporan...');
      try { rep = await api('report', { dari, sampai }); }
      catch (err) { body.innerHTML = errorHTML(err); return; }
      const s = rep.summary;
      body.innerHTML =
        '<div class="stats-grid">' +
        statCard('Jumlah Order Selesai', s.jumlah_order, 'clipboard') +
        statCard('Omzet', fmtIDR(s.omzet), 'cash', 'violet') +
        statCard('Komisi Terapis', fmtIDR(s.komisi), 'wallet', 'rose') +
        statCard('Pendapatan Bersih Perusahaan', fmtIDR(s.bersih), 'chart', 'teal') +
        '</div>' +
        '<div class="card"><h2>Grafik Omzet Harian</h2>' + barChart(rep.harian || []) + '</div>' +
        '<div class="tabs">' +
        '<button class="active" data-tab="layanan">Per Layanan</button>' +
        '<button data-tab="terapis">Per Terapis</button>' +
        '<button data-tab="cabang">Per Cabang</button></div>' +
        '<div id="r-tab"></div>';
      qsa('[data-tab]', body).forEach(b => b.onclick = () => {
        qsa('[data-tab]', body).forEach(x => x.classList.remove('active'));
        b.classList.add('active');
        paintTab(b.dataset.tab);
      });
      function paintTab(tab) {
        const data = rep['per_' + tab] || [];
        const isLayanan = tab === 'layanan';
        qs('#r-tab', body).innerHTML = tableWrap(
          ['Nama', 'Jumlah ' + (isLayanan ? 'Item' : 'Order'), 'Omzet', 'Komisi', 'Bersih'],
          data.map(r => '<tr><td>' + esc(r.nama) + '</td><td>' + r.jumlah_order + '</td>' +
            '<td><b>' + fmtIDR(r.omzet) + '</b></td><td>' + fmtIDR(r.komisi) + '</td>' +
            '<td>' + fmtIDR(r.omzet - r.komisi) + '</td></tr>').join(''),
          'Tidak ada data pada periode ini.');
      }
      qs('#r-csv', main).onclick = () => {
        if (!rep) { toast('Tampilkan laporan dulu.', 'err'); return; }
        downloadCSV('laporan-vati-' + dari + '_' + sampai + '.csv',
          ['Kategori', 'Nama', 'Jumlah', 'Omzet', 'Komisi', 'Bersih'],
          ['per_layanan', 'per_terapis', 'per_cabang'].flatMap(k =>
            (rep[k] || []).map(r => [k.replace('per_', 'Per '), r.nama, r.jumlah_order, r.omzet, r.komisi, r.omzet - r.komisi])));
        toast('CSV diunduh.');
      };
      paintTab('layanan');
    }
    qs('#r-go', main).onclick = run;
    run();
  }
};

/* ---------- 8. GAJI & SLIP (BAGI HASIL) ---------- */
VIEWS['admin/gaji'] = {
  title: 'Gaji & Slip', async render(main) {
    const load = async () => {
      const [terapis, slips, orders] = await Promise.all([
        api('list', { table: 'therapists' }).then(r => r.rows),
        api('list', { table: 'payslips' }).then(r => r.rows),
        api('list', { table: 'orders' }).then(r => r.rows.filter(o => o.status === 'selesai'))
      ]);
      slips.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));

      main.innerHTML =
        pageHead('Pengaturan Gaji Terapis — Bagi Hasil', 'Terbitkan slip gaji berbasis persentase komisi dari order selesai') +
        '<div class="card"><h2>Buat Slip Gaji</h2><div class="form-grid">' +
        '<div><label>Terapis</label><select id="g-terapis">' + terapis.map(t => '<option value="' + t.id + '">' + esc(t.nama) + ' (' + num(t.komisi_pct) + '%)</option>').join('') + '</select></div>' +
        '<div><label>Periode Sampai</label><input type="date" id="g-sampai" value="' + todayStr() + '"></div>' +
        '<div><label>Periode Dari</label><input type="date" id="g-dari" value="' + monthStartStr() + '"></div>' +
        '<div style="align-self:end"><button class="btn btn-primary" id="g-preview">' + ic('eye', 15) + ' Hitung</button></div>' +
        '</div><div id="g-preview-box" style="margin-top:12px"></div></div>' +
        '<div class="card"><h2>Riwayat Slip Gaji</h2>' +
        tableWrap(['Slip', 'Terapis', 'Periode', 'Jumlah Order', 'Total Komisi', 'Status', 'Aksi'],
          slips.map(s => '<tr><td><b>' + esc(s.id) + '</b></td><td>' + esc(s.therapist_nama) + '</td>' +
            '<td>' + fmtDate(s.dari) + ' — ' + fmtDate(s.sampai) + '</td><td>' + s.jumlah_order + '</td>' +
            '<td><b>' + fmtIDR(s.total_komisi) + '</b></td><td>' + badge(s.status) + '</td>' +
            '<td>' + (s.status === 'belum_dibayar'
              ? '<button class="btn btn-primary btn-sm" data-pay="' + s.id + '">' + ic('cash', 13) + ' Tandai Dibayar</button>'
              : '<span class="muted">' + fmtDate(s.tanggal_bayar) + '</span>') + '</td></tr>').join(''),
          'Belum ada slip gaji.') + '</div>';

      qs('#g-preview', main).onclick = () => {
        const tid = qs('#g-terapis', main).value;
        const dari = qs('#g-dari', main).value, sampai = qs('#g-sampai', main).value;
        if (!dari || dari > sampai) { toast('Periode tidak valid.', 'err'); return; }
        const list = orders.filter(o => o.therapist_id === tid && o.tanggal >= dari && o.tanggal <= sampai);
        const total = list.reduce((a, o) => a + num(o.komisi_terapis), 0);
        const t = terapis.find(x => x.id === tid);
        qs('#g-preview-box', main).innerHTML =
          tableWrap(['Kode Order', 'Tanggal', 'Total Order', 'Komisi ' + num(t.komisi_pct) + '%'],
            list.map(o => '<tr><td>' + esc(o.kode) + '</td><td>' + fmtDate(o.tanggal) + '</td>' +
              '<td>' + fmtIDR(o.total) + '</td><td><b>' + fmtIDR(o.komisi_terapis) + '</b></td></tr>').join(''),
            'Tidak ada order selesai pada periode ini.') +
          (list.length ? '<div style="display:flex;justify-content:space-between;align-items:center;margin-top:10px;flex-wrap:wrap;gap:8px">' +
            '<b style="font-size:16px">Total bagi hasil: ' + fmtIDR(total) + ' (' + list.length + ' order)</b>' +
            '<button class="btn btn-primary" id="g-issue">' + ic('check', 15) + ' Terbitkan Slip</button></div>' : '');

        const issue = qs('#g-issue', main);
        if (issue) issue.onclick = async () => {
          try {
            await api('payslip_create', { therapist_id: tid, dari, sampai });
            toast('Slip gaji diterbitkan.'); load();
          } catch (err) { toast(err.message, 'err'); }
        };
      };
      qsa('[data-pay]', main).forEach(b => b.onclick = async () => {
        try { await api('payslip_pay', { payslip_id: b.dataset.pay }); toast('Slip ditandai sudah dibayar.'); load(); }
        catch (err) { toast(err.message, 'err'); }
      });
    };
    await renderAsync(main, load);
  }
};

/* ---------- 9. AKUN CABANG ---------- */
VIEWS['admin/cabang'] = {
  title: 'Akun Cabang', async render(main) {
    const load = async () => {
      const rows = (await api('list', { table: 'branches' })).rows;
      main.innerHTML =
        pageHead('Akun Cabang', 'Daftar lokasi / cabang spa',
          '<button class="btn btn-primary" id="btn-add">' + ic('plus', 16) + ' Tambah Cabang</button>') +
        tableWrap(['Nama Cabang', 'Alamat', 'Telepon', 'Status', 'Aksi'],
          rows.map(b => '<tr><td><b>' + esc(b.nama) + '</b></td><td>' + esc(b.alamat || '-') + '</td>' +
            '<td>' + esc(b.phone || '-') + '</td><td>' + badge(b.status) + '</td>' +
            '<td>' + rowActions([
              { icon: 'edit', title: 'Edit', attr: 'data-edit="' + b.id + '"' },
              { icon: 'trash', title: 'Hapus', cls: 'danger', attr: 'data-del="' + b.id + '"' }
            ]) + '</td></tr>').join(''),
          'Belum ada cabang.');

      const form = br => formModal({
        title: br ? 'Edit Cabang' : 'Tambah Cabang',
        fields: [
          { name: 'nama', label: 'Nama Cabang', required: true, value: br && br.nama },
          { name: 'phone', label: 'Telepon', value: br && br.phone },
          { name: 'alamat', label: 'Alamat', type: 'textarea', full: true, value: br && br.alamat },
          { name: 'status', label: 'Status', type: 'select', options: [{ v: 'aktif', l: 'Aktif' }, { v: 'nonaktif', l: 'Nonaktif' }], value: br ? br.status : 'aktif' }
        ],
        onSubmit: async v => { await api('save', { table: 'branches', record: br ? Object.assign({ id: br.id }, v) : v }); toast('Cabang disimpan.'); router(); }
      });
      qs('#btn-add', main).onclick = () => form(null);
      qsa('[data-edit]', main).forEach(b => b.onclick = () => form(rows.find(x => x.id === b.dataset.edit)));
      qsa('[data-del]', main).forEach(b => b.onclick = async () => {
        const br = rows.find(x => x.id === b.dataset.del);
        if (!(await confirmDialog('Hapus cabang?', '"' + br.nama + '" akan dihapus.'))) return;
        try { await api('delete', { table: 'branches', id: br.id }); toast('Cabang dihapus.'); router(); }
        catch (err) { toast(err.message, 'err'); }
      });
    };
    await renderAsync(main, load);
  }
};

/* ---------- 10. PENGATURAN ---------- */
VIEWS['admin/pengaturan'] = {
  title: 'Pengaturan', async render(main) {
    const load = async () => {
      const [st, users] = await Promise.all([
        api('settings_get'),
        api('list', { table: 'users' }).then(r => r.rows)
      ]);
      main.innerHTML =
        pageHead('Pengaturan Akun Perusahaan, Terapis & Pelanggan', 'Identitas perusahaan, komisi default, dan kelola akun') +
        '<div class="tabs"><button class="active" data-tab="co">Perusahaan</button><button data-tab="akun">Kelola Akun</button></div>' +
        '<div id="tab-body"></div>';

      function tabCo() {
        qs('#tab-body', main).innerHTML =
          '<div class="card"><h2>Identitas & Aturan Perusahaan</h2><div class="form-grid">' +
          '<div class="full"><label>Nama Perusahaan</label><input id="st-nama" value="' + esc(st.nama_perusahaan || '') + '"></div>' +
          '<div class="full"><label>Alamat</label><input id="st-alamat" value="' + esc(st.alamat || '') + '"></div>' +
          '<div><label>Telepon</label><input id="st-telp" value="' + esc(st.telepon || '') + '"></div>' +
          '<div><label>Jam Operasional</label><input id="st-jam" value="' + esc(st.jam_operasional || '') + '"></div>' +
          '<div><label>Komisi Default Terapis (%)</label><input type="number" id="st-komisi" min="0" max="100" value="' + esc(st.komisi_default || 40) + '">' +
          '<div class="fm-hint">Dipakai bila terapis & layanan tidak punya komisi khusus</div></div>' +
          '<div class="full"><label>QRIS Pembayaran</label>' +
          '<div class="img-field" data-name="qris_image">' +
          '<div class="img-preview qris-preview">' + (st.qris_image ? '<img src="' + esc(st.qris_image) + '" alt="">' : ic('camera', 26)) + '</div>' +
          '<input type="hidden" id="st-qris" value="' + esc(st.qris_image || '') + '">' +
          '<input type="file" class="img-input" id="st-qris-file" accept="image/*">' +
          '<button type="button" class="btn btn-ghost btn-sm" id="st-qris-clear"' + (st.qris_image ? '' : ' style="display:none"') + '>Hapus QRIS</button>' +
          '<div class="fm-hint">Foto QRIS tampil saat pelanggan membayar via QRIS</div></div></div>' +
          '</div><button class="btn btn-primary" id="st-save" style="margin-top:14px">' + ic('check', 15) + ' Simpan Pengaturan</button></div>';
        const qrisPrev = qs('.qris-preview', main), qrisHidden = qs('#st-qris', main),
          qrisClear = qs('#st-qris-clear', main), qrisFile = qs('#st-qris-file', main);
        qrisFile.addEventListener('change', async () => {
          if (!qrisFile.files || !qrisFile.files[0]) return;
          try {
            const uri = await imageToDataURI(qrisFile.files[0], 360, 0.8);
            qrisHidden.value = uri;
            qrisPrev.innerHTML = '<img src="' + uri + '" alt="">';
            qrisClear.style.display = '';
          } catch (err) { toast(err.message, 'err'); }
        });
        qrisClear.addEventListener('click', () => {
          qrisHidden.value = ''; qrisFile.value = '';
          qrisPrev.innerHTML = ic('camera', 26);
          qrisClear.style.display = 'none';
        });
        qs('#st-save', main).onclick = async () => {
          try {
            await api('settings_save', { settings: {
              nama_perusahaan: qs('#st-nama', main).value,
              alamat: qs('#st-alamat', main).value,
              telepon: qs('#st-telp', main).value,
              jam_operasional: qs('#st-jam', main).value,
              komisi_default: num(qs('#st-komisi', main).value),
              qris_image: qrisHidden.value
            } });
            toast('Pengaturan disimpan.');
          } catch (err) { toast(err.message, 'err'); }
        };
      }
      function tabAkun() {
        qs('#tab-body', main).innerHTML =
          '<div class="card"><h2>Semua Akun Pengguna</h2>' +
          '<button class="btn btn-primary btn-sm" id="u-add" style="margin-bottom:10px">' + ic('plus', 14) + ' Tambah Akun Owner</button>' +
          tableWrap(['Nama', 'Username', 'Role', 'No. HP', 'Status', 'Aksi'],
            users.map(u => '<tr><td><b>' + esc(u.nama) + '</b></td><td>' + esc(u.username) + '</td>' +
              '<td>' + esc(ROLE_LABEL[u.role] || u.role) + '</td><td>' + esc(u.phone || '-') + '</td>' +
              '<td>' + badge(u.status) + '</td>' +
              '<td>' + rowActions([
                { icon: 'edit', title: 'Edit / reset password', attr: 'data-edit="' + u.id + '"' },
                ...(u.id !== (Session.get() || {}).user.id ? [{ icon: 'trash', title: 'Hapus', cls: 'danger', attr: 'data-del="' + u.id + '"' }] : [])
              ]) + '</td></tr>').join(''),
            'Tidak ada akun.') +
          '<p class="muted" style="margin-top:10px;font-size:12.5px">Akun terapis dikelola di menu Data Terapis; akun pelanggan di menu Data Pelanggan & halaman pendaftaran.</p></div>';

        const form = u => formModal({
          title: u ? 'Edit Akun — ' + u.username : 'Tambah Akun Owner',
          fields: [
            { name: 'nama', label: 'Nama', required: true, value: u && u.nama },
            { name: 'username', label: 'Username', required: true, value: u && u.username },
            { name: 'phone', label: 'No. HP', value: u && u.phone },
            { name: 'password', label: 'Password Baru', type: 'password', hint: u ? 'Kosongkan jika tidak diganti' : 'Wajib diisi', required: !u },
            { name: 'status', label: 'Status', type: 'select', options: [{ v: 'aktif', l: 'Aktif' }, { v: 'nonaktif', l: 'Diblokir' }], value: u ? u.status : 'aktif' }
          ],
          onSubmit: async v => {
            if (u && !v.password) delete v.password;
            await api('save', { table: 'users', record: u ? Object.assign({ id: u.id }, v) : Object.assign({ role: 'admin' }, v) });
            toast('Akun disimpan.'); load();
          }
        });
        qs('#u-add', main).onclick = () => form(null);
        qsa('[data-edit]', main).forEach(b => b.onclick = () => form(users.find(u => u.id === b.dataset.edit)));
        qsa('[data-del]', main).forEach(b => b.onclick = async () => {
          const u = users.find(x => x.id === b.dataset.del);
          if (!(await confirmDialog('Hapus akun?', 'Akun "' + u.username + '" akan dihapus permanen.'))) return;
          try { await api('delete', { table: 'users', id: u.id }); toast('Akun dihapus.'); load(); }
          catch (err) { toast(err.message, 'err'); }
        });
      }
      qsa('[data-tab]', main).forEach(b => b.onclick = () => {
        qsa('[data-tab]', main).forEach(x => x.classList.remove('active'));
        b.classList.add('active');
        (b.dataset.tab === 'co' ? tabCo : tabAkun)();
      });
      tabCo();
    };
    await renderAsync(main, load);
  }
};
