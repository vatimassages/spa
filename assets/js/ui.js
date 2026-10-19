/* ============================================================
   ui.js — Helper UI: ikon SVG, format, modal, toast, tabel, dll.
   ============================================================ */

/* ---------- Ikon (SVG inline, stroke) ---------- */
const ICONS = {
  menu: '<line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>',
  x: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  clipboard: '<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/>',
  cart: '<circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>',
  chart: '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>',
  wallet: '<rect x="2" y="6" width="20" height="14" rx="2"/><path d="M16 6V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="22" y1="12" x2="22" y2="12.01"/>',
  home: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h0a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
  clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  check: '<polyline points="20 6 9 17 4 12"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>',
  plus: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
  edit: '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4z"/>',
  trash: '<polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  eye: '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>',
  sliders: '<line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/>',
  flower: '<path d="M12 2c2.8 0 4.6 2.2 4.2 4.8 2.3 1 3.3 3.6 2 5.9 1.3 2.3.3 4.9-2 5.9C13.8 21.2 12 22 12 22s-1.8-.8-4.2-1.4c-2.3-1-3.3-3.6-2-5.9-1.3-2.3-.3-4.9 2-5.9C7.4 4.2 9.2 2 12 2z"/><circle cx="12" cy="12" r="2.4"/>',
  cash: '<rect x="1" y="4" width="22" height="16" rx="2"/><circle cx="12" cy="12" r="4"/><path d="M5 8h.01M19 16h.01"/>',
  refresh: '<polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>',
  warn: '<path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
  camera: '<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>',
  wa: '<path fill="currentColor" stroke="none" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>'
};
function ic(name, size = 18) {
  return '<svg class="ic" width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + (ICONS[name] || '') + '</svg>';
}

/* ---------- DOM & format ---------- */
const qs = (sel, el) => (el || document).querySelector(sel);
const qsa = (sel, el) => Array.from((el || document).querySelectorAll(sel));

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
function fmtIDR(n) { return CFG.CURRENCY + ' ' + (Number(n) || 0).toLocaleString(CFG.LOCALE); }
function fmtDate(s) {
  if (!s) return '-';
  const d = new Date(String(s).length <= 10 ? s + 'T00:00:00' : s);
  if (isNaN(d)) return String(s);
  return d.toLocaleDateString(CFG.LOCALE, { day: 'numeric', month: 'short', year: 'numeric' });
}
function todayStr(offset = 0) {
  const d = new Date(); d.setDate(d.getDate() + offset);
  const m = String(d.getMonth() + 1).padStart(2, '0'), day = String(d.getDate()).padStart(2, '0');
  return d.getFullYear() + '-' + m + '-' + day;
}
function monthStartStr(offset = 0) {
  const d = new Date(); d.setMonth(d.getMonth() + offset); d.setDate(1);
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return d.getFullYear() + '-' + m + '-01';
}
function monthEndStr(offset = 0) {
  const d = new Date(); d.setMonth(d.getMonth() + offset + 1); d.setDate(0);
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return d.getFullYear() + '-' + m + '-' + String(d.getDate()).padStart(2, '0');
}

/* ---------- Gambar & peringatan ---------- */
function imageToDataURI(file, maxSize = 240, quality = 0.72) {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onerror = () => reject(new Error('Gagal membaca file gambar.'));
    fr.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('File bukan gambar yang valid.'));
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));
        const cv = document.createElement('canvas');
        cv.width = w; cv.height = h;
        cv.getContext('2d').drawImage(img, 0, 0, w, h);
        resolve(cv.toDataURL('image/jpeg', quality));
      };
      img.src = fr.result;
    };
    fr.readAsDataURL(file);
  });
}

/* ---------- Badge status ---------- */
const STATUS_MAP = {
  menunggu: ['Menunggu Konfirmasi', 'b-yellow'],
  dikonfirmasi: ['Dikonfirmasi', 'b-blue'],
  berlangsung: ['Berlangsung', 'b-purple'],
  selesai: ['Selesai', 'b-green'],
  batal: ['Dibatalkan', 'b-red'],
  aktif: ['Aktif', 'b-green'],
  nonaktif: ['Nonaktif', 'b-gray'],
  diblokir: ['Diblokir', 'b-red'],
  lunas: ['Lunas', 'b-green'],
  belum: ['Belum Bayar', 'b-yellow'],
  belum_dibayar: ['Belum Dibayar', 'b-yellow'],
  dibayar: ['Dibayar', 'b-green'],
  pria: ['Pria', 'b-blue'],
  wanita: ['Wanita', 'b-pink']
};
function badge(s) {
  const m = STATUS_MAP[s] || [s, 'b-gray'];
  return '<span class="badge ' + m[1] + '">' + esc(m[0]) + '</span>';
}

/* ---------- Loading & error box ---------- */
function loadingHTML(msg) { return '<div class="loading"><div class="spinner"></div><p>' + esc(msg || 'Memuat data...') + '</p></div>'; }
function errorHTML(err) { return '<div class="err-box"><b>Terjadi kesalahan.</b><br>' + esc(err && err.message ? err.message : err) + '</div>'; }

