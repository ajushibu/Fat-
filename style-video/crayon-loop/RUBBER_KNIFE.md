# Rubber knife

> Imagine a murderer standing over his victim, knife raised. An all-powerful God could turn that knife to rubber. So why doesn't he?

A silent film that poses the question without answering it, and without words.
Drawn in the dry-crayon style measured in `STYLE.md`, with the same brush as `tea-break.mp4`.

`rubber-knife.mp4`: 1000 x 1000, 100/7 fps (14.29), 128 frames, 8.96 s, no audio. Every frame is a new drawing (on 1s).
Source: `video/src/knife/Film.tsx` (shots) and `video/src/knife/kit.tsx` (drawing kit). Composition id `RubberKnife`.

## Shots

| # | Frames | Length | Framing | What happens |
|---|---|---|---|---|
| S1 | 0-21 | 1.54 s | wide | A man in a black coat and flat cap stands over a woman on the floor, knife raised. His fist and her raised hand tremble. |
| S2 | 22-33 | 0.84 s | close-up | Her face: one wide eye, open mouth, her hand up between them. |
| S3 | 34-45 | 0.84 s | close-up, low | His fist and the blade against white. |
| S4 | 46-77 | 2.24 s | wide (same framing as S1) | **Imagined**, drawn with a lighter hand and cross-hatched instead of solid black. A giant finger comes down from the top right (10 frames), touches the blade, and the blade goes limp and flops over his cap (6 frames to droop, a damped wobble). He looks up, puzzled. The hand lifts away. |
| S5 | 78-89 | 0.84 s | close-up | **Imagined.** His face, looking up at the knife hanging limp off his fist. His brow goes from angry to puzzled. |
| S6 | 90-127 | 2.66 s | wide (same framing as S1) | **Real** again: solid black, rigid blade. The giant finger comes down the same path and stops about 30 px short of the blade. Hold for 2 s with only the boil moving. |

## Choices

- **No text.** The question is carried by repetition: the same wide framing three times (setup, the "what if", reality), and the gap between the finger and the blade at the end.
- **Imagined vs real without words.** The "what if" shots use the same crayon at lower pressure, with black areas cross-hatched instead of filled. Reality is solid black.
- **Non-graphic.** The blade never comes down; no injury is shown.
- **Style rules kept from the reference:** on 1s at 14.29 fps, no held frames, a static camera within each shot, one table/floor line and a white void,
  pressure-based crayon line, stroke-built black, one mark per facial feature, hair re-scribbled every frame, near-linear motion with no easing.
- **Style rules changed on purpose:** the reference is a single shot; this has 5 hard cuts because you asked for multiple compositions.
  The rubber blade wobbles (an overshoot the reference never has), because that is what rubber does.

## Measured (whole film vs reference)

| Metric | Reference | Film |
|---|---|---|
| fps / aspect | 14.2857 / 1:1 | 14.2857 / 1:1 |
| held frames | 0 | 0 |
| cuts | 0 | 5 (at frames 22, 34, 46, 78, 90; as designed) |
| line width median, p10-p90 px | 6.0, 4.0-10.4 | 7.2, 4.0-10.0 |
| edge raggedness | 1.96 | 1.99 |
| saturation | 0 | 0 |
| ink / paper RGB | 10 / 253 | 9 / 252 |
| ink coverage | 16.5% | 9.4% |
| solid share of ink | 0.43 | 0.22 |
| outline boil median / p90 px | 2.0 / 9.8 | 1.0 / 5.0 |

Coverage and solid share are lower by design: the wide shots have small figures in a lot of white, and two shots are deliberately drawn light.
Boil is lower because most of the wide-shot detail is small; the per-part redraw is the same as in the tea clip.

## Re-render
```
cd video
npx remotion render src/index.ts RubberKnife out/knife --sequence --image-format=png \
  --browser-executable=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell
ffmpeg -framerate 100/7 -i out/knife/element-%03d.png -c:v libx264 -crf 12 -pix_fmt yuv420p -an ../rubber-knife.mp4
node preview.cjs Film /tmp/knife 10 60 120    # quick stills
```
