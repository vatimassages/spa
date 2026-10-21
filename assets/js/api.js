/* Lapisan komunikasi ke backend Apps Script (atau MockApi saat mode demo). */

const Session = {
  KEY: 'vati_session',
  get() { try { return JSON.parse(localStorage.getItem(this.KEY)) || null; } catch (e) { return null; } },
  set(s) { localStorage.setItem(this.KEY, JSON.stringify(s)); },
  clear() { localStorage.removeItem(this.KEY); }
};

let apiBusy = 0;
function apiBusyStart() { apiBusy++; document.body.classList.add('api-busy'); }
function apiBusyEnd() { apiBusy = Math.max(0, apiBusy - 1); if (!apiBusy) document.body.classList.remove('api-busy'); }

async function api(action, payload = {}) {
  const s = Session.get() || {};
  const body = Object.assign({}, payload, { action });
  if (s.token) body.token = s.token;

  apiBusyStart();
  try {
    if (!CFG.API_URL) {
      try {
        return await MockApi.handle(action, body);
      } catch (err) {
        if (err && err.auth === false) { Session.clear(); location.hash = '#/login'; }
        throw err;
      }
    }

    let res;
    try {
      res = await fetch(CFG.API_URL, { method: 'POST', body: JSON.stringify(body) });
    } catch (e) {
      throw new Error('Tidak dapat terhubung ke server. Periksa koneksi atau URL API di config.js.');
    }
    if (!res.ok) throw new Error('Server merespons dengan status ' + res.status);
    const out = await res.json();
    if (!out.ok) {
      if (out.auth === false) { Session.clear(); location.hash = '#/login'; }
      throw new Error(out.error || 'Terjadi kesalahan pada server.');
    }
    return out.data;
  } finally {
    apiBusyEnd();
  }
}
