#!/usr/bin/env python3
"""Build the teacher-controlled IELTS Listening review deck.

    python3 build_deck.py --data examples/cam19_test3.py --transcript work/tr.jsonl \
        --audio test.mp3 --duration 1645.9 --out deck/index.html

--data        a Python file with the test content (see examples/cam19_test3.py)
--transcript  JSON lines from transcribe.py ({"s","e","t"} per speech segment)
--audio       file name the page plays (published next to the page)
--duration    audio length in seconds (ffprobe), for the seek bar before metadata loads

Every script line in the data is located in the transcript (fuzzy word match, in audio
order), so clip buttons and subtitles follow the real recording. Lines that match badly
are listed at the end: check them (check_window.py) and fix the wording in the data.
"""
import argparse, html, importlib.util, json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ASSETS = os.path.join(HERE, '..', 'assets')

ap = argparse.ArgumentParser()
ap.add_argument('--data', required=True)
ap.add_argument('--transcript', required=True)
ap.add_argument('--audio', required=True)
ap.add_argument('--duration', type=float, required=True)
ap.add_argument('--out', required=True)
a = ap.parse_args()

spec = importlib.util.spec_from_file_location('testdata', a.data)
T = importlib.util.module_from_spec(spec); spec.loader.exec_module(T)

# ---------------- transcript word stream ----------------
W = []
for line in open(a.transcript):
    s = json.loads(line)
    ws = re.findall(r"[a-z0-9]+", s['t'].lower().replace('’', "'").replace("'", ''))
    n = max(1, len(ws))
    for i, w in enumerate(ws):
        W.append((w, s['s'] + (s['e'] - s['s']) * i / n, s['s'] + (s['e'] - s['s']) * (i + 1) / n))
if not W:
    sys.exit('empty transcript')

BRIT = {'harbour': 'harbor', 'colour': 'color', 'colourful': 'colorful', 'favourite': 'favorite', 'organised': 'organized',
        'summarise': 'summarize', 'fertilisers': 'fertilizers', 'microfibres': 'microfibers', 'fibres': 'fibers', 'colouring': 'coloring', 'fulfil': 'fulfill', 'centre': 'center'}
def norm(text):
    t = re.sub(r'\[\[([^\]|]+)[^\]]*\]\]', r' \1 ', text)
    t = re.sub(r'<span class="tag[^"]*">.*?</span>', ' ', t)
    t = re.sub(r'<[^>]+>', ' ', t).lower().replace('’', "'").replace("'", '')
    return [BRIT.get(w, w) for w in re.findall(r"[a-z0-9]+", t)]

def find(q, lo, hi):
    best, bi = -1, lo
    for j in range(lo, max(lo + 1, min(hi, len(W) - 1))):
        sc = sum(1 for x, y in zip(q, W[j:j + len(q)]) if x == y[0])
        if sc > best:
            best, bi = sc, j
    return bi, best / max(1, len(q))

LOW = []
cursor = 0
def align(lines):
    """lines: [(speaker, html)] -> [(speaker, html, start, end)]; advances the global cursor"""
    global cursor
    out, pos = [], cursor
    for sp, h in lines:
        ws = norm(h)
        i, s1 = find(ws[:5], pos, pos + 1500)
        tail = ws[-5:]
        j, s2 = find(tail, i, i + len(ws) + 25)
        end = W[min(len(W) - 1, j + len(tail) - 1)][2]
        if min(s1, s2) < 0.6:
            LOW.append((round(W[i][1], 1), round(min(s1, s2), 2), re.sub('<[^>]+>', '', h)[:80]))
        out.append((sp, h, W[i][1], end))
        pos = i
    cursor = next((k for k, w in enumerate(W) if w[1] >= out[0][2]), cursor)
    return out

def fmt(t):
    return f'{int(t // 60)}:{int(t % 60):02d}'

