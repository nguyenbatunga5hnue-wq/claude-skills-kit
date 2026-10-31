---
name: teacher-tribute-film
description: End-to-end cinematic storytelling workflow for a Vietnamese Teachers' Day (Ngày Nhà giáo Việt Nam, 20/11) tribute film — brief, concept, story structure, Vietnamese screenplay, visual bible, sound plan, production, edit, grade, subtitles and delivery. Use when the user wants to plan, write, produce or finish a film, video, clip or short honoring teachers (thầy cô, phim tri ân, video 20/11), whether shot live-action, assembled from photos/archive footage, animated in Remotion, or generated with AI video tools.
---

# Teacher Tribute Film (Phim tri ân Ngày Nhà giáo Việt Nam 20/11)

A phase-gated workflow. Each phase produces one file in the project's `film/`
folder and ends with a **gate**: show the deliverable, get the user's approval,
then move on. Never write the screenplay before the concept is approved, and
never produce a shot list before the screenplay is approved.

## Related skills (reuse, don't duplicate)

| Need | Use |
|---|---|
| Screenplay → timestamped shot list | `shot-list-generator` skill |
| Reviewing screenplay, shot list, final video | `quality-control` skill |
| Animated titles, photo montages, motion graphics, rendering | `remotion-best-practices` (router), `remotion-create`, `remotion-markup`, `remotion-render` |
| Subtitles/captions in Remotion | `remotion-captions` |
| AI voice-over | `remotion-markup` → `voiceover.md` |
| Film-reference color moods | `cinematic-ui/references/data/color-grades.md` (use the *Film Reference* and *Mood* columns; the CSS filters only help for web/Remotion previews) |
| Narrative beat vocabulary | `cinematic-ui/references/data/narrative-beats.md` |
| Probing/trimming/encoding media | `ffmpeg` / `ffprobe` (or `npx remotion ffmpeg`) |

If one of these skills is not installed, continue with the guidance in this
skill and its `references/` — it is self-sufficient.

## Project layout

Create only what is missing; never overwrite an existing file without asking.

```
film/
  01-brief.md            ← templates/brief.md
  02-concept.md          ← logline, theme, 2–3 treatment options, chosen one
  03-screenplay.fountain ← templates/screenplay.fountain
  04-visual-bible.md     ← templates/visual-bible.md
  05-sound-plan.md       ← templates/sound-plan.md
  06-shot-list.csv       ← produced by shot-list-generator
  assets/  (photos, archive, music, logos — with license notes)
  edit/    (project files, reference cuts epNN_vNNN.mp4)
  subs/    (vi.srt, en.srt)
  qc/      (reports from quality-control)
  export/  (masters and delivery files)
```

## Phase 0 — Brief (`01-brief.md`)

Fill `templates/brief.md` with the user. Ask only for what is unknown; the
minimum to proceed is: **who is honored** (one teacher, a school's staff, the
profession), **who is making it** (students, alumni, school, company),
**target duration**, **production mode**, **where it screens** (school
ceremony projector, Facebook/YouTube, TikTok/Reels, TV), and **deadline**
(usually before 20/11).

Production modes — pick one, they change every later phase:
- **A. Live-action** — real people, real locations, a phone or camera.
- **B. Archive montage** — existing photos/videos + voice-over + music.
- **C. Motion graphics / animation** — Remotion, illustrations, kinetic type.
- **D. AI-generated** — text/image-to-video clips; requires a strict style lock (see visual bible).
- Hybrids are common (B + interviews, A + C titles).

Gate: brief approved.

## Phase 1 — Concept (`02-concept.md`)

1. Write one **logline** (≤ 30 words, Vietnamese + English).
2. State the **theme in one sentence** — the emotional truth, not the topic
   ("Một người thầy không dạy bài học, mà dạy cách đứng dậy" beats "Tri ân thầy cô").
3. Offer **2–3 treatments** built from `references/story-structures.md`, each
   with: structure name, 5-line synopsis, emotional arc, why it fits this brief,
   production cost/risk for the chosen mode.
4. Check every treatment against `references/cultural-guide.md`
   (motifs, clichés to avoid, consent, music rights).

Gate: user picks a treatment.

## Phase 2 — Screenplay (`03-screenplay.fountain`)

- Use Fountain (`templates/screenplay.fountain`). Scene headings in the form
  `INT. LỚP HỌC 12A1 - NGÀY` / `EXT. SÂN TRƯỜNG - BÌNH MINH`.
