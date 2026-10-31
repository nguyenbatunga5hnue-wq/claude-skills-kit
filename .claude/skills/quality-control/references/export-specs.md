# Export Specifications by Destination

These are the profiles used by `scripts/qc_video.py --profile`. Platform specs change.
When a platform publishes a newer spec, it wins; update the `PROFILES` dict in the script.
Broadcasters publish their own technical specs, so always get the station's document.

| Profile | Resolution / aspect | FPS | Video | Audio | Loudness (integrated / true peak) | Subtitles |
|---|---|---|---|---|---|---|
| `youtube` | 1920×1080 or 3840×2160, 16:9 | as shot (24/25/30) | H.264 High, yuv420p, ≈ 8–12 Mbps @1080p | AAC-LC 48 kHz stereo, ≥ 320 kbps | −14 LUFS ±1 / ≤ −1 dBTP | Sidecar `.srt` uploaded per language |
| `facebook` | 1920×1080 16:9 or 1080×1350 4:5 | 25/30 | H.264, yuv420p, ≈ 8 Mbps | AAC 48 kHz stereo, ≥ 128 kbps | −14 LUFS ±1 / ≤ −1 dBTP | Sidecar `.srt` (`name.vi_VN.srt`) or burned in |
| `vertical` (TikTok / Reels / Shorts) | 1080×1920, 9:16 | 25/30 | H.264, yuv420p, ≈ 8–10 Mbps | AAC 48 kHz stereo | −14 LUFS ±1 / ≤ −1 dBTP | Burned in, inside the safe zone (avoid the bottom ~20 % and right ~12 %) |
| `ceremony` (school hall projector) | 1920×1080 16:9 (check the projector; many are 1280×800 or 1024×768) | 25 | H.264 High, yuv420p, ≤ 15 Mbps MP4 (plays everywhere) | AAC 48 kHz stereo 320 kbps | −16 LUFS ±1 / ≤ −1 dBTP (hall PA systems clip easily) | Burned in, large (≥ 5 % of frame height) |
| `broadcast` | 1920×1080 16:9 | 25 (PAL region) | per the station's spec | 48 kHz 24-bit PCM | −23 LUFS ±0.5 / ≤ −1 dBTP (EBU R128) | per the station's spec |
| `master` (archive) | native | native | ProRes 422 HQ or DNxHR HQ | PCM 48 kHz 24-bit | as mixed (stems kept separately) | Sidecar `.srt` |

## Commands

Re-normalize loudness (two-pass is more accurate; one pass shown):
```bash
ffmpeg -i in.mp4 -c:v copy -af loudnorm=I=-14:TP=-1:LRA=11 -c:a aac -b:a 320k -ar 48000 out.mp4
```

Web delivery from a master:
```bash
ffmpeg -i master.mov -c:v libx264 -profile:v high -pix_fmt yuv420p -crf 18 -preset slow -movflags +faststart -c:a aac -b:a 320k -ar 48000 out_youtube.mp4
```

Burn in Vietnamese subtitles (the font must contain Vietnamese glyphs):
```bash
ffmpeg -i in.mp4 -vf "subtitles=vi.srt:force_style='FontName=Be Vietnam Pro,FontSize=22,Outline=2,MarginV=60'" -c:a copy out_burned.mp4
```

Vertical crop from a 16:9 master (center; adjust `x` per shot when needed):
```bash
ffmpeg -i in.mp4 -vf "crop=ih*9/16:ih,scale=1080:1920" -c:a copy out_vertical.mp4
```

## Ceremony checklist (most failures happen here)

- Test on the actual laptop and projector at the venue, with the hall's sound system, before the day.
- Bring the file on two USB sticks formatted exFAT, plus a 720p fallback and an offline copy on the laptop.
- Disable the laptop's sleep mode, notifications and auto-updates. Play from a local file, never from a streaming link.
