# Transition framework

Groundwork for continuous, "one image turns into the next" transitions, in the dry-crayon style.
Built from a frame-by-frame study of a second reference (Pinterest pin `pin.it/3oWMFQEyM`: 45.8 s, 640 x 360, 25 fps, 1147 frames).
Code: `../crayon-loop/video/src/flow/`. First film made with it: `../crayon-loop/rubber-knife-one-take.mp4`.

## 1. What the reference does

It is almost one continuous take. Out of about a dozen scene changes, 2 are hard cuts. 89% of frames are new drawings (on 1s at 25 fps).
Scripts: `analysis/curve.py` (per-frame difference, tone, camera scale and rotation), `analysis/sheet.py` (contact sheets).

| # | Frames | Device | What happens | Measured |
|---|---|---|---|---|
| 1 | 0-70 | Seed and travel | The next scene (a house) is in frame 0 as a speck at the end of a road. The camera travels to it; the building is re-posed as it nears. | zoom up to x3.8 per 12 frames |
| 2 | 60-130 | Figure/ground swap through a shape | Pushing into a window, the white bars become white streets and the black panes become roofs. | rotation about -37 deg per 12 frames; black share 0.08 -> 0.47 |
| 3 | 172-244 | Swallow to a point, reopen with reversed polarity | The city spins and shrinks to a dot on black; the dot becomes a door ajar; a room is drawn white on black. | black share 0.24 -> 1.00 in about 25 frames |
| 4 | 276-330 | Scale as emotion | The figure folds and shrinks to a ball in the black, then a hard cut to an extreme close-up. | one of the 2 hard cuts (frame 324) |
| 5 | 378-420 | One shape, many identities | A white area is a body, then a wedge, then a book page, then a ribbon, then a cone of light. It never leaves the screen. | - |
| 6 | 486-513 | Shape wipe | Two lines grow into arms; a slit of light between them widens until the frame is white. | black share 0.99 -> 0.01 in about 20 frames |
| 7 | 513-540 | Line becomes contour | A line draws itself across the blank frame and houses grow out of it. | - |
| 8 | 606-630 | Body wipe | A giant black figure crosses the frame; the scene behind it has changed when it clears. | - |
| 9 | 690-768 | Fill to paper, contour wipe | A giant white leg fills the frame (the screen is now blank paper); its outline sweeps across to reveal the coast. | - |
| 10 | 841-1146 | Nested worlds | The landscape darkens into the view from a window; the room is on a bookshelf. Slow pull-back for the last 12 s. | zoom x0.96-0.97 per 12 frames |

Nuances that make these work:
- **The destination is planted early.** The next scene is already on screen as a small mark before the transition starts.
- **Black and white are both "paper".** Any large black or white shape can become the background of the next scene.
- **Shapes have no fixed identity.** A shape keeps its outline while what it "is" changes.
- **The camera never stops.** Zoom, rotation and drift carry on through the change, so there is no moment to cut on.
- **Detail arrives with size.** Things gain lines as they grow and lose them as they shrink.
- **Only one thing changes at a time.** During a polarity flip the shapes hold; during a morph the camera is calm.

## 2. What has to exist before such transitions are possible

| Groundwork | Why | Where |
|---|---|---|
| **One world, one camera.** Scenes are drawn in world coordinates and a camera maps world to frame. | Travel, rotation and pull-backs become camera moves, not redraws. | `flow/camera.ts`: `Cam`, `camXf`, `travel` |
| **Nesting at any scale.** A whole scene can be placed inside a dot. | Seed and travel, nested worlds. | `place`, `camFor`, `compose` |
| **Log-scale travel that keeps a focus point on a straight screen path.** | A push from x1 to x50 feels even all the way. | `travel(a, b, p, focus)` |
| **Line weight in frame pixels; detail by on-screen size.** | The crayon line stays the same weight at any zoom; drawings gain and lose detail. | `lod`, the `size` checks in a scene |
| **Polarity per layer.** Black crayon on white and white crayon on black in the same frame. | Reopening inside a black shape; swallow and reopen. | `kit.setPol`, the `...w` filters in `brush.tsx` |
| **Shapes that outgrow the frame.** Fills are clipped to the frame and anything off-frame is skipped. | A pupil, a leg or a pane can fill the screen and become the paper. | `shape.ts`: `clipToRect`, `offFrame`; `kit.black` |
| **Identity-free shapes with point correspondence.** | One outline can turn into another. | `morphPoly`, `resample` |
| **Lines that draw themselves.** | Line becomes contour. | stroke option `draw` |
| **Clip regions along a moving contour.** | Body wipes and contour wipes: scene A outside the edge, scene B inside. | `kit.clip(poly, outside)` |
| **Paper-coloured strokes.** | Lines on top of a solid mass, in either polarity. | stroke option `paperInk` |
| **Frame swapping mid-drawing.** | Draw the outer world, then the nested one, in one frame. | `kit.setFrame` |
| **A timeline of overlapping moves** on the measured near-linear spacing. | Transitions overlap the scenes they join. | `act(frame, start, length, key)` |

`flow/FlowTest.tsx` is a test card that exercises each primitive (polarity inside a growing disc, a morph, a self-drawing line that grows a house,
a contour wipe, a camera looking into a nested scene). Render it with `node preview.cjs FlowTest /tmp/ft 0 5 10`.

## 3. Reference device -> how to build it

| Device | Recipe |
|---|---|
| Seed and travel | Draw the next scene with `place(seedPoint, tinyScale)`. Move the camera with `travel(camA, camFor(seedPoint, tinyScale), p)`. |
| Figure/ground swap | Push until one tone fills the frame, then draw the next scene's shapes in that tone's polarity (`setPol`). |
| Swallow to a point, reopen reversed | Grow a black shape past the frame (`kit.black` clips it), set `bg: 'ink'`, draw the next scene with `setPol(true)`. |
| Scale as emotion | Camera pull-back with `travel` while the subject stays put. |
| One shape, many identities | `morphPoly(shapeA, shapeB, t)` for the outline; swap the details drawn on top by `t`. |
| Shape wipe | A shape in the next scene's paper colour grows until it covers the frame. |
| Line becomes contour | `stroke(..., {draw: t})`, then grow shapes from points on the line. |
| Body wipe / contour wipe | `kit.clip(edgePoly, true)` + scene A, `kit.clip(edgePoly)` + scene B, move the edge. |
| Nested worlds | The current scene is `place`d inside a shape of the outer one; pull the camera back. |

## 4. What the first film uses, and what it does not

Used in `rubber-knife-one-take.mp4`: seed and travel, swallow and reopen with reversed polarity, per-layer polarity, nested worlds,
level of detail, scale as emotion (the final pull-back).

Built and tested on the test card but not used in the film: shape morphing, self-drawing lines, contour and body wipes.
The film is under 10 s, which leaves room for two transitions plus the ending.

## 5. Limits

- The camera is 2D (pan, zoom, rotate). The reference re-poses objects in perspective as it approaches them (the house in device 1); here that needs a second drawing swapped in by level of detail.
- Level-of-detail swaps are hard switches, hidden by the boil. They are not blends.
- Wipe edges from `kit.clip` are clean; draw a crayon stroke along the edge if it should look drawn.
- Morphing matches outlines by arc length and start point. Shapes with very different part counts (a hand into a circle) will smear.
