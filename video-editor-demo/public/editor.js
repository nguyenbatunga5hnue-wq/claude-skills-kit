import { W, H, FPS, BOX, TRACKS, STYLES, ANIMS, drawFrame, duration, sceneAt, srcTimeAt, videoCrop, loadFonts } from '/render.js';

const $ = (id) => document.getElementById(id);
const view = $('view'), ui = $('ui'), video = $('video');
const vctx = view.getContext('2d'), uctx = ui.getContext('2d');

let P = null;            // the project (same shape as project.json)
let version = null;      // server file version, to detect edits made by Claude
let t = 0, playing = false, clock = { wall: 0, t: 0 };
let sel = null, filter = 'here', dirty = false, safe = false;
let boxes = [], drag = null, listKey = '', guideX = false;
const undoStack = [];

// ---------- helpers ----------
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const fmt = (s) => { s = Math.max(0, s); const m = Math.floor(s / 60); return `${m}:${(s - m * 60).toFixed(2).padStart(5, '0')}`; };
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const plain = (s) => String(s ?? '').replace(/[[\]]/g, '').replace(/\n/g, ' ');
const isScene = (o) => o && 'srcIn' in o;
const byId = (id) => P.layers.find((l) => l.id === id) || P.scenes.find((s) => s.id === id);
const trackOf = (o) => TRACKS.find((tr) => tr.id === (isScene(o) ? 'canh' : o.track));
const dur = () => duration(P);

function toast(html, ms = 2600) {
  const el = $('toast');
  el.innerHTML = html;
  el.classList.add('on');
  clearTimeout(toast.h);
  if (ms) toast.h = setTimeout(() => el.classList.remove('on'), ms);
}
function snapshot() { undoStack.push(JSON.stringify(P)); if (undoStack.length > 150) undoStack.shift(); }
function touched(o) { o.edited = true; dirty = true; status(); }
function status() { const s = $('status'); s.textContent = dirty ? '● Chưa lưu' : 'Đã lưu'; s.className = 'status' + (dirty ? ' dirty' : ''); }

// ---------- load / save ----------
async function load() {
  const r = await fetch('/api/project', { cache: 'no-store' });
  version = r.headers.get('x-version');
  P = await r.json();
  dirty = false;
  if (sel && !byId(sel)) sel = null;
  $('pname').textContent = P.name;
  status();
  renderAll();
}
async function save() {
  const r = await fetch('/api/project', { method: 'PUT', body: JSON.stringify(P) });
  if (!r.ok) return toast('Lưu thất bại');
  version = (await r.json()).version;
  dirty = false;
  status();
  loadHistory();
  toast('Đã lưu. Giờ có thể nói với Claude: <b>“xem ghi chú trong editor”</b>', 4000);
}
async function loadHistory() {
  const items = await (await fetch('/api/history')).json();
  $('history').innerHTML = '<option value="">Lịch sử…</option>' + items.map((f) => {
    const m = /(\d{4})(\d\d)(\d\d)-(\d\d)(\d\d)(\d\d)/.exec(f);
    return `<option value="${esc(f)}">${m ? `${m[4]}:${m[5]}:${m[6]} ${m[3]}/${m[2]}` : esc(f)}</option>`;
  }).join('');
}
// Pick up changes Claude makes to project.json while the editor is open.
setInterval(async () => {
  try {
    const v = (await (await fetch('/api/project/version', { cache: 'no-store' })).json()).version;
    if (!version || v === version) return;
    if (!dirty) { await load(); toast('✳ Claude vừa cập nhật dự án'); }
    else { version = v; toast('File đã đổi bên ngoài. <button id="reload">Tải lại</button>', 8000); $('reload').onclick = load; }
  } catch { /* server restarting */ }
}, 2000);

// ---------- canvas ----------
function fit() {
  const r = $('wrap').getBoundingClientRect();
  let h = r.height, w = (h * 9) / 16;
  if (w > r.width) { w = r.width; h = (w * 16) / 9; }
  for (const c of [view, ui]) { c.style.width = `${w}px`; c.style.height = `${h}px`; }
}
addEventListener('resize', fit);

