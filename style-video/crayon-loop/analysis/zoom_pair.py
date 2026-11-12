"""3x zoom crops side by side. usage: python -I zoom_pair.py out.png imgA x0,y0,size imgB x0,y0,size ..."""
import sys
from PIL import Image
out = sys.argv[1]; args = sys.argv[2:]
tiles = []
for i in range(0, len(args), 2):
    x, y, s = map(int, args[i + 1].split(','))
    tiles.append(Image.open(args[i]).convert('RGB').crop((x, y, x + s, y + s)).resize((720, 720), Image.NEAREST))
sheet = Image.new('RGB', (724 * len(tiles), 720), 'red')
for i, t in enumerate(tiles):
    sheet.paste(t, (i * 724, 0))
sheet.save(out)
