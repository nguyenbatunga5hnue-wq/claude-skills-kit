---
name: quality-control
description: Structured quality review of a short film or video project at three gates — screenplay, shot list, and final video — covering storytelling, emotional impact, visual consistency, sound quality and loudness, subtitles (SRT timing, reading speed, Vietnamese diacritics) and export specifications, with automated ffmpeg/ffprobe checks and a severity-ranked report. Use when the user asks to review, check, QC, proof, "kiểm tra chất lượng", approve or prepare a script, shot list, cut, subtitle file or export for delivery (YouTube, Facebook, TikTok/Reels, school ceremony projector, broadcast).
---

# Quality Control

Three review modes. Pick the one that matches the input, or run all of them in
order for a full pre-delivery review. Every mode ends with a report written to
`film/qc/<mode>-<YYYYMMDD>.md` (or next to the reviewed file if there is no `film/`
folder) using `references/report-template.md`.

| Mode | Input | Gate it protects |
|---|---|---|
| `screenplay` | `.fountain` / `.md` / `.txt` script, plus the brief if available | Before the shot list is made |
| `shot-list` | Shot-list CSV, plus the screenplay and visual bible | Before shooting/generating |
| `video` | Rendered file (`.mp4`/`.mov`), plus subtitles and the delivery target | Before upload or screening |

## Related skills

- `teacher-tribute-film` calls this skill at each gate. Its brief, visual bible
  and sound plan are the yardstick. Review *against them*, not against taste.
- `shot-list-generator` has `scripts/validate_shot_list.py`. Run it in
  shot-list mode instead of re-checking timecodes by hand.
- `remotion-render` / `remotion-captions` cover fixing issues in Remotion projects
  (re-render, caption JSON).
- `cinematic-ui/references/data/color-grades.md` holds the named color moods the
  visual bible may reference.

## Severity

- **BLOCKER**: must be fixed before the next gate. Examples: wrong runtime for the slot, missing
  consent for minors, unlicensed music for an online upload, clipped audio, missing or
  garbled Vietnamese diacritics, a wrong aspect ratio for the platform, black or frozen
  frames, factual errors about the honoree.
- **MAJOR**: hurts the film noticeably. Examples: an emotional peak too early or rushed,
  inconsistent grade between scenes, VO buried under music, subtitles too fast.
- **MINOR**: polish items. Examples: a slightly long hold, a typo in the credits, a 1-frame flash.

Every finding states **where** (scene / shot ID / timecode), **what**, **why it
matters**, and **a concrete fix**. Praise only what should be protected in the
next revision ("keep the chalk-dust backlight in S02-01").

## Mode: screenplay

1. Read the brief, then the script twice: once as an audience member (note where you
   feel something), once as a reviewer.
2. Apply `references/checklists.md` → *Screenplay*.
3. Measure: count spoken syllables per scene (Vietnamese: whitespace-separated words)
   and compare with the `[[~mm:ss]]` budget at about 3.2 syllables/s for narration. Report
   the scenes where speech exceeds 70 % of the scene time.
4. Verdict: `APPROVE`, `APPROVE WITH FIXES` (majors/minors only) or `REVISE` (any blocker).

## Mode: shot-list

1. Run the validator:
   ```bash
   python3 <shot-list-generator>/scripts/validate_shot_list.py film/06-shot-list.csv --fps 25 --target <runtime> --schedule
   ```
   Its ERRORs are blockers.
2. Apply `references/checklists.md` → *Shot list* (coverage, visual-bible
   compliance, continuity, feasibility, consent).
3. Cross-check: every screenplay scene is present and in order, and no shot is invented.

## Mode: video

1. **Automated technical pass** (requires `ffmpeg`/`ffprobe`):
   ```bash
   python3 <this-skill>/scripts/qc_video.py export/film.mp4 --profile youtube
   python3 <this-skill>/scripts/check_srt.py subs/vi.srt --fps 25 --video-duration <seconds>
   ```
   Profiles: `youtube`, `facebook`, `vertical` (TikTok/Reels/Shorts), `ceremony`
   (projector in a hall), `broadcast`, `master`. See `references/export-specs.md`.
   Paste the script outputs into the report. FAILs are blockers.
2. **Viewing pass**: Claude cannot watch video directly, so extract evidence:
   - Contact sheet, one frame per shot or every N seconds:
     `ffmpeg -i film.mp4 -vf "fps=1/2,scale=480:-1,tile=5x4" -frames:v 1 qc/contact.png`,
     then view the image and check grade consistency, framing, text safe areas, and
     glitches (AI artifacts, warped hands or áo dài).
   - Frames at timecodes flagged by the scripts (black, freeze, peaks):
     `ffmpeg -ss <t> -i film.mp4 -frames:v 1 qc/t<t>.png`.
   - Ask the user to confirm subjective audio items (VO clarity, music balance)
     unless loudness data already proves a problem.
3. Apply `references/checklists.md` → *Final video*.
4. Verdict: `READY TO DELIVER`, `FIX AND RE-EXPORT`, or `RE-EDIT`.

## Rules

- Do not edit the reviewed files during a review. Propose fixes. Apply them only when
  the user asks, and then re-run the same mode.
- Never overwrite an earlier QC report; date-stamp a new one.
- When a check cannot be run (no ffmpeg, no subtitle file), say so in the report
  under *Not checked*. Do not mark it as passing.
