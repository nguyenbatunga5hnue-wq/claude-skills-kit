#!/usr/bin/env python3
"""Automated technical QC of a rendered video with ffprobe/ffmpeg.

Reports container/stream specs, integrated loudness, loudness range, true peak,
black segments, frozen segments and silences, and compares them with a delivery
profile (see references/export-specs.md).

Usage:
  qc_video.py film.mp4 [--profile youtube|facebook|vertical|ceremony|broadcast|master]
              [--fps 25] [--skip-analysis]

Exit code: 0 = no FAIL, 1 = at least one FAIL, 2 = tool/input error.
"""
import argparse
import json
import re
import shutil
import subprocess
import sys

PROFILES = {
    # resolution list: any accepted; lufs: (target, tolerance); tp: max dBTP
    "youtube":   {"res": [(1920, 1080), (3840, 2160), (2560, 1440)], "vcodec": ["h264", "hevc"], "pix": ["yuv420p"], "acodec": ["aac"], "lufs": (-14, 1), "tp": -1.0, "rate": 48000},
    "facebook":  {"res": [(1920, 1080), (1080, 1350), (1080, 1080)], "vcodec": ["h264"], "pix": ["yuv420p"], "acodec": ["aac"], "lufs": (-14, 1), "tp": -1.0, "rate": 48000},
    "vertical":  {"res": [(1080, 1920)], "vcodec": ["h264"], "pix": ["yuv420p"], "acodec": ["aac"], "lufs": (-14, 1), "tp": -1.0, "rate": 48000},
    "ceremony":  {"res": [(1920, 1080), (1280, 720)], "vcodec": ["h264"], "pix": ["yuv420p"], "acodec": ["aac"], "lufs": (-16, 1), "tp": -1.0, "rate": 48000, "max_mbps": 15},
    "broadcast": {"res": [(1920, 1080)], "vcodec": None, "pix": None, "acodec": None, "lufs": (-23, 0.5), "tp": -1.0, "rate": 48000, "fps": [25]},
    "master":    {"res": None, "vcodec": ["prores", "dnxhd"], "pix": None, "acodec": ["pcm_s24le", "pcm_s16le"], "lufs": None, "tp": -1.0, "rate": 48000},
}

results = []


def report(status, item, detail):
    results.append((status, item, detail))
    print(f"[{status}] {item}: {detail}")


def run(cmd):
    return subprocess.run(cmd, capture_output=True, text=True, errors="replace")


