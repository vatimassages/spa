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
    ['pengaturan', 'Pengaturan', 'settings']
  ],
  terapis: [
    ['dashboard', 'Dashboard Terapis', 'grid'],
    ['orderan', 'Orderan Pelanggan', 'cart'],
    ['laporan', 'Laporan Hasil Kerja', 'chart'],
    ['gaji', 'Slip Gaji', 'wallet'],
    ['pengaturan', 'Pengaturan Akun', 'settings']
  ],
  pelanggan: [
    ['dashboard', 'Dashboard Saya', 'grid'],
    ['booking', 'Booking Spa', 'calendar'],
    ['pesanan', 'Pesanan Saya', 'clipboard'],
    ['foto', 'Foto Terapis', 'camera'],
    ['pengaturan', 'Pengaturan Akun', 'settings']
  ]
};
const ROLE_LABEL = { admin: 'Owner', terapis: 'Terapis', pelanggan: 'Pelanggan' };

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
  return d.length >= 9 ? d : '';
}
function setupFab() {
  const fab = qs('#fab-wa');
  if (!fab) return;
  const msg = encodeURIComponent('Halo Admin ' + CFG.APP_NAME + ', saya ingin bertanya tentang layanan.');
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
      '<div class="field"><label>No. HP / WhatsApp</label><input name="phone" required placeholder="08xx-xxxx-xxxx"></div>' +
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
        Session.set({ token: res.token, user: res.user });
        toast('Selamat datang, ' + res.user.nama + '!');
        location.hash = '#/pelanggan/dashboard';
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
    '<div class="demo-info"><b>Akun demo (mode demo lokal):</b>' +
    'Owner: <code>admin / admin123</code><br>Terapis: <code>sari / terapis123</code><br>Pelanggan: <code>dewi / pelanggan123</code></div>' +
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
