/* ============================================================
   app.js — Router, sesi, drawer/hamburger, login & register
   ============================================================ */
'use strict';

const VIEWS = {};          // registry: 'role/page' -> {title, icon, render(container)}
const MENUS = {
  admin: [
    ['dashboard', 'Dashboard', 'grid'],
    ['terapis', 'Data Terapis', 'users'],
    ['pelanggan', 'Data Pelanggan', 'user'],
    ['layanan', 'Jenis Layanan', 'clipboard'],
    ['atribut', 'Atribut & Filter', 'sliders'],
    ['orderan', 'Orderan & Transaksi', 'cart'],
    ['laporan', 'Laporan', 'chart'],
    ['gaji', 'Gaji & Slip', 'wallet'],
    ['cabang', 'Akun Cabang', 'home'],
    ['tema', 'Tema Tampilan', 'palette'],
    ['pengaturan', 'Pengaturan', 'settings']
  ],
  terapis: [
    ['dashboard', 'Dashboard Terapis', 'grid'],
    ['orderan', 'Orderan Pelanggan', 'cart'],
    ['laporan', 'Laporan Hasil Kerja', 'chart'],
    ['gaji', 'Slip Gaji', 'wallet'],
    ['tema', 'Tema Tampilan', 'palette'],
    ['pengaturan', 'Pengaturan Akun', 'settings']
  ],
  pelanggan: [
    ['dashboard', 'Dashboard Saya', 'grid'],
    ['booking', 'Booking Spa', 'calendar'],
    ['pesanan', 'Pesanan Saya', 'clipboard'],
    ['foto', 'Foto Terapis', 'camera'],
    ['tema', 'Tema Tampilan', 'palette'],
    ['pengaturan', 'Pengaturan Akun', 'settings']
  ]
};
const ROLE_LABEL = { admin: 'Owner', terapis: 'Terapis', pelanggan: 'Pelanggan' };

/* ---------- Mesin Tema (mode terang/gelap + warna) ---------- */
const Theme = {
  KEY: 'vati_theme',
  get() {
    let t = { mode: 'terang', color: 'pink' };
    try { t = Object.assign(t, JSON.parse(localStorage.getItem(this.KEY) || '{}')); } catch (e) {}
    return t;
  },
  set(patch) {
    localStorage.setItem(this.KEY, JSON.stringify(Object.assign(this.get(), patch)));
    this.apply();
  },
  apply() {
    const t = this.get(), root = document.documentElement;
    if (t.mode === 'gelap') root.setAttribute('data-theme', 'dark');
    else root.removeAttribute('data-theme');
    root.setAttribute('data-color', t.color);
  }
};
Theme.apply();

