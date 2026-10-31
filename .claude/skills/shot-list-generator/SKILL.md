---
name: shot-list-generator
description: Convert an approved screenplay (Fountain, Markdown or plain text, any language including Vietnamese) into a practical, timestamped shot list CSV with shot size, camera angle, movement, lens, lighting, sound, location, cast, props/wardrobe, VFX/graphics and continuity notes, plus a location-grouped shooting schedule. Use when the user asks for a shot list, shot breakdown, storyboard table, camera plan, découpage, "phân cảnh", "bảng phân cảnh quay" or shooting schedule from a script.
---

# Shot List Generator

Input: an **approved** screenplay. Optional inputs: a visual bible, a sound plan
and a target runtime/fps. Output: `06-shot-list.csv` (or `shot-list.csv` next to the
screenplay), a validator report and a shooting schedule.

If the screenplay is not marked approved, say so and ask whether to proceed.
A shot list built on a moving script wastes the shoot.

## Related skills

- `teacher-tribute-film` calls this skill in Phase 5. Its `film/04-visual-bible.md`
  and `film/05-sound-plan.md` define the look and sound rules you must follow.
- `quality-control` (shot-list mode) reviews the output.
- `cinematic-ui/references/data/camera-shots-50.md` holds film references for
  camera techniques (ignore its CSS column).
- `remotion-markup` (`sequencing.md`, `timing.md`) applies when the film is built
  in Remotion. Shot durations map 1:1 to `<Sequence durationInFrames>`.

## Workflow

1. **Read everything first.** Read the screenplay, visual bible and sound plan.
   Note the target runtime, fps (default 25) and aspect ratio.
2. **Break scenes into beats.** A new shot starts when the information,
   emotion or subject changes, not on every line of text.
3. **Estimate each shot's duration:**
   - Dialogue/VO: count the syllables (Vietnamese: whitespace-separated words) ÷ 3.2
     syllables/s for calm narration, ÷ 4 for normal dialogue, plus 0.5–1 s of air.
   - Action: act it out mentally in real time. Inserts run 1.5–3 s. Establishing shots run 3–6 s.
     Emotional holds run 3–8 s.
   - Scene notes `[[~mm:ss]]` in the screenplay are the budget. Shot durations in a
     scene must sum to it ±10 %.
4. **Design coverage** for each shot using `references/camera-vocabulary.md`.
   Apply the visual bible's layer rules (for example, memory = handheld, eye level, shallow focus).
   Vary shot sizes: avoid two consecutive shots of the same size on the same subject (jump cut)
   unless intended.
5. **Fill every column** (schema below). Use `-` for not applicable, never leave a
   cell blank. Continuity notes are mandatory whenever a character, prop, wardrobe
   item, weather or time of day carries across shots.
6. **Compute timecodes** cumulatively from `00:00:00:00` at the project fps:
   `tc_out = tc_in + duration`, and the next `tc_in = previous tc_out`.
7. **Validate:**
   ```bash
   python3 <this-skill>/scripts/validate_shot_list.py film/06-shot-list.csv --fps 25 --target 00:03:00 --schedule
   ```
   Fix every ERROR. Review WARNINGs with the user. Paste the summary and schedule into
   your reply.
8. **Deliver:** the CSV, the validator summary, the location-grouped schedule, and a
   short list of open questions (missing locations, props to source, consent gaps).

## CSV schema (exact header, this order)

```
shot_id,scene,tc_in,tc_out,duration_s,description,shot_size,angle,movement,lens_mm,composition,lighting,sound,location,cast,props_wardrobe,vfx_graphics,continuity,notes
```

| Column | Content |
|---|---|
| `shot_id` | `S{scene:02d}-{shot:02d}`, e.g. `S03-04`. Pickups/alternates get a suffix: `S03-04A` |
| `scene` | Scene number from the screenplay |
| `tc_in` / `tc_out` | `HH:MM:SS:FF` at the project fps |
| `duration_s` | Seconds with 2 decimals; must equal `tc_out − tc_in` |
| `description` | What we see, in present tense, one sentence. Write it in the screenplay's language |
| `shot_size` | Controlled term: EWS, WS, FS, MWS, MS, MCU, CU, ECU, INSERT, OTS, POV, 2S, GROUP |
| `angle` | Controlled term: eye-level, high, low, overhead, worm, dutch, profile, three-quarter |
| `movement` | Controlled term: static, pan, tilt, dolly-in, dolly-out, track, truck, crane, handheld, steadicam/gimbal, zoom, rack-focus, push-in (photo), drone |
| `lens_mm` | Full-frame equivalent focal length, or `phone-1x`/`phone-0.5x`/`phone-3x` |
| `composition` | Rule of thirds side, headroom, foreground element, depth layers |
| `lighting` | Key direction/quality, practicals, time of day, color temperature (e.g. `window key camera-left, soft, 5600K, practical desk lamp 3200K`) |
| `sound` | `SYNC`, `VO`, `MOS`, plus ambience/SFX/music cue IDs from the sound plan |
| `location` | Exact location name, the same string everywhere (it groups the schedule) |
| `cast` | Characters, separated by `;`. Mark extras as `extras:N` |
| `props_wardrobe` | Items that must be present or prepared |
| `vfx_graphics` | Titles, subtitles burned in, cleanup, AI-generated, Remotion component |
| `continuity` | What must match the adjacent shots (hand holding flowers, chalk dust on left shoulder, rain stopped) |
| `notes` | Safety, consent (minors), alternates, AI prompt reference, coverage priority (A/B/C) |

Quote any cell that contains a comma. Save as UTF-8 (no BOM). Vietnamese text must be
NFC-normalized; the validator checks this.

## Production-mode specifics

- **Archive montage**: `movement` = `push-in (photo)` or `static`, `lens_mm` = `-`,
  `location` = asset source folder, and `notes` = file name + rights status.
- **Remotion / motion graphics**: put the component name in `vfx_graphics` and add
  `frames=<duration×fps>` in `notes`.
- **AI-generated**: `notes` = prompt ID, which must reference the visual bible's style lock. Keep each
  shot ≤ the generator's clip limit (often 5–10 s). Split longer beats.
- **Phone shoots**: express lens as `phone-1x` etc. Avoid `zoom` mid-shot on phones.

## Quality bar before handing off

- Every screenplay scene appears, in order. No scene is dropped or invented.
- Total runtime is within ±5 % of the target.
- Each scene has at least one wide/establishing option and one close emotional option.
- Emotional peak shots get the longest holds and the closest sizes.
- Every carried-over prop or wardrobe item has a continuity note.
- Shots with minors' faces carry a consent note.
