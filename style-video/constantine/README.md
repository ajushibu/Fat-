# Conquer by this

The legend of Constantine before the battle at the Tiber, in the approved "doodle" style
(`../crayon-loop/video/src/doodle/`). Silent, no text. 1000 x 1000, 100/7 fps, 148 frames, 10.4 s each.

Five variations: the shot plan is the same in all five; the character and prop designs differ.

| File | Constantine | Crown | His soldiers | Enemy | Cross of light | Camp |
|---|---|---|---|---|---|---|
| `constantine-1.mp4` (A) | curly hair, tunic, cape | laurel wreath | crested helmets, round shields | dome helmets, oval striped shields | plain cross with rays | cot |
| `constantine-2.mp4` (B) | bald, bearded, long robe, big belly | sun crown with spikes | dome helmets, tall rectangular shields | brush helmets, round shields | cross inside a sun | tent |
| `constantine-3.mp4` (C) | fringe, very long nose, cape | zigzag crown | plumed helmets, oval shields | caps, six-sided shields | white cross in a black scribbled sky | bedroll on the ground |
| `constantine-4.mp4` (D) | tall and thin, cape, helmet by day | diadem | brush helmets, six-sided shields | dome helmets, kite shields | four-pointed star cross | cot |
| `constantine-5.mp4` (E) | short, stocky, bearded, big head | headband with ribbons | caps, kite shields | plumed helmets, rectangular shields | hollow cross with glow rings | tent |

`constantine-5-plus.mp4`: design E pushed further, same shot plan and length. Added in each shot:
- **Night:** open tent with a pennant, a helmet on a post, a crate with a jug and cup, sandals under the bed, snore loops,
  a fire, and a guard dozing on a log who jolts awake when the cross appears. Wider framing so all of it fits.
- **Day:** a paint pot; four soldiers who each look and act differently (holds still for the brush, leans on his spear,
  scratches his head, cheers when his shield gets the sign); tent and crates behind.
- **March:** a drummer, a standard-bearer with the Chi Rho banner, dust at their feet, birds.
- **Bridge:** wider spacing, the Chi Rho standard behind the men, an enemy standard that drops, planks flying off the broken end.
- **Emperor:** two soldiers cheer either side of the pedestal, a trumpeter, birds.

Source: `../crayon-loop/video/src/doodle/constantine/FilmE.tsx` (composition `Constantine5Plus`).

Shot plan (frames):

| Frames | Shot |
|---|---|
| 0-57 | Night, one take. Asleep in camp; the camera rises to the cross of light in the sky; it travels back down into a close-up as he wakes. |
| 58-87 | Day. Close on a soldier's shield while Constantine paints the Chi Rho; the camera pulls back to a row of shields, each getting the sign. |
| 88-103 | The army marches. |
| 104-125 | The bridge. The Chi Rho shields push; the enemy recoils and one goes over the broken end into the river. |
| 126-147 | Constantine alone on a pedestal crowns himself. |

Source: `../crayon-loop/video/src/doodle/constantine/Film.tsx` (compositions `Constantine1` to `Constantine5`).
`pen.tsx` is the approved pen, `person.tsx` the figure builder, `Sheet.tsx` redraws the approved style sheet.

```
cd ../crayon-loop/video
node preview.cjs Con1 /tmp/con 5 36 66 118 146        # quick stills
npx remotion render src/index.ts Constantine1 out/con1 --sequence --image-format=png
ffmpeg -framerate 100/7 -i out/con1/element-%03d.png -c:v libx264 -crf 16 -pix_fmt yuv420p -an constantine-1.mp4
```