function draw() {
  if (!P) return;
  boxes = drawFrame(vctx, P, t, video.readyState >= 2 ? video : null, { safe });
  drawUI();
  $('time').textContent = `${fmt(t)} / ${fmt(dur())}`;
  placePlayhead();
}
function drawUI() {
  uctx.clearRect(0, 0, W, H);
  const o = sel && byId(sel);
  if (!o) return;
  uctx.lineWidth = 5;
  uctx.strokeStyle = '#2f6bff';
  if (isScene(o)) {
    if (t < o.start || t >= o.end) return;
    uctx.setLineDash([16, 10]);
    uctx.strokeRect(BOX.x + 4, BOX.y + 4, BOX.w - 8, BOX.h - 8);
    uctx.setLineDash([]);
    uctx.font = '700 30px "Be Vietnam Pro"';
    const txt = 'Kéo để dời khung · cuộn để zoom';
    uctx.fillStyle = 'rgba(47,107,255,.92)';
    uctx.fillRect(BOX.x + 20, BOX.y + 20, uctx.measureText(txt).width + 28, 48);
    uctx.fillStyle = '#fff';
    uctx.fillText(txt, BOX.x + 34, BOX.y + 55);
    return;
  }
  const b = boxes.find((x) => x.id === sel);
  if (!b) return;
  uctx.strokeRect(b.x - 10, b.y - 10, b.w + 20, b.h + 20);
  uctx.fillStyle = '#fff';
  for (const [x, y] of corners(b)) { uctx.fillRect(x - 14, y - 14, 28, 28); uctx.strokeRect(x - 14, y - 14, 28, 28); }
  if (guideX) { uctx.strokeStyle = '#ff3d7f'; uctx.lineWidth = 3; uctx.beginPath(); uctx.moveTo(W / 2, 0); uctx.lineTo(W / 2, H); uctx.stroke(); }
}
const corners = (b) => [[b.x - 10, b.y - 10], [b.x + b.w + 10, b.y - 10], [b.x - 10, b.y + b.h + 10], [b.x + b.w + 10, b.y + b.h + 10]];
function toCanvas(e) {
  const r = ui.getBoundingClientRect();
  return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H };
}
const inside = (p, b, pad = 0) => p.x >= b.x - pad && p.x <= b.x + b.w + pad && p.y >= b.y - pad && p.y <= b.y + b.h + pad;
const nearCorner = (p, b) => corners(b).some(([x, y]) => Math.abs(p.x - x) < 34 && Math.abs(p.y - y) < 34);
const srcSize = () => [video.videoWidth || P.source.width, video.videoHeight || P.source.height];

