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


## 11. Nuances found on a second, closer look (3x zoom crops)

These are the less obvious things that make the reference read as a hand-made crayon drawing. Each is checkable in a zoomed frame.

- **The line reacts to pressure.** Heavy strokes (hair) are solid with a fuzzy edge. Normal strokes are slightly dry. Light strokes
  (the start of the forehead line, the nail curls) dissolve into dots. One stroke often changes pressure part-way along.
- **Grain is 1-3 px**, strongest at the stroke edge, with a few loose crumbs within about 4 px of the line.
- **The line trembles** about 1 px at a 20-45 px wavelength. Nothing is ruler-straight or vector-smooth.
- **Lines cross and restate.** The under-nose line overshoots the face line by 3-5 px. Finger lines are sometimes drawn twice, 2-4 px apart.
  Lines stop short or overshoot at corners.
- **The black is stroke-built.** It is a solid mass with a rough outline, a few stroke tails poking 8-20 px past the edge, sparse irregular flecks,
  and faint streaks running along the fill direction and across it (a woven look). Flecks are 1.7% of the fill.
- **The black is a pixel-scale mottle** of two near-blacks (#030303 and #0c0c0c), not one flat value.
- **Parts are redrawn independently.** Phase correlation of the whole frame gives a 2.0 px shift per frame, but each half moves 4-5 px.
  The head, hands and body each land in a slightly different place, size and angle every frame, and it averages out.
- **Per-part boil differs:** head outline 1.0 px, hands 1.0 px, hair 1.4 px, but the sweater edge and flecks move 4.7 px (it is re-filled every frame).
- **One mark per feature:** eye = dot or dash; mouth = a tiny separate dash; cheek = 2-4 faint scratches, or a soft grey smudge in 5 of 13 frames.
- **Construction is angular:** the clothing is a straight-edged mass with corners, not a blob.

---

## Results: reference vs my render (version 2, rebuilt)

Render: `tea-break.mp4`, an original character ("Tea break": she blows on her tea, sips it, then sighs with her eyes shut and a small smile).
1000 x 1000, 100/7 fps, 72 frames, 5.04 s, silent.

How it is built:
- `video/src/brush.tsx`: the crayon. Every stroke is a variable-width ribbon whose opacity is its pressure. An SVG filter blurs the pressure
  slightly, multiplies it by paper tooth (feTurbulence, new seed every frame) and thresholds it. Black areas are filled with rows of strokes.
- `video/src/Drawing.tsx`: the picture, as a pure function of the frame number. Every part gets a fresh position, size and angle each frame;
  the hair is re-scribbled from scratch; the eye and cheek marks are re-chosen.
- `video/preview.cjs`: fast preview of any frame without the Remotion bundler (pixel-identical to the Remotion render, checked on 3 frames).

| Metric | Reference | Mine |
|---|---|---|
| fps | 14.2857 | 14.2857 |
| aspect | 1.0 | 1.0 |
| held frames (share) | 0.0 | 0.0 |
| cuts | 0 | 0 |
| outline boil median px | 2.0 | 1.0 |
| outline boil p90 px | 9.79 | 7.99 |
| whole-drawing re-register median px | 2.01 | 2.99 |
| line width median px | 6.0 | 8.0 |
| line width p10/p90 px | [4.0, 10.4] | [4.0, 12.0] |
| edge raggedness | 1.958 | 1.899 |
| isolated specks / frame | 69.6 | 42.9 |
| ink coverage | 0.1648 | 0.1664 |
| solid fill share of ink | 0.431 | 0.473 |
| fill luma std (streaks) | 8.3 | 6.11 |
| luma p2 / p98 | [1.0, 254.0] | [3.0, 253.0] |
| luma mean | 213.82 | 212.04 |
| contrast (luma std) | 89.12 | 90.46 |
| saturation mean | 0.0 | 0.0 |
| mid-tone share (not ink/paper) | 0.00826 | 0.00736 |
| paper RGB | [253, 253, 253] | [252, 252, 252] |
| ink RGB | [10, 10, 10] | [7, 7, 7] |
| vignette (corner-centre luma) | 0.3 | 0.08 |
| paper grain (hp std) | 0.248 | 0.228 |
| flicker (paper luma std) | 0.005 | 0.017 |
| figure bbox share of frame | 0.511 | 0.498 |
| figure centre (x,y) | [0.526, 0.511] | [0.511, 0.515] |
| palette top 3 | #fdfdfd #030303 #0c0c0c | #fdfdfd #070707 #030303 |
| frames with real motion somewhere (>1.5% edges moved >12px) | 1.0 | 1.0 |

Per-part numbers (reference / mine):

| Metric | Reference | Mine |
|---|---|---|
| face outline width, median px | 4.4 | 4.4 |
| hand outline width, median px | 4.4 | 4.4 |
| hair stroke width, median / p90 px | 6.4 / 12.8 | 4.4 / 11.6 |
| boil, head outline, median px | 1.0 | 1.0 |
| boil, hands, median px | 1.0 | 1.0 |
| boil, hair, median px | 1.4 | 1.0 |
| boil, black clothing, median px | 4.7 | 4.4 |
| flecks inside the black fill | 1.7% | 1.2% |
| mean luma inside the black fill | 12.1 | 9.8 |
| frame shift, horizontal / vertical, median px | 1.5 / 1.0 | 2.0 / 1.9 |
| tonal split: dark / mid / light | 15.0% / 2.4% / 82.7% | 15.9% / 1.5% / 82.6% |

**Matched:** fps, aspect, 0 held frames (on 1s), 0 cuts, static camera, greyscale, paper and ink values, contrast (90.5 vs 89.1), ink coverage
(16.6% vs 16.5%), edge raggedness (1.90 vs 1.96), outline width for face and hands (4.4 px both), per-part boil, solid share (0.47 vs 0.43),
framing (bbox 0.50 vs 0.51, centre within 0.02), no vignette, paper grain or flicker.

**Still off (honest list):**
- Loose crumbs: 43 vs 70 per frame. My line is a little too tidy at its edges.
- The whole drawing shifts 3.0 px per frame vs 2.0 px. The parts are slightly more correlated than in the reference.
- The frame-wide boil figure is lower (1.0 / 8.0 vs 2.0 / 9.8 px) even though each part matches. The reference has proportionally more
  stroke-filled black edge, which is where the big movement lives.
- Fill texture is a bit quieter: luma std 6.1 vs 8.3, flecks 1.2% vs 1.7%.
- Hair strokes are thinner on median (4.4 vs 6.4 px).
- Draftsmanship. The reference's hand is a better drawing than mine: longer, looser fingers with more variety from frame to frame.
  Mine is built from the same parts (parallel sausage fingers, nail curls) but is stiffer.
- The action timing is taken from a 13-frame reference (5 frames to a peak, 7 to settle, even spacing). That is thin evidence for a 72-frame clip.

Deliberate deviations from the brief:
- **No camera move.** The reference camera is measured as static, so a move would break the style.
- **No added props or clutter.** The reference has one table line and nothing else. Density comes from texture and small idle changes:
  hair re-scribble, eye-mark swap, cheek marks, steam, and a thumb rub on the reference's 13-frame cycle.
- **Vignette, paper grain and flicker are off**, because all three measured at about zero on the reference.

Version 1 (kept for history in `analysis/out/compare_round1-3.md`) matched many of the same numbers but was a vector drawing with a noise
filter: uniform line weight, flat fills, smooth shapes. Version 2 replaced the brush, the fills, the construction and the redraw model.

### Re-render
```
cd video && npm i
npx remotion render src/index.ts TeaBreak out/frames --sequence --image-format=png \
  --browser-executable=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell
ffmpeg -framerate 100/7 -i out/frames/element-%02d.png -c:v libx264 -crf 12 -pix_fmt yuv420p -an ../tea-break.mp4
python -I ../analysis/measure.py out/frames ../analysis/out/mine_metrics.json
node preview.cjs Drawing /tmp/preview 0 26 46 66     # quick stills of single frames
```
(`--browser-executable` is only needed if Remotion can't download its own browser.)
