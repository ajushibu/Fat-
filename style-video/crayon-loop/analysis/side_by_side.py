"""usage: python -I side_by_side.py out.png refA.png,refB.png mineA.png,mineB.png,..."""
import sys
from PIL import Image, ImageDraw
out, refs, mine = sys.argv[1], sys.argv[2].split(','), sys.argv[3].split(',')
S = 420
cols = max(len(refs), len(mine))
sheet = Image.new('RGB', (S * cols, S * 2 + 20), 'white')
d = ImageDraw.Draw(sheet)
for row, lst, lab in ((0, refs, 'REF'), (1, mine, 'MINE')):
    for i, p in enumerate(lst):
        sheet.paste(Image.open(p).convert('RGB').resize((S - 6, S - 6)), (i * S + 3, row * (S + 20) + 3))
        d.text((i * S + 8, row * (S + 20) + 8), f'{lab} {p.split("/")[-1]}', fill='red')
sheet.save(out)
