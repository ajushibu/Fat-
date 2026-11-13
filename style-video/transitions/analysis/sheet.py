"""contact sheet. usage: python -I sheet.py <frames_dir> <out.png> <start> <stop> <step> [cols] [tile_w]"""
import sys, glob
from PIL import Image, ImageDraw
d, out, a, b, st = sys.argv[1], sys.argv[2], int(sys.argv[3]), int(sys.argv[4]), int(sys.argv[5])
cols = int(sys.argv[6]) if len(sys.argv) > 6 else 8
W = int(sys.argv[7]) if len(sys.argv) > 7 else 320
ps = sorted(glob.glob(d + '/*.png'))
sel = list(range(a, min(b, len(ps)), st))
im0 = Image.open(ps[0]); H = int(W * im0.height / im0.width)
rows = (len(sel) + cols - 1) // cols
sh = Image.new('RGB', (W * cols, H * rows), 'white'); dr = ImageDraw.Draw(sh)
for i, k in enumerate(sel):
    sh.paste(Image.open(ps[k]).convert('RGB').resize((W - 2, H - 2), Image.LANCZOS), ((i % cols) * W + 1, (i // cols) * H + 1))
    dr.rectangle(((i % cols) * W + 2, (i // cols) * H + 2, (i % cols) * W + 34, (i // cols) * H + 14), fill='white')
    dr.text(((i % cols) * W + 4, (i // cols) * H + 2), str(k), fill='red')
sh.save(out)