ui.addEventListener('pointerdown', (e) => {
  const p = toCanvas(e);
  const selBox = boxes.find((b) => b.id === sel);
  const hit = [...boxes].reverse().find((b) => inside(p, b, 10));
  if (selBox && nearCorner(p, selBox)) {
    const l = byId(sel);
    const cx = l.x * W, cy = l.y * H;
    drag = { mode: 'resize', o: l, size0: l.size, d0: Math.hypot(p.x - cx, p.y - cy) || 1, cx, cy };
  } else if (hit) {
    select(hit.id, false);
    const l = byId(hit.id);
    drag = { mode: 'move', o: l, ox: p.x - l.x * W, oy: p.y - l.y * H };
  } else if (inside(p, BOX)) {
    const sc = sceneAt(P, t);
    select(sc.id, false);
    const [sw, sh] = srcSize();
    const c = videoCrop(sc, t, sw, sh);
    drag = { mode: 'pan', o: sc, p0: p, f0: [...sc.focus], kx: c.vw / BOX.w / sw, ky: c.vh / BOX.h / sh };
  } else { select(null); return; }
  drag.before = JSON.stringify(P);
  drag.moved = false;
  ui.setPointerCapture(e.pointerId);
});
ui.addEventListener('pointermove', (e) => {
  const p = toCanvas(e);
  if (!drag) {
    const selBox = boxes.find((b) => b.id === sel);
    ui.style.cursor = selBox && nearCorner(p, selBox) ? 'nwse-resize' : boxes.some((b) => inside(p, b, 10)) ? 'move' : inside(p, BOX) ? 'grab' : 'default';
    return;
  }
  drag.moved = true;
  const o = drag.o;
  if (drag.mode === 'move') {
    let x = p.x - drag.ox;
    guideX = Math.abs(x - W / 2) < 14;
    if (guideX) x = W / 2;
    o.x = +clamp(x / W, 0, 1).toFixed(4);
    o.y = +clamp((p.y - drag.oy) / H, 0, 1).toFixed(4);
  } else if (drag.mode === 'resize') {
    o.size = Math.round(clamp((drag.size0 * Math.hypot(p.x - drag.cx, p.y - drag.cy)) / drag.d0, 16, 240));
  } else if (drag.mode === 'pan') {
    o.focus = [+clamp(drag.f0[0] - (p.x - drag.p0.x) * drag.kx, 0, 1).toFixed(3), +clamp(drag.f0[1] - (p.y - drag.p0.y) * drag.ky, 0, 1).toFixed(3)];
  }
  touched(o);
  draw();
});
ui.addEventListener('pointerup', () => {
  if (!drag) return;
  if (drag.moved) { undoStack.push(drag.before); renderList(true); renderInspector(); renderTimeline(); }
  drag = null;
  guideX = false;
  draw();
});
ui.addEventListener('wheel', (e) => {
  const p = toCanvas(e);
  if (!inside(p, BOX)) return;
  e.preventDefault();
  const sc = sceneAt(P, t);
  if (sel !== sc.id) { select(sc.id); return; }
  snapshot();
  const f = e.deltaY < 0 ? 1.04 : 1 / 1.04;
  sc.zoom = sc.zoom.map((z) => +clamp(z * f, 1, 4).toFixed(3));
  touched(sc);
  draw();
  renderInspector();
}, { passive: false });

// ---------- playback ----------
function syncVideo(force) {
  const want = srcTimeAt(P, t);
  if (force || Math.abs(video.currentTime - want) > 0.25) video.currentTime = want;
}
function setTime(x) {
  t = clamp(x, 0, dur() - 1 / FPS);
  if (playing) clock = { wall: performance.now(), t };
  syncVideo(true);
  draw();
  renderList();
}
function play() {
  if (t >= dur() - 0.1) t = 0;
  playing = true;
  clock = { wall: performance.now(), t };
  syncVideo(true);
  video.play().catch(() => {});
  $('play').textContent = '❚❚';
  requestAnimationFrame(tick);
}
function pause() { playing = false; video.pause(); $('play').textContent = '▶'; draw(); renderList(); }
function tick(now) {
  if (!playing) return;
  t = clock.t + (now - clock.wall) / 1000;
  if (t >= dur()) { t = dur() - 1 / FPS; pause(); return; }
  syncVideo(false);
  draw();
  renderList();
  const x = t * pps(), sc = $('tlscroll');
  if (x < sc.scrollLeft || x > sc.scrollLeft + sc.clientWidth - 40) sc.scrollLeft = x - 80;
  requestAnimationFrame(tick);
}
video.addEventListener('seeked', () => { if (!playing) draw(); });
video.addEventListener('loadeddata', draw);
$('play').onclick = () => (playing ? pause() : play());

