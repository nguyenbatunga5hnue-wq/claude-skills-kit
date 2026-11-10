// Tiny dev server for the editor: static files, project load/save with history
// snapshots, and MP4 export. No dependencies beyond Node itself.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 4321);
const HOST = process.env.HOST || '127.0.0.1'; // local only by default
const PROJECT = path.join(ROOT, 'project.json');
const HISTORY = path.join(ROOT, 'history');
const OUT = path.join(ROOT, 'out');
fs.mkdirSync(HISTORY, { recursive: true });
fs.mkdirSync(OUT, { recursive: true });

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.woff2': 'font/woff2', '.jpg': 'image/jpeg', '.png': 'image/png',
  '.mp4': 'video/mp4', '.webm': 'video/webm', '.mov': 'video/quicktime', '.svg': 'image/svg+xml',
};

let exportJob = { state: 'idle', done: 0, total: 0, file: null, error: null };

function send(res, code, body, type = 'application/json; charset=utf-8') {
  res.writeHead(code, { 'content-type': type, 'cache-control': 'no-store' });
  res.end(typeof body === 'string' || Buffer.isBuffer(body) ? body : JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

function stamp() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
}

// Serve a file with HTTP range support (needed for <video> seeking).
function serveFile(req, res, file) {
  fs.stat(file, (err, st) => {
    if (err || !st.isFile()) return send(res, 404, { error: 'not found' });
    const type = TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream';
    const range = req.headers.range;
    if (range) {
      const m = /^bytes=(\d*)-(\d*)$/.exec(range);
      const start = m && m[1] ? Number(m[1]) : 0;
      const end = Math.min(m && m[2] ? Number(m[2]) : st.size - 1, st.size - 1);
      if (!m || start > end) { res.writeHead(416, { 'content-range': `bytes */${st.size}` }); return res.end(); }
      res.writeHead(206, {
        'content-type': type, 'accept-ranges': 'bytes', 'content-length': end - start + 1,
        'content-range': `bytes ${start}-${end}/${st.size}`,
      });
      fs.createReadStream(file, { start, end }).pipe(res);
    } else {
      res.writeHead(200, { 'content-type': type, 'content-length': st.size, 'accept-ranges': 'bytes', 'cache-control': 'no-cache' });
      fs.createReadStream(file).pipe(res);
    }
  });
}

function safeJoin(base, rel) {
  const p = path.normalize(path.join(base, rel));
  return p === base || p.startsWith(base + path.sep) ? p : null;
}

function startExport() {
  if (exportJob.state === 'running') return;
  const name = `video-${stamp()}.mp4`;
  exportJob = { state: 'running', done: 0, total: 0, file: null, error: null };
  const child = spawn(process.execPath, [path.join(ROOT, 'scripts/render.mjs'), '--out', path.join(OUT, name), '--server', `http://127.0.0.1:${PORT}`], { cwd: ROOT });
  let log = '';
  const onData = (d) => {
    const s = d.toString();
    log = (log + s).slice(-4000);
    for (const m of s.matchAll(/PROGRESS (\d+)\/(\d+)/g)) { exportJob.done = +m[1]; exportJob.total = +m[2]; }
  };
  child.stdout.on('data', onData);
  child.stderr.on('data', onData);
  child.on('close', (code) => {
    if (code === 0) exportJob = { ...exportJob, state: 'done', file: `/out/${name}` };
    else exportJob = { ...exportJob, state: 'error', error: log.split('\n').slice(-8).join('\n') };
  });
}

// Reject cross-site writes (a page on another origin POSTing to localhost).
function sameOrigin(req) {
  const o = req.headers.origin;
  if (!o) return true;
  try { return new URL(o).host === req.headers.host; } catch { return false; }
}
const ID = /^[A-Za-z0-9_-]{1,40}$/;
function validProject(d) {
  const fin = (v) => typeof v === 'number' && Number.isFinite(v);
  if (!d || !Array.isArray(d.scenes) || !Array.isArray(d.layers) || !d.scenes.length) return false;
  if (!d.source || typeof d.source.file !== 'string' || !/^media\/[A-Za-z0-9._-]+$/.test(d.source.file)) return false;
  const sceneOk = (s) => ID.test(s.id) && [s.start, s.end, s.srcIn].every(fin) && Array.isArray(s.zoom) && s.zoom.every(fin) && Array.isArray(s.focus) && s.focus.every(fin);
  const layerOk = (l) => ID.test(l.id) && ID.test(l.track) && ID.test(l.style) && ID.test(l.anim) && typeof l.text === 'string' && [l.start, l.end, l.x, l.y, l.size].every(fin);
  return d.scenes.every(sceneOk) && d.layers.every(layerOk);
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  let p;
  try { p = decodeURIComponent(url.pathname); } catch { return send(res, 400, { error: 'bad path' }); }
  if (req.method !== 'GET' && req.method !== 'HEAD' && !sameOrigin(req)) return send(res, 403, { error: 'cross-origin' });
  try {
    if (p === '/api/project' && req.method === 'GET') {
      const st = fs.statSync(PROJECT);
      res.setHeader('x-version', String(st.mtimeMs));
      return send(res, 200, fs.readFileSync(PROJECT, 'utf8'));
    }
    if (p === '/api/project/version') return send(res, 200, { version: String(fs.statSync(PROJECT).mtimeMs) });
    if (p === '/api/project' && req.method === 'PUT') {
      const body = await readBody(req);
      const data = JSON.parse(body); // validate
      if (!validProject(data)) return send(res, 400, { error: 'bad project' });
      const text = JSON.stringify(data, null, 2) + '\n';
      fs.writeFileSync(path.join(HISTORY, `${stamp()}.json`), fs.readFileSync(PROJECT)); // keep previous version
      fs.writeFileSync(PROJECT, text);
      return send(res, 200, { ok: true, version: String(fs.statSync(PROJECT).mtimeMs) });
    }
    if (p === '/api/history') {
      const items = fs.readdirSync(HISTORY).filter((f) => f.endsWith('.json')).sort().reverse().slice(0, 50);
      return send(res, 200, items);
    }
    if (p.startsWith('/api/history/')) {
      const f = safeJoin(HISTORY, p.slice('/api/history/'.length));
      if (!f || !fs.existsSync(f)) return send(res, 404, { error: 'not found' });
      return send(res, 200, fs.readFileSync(f, 'utf8'));
    }
    if (p === '/api/export' && req.method === 'POST') { startExport(); return send(res, 200, exportJob); }
    if (p === '/api/export') return send(res, 200, exportJob);

    if (p.startsWith('/media/')) { const f = safeJoin(path.join(ROOT, 'media'), p.slice(7)); return f ? serveFile(req, res, f) : send(res, 403, {}); }
    if (p.startsWith('/out/')) { const f = safeJoin(OUT, p.slice(5)); return f ? serveFile(req, res, f) : send(res, 403, {}); }
    const f = safeJoin(path.join(ROOT, 'public'), p === '/' ? 'index.html' : p.slice(1));
    return f ? serveFile(req, res, f) : send(res, 403, {});
  } catch (e) {
    return send(res, 500, { error: String(e.message || e) });
  }
});

server.listen(PORT, HOST, () => console.log(`Editor: http://localhost:${PORT}`));
