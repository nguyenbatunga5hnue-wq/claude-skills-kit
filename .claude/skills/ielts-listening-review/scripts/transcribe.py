#!/usr/bin/env python3
"""Transcribe a listening-test recording into timed segments (JSON lines).

    python3 transcribe.py AUDIO OUT.jsonl [--model-dir DIR]

Uses Whisper small.en through sherpa-onnx, with Silero VAD to cut the audio into
speech segments (each line: {"s": start, "e": end, "t": text}). The models come from
the sherpa-onnx GitHub releases, which stay reachable in sandboxes where Hugging Face
is blocked. Speed is roughly real time on 4 CPU cores, so run it in the background and
write the slide content meanwhile. Output is flushed line by line: `wc -l OUT` shows
progress, and the process is done when `ps -eo args | grep "[t]ranscribe.py"` is empty
(a plain `pgrep -f transcribe.py` also matches the shell that runs it).

Needs: ffmpeg, `pip install sherpa-onnx numpy`.
"""
import argparse, json, os, subprocess, sys, tarfile, urllib.request, wave
import numpy as np

REL = 'https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/'
ap = argparse.ArgumentParser()
ap.add_argument('audio'); ap.add_argument('out')
ap.add_argument('--model-dir', default=os.path.expanduser('~/.cache/listening-review-models'))
a = ap.parse_args()

import sherpa_onnx
md = a.model_dir; os.makedirs(md, exist_ok=True)
wd = os.path.join(md, 'sherpa-onnx-whisper-small.en')
if not os.path.isdir(wd):
    tb = os.path.join(md, 'w.tar.bz2')
    print('downloading whisper small.en …', file=sys.stderr)
    urllib.request.urlretrieve(REL + 'sherpa-onnx-whisper-small.en.tar.bz2', tb)
    with tarfile.open(tb) as t: t.extractall(md, filter='data')
    os.remove(tb)
vad_path = os.path.join(md, 'silero_vad.onnx')
if not os.path.exists(vad_path):
    urllib.request.urlretrieve(REL + 'silero_vad.onnx', vad_path)

wav = os.path.splitext(a.out)[0] + '.16k.wav'
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', a.audio, '-ac', '1', '-ar', '16000', wav], check=True)

rec = sherpa_onnx.OfflineRecognizer.from_whisper(
    encoder=wd + '/small.en-encoder.int8.onnx', decoder=wd + '/small.en-decoder.int8.onnx',
    tokens=wd + '/small.en-tokens.txt', language='en', task='transcribe', num_threads=os.cpu_count() or 4)
cfg = sherpa_onnx.VadModelConfig(); cfg.silero_vad.model = vad_path
cfg.silero_vad.min_silence_duration = 0.35; cfg.silero_vad.max_speech_duration = 20; cfg.sample_rate = 16000
vad = sherpa_onnx.VoiceActivityDetector(cfg, buffer_size_in_seconds=120)

w = wave.open(wav); x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
out = open(a.out, 'w')
def flush():
    while not vad.empty():
        seg = vad.front; st = seg.start / 16000
        s = rec.create_stream(); s.accept_waveform(16000, seg.samples); rec.decode_stream(s)
        out.write(json.dumps({'s': round(st, 2), 'e': round(st + len(seg.samples) / 16000, 2), 't': s.result.text.strip()}) + '\n'); out.flush()
        vad.pop()
for i in range(0, len(x), 512):
    vad.accept_waveform(x[i:i + 512]); flush()
vad.flush(); flush()
print('done', file=sys.stderr)
