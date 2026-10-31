# QC Checklists

Mark each item ✅ pass · ⚠️ finding (with severity) · ➖ not applicable · ❓ not checked.

## Screenplay

### Story
- [ ] The theme can be stated in one sentence and every scene serves it
- [ ] Clear point of view (whose story is this?)
- [ ] Opening image hooks within the first 10 % (social: first 2–3 s)
- [ ] A specific, concrete memory or act, not a list of virtues
- [ ] A story object or motif appears at least twice (setup → payoff)
- [ ] The emotional peak sits around 75–85 % of runtime and is earned by earlier scenes
- [ ] The ending breathes: no new information in the last 10 %
- [ ] No scene can be cut without loss (if one can, recommend cutting it)

### Emotional impact
- [ ] Show, don't tell: gratitude is shown through action before it is spoken
- [ ] Avoids the clichés in `teacher-tribute-film/references/cultural-guide.md`, or subverts them deliberately
- [ ] The teacher is a human being (humor, fatigue, strictness with a reason), not a saint icon
- [ ] Dialogue sounds spoken, not written. Address forms (thầy/cô – em/con) are consistent and fit the region

### Craft and feasibility
- [ ] Fountain formatting is valid: scene headings `INT./EXT. PLACE - TIME`, character cues in caps
- [ ] Each scene has a duration note, and the sum is within ±5 % of the target runtime
- [ ] Speech ≤ 70 % of each scene's time (about 3.2 syllables/s); ≥ 30 % of the film is wordless
- [ ] Locations, props and cast are achievable in the chosen production mode and budget
- [ ] Spelling and diacritics are correct (dấu hỏi/ngã, ươ/uơ). Names of real people are verified

### Ethics
- [ ] Consent is recorded for real teachers portrayed and for identifiable minors
- [ ] No money/envelope gift imagery unless intentional. No unrequested political symbols
- [ ] Music named in the script has a rights plan

## Shot list

- [ ] Validator passes with 0 errors. Warnings are reviewed
- [ ] Every screenplay scene is covered in order. No invented scenes
- [ ] Each scene has an establishing/wide option and an emotional close option
- [ ] Shot sizes progress logically; no unintended jump cuts
- [ ] Camera language obeys the visual bible per layer (present vs memory)
- [ ] Lighting notes are consistent with time of day and the scene heading
- [ ] Continuity notes exist for every carried prop, wardrobe item and weather condition
- [ ] Sound column: VO/SYNC/MOS is marked; room tone and wild tracks are planned per location
- [ ] Schedule groups locations efficiently; exterior golden-hour shots fall in the right windows
- [ ] Mode-specific: archive assets have rights noted; AI shots reference the style lock and fit clip limits;
      Remotion shots have frame counts
- [ ] Safety (heights, roads, drones near schools) and consent notes are present where needed

## Final video

### Storytelling and emotion (watch through once without stopping)
- [ ] The hook works in the first seconds (social: before the 3 s mark)
- [ ] Pacing: no section drags; the peak is held long enough; the ending breathes ≥ 3 s before titles
- [ ] The cut matches the approved screenplay or the changes are intentional and agreed
- [ ] Names, dates, school name and dedication text are correct

### Visual consistency
- [ ] Grade is consistent within each story layer; skin tones match across cameras and sources
- [ ] No unintended black frames, freezes, flash frames or dropped frames (see the script output)
- [ ] Aspect ratio is correct for the platform; no stretched archive photos; letter/pillarboxing is intentional
- [ ] Titles and subtitles sit inside safe areas (vertical: clear of the platform UI at the bottom ~20 % and right edge)
- [ ] Font renders all Vietnamese diacritics (check ơ ư ă â ê ô đ with every tone mark)
- [ ] AI-generated shots: no text artifacts, extra fingers, face drift, or anachronisms

### Sound
- [ ] Integrated loudness and true peak are within the profile (script output)
- [ ] No clipping, clicks, pops, or hum; no unintended silence (script output plus listening)
- [ ] VO/dialogue is intelligible over music; music ducks under speech
- [ ] Ambience is continuous across cuts within a scene (no room-tone jumps)
- [ ] Music edit points land on beats/phrases; the ending resolves musically
- [ ] Every music track is licensed for the destination and credited

### Subtitles
- [ ] `check_srt.py` passes: UTF-8, NFC, valid timing, no overlaps
- [ ] Reading speed ≤ 17 characters/second (warn), ≤ 20 (hard limit)
- [ ] ≤ 2 lines, ≤ 42 characters per line; line breaks at natural phrase boundaries
- [ ] Each subtitle lasts 0.83–7 s and matches the speech within ±0.25 s
- [ ] Text matches the final audio (not an older script draft)
- [ ] Burned-in vs sidecar matches the profile (burn in for ceremony and vertical; sidecar for YouTube)

### Export and delivery
- [ ] Container, codec, resolution, fps and audio match the profile (script output)
- [ ] The file plays on the actual target device (ceremony laptop/projector, a phone)
- [ ] File naming: `<title>_<platform>_<WxH>_<fps>_<lang>_v<NNN>.mp4`
- [ ] A master is archived; deliverables and subtitles are in `export/`; a backup copy exists
