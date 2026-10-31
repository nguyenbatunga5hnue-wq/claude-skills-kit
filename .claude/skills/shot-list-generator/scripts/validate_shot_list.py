#!/usr/bin/env python3
"""Validate a shot-list CSV produced by the shot-list-generator skill.

Checks the header, timecode format and contiguity, duration math, total runtime
against a target, controlled vocabulary, empty cells, NFC normalization and
same-size jump cuts. Optionally prints a shooting schedule grouped by location.

Usage:
  validate_shot_list.py shot-list.csv [--fps 25] [--target 00:03:00] [--tolerance 0.05] [--schedule]

Exit code: 0 = no errors (warnings allowed), 1 = errors found, 2 = unreadable input.
"""
import argparse
import csv
import re
import sys
import unicodedata
from collections import OrderedDict

HEADER = ["shot_id", "scene", "tc_in", "tc_out", "duration_s", "description",
          "shot_size", "angle", "movement", "lens_mm", "composition", "lighting",
          "sound", "location", "cast", "props_wardrobe", "vfx_graphics",
          "continuity", "notes"]
SHOT_SIZES = {"ews", "ws", "fs", "mws", "ms", "mcu", "cu", "ecu", "insert",
              "ots", "pov", "2s", "group"}
ANGLES = {"eye-level", "high", "low", "overhead", "worm", "dutch", "profile",
          "three-quarter"}
MOVEMENTS = {"static", "pan", "tilt", "dolly-in", "dolly-out", "track", "truck",
             "crane", "handheld", "steadicam/gimbal", "steadicam", "gimbal",
             "zoom", "rack-focus", "push-in", "push-in (photo)", "drone"}
TC_RE = re.compile(r"^(\d{2}):(\d{2}):(\d{2}):(\d{2})$")
ID_RE = re.compile(r"^S\d{2}-\d{2}[A-Z]?$")


def tc_to_frames(tc, fps):
    m = TC_RE.match(tc.strip())
    if not m:
        raise ValueError(f"bad timecode '{tc}' (expected HH:MM:SS:FF)")
    h, mi, s, f = map(int, m.groups())
    if f >= fps or mi >= 60 or s >= 60:
        raise ValueError(f"timecode '{tc}' out of range at {fps} fps")
    return ((h * 60 + mi) * 60 + s) * fps + f


def frames_to_tc(n, fps):
    f = n % fps
    s = n // fps
    return f"{s // 3600:02d}:{s // 60 % 60:02d}:{s % 60:02d}:{f:02d}"


def parse_target(t):
    parts = [float(p) for p in t.split(":")]
    secs = 0.0
    for p in parts:
        secs = secs * 60 + p
    return secs


