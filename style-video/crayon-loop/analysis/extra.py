"""Extra measurements: per-region line width, fill speckle, smudge blobs, tonal levels.
usage: python -I extra.py <frames_dir> <regions_json> <sweater_box_json>"""
import sys, glob, os, json
import numpy as np, cv2

fdir = sys.argv[1]; regs = json.loads(sys.argv[2]); sw = json.loads(sys.argv[3])
g = [cv2.imread(p, 0) for p in sorted(glob.glob(os.path.join(fdir, "*.png")))]
H, W = g[0].shape
print("unique grey levels in frame 0:", len(np.unique(g[0])))
hist = np.bincount(np.concatenate([x.ravel() for x in g]), minlength=256)
print("share luma<40:", round(hist[:40].sum() / hist.sum(), 4), " 40-215:", round(hist[40:215].sum() / hist.sum(), 4), " >=215:", round(hist[215:].sum() / hist.sum(), 4))

def width(m):
    dt = cv2.distanceTransform(m, cv2.DIST_L2, 5)
    ridge = (dt >= cv2.dilate(dt, np.ones((3, 3), np.uint8)) - 1e-3) & (dt > 1)
    w = 2 * dt[ridge]
    return w[w < 30]
for name, (a, b, c, d) in regs.items():
    ws = np.concatenate([width((x < 128).astype(np.uint8)[int(b * H):int(d * H), int(a * W):int(c * W)]) for x in g])
    print(f"line width {name}: median {np.median(ws):.1f}  p10 {np.percentile(ws,10):.1f}  p90 {np.percentile(ws,90):.1f}")

# speckle inside the black fill (sweater)
a, b, c, d = sw
fr = []
for x in g:
    crop = x[int(b * H):int(d * H), int(a * W):int(c * W)]
    m = (crop < 128).astype(np.uint8)
    filled = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((21, 21), np.uint8))
    inner = cv2.erode(filled, np.ones((15, 15), np.uint8)) > 0
    fr.append(((crop[inner] > 100).mean(), crop[inner].mean()))
fr = np.array(fr)
print("fill: light-speck frac", round(fr[:, 0].mean(), 4), " mean luma inside fill", round(fr[:, 1].mean(), 1))

# smudge blobs: mid-grey regions (not anti-alias rims)
sm = []
for x in g:
    m = ((x > 150) & (x < 238)).astype(np.uint8)
    inkd = cv2.dilate((x < 150).astype(np.uint8), np.ones((5, 5), np.uint8))
    m[inkd > 0] = 0
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((7, 7), np.uint8))
    n, lab, st, cen = cv2.connectedComponentsWithStats(m, 8)
    big = [(int(st[i, 4]), int(cen[i][0]), int(cen[i][1]), int(st[i, 2]), int(st[i, 3]),
            int(x[lab == i].mean())) for i in range(1, n) if st[i, 4] > 150]
    sm.append(big)
print("smudge blobs (area,cx,cy,w,h,meanluma) per frame:")
for i, s in enumerate(sm):
    print(i, s[:4])