def subs(L, cls='subs'):
    end = max(e for *_, e in L)
    rows = ''.join(f'<div class="ln" data-t="{t:.2f}"><span class="sp">{sp}</span><span>{gapify(h)}</span></div>' for sp, h, t, e in L)
    return f'<div class="{cls}" data-end="{end:.2f}">{rows}</div>', L[0][2], end

def gapify(h):
    """[[word|alt]] -> input box (matching slides)"""
    return re.sub(r'\[\[([^\]]+)\]\]', lambda m: f'<input aria-label="từ khuyết" data-a="{html.escape(m.group(1))}">', h)

ERRC = '<span class="errc" title="Số bạn làm sai"><button data-act="err-" aria-label="Bớt 1">−</button><span class="num">0</span><button data-act="err+" aria-label="Thêm 1">+</button>sai</span>'
KEY = {}  # part -> [(n, answer)]

def gap_slide(g):
    rows, first, last = '', None, None
    for q in g['qs']:
        L = align(q['lines'])
        sub, t0, t1 = subs(L)
        c0, c1 = max(0, t0 - 0.6), t1 + 0.8
        first = c0 if first is None else min(first, c0); last = c1 if last is None else max(last, c1)
        trap = f'<div class="trapnote">⚠ {q["trap"]}</div>' if q.get('trap') else ''
        ans = q['ans'] + (' / ' + q['alt'].split('|')[0] if q.get('alt') else '')
        KEY.setdefault(g['part'], []).append((q['n'], q['ans']))
        rows += f'''<div class="qrow" data-id="{q['n']}">
 <div class="qline"><span class="qn">{q['n']}</span>
  <div class="qtext">{q['pre']} <button class="gapbtn" data-act="ans" aria-label="Đáp án câu {q['n']}"><span class="qm">{q['n']}</span><span class="an">{ans}</span></button> {q.get('post','')}</div>
  <div class="qctl"><button class="b sm" data-act="clip" data-from="{c0:.2f}" data-to="{c1:.2f}" data-label="Câu {q['n']}">▶ Câu {q['n']}</button><button class="b sm" data-act="cc">CC phụ đề</button><button class="b sm" data-act="clue">Clue</button><button class="b sm" data-act="ans">Đáp án</button><button class="b sm" data-act="note" aria-label="Ghi lỗi">✎</button>{ERRC}</div></div>
 <div class="drawer clued"><div class="cluebox">🔎 Clue: {q['clue']}</div></div>
 <div class="drawer ccd">{sub}{trap}</div>
 <div class="drawer noted"><textarea class="notein" placeholder="Lỗi lớp hay sai ở câu {q['n']}…" aria-label="Ghi chú lỗi câu {q['n']}"></textarea></div>
</div>'''
    n0, n1 = g['qs'][0]['n'], g['qs'][-1]['n']
    return f'''<section class="slide" data-title="{g['part']} · Q{n0}–{n1}">
 <div class="hdr"><h2>{g['part']} · {g['title']}</h2>
  <div class="tools"><button class="b pri" data-act="clip" data-from="{first:.2f}" data-to="{last:.2f}" data-label="Cả đoạn">▶ Cả đoạn Q{n0}–{n1}</button><button class="b" data-act="all-ans">Hiện tất cả đáp án</button></div></div>
 <div class="qlist">{rows}</div>
</section>'''

