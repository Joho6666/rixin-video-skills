"""Build a 16:9 start frame for image-to-video: subject composited on the video's dark ground.
Use the ORIGINAL mascot sprite (RGBA) or a chosen plate — never a regenerated mascot.

  python -I start_frame.py <subject.png> <out.png> [--h 600] [--bottom 80] [--bg 0E0F11]

RGBA subjects keep their alpha; RGB subjects on a dark background are keyed by luminance (> 16).
"""
import argparse
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ap = argparse.ArgumentParser()
ap.add_argument('subject'); ap.add_argument('out')
ap.add_argument('--h', type=int, default=600, help='subject height in px on a 1280x720 frame')
ap.add_argument('--bottom', type=int, default=80, help='gap below the subject; 0 = vertically centred')
ap.add_argument('--bg', default='0E0F11')
a = ap.parse_args()

W, H = 1280, 720
bg = tuple(int(a.bg[i:i + 2], 16) for i in (0, 2, 4))
yy, xx = np.mgrid[0:H, 0:W]
glow = np.exp(-(((xx - W / 2) / (W * 0.42)) ** 2 + ((yy - H / 2) / (H * 0.55)) ** 2))  # soft cool centre light
canvas = Image.fromarray(np.clip(np.array(bg, np.float32) + glow[..., None] * np.array([8, 14, 26]), 0, 255).astype(np.uint8))

src = Image.open(a.subject)
s = src.resize((int(src.width * a.h / src.height), a.h), Image.LANCZOS)
if s.mode == 'RGBA':
    mask = s.split()[3]
    shadow = Image.new('L', (W, H), 0)
    ImageDraw.Draw(shadow).ellipse((W // 2 - s.width // 3, H - a.bottom - 25, W // 2 + s.width // 3, H - a.bottom + 20), fill=150)
    canvas.paste((0, 0, 0), (0, 0), shadow.filter(ImageFilter.GaussianBlur(14)))
else:
    s = s.convert('RGB')
    mask = Image.fromarray((np.asarray(s.convert('L')) > 16).astype(np.uint8) * 255).filter(ImageFilter.GaussianBlur(2))
y = (H - s.height) // 2 if a.bottom == 0 else H - a.bottom - s.height
canvas.paste(s.convert('RGB'), ((W - s.width) // 2, y), mask)
canvas.save(a.out)
print('saved', a.out)
