#!/usr/bin/env python3
"""Re-transcribe short windows of the audio as one piece, to recover words the VAD cut off.

    python3 check_window.py WAV 241-256 276-292 ...

WAV is the 16 kHz file transcribe.py leaves next to its output (OUT.16k.wav). Each window
is at most 30 s. Use it for lines build_deck.py reports as low-confidence, for the first
words of a speaker turn (often clipped), and for every line that holds an answer.
"""
import os, sys, wave
import numpy as np, sherpa_onnx

md = os.path.expanduser('~/.cache/listening-review-models/sherpa-onnx-whisper-small.en')
rec = sherpa_onnx.OfflineRecognizer.from_whisper(encoder=md + '/small.en-encoder.int8.onnx', decoder=md + '/small.en-decoder.int8.onnx',
                                                 tokens=md + '/small.en-tokens.txt', language='en', task='transcribe', num_threads=os.cpu_count() or 4)
w = wave.open(sys.argv[1]); x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
for arg in sys.argv[2:]:
    a, b = map(float, arg.split('-'))
    s = rec.create_stream(); s.accept_waveform(16000, x[int(a * 16000):int(b * 16000)]); rec.decode_stream(s)
    print(f'[{a:.0f}-{b:.0f}] {s.result.text.strip()}', flush=True)
