"""Measure style metrics on a folder of frames (PNG, sorted by name).

usage: python -I measure.py <frames_dir> <out_json> [fps]
Works on both the reference frames and frames from my render so the
numbers are directly comparable.
"""
import sys, json, glob, os
import numpy as np
import cv2
from sklearn.cluster import KMeans

fdir, out = sys.argv[1], sys.argv[2]
fps = float(sys.argv[3]) if len(sys.argv) > 3 else 100 / 7
paths = sorted(glob.glob(os.path.join(fdir, "*.png")))
rgb = [cv2.cvtColor(cv2.imread(p), cv2.COLOR_BGR2RGB) for p in paths]
H, W = rgb[0].shape[:2]
gray = [cv2.cvtColor(f, cv2.COLOR_RGB2GRAY).astype(np.float32) for f in rgb]
ink = [(g < 128).astype(np.uint8) for g in gray]
N = len(rgb)
R = {}

# ---------- format ----------
R["format"] = dict(w=W, h=H, aspect=round(W / H, 4), fps=round(fps, 4),
                   frames=N, seconds=round(N / fps, 3))

# ---------- frame differences / cuts / holds ----------
diffs, changed = [], []
for i in range(N - 1):
    d = np.abs(gray[i + 1] - gray[i])
    diffs.append(float(d.mean()))
    changed.append(float((d > 40).mean()))
md = np.median(diffs) if diffs else 0
R["frame_diff_mean"] = [round(x, 3) for x in diffs]
R["frame_changed_frac"] = [round(x, 4) for x in changed]
R["held_frames"] = int(sum(c < 0.001 for c in changed))          # identical-ish
R["cuts"] = int(sum(d > 3 * md and d > 15 for d in diffs))
# run lengths of holds -> animating on 1s/2s/3s
runs, r = [], 1
for c in changed:
    if c < 0.001:
        r += 1
    else:
        runs.append(r); r = 1
runs.append(r)
R["hold_run_lengths"] = {str(k): runs.count(k) for k in sorted(set(runs))}

# ---------- whole-drawing drift (camera / registration) ----------
shifts = []
for i in range(N - 1):
    a = cv2.GaussianBlur(ink[i].astype(np.float32), (0, 0), 6)
    b = cv2.GaussianBlur(ink[i + 1].astype(np.float32), (0, 0), 6)
    (dx, dy), _ = cv2.phaseCorrelate(a, b)
    shifts.append(float(np.hypot(dx, dy)))
R["drawing_shift_px_median"] = round(float(np.median(shifts)), 2)
R["drawing_shift_px_max"] = round(float(np.max(shifts)), 2)
bbs = []
for m in ink:
    ys, xs = np.nonzero(m)
    bbs.append([int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())])
bb = np.array(bbs)
R["ink_bbox_mean"] = [int(v) for v in bb.mean(0)]
R["ink_bbox_std_px"] = [round(float(v), 1) for v in bb.std(0)]
R["ink_bbox_frac_of_frame"] = round(float(((bb[:, 2] - bb[:, 0]) * (bb[:, 3] - bb[:, 1])).mean() / (W * H)), 3)
cx = (bb[:, 0] + bb[:, 2]) / 2 / W; cy = (bb[:, 1] + bb[:, 3]) / 2 / H
R["ink_bbox_center_frac"] = [round(float(cx.mean()), 3), round(float(cy.mean()), 3)]

# ---------- line boil (chamfer distance of outlines, frame to frame) ----------
def edges(m):
    return cv2.morphologyEx(m, cv2.MORPH_GRADIENT, np.ones((3, 3), np.uint8)) > 0
boil_med, boil_p90 = [], []
for i in range(N - 1):
    e1 = edges(ink[i]); e2 = edges(ink[i + 1])
    dt2 = cv2.distanceTransform((~e2).astype(np.uint8), cv2.DIST_L2, 5)
    dt1 = cv2.distanceTransform((~e1).astype(np.uint8), cv2.DIST_L2, 5)
    d = np.concatenate([dt2[e1], dt1[e2]])
    d = d[d < 40]  # ignore big real motion (fingers)
    boil_med.append(float(np.median(d))); boil_p90.append(float(np.percentile(d, 90)))
R["boil_px_median"] = round(float(np.median(boil_med)), 2)
R["boil_px_p90"] = round(float(np.median(boil_p90)), 2)
R["boil_changes_every_n_frames"] = (1 if R["held_frames"] == 0 else
                                    round((N - 1) / max(1, (N - 1 - R["held_frames"])), 2))

# ---------- line weight (thin strokes only) ----------
widths = []
for m in ink[: min(N, 13)]:
    m2 = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((3, 3), np.uint8))
    dt = cv2.distanceTransform(m2, cv2.DIST_L2, 5)
    ridge = (dt >= cv2.dilate(dt, np.ones((3, 3), np.uint8)) - 1e-3) & (dt > 1)
    w = 2 * dt[ridge]
    widths.append(w[w < 24])
widths = np.concatenate(widths)
R["line_width_px_median"] = round(float(np.median(widths)), 1)
R["line_width_px_p10_p90"] = [round(float(np.percentile(widths, 10)), 1), round(float(np.percentile(widths, 90)), 1)]

# ---------- ink fill vs outline ----------
cov = [float(m.mean()) for m in ink]
R["ink_coverage_frac"] = round(float(np.mean(cov)), 4)
R["ink_coverage_std"] = round(float(np.std(cov)), 4)
solid = [cv2.erode(m, np.ones((15, 15), np.uint8)) for m in ink]
R["solid_fill_frac_of_ink"] = round(float(np.mean([s.sum() / max(1, m.sum()) for s, m in zip(solid, ink)])), 3)

