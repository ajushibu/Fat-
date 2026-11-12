"""Reference vs mine table. usage: python -I compare.py ref.json mine.json ref_motion.json mine_motion.json [out.md]"""
import sys, json
import numpy as np

ref, mine = json.load(open(sys.argv[1])), json.load(open(sys.argv[2]))
rm, mm = json.load(open(sys.argv[3])), json.load(open(sys.argv[4]))
rows = [
    ("fps", lambda R: R["format"]["fps"]),
    ("aspect", lambda R: R["format"]["aspect"]),
    ("held frames (share)", lambda R: round(R["held_frames"] / max(1, R["format"]["frames"] - 1), 3)),
    ("cuts", lambda R: R["cuts"]),
    ("outline boil median px", lambda R: R["boil_px_median"]),
    ("outline boil p90 px", lambda R: R["boil_px_p90"]),
    ("whole-drawing re-register median px", lambda R: R["drawing_shift_px_median"]),
    ("line width median px", lambda R: R["line_width_px_median"]),
    ("line width p10/p90 px", lambda R: R["line_width_px_p10_p90"]),
    ("edge raggedness", lambda R: R["edge_raggedness_ratio"]),
    ("isolated specks / frame", lambda R: R["isolated_specks_per_frame"]),
    ("ink coverage", lambda R: R["ink_coverage_frac"]),
    ("solid fill share of ink", lambda R: R["solid_fill_frac_of_ink"]),
    ("fill luma std (streaks)", lambda R: R["solid_ink_luma_std"]),
    ("luma p2 / p98", lambda R: R["luma_p2_p98"]),
    ("luma mean", lambda R: R["luma_mean"]),
    ("contrast (luma std)", lambda R: R["luma_std_contrast"]),
    ("saturation mean", lambda R: R["saturation_mean"]),
    ("mid-tone share (not ink/paper)", lambda R: R["midtone_frac"]),
    ("paper RGB", lambda R: R["paper_rgb_mean"]),
    ("ink RGB", lambda R: R["ink_rgb_mean"]),
    ("vignette (corner-centre luma)", lambda R: R["vignette_corner_minus_centre_luma"]),
    ("paper grain (hp std)", lambda R: R["paper_grain_highpass_std"]),
    ("flicker (paper luma std)", lambda R: R["paper_flicker_std"]),
    ("figure bbox share of frame", lambda R: R["ink_bbox_frac_of_frame"]),
    ("figure centre (x,y)", lambda R: R["ink_bbox_center_frac"]),
    ("palette top 3", lambda R: " ".join(p["hex"] for p in R["palette12"][:3])),
]
out = ["| Metric | Reference | Mine |", "|---|---|---|"]
for name, f in rows:
    out.append(f"| {name} | {f(ref)} | {f(mine)} |")


def frac_moving(m):  # share of frames where some region has real (>12px) motion
    arr = np.max(np.array([v["real_motion_frac_per_frame"] for v in m.values()]), axis=0)
    return round(float((arr > 0.015).mean()), 2)


out.append(f"| frames with real motion somewhere (>1.5% edges moved >12px) | {frac_moving(rm)} | {frac_moving(mm)} |")
txt = "\n".join(out)
print(txt)
if len(sys.argv) > 5:
    open(sys.argv[5], "w").write(txt + "\n")
