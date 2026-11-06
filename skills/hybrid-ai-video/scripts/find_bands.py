"""Find the horizontal layers of an exploded-view render on a plain dark background.
  python -I find_bands.py exploded.png [--thr 18] [--min 8]
Prints image size, each band [y0, y1] with its x extent, and cut lines (midpoints between bands)
ready to paste into EX_BANDS / EX_X of bp.tsx.
"""
import argparse
import numpy as np
from PIL import Image

ap = argparse.ArgumentParser()
ap.add_argument('img'); ap.add_argument('--thr', type=float, default=18); ap.add_argument('--min', type=int, default=8)
a = ap.parse_args()
im = np.asarray(Image.open(a.img).convert('L')).astype(float)
bg = np.median(im[:, :20])
on = np.abs(im - bg) > a.thr
rows = on.sum(1) > 6
bands, start = [], None
for y, r in enumerate(rows):
    if r and start is None: start = y
    if not r and start is not None:
        if y - start > a.min: bands.append((start, y))
        start = None
if start is not None: bands.append((start, len(rows)))
ext = []
for y0, y1 in bands:
    cols = np.where(on[y0:y1].sum(0) > 3)[0]
    ext.append((int(cols.min()), int(cols.max())))
cuts = [0] + [(bands[i][1] + bands[i + 1][0]) // 2 for i in range(len(bands) - 1)] + [im.shape[0]]
print('size (w,h):', im.shape[1], im.shape[0], 'bg:', bg)
for b, e in zip(bands, ext): print('band', b, 'x', e)
print('EX_BANDS =', [[cuts[i], cuts[i + 1]] for i in range(len(bands))])
print('EX_X =', [list(e) for e in ext])