# ---------- texture: speckle / dry-brush ----------
holes, specks, inkstd, paperstd = [], [], [], []
for g, m in zip(gray, ink):
    big = cv2.erode(m, np.ones((9, 9), np.uint8)) > 0
    holes.append(float((g[big] > 128).mean()) if big.any() else 0)       # white holes in solid black
    inkstd.append(float(g[big].std()) if big.any() else 0)
    n, lab, st, _ = cv2.connectedComponentsWithStats(m, 8)
    specks.append(int(((st[1:, cv2.CC_STAT_AREA] < 12)).sum()))
    paper = cv2.erode(1 - m, np.ones((25, 25), np.uint8)) > 0
    hp = g - cv2.GaussianBlur(g, (0, 0), 3)
    paperstd.append(float(hp[paper].std()))
R["white_holes_in_solid_ink_frac"] = round(float(np.mean(holes)), 4)
R["solid_ink_luma_std"] = round(float(np.mean(inkstd)), 2)
R["isolated_specks_per_frame"] = round(float(np.mean(specks)), 1)
R["paper_grain_highpass_std"] = round(float(np.mean(paperstd)), 3)

# edge raggedness: perimeter of mask vs perimeter of smoothed mask
rag = []
for m in ink:
    p1 = edges(m).sum()
    sm = (cv2.GaussianBlur(m.astype(np.float32), (0, 0), 2.5) > 0.5).astype(np.uint8)
    p2 = edges(sm).sum()
    rag.append(p1 / max(1, p2))
R["edge_raggedness_ratio"] = round(float(np.mean(rag)), 3)

# ---------- grade ----------
allg = np.concatenate([g.ravel()[::7] for g in gray])
R["luma_p2_p98"] = [round(float(np.percentile(allg, 2)), 1), round(float(np.percentile(allg, 98)), 1)]
R["luma_mean"] = round(float(allg.mean()), 2)
R["luma_std_contrast"] = round(float(allg.std()), 2)
hsv = [cv2.cvtColor(f, cv2.COLOR_RGB2HSV) for f in rgb]
sat = np.concatenate([h[..., 1].ravel()[::7] for h in hsv]).astype(np.float32) / 255
R["saturation_mean"] = round(float(sat.mean()), 4)
R["saturation_p99"] = round(float(np.percentile(sat, 99)), 4)
paper_l = []
for g, m in zip(gray, ink):
    p = cv2.erode(1 - m, np.ones((25, 25), np.uint8)) > 0
    paper_l.append(float(g[p].mean()))
R["paper_luma_per_frame_mean"] = round(float(np.mean(paper_l)), 2)
R["paper_flicker_std"] = round(float(np.std(paper_l)), 3)
ink_rgb = np.concatenate([f[g < 60] for f, g in zip(rgb, gray)])
R["ink_rgb_mean"] = [int(v) for v in ink_rgb.mean(0)]
pap_rgb = np.concatenate([f[g > 235] for f, g in zip(rgb, gray)])
R["paper_rgb_mean"] = [int(v) for v in pap_rgb.mean(0)]
# vignette: paper luma in corners vs centre-ish paper
g0 = np.mean(gray, 0); m0 = np.max(ink, 0)
c = int(0.12 * W)
corners = np.concatenate([g0[:c, :c][m0[:c, :c] == 0], g0[:c, -c:][m0[:c, -c:] == 0],
                          g0[-c:, :c][m0[-c:, :c] == 0], g0[-c:, -c:][m0[-c:, -c:] == 0]])
mid = g0[H // 2 - c: H // 2 + c, W // 2 - c: W // 2 + c][m0[H // 2 - c: H // 2 + c, W // 2 - c: W // 2 + c] == 0]
R["vignette_corner_minus_centre_luma"] = round(float(corners.mean() - (mid.mean() if mid.size else corners.mean())), 2)

# mid-tone (blush/smudge) pixels: not ink, not paper
mids = [((g > 140) & (g < 225)) for g in gray]
R["midtone_frac"] = round(float(np.mean([m.mean() for m in mids])), 5)
mid_rgb = np.concatenate([f[mm & (cv2.cvtColor(f, cv2.COLOR_RGB2HSV)[..., 1] > 20)] for f, mm in zip(rgb, mids)])
R["tinted_midtone_px_per_frame"] = int(len(mid_rgb) / N)
R["tinted_midtone_rgb_mean"] = [int(v) for v in mid_rgb.mean(0)] if len(mid_rgb) else None

# ---------- palette (k-means 12) ----------
samp = np.concatenate([f.reshape(-1, 3)[::23] for f in rgb]).astype(np.float32)
km = KMeans(12, n_init=4, random_state=0).fit(samp)
cnt = np.bincount(km.labels_, minlength=12)
order = np.argsort(-cnt)
R["palette12"] = [dict(hex="#%02x%02x%02x" % tuple(int(v) for v in km.cluster_centers_[k]),
                       share=round(float(cnt[k] / cnt.sum()), 4)) for k in order]

# ---------- per-region motion (grid of 4x4 cells) ----------
cells = 4
motion = np.zeros((cells, cells))
for i in range(N - 1):
    d = (np.abs(gray[i + 1] - gray[i]) > 40)
    for a in range(cells):
        for b in range(cells):
            motion[a, b] += d[a * H // cells:(a + 1) * H // cells, b * W // cells:(b + 1) * W // cells].mean()
R["motion_grid_4x4_changed_frac"] = (motion / max(1, N - 1)).round(3).tolist()

json.dump(R, open(out, "w"), indent=1)
print(json.dumps({k: v for k, v in R.items() if k not in ("palette12",)}, indent=None)[:4000])
print("palette", [p["hex"] + ":" + str(p["share"]) for p in R["palette12"]])
