# STYLE BIBLE: "dry crayon, redrawn every frame"

Source: Pinterest pin `pin.it/14t9Agpte` (served as a GIF). All numbers were measured with
`analysis/measure.py`, `analysis/motion.py` and `analysis/extra.py` on all 13 frames.
Pixel values are at 1000 × 1000. Raw output is in `analysis/out/ref_*.json`.

## 1. Format
| Property | Value |
|---|---|
| Resolution | 1000 × 1000, aspect **1:1** |
| Frame rate | 70 ms per frame = **14.2857 fps** (100/7), constant |
| Length | 13 frames = 0.91 s, seamless loop |
| Cuts | **0** (one shot). Frame diffs are flat: mean abs diff 10.1–13.5 luma every frame, no spikes |
| Shot length | the whole clip (a loop) |

## 2. Palette and grade
- **Pure greyscale.** Mean saturation 0.000, p99 saturation 0.000. No colour anywhere.
- Paper `#fdfdfd` (RGB 253), flat. Ink `#0a0a0a` (RGB 10).
- Luma p2 / p98 = **1 / 254**: full-range black and white.
- Luma mean 213.8, std (contrast) 89.1.
- Tonal split: 15.0% of pixels below 40, **2.4% mid-grey** (40–215), 82.7% above 215.
- Ink covers **16.5%** of the frame (std 0.4% across frames).
- k-means 12 palette (share): `#fdfdfd` 82.3% · `#030303` 8.0% · `#0c0c0c` 6.0% · `#1b1b1b` 0.9% ·
  `#2e2e2e` 0.5% · `#424242` 0.4% · `#e3e3e3` 0.3% · `#575757` 0.3% · `#707070` 0.3% · `#c6c6c6` 0.3% ·
  `#a8a8a8` 0.3% · `#8b8b8b` 0.3%. Everything except paper and the two blacks is soft crayon edge.
- **No vignette** (corner − centre paper luma = +0.3). **No paper grain** (high-pass std 0.25).
  **No flicker** (paper luma std 0.005 across frames). No blur, no glow.

## 3. Line and texture
- One tool: a **dry crayon / pencil brush**, black only.
- Line weight (median, p10–p90):
  - face and hand outlines: **4.4 px** (2.8–7.2 px)
  - hair scribble and table line: **6.4 px** (4.0–12.8 px)
  - weight does **not** change with depth (the foreground hands match the face)
- Edge raggedness (ink perimeter ÷ perimeter after a σ2.5 smooth): **1.96**. Edges are grainy and broken, never vector-clean.
- About **70 isolated specks** (< 12 px) per frame: crumbs of dry brush along the strokes.
- Strokes don't close. Outlines stop short or overshoot at corners (the chin, the sleeve ends), with open line ends.
- Solid fills are **black scribble mass**: mean luma inside the fill is 12. 1.7% of fill pixels are light specks,
  and directional hatch streaks show inside (luma std 8.3). 43% of all ink is solid fill (survives a 15 px erosion).

## 4. Lighting and shading
- **None.** No cast shadows, no form shading. Clothing is solid black. Skin, hands and table are paper white.
- The only mid-tone is a **soft grey cheek smudge**: luma 235–248, 22–46 px blob. It shows as a blob in 5 of 13 frames;
  in the other frames it's a tiny thin squiggle in the same spot.

## 5. Shape language and character rules
- Head: one long wedge or **beak-shaped nose**, drawn as a single continuous line from the brow to the tip and back to the chin.
  No mouth, or the chin line implies one.
