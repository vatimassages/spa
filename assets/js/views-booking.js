/* ============================================================
   views-booking.js — Form booking bersama + modal detail order
   Dipakai oleh Pelanggan (booking) dan Admin (order walk-in).
   ============================================================ */
'use strict';

/* ================= FORM BOOKING ================= */
async function renderBooking(container, opts = {}) {
  const adminMode = !!opts.adminMode;
  const aktif = r => r.rows.filter(x => !('status' in x) || x.status === 'aktif');
  const [branches, services, attributes, options, therapists] = await Promise.all([
    api('list', { table: 'branches' }),
    api('list', { table: 'services' }),
    api('list', { table: 'attributes' }),
    api('list', { table: 'attribute_options' }),
    api('list', { table: 'therapists' })
  ].map(p => p.then(aktif)));

  let customers = [];
  if (adminMode) customers = (await api('list', { table: 'customers' })).rows.filter(c => c.status === 'aktif');

  const jamSlots = [];
  for (let h = 9; h <= 20; h++) { jamSlots.push(String(h).padStart(2, '0') + ':00'); jamSlots.push(String(h).padStart(2, '0') + ':30'); }

  const state = {
    branch_id: branches[0] ? branches[0].id : '',
    tanggal: todayStr(), jam: '10:00', therapist_id: '',
    customer_id: customers[0] ? customers[0].id : '', guest_nama: '',
    items: {},            // service_id -> qty
    extras: new Set(),    // option ids
    tab: null
  };
  const cats = [...new Set(services.map(s => s.kategori))];
  state.tab = cats[0] || null;

  function svcHtml() {
    const list = services.filter(s => s.kategori === state.tab);
    return '<div class="svc-list">' + list.map(s => {
      const q = state.items[s.id] || 0;
      return '<div class="svc-item' + (q ? ' selected' : '') + '" data-svc="' + s.id + '">' +
        '<div class="nm">' + esc(s.nama) + '</div>' +
        '<div class="ds">' + esc(s.deskripsi || '') + '</div>' +
        '<div class="pr"><span>' + fmtIDR(s.harga) + '</span>' +
        (q
          ? '<div class="qty-ctl"><button type="button" data-qty="-1" data-sid="' + s.id + '">&minus;</button><span>' + q + '</span><button type="button" data-qty="1" data-sid="' + s.id + '">+</button></div>'
          : '<button type="button" class="btn btn-ghost btn-sm" data-qty="1" data-sid="' + s.id + '">' + ic('plus', 13) + ' Pilih</button>') +
        '</div><div class="ds">' + esc(s.durasi ? s.durasi + ' menit' : '') + '</div></div>';
    }).join('') + '</div>';
  }
  function attrHtml() {
    if (!attributes.length) return '<p class="muted">Belum ada atribut pilihan.</p>';
    return attributes.map(a => {
      const opts = options.filter(o => o.attribute_id === a.id);
      const type = a.tipe === 'jamak' ? 'checkbox' : 'radio';
      return '<div class="attr-block"><div class="attr-name">' + esc(a.nama) + ' <small>(' + (a.tipe === 'jamak' ? 'boleh pilih beberapa' : 'pilih salah satu') + ')</small></div>' +
        opts.map(o => '<label class="opt-row"><input type="' + type + '" name="attr_' + a.id + '" data-opt="' + o.id + '" data-attr="' + a.id + '"' + (state.extras.has(o.id) ? ' checked' : '') + '>' +
          '<span class="opt-label">' + esc(o.label) + '</span>' +
          (num(o.harga_extra) > 0 ? '<span class="opt-price">+' + fmtIDR(o.harga_extra) + '</span>' : '') + '</label>').join('') +
        '</div>';
    }).join('');
  }
  function itemsTotal() { return Object.entries(state.items).reduce((a, [sid, q]) => a + num(services.find(s => s.id === sid).harga) * q, 0); }
  function extrasTotal() { return [...state.extras].reduce((a, oid) => a + num(options.find(o => o.id === oid).harga_extra), 0); }

  function summaryHtml() {
    const it = itemsTotal(), ex = extrasTotal();
    const lines = Object.entries(state.items).map(([sid, q]) => {
      const s = services.find(x => x.id === sid);
      return '<div class="sum-line"><span>' + esc(s.nama) + ' x' + q + '</span><span>' + fmtIDR(num(s.harga) * q) + '</span></div>';
    });
    [...state.extras].forEach(oid => {
      const o = options.find(x => x.id === oid);
      lines.push('<div class="sum-line"><span>' + esc(o.label) + '</span><span>' + (num(o.harga_extra) ? '+' + fmtIDR(o.harga_extra) : 'Gratis') + '</span></div>');
    });
    return '<div class="sum-items">' + (lines.length ? lines.join('') : '<p class="muted" style="text-align:center;padding:8px 0">Belum ada layanan dipilih.</p>') + '</div>' +
      '<div class="sum-line"><span>Subtotal Layanan</span><span>' + fmtIDR(it) + '</span></div>' +
      '<div class="sum-line"><span>Tambahan / Ekstra</span><span>' + fmtIDR(ex) + '</span></div>' +
      '<div class="sum-line total"><span>Total</span><span>' + fmtIDR(it + ex) + '</span></div>';
  }

  function draw() {
    container.innerHTML =
      pageHead(adminMode ? 'Order Baru (Walk-in)' : 'Booking Spa', adminMode ? 'Buat pesanan untuk pelanggan atau tamu' : 'Racik treatment sesuai keinginan Anda') +
      '<div class="booking-grid"><div>' +

      '<div class="card"><h2>1. Cabang &amp; Jadwal</h2><div class="form-grid">' +
      '<div><label>Cabang</label><select id="bk-branch">' + branches.map(b => '<option value="' + b.id + '"' + (b.id === state.branch_id ? ' selected' : '') + '>' + esc(b.nama) + '</option>').join('') + '</select></div>' +
      '<div><label>Terapis (opsional)</label><select id="bk-terapis"><option value="">Biarkan admin menugaskan</option>' +
      therapists.filter(t => !state.branch_id || t.branch_id === state.branch_id).map(t => '<option value="' + t.id + '"' + (t.id === state.therapist_id ? ' selected' : '') + '>' + esc(t.nama) + ' (' + esc(t.gender) + ')</option>').join('') + '</select></div>' +
      '<div><label>Tanggal</label><input type="date" id="bk-tanggal" value="' + state.tanggal + '" min="' + todayStr() + '"></div>' +
      '<div><label>Jam</label><select id="bk-jam">' + jamSlots.map(j => '<option value="' + j + '"' + (j === state.jam ? ' selected' : '') + '>' + j + '</option>').join('') + '</select></div>' +
      (adminMode
        ? '<div class="full"><label>Pelanggan</label><select id="bk-customer"><option value="">— Tamu (walk-in) —</option>' +
          customers.map(c => '<option value="' + c.id + '"' + (c.id === state.customer_id ? ' selected' : '') + '>' + esc(c.nama) + ' (' + esc(c.phone) + ')</option>').join('') + '</select>' +
          '<div class="fm-hint">Jika memilih tamu, isi nama di bawah.</div></div>' +
          '<div class="full"><label>Nama Tamu</label><input id="bk-guest" placeholder="Nama tamu walk-in" value="' + esc(state.guest_nama) + '"></div>'
        : '') +
      '</div></div>' +

      '<div class="card"><h2>2. Pilih Layanan (Treatment Menu)</h2>' +
      '<div class="svc-cats">' + cats.map(c => '<button type="button" data-cat="' + esc(c) + '" class="' + (c === state.tab ? 'active' : '') + '">' + esc(c) + '</button>').join('') + '</div>' +
      '<div id="bk-svcs">' + svcHtml() + '</div></div>' +

      '<div class="card"><h2>3. Atribut &amp; Pilihan Tambahan</h2>' + attrHtml() + '</div>' +

      '<div class="card"><h2>4. Catatan</h2><textarea id="bk-catatan" rows="2" placeholder="Contoh: alergi minyak, ingin ruangan tertentu, dsb.">' + esc(opts.catatan || '') + '</textarea></div>' +
      '</div>' +

      '<div><div class="card bk-summary"><h2>Ringkasan Pesanan</h2><div id="bk-summary">' + summaryHtml() + '</div>' +
      '<button class="btn btn-primary btn-block" id="bk-submit" style="margin-top:14px">' + ic('check', 16) + ' ' + (adminMode ? 'Buat Order' : 'Kirim Booking') + '</button>' +
      '<p class="muted" style="font-size:11.5px;margin-top:9px;text-align:center">Total bayar dikonfirmasi kasir saat treatment.</p>' +
      '</div></div></div>';

    /* events — listener pada container cukup sekali, elemen tombol berganti saat redraw */
    qs('#bk-branch', container).onchange = e => { state.branch_id = e.target.value; state.therapist_id = ''; draw(); };
    qs('#bk-tanggal', container).onchange = e => { state.tanggal = e.target.value; };
    qs('#bk-jam', container).onchange = e => { state.jam = e.target.value; };
    qs('#bk-terapis', container).onchange = e => { state.therapist_id = e.target.value; };
    if (adminMode) {
      qs('#bk-customer', container).onchange = e => { state.customer_id = e.target.value; };
      qs('#bk-guest', container).oninput = e => { state.guest_nama = e.target.value; };
    }
    qsa('[data-cat]', container).forEach(b => b.onclick = () => { state.tab = b.dataset.cat; draw(); });
    qs('#bk-submit', container).onclick = submit;
    if (!container._bkBound) {
      container._bkBound = true;
      container.addEventListener('click', qtyClick);
      container.addEventListener('change', optChange);
    }
    updateSummary();
  }
  function qtyClick(e) {
    const card = e.target.closest('.svc-item');
    if (!card) return;
    e.preventDefault();
    const btn = e.target.closest('[data-qty]');
    const sid = btn ? btn.dataset.sid : card.dataset.svc;
    const d = btn ? parseInt(btn.dataset.qty, 10) : 1;
    const cur = state.items[sid] || 0;
    const next = cur + d;
    if (next <= 0) delete state.items[sid]; else state.items[sid] = next;
    qs('#bk-svcs', container).innerHTML = svcHtml();
    updateSummary();
  }
  function optChange(e) {
    const el = e.target;
    if (!el.dataset.opt) return;
    if (el.type === 'radio') {
      qsa('input[name="' + el.name + '"]', container).forEach(r => state.extras.delete(r.dataset.opt));
      state.extras.add(el.dataset.opt);
    } else {
      if (el.checked) state.extras.add(el.dataset.opt); else state.extras.delete(el.dataset.opt);
    }
    updateSummary();
  }
  function updateSummary() { qs('#bk-summary', container).innerHTML = summaryHtml(); }

  async function submit() {
    if (!Object.keys(state.items).length) { toast('Pilih minimal satu layanan.', 'err'); return; }
    if (!state.branch_id) { toast('Pilih cabang dulu.', 'err'); return; }
    if (adminMode && !state.customer_id && !state.guest_nama.trim()) { toast('Pilih pelanggan atau isi nama tamu.', 'err'); return; }
    const btn = qs('#bk-submit', container);
    btn.disabled = true;
    try {
      const payload = {
        branch_id: state.branch_id, tanggal: state.tanggal, jam: state.jam,
        therapist_id: state.therapist_id, catatan: qs('#bk-catatan', container).value,
        items: Object.entries(state.items).map(([service_id, qty]) => ({ service_id, qty })),
        extras: [...state.extras]
      };
      if (adminMode) { if (state.customer_id) payload.customer_id = state.customer_id; else payload.guest_nama = state.guest_nama.trim(); }
      await api('booking_create', payload);
      toast(adminMode ? 'Order berhasil dibuat.' : 'Booking terkirim! Menunggu konfirmasi spa.');
      location.hash = adminMode ? '#/admin/orderan' : '#/pelanggan/pesanan';
    } catch (err) { toast(err.message, 'err'); btn.disabled = false; }
  }

  draw();
}
const num = v => Number(v) || 0;

