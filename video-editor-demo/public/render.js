// Shared renderer: the editor preview and the MP4 export both draw frames with
// drawFrame(), so what you see in the editor is exactly what gets exported.

export const W = 1080;
export const H = 1920;
export const FPS = 30;
// Where the (landscape) source video sits inside the vertical 9:16 frame.
export const BOX = { x: 0, y: 540, w: 1080, h: 820 };

export const TRACKS = [
  { id: 'canh', name: 'Cảnh', color: '#8fb3ff' },
  { id: 'graphic', name: 'Chữ graphic', color: '#ff9cbc' },
  { id: 'chu', name: 'Chữ dẫn', color: '#ffd862' },
  { id: 'them', name: 'Chữ thêm', color: '#c3b0ff' },
];

export const STYLES = {
  highlight: { label: 'Nền vàng', weight: 900, fill: '#17140a', em: '#d6336c', bg: '#FFE14D', padX: 0.36, padY: 0.14, radius: 0.22, lineH: 1.16 },
  outline: { label: 'Viền đen', weight: 900, fill: '#ffffff', em: '#FFE14D', stroke: '#101014', strokeW: 0.16, shadow: true, lineH: 1.12 },
  gold: { label: 'Chữ vàng', weight: 900, fill: '#FFE14D', em: '#ffffff', stroke: 'rgba(70,45,0,.9)', strokeW: 0.1, shadow: true, lineH: 1.1 },
  label: { label: 'Nhãn nhỏ', weight: 700, fill: '#ffffff', em: '#FFE14D', bg: 'rgba(18,18,26,.74)', padX: 0.6, padY: 0.3, radius: 0.9, lineH: 1.15 },
  subtitle: { label: 'Phụ đề', weight: 800, fill: '#ffffff', em: '#FFE14D', bg: 'rgba(0,0,0,.55)', padX: 0.45, padY: 0.2, radius: 0.3, lineH: 1.18 },
};

export const ANIMS = { pop: 'Bật lên', fade: 'Mờ dần', slide: 'Trượt lên', type: 'Gõ chữ', none: 'Không' };

const FONT = '"Be Vietnam Pro", system-ui, sans-serif';
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const easeOut = (t) => 1 - Math.pow(1 - t, 3);
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const backOut = (t) => { const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };

export function duration(p) {
  return p.scenes.length ? p.scenes[p.scenes.length - 1].end : 0;
}
export function sceneAt(p, t) {
  for (const sc of p.scenes) if (t >= sc.start && t < sc.end) return sc;
  return p.scenes[p.scenes.length - 1];
}
export function srcTimeAt(p, t) {
  const sc = sceneAt(p, t);
  return sc.srcIn + (t - sc.start);
}
export function activeLayers(p, t) {
  const order = { chu: 0, them: 1, graphic: 2 };
  return p.layers
    .filter((l) => t >= l.start && t < l.end)
    .sort((a, b) => (order[a.track] ?? 0) - (order[b.track] ?? 0));
}

// --- text layout -----------------------------------------------------------
// "[từ]" marks emphasised words (drawn in the style's accent colour).
function parseRich(text) {
  return String(text || '').split('\n').map((line) => {
    const words = [];
    let em = false;
    for (let w of line.split(/\s+/).filter(Boolean)) {
      if (w.startsWith('[')) { em = true; w = w.slice(1); }
      let close = false;
      if (w.endsWith(']')) { close = true; w = w.slice(0, -1); }
      if (w) words.push({ t: w, em });
      if (close) em = false;
    }
    return words;
  });
}