// ---------- selection / list ----------
function select(id, seek = true) {
  sel = id;
  const o = id && byId(id);
  if (o && seek && (t < o.start || t >= o.end)) setTime(o.start + 0.4 < o.end ? o.start + 0.4 : o.start);
  renderList(true);
  renderInspector();
  renderTimeline();
  draw();
}
function renderList(force) {
  const q = $('search').value.trim().toLowerCase();
  const items = [...P.scenes.map((s) => ({ o: s, label: s.name })), ...P.layers.map((l) => ({ o: l, label: plain(l.text) }))]
    .filter(({ o, label }) =>
      (filter === 'all' || (filter === 'here' && t >= o.start && t < o.end) || (filter === 'note' && o.note) || (filter === 'edited' && o.edited)) &&
      (!q || label.toLowerCase().includes(q)))
    .sort((a, b) => a.o.start - b.o.start);
  const key = filter + q + sel + items.map((i) => i.o.id).join();
  if (!force && key === listKey) return;
  listKey = key;
  $('list').innerHTML = items.map(({ o, label }) => {
    const tr = trackOf(o);
    return `<li data-id="${o.id}" class="${o.id === sel ? 'sel' : ''}"><span class="dot" style="background:${tr.color}"></span>
      <span class="txt">${esc(label)}<span class="meta">${tr.name} · ${fmt(o.start)}${o.edited ? ' · đã chỉnh' : ''}</span></span>
      <span class="flag">${o.note ? '✎' : ''}</span></li>`;
  }).join('') || '<li class="empty">Không có thành phần nào.</li>';
}
$('list').onclick = (e) => { const li = e.target.closest('li[data-id]'); if (li) select(li.dataset.id); };
$('tabs').onclick = (e) => {
  const b = e.target.closest('button'); if (!b) return;
  filter = b.dataset.f;
  for (const x of $('tabs').children) x.classList.toggle('on', x === b);
  renderList(true);
};
$('search').oninput = () => renderList(true);

// ---------- inspector ----------
const opt = (obj, cur) => Object.entries(obj).map(([k, v]) => `<option value="${k}" ${k === cur ? 'selected' : ''}>${esc(typeof v === 'string' ? v : v.label)}</option>`).join('');
const num = (name, label, val, step = 0.1) => `<label class="field"><span>${label}</span><input type="number" step="${step}" data-k="${name}" value="${val}"></label>`;
const noteBox = (o, what) => `
  <div class="note-box">
    ${o.reply ? `<div class="reply"><b>✳ Claude:</b> ${esc(o.reply)}</div>` : ''}
    <label class="field"><span>Ghi chú cho Claude – ${what}</span>
      <textarea data-k="note" placeholder="Ví dụ: chữ to hơn, đổi câu khác vui hơn, xuất hiện sớm hơn 1 giây…">${esc(o.note)}</textarea></label>
    <div class="tip">Bạn có thể tự sửa ở trên. Muốn nhờ Claude thì ghi chú ở đây, bấm <b>Lưu</b>, rồi nói với Claude: “xem ghi chú trong editor”.</div>
  </div>`;

