// Print every "Ghi chú cho Claude" left in the editor, with enough context to act on it.
//   node scripts/notes.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const P = JSON.parse(fs.readFileSync(path.join(ROOT, 'project.json'), 'utf8'));
const fmt = (s) => `${Math.floor(s / 60)}:${(s % 60).toFixed(2).padStart(5, '0')}`;

const notes = [];
if (P.note) notes.push({ where: 'Cả video', note: P.note });
for (const s of P.scenes) if (s.note) notes.push({ where: `Cảnh ${s.id} "${s.name}" ${fmt(s.start)}–${fmt(s.end)} zoom=${s.zoom} focus=${s.focus}`, note: s.note });
for (const l of P.layers) if (l.note) notes.push({ where: `${l.track} ${l.id} ${fmt(l.start)}–${fmt(l.end)} "${l.text.replace(/\n/g, ' / ')}" style=${l.style} size=${l.size} x=${l.x} y=${l.y}`, note: l.note });

if (!notes.length) console.log('Không có ghi chú nào.');
for (const n of notes) console.log(`• ${n.where}\n  → ${n.note}\n`);
const edited = [...P.scenes, ...P.layers].filter((o) => o.edited).map((o) => o.id);
if (edited.length) console.log(`Người dùng đã tự chỉnh: ${edited.join(', ')} (giữ nguyên các chỉnh sửa này).`);