def mcq_slide(g):
    tabs, panes = '', ''
    for k, q in enumerate(g['qs']):
        pid = f"{g['id']}-{k}"
        L = align(q['lines'])
        sub, t0, t1 = subs(L, 'subs ccbox')
        c0, c1 = max(0, t0 - 0.6), t1 + 0.8
        opts = ''
        for (Lt, tx, ok, order, li, quote, why) in q['opts']:
            tt = f' data-t="{L[li][2]:.2f}"' if li is not None else ''
            tm = f'<i>{fmt(L[li][2])}</i>' if li is not None else ''
            qt = f'“{quote}”{tm}' if quote else 'Không được nhắc đến'
            opts += (f'<div class="opt {"ok" if ok else "no"}{"" if order else " none"}" data-ord="{order}"{tt}><span class="L">{Lt}</span>'
                     f'<div class="tx"><span class="t0">{tx}</span><div class="q">{qt}</div><div class="why">{"✓ " if ok else "✗ "}{why}</div></div>'
                     f'<span class="badge">{order or "–"}</span></div>')
        KEY.setdefault(g['part'], []).append((q['n'], ', '.join(o[0] for o in q['opts'] if o[2])))
        tabs += f'<button data-act="tab" data-for="{pid}" class="{"on" if k == 0 else ""}">{q["n"]}<span class="e"></span></button>'
        panes += f'''<div class="mq{" on" if k == 0 else ""}" id="{pid}" data-id="{q['n']}">
 <div class="mqtop"><div class="col" style="gap:.6cqi"><div class="stem">{q['n']}. {q['stem']}</div><div class="cluenote">🔎 Clue: {q['cluenote']}</div></div>
  <div class="mqctl" style="justify-content:flex-end;max-width:34cqi"><button class="b pri" data-act="clip" data-from="{c0:.2f}" data-to="{c1:.2f}" data-label="Câu {q['n']}">▶ Nghe câu {q['n']}</button><button class="b" data-act="clue">Clue</button><button class="b" data-act="cc">CC phụ đề</button></div></div>
 <div class="mqctl"><span class="lbl2">Thứ tự được nhắc:</span><button class="b sm" data-act="ord">Đánh số tiếp ▸</button><button class="b sm" data-act="ord-auto">Tự đánh số khi phát</button><button class="b sm" data-act="ord-reset">Xoá số</button><span style="flex:1"></span><button class="b sm" data-act="ans">Đáp án</button><button class="b sm" data-act="note">✎ Ghi lỗi</button>{ERRC}</div>
 <div class="drawer noted" style="margin-left:0"><textarea class="notein" placeholder="Lớp hay chọn sai đáp án nào? Vì sao?" aria-label="Ghi chú lỗi câu {q['n']}"></textarea></div>
 <div class="mqbody"><div class="opts">{opts}</div>{sub}</div>
</div>'''
    return f'''<section class="slide" data-title="{g['part']} · {g['short']}">
 <div class="hdr"><h2>{g['part']} · {g['title']}</h2><div class="tabs">{tabs}</div></div>
 {panes}
</section>'''

def match_slide(g):
    L = align(g['lines'])
    sub, t0, t1 = subs(L, 'script gf')
    sub = sub.replace(f'data-end="{t1:.2f}"', f'data-end="{t1 + 2:.2f}"')
    box = ''.join(f'<b>{l}</b><span>{t}</span>' for l, t in g['box'])
    if g.get('kind') == 'flow':
        steps = '<div style="text-align:center;color:var(--ink-2)">↓</div>'.join(
            f'<div>{pre} <span class="gap"><span class="n">{n}</span><span class="ga">{ans} · {word}</span></span> {post}</div>'
            for n, pre, post, ans, word in g['items'])
        left = f'<div class="boxlist" style="grid-template-columns:auto 1fr auto 1fr">{box}</div>{steps}' if len(g['box']) > 6 else f'<div class="boxlist">{box}</div>{steps}'
        for n, pre, post, ans, word in g['items']:
            KEY.setdefault(g['part'], []).append((n, ans))
    else:
        items = ''.join(f'<span class="mq2">{n}</span><span>{name}</span><span class="ma">{ans}</span>' for n, name, ans in g['items'])
        left = f'<div class="grp">{g.get("question", "")}</div><div class="boxlist">{box}</div><div class="match">{items}</div>'
        for n, name, ans in g['items']:
            KEY.setdefault(g['part'], []).append((n, ans))
    n0, n1 = g['items'][0][0], g['items'][-1][0]
    return f'''<section class="slide hideScript" data-title="{g['part']} · Q{n0}–{n1}">
 <div class="hdr"><h2>{g['part']} · {g['title']}</h2>
  <div class="tools"><button class="b pri" data-act="clip" data-from="{max(0, t0 - 3):.2f}" data-to="{t1 + 2:.2f}" data-label="Cả đoạn">▶ Phát Q{n0}–{n1}</button><button class="b" data-act="round1">Lần 1: ẩn script</button><button class="b" data-act="round2">Lần 2: script khuyết</button><button class="b" data-act="check">Chấm</button><button class="b" data-act="fill">Điền hết</button><button class="b" data-act="reveal">Hiện đáp án</button></div></div>
 <div class="split">
  <div class="panel qbox" style="gap:.8cqi">{left}</div>
  <div class="panel"><div class="round"><div class="num">Lần 1</div><p style="font-size:1.5cqi;max-width:46cqi">{g.get('round1', 'Chỉ nghe, ghi 1–2 từ khoá cho mỗi câu. Xong bấm <b>Lần 2: script khuyết</b>.')}</p></div>{sub}</div>
 </div>
</section>'''