- Eye: **one** mark, a dot (≈ 8 px) or a short dash, chosen fresh each frame.
- Hair: a dense **scribble cluster** of looping 6–12 px strokes at the back of the head. **Re-scribbled from scratch every frame**
  (the hair's region stays put, centroid range 10 × 20 px, but the strokes never repeat).
- Neck: two thin parallel lines.
- Body: one big **solid black mass** (sweater or coat) with a soft trapezoid silhouette, about 30–40% of the figure's area.
- Hands: **oversized** (hand width ≈ head width), white, drawn as parallel sausage fingers with **curled tip loops**
  and lines that stop short of the palm.
- Setting: **nothing** but one horizontal table line that runs off past the figure's silhouette. White void.
- Framing: the figure fills **51%** of the frame (ink bbox), centred at (0.53, 0.51), with about 15% white margin on every side.

## 6. Motion cadence and easing
- **Animated on 1s at 14.29 fps.** 0 held frames out of 13. Every frame is a full redraw.
- The same cadence applies to every layer: character, hair and table line all change every frame. There's no background layer.
- Boil: outline displacement frame to frame is median **2.0 px**, p90 **9.8 px**. The whole drawing re-registers each frame
  by median 2.0 px (max 12 px). The ink bbox edges wobble by std 7–15 px.
- Fill texture is fully reshuffled every frame (in the sweater, 14–51% of edge pixels move > 12 px between frames).
- Action (the finger drum): the cycle is **13 frames (0.91 s)**. The lift and roll take **frames 1–5 (≈ 5 frames, 0.35 s)** to peak,
  then settle and ripple over **frames 6–12 (7 frames, 0.5 s)**. Hand centroid steps are 0.4–19 px per frame and irregular, with no
  slow-in or slow-out. Spacing is **near-linear with hand-drawn irregularity (±50% per frame)**. No anticipation, no overshoot,
  no squash and stretch. Motion lives in small parts (fingers); the body and head only boil.

## 7. Camera
- **Static.** No pan, no zoom, no shake beyond the 2 px redraw registration jitter. No parallax (no layers).

## 8. Cut rhythm
- **No cuts.** One continuous shot that loops.

## 9. Density and layering
- Minimal: one figure, one prop line, no clutter. The only idle motion is the boil itself: hair re-scribble, eye-mark swap,
  smudge appearing and disappearing.

## 10. The traits that make it feel like this creator (checkable)
1. **Full redraw on 1s at 14.29 fps.** 0 held frames, about 2 px median outline boil, hair re-scribbled every frame.
2. **Black-and-white crayon only.** Saturation 0, ink `#0a0a0a` on `#fdfdfd`, 2.4% mid-tones, ragged edges (ratio ≈ 2.0).
3. **Solid black clothing mass vs. empty white skin.** About 43% of ink is solid fill; faces and hands are pure outline.
4. **Caricature shorthand.** A single beak-nose line, a one-mark eye, a scribble-ball of hair, giant sausage-finger hands with tip loops.
5. **A white void with one table line,** and a static camera. A tiny, even action (fingers) carries the whole piece.

## Checklist for my render
| Check | Target |
|---|---|
| fps / aspect | 14.2857 / 1:1 |
| held frames | 0 |
| outline boil median / p90 | ≈ 2 px / ≈ 10 px |
| saturation mean | 0 |
| luma p2 / p98 | ≈ 1 / 254 |
| ink coverage | ≈ 16% |
| mid-tone share | ≈ 2–3% |
| line width outline / scribble | ≈ 4.4 / 6.4 px |
| edge raggedness | ≈ 2.0 |
| vignette / grain / flicker | none |
| camera | static, ≤ 12 px registration jitter |
| cuts | 0 |
| action timing | ≈ 5 frames to peak, ≈ 7 frames to settle, near-linear spacing |

---

## Results: reference vs my render (after 3 compare-and-fix rounds)

Render: `tea-break.mp4`, an original character ("Tea break": she blows on her tea, sips it, then exhales with her eyes shut).
1000 × 1000, 100/7 fps, 72 frames, 5.04 s, silent. Source: `video/src/Scene.tsx`.
Round tables: `analysis/out/compare_round1.md`, `compare_round2.md`, `compare_round3.md` (final, below).

| Metric | Reference | Mine |
|---|---|---|
| fps | 14.2857 | 14.2857 |
| aspect | 1.0 | 1.0 |
| held frames (share) | 0.0 | 0.0 |
| cuts | 0 | 0 |
| outline boil median px | 2.0 | 1.4 |
| outline boil p90 px | 9.79 | 7.59 |
| whole-drawing re-register median px | 2.01 | 3.57 |
| line width median px | 6.0 | 6.0 |
| line width p10/p90 px | [4.0, 10.4] | [4.4, 10.4] |
| edge raggedness | 1.958 | 1.726 |
| isolated specks / frame | 69.6 | 119.8 |
| ink coverage | 0.1648 | 0.1505 |
| solid fill share of ink | 0.431 | 0.472 |
| fill luma std (streaks) | 8.3 | 9.67 |
| luma p2 / p98 | [1.0, 254.0] | [2.0, 253.0] |
| luma mean | 213.82 | 215.43 |
| contrast (luma std) | 89.12 | 88.76 |
| saturation mean | 0.0 | 0.0 |
| mid-tone share (not ink/paper) | 0.00826 | 0.00296 |
| paper RGB | [253, 253, 253] | [252, 252, 252] |
| ink RGB | [10, 10, 10] | [3, 3, 3] |
| vignette (corner-centre luma) | 0.3 | 0.04 |
| paper grain (hp std) | 0.248 | 0.311 |
| flicker (paper luma std) | 0.005 | 0.008 |
| figure bbox share of frame | 0.511 | 0.525 |
| figure centre (x,y) | [0.526, 0.511] | [0.51, 0.508] |
| palette top 3 | #fdfdfd #030303 #0c0c0c | #fdfdfd #010101 #222222 |
| frames with real motion somewhere (>1.5% edges moved >12px) | 1.0 | 1.0 |

**Matched:** fps, aspect, 0 held frames (on 1s), 0 cuts, static camera, line width (6.0 px median, p10–p90 4.4–10.4),
greyscale (saturation 0), black and white points, contrast (88.8 vs 89.1), solid fill share (0.47 vs 0.43), framing (bbox 0.53 vs 0.51, centre within 0.02),
no vignette, grain or flicker.

**Still off (honest list):**
- Outline boil is a bit low: median 1.4 vs 2.0 px, p90 7.6 vs 9.8 px. The whole drawing also shifts more as a block (3.6 vs 2.0 px).
  So the wobble is slightly too "global warp" and not enough "redrawn line".
- Isolated specks: 120 vs 70 per frame (too crumbly). Mid-tone share: 0.30% vs 0.83% (edges are harder than the reference's soft crayon falloff).
  Raising the edge blur fixed the mid-tones but wiped out the grain (tried a blur of 1.0 in round 3: raggedness fell to 1.15), so I kept 0.7.
- Ink coverage: 15.1% vs 16.5%. My character is a bit lighter on black.
- Not measured but visible: the reference's bodies are angular and diagonal, while mine is a rounder bell shape. Her cup and hands are more
  "constructed" than his loose finger fan.

Deliberate deviations from the brief:
- **No camera move.** The reference camera is measured as static, so a move would break the style.
- **Minimal clutter.** The reference has one table line and nothing else, so density comes from scribble texture and idle boil
  (hair re-scribble, eye-mark swap, smudge, steam, thumb rub on a 13-frame cycle), not props.

### Re-render
```
cd video && npm i
npx remotion render src/index.ts TeaBreak out/frames --sequence --image-format=png \
  --browser-executable=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell
ffmpeg -framerate 100/7 -i out/frames/element-%02d.png -c:v libx264 -crf 14 -pix_fmt yuv420p -an ../tea-break.mp4
python -I ../analysis/measure.py out/frames ../analysis/out/mine_metrics.json
```
(`--browser-executable` is only needed if Remotion can't download its own browser.)