function renderInspector() {
  const el = $('inspector');
  const o = sel && byId(sel);
  if (!o) {
    const notes = [...P.scenes, ...P.layers].filter((x) => x.note).length;
    el.innerHTML = `<h3>${esc(P.name)}</h3><div class="sub">${fmt(dur())} · ${P.scenes.length} cảnh · ${P.layers.length} thành phần · ${notes} ghi chú</div>
      <p class="help">Bấm vào chữ hoặc graphic trên video (hoặc trong timeline) để chỉnh. Kéo để di chuyển, kéo góc để phóng to. Bấm vào vùng video để chỉnh khung hình của cảnh.</p>
      <div class="note-box"><label class="field"><span>Ghi chú chung cho Claude – cả video</span>
      <textarea data-k="note" placeholder="Ví dụ: làm phần mở đầu sôi động hơn, thêm 1 câu hỏi cho người xem…">${esc(P.note)}</textarea></label>
      <div class="tip">Bấm <b>Lưu</b>, rồi nói với Claude: “xem ghi chú trong editor”.</div></div>`;
    bind(el, P);
    return;
  }
  if (isScene(o)) {
    el.innerHTML = `<h3>Cảnh · ${esc(o.name)}</h3><div class="sub">${fmt(o.start)} – ${fmt(o.end)} · nguồn từ ${fmt(o.srcIn)}</div>
      <p class="help">Bấm và kéo trên video để dời khung hình, cuộn chuột để zoom. Kéo mép phải của cảnh trong timeline để đổi điểm cắt.</p>
      <label class="field"><span>Tên cảnh</span><input type="text" data-k="name" value="${esc(o.name)}"></label>
      <div class="row2">${num('zoom.0', 'Zoom đầu cảnh', o.zoom[0], 0.05)}${num('zoom.1', 'Zoom cuối cảnh', o.zoom[1], 0.05)}</div>
      <div class="row2">${num('focus.0', 'Tâm khung X (0–1)', o.focus[0], 0.01)}${num('focus.1', 'Tâm khung Y (0–1)', o.focus[1], 0.01)}</div>
      <div class="row2">${num('end', 'Kết thúc (giây)', o.end)}${num('srcIn', 'Lấy từ giây (nguồn)', o.srcIn)}</div>
      ${noteBox(o, 'cảnh này')}`;
  } else {
    el.innerHTML = `<h3>${trackOf(o).name}</h3><div class="sub">${fmt(o.start)} – ${fmt(o.end)}</div>
      <label class="field"><span>Nội dung <small>([từ] = tô màu nhấn, Enter = xuống dòng)</small></span><textarea data-k="text">${esc(o.text)}</textarea></label>
      <div class="row2">${num('start', 'Bắt đầu (giây)', o.start)}${num('end', 'Kết thúc (giây)', o.end)}</div>
      <div class="row2"><label class="field"><span>Kiểu chữ</span><select data-k="style">${opt(STYLES, o.style)}</select></label>
        <label class="field"><span>Hiệu ứng vào</span><select data-k="anim">${opt(ANIMS, o.anim)}</select></label></div>
      <div class="row2">${num('size', 'Cỡ chữ', o.size, 1)}
        <label class="field"><span>Track</span><select data-k="track">${opt(Object.fromEntries(TRACKS.filter((x) => x.id !== 'canh').map((x) => [x.id, x.name])), o.track)}</select></label></div>
      <div class="row2">${num('x', 'Vị trí X (0–1)', o.x, 0.01)}${num('y', 'Vị trí Y (0–1)', o.y, 0.01)}</div>
      <div class="row2"><button id="dup">Nhân bản</button><button id="del" class="danger">Xoá</button></div>
      ${noteBox(o, 'thành phần này')}`;
    $('dup').onclick = () => {
      snapshot();
      const c = { ...o, id: 'u' + Date.now().toString(36), y: clamp(o.y + 0.05, 0, 1), note: '', reply: undefined, edited: true };
      P.layers.push(c); touched(c); select(c.id);
    };
    $('del').onclick = deleteSel;
  }
  bind(el, o);
}
function bind(el, o) {
  for (const inp of el.querySelectorAll('[data-k]')) {
    inp.addEventListener('focus', () => { inp.dataset.before = JSON.stringify(P); });
    inp.addEventListener('change', () => { if (inp.dataset.before) undoStack.push(inp.dataset.before); inp.dataset.before = JSON.stringify(P); });
    inp.addEventListener('input', () => {
      const k = inp.dataset.k;
      let v = inp.type === 'number' ? parseFloat(inp.value) : inp.value;
      if (inp.type === 'number' && !Number.isFinite(v)) return;
      if (k.includes('.')) { const [a, i] = k.split('.'); o[a][+i] = v; }
      else if (isScene(o) && k === 'end') setSceneEnd(o, v);
      else if (k === 'start') o.start = clamp(v, 0, o.end - 0.1);
      else if (k === 'end') o.end = clamp(v, o.start + 0.1, dur());
      else o[k] = v;
      if (k === 'note' && o.reply && v === '') delete o.reply;
      touched(o);
      draw();
      if (k !== 'note' && k !== 'text') renderTimeline();
      renderList(true);
    });
  }
}
// Moving a cut point: this scene's end and the next scene's start move together,
// and the next scene keeps showing the same source footage.
function setSceneEnd(sc, v) {
  const i = P.scenes.indexOf(sc), next = P.scenes[i + 1];
  const lo = sc.start + 0.2, hi = next ? next.end - 0.2 : sc.srcIn + (P.source.duration - sc.srcIn) + sc.start;
  v = +clamp(v, lo, hi).toFixed(2);
  const d = v - sc.end;
  sc.end = v;
  if (next) { next.start = v; next.srcIn = +(next.srcIn + d).toFixed(3); touched(next); }
}
function deleteSel() {
  const o = sel && byId(sel);
  if (!o || isScene(o)) return;
  snapshot();
  P.layers = P.layers.filter((l) => l !== o);
  dirty = true; status();
  select(null);
}

