/* ============================================================
   mock.js — MODE DEMO (tanpa backend)
   Meniru seluruh API Apps Script dengan data di localStorage.
   Aktif otomatis saat CFG.API_URL kosong. Data yang sama dengan
   seed setup() di backend Code.gs.
   ============================================================ */

const MockApi = (() => {
  const KEY = 'vati_demo_db_v1';
  let db = null;

  /* ---------- Data awal ---------- */
  function seed() {
    const now = () => new Date().toISOString();
    const t = (off, h, m) => { const d = new Date(); d.setDate(d.getDate() + off); const mm = String(d.getMonth() + 1).padStart(2, '0'), dd = String(d.getDate()).padStart(2, '0'); return d.getFullYear() + '-' + mm + '-' + dd; };
    const users = [
      { id: 'U1', nama: 'Owner Vati', username: 'admin', password: 'admin123', role: 'admin', phone: '0811-1000-001', status: 'aktif', created_at: now() },
      { id: 'U2', nama: 'Sari Melati', username: 'sari', password: 'terapis123', role: 'terapis', phone: '0811-1000-002', status: 'aktif', created_at: now() },
      { id: 'U3', nama: 'Rina Mulyani', username: 'rina', password: 'terapis123', role: 'terapis', phone: '0811-1000-003', status: 'aktif', created_at: now() },
      { id: 'U4', nama: 'Budi Santoso', username: 'budi', password: 'terapis123', role: 'terapis', phone: '0811-1000-004', status: 'aktif', created_at: now() },
      { id: 'U5', nama: 'Dewi Lestari', username: 'dewi', password: 'pelanggan123', role: 'pelanggan', phone: '0812-2000-005', status: 'aktif', created_at: now() },
      { id: 'U6', nama: 'Siti Aminah', username: 'siti', password: 'pelanggan123', role: 'pelanggan', phone: '0812-2000-006', status: 'aktif', created_at: now() }
    ];
    const therapists = [
      { id: 'T1', user_id: 'U2', nama: 'Sari Melati', phone: '0811-1000-002', gender: 'wanita', keahlian: 'Balinese Massage, Aromatherapy', branch_id: 'BR1', komisi_pct: '40', status: 'aktif', foto: '', created_at: now() },
      { id: 'T2', user_id: 'U3', nama: 'Rina Mulyani', phone: '0811-1000-003', gender: 'wanita', keahlian: 'Aromatherapy, Facial', branch_id: 'BR1', komisi_pct: '40', status: 'aktif', foto: '', created_at: now() },
      { id: 'T3', user_id: 'U4', nama: 'Budi Santoso', phone: '0811-1000-004', gender: 'pria', keahlian: 'Refleksi, Traditional Massage', branch_id: 'BR2', komisi_pct: '35', status: 'aktif', foto: '', created_at: now() }
    ];
    const customers = [
      { id: 'C1', user_id: 'U5', nama: 'Dewi Lestari', phone: '0812-2000-005', alamat: 'Jl. Kenanga No. 5, Jakarta', status: 'aktif', created_at: now() },
      { id: 'C2', user_id: 'U6', nama: 'Siti Aminah', phone: '0812-2000-006', alamat: 'Jl. Melati No. 12, Jakarta', status: 'aktif', created_at: now() }
    ];
    const branches = [
      { id: 'BR1', nama: 'Cabang Pusat', alamat: 'Jl. Merdeka No. 10, Jakarta', phone: '021-555-0001', status: 'aktif', created_at: now() },
      { id: 'BR2', nama: 'Cabang Kelapa Gading', alamat: 'Jl. Boulevard No. 21, Jakarta', phone: '021-555-0002', status: 'aktif', created_at: now() }
    ];
    const services = [
      { id: 'S1', nama: 'Massage Tradisional', kategori: 'Massage', deskripsi: 'Pijat khas dengan teknik tekanan sedang', durasi: '60', harga: '100000', komisi_pct: '', status: 'aktif', created_at: now() },
      { id: 'S2', nama: 'Massage Aromatherapy', kategori: 'Massage', deskripsi: 'Pijat dengan minyak aromaterapi pilihan', durasi: '60', harga: '120000', komisi_pct: '', status: 'aktif', created_at: now() },
      { id: 'S3', nama: 'Massage Refleksi', kategori: 'Massage', deskripsi: 'Terapi titik refleksi kaki dan tangan', durasi: '45', harga: '80000', komisi_pct: '', status: 'aktif', created_at: now() },
      { id: 'S4', nama: 'Scrub Lulur Bali', kategori: 'Body Treatment', deskripsi: 'Lulur tradisional Bali untuk kulit halus', durasi: '60', harga: '150000', komisi_pct: '', status: 'aktif', created_at: now() },
      { id: 'S5', nama: 'Facial Gold', kategori: 'Body Treatment', deskripsi: 'Perawatan wajah dengan masker emas', durasi: '60', harga: '175000', komisi_pct: '', status: 'aktif', created_at: now() },
      { id: 'S6', nama: 'Paket Relax (Massage + Lulur)', kategori: 'Paket', deskripsi: 'Kombinasi pijat tradisional dan lulur Bali', durasi: '120', harga: '250000', komisi_pct: '45', status: 'aktif', created_at: now() }
    ];
    const attributes = [
      { id: 'A1', nama: 'Preferensi Terapis', tipe: 'pilihan', created_at: now() },
      { id: 'A2', nama: 'Aroma Minyak', tipe: 'pilihan', created_at: now() },
      { id: 'A3', nama: 'Ekstra Tambahan', tipe: 'jamak', created_at: now() }
    ];
    const attribute_options = [
      { id: 'O1', attribute_id: 'A1', label: 'Terapis Pria', harga_extra: '0', created_at: now() },
      { id: 'O2', attribute_id: 'A1', label: 'Terapis Wanita', harga_extra: '0', created_at: now() },
      { id: 'O3', attribute_id: 'A2', label: 'Tanpa Aroma', harga_extra: '0', created_at: now() },
      { id: 'O4', attribute_id: 'A2', label: 'Lavender', harga_extra: '10000', created_at: now() },
      { id: 'O5', attribute_id: 'A2', label: 'Ylang-Ylang', harga_extra: '10000', created_at: now() },
      { id: 'O6', attribute_id: 'A2', label: 'Sandalwood', harga_extra: '15000', created_at: now() },
      { id: 'O7', attribute_id: 'A3', label: 'Hot Stone', harga_extra: '50000', created_at: now() },
      { id: 'O8', attribute_id: 'A3', label: 'Ear Candling', harga_extra: '40000', created_at: now() },
      { id: 'O9', attribute_id: 'A3', label: 'Refleksi Ekstra 15 Menit', harga_extra: '45000', created_at: now() }
    ];
    const mkOrder = (n, cust, ter, br, tgl, jam, status, items, extras, bayar) => {
      const svc = services.filter(s => items.some(i => i[0] === s.id));
      const itemsTotal = items.reduce((a, i) => a + Number(svc.find(s => s.id === i[0]).harga) * i[1], 0);
      const extrasTotal = extras.reduce((a, o) => a + Number(attribute_options.find(x => x.id === o).harga_extra), 0);
      const terapist = therapists.find(x => x.id === ter);
      const pct = Number(svc[0] && svc[0].komisi_pct) || (terapist ? Number(terapist.komisi_pct) : 40);
      const komisi = Math.round(itemsTotal * pct / 100);
      return {
        id: 'OD' + n, kode: 'VT-' + tgl.replace(/-/g, '').slice(2) + '-' + String(n).padStart(3, '0'),
        customer_id: cust ? customers.find(c => c.id === cust).id : '', customer_nama: cust ? customers.find(c => c.id === cust).nama : 'Tamu',
        therapist_id: terapist ? terapist.id : '', therapist_nama: terapist ? terapist.nama : '',
        branch_id: br, branch_nama: branches.find(b => b.id === br).nama,
        tanggal: tgl, jam, status, items_total: String(itemsTotal), extras_total: String(extrasTotal),
        total: String(itemsTotal + extrasTotal), komisi_pct: String(pct), komisi_terapis: String(komisi),
        metode_bayar: bayar ? bayar[0] : '', status_bayar: bayar ? 'lunas' : (status === 'selesai' ? 'belum' : ''),
        catatan: '', created_at: now()
      };
    };
    const orders = [
      Object.assign(mkOrder(1, 'C1', 'T1', 'BR1', t(-5), '10:00', 'selesai', [['S1', 1], ['S3', 1]], []), { metode_bayar: 'transfer', status_bayar: 'lunas' }),
      Object.assign(mkOrder(2, 'C2', 'T2', 'BR1', t(-3), '14:00', 'selesai', [['S4', 1]], ['O7']), { metode_bayar: 'cash', status_bayar: 'lunas' }),
      Object.assign(mkOrder(3, 'C1', 'T1', 'BR1', t(0), '11:00', 'selesai', [['S2', 1]], ['O5']), { metode_bayar: '', status_bayar: 'belum' }),
      mkOrder(4, 'C2', 'T2', 'BR1', t(0), '16:00', 'berlangsung', [['S1', 1]], []),
      mkOrder(5, 'C1', 'T1', 'BR1', t(1), '10:30', 'dikonfirmasi', [['S6', 1]], ['O8']),
      mkOrder(6, 'C2', '', 'BR2', t(1), '13:00', 'menunggu', [['S3', 2]], ['O9'])
    ];
    const order_items = []; const order_extras = [];
    const specs = [
      [['S1', 1], ['S3', 1]], [['S4', 1]], [['S2', 1]], [['S1', 1]], [['S6', 1]], [['S3', 2]]
    ];
    const extraSpecs = [[], ['O7'], ['O5'], [], ['O8'], ['O9']];
    orders.forEach((o, idx) => {
      (specs[idx] || []).forEach(i => {
        const s = services.find(x => x.id === i[0]);
        order_items.push({ id: 'OI' + orders.indexOf(o) + s.id, order_id: o.id, service_id: s.id, nama: s.nama, qty: String(i[1]), harga: s.harga, subtotal: String(Number(s.harga) * i[1]) });
      });
      (extraSpecs[idx] || []).forEach(oid => {
        const op = attribute_options.find(x => x.id === oid);
        order_extras.push({ id: 'OE' + orders.indexOf(o) + oid, order_id: o.id, label: op.label, harga: op.harga_extra });
      });
    });
    return {
      users, therapists, customers, branches, services, attributes, attribute_options,
      orders, order_items, order_extras, payslips: [], tokens: [],
      settings: {
        nama_perusahaan: 'Vati Massage Spa', alamat: 'Jl. Merdeka No. 10, Jakarta',
        telepon: '021-555-0001', jam_operasional: '09:00 - 21:00', komisi_default: '40'
      }
    };
  }

  function load() {
    if (db) return db;
    const raw = localStorage.getItem(KEY);
    if (raw) { try { db = JSON.parse(raw); } catch (e) { db = null; } }
    if (!db) { db = seed(); save(); }
    return db;
  }
  function save() { localStorage.setItem(KEY, JSON.stringify(db)); }
  const clone = v => JSON.parse(JSON.stringify(v));
  const num = v => Number(v) || 0;
  const nowISO = () => new Date().toISOString();
  const sleep = ms => new Promise(r => setTimeout(r, ms));

  function authFail() { const e = new Error('Sesi berakhir, silakan login ulang.'); e.auth = false; return e; }
  function deny(msg) { const e = new Error(msg || 'Tidak diizinkan.'); e.auth = false; return e; }
  function fail(msg) { throw new Error(msg); }

  function ctx(p) {
    const d = load();
    if (!p.token) throw authFail();
    const tk = d.tokens.find(t => t.token === p.token);
    if (!tk || new Date(tk.expiry) < new Date()) throw authFail();
    const user = d.users.find(u => u.id === tk.user_id);
    if (!user || user.status !== 'aktif') throw authFail();
    const c = { user: clone(user), db: d };
    if (user.role === 'terapis') c.terapis = d.therapists.find(t => t.user_id === user.id);
    if (user.role === 'pelanggan') c.pelanggan = d.customers.find(x => x.user_id === user.id);
    return c;
  }
  const requireAdmin = c => { if (c.user.role !== 'admin') throw deny(); };

  const uid = p => p + Math.random().toString(36).slice(2, 8).toUpperCase();
  function kodeOrder(d) {
    const t = new Date(); const mm = String(t.getMonth() + 1).padStart(2, '0'), dd = String(t.getDate()).padStart(2, '0');
    return 'VT-' + String(t.getFullYear()).slice(2) + mm + dd + '-' + String(d.orders.length + 1).padStart(3, '0');
  }

  /* ---------- Utilitas data ---------- */
  function computeKomisi(d, itemsTotal, terapis, servicePct) {
    const pct = num(servicePct) || (terapis ? num(terapis.komisi_pct) : 0) || num(d.settings.komisi_default);
    return { pct, komisi: Math.round(itemsTotal * pct / 100) };
  }
  function doneOrders(d, dari, sampai, therapistId) {
    return d.orders.filter(o => o.status === 'selesai' && o.tanggal >= dari && o.tanggal <= sampai && (!therapistId || o.therapist_id === therapistId));
  }

  /* ---------- Router aksi ---------- */
  async function handle(action, p) {
    await sleep(120);
    const d = load();
    let result;
    try { result = route(action, p, d); } finally { save(); }
    return clone(result === undefined ? { ok: true } : result);
  }

  function route(action, p, d) {
    switch (action) {
      case 'ping': return { app: 'Vati Massage Spa (Demo)', time: nowISO() };

      case 'login': {
        const u = d.users.find(x => x.username.toLowerCase() === String(p.username || '').trim().toLowerCase());
        if (!u || u.password !== p.password) fail('Username atau password salah.');
        if (u.status !== 'aktif') fail('Akun Anda diblokir. Hubungi admin.');
        return loginResult(d, u);
      }
      case 'register': {
        const uname = String(p.username || '').trim().toLowerCase();
        if (!p.nama || !uname || !p.password) fail('Semua kolom wajib diisi.');
        if (d.users.some(x => x.username.toLowerCase() === uname)) fail('Username sudah digunakan.');
        const u = { id: uid('U'), nama: p.nama.trim(), username: uname, password: p.password, role: 'pelanggan', phone: p.phone || '', status: 'aktif', created_at: nowISO() };
        d.users.push(u);
        d.customers.push({ id: uid('C'), user_id: u.id, nama: u.nama, phone: u.phone, alamat: '', status: 'aktif', created_at: nowISO() });
        return loginResult(d, u);
      }
      case 'logout': {
        d.tokens = d.tokens.filter(t => t.token !== p.token);
        return {};
      }
      case 'me': {
        const c = ctx(p);
        return publicUser(d, c.user);
      }

      case 'list': {
        const c = ctx(p);
        const role = c.user.role;
        let rows;
        switch (p.table) {
          case 'users': requireAdmin(c); rows = d.users.map(u => { const { password, ...rest } = u; return rest; }); break;
          case 'therapists':
            rows = d.therapists.map(t => role === 'admin' ? t : { id: t.id, nama: t.nama, gender: t.gender, keahlian: t.keahlian, branch_id: t.branch_id, status: t.status, foto: t.foto || '' });
            break;
          case 'customers': requireAdmin(c); rows = d.customers; break;
          case 'branches': case 'services': case 'attributes': case 'attribute_options': rows = d[p.table]; break;
          case 'orders':
            if (role === 'admin') rows = d.orders;
            else if (role === 'terapis') rows = c.terapis ? d.orders.filter(o => o.therapist_id === c.terapis.id) : [];
            else rows = c.pelanggan ? d.orders.filter(o => o.customer_id === c.pelanggan.id) : [];
            break;
          case 'payslips':
            if (role === 'admin') rows = d.payslips;
            else if (role === 'terapis') rows = c.terapis ? d.payslips.filter(x => x.therapist_id === c.terapis.id) : [];
            else throw deny();
            break;
          default: throw deny('Tabel tidak dikenal.');
        }
        return { rows: clone(rows) };
      }

      case 'save': {
        const c = ctx(p); requireAdmin(c);
        return saveRecord(d, p.table, p.record || {});
      }

      case 'delete': {
        const c = ctx(p); requireAdmin(c);
        return deleteRecord(d, c, p.table, p.id);
      }

      case 'dashboard_admin': {
        const c = ctx(p); requireAdmin(c);
        const today = todayStrLocal();
        const ms = monthStartLocal(), me = monthEndLocal();
        const selesai = d.orders.filter(o => o.status === 'selesai');
        const omzetBulan = selesai.filter(o => o.tanggal >= ms && o.tanggal <= me).reduce((a, o) => a + num(o.total), 0);
        const komisiBulan = selesai.filter(o => o.tanggal >= ms && o.tanggal <= me).reduce((a, o) => a + num(o.komisi_terapis), 0);
        const chart = [];
        for (let i = 6; i >= 0; i--) {
          const day = todayStrLocal(-i);
          chart.push({ label: String(new Date(day + 'T00:00:00').getDate()), value: selesai.filter(o => o.tanggal === day).reduce((a, o) => a + num(o.total), 0) });
        }
        return {
          terapis_aktif: d.therapists.filter(t => t.status === 'aktif').length,
          pelanggan_total: d.customers.length,
          order_hari_ini: d.orders.filter(o => o.tanggal === today).length,
          order_menunggu: d.orders.filter(o => o.status === 'menunggu').length,
          omzet_bulan: omzetBulan, komisi_bulan: komisiBulan,
          recent_orders: clone(d.orders.slice().sort((a, b) => (b.created_at || '').localeCompare(a.created_at || '')).slice(0, 8)),
          chart
        };
      }

      case 'dashboard_terapis': {
        const c = ctx(p);
        if (c.user.role !== 'terapis') throw deny();
        const t = c.terapis; if (!t) return { order_hari_ini: 0, menunggu: 0, selesai_bulan: 0, komisi_bulan: 0, orders_today: [] };
        const today = todayStrLocal(); const ms = monthStartLocal(), me = monthEndLocal();
        const mine = d.orders.filter(o => o.therapist_id === t.id);
        const selesaiBulan = mine.filter(o => o.status === 'selesai' && o.tanggal >= ms && o.tanggal <= me);
        return {
          order_hari_ini: mine.filter(o => o.tanggal === today).length,
          menunggu: mine.filter(o => o.status === 'menunggu').length,
          selesai_bulan: selesaiBulan.length,
          komisi_bulan: selesaiBulan.reduce((a, o) => a + num(o.komisi_terapis), 0),
          orders_today: clone(mine.filter(o => o.tanggal === today && ['menunggu', 'dikonfirmasi', 'berlangsung'].includes(o.status)))
        };
      }

      case 'dashboard_pelanggan': {
        const c = ctx(p);
        if (c.user.role !== 'pelanggan') throw deny();
        const mine = c.pelanggan ? d.orders.filter(o => o.customer_id === c.pelanggan.id) : [];
        const count = s => mine.filter(o => o.status === s).length;
        return {
          menunggu: count('menunggu'), dikonfirmasi: count('dikonfirmasi'),
          berlangsung: count('berlangsung'), selesai: count('selesai'),
          aktif: clone(mine.filter(o => ['menunggu', 'dikonfirmasi', 'berlangsung'].includes(o.status)).sort((a, b) => (a.tanggal + a.jam).localeCompare(b.tanggal + b.jam)))
        };
      }

      case 'booking_create': {
        const c = ctx(p);
        let customerId = '', customerNama = '';
        if (c.user.role === 'pelanggan') {
          if (!c.pelanggan) fail('Profil pelanggan tidak ditemukan.');
          customerId = c.pelanggan.id; customerNama = c.pelanggan.nama;
        } else if (c.user.role === 'admin') {
          requireAdmin(c);
          if (p.customer_id) {
            const cu = d.customers.find(x => x.id === p.customer_id);
            if (!cu) fail('Pelanggan tidak ditemukan.');
            customerId = cu.id; customerNama = cu.nama;
          } else if (p.guest_nama) { customerNama = p.guest_nama; }
          else fail('Pilih pelanggan atau isi nama tamu.');
        } else throw deny();

        const br = d.branches.find(b => b.id === p.branch_id && b.status === 'aktif');
        if (!br) fail('Pilih cabang terlebih dahulu.');
        if (!p.tanggal || !p.jam) fail('Isi tanggal dan jam treatment.');
        const itemsIn = p.items || [];
        if (!itemsIn.length) fail('Pilih minimal satu layanan.');
        let itemsTotal = 0;
        const newItems = itemsIn.map(i => {
          const s = d.services.find(x => x.id === i.service_id && x.status === 'aktif');
          if (!s) fail('Layanan tidak valid: ' + i.service_id);
          const qty = Math.max(1, parseInt(i.qty, 10) || 1);
          itemsTotal += num(s.harga) * qty;
          return { service_id: s.id, nama: s.nama, qty: String(qty), harga: s.harga, subtotal: String(num(s.harga) * qty) };
        });
        let extrasTotal = 0;
        const newExtras = (p.extras || []).map(oid => {
          const op = d.attribute_options.find(x => x.id === oid);
          if (!op) return null;
          extrasTotal += num(op.harga_extra);
          return { label: op.label, harga: op.harga_extra };
        }).filter(Boolean);
        const terapis = p.therapist_id ? d.therapists.find(t => t.id === p.therapist_id && t.status === 'aktif') : null;
        const svcPct = d.services.find(s => s.id === newItems[0].service_id).komisi_pct;
        const { pct, komisi } = computeKomisi(d, itemsTotal, terapis, svcPct);
        const order = {
          id: uid('OD'), kode: kodeOrder(d), customer_id: customerId, customer_nama: customerNama,
          therapist_id: terapis ? terapis.id : '', therapist_nama: terapis ? terapis.nama : '',
          branch_id: br.id, branch_nama: br.nama, tanggal: p.tanggal, jam: p.jam,
          status: 'menunggu', items_total: String(itemsTotal), extras_total: String(extrasTotal),
          total: String(itemsTotal + extrasTotal), komisi_pct: String(pct), komisi_terapis: String(komisi),
          metode_bayar: '', status_bayar: '', catatan: p.catatan || '', created_at: nowISO()
        };
        d.orders.push(order);
        newItems.forEach(i => d.order_items.push(Object.assign({ id: uid('OI'), order_id: order.id }, i)));
        newExtras.forEach(e => d.order_extras.push(Object.assign({ id: uid('OE'), order_id: order.id }, e)));
        return { order: clone(order) };
      }

      case 'order_get': {
        const c = ctx(p);
        const o = d.orders.find(x => x.id === p.order_id);
        if (!o) fail('Order tidak ditemukan.');
        checkOrderAccess(c, o);
        return {
          order: clone(o),
          items: clone(d.order_items.filter(i => i.order_id === o.id)),
          extras: clone(d.order_extras.filter(e => e.order_id === o.id))
        };
      }

      case 'order_status': {
        const c = ctx(p);
        const o = d.orders.find(x => x.id === p.order_id);
        if (!o) fail('Order tidak ditemukan.');
        checkOrderAccess(c, o);
        const to = p.status, role = c.user.role;
        if (role === 'pelanggan') {
          if (to !== 'batal') throw deny();
          if (o.status !== 'menunggu') fail('Hanya order yang masih menunggu konfirmasi yang bisa dibatalkan.');
        } else if (role === 'terapis') {
          if (!['dikonfirmasi', 'berlangsung', 'selesai', 'batal'].includes(to)) throw deny();
          if (o.therapist_id !== (c.terapis && c.terapis.id)) throw deny('Order ini bukan milik Anda.');
        }
        const allowed = ['menunggu', 'dikonfirmasi', 'berlangsung', 'selesai', 'batal'];
        if (!allowed.includes(to)) fail('Status tidak valid.');
        o.status = to;
        return { order: clone(o) };
      }

      case 'order_assign': {
        const c = ctx(p); requireAdmin(c);
        const o = d.orders.find(x => x.id === p.order_id);
        if (!o) fail('Order tidak ditemukan.');
        if (['selesai', 'batal'].includes(o.status)) fail('Order sudah ' + o.status + ', tidak bisa diubah.');
        if (!p.therapist_id) { o.therapist_id = ''; o.therapist_nama = ''; return { order: clone(o) }; }
        const t = d.therapists.find(x => x.id === p.therapist_id && x.status === 'aktif');
        if (!t) fail('Terapis tidak ditemukan.');
        o.therapist_id = t.id; o.therapist_nama = t.nama;
        return { order: clone(o) };
      }

      case 'order_pay': {
        const c = ctx(p); requireAdmin(c);
        const o = d.orders.find(x => x.id === p.order_id);
        if (!o) fail('Order tidak ditemukan.');
        if (o.status !== 'selesai') fail('Hanya order selesai yang bisa ditandai lunas.');
        o.status_bayar = 'lunas';
        o.metode_bayar = p.metode_bayar || 'cash';
        return { order: clone(o) };
      }

      case 'order_pay_qris': {
        const c = ctx(p);
        if (c.user.role !== 'pelanggan' || !c.pelanggan) deny();
        const o = d.orders.find(x => x.id === p.order_id);
        if (!o) fail('Order tidak ditemukan.');
        if (o.customer_id !== c.pelanggan.id) deny();
        if (o.status_bayar === 'lunas') fail('Order sudah lunas.');
        o.status_bayar = 'lunas';
        o.metode_bayar = 'qris';
        return { order: clone(o) };
      }

      case 'payslip_create': {
        const c = ctx(p); requireAdmin(c);
        const t = d.therapists.find(x => x.id === p.therapist_id);
        if (!t) fail('Terapis tidak ditemukan.');
        if (!p.dari || !p.sampai || p.dari > p.sampai) fail('Periode tidak valid.');
        const orders = doneOrders(d, p.dari, p.sampai, t.id).filter(o => !o.payslip_id);
        if (!orders.length) fail('Tidak ada order selesai yang belum tergaji pada periode ini.');
        const slip = {
          id: uid('PS'), therapist_id: t.id, therapist_nama: t.nama, dari: p.dari, sampai: p.sampai,
          jumlah_order: String(orders.length),
          total_komisi: String(orders.reduce((a, o) => a + num(o.komisi_terapis), 0)),
          status: 'belum_dibayar', tanggal_bayar: '', created_at: nowISO()
        };
        d.payslips.push(slip);
        orders.forEach(o => { o.payslip_id = slip.id; });
        return { payslip: clone(slip) };
      }

      case 'payslip_pay': {
        const c = ctx(p); requireAdmin(c);
        const s = d.payslips.find(x => x.id === p.payslip_id);
        if (!s) fail('Slip tidak ditemukan.');
        s.status = 'dibayar'; s.tanggal_bayar = todayStrLocal();
        return { payslip: clone(s) };
      }

      case 'report': {
        const c = ctx(p); requireAdmin(c);
        if (!p.dari || !p.sampai) fail('Isi periode laporan.');
        const orders = doneOrders(d, p.dari, p.sampai);
        const ids = orders.map(o => o.id);
        const items = d.order_items.filter(i => ids.includes(i.order_id));
        const summary = {
          jumlah_order: orders.length,
          omzet: orders.reduce((a, o) => a + num(o.total), 0),
          items_total: orders.reduce((a, o) => a + num(o.items_total), 0),
          extras_total: orders.reduce((a, o) => a + num(o.extras_total), 0),
          komisi: orders.reduce((a, o) => a + num(o.komisi_terapis), 0)
        };
        summary.bersih = summary.omzet - summary.komisi;
        const group = (keyFn) => {
          const m = {};
          orders.forEach(o => {
            const k = keyFn(o);
            if (!m[k]) m[k] = { nama: k, jumlah_order: 0, omzet: 0, komisi: 0 };
            m[k].jumlah_order++; m[k].omzet += num(o.total); m[k].komisi += num(o.komisi_terapis);
          });
          return Object.values(m).sort((a, b) => b.omzet - a.omzet);
        };
        const perLayanan = {};
        items.forEach(i => {
          const o = orders.find(x => x.id === i.order_id);
          if (!perLayanan[i.nama]) perLayanan[i.nama] = { nama: i.nama, jumlah_order: 0, omzet: 0, komisi: 0 };
          perLayanan[i.nama].jumlah_order += num(i.qty);
          perLayanan[i.nama].omzet += num(i.subtotal);
          if (o) perLayanan[i.nama].komisi += Math.round(num(i.subtotal) * num(o.komisi_pct) / 100);
        });
        const harian = [];
        const start = new Date(p.dari + 'T00:00:00'), end = new Date(p.sampai + 'T00:00:00');
        for (let dt = new Date(start); dt <= end; dt.setDate(dt.getDate() + 1)) {
          const day = dt.getFullYear() + '-' + String(dt.getMonth() + 1).padStart(2, '0') + '-' + String(dt.getDate()).padStart(2, '0');
          harian.push({ label: String(dt.getDate()), value: orders.filter(o => o.tanggal === day).reduce((a, o) => a + num(o.total), 0) });
        }
        return {
          summary, per_layanan: Object.values(perLayanan).sort((a, b) => b.omzet - a.omzet),
          per_terapis: group(o => o.therapist_nama || '(Belum ada terapis)'),
          per_cabang: group(o => o.branch_nama || '-'),
          harian
        };
      }

      case 'settings_get': {
        return clone(d.settings);
      }
      case 'settings_save': {
        const c = ctx(p); requireAdmin(c);
        Object.assign(d.settings, p.settings || {});
        return clone(d.settings);
      }

      case 'profile_save': {
        const c = ctx(p);
        const u = d.users.find(x => x.id === c.user.id);
        if (p.password_baru) {
          if (!p.password_lama || p.password_lama !== u.password) fail('Password lama salah.');
          u.password = p.password_baru;
        }
        if (p.nama) u.nama = p.nama;
        if (p.phone !== undefined) u.phone = p.phone;
        if (u.role === 'terapis') {
          const t = d.therapists.find(x => x.user_id === u.id);
          if (t) { if (p.nama) t.nama = p.nama; if (p.phone !== undefined) t.phone = p.phone; }
        }
        if (u.role === 'pelanggan') {
          const cu = d.customers.find(x => x.user_id === u.id);
          if (cu) { if (p.nama) cu.nama = p.nama; if (p.phone !== undefined) cu.phone = p.phone; if (p.alamat !== undefined) cu.alamat = p.alamat; }
        }
        return publicUser(d, u);
      }

      default: fail('Aksi tidak dikenal: ' + action);
    }
  }

  /* ---------- Pembantu ---------- */
  function loginResult(d, u) {
    const token = 'TK-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    const exp = new Date(); exp.setDate(exp.getDate() + 7);
    d.tokens.push({ token, user_id: u.id, expiry: exp.toISOString() });
    if (d.tokens.length > 50) d.tokens.splice(0, d.tokens.length - 50);
    return { token, user: publicUser(d, u) };
  }
  function publicUser(d, u) {
    const out = { id: u.id, nama: u.nama, username: u.username, role: u.role, phone: u.phone, ref: null };
    if (u.role === 'terapis') { const t = d.therapists.find(x => x.user_id === u.id); out.ref = t ? { id: t.id, branch_id: t.branch_id, komisi_pct: t.komisi_pct } : null; }
    if (u.role === 'pelanggan') { const c = d.customers.find(x => x.user_id === u.id); out.ref = c ? { id: c.id, alamat: c.alamat } : null; }
    return out;
  }
  function checkOrderAccess(c, o) {
    const r = c.user.role;
    if (r === 'admin') return;
    if (r === 'terapis') { if (!c.terapis || o.therapist_id !== c.terapis.id) throw deny(); return; }
    if (r === 'pelanggan') { if (!c.pelanggan || o.customer_id !== c.pelanggan.id) throw deny(); return; }
    throw deny();
  }
  function saveRecord(d, table, rec) {
    const isNew = !rec.id;
    switch (table) {
      case 'branches': {
        if (!rec.nama) fail('Nama cabang wajib diisi.');
        if (isNew) {
          d.branches.push({ id: uid('BR'), nama: rec.nama, alamat: rec.alamat || '', phone: rec.phone || '', status: rec.status || 'aktif', created_at: nowISO() });
        } else {
          const b = findOr(d.branches, rec.id);
          Object.assign(b, { nama: rec.nama, alamat: rec.alamat || '', phone: rec.phone || '', status: rec.status || 'aktif' });
        }
        return {};
      }
      case 'services': {
        if (!rec.nama) fail('Nama layanan wajib diisi.');
        const data = { nama: rec.nama, kategori: rec.kategori || 'Umum', deskripsi: rec.deskripsi || '', durasi: String(rec.durasi || ''), harga: String(num(rec.harga)), komisi_pct: rec.komisi_pct != null && rec.komisi_pct !== '' ? String(rec.komisi_pct) : '', status: rec.status || 'aktif' };
        if (isNew) d.services.push(Object.assign({ id: uid('S'), created_at: nowISO() }, data));
        else Object.assign(findOr(d.services, rec.id), data);
        return {};
      }
      case 'attributes': {
        if (!rec.nama) fail('Nama atribut wajib diisi.');
        if (isNew) d.attributes.push({ id: uid('A'), nama: rec.nama, tipe: rec.tipe === 'jamak' ? 'jamak' : 'pilihan', created_at: nowISO() });
        else Object.assign(findOr(d.attributes, rec.id), { nama: rec.nama, tipe: rec.tipe === 'jamak' ? 'jamak' : 'pilihan' });
        return {};
      }
      case 'attribute_options': {
        if (!rec.label) fail('Label pilihan wajib diisi.');
        if (!rec.attribute_id) fail('Atribut induk tidak valid.');
        if (isNew) d.attribute_options.push({ id: uid('O'), attribute_id: rec.attribute_id, label: rec.label, harga_extra: String(num(rec.harga_extra)), created_at: nowISO() });
        else Object.assign(findOr(d.attribute_options, rec.id), { label: rec.label, harga_extra: String(num(rec.harga_extra)) });
        return {};
      }
      case 'therapists': {
        if (!rec.nama) fail('Nama terapis wajib diisi.');
        const data = { nama: rec.nama, phone: rec.phone || '', gender: rec.gender || 'wanita', keahlian: rec.keahlian || '', branch_id: rec.branch_id || '', komisi_pct: String(num(rec.komisi_pct) || d.settings.komisi_default), status: rec.status || 'aktif', foto: rec.foto || '' };
        if (isNew) {
          const uname = String(rec.username || '').trim().toLowerCase();
          if (!uname || !rec.password) fail('Username & password untuk login terapis wajib diisi.');
          if (d.users.some(u => u.username.toLowerCase() === uname)) fail('Username sudah digunakan.');
          const u = { id: uid('U'), nama: rec.nama, username: uname, password: rec.password, role: 'terapis', phone: rec.phone || '', status: 'aktif', created_at: nowISO() };
          d.users.push(u);
          d.therapists.push(Object.assign({ id: uid('T'), user_id: u.id, created_at: nowISO() }, data));
        } else {
          const t = findOr(d.therapists, rec.id);
          Object.assign(t, data);
          const u = d.users.find(x => x.id === t.user_id);
          if (u) { u.nama = t.nama; u.phone = t.phone; }
        }
        return {};
      }
      case 'users': {
        const uname = String(rec.username || '').trim().toLowerCase();
        if (!rec.nama || !uname) fail('Nama & username wajib diisi.');
        if (isNew) {
          if (rec.role !== 'admin') fail('Tambah terapis melalui menu Data Terapis.');
          if (d.users.some(u => u.username.toLowerCase() === uname)) fail('Username sudah digunakan.');
          if (!rec.password) fail('Password wajib diisi.');
          d.users.push({ id: uid('U'), nama: rec.nama, username: uname, password: rec.password, role: 'admin', phone: rec.phone || '', status: rec.status || 'aktif', created_at: nowISO() });
        } else {
          const u = findOr(d.users, rec.id);
          if (d.users.some(x => x.username.toLowerCase() === uname && x.id !== u.id)) fail('Username sudah digunakan.');
          u.nama = rec.nama; u.username = uname; u.phone = rec.phone || ''; u.status = rec.status || u.status;
          if (rec.password) u.password = rec.password;
        }
        return {};
      }
      case 'customers': {
        const cu = findOr(d.customers, rec.id);
        Object.assign(cu, { nama: rec.nama || cu.nama, phone: rec.phone != null ? rec.phone : cu.phone, alamat: rec.alamat != null ? rec.alamat : cu.alamat, status: rec.status || cu.status });
        const u = d.users.find(x => x.id === cu.user_id);
        if (u && rec.nama) u.nama = rec.nama;
        return {};
      }
      default: fail('Tabel tidak dikenal.');
    }
  }
  function deleteRecord(d, c, table, id) {
    switch (table) {
      case 'branches': {
        if (d.therapists.some(t => t.branch_id === id) || d.orders.some(o => o.branch_id === id)) fail('Cabang masih dipakai data lain. Gunakan status Nonaktif.');
        d.branches = d.branches.filter(x => x.id !== id); return {};
      }
      case 'services': {
        if (d.order_items.some(i => i.service_id === id)) fail('Layanan punya riwayat order. Gunakan status Nonaktif.');
        d.services = d.services.filter(x => x.id !== id); return {};
      }
      case 'attributes': {
        d.attribute_options = d.attribute_options.filter(o => o.attribute_id !== id);
        d.attributes = d.attributes.filter(x => x.id !== id); return {};
      }
      case 'attribute_options': {
        d.attribute_options = d.attribute_options.filter(x => x.id !== id); return {};
      }
      case 'therapists': {
        const t = findOr(d.therapists, id);
        if (d.orders.some(o => o.therapist_id === id)) {
          t.status = 'nonaktif';
          const u = d.users.find(x => x.id === t.user_id); if (u) u.status = 'nonaktif';
          return { deactivated: true };
        }
        d.therapists = d.therapists.filter(x => x.id !== id);
        d.users = d.users.filter(x => x.id !== t.user_id);
        return {};
      }
      case 'users': {
        const u = findOr(d.users, id);
        if (u.id === c.user.id) fail('Tidak bisa menghapus akun sendiri.');
        d.users = d.users.filter(x => x.id !== id); return {};
      }
      case 'customers': {
        const cu = findOr(d.customers, id);
        if (d.orders.some(o => o.customer_id === id)) {
          cu.status = 'nonaktif';
          const u = d.users.find(x => x.id === cu.user_id); if (u) u.status = 'nonaktif';
          return { deactivated: true };
        }
        d.customers = d.customers.filter(x => x.id !== id);
        d.users = d.users.filter(x => x.id !== cu.user_id);
        return {};
      }
      default: fail('Tabel tidak dikenal.');
    }
  }
  function findOr(arr, id) { const x = arr.find(i => i.id === id); if (!x) fail('Data tidak ditemukan.'); return x; }
  function todayStrLocal(off = 0) {
    const dt = new Date(); dt.setDate(dt.getDate() + off);
    return dt.getFullYear() + '-' + String(dt.getMonth() + 1).padStart(2, '0') + '-' + String(dt.getDate()).padStart(2, '0');
  }
  function monthStartLocal(off = 0) {
    const dt = new Date(); dt.setDate(1); dt.setMonth(dt.getMonth() + off);
    return dt.getFullYear() + '-' + String(dt.getMonth() + 1).padStart(2, '0') + '-01';
  }
  function monthEndLocal(off = 0) {
    const dt = new Date(); dt.setMonth(dt.getMonth() + off + 1); dt.setDate(0);
    return dt.getFullYear() + '-' + String(dt.getMonth() + 1).padStart(2, '0') + '-' + String(dt.getDate()).padStart(2, '0');
  }

  return { handle, reset: () => { localStorage.removeItem(KEY); db = null; load(); } };
})();