/* ---------- Toast ---------- */
function toast(msg, type = 'ok') {
  let root = qs('#toast-root');
  if (!root) { root = document.createElement('div'); root.id = 'toast-root'; document.body.appendChild(root); }
  const t = document.createElement('div');
  t.className = 'toast ' + (type === 'err' ? 'toast-err' : '');
  t.innerHTML = (type === 'err' ? ic('x', 16) : ic('check', 16)) + '<span>' + esc(msg) + '</span>';
  root.appendChild(t);
  setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 300); }, 3200);
}

/* ---------- Modal (mendukung bertumpuk) ---------- */
const Modal = {
  stack: [],
  open(html, opts = {}) {
    const ov = document.createElement('div');
    ov.className = 'modal-overlay';
    ov.innerHTML = '<div class="modal' + (opts.wide ? ' modal-wide' : '') + '" role="dialog" aria-modal="true">' + html + '</div>';
    if (opts.dismissable !== false) ov.addEventListener('mousedown', e => { if (e.target === ov) Modal.close(ov); });
    qs('#modal-root').appendChild(ov);
    this.stack.push(ov);
    return ov;
  },
  close(ov) {
    if (!ov) ov = this.stack[this.stack.length - 1];
    if (!ov) return;
    ov.remove();
    this.stack = this.stack.filter(x => x !== ov);
  },
  closeAll() {
    this.stack.slice().forEach(ov => ov.remove());
    this.stack = [];
  }
};
document.addEventListener('click', e => {
  const btn = e.target.closest('[data-close-modal]');
  if (btn) Modal.close(btn.closest('.modal-overlay'));
});

/* ---------- Form modal generik ---------- */
function fieldInput(f, val) {
  const v = val == null ? '' : val;
  const req = f.required ? 'required' : '';
  switch (f.type) {
    case 'select':
      return '<select name="' + f.name + '" ' + req + '>' + (f.options || []).map(o => {
        const ov = typeof o === 'object' ? o.v : o, ol = typeof o === 'object' ? o.l : o;
        return '<option value="' + esc(ov) + '"' + (String(ov) === String(v) ? ' selected' : '') + '>' + esc(ol) + '</option>';
      }).join('') + '</select>';
    case 'textarea':
      return '<textarea name="' + f.name + '" rows="3" ' + req + '>' + esc(v) + '</textarea>';
    case 'checkbox':
      return '<label class="check"><input type="checkbox" name="' + f.name + '"' + (v ? ' checked' : '') + '> ' + esc(f.checkLabel || 'Aktif') + '</label>';
    case 'date':
      return '<input type="date" name="' + f.name + '" value="' + esc(v) + '"' + (f.min ? ' min="' + f.min + '"' : '') + ' ' + req + '>';
    case 'time':
      return '<input type="time" name="' + f.name + '" value="' + esc(v) + '" ' + req + '>';
    case 'number':
      return '<input type="number" name="' + f.name + '" value="' + esc(v) + '"' + (f.min != null ? ' min="' + f.min + '"' : '') + (f.step ? ' step="' + f.step + '"' : '') + ' ' + req + '>';
    case 'image':
      return '<div class="img-field" data-name="' + f.name + '">' +
        '<div class="img-preview">' + (v ? '<img src="' + esc(v) + '" alt="">' : ic('camera', 26)) + '</div>' +
        '<input type="hidden" name="' + f.name + '" value="' + esc(v) + '">' +
        '<input type="file" class="img-input" accept="image/*">' +
        '<button type="button" class="btn btn-ghost btn-sm img-clear"' + (v ? '' : ' style="display:none"') + '>Hapus Foto</button></div>';
    default:
      return '<input type="' + (f.type === 'password' ? 'password' : 'text') + '" name="' + f.name + '" value="' + esc(v) + '"' + (f.placeholder ? ' placeholder="' + esc(f.placeholder) + '"' : '') + (f.readonly ? ' readonly' : '') + ' ' + req + '>';
  }
}

/**
 * formModal({title, fields:[{name,label,type,options,value,hint,full}], values, submitLabel, onSubmit})
 * onSubmit async (values) -> return true agar modal tertutup.
 */