// ---------- timeline ----------
const pps = () => +$('zoom').value;
function placePlayhead() { $('playhead').style.left = `${t * pps()}px`; }
function renderTimeline() {
  const k = pps(), D = dur();
  $('tlinner').style.width = `${D * k + 60}px`;
  $('tlinfo').textContent = `${fmt(D)} · ${P.scenes.length} cảnh · ${P.layers.length} thành phần`;
  $('tllabels').innerHTML = TRACKS.map((tr) => `<div>${tr.name}</div>`).join('');
  const step = k > 45 ? 1 : k > 18 ? 2 : 5;
  let r = '';
  for (let s = 0; s <= D; s += step) r += `<i style="left:${s * k}px"></i><span style="left:${s * k}px">${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}</span>`;
  $('ruler').innerHTML = r;
  $('tracks').innerHTML = TRACKS.map((tr) => {
    const items = tr.id === 'canh' ? P.scenes : P.layers.filter((l) => l.track === tr.id);
    return `<div class="track" data-track="${tr.id}">${items.map((o) => `
      <div class="clip ${o.id === sel ? 'sel' : ''}" data-id="${o.id}" title="${esc(isScene(o) ? o.name : plain(o.text))}"
        style="left:${o.start * k}px;width:${Math.max(4, (o.end - o.start) * k - 2)}px;background:${tr.color}${o.edited ? '' : 'cc'}">
        <span class="h l"></span>${esc(isScene(o) ? o.name : plain(o.text))}${o.note ? '<span class="badge">✎</span>' : ''}<span class="h r"></span>
      </div>`).join('')}</div>`;
  }).join('');
  placePlayhead();
}
$('zoom').oninput = renderTimeline;
$('tlinner').addEventListener('pointerdown', (e) => {
  const inner = $('tlinner');
  const x0 = e.clientX;
  const clip = e.target.closest('.clip');
  const toT = (cx) => (cx - inner.getBoundingClientRect().left) / pps();
  if (!clip) {
    setTime(toT(x0));
    const mv = (ev) => setTime(toT(ev.clientX));
    const up = () => { removeEventListener('pointermove', mv); removeEventListener('pointerup', up); };
    addEventListener('pointermove', mv); addEventListener('pointerup', up);
    return;
  }
  const o = byId(clip.dataset.id);
  const mode = e.target.classList.contains('l') ? 'l' : e.target.classList.contains('r') ? 'r' : 'move';
  const s0 = o.start, e0 = o.end, before = JSON.stringify(P);
  let moved = false;
  if (sel !== o.id) { sel = o.id; renderList(true); renderInspector(); renderTimeline(); draw(); }
  const snap = (v) => (Math.abs(v - t) < 6 / pps() ? t : Math.round(v * 10) / 10);
  const mv = (ev) => {
    const d = (ev.clientX - x0) / pps();
    if (Math.abs(ev.clientX - x0) < 3 && !moved) return;
    moved = true;
    if (isScene(o)) {
      const i = P.scenes.indexOf(o);
      if (mode === 'r') setSceneEnd(o, snap(e0 + d));
      else if (mode === 'l' && i > 0) setSceneEnd(P.scenes[i - 1], snap(s0 + d));
      else return;
    } else if (mode === 'move') {
      const len = e0 - s0;
      o.start = +clamp(snap(s0 + d), 0, dur() - len).toFixed(2);
      o.end = +(o.start + len).toFixed(2);
    } else if (mode === 'l') o.start = +clamp(snap(s0 + d), 0, o.end - 0.2).toFixed(2);
    else o.end = +clamp(snap(e0 + d), o.start + 0.2, dur()).toFixed(2);
    touched(o);
    renderTimeline();
    draw();
  };
  const up = () => {
    removeEventListener('pointermove', mv); removeEventListener('pointerup', up);
    if (moved) { undoStack.push(before); renderInspector(); renderList(true); }
    else if (t < o.start || t >= o.end) setTime(o.start + Math.min(0.4, (o.end - o.start) / 2));
  };
  addEventListener('pointermove', mv); addEventListener('pointerup', up);
});