def split_terms(value):
    return [t.strip().lower() for t in re.split(r"[+;,]| and ", value) if t.strip()]


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("csv")
    ap.add_argument("--fps", type=int, default=25)
    ap.add_argument("--target", help="target runtime, e.g. 00:03:00 or 180")
    ap.add_argument("--tolerance", type=float, default=0.05)
    ap.add_argument("--schedule", action="store_true", help="print shots grouped by location")
    a = ap.parse_args()

    errors, warnings = [], []
    try:
        with open(a.csv, encoding="utf-8") as fh:
            raw = fh.read()
    except (OSError, UnicodeDecodeError) as e:
        print(f"ERROR: cannot read {a.csv} as UTF-8: {e}")
        return 2
    if raw.startswith("﻿"):
        warnings.append("file has a UTF-8 BOM; save without BOM")
        raw = raw[1:]
    if unicodedata.normalize("NFC", raw) != raw:
        errors.append("text is not NFC-normalized (decomposed Vietnamese diacritics render badly)")
        raw = unicodedata.normalize("NFC", raw)

    rows = list(csv.reader(raw.splitlines()))
    if not rows:
        print("ERROR: empty file")
        return 1
    header = [h.strip() for h in rows[0]]
    if header != HEADER:
        missing = [h for h in HEADER if h not in header]
        extra = [h for h in header if h not in HEADER]
        errors.append(f"header mismatch; missing={missing} extra={extra} (order must match schema)")
        if missing:
            for e in errors:
                print("ERROR:", e)
            return 1
    data = [dict(zip(header, r)) for r in rows[1:] if any(c.strip() for c in r)]
    if not data:
        errors.append("no shot rows")

    prev_out = 0
    prev = None
    seen_ids = set()
    total_frames = 0
    for i, r in enumerate(data, start=2):
        sid = r.get("shot_id", "").strip() or f"line {i}"
        where = f"{sid} (line {i})"
        if len(r) != len(HEADER):
            errors.append(f"{where}: {len(r)} columns, expected {len(HEADER)} (unquoted comma?)")
            continue
        for col in HEADER:
            if not r[col].strip():
                warnings.append(f"{where}: empty '{col}' (use '-' if not applicable)")
        if not ID_RE.match(sid):
            warnings.append(f"{where}: shot_id should look like S03-04 or S03-04A")
        if sid in seen_ids:
            errors.append(f"{where}: duplicate shot_id")
        seen_ids.add(sid)
        try:
            fin = tc_to_frames(r["tc_in"], a.fps)
            fout = tc_to_frames(r["tc_out"], a.fps)
        except ValueError as e:
            errors.append(f"{where}: {e}")
            continue
        if fout <= fin:
            errors.append(f"{where}: tc_out must be after tc_in")
        if fin != prev_out:
            gap = (fin - prev_out) / a.fps
            kind = "gap" if gap > 0 else "overlap"
            errors.append(f"{where}: tc_in {r['tc_in']} leaves a {kind} of {abs(gap):.2f}s "
                          f"(expected {frames_to_tc(prev_out, a.fps)})")
        try:
            dur = float(r["duration_s"])
            actual = (fout - fin) / a.fps
            if abs(dur - actual) > 1.0 / a.fps + 1e-6:
                errors.append(f"{where}: duration_s {dur} != tc_out-tc_in {actual:.2f}")
        except ValueError:
            errors.append(f"{where}: duration_s '{r['duration_s']}' is not a number")
        size = r["shot_size"].strip().lower()
        if size and size != "-" and not set(split_terms(size)) <= SHOT_SIZES:
            warnings.append(f"{where}: shot_size '{r['shot_size']}' not in controlled vocabulary")
        ang = r["angle"].strip().lower()
        if ang and ang != "-" and not set(split_terms(ang)) <= ANGLES:
            warnings.append(f"{where}: angle '{r['angle']}' not in controlled vocabulary")
        mov = r["movement"].strip().lower()
        if mov and mov != "-" and not set(split_terms(mov)) <= MOVEMENTS:
            warnings.append(f"{where}: movement '{r['movement']}' not in controlled vocabulary")
        if prev and prev["scene"] == r["scene"] and prev["shot_size"].strip().lower() == size \
                and prev["cast"].strip() and prev["cast"].strip() == r["cast"].strip() and size not in ("insert", "-"):
            warnings.append(f"{where}: same size ({size}) and cast as previous shot (possible jump cut)")
        if re.search(r"\b(minor|học sinh|students?|children|trẻ em)\b", r["cast"], re.I) \
                and not re.search(r"consent|đồng ý", r["notes"], re.I):
            warnings.append(f"{where}: cast may include minors but notes have no consent mention")
        prev_out = fout
        total_frames = fout
        prev = r

    total = total_frames / a.fps
    scenes = OrderedDict()
    for r in data:
        if len(r) == len(HEADER):
            scenes.setdefault(r["scene"], 0.0)
            try:
                scenes[r["scene"]] += float(r["duration_s"])
            except ValueError:
                pass
    if a.target:
        target = parse_target(a.target)
        if target > 0 and abs(total - target) / target > a.tolerance:
            errors.append(f"total runtime {total:.2f}s is outside ±{a.tolerance:.0%} of target {target:.2f}s")

    print(f"Shots: {len(data)} · Scenes: {len(scenes)} · Runtime: {frames_to_tc(total_frames, a.fps)} "
          f"({total:.2f}s @ {a.fps} fps)" + (f" · Target: {a.target}" if a.target else ""))
    for sc, d in scenes.items():
        print(f"  scene {sc}: {d:.2f}s")
    for e in errors:
        print("ERROR:", e)
    for w in warnings:
        print("WARN: ", w)
    print(f"Result: {len(errors)} error(s), {len(warnings)} warning(s)")

    if a.schedule:
        by_loc = OrderedDict()
        for r in data:
            if len(r) == len(HEADER):
                by_loc.setdefault(r["location"].strip() or "(no location)", []).append(r)
        print("\nShooting schedule (grouped by location, story order within each):")
        for loc, shots in by_loc.items():
            cast = sorted({c.strip() for r in shots for c in r["cast"].split(";") if c.strip() and c.strip() != "-"})
            print(f"\n## {loc} — {len(shots)} shot(s); cast: {', '.join(cast) or '-'}")
            for r in shots:
                print(f"  {r['shot_id']:<8} {r['shot_size']:<7} {r['movement']:<14} {r['lighting'][:40]}")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