/* ================= MODAL DETAIL ORDER ================= */
async function openOrderDetail(orderId, onChange) {
  let data;
  try { data = await api('order_get', { order_id: orderId }); }
  catch (err) { toast(err.message, 'err'); return; }

  const role = (Session.get() || {}).user.role;
  let ov = null;

  async function refresh() {
    try { data = await api('order_get', { order_id: orderId }); }
    catch (err) { toast(err.message, 'err'); Modal.close(ov); return; }
    paint();
    if (onChange) onChange();
  }

  function timelineHtml() {
    const steps = [['menunggu', 'Menunggu'], ['dikonfirmasi', 'Dikonfirmasi'], ['berlangsung', 'Berlangsung'], ['selesai', 'Selesai']];
    const o = data.order;
    if (o.status === 'batal') {
      return '<div class="timeline">' + steps.map(s => '<div class="tl-step"><div class="dot"></div>' + s[1] + '</div>').join('') +
        '<div class="tl-step cancel"><div class="dot"></div>Dibatalkan</div></div>';
    }
    const idx = steps.findIndex(s => s[0] === o.status);
    return '<div class="timeline">' + steps.map((s, i) => '<div class="tl-step' + (i <= idx ? ' done' : '') + '"><div class="dot"></div>' + s[1] + '</div>').join('') + '</div>';
  }

  function bodyHtml() {
    const o = data.order;
    const items = data.items.map(i =>
      '<div class="sum-line"><span>' + esc(i.nama) + ' x' + esc(i.qty) + '</span><span>' + fmtIDR(i.subtotal) + '</span></div>').join('');
    const extras = data.extras.map(e =>
      '<div class="sum-line"><span>' + esc(e.label) + '</span><span>' + (num(e.harga) ? '+' + fmtIDR(e.harga) : 'Gratis') + '</span></div>').join('');
    const acts = [];

    if (role === 'terapis') {
      if (o.status === 'menunggu') acts.push(['Konfirmasi Order', 'dikonfirmasi', 'btn-primary']);
      else if (o.status === 'dikonfirmasi') acts.push(['Mulai Treatment', 'berlangsung', 'btn-primary']);
      else if (o.status === 'berlangsung') acts.push(['Selesaikan', 'selesai', 'btn-primary']);
    } else if (role === 'admin') {
      if (o.status === 'menunggu') { acts.push(['Konfirmasi', 'dikonfirmasi', 'btn-primary']); acts.push(['Batalkan', 'batal', 'btn-danger']); }
      else if (o.status === 'dikonfirmasi') { acts.push(['Mulai', 'berlangsung', 'btn-primary']); acts.push(['Batalkan', 'batal', 'btn-danger']); }
      else if (o.status === 'berlangsung') acts.push(['Selesaikan', 'selesai', 'btn-primary']);
      if (!['selesai', 'batal'].includes(o.status)) acts.push(['__assign', '', 'btn-ghost']);
      if (o.status === 'selesai' && o.status_bayar !== 'lunas') acts.push(['__pay', '', 'btn-primary']);
    } else if (role === 'pelanggan') {
      if (o.status === 'menunggu') acts.push(['Batalkan Booking', 'batal', 'btn-danger']);
    }

    return '<div class="ord-head"><div class="ord-kode">' + esc(o.kode) + '</div><div>' + badge(o.status) + ' ' +
      (o.status_bayar ? badge(o.status_bayar) : '') + '</div></div>' +
      timelineHtml() +
      '<div class="dl-list">' +
      dl('Pelanggan', o.customer_nama + (o.customer_id ? '' : ' (tamu)')) +
      dl('Terapis', o.therapist_nama || '(belum ditugaskan)') +
      dl('Cabang', o.branch_nama) +
      dl('Jadwal', fmtDate(o.tanggal) + ', ' + o.jam) +
      dl('Catatan', o.catatan || '-') +
      '</div>' +
      '<h3 style="font-size:13.5px;margin:14px 0 6px;color:var(--primary-dark)">Rincian Layanan</h3>' + items +
      (extras ? '<h3 style="font-size:13.5px;margin:14px 0 6px;color:var(--primary-dark)">Tambahan</h3>' + extras : '') +
      '<div class="sum-line total"><span>Total</span><span>' + fmtIDR(o.total) + '</span></div>' +
      '<div class="dl-list" style="margin-top:8px">' +
      dl('Komisi Terapis (' + esc(o.komisi_pct) + '%)', fmtIDR(o.komisi_terapis)) +
      (o.status_bayar ? dl('Pembayaran', badge(o.status_bayar) + ' ' + (o.metode_bayar ? '(' + esc(o.metode_bayar) + ')' : '')) : '') +
      '</div>' +
      (acts.length ? '<div class="ord-actions">' +
        acts.map(a => a[0] === '__assign'
          ? '<button class="btn btn-ghost" data-act="assign">' + ic('users', 15) + ' Tugaskan Terapis</button>'
          : a[0] === '__pay'
            ? '<button class="btn btn-primary" data-act="pay">' + ic('cash', 15) + ' Tandai Lunas</button>'
            : '<button class="btn ' + a[2] + '" data-act="status" data-to="' + a[1] + '">' + esc(a[0]) + '</button>'
        ).join('') + '</div>' : '');
  }
  const dl = (k, v) => '<div><span>' + esc(k) + '</span><span>' + v + '</span></div>';

  function paint() {
    if (!ov) {
      ov = Modal.open('<div class="modal-head"><h3>Detail Order</h3><button class="icon-btn" data-close-modal>' + ic('x') + '</button></div>' +
        '<div class="modal-body" id="ord-body"></div>', { wide: true });
    }
    qs('#ord-body', ov).innerHTML = bodyHtml();
    qsa('[data-act]', ov).forEach(btn => btn.onclick = () => act(btn.dataset));
  }

  async function act(ds) {
    try {
      if (ds.act === 'status') {
        if (ds.to === 'batal' && !(await confirmDialog('Batalkan order?', 'Order ' + (data.order.kode) + ' akan dibatalkan.'))) return;
        await api('order_status', { order_id: orderId, status: ds.to });
        toast('Status order diperbarui.');
        await refresh();
      } else if (ds.act === 'assign') {
        const terapis = (await api('list', { table: 'therapists' })).rows.filter(t => t.status === 'aktif');
        formModal({
          title: 'Tugaskan Terapis', submitLabel: 'Simpan',
          fields: [{ name: 'therapist_id', label: 'Terapis', type: 'select', required: true, full: true, options: [{ v: '', l: '(belum ditugaskan)' }].concat(terapis.map(t => ({ v: t.id, l: t.nama + ' (' + t.gender + ') — ' + (t.keahlian || '') }))) }],
          values: { therapist_id: data.order.therapist_id },
          onSubmit: async v => { await api('order_assign', { order_id: orderId, therapist_id: v.therapist_id }); toast('Terapis ditugaskan.'); await refresh(); }
        });
      } else if (ds.act === 'pay') {
        formModal({
          title: 'Konfirmasi Pembayaran', submitLabel: 'Tandai Lunas',
          fields: [{ name: 'metode_bayar', label: 'Metode Pembayaran', type: 'select', required: true, full: true, options: [{ v: 'cash', l: 'Tunai (Cash)' }, { v: 'transfer', l: 'Transfer Bank' }, { v: 'qris', l: 'QRIS' }] }],
          onSubmit: async v => { await api('order_pay', { order_id: orderId, metode_bayar: v.metode_bayar }); toast('Pembayaran dicatat lunas.'); await refresh(); }
        });
      }
    } catch (err) { toast(err.message, 'err'); }
  }

  paint();
}