// ---------- toolbar ----------
$('add').onclick = () => {
  snapshot();
  const l = { id: 'u' + Date.now().toString(36), track: 'them', start: +t.toFixed(2), end: +Math.min(dur(), t + 3).toFixed(2),
    text: 'Chữ mới', x: 0.5, y: 0.3, size: 64, style: 'outline', anim: 'pop', note: '' };
  P.layers.push(l);
  touched(l);
  select(l.id, false);
  setTimeout(() => $('inspector').querySelector('[data-k=text]')?.select(), 0);
};
$('safe').onchange = (e) => { safe = e.target.checked; draw(); };
$('save').onclick = save;
$('undo').onclick = undo;
function undo() {
  if (!undoStack.length) return toast('Không còn gì để hoàn tác');
  P = JSON.parse(undoStack.pop());
  dirty = true; status();
  if (sel && !byId(sel)) sel = null;
  renderAll();
}
$('history').onchange = async (e) => {
  const f = e.target.value;
  if (!f) return;
  snapshot();
  P = await (await fetch(`/api/history/${encodeURIComponent(f)}`)).json();
  dirty = true; status(); sel = null; renderAll();
  toast('Đã mở bản lưu cũ. Bấm <b>Lưu</b> để dùng bản này, hoặc Hoàn tác để quay lại.', 5000);
  e.target.value = '';
};
$('export').onclick = async () => {
  if (dirty) await save();
  let job = await (await fetch('/api/export', { method: 'POST' })).json();
  const btn = $('export');
  btn.disabled = true;
  while (job.state === 'running') {
    btn.textContent = job.total ? `Đang xuất ${Math.round((job.done / job.total) * 100)}%` : 'Đang chuẩn bị…';
    await new Promise((r) => setTimeout(r, 800));
    job = await (await fetch('/api/export')).json();
  }
  btn.disabled = false;
  btn.textContent = 'Xuất video';
  if (job.state === 'done') toast(`Xuất xong! <a href="${job.file}" download>Tải video</a> · <a href="${job.file}" target="_blank">Xem</a>`, 0);
  else toast(`Xuất lỗi: ${esc(job.error || '')}`, 8000);
};

addEventListener('keydown', (e) => {
  const typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName);
  if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); save(); return; }
  if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !typing) { e.preventDefault(); undo(); return; }
  if (typing) return;
  if (e.key === ' ') { e.preventDefault(); playing ? pause() : play(); }
  else if (e.key === 'ArrowRight') setTime(t + (e.shiftKey ? 1 : 1 / FPS));
  else if (e.key === 'ArrowLeft') setTime(t - (e.shiftKey ? 1 : 1 / FPS));
  else if (e.key === 'Delete' || e.key === 'Backspace') deleteSel();
  else if (e.key === 'Escape') select(null);
});
addEventListener('beforeunload', (e) => { if (dirty) e.preventDefault(); });

function renderAll() { renderList(true); renderInspector(); renderTimeline(); draw(); }

await loadFonts();
fit();
await load();
loadHistory();
setTime(1.2);