function layout(ctx, layer) {
  const st = STYLES[layer.style] || STYLES.outline;
  const size = layer.size || 64;
  ctx.font = `${st.weight} ${size}px ${FONT}`;
  const maxW = (layer.maxWidth || 0.86) * W;
  const space = ctx.measureText(' ').width;
  const rows = [];
  for (const words of parseRich(layer.text)) {
    let row = [], rowW = 0;
    for (const w of words) {
      const ww = ctx.measureText(w.t).width;
      const add = row.length ? space + ww : ww;
      if (row.length && rowW + add > maxW) { rows.push({ words: row, w: rowW }); row = []; rowW = 0; }
      row.push({ ...w, w: ww });
      rowW += row.length > 1 ? space + ww : ww;
    }
    rows.push({ words: row, w: rowW });
  }
  const lineH = size * st.lineH;
  const padX = st.bg ? size * st.padX : 0;
  const padY = st.bg ? size * st.padY : 0;
  const width = Math.max(...rows.map((r) => r.w), 10) + padX * 2;
  const height = rows.length * lineH + padY * 2;
  return { st, size, rows, lineH, padX, padY, space, width, height };
}

function roundRect(ctx, x, y, w, h, r) {
  r = Math.min(r, h / 2, w / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function animState(layer, t) {
  const local = t - layer.start;
  const len = layer.end - layer.start;
  const inT = clamp(local / 0.35);
  const outA = clamp((layer.end - t) / 0.2);
  const s = { alpha: outA, scale: 1, dy: 0, chars: Infinity };
  switch (layer.anim) {
    case 'pop': s.alpha *= clamp(inT * 3); s.scale = 0.55 + 0.45 * backOut(inT); break;
    case 'fade': s.alpha *= easeOut(inT); break;
    case 'slide': s.alpha *= easeOut(inT); s.dy = (1 - easeOut(inT)) * 80; break;
    case 'type': s.chars = clamp(local / Math.min(1.0, len * 0.5)) ; s.alpha *= clamp(inT * 4); break;
    default: break;
  }
  return s;
}

// Draws one text layer; returns its bounding box (unscaled) for hit-testing.
export function drawText(ctx, layer, t) {
  const L = layout(ctx, layer);
  const { st, size, rows, lineH, padX, padY, space } = L;
  const cx = layer.x * W;
  const cy = layer.y * H;
  const box = { id: layer.id, x: cx - L.width / 2, y: cy - L.height / 2, w: L.width, h: L.height };
  const a = animState(layer, t);
  if (a.alpha <= 0.001) return box;

  const totalChars = rows.reduce((n, r) => n + r.words.reduce((m, w) => m + w.t.length + 1, 0), 0);
  let budget = a.chars === Infinity ? Infinity : Math.floor(totalChars * a.chars);

  ctx.save();
  ctx.globalAlpha = a.alpha;
  ctx.translate(cx, cy + a.dy);
  ctx.scale(a.scale, a.scale);
  ctx.font = `${st.weight} ${size}px ${FONT}`;
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';

  const top = -L.height / 2 + padY;
  rows.forEach((row, i) => {
    const rowCy = top + lineH * i + lineH / 2;
    if (st.bg && row.words.length) {
      ctx.fillStyle = st.bg;
      const bw = row.w + padX * 2;
      const bh = lineH + padY * (rows.length === 1 ? 2 : 1.1);
      roundRect(ctx, -bw / 2, rowCy - bh / 2, bw, bh, size * st.radius);
      ctx.fill();
    }
    let x = -row.w / 2;
    for (const w of row.words) {
      if (budget <= 0) break;
      const txt = budget < w.t.length ? w.t.slice(0, budget) : w.t;
      budget -= w.t.length + 1;
      if (st.stroke) {
        ctx.save();
        if (st.shadow) {
          ctx.shadowColor = 'rgba(0,0,0,.6)';
          ctx.shadowBlur = size * 0.2;
          ctx.shadowOffsetY = size * 0.07;
        }
        ctx.strokeStyle = st.stroke;
        ctx.lineWidth = size * st.strokeW;
        ctx.strokeText(txt, x, rowCy);
        ctx.restore();
      }
      ctx.fillStyle = w.em ? st.em : st.fill;
      ctx.textAlign = 'left';
      ctx.fillText(txt, x, rowCy);
      x += w.w + space;
    }
  });
  ctx.restore();
  return box;
}

// --- frame -----------------------------------------------------------------
let blurCanvas = null;
function blurred(src, sw, sh) {
  if (!blurCanvas) {
    blurCanvas = typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(108, 192) : Object.assign(document.createElement('canvas'), { width: 108, height: 192 });
  }
  const b = blurCanvas.getContext('2d');
  const s = Math.max(108 / sw, 192 / sh) * 1.15;
  b.filter = 'blur(4px)';
  b.drawImage(src, (108 - sw * s) / 2, (192 - sh * s) / 2, sw * s, sh * s);
  b.filter = 'none';
  return blurCanvas;
}

export function videoCrop(sc, t, sw, sh) {
  const p = sc.end > sc.start ? clamp((t - sc.start) / (sc.end - sc.start)) : 0;
  const [z0, z1] = sc.zoom || [1, 1];
  const z = z0 + (z1 - z0) * easeInOut(p);
  const cover = Math.max(BOX.w / sw, BOX.h / sh);
  const s = cover * z;
  const vw = BOX.w / s, vh = BOX.h / s;
  const [fx, fy] = sc.focus || [0.5, 0.5];
  const cx = clamp(fx * sw, vw / 2, sw - vw / 2);
  const cy = clamp(fy * sh, vh / 2, sh - vh / 2);
  return { sx: cx - vw / 2, sy: cy - vh / 2, vw, vh, z };
}

/**
 * Draw the frame at timeline time t.
 * src: an HTMLVideoElement (preview) or an image (export) showing the source
 *      frame for srcTimeAt(p, t).
 * Returns the hit boxes of the visible text layers.
 */
export function drawFrame(ctx, p, t, src, opts = {}) {
  ctx.save();
  ctx.fillStyle = '#0e0e14';
  ctx.fillRect(0, 0, W, H);
  const sw = src && (src.videoWidth || src.naturalWidth || src.width);
  const sh = src && (src.videoHeight || src.naturalHeight || src.height);
  if (sw && sh) {
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(blurred(src, sw, sh), 0, 0, W, H);
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, 'rgba(10,10,16,.55)');
    g.addColorStop(0.5, 'rgba(10,10,16,.25)');
    g.addColorStop(1, 'rgba(10,10,16,.7)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    const sc = sceneAt(p, t);
    const c = videoCrop(sc, t, sw, sh);
    ctx.shadowColor = 'rgba(0,0,0,.45)';
    ctx.shadowBlur = 40;
    ctx.drawImage(src, c.sx, c.sy, c.vw, c.vh, BOX.x, BOX.y, BOX.w, BOX.h);
    ctx.shadowBlur = 0;
  }
  const boxes = [];
  for (const l of activeLayers(p, t)) boxes.push(drawText(ctx, l, t));
  if (opts.safe) drawSafe(ctx);
  ctx.restore();
  return boxes;
}

// Areas covered by TikTok / Reels UI (top bar, right buttons, caption area).
export const SAFE = { top: 0.075, bottom: 0.8, right: 0.86, rightFrom: 0.42 };
function drawSafe(ctx) {
  ctx.save();
  ctx.fillStyle = 'rgba(255,60,90,.22)';
  ctx.fillRect(0, 0, W, H * SAFE.top);
  ctx.fillRect(0, H * SAFE.bottom, W, H * (1 - SAFE.bottom));
  ctx.fillRect(W * SAFE.right, H * SAFE.rightFrom, W * (1 - SAFE.right), H * (SAFE.bottom - SAFE.rightFrom));
  ctx.setLineDash([18, 12]);
  ctx.lineWidth = 4;
  ctx.strokeStyle = 'rgba(255,90,120,.9)';
  ctx.strokeRect(36, H * SAFE.top, W * SAFE.right - 36, H * (SAFE.bottom - SAFE.top));
  ctx.restore();
}

export async function loadFonts() {
  if (typeof document === 'undefined' || !document.fonts) return;
  await Promise.all([500, 700, 800, 900].map((w) => document.fonts.load(`${w} 40px "Be Vietnam Pro"`, 'Tiếng Việt ABC')));
}
