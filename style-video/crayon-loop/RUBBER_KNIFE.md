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


---

# Version 2: one continuous take (`rubber-knife-one-take.mp4`)

Same idea, rebuilt on the transition framework (`../transitions/FRAMEWORK.md`) so the film has **no cuts**.
1000 x 1000, 100/7 fps, 128 frames, 8.96 s, silent, no text. Source: `video/src/knife/Film2.tsx`. Composition id `RubberKnifeOneTake`.

| Part | Frames | What happens | Device |
|---|---|---|---|
| A | 0-15 | Wide, black on white: he stands over her, knife raised. | - |
| T1 | 16-31 | The camera pushes into her eye (about x46). Her pupil dilates until black fills the frame. The glint in it is a blade. | seed and travel; swallow and reopen with reversed polarity; level of detail |
| B | 32-62 | Inside her eye, white crayon on black: his fist and the blade. A giant white finger comes down (8 frames), touches the blade, and it goes limp. | nested world; polarity per layer |
| T3 | 63-74 | Pull back out: the limp blade shrinks to a glint, the pupil contracts, the wide shot returns. The real knife is rigid. | travel in reverse |
| C | 75-127 | The giant finger comes down and stops short of the blade. The camera slowly pulls back and the two people get small under the hand. | scale as emotion |

What changed in meaning: in version 1 the "what if" was a lighter-drawn shot. Here it is literally inside her eye, so the rescue reads as her hope.

Measured:
- 0 held frames; every frame is a new drawing.
- No cuts. The frame-difference detector flags frames 18-19, 31-32, 64-65 and 73-74, which are the fastest frames of the two camera travels, not cuts.
- Black share goes 0.10 -> 0.88 -> 0.10 across the film (the polarity flip and back).
- The push peaks at x1.82 per frame. The reference's travels stay within about x1.15 per frame at 25 fps. Per second the two are similar
  (the push averages about x31 per second here; the reference peaks at about x33 per second), but at 14.29 fps and under 10 s the push is more abrupt frame to frame.

Not as good as the reference:
- Two transitions, against the reference's ten. Under 10 s there is no room for more without the scenes becoming unreadable.
- The reference re-poses things in perspective as it travels. This camera is flat: pan, zoom and rotate.
- The face that appears during the push is a second drawing swapped in, and it does not match the small one exactly (her hand and hair jump).