/* ---------- Halaman Tema (dipakai semua peran) ---------- */
const THEME_COLORS = {
  pink:   { label: 'Pink',    hex: '#c25978' },
  teal:   { label: 'Teal',    hex: '#0d9488' },
  biru:   { label: 'Biru',    hex: '#3b82f6' },
  ungu:   { label: 'Ungu',    hex: '#8b5cf6' },
  hijau:  { label: 'Hijau',   hex: '#16a34a' },
  oranye: { label: 'Oranye',  hex: '#ea580c' },
  merah:  { label: 'Merah',   hex: '#dc2626' },
  magenta:{ label: 'Magenta', hex: '#d946ef' },
  emas:   { label: 'Emas',    hex: '#d97706' },
  abu:    { label: 'Abu',     hex: '#64748b' },
  cyan:   { label: 'Cyan',    hex: '#06b6d4' },
  indigo: { label: 'Indigo',  hex: '#6366f1' }
};
const THEME_VIEW = {
  title: 'Tema Tampilan',
  async render(main) {
    const t = Theme.get();
    main.innerHTML =
      pageHead('Tema Tampilan', 'Atur mode terang/gelap dan warna tema sesuai selera Anda') +
      '<div class="card"><h2>Mode Tampilan</h2>' +
      '<div class="theme-mode-row">' +
      '<button class="theme-mode-btn' + (t.mode !== 'gelap' ? ' active' : '') + '" data-mode="terang">' + ic('sun', 20) + '<span>Terang</span></button>' +
      '<button class="theme-mode-btn' + (t.mode === 'gelap' ? ' active' : '') + '" data-mode="gelap">' + ic('moon', 20) + '<span>Gelap</span></button>' +
      '</div></div>' +
      '<div class="card"><h2>Warna Tema</h2>' +
      '<div class="theme-swatches">' +
      Object.keys(THEME_COLORS).map(k =>
        '<button class="theme-swatch' + (t.color === k ? ' active' : '') + '" data-color="' + k + '">' +
        '<span class="sw-dot" style="--sw:' + THEME_COLORS[k].hex + '"></span>' +
        '<span class="sw-label">' + THEME_COLORS[k].label + '</span></button>').join('') +
      '</div></div>' +
      '<p class="muted">Pilihan tema tersimpan otomatis di browser ini dan dipakai di semua halaman.</p>';
    qsa('[data-mode]', main).forEach(b => b.onclick = () => {
      Theme.set({ mode: b.dataset.mode });
      qsa('[data-mode]', main).forEach(x => x.classList.toggle('active', x === b));
      toast('Mode ' + (b.dataset.mode === 'gelap' ? 'gelap' : 'terang') + ' aktif.');
    });
    qsa('.theme-swatch', main).forEach(b => b.onclick = () => {
      Theme.set({ color: b.dataset.color });
      qsa('.theme-swatch', main).forEach(x => x.classList.toggle('active', x === b));
      toast('Warna tema "' + THEME_COLORS[b.dataset.color].label + '" aktif.');
    });
  }
};
VIEWS['admin/tema'] = THEME_VIEW;
VIEWS['terapis/tema'] = THEME_VIEW;
VIEWS['pelanggan/tema'] = THEME_VIEW;

function logout() {
  const s = Session.get();
  if (s) api('logout').catch(() => {});
  Session.clear();
  Modal.closeAll();
  location.hash = '#/login';
}

/* ---------- Tombol WhatsApp melayang ---------- */
let fabWaNumber = null;
function waDigits(phone) {
  let d = String(phone || '').replace(/\D/g, '');
  if (d.indexOf('0') === 0) d = '62' + d.slice(1);
  // Data lama tanpa awalan 0/+62 (mis. 81234567890) tetap bisa dihubungi.
  else if (d.charAt(0) === '8' && d.length >= 9 && d.length <= 12) d = '62' + d;
  return d.length >= 9 ? d : '';
}
function setupFab() {
  const fab = qs('#fab-wa');
  if (!fab) return;
  const msg = encodeURIComponent('Halo Admin ' + CFG.APP_NAME + ', saya ingin bertanya tentang layanan...');
  if (fabWaNumber != null) {
    fab.href = fabWaNumber ? 'https://wa.me/' + fabWaNumber + '?text=' + msg : 'https://wa.me/?text=' + msg;
    return;
  }
  fabWaNumber = '';
  api('settings_get')
    .then(st => { fabWaNumber = waDigits(st.telepon); })
    .catch(() => {})
    .finally(() => { fab.href = fabWaNumber ? 'https://wa.me/' + fabWaNumber + '?text=' + msg : 'https://wa.me/?text=' + msg; });
}

/* ---------- Shell UI ---------- */
function buildShell() {
  const s = Session.get();
  const role = s ? s.user.role : null;
  document.body.classList.toggle('auth-mode', !role);
  qs('#btn-menu').style.display = role ? '' : 'none';
  setupFab();
  const chip = qs('#user-chip');
  if (s) {
    chip.style.display = '';
    const ini = s.user.nama.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
    chip.innerHTML = '<div class="ava">' + esc(ini) + '</div><div><div class="nama">' + esc(s.user.nama) + '</div><div class="role">' + esc(ROLE_LABEL[role] || role) + '</div></div>';
  } else chip.style.display = 'none';

  const nav = qs('#drawer-nav');
  nav.innerHTML = MENUS[role || 'admin'].filter((m, i) => role || i === 0).map(m =>
    '<a href="#/' + (role || 'admin') + '/' + m[0] + '" data-page="' + m[0] + '">' + ic(m[2]) + '<span>' + esc(m[1]) + '</span></a>'
  ).join('');
  qs('#drawer-foot').style.display = role ? '' : 'none';
}