function formModal(cfg) {
  const values = cfg.values || {};
  const body = '<form id="fm-form" class="fm-grid">' + cfg.fields.map(f => {
    const full = f.full ? ' full' : '';
    return '<div class="fm-field' + full + '"><label>' + esc(f.label) + '</label>' +
      fieldInput(f, f.value !== undefined ? f.value : values[f.name]) +
      (f.hint ? '<div class="fm-hint">' + esc(f.hint) + '</div>' : '') + '</div>';
  }).join('') + '</form>';
  const ov = Modal.open(
    '<div class="modal-head"><h3>' + esc(cfg.title) + '</h3><button class="icon-btn" data-close-modal>' + ic('x') + '</button></div>' +
    '<div class="modal-body">' + body + '</div>' +
    '<div class="modal-foot"><button class="btn btn-ghost" data-close-modal>Batal</button>' +
    '<button class="btn btn-primary" id="fm-submit">' + esc(cfg.submitLabel || 'Simpan') + '</button></div>',
    { wide: cfg.wide }
  );
  qsa('.img-field', ov).forEach(wrap => {
    const hidden = qs('input[type="hidden"]', wrap);
    const file = qs('.img-input', wrap);
    const prev = qs('.img-preview', wrap);
    const clear = qs('.img-clear', wrap);
    file.addEventListener('change', async () => {
      if (!file.files || !file.files[0]) return;
      try {
        const uri = await imageToDataURI(file.files[0]);
        hidden.value = uri;
        prev.innerHTML = '<img src="' + uri + '" alt="">';
        clear.style.display = '';
      } catch (err) { toast(err.message, 'err'); }
    });
    clear.addEventListener('click', () => {
      hidden.value = '';
      file.value = '';
      prev.innerHTML = ic('camera', 26);
      clear.style.display = 'none';
    });
  });
  qs('#fm-submit', ov).addEventListener('click', async () => {
    const form = qs('#fm-form', ov);
    const vals = {};
    qsa('input,select,textarea', form).forEach(el => {
      vals[el.name] = el.type === 'checkbox' ? el.checked : el.value;
    });
    for (const f of cfg.fields) {
      if (f.required && (vals[f.name] === '' || vals[f.name] == null)) {
        toast('Kolom "' + f.label + '" wajib diisi', 'err');
        return;
      }
    }
    const btn = qs('#fm-submit', ov);
    btn.disabled = true;
    try {
      const ok = await cfg.onSubmit(vals);
      if (ok !== false) Modal.close(ov);
    } catch (err) {
      toast(err.message || String(err), 'err');
    } finally { btn.disabled = false; }
  });
  return ov;
}

/* ---------- Konfirmasi ---------- */
function confirmDialog(title, msg, danger = true) {
  return new Promise(resolve => {
    const ov = Modal.open(
      '<div class="modal-head"><h3>' + esc(title) + '</h3><button class="icon-btn" data-close-modal>' + ic('x') + '</button></div>' +
      '<div class="modal-body"><p>' + esc(msg) + '</p></div>' +
      '<div class="modal-foot"><button class="btn btn-ghost" id="cf-no">Batal</button>' +
      '<button class="btn ' + (danger ? 'btn-danger' : 'btn-primary') + '" id="cf-yes">Ya, Lanjutkan</button></div>'
    );
    qs('#cf-yes', ov).onclick = () => { Modal.close(ov); resolve(true); };
    qs('#cf-no', ov).onclick = () => { Modal.close(ov); resolve(false); };
  });
}

/* ---------- Tabel & kartu ---------- */
function tableWrap(headers, rowsHtml, emptyMsg) {
  if (!rowsHtml) return '<div class="empty">' + esc(emptyMsg || 'Belum ada data.') + '</div>';
  return '<div class="table-wrap"><table><thead><tr>' +
    headers.map(h => '<th>' + h + '</th>').join('') +
    '</tr></thead><tbody>' + rowsHtml + '</tbody></table></div>';
}
function statCard(label, value, iconName, cls = '') {
  return '<div class="stat-card ' + cls + '"><div class="stat-ic">' + ic(iconName, 22) + '</div>' +
    '<div><div class="stat-val">' + value + '</div><div class="stat-lbl">' + esc(label) + '</div></div></div>';
}
function pageHead(title, sub, actionsHtml = '') {
  return '<div class="page-head"><div><h1>' + esc(title) + '</h1>' +
    (sub ? '<p class="sub">' + esc(sub) + '</p>' : '') + '</div>' +
    '<div class="page-actions">' + actionsHtml + '</div></div>';
}
function rowActions(list) {
  return '<div class="row-actions">' + list.map(a =>
    '<button class="icon-btn ' + (a.cls || '') + '" title="' + esc(a.title) + '" ' + a.attr + '>' + ic(a.icon, 16) + '</button>'
  ).join('') + '</div>';
}

/* ---------- Grafik batang sederhana ---------- */
function barChart(data, valueFmt) {
  if (!data.length) return '<div class="empty">Tidak ada data grafik.</div>';
  const max = Math.max(...data.map(d => d.value), 1);
  return '<div class="chart">' + data.map(d =>
    '<div class="chart-col" title="' + esc(d.label) + ': ' + (valueFmt || fmtIDR)(d.value) + '">' +
    '<div class="chart-bar" style="height:' + Math.round((d.value / max) * 100) + '%"></div>' +
    '<span class="chart-lbl">' + esc(d.label) + '</span></div>'
  ).join('') + '</div>';
}

/* ---------- CSV ---------- */
function downloadCSV(filename, headers, rows) {
  const q = v => '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"';
  const csv = '\uFEFF' + [headers.map(q).join(';')].concat(rows.map(r => r.map(q).join(';'))).join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

/* ---------- Wadah async untuk view ---------- */
async function renderAsync(container, fn) {
  container.innerHTML = loadingHTML();
  try { await fn(); }
  catch (err) { container.innerHTML = errorHTML(err); }
}