def fps_of(stream):
    num, _, den = stream.get("avg_frame_rate", "0/1").partition("/")
    try:
        return float(num) / float(den or 1)
    except ZeroDivisionError:
        return 0.0


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("video")
    ap.add_argument("--profile", choices=sorted(PROFILES), default="youtube")
    ap.add_argument("--fps", type=float, help="expected frame rate (e.g. 25)")
    ap.add_argument("--skip-analysis", action="store_true", help="only check stream specs (fast)")
    a = ap.parse_args()

    for tool in ("ffprobe", "ffmpeg"):
        if not shutil.which(tool):
            print(f"ERROR: {tool} not found on PATH (try `npx remotion ffmpeg` or install ffmpeg)")
            return 2
    p = PROFILES[a.profile]

    probe = run(["ffprobe", "-v", "error", "-print_format", "json", "-show_format", "-show_streams", a.video])
    if probe.returncode != 0:
        print(f"ERROR: ffprobe failed: {probe.stderr.strip()}")
        return 2
    info = json.loads(probe.stdout)
    fmt = info.get("format", {})
    vs = [s for s in info["streams"] if s["codec_type"] == "video" and not s.get("disposition", {}).get("attached_pic")]
    aus = [s for s in info["streams"] if s["codec_type"] == "audio"]
    subs = [s for s in info["streams"] if s["codec_type"] == "subtitle"]
    duration = float(fmt.get("duration", 0))
    size_mb = int(fmt.get("size", 0)) / 1e6
    mbps = int(fmt.get("bit_rate", 0)) / 1e6

    print(f"File: {a.video}\nProfile: {a.profile}\nContainer: {fmt.get('format_name')} · "
          f"duration {duration:.2f}s · {size_mb:.1f} MB · {mbps:.2f} Mbps\n")

    if not vs:
        report("FAIL", "video stream", "none found")
    else:
        v = vs[0]
        w, h, fr = v.get("width"), v.get("height"), fps_of(v)
        report("INFO", "video", f"{v.get('codec_name')} {v.get('profile', '')} {w}x{h} {fr:.3f} fps {v.get('pix_fmt')} "
                                f"SAR {v.get('sample_aspect_ratio', '1:1')}")
        if p["res"]:
            report("PASS" if (w, h) in p["res"] else "FAIL", "resolution",
                   f"{w}x{h} (allowed: {', '.join(f'{x}x{y}' for x, y in p['res'])})")
        if v.get("sample_aspect_ratio") not in (None, "1:1", "0:1"):
            report("WARN", "pixel aspect", f"SAR {v['sample_aspect_ratio']} — non-square pixels may stretch on web players")
        if p["vcodec"]:
            report("PASS" if v.get("codec_name") in p["vcodec"] else "FAIL", "video codec",
                   f"{v.get('codec_name')} (allowed: {', '.join(p['vcodec'])})")
        if p["pix"]:
            report("PASS" if v.get("pix_fmt") in p["pix"] else "FAIL", "pixel format",
                   f"{v.get('pix_fmt')} (allowed: {', '.join(p['pix'])})")
        allowed_fps = [a.fps] if a.fps else p.get("fps")
        if allowed_fps:
            ok = any(abs(fr - f) < 0.01 for f in allowed_fps)
            report("PASS" if ok else "FAIL", "frame rate", f"{fr:.3f} (expected {allowed_fps})")
        if v.get("r_frame_rate") and v.get("avg_frame_rate") and v["r_frame_rate"] != v["avg_frame_rate"]:
            report("WARN", "frame rate", f"variable frame rate suspected (r={v['r_frame_rate']} avg={v['avg_frame_rate']}); "
                                         "conform to constant fps before delivery")
        if p.get("max_mbps") and mbps > p["max_mbps"]:
            report("WARN", "bitrate", f"{mbps:.1f} Mbps > {p['max_mbps']} Mbps; may stutter on older laptops")

    if not aus:
        report("FAIL", "audio stream", "none found")
    else:
        au = aus[0]
        report("INFO", "audio", f"{au.get('codec_name')} {au.get('sample_rate')} Hz {au.get('channels')} ch "
                                f"{int(au.get('bit_rate', 0)) // 1000 or '?'} kbps")
        if p["acodec"]:
            report("PASS" if au.get("codec_name") in p["acodec"] else "FAIL", "audio codec",
                   f"{au.get('codec_name')} (allowed: {', '.join(p['acodec'])})")
        report("PASS" if int(au.get("sample_rate", 0)) == p["rate"] else "WARN", "sample rate", f"{au.get('sample_rate')} Hz")
        if au.get("channels", 0) < 2:
            report("WARN", "channels", "mono audio; deliver stereo")
        if len(aus) > 1:
            report("WARN", "audio streams", f"{len(aus)} audio streams; platforms usually play only the first")
    if subs:
        report("INFO", "subtitle streams", ", ".join(f"{s.get('codec_name')}:{s.get('tags', {}).get('language', '?')}" for s in subs))
    if "mp4" in fmt.get("format_name", "") or "mov" in fmt.get("format_name", ""):
        head = open(a.video, "rb").read(1 << 16)
        moov, mdat = head.find(b"moov"), head.find(b"mdat")
        faststart = moov != -1 and (mdat == -1 or moov < mdat)
        report("PASS" if faststart else "WARN", "faststart", "moov atom at start" if faststart
               else "moov atom not at start; add -movflags +faststart for web playback")

    if a.skip_analysis:
        return summarize()

    print("\nAnalyzing loudness, black, freeze and silence (decodes the whole file)...")
    cmd = ["ffmpeg", "-hide_banner", "-nostats", "-i", a.video]
    if vs:
        cmd += ["-map", "0:v:0", "-vf", "blackdetect=d=0.2:pix_th=0.10,freezedetect=n=0.003:d=2"]
    if aus:
        cmd += ["-map", "0:a:0", "-af", "ebur128=peak=true,silencedetect=n=-50dB:d=2"]
    cmd += ["-f", "null", "-"]
    out = run(cmd).stderr

    m = re.search(r"Integrated loudness:\s+I:\s+(-?[\d.]+|-inf) LUFS.*?LRA:\s+([\d.]+) LU.*?True peak:\s+Peak:\s+(-?[\d.]+|-inf) dBFS",
                  out, re.S)
    if aus and m:
        i_lufs = float(m.group(1)) if m.group(1) != "-inf" else float("-inf")
        lra, tp = float(m.group(2)), float(m.group(3)) if m.group(3) != "-inf" else float("-inf")
        if p["lufs"]:
            tgt, tol = p["lufs"]
            report("PASS" if abs(i_lufs - tgt) <= tol else "FAIL", "integrated loudness",
                   f"{i_lufs:.1f} LUFS (target {tgt} ±{tol})")
        else:
            report("INFO", "integrated loudness", f"{i_lufs:.1f} LUFS")
        report("PASS" if tp <= p["tp"] else "FAIL", "true peak", f"{tp:.1f} dBTP (max {p['tp']})")
        report("INFO" if lra <= 15 else "WARN", "loudness range", f"{lra:.1f} LU" + ("" if lra <= 15 else
               " — wide; quiet passages may be inaudible on phones or in a hall"))
    elif aus:
        report("WARN", "loudness", "could not parse ebur128 output")

    blacks = re.findall(r"black_start:([\d.]+) black_end:([\d.]+) black_duration:([\d.]+)", out)
    for s, e, d in blacks:
        s, e = float(s), float(e)
        edge = s < 0.05 or e > duration - 0.1
        report("INFO" if edge else "WARN", "black frames",
               f"{s:.2f}–{e:.2f}s ({float(d):.2f}s)" + (" at head/tail (fade?)" if edge else " mid-film — intentional?"))
    if vs and not blacks:
        report("PASS", "black frames", "none ≥ 0.2 s")

    fstarts = re.findall(r"lavfi\.freezedetect\.freeze_start: ([\d.]+)", out)
    fends = re.findall(r"lavfi\.freezedetect\.freeze_end: ([\d.]+)", out)
    for i, s in enumerate(fstarts):
        e = fends[i] if i < len(fends) else f"{duration:.2f}"
        report("WARN", "frozen picture", f"{float(s):.2f}–{float(e):.2f}s (intended still/hold, or render error?)")
    if vs and not fstarts:
        report("PASS", "frozen picture", "none ≥ 2 s")

    sil_s = re.findall(r"silence_start: (-?[\d.]+)", out)
    sil_e = re.findall(r"silence_end: ([\d.]+) \| silence_duration: ([\d.]+)", out)
    for i, s in enumerate(sil_s):
        if i < len(sil_e):
            e, d = sil_e[i]
            desc = f"{max(float(s), 0):.2f}–{float(e):.2f}s ({float(d):.2f}s)"
        else:
            desc = f"{max(float(s), 0):.2f}s–end"
        report("WARN", "silence < -50 dB", desc + " — intended pause, or missing audio?")
    if aus and not sil_s:
        report("PASS", "silence", "no silence ≥ 2 s")

    return summarize()


def summarize():
    fails = sum(1 for r in results if r[0] == "FAIL")
    warns = sum(1 for r in results if r[0] == "WARN")
    print(f"\nResult: {fails} FAIL, {warns} WARN")
    return 1 if fails else 0


if __name__ == "__main__":
    sys.exit(main())