function openDrawer(open) {
  qs('#drawer').classList.toggle('open', open);
  qs('#drawer-overlay').classList.toggle('show', open);
}

/* ---------- Router ---------- */
async function router() {
  closeDrawerOnRoute();
  Modal.closeAll();
  const hash = location.hash.replace(/^#\/?/, '') || '';
  const parts = hash.split('/');
  const s = Session.get();

  if (parts[0] === 'login' || parts[0] === 'register') {
    if (s) { location.hash = '#/' + s.user.role + '/dashboard'; return; }
    buildShell();
    qs('#app-main').innerHTML = '';
    qs('#app-main').style.display = 'none';
    qs('#auth-root').style.display = '';
    renderAuth(parts[0]);
    return;
  }

  if (!s) { location.hash = '#/login'; return; }
  const role = s.user.role;
  let page = parts[1] || 'dashboard';
  const valid = MENUS[role].some(m => m[0] === page);
  if (parts[0] !== role || !valid) { location.hash = '#/' + role + '/dashboard'; return; }

  qs('#auth-root').style.display = 'none';
  qs('#app-main').style.display = '';
  buildShell();
  qsa('#drawer-nav a').forEach(a => a.classList.toggle('active', a.dataset.page === page));

  const view = VIEWS[role + '/' + page];
  const main = qs('#app-main');
  main.innerHTML = loadingHTML('Menyiapkan halaman...');
  try {
    await view.render(main);
    window.scrollTo(0, 0);
  } catch (err) {
    main.innerHTML = errorHTML(err);
  }
}
function closeDrawerOnRoute() { openDrawer(false); }

/* ---------- Auth pages ---------- */
function renderAuth(page) {
  const root = qs('#auth-root');
  if (page === 'register') {
    root.innerHTML =
      '<div class="auth-wrap"><div class="auth-card">' +
      '<div class="auth-logo"><img src="assets/img/logo.jpg" alt="Logo Vati Massage Spa"></div>' +
      '<h1>Daftar Akun Baru</h1><p class="tagline">Buat akun pelanggan ' + esc(CFG.APP_NAME) + '</p>' +
      '<form id="reg-form">' +
      '<div class="field"><label>Nama Lengkap</label><input name="nama" required placeholder="Nama Anda"></div>' +
      '<div class="field"><label>No. HP / WhatsApp</label><input name="phone" required placeholder="+62 8xx-xxxx-xxxx"></div>' +
      '<div class="field"><label>Username</label><input name="username" required placeholder="username unik" autocomplete="username"></div>' +
      '<div class="field"><label>Password</label><input name="password" type="password" required minlength="5" placeholder="Minimal 5 karakter" autocomplete="new-password"></div>' +
      '<button class="btn btn-primary btn-block" type="submit">Daftar</button></form>' +
      '<div class="auth-foot">Sudah punya akun? <a href="#/login">Masuk di sini</a></div>' +
      '</div></div>';
    qs('#reg-form').addEventListener('submit', async e => {
      e.preventDefault();
      const f = e.target, btn = qs('button[type=submit]', f);
      btn.disabled = true;
      try {
        const res = await api('register', { nama: f.nama.value, phone: f.phone.value, username: f.username.value, password: f.password.value });
        showOtpStep(res);
      } catch (err) { toast(err.message, 'err'); } finally { btn.disabled = false; }
    });
    return;
  }
  root.innerHTML =
    '<div class="auth-wrap"><div class="auth-card">' +
    '<div class="auth-logo"><img src="assets/img/logo.jpg" alt="Logo Vati Massage Spa"></div>' +
    '<h1>' + esc(CFG.APP_NAME) + '</h1><p class="tagline">Sistem Manajemen Spa &mdash; Owner, Terapis &amp; Pelanggan</p>' +
    '<form id="login-form">' +
    '<div class="field"><label>Username</label><input name="username" required autocomplete="username" placeholder="Username"></div>' +
    '<div class="field"><label>Password</label><input name="password" type="password" required autocomplete="current-password" placeholder="Password"></div>' +
    '<button class="btn btn-primary btn-block" type="submit">Masuk</button></form>' +
    '<div class="auth-foot">Belum punya akun? <a href="#/register">Daftar sebagai pelanggan</a></div>' +
    '</div></div>';
  qs('#login-form').addEventListener('submit', async e => {
    e.preventDefault();
    const f = e.target, btn = qs('button[type=submit]', f);
    btn.disabled = true;
    try {
      const res = await api('login', { username: f.username.value, password: f.password.value });
      Session.set({ token: res.token, user: res.user });
      toast('Selamat datang, ' + res.user.nama + '!');
      location.hash = '#/' + res.user.role + '/dashboard';
    } catch (err) { toast(err.message, 'err'); } finally { btn.disabled = false; }
  });
}

function showOtpStep(res) {
  const root = qs('#auth-root');
  root.innerHTML =
    '<div class="auth-wrap"><div class="auth-card">' +
    '<div class="auth-logo"><img src="assets/img/logo.jpg" alt="Logo Vati Massage Spa"></div>' +
    '<h1>Verifikasi No. HP</h1>' +
    '<p class="tagline">Kami mengirim kode OTP ke <b>' + esc(fmtPhone(res.phone) || '-') + '</b> (berlaku 10 menit).</p>' +
    '<form id="otp-form">' +
    '<div class="field"><label>Kode OTP (6 digit)</label><input name="otp" required maxlength="6" inputmode="numeric" placeholder="123456" autocomplete="one-time-code"></div>' +
    '<button class="btn btn-primary btn-block" type="submit">Verifikasi</button></form>' +
    '<div class="auth-foot">Tidak menerima kode? <a href="javascript:void 0" id="otp-resend">Kirim ulang</a></div>' +
    '<div class="demo-info" id="otp-info"' + (res.dev_otp ? '' : ' style="display:none"') + '>' +
    (res.dev_otp ? 'Kode OTP Anda (mode pengembangan / demo): <b>' + esc(res.dev_otp) + '</b>' : '') + '</div>' +
    '</div></div>';

  qs('#otp-form').addEventListener('submit', async e => {
    e.preventDefault();
    const f = e.target, btn = qs('button[type=submit]', f);
    btn.disabled = true;
    try {
      const out = await api('register_verify', { user_id: res.user_id, otp: f.otp.value });
      Session.set({ token: out.token, user: out.user });
      toast('Verifikasi berhasil. Selamat datang, ' + out.user.nama + '!');
      location.hash = '#/pelanggan/dashboard';
    } catch (err) { toast(err.message, 'err'); } finally { btn.disabled = false; }
  });

  qs('#otp-resend').onclick = async ev => {
    ev.preventDefault();
    try {
      const out = await api('register_resend', { user_id: res.user_id });
      const info = qs('#otp-info');
      info.style.display = '';
      info.innerHTML = 'Kode OTP Anda (mode pengembangan / demo): <b>' + esc(out.dev_otp || '') + '</b>';
      toast('Kode OTP dikirim ulang.');
    } catch (err) { toast(err.message, 'err'); }
  };
}

/* ---------- Init ---------- */
document.addEventListener('DOMContentLoaded', () => {
  qs('#btn-menu').addEventListener('click', () => openDrawer(true));
  qs('#drawer-close').addEventListener('click', () => openDrawer(false));
  qs('#drawer-overlay').addEventListener('click', () => openDrawer(false));
  qs('#btn-logout').addEventListener('click', logout);
  if (!location.hash) location.hash = '#/login';
  window.addEventListener('hashchange', router);
  router();
});