- Dialogue and voice-over in natural Vietnamese; mark VO as `CÔ LAN (V.O.)`.
  Match register to region and relationship (thầy/cô – em/con, Bắc/Trung/Nam).
- **Show, don't tell.** Prefer one concrete gesture (cô giữ lại viên phấn gãy,
  thầy sửa dấu hỏi/ngã bằng mực đỏ) over speeches of gratitude. Keep spoken
  thank-yous for the final beat.
- **Timing budget**: calm Vietnamese narration ≈ 3–3.5 syllables/second.
  60 s film ≈ 120–150 spoken syllables *total*; leave ≥ 30 % of runtime wordless.
- Annotate each scene with a target duration in a note: `[[~00:20]]`. The sum
  must equal the brief's runtime ±5 %.
- No real names, schools or faces of minors without consent noted in the brief.

Before the gate, run the `quality-control` skill in **screenplay** mode and fix
blockers. Gate: screenplay approved (lock it — later changes go through a
revision note in the file's title page `Revision:` field).

## Phase 3 — Visual bible (`04-visual-bible.md`)

Fill `templates/visual-bible.md`:
- **Look**: 1–3 film references + chosen color mood. Default palette for this
  genre: warm, soft, low-contrast past (memory) vs. clean, natural present.
  Candidate moods from `color-grades.md`: *Golden Age Warmth*, *Vintage Film
  Stock* for memories; *Natural Clarity*, *Japanese Cool Precision* for the
  present; *Studio Ghibli Pastoral* for animation.
- **Camera language**: lens/height/movement rules per story layer
  (e.g. memories = handheld, eye-level of a child, shallow focus; present = locked-off, wider).
- **Motifs** (from cultural guide) and where each recurs — a motif must
  appear ≥ 2 times to pay off.
- **Typography**: a Vietnamese-complete font (Be Vietnam Pro, Lexend,
  Playfair Display, Noto Serif). Never a font that breaks ơ ư ạ ặ ễ.
- **Mode D (AI)**: a locked *style prompt block* (character sheet, wardrobe,
  lens, lighting, grade, aspect ratio, negative prompt) pasted verbatim into
  every generation; fixed seed/reference image per character.

## Phase 4 — Sound plan (`05-sound-plan.md`)

Fill `templates/sound-plan.md`: music cues per scene (with license source),
VO casting, ambience beds (trống trường, tiếng ve, tiếng phấn trên bảng, mưa
mái tôn), silence moments, and loudness target from the delivery platform
(see `quality-control/references/export-specs.md`).

## Phase 5 — Shot list (`06-shot-list.csv`)

Invoke the `shot-list-generator` skill with the locked screenplay, visual
bible and sound plan as inputs. Then run `quality-control` in **shot-list**
mode. Gate: shot list approved.

## Phase 6 — Production

- **A. Live-action**: group shots by location (the shot-list generator outputs
  a schedule). Shoot at the target fps (25 fps default in Vietnam, or 24),
  record 10 s room tone per location, slate every take, back up daily (3-2-1).
- **B. Archive**: log every asset with source + permission; scan photos ≥ 300 dpi;
  plan slow push-ins (Ken Burns) ≤ 10 % scale over 5–8 s.
- **C. Remotion**: follow `remotion-best-practices`; one `<Sequence>` per
  scene, durations taken from the shot list; preview in Studio, don't render
  until asked.
- **D. AI**: generate 3–4 variants per shot using the locked style block;
  reject shots with wrong text, extra fingers, warped áo dài, or face drift.

## Phase 7 — Post-production

1. **Assembly** in shot-list order → `edit/v001`.
2. **Rough cut**: cut for emotion first, then story, then rhythm. Let the
   final beat breathe (≥ 3 s hold before titles).
3. **Grade** to the visual bible; match skin tones across sources.
4. **Sound**: dialogue/VO first, then music, ambience, SFX; duck music under VO.
5. **Subtitles**: `subs/vi.srt` (for sound-off viewing) and `subs/en.srt` if
   needed. Save as UTF-8, NFC-normalized (see quality-control).
6. **Titles/credits**: dedication card (e.g. "Kính tặng các thầy cô giáo nhân
   ngày 20/11"), credits including music licenses.

## Phase 8 — Quality control and delivery

Run the `quality-control` skill in **video** mode on the master, fix every
blocker, then export one file per destination per
`quality-control/references/export-specs.md`. Keep a ProRes/high-bitrate
master in `export/` plus the deliverables.

## Hand-off summary

At the end of each phase, reply with: what was produced (file path), the open
decisions, and the next phase's first step.
