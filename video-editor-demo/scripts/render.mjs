// Export project.json to MP4: Playwright draws every frame with the same
// renderer as the editor, ffmpeg encodes them and re-cuts the audio per scene.
//   node scripts/render.mjs [--out out/video.mp4] [--server http://127.0.0.1:4321]
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = Object.fromEntries(process.argv.slice(2).reduce((a, v, i, arr) => (v.startsWith('--') ? [...a, [v.slice(2), arr[i + 1]]] : a), []));
const out = path.resolve(args.out || path.join(ROOT, 'out', 'video.mp4'));
const server = args.server || 'http://127.0.0.1:4321';
const WORKERS = Number(args.workers || 4);

// Playwright is installed globally in this environment; fall back to local.
const require = createRequire(import.meta.url);
let playwright;
try { playwright = require('playwright'); } catch { playwright = require(require.resolve('playwright', { paths: ['/usr/local/lib/node_modules', '/usr/lib/node_modules', '/opt/node22/lib/node_modules'] })); }

const project = JSON.parse(fs.readFileSync(path.join(ROOT, 'project.json'), 'utf8'));
const fps = project.output?.fps || 30;
const frameCount = fs.readdirSync(path.join(ROOT, 'media/frames')).filter((f) => f.endsWith('.jpg')).length;
const dur = project.scenes[project.scenes.length - 1].end;
const total = Math.round(dur * fps);

// Audio: take each scene's source range in order, so cuts/trim stay in sync.
const parts = project.scenes.map((s, i) => `[1:a]atrim=start=${s.srcIn.toFixed(3)}:end=${(s.srcIn + s.end - s.start).toFixed(3)},asetpts=PTS-STARTPTS[a${i}]`);
const filter = `${parts.join(';')};${project.scenes.map((_, i) => `[a${i}]`).join('')}concat=n=${project.scenes.length}:v=0:a=1,loudnorm=I=-16:TP=-1.5:LRA=11,afade=t=out:st=${Math.max(0, dur - 0.6).toFixed(2)}:d=0.6,aresample=48000[aout]`;

fs.mkdirSync(path.dirname(out), { recursive: true });
const ff = spawn('ffmpeg', [
  '-v', 'error', '-y',
  '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-',
  '-i', path.join(ROOT, project.source.file),
  '-filter_complex', filter, '-map', '0:v', '-map', '[aout]',
  '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-pix_fmt', 'yuv420p',
  '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', '-shortest', out,
], { stdio: ['pipe', 'inherit', 'inherit'] });
const ffDone = new Promise((ok, bad) => ff.on('close', (c) => (c === 0 ? ok() : bad(new Error(`ffmpeg exited ${c}`)))));

const browser = await playwright.chromium.launch();
try {
  const pages = await Promise.all(Array.from({ length: WORKERS }, async () => {
    const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
    await page.goto(`${server}/export.html`);
    await page.evaluate((n) => window.setup(n), frameCount);
    return page;
  }));

  // Workers render ahead in parallel; frames are written strictly in order.
  const pending = new Map();
  let next = 0, written = 0;
  const startT = Date.now();
  const render = (i) => pages[i % WORKERS].evaluate((t) => window.renderAt(t), i / fps)
    .then((url) => Buffer.from(url.slice(url.indexOf(',') + 1), 'base64'));
  while (written < total) {
    while (next < total && next < written + WORKERS * 3) { pending.set(next, render(next)); next++; }
    const buf = await pending.get(written);
    pending.delete(written);
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
    written++;
    if (written % 15 === 0 || written === total) console.log(`PROGRESS ${written}/${total}`);
  }
  ff.stdin.end();
  await ffDone;
  console.log(`DONE ${out} in ${((Date.now() - startT) / 1000).toFixed(1)}s`);
} finally {
  await browser.close();
}