def title_slide(t):
    return f'<section class="slide dark" data-title="{re.sub("<[^>]+>", " ", t)}" style="justify-content:center"><h1>{t}</h1></section>\n'

# ---------------- slides in audio order ----------------
G = {g['id']: g for g in getattr(T, 'GAP_GROUPS', [])}
M = {g['id']: g for g in getattr(T, 'MCQ_GROUPS', [])}
X = {g['id']: g for g in getattr(T, 'MATCH_GROUPS', [])}
H = getattr(T, 'EXTRA_HTML', {})
body = ''
for kind, ref in T.SEQUENCE:
    if kind == 'title': body += title_slide(ref)
    elif kind == 'gap': body += gap_slide(G[ref])
    elif kind == 'mcq': body += mcq_slide(M[ref])
    elif kind == 'match': body += match_slide(X[ref])
    elif kind == 'html': body += H[ref]
    else: sys.exit('unknown block ' + kind)

body += '''<section class="slide" id="sErr" data-title="Lỗi sai của lớp">
 <div class="hdr"><h2>Lỗi sai của lớp hôm nay</h2><div class="tools"><button class="b sm" data-act="err-clear">Xoá số đếm</button></div></div>
 <div class="errsum" id="errsum"></div>
</section>'''
cols = ''.join(f'<div class="col grow panel" style="gap:.3cqi"><h3>{p}</h3>' + ''.join(f'<span>{n} {html.escape(str(v))}</span>' for n, v in KEY[p]) + '</div>' for p in KEY)
body += f'''<section class="slide" data-title="Đáp án">
 <div class="hdr"><h2>Đáp án · {T.META['title']}</h2></div>
 <div class="row grow" style="gap:1.4cqi;font-size:1.3cqi">{cols}</div>
</section>'''
if getattr(T, 'HOMEWORK', None):
    cards = ''.join(f'<div class="c in"><span class="pill" style="background:{c};color:#fff;align-self:flex-start">{tag}</span><h3>{h}</h3><p>{p}</p></div>' for tag, c, h, p in T.HOMEWORK)
    body += f'<section class="slide dark" data-title="Bài tập về nhà"><div class="hdr"><h2>Bài tập về nhà</h2></div><div class="stuck grow" style="color:var(--ink)">{cards}</div></section>'

def rd(n): return open(os.path.join(ASSETS, n)).read()
d = a.duration
theory = (rd('theory.html').replace('{{COVER}}', title_slide(T.META['cover']))
          .replace('{{AUDIO}}', a.audio).replace('{{DUR}}', f'{d:.1f}').replace('{{DURTXT}}', fmt(d)))
page = (rd('head.html').replace('{{TITLE}}', html.escape(T.META['title'])) + theory + body
        + rd('tail.html').replace('{{PYR_EX}}', json.dumps(T.PYR_EX, ensure_ascii=False)))
os.makedirs(os.path.dirname(os.path.abspath(a.out)), exist_ok=True)
open(a.out, 'w').write(page)
print(f'{page.count("<section")} slides -> {a.out}')
print(f'low-confidence lines: {len(LOW)}')
for x in LOW:
    print('  ', x)
