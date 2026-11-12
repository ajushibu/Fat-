"""Per-region motion vs boil.  usage: python -I motion.py <frames_dir> <out_json> <regions_json>
regions_json: {"name": [x0,y0,x1,y1] in 0..1 fractions}
Large-displacement edges (> BIG px from nearest edge in the previous frame)
count as real motion; small displacement is boil.
"""
import sys, glob, os, json
import numpy as np, cv2

fdir, out, regs = sys.argv[1], sys.argv[2], json.loads(sys.argv[3])
paths = sorted(glob.glob(os.path.join(fdir, "*.png")))
g = [cv2.imread(p, 0) for p in paths]
H, W = g[0].shape
ink = [(x < 128).astype(np.uint8) for x in g]
edge = [cv2.morphologyEx(m, cv2.MORPH_GRADIENT, np.ones((3, 3), np.uint8)) > 0 for m in ink]
BIG = 12 * W / 1000
res = {}
for name, (a, b, c, d) in regs.items():
    x0, y0, x1, y1 = int(a * W), int(b * H), int(c * W), int(d * H)
    big, boil, cen, left = [], [], [], []
    for i in range(len(g)):
        m = ink[i][y0:y1, x0:x1]
        ys, xs = np.nonzero(m)
        cen.append([float(xs.mean() + x0), float(ys.mean() + y0)] if len(xs) else [0, 0])
        left.append(int(xs.min() + x0) if len(xs) else 0)
        if i == 0:
            continue
        e1 = edge[i][y0:y1, x0:x1]; e0 = edge[i - 1][y0:y1, x0:x1]
        dt = cv2.distanceTransform((~e0).astype(np.uint8), cv2.DIST_L2, 5)
        dd = dt[e1]
        big.append(float((dd > BIG).mean()) if dd.size else 0)
        boil.append(float(np.median(dd[dd <= BIG])) if (dd <= BIG).any() else 0)
    cen = np.array(cen)
    step = np.hypot(*np.diff(cen, axis=0).T)
    res[name] = dict(
        real_motion_frac_per_frame=[round(x, 3) for x in big],
        boil_px_median_per_frame=[round(x, 2) for x in boil],
        boil_px_median=round(float(np.median(boil)), 2),
        centroid_step_px=[round(float(s), 1) for s in step],
        centroid_range_px=[round(float(np.ptp(cen[:, 0])), 1), round(float(np.ptp(cen[:, 1])), 1)],
        leftmost_x=left,
    )
json.dump(res, open(out, "w"), indent=1)
for k, v in res.items():
    print(k, json.dumps(v))
