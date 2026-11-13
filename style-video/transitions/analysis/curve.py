"""Per-frame diff, luma, ink share, and global motion (zoom/pan/rotation via ECC-free feature estimate).
usage: python -I curve.py <frames_dir> <out.json>"""
import sys, glob, json, numpy as np, cv2
ps = sorted(glob.glob(sys.argv[1] + '/*.png'))
g = [cv2.imread(p, 0) for p in ps]
H, W = g[0].shape
rows = []
for i in range(len(g)):
    a = g[i].astype(np.float32)
    r = dict(f=i, luma=float(a.mean()), black=float((a < 85).mean()), white=float((a > 170).mean()), grey=float(((a >= 85) & (a <= 170)).mean()))
    if i:
        b = g[i - 1].astype(np.float32)
        r['diff'] = float(np.abs(a - b).mean())
        r['changed'] = float((np.abs(a - b) > 40).mean())
        # global similarity transform from tracked corners
        p0 = cv2.goodFeaturesToTrack(g[i - 1], 300, 0.01, 8)
        sc = rot = tx = ty = None
        if p0 is not None and len(p0) > 12:
            p1, st, _ = cv2.calcOpticalFlowPyrLK(g[i - 1], g[i], p0, None, winSize=(21, 21), maxLevel=3)
            ok = st.ravel() == 1
            if ok.sum() > 12:
                M, inl = cv2.estimateAffinePartial2D(p0[ok], p1[ok], method=cv2.RANSAC, ransacReprojThreshold=2.0)
                if M is not None:
                    sc = float(np.hypot(M[0, 0], M[1, 0])); rot = float(np.degrees(np.arctan2(M[1, 0], M[0, 0])))
                    tx, ty = float(M[0, 2] + (M[0, 0] - 1) * W / 2 + M[0, 1] * H / 2), float(M[1, 2] + M[1, 0] * W / 2 + (M[1, 1] - 1) * H / 2)
                    r['inl'] = float(inl.mean())
        r.update(scale=sc, rot=rot, tx=tx, ty=ty)
    rows.append(r)
json.dump(rows, open(sys.argv[2], 'w'))
d = np.array([r.get('diff', 0) for r in rows]); ch = np.array([r.get('changed', 0) for r in rows])
med = np.median(d[1:])
print('frames', len(rows), 'median diff', round(float(med), 2))
print('hard-cut candidates (diff > 6x median and > 25):', [int(i) for i in np.nonzero((d > 6 * med) & (d > 25))[0]])
held = int((ch[1:] < 0.0015).sum()); print('held frames', held, 'of', len(rows) - 1, '->', round(held / (len(rows) - 1), 3))
# hold run lengths (animation cadence)
runs, k = [], 1
for c in ch[1:]:
    if c < 0.0015: k += 1
    else: runs.append(k); k = 1
runs.append(k)
from collections import Counter; print('new-drawing run lengths (frames per drawing):', sorted(Counter(runs).items()))
# coarse timeline every 12 frames
print('f   luma black white grey  diff  scale   rot')
for i in range(0, len(rows), 12):
    seg = rows[i:i + 12]
    f = lambda k: np.mean([s[k] for s in seg if s.get(k) is not None]) if any(s.get(k) is not None for s in seg) else float('nan')
    sc = np.prod([s['scale'] for s in seg if s.get('scale')]) if any(s.get('scale') for s in seg) else float('nan')
    print(f"{i:4d} {f('luma'):5.0f} {f('black'):5.2f} {f('white'):5.2f} {f('grey'):5.2f} {f('diff'):5.1f} {sc:6.2f} {np.nansum([s['rot'] for s in seg if s.get('rot') is not None]):6.1f}")
