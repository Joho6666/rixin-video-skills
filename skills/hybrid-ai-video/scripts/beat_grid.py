"""Estimate BPM and first-beat offset of a music track, for snapping scene starts to the beat.
  python -I beat_grid.py <music.m4a|mp3|wav>
Prints: duration, BPM, first beat (s), beat period (s). Uses ffmpeg (WinGet path) + numpy only.
Measured: 剪映 7378239487698765862 Perfect Sense → 95.7 BPM, first beat 0.418 s.
"""
import subprocess
import sys

import numpy as np

FF = r"C:\Users\JOHO\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-9.0-full_build\bin\ffmpeg.exe"
SR, HOP = 22050, 512
raw = subprocess.run([FF, "-v", "error", "-i", sys.argv[1], "-ac", "1", "-ar", str(SR), "-f", "s16le", "-"], capture_output=True, check=True).stdout
x = np.frombuffer(raw, dtype=np.int16).astype(np.float32) / 32768
n = len(x) // HOP
energy = np.array([np.sum(x[i * HOP:(i + 1) * HOP] ** 2) for i in range(n)])
onset = np.maximum(0, np.diff(np.log(energy + 1e-9)))
onset -= onset.mean()
fps = SR / HOP
ac = np.correlate(onset, onset, "full")[len(onset) - 1:]
lags = np.arange(1, len(ac)) / fps
bpms = 60 / lags
ok = (bpms > 70) & (bpms < 180)
bpm = bpms[ok][np.argmax(ac[1:][ok])]
period = 60 / bpm * fps
phase = max(range(int(period)), key=lambda ph: onset[np.arange(ph, len(onset), period).astype(int)].sum())
print(f"duration {len(x) / SR:.2f} s | BPM {bpm:.1f} | first beat {phase / fps:.3f} s | beat {60 / bpm:.3f} s")
