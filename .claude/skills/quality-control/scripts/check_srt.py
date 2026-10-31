#!/usr/bin/env python3
"""Check an SRT subtitle file for encoding, timing and readability problems.

Checks: UTF-8 decoding, BOM, NFC normalization (Vietnamese diacritics), cue
numbering, timestamp syntax, start < end, overlaps, minimum gap between cues,
duration limits, line count, characters per line, reading speed (CPS), empty
cues and cues past the end of the video.

Usage:
  check_srt.py subs/vi.srt [--fps 25] [--video-duration 180.0]
               [--max-cps 17] [--hard-cps 20] [--max-chars 42] [--max-lines 2]

Exit code: 0 = no errors, 1 = errors, 2 = unreadable file.
"""
import argparse
import re
import sys
import unicodedata

TS = r"(\d{2}):(\d{2}):(\d{2})[,.](\d{3})"
TIME_RE = re.compile(rf"^{TS}\s+-->\s+{TS}(\s+.*)?$")
TAG_RE = re.compile(r"<[^>]+>|\{[^}]+\}")


def to_s(h, m, s, ms):
    return int(h) * 3600 + int(m) * 60 + int(s) + int(ms) / 1000


def fmt(t):
    ms = round(t * 1000)
    return f"{ms // 3600000:02d}:{ms // 60000 % 60:02d}:{ms // 1000 % 60:02d},{ms % 1000:03d}"


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("srt")
    ap.add_argument("--fps", type=float, default=25)
    ap.add_argument("--video-duration", type=float)
    ap.add_argument("--max-cps", type=float, default=17)
    ap.add_argument("--hard-cps", type=float, default=20)
    ap.add_argument("--max-chars", type=int, default=42)
    ap.add_argument("--max-lines", type=int, default=2)
    ap.add_argument("--min-dur", type=float, default=5 / 6)
    ap.add_argument("--max-dur", type=float, default=7.0)
    a = ap.parse_args()

    errors, warnings = [], []
    try:
        data = open(a.srt, "rb").read()
    except OSError as e:
        print(f"ERROR: {e}")
        return 2
    try:
        text = data.decode("utf-8")
    except UnicodeDecodeError as e:
        print(f"ERROR: not valid UTF-8 ({e}); re-save the file as UTF-8")
        return 1
    if text.startswith("﻿"):
        warnings.append("UTF-8 BOM present (most players accept it; some burn-in tools show a stray character)")
        text = text[1:]
    if unicodedata.normalize("NFC", text) != text:
        bad = sum(1 for ch in text if unicodedata.combining(ch))
        errors.append(f"not NFC-normalized ({bad} combining marks); Vietnamese diacritics may render detached. "
                      "Fix: python3 -c \"import unicodedata,sys;p=sys.argv[1];s=open(p,encoding='utf-8').read();"
                      "open(p,'w',encoding='utf-8').write(unicodedata.normalize('NFC',s))\" <file>")
        text = unicodedata.normalize("NFC", text)

    blocks = [b for b in re.split(r"\r?\n\s*\r?\n", text.strip()) if b.strip()]
    cues = []
    for bi, b in enumerate(blocks, 1):
        lines = b.splitlines()
        if len(lines) < 2:
            errors.append(f"block {bi}: incomplete cue: {b!r:.60}")
            continue
        idx, timing, body = lines[0].strip(), lines[1].strip(), [l.rstrip() for l in lines[2:]]
        if not idx.isdigit():
            errors.append(f"block {bi}: cue number '{idx}' is not an integer")
        m = TIME_RE.match(timing)
        if not m:
            errors.append(f"cue {idx}: bad timing line '{timing}'")
            continue
        g = m.groups()
        start, end = to_s(*g[0:4]), to_s(*g[4:8])
        cues.append((idx, start, end, body))

    min_gap = 2 / a.fps
    prev = None
    total_chars = 0
    for n, (idx, start, end, body) in enumerate(cues, 1):
        where = f"cue {idx} [{fmt(start)}]"
        if idx.isdigit() and int(idx) != n:
            warnings.append(f"{where}: numbering out of sequence (expected {n})")
        if end <= start:
            errors.append(f"{where}: end {fmt(end)} is not after start")
            continue
        plain = [TAG_RE.sub("", l).strip() for l in body]
        plain = [l for l in plain if l]
        if not plain:
            errors.append(f"{where}: empty text")
            continue
        dur = end - start
        chars = sum(len(l) for l in plain)
        total_chars += chars
        cps = chars / dur
        if dur < a.min_dur:
            warnings.append(f"{where}: duration {dur:.2f}s < {a.min_dur:.2f}s")
        if dur > a.max_dur:
            warnings.append(f"{where}: duration {dur:.2f}s > {a.max_dur:.0f}s")
        if len(plain) > a.max_lines:
            errors.append(f"{where}: {len(plain)} lines (max {a.max_lines})")
        for l in plain:
            if len(l) > a.max_chars:
                warnings.append(f"{where}: line has {len(l)} chars (max {a.max_chars}): '{l[:50]}…'")
        if cps > a.hard_cps:
            errors.append(f"{where}: {cps:.1f} chars/s exceeds hard limit {a.hard_cps:.0f} — split or extend")
        elif cps > a.max_cps:
            warnings.append(f"{where}: {cps:.1f} chars/s exceeds {a.max_cps:.0f}")
        if prev:
            gap = start - prev[2]
            if gap < -1e-6:
                errors.append(f"{where}: overlaps previous cue by {-gap:.3f}s")
            elif 0 < gap < min_gap - 1e-6:
                warnings.append(f"{where}: gap {gap * 1000:.0f} ms < 2 frames; close the gap to 0 or widen it")
        if a.video_duration and end > a.video_duration + 0.04:
            errors.append(f"{where}: ends at {fmt(end)}, after the video ({a.video_duration:.2f}s)")
        prev = (idx, start, end)

    if cues:
        span = cues[-1][2] - cues[0][1]
        print(f"Cues: {len(cues)} · first {fmt(cues[0][1])} · last end {fmt(cues[-1][2])} · span {span:.1f}s · "
              f"{total_chars} chars")
    else:
        errors.append("no cues found")
    for e in errors:
        print("ERROR:", e)
    for w in warnings:
        print("WARN: ", w)
    print(f"Result: {len(errors)} error(s), {len(warnings)} warning(s)")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
