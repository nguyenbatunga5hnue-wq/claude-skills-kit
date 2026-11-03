---
name: ielts-listening-review
description: Build a teacher-controlled, interactive lesson deck for reviewing ("chữa đề") an IELTS Listening test from the test PDF and its audio — an animated listening-skills pyramid mapped to bands, an interactive bucket metaphor (authentic listening vs test practice), per-question audio clips with on-demand subtitles, clue highlighting, trap/distractor marking, multiple-choice "order of mention" badges, two-round gap-fill matching, error tallies, a group scoreboard, sound effects, and an offline single-file export. Use when the user shares a listening test (PDF/images) plus audio and asks for slides, a deck, an artifact or a lesson to teach, correct or explain it ("làm slides chữa bài listening", "dạy kỹ năng nghe", "chữa đề IELTS listening", Cambridge IELTS tests), or wants an earlier deck re-timed to a new recording.
---

# IELTS Listening review deck

The output is one HTML page (published as an Artifact, plus an optional offline file)
that a teacher drives in class. Everything waits for the teacher: nothing auto-advances,
answers stay hidden until clicked, and the full-test audio sits in a fixed top bar while
every question also has its own clip.

Reference build: `examples/cam19_test3.py` (Cambridge 19, Test 3). Read it before writing
a new data file; it shows every block type.

## What the deck contains

| Section | Slides | Teacher controls |
|---|---|---|
| Cover, scoreboard | Title only; group scoreboard (slide 2) | Names and scores typed in place; +1/+2/−1; **B** jumps to the board and back; "Điểm nhanh" opens a small score panel on any slide |
| Theory | Animated 5-tier pyramid (âm → từ/cụm → câu → đoạn + nhớ → diễn đạt lại) with a child-age timeline; band meter; "Mình kẹt ở đâu" cards; bucket simulation | → builds one tier/card per press; tiers clickable; bucket buttons pour, grow, reset |
| Gap-fill (Part 1, Part 4 notes/tables) | One row per question | ▶ clip of that question · CC subtitles (line highlights while playing) · Clue (question ↔ audio wording) · Đáp án (answer + trap note) · ✎ error note · +/− error count |
| Multiple choice (Part 2, 3) | One question at a time, tabs per question | ▶ clip · Clue (underlines stem keywords) · "Đánh số tiếp" pops the order each option is mentioned, with the quote and time · auto-numbering while the clip plays · Đáp án (correct in blue, others struck with the reason) · CC |
| Matching / flowchart | Script beside the question box | Round 1 hides the script; round 2 shows it with keywords blanked as inputs · Chấm checks · Điền hết · Hiện đáp án |
| Wrap-up | Class errors (collected from the counters/notes), answer key (generated), homework by tier | — |

Keys: ← → slide or build step · Space play/pause · Esc stop clip · B scoreboard.
Counters, notes and scores live in the viewer's browser (localStorage).

## Workflow

1. **Read the test.** `pdftotext -layout` the PDF, and render pages (`pdftoppm -r 70 -png`)
   to read boxes, tables and option letters the text layer scrambles. Note each
   question's type and wording.
2. **Transcribe the audio in the background** (it takes about as long as the audio):
   `python3 scripts/transcribe.py AUDIO work/tr.jsonl` (downloads the models once to
   `~/.cache/listening-review-models`; needs `pip install sherpa-onnx numpy` and ffmpeg). While it runs, write the data file.
   Check completion with `ps -eo args | grep "[t]ranscribe.py"`, not `pgrep -f` (it
   matches the waiting shell itself and never returns).
3. **Write the data file** (copy `examples/cam19_test3.py`). For each question: the
   spoken lines that contain the answer and its distractors, marked with `K()` answer,
   `T()` trap, `P()` paraphrase; a one-line `clue`; a `trap` note. For MCQ options:
   whether correct, the order they are mentioned, the index of the line that mentions
   them, a short quote and the reason. Set `PYR_EX` to examples from this test.
   `SEQUENCE` must follow the audio order.
4. **Verify the words.** VAD often clips the first words of a turn and Whisper mishears
   some words (ripe → right, Sticks → Books). Re-run doubtful windows with
   `python3 scripts/check_window.py work/tr.16k.wav 241-256 …` and correct the lines.
   Speaker letters are inferred from content: say so to the user. Derive answers from
   the audio and tell the user to check them against the official key.
5. **Build:** `python3 scripts/build_deck.py --data DATA.py --transcript work/tr.jsonl
   --audio test.mp3 --duration $(ffprobe -v error -show_entries format=duration -of csv=p=0 AUDIO)
   --out deck/index.html`. Fix every "low-confidence line" it lists (usually different
   wording in this recording), then rebuild.
6. **Audio file:** artifacts do not serve `.m4a`. Encode
   `ffmpeg -i AUDIO -ac 1 -c:a libmp3lame -b:a 48k deck/test.mp3` (≈10 MB for 28 min; the
   per-file limit is 15 MB).
7. **Check once** in Playwright at 1280×720: step through the pyramid (wait ~7 s per
   tier for the animation), open a gap row with CC + Clue + Đáp án, an MCQ with numbering,
   and a matching slide in round 2. Look for overlapping text.
8. **Publish** with the Artifact tool: `file_path` = the page, `files` =
   `{"test.mp3": "<path>"}`. Do not use the Slides artifact type: it cannot play
   per-question audio or take input.
9. **Offline file** when asked: `python3 scripts/make_offline.py deck/index.html deck/test.mp3 OUT.html`
   (embeds fonts and audio, ~14 MB, opens in Chrome/Edge without internet).

## New recording of the same test

Keep the data file, re-run step 2 on the new audio, rebuild. Wording can differ slightly
between recordings ("What about" → "How about"); the build lists those lines.

## Design rules learned from teachers

- Teacher controls everything. No autoplay, no auto-advance, answers hidden by default.
- Title slides carry only the title. Content slides carry one heading and no eyebrow,
  subtitle, hint line or legend.
- Never place the script beside gap-fill or MCQ questions; subtitles open on demand per
  question. Matching slides are the exception (two-round gap-fill on the script).
- MCQ: one question at a time; the "order of mention" badges are the teaching point.
- Fit the theory animations inside their panel at 1280×720; trim content rather than
  shrink it.
- Sound effects are synthesised with WebAudio (no files) and have an on/off button.
- PowerPoint export cannot keep the clips-with-stop, synced subtitles, counters or the
  bucket simulation; offer the offline HTML instead and explain the trade-off if asked.

## Files

- `scripts/transcribe.py` — VAD + Whisper small.en (sherpa-onnx, models from GitHub releases)
- `scripts/check_window.py` — re-transcribe chosen windows as one piece
- `scripts/build_deck.py` — align the data to the transcript and write the page
- `scripts/make_offline.py` — single self-contained HTML
- `assets/head.html`, `assets/theory.html`, `assets/tail.html` — styles, theory slides,
  scoreboard, sound effects and the controller script. Edit these to change the look or
  the theory content for every future deck.
- `examples/cam19_test3.py` — complete content for Cambridge 19 Test 3
