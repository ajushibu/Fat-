import React from 'react';
import {P, rng, xf} from '../brush';
import {act, HAIR_W, HEAVY_W, Kit, limb, makeKit, OUTLINE_W, Xf} from './kit';

/*
 * "Rubber knife" — a silent, sub-10-second film in the dry-crayon style.
 *
 *   S1  wide     a man in a black coat stands over a woman on the floor, knife raised
 *   S2  close    her face, one wide eye
 *   S3  close    his fist and the blade
 *   S4  wide     (imagined, lighter hand) a giant finger comes down, touches the blade, it goes limp
 *   S5  close    (imagined) he looks up at the floppy knife
 *   S6  wide     hard cut back: knife rigid, the giant finger comes down the same way
 *                and stops just short of the blade. Hold.
 *
 * Every frame is a new drawing (on 1s, 100/7 fps). Each shot is a static camera, as in the reference.
 */

export const FILM_FPS = 100 / 7;
export const SHOTS: {name: string; len: number}[] = [
  {name: 'S1 wide', len: 22},
  {name: 'S2 her face', len: 12},
  {name: 'S3 fist and blade', len: 12},
  {name: 'S4 wide, imagined', len: 32},
  {name: 'S5 his face, imagined', len: 12},
  {name: 'S6 wide, real, hold', len: 38},
];
export const FILM_LEN = SHOTS.reduce((a, s) => a + s.len, 0);

// ---------------- shared pieces ----------------

// blade: back edge straight (or bent like rubber), cutting edge curving into the tip
export const blade = (k: Kit, T: Xf, base: P, dirDeg: number, len: number, hw: number, bend: (u: number) => number, glint = false) => {
  const N = 18;
  const back: P[] = [], edge: P[] = [], bevel: P[] = [];
  let x = base[0], y = base[1];
  const ds = len / N;
  for (let i = 0; i <= N; i++) {
    const u = i / N;
    const th = ((dirDeg + bend(u)) * Math.PI) / 180;
    const w = 2 * hw * (1 - Math.pow(u, 2.3));
    back.push([x, y]);
    edge.push([x + Math.cos(th) * w, y + Math.sin(th) * w]);
    if (u > 0.06 && u < 0.78) bevel.push([x + Math.cos(th) * w * 0.42, y + Math.sin(th) * w * 0.42]);
    x += Math.sin(th) * ds;
    y += -Math.cos(th) * ds;
  }
  k.paper(T, [...back, ...edge.slice().reverse()], false);
  const rigid = Math.abs(bend(1)) < 1;
  const thin = (a: P[]) => (rigid ? a.filter((_, i) => i % 6 === 0 || i === a.length - 1) : a.filter((_, i) => i % 2 === 0 || i === a.length - 1));
  k.stroke(T, thin(back), OUTLINE_W, {over: 3, restate: 0.25, j: 1.6});
  k.stroke(T, thin(edge.slice().reverse()), OUTLINE_W, {over: 3, j: 1.6});
  k.stroke(T, thin(bevel), OUTLINE_W * 0.6, {p: 0.45, over: 4, j: 1.6});
  const g0 = back[0], g1 = edge[0];
  const gd: P = [g1[0] - g0[0], g1[1] - g0[1]];
  k.stroke(T, [[g0[0] - gd[0] * 0.35, g0[1] - gd[1] * 0.35], [g1[0] + gd[0] * 0.35, g1[1] + gd[1] * 0.35]], OUTLINE_W * 1.2, {over: 2});
  if (glint) {
    const a = edge[13], b = edge[15];
    k.stroke(T, [[a[0] + 14, a[1] - 4], [b[0] + 20, b[1] - 10]], 3.2, {p: 0.6, over: 2, j: 1.5});
  }
  return {tipBack: back[N], mid: edge[Math.round(N * 0.45)]};
};

// rubber: droop amount (deg added at the tip) for frames after the touch
export const rubberBend = (t: number, touch: number) => {
  if (t < touch) return 0;
  const droop = act(t, touch, 6, 77);
  const u = t - touch - 3;
  const wobble = u >= 0 ? 30 * Math.exp(-u / 3.5) * Math.sin(u * 1.9) : 0;
  return -(droop * 150 + wobble);
};

// the giant hand, palm down, index finger pointing to local -x; fingertip at the local origin
export const godHand = (k: Kit, T: Xf, far = false) => {
  if (far) {
    // the arm and sleeve carry on, for shots that pull back far enough to see more of it
    k.paper(T, [[880, -310], [1700, -520], [1800, -40], [960, 80]]);
    k.stroke(T, [[940, -246], [1300, -330], [1700, -440]], OUTLINE_W * 0.8, {p: 0.55, over: 10});
    k.stroke(T, [[980, -28], [1350, -90], [1750, -170]], OUTLINE_W * 0.8, {p: 0.55, over: 10});
    k.stroke(T, [[720, -250], [1100, -400], [1650, -560]], OUTLINE_W, {over: 10});
    k.stroke(T, [[760, 40], [1150, 20], [1750, -60]], OUTLINE_W, {over: 10});
  }
  k.paper(T, [[0, 0], [8, -18], [30, -27], [110, -29], [205, -33], [300, -64], [420, -112], [560, -172], [720, -250], [900, -300], [1000, 60], [700, 120], [480, 96], [330, 116], [296, 128], [262, 122], [236, 108], [214, 100], [194, 84], [172, 68], [160, 44], [140, 30], [110, 25], [30, 23], [8, 14]]);
  k.stroke(T, [[30, -27], [110, -29], [205, -33]], OUTLINE_W, {over: 6, restate: 0.3});
  k.stroke(T, [[32, -27], [6, -17], [1, 4], [26, 23]], OUTLINE_W, {over: 2, j: 1.4});
  k.stroke(T, [[26, 23], [110, 25], [166, 29]], OUTLINE_W, {over: 8});
  k.stroke(T, [[34, -20], [17, -12], [22, 1], [38, -5]], 3.2, {p: 0.55, over: 2, j: 1.2}); // nail curl
  k.stroke(T, [[98, -22], [94, -8]], 3, {p: 0.45, over: 2, j: 1.5}); // knuckle creases
  k.stroke(T, [[110, -22], [106, -10]], 3, {p: 0.45, over: 2, j: 1.5});
  k.stroke(T, [[205, -33], [300, -64], [420, -112], [560, -172], [720, -250]], OUTLINE_W, {over: 10, restate: 0.2}); // back of the hand
  k.stroke(T, [[166, 29], [156, 52], [178, 72], [220, 64]], OUTLINE_W, {over: 3, j: 2.2}); // curled fingers
  k.stroke(T, [[220, 64], [212, 90], [238, 106], [276, 96]], OUTLINE_W, {over: 3, j: 2.2});
  k.stroke(T, [[276, 96], [270, 116], [298, 128], [334, 114]], OUTLINE_W, {over: 3, j: 2.2});
  k.stroke(T, [[340, 46], [262, 38], [212, 38]], OUTLINE_W, {over: 6}); // thumb along the side
  k.stroke(T, [[212, 38], [200, 47], [214, 56], [262, 58]], OUTLINE_W, {over: 4, j: 2});
  k.stroke(T, [[334, 114], [480, 96], [640, 70], [760, 40]], OUTLINE_W, {over: 10}); // underside to the wrist
  // a loose sleeve where the wrist leaves the frame
  k.stroke(T, [[600, -205], [640, -120], [672, -10], [700, 96]], OUTLINE_W * 1.1, {over: 12, restate: 0.3});
  k.stroke(T, [[640, -150], [800, -210], [960, -250]], OUTLINE_W * 0.8, {p: 0.55, over: 10});
  k.stroke(T, [[690, 40], [850, 10], [990, -30]], OUTLINE_W * 0.8, {p: 0.55, over: 10});
};

// ---------------- the wide shot (S1, S4, S6) ----------------

export type WideOpt = {hand?: {p: number; gap: number; lift?: number; far?: boolean}; bend?: number; look?: number; puzzled?: boolean; noHerHead?: boolean};
export const WIDE_FRAME: Xf = (p) => xf(p, 34, 6, 0, 500, 842, 0.86);

export const wide = (k: Kit, F: number, o: WideOpt) => {
  const tr = rng(F, 900);
  // floor
  k.stroke(k.part(1, [500, 842], undefined, 0.15), [[64, 842], [300, 838], [560, 843], [800, 839], [948, 842]], HEAVY_W, {p: 0.9, over: 30, j: 1.6});

  // ---- the man ----
  const MB = k.part(10, [340, 640], undefined, 0.3);
  k.black(k.corners(MB, [[262, 700], [322, 700], [314, 826], [260, 826]], 3), 84, 4); // legs
  k.black(k.corners(MB, [[345, 700], [406, 700], [412, 824], [362, 824]], 3), 96, 4);
  k.black(k.corners(MB, [[248, 842], [252, 818], [318, 815], [334, 842]], 2), 0, 1); // shoes
  k.black(k.corners(MB, [[354, 842], [358, 816], [416, 813], [440, 842]], 2), 0, 1);
  k.black(k.corners(MB, [[336, 430], [288, 470], [262, 600], [248, 708], [432, 714], [434, 600], [422, 472], [392, 432]], 5), 74, 14); // coat

  // raised arm (sleeve), fist, knife — the fist trembles a little
  const MA = k.part(11, [440, 360], (p) => xf(p, tr(-2.5, 2.5), tr(-2.5, 2.5)), 0.6);
  k.black(k.corners(MA, limb([[414, 474], [516, 398], [522, 300]], 54, 44), 2.5), 30, 5);
  const bend = o.bend ?? 0;
  const bl = blade(k, MA, [514, 248], 6, 152, 13, (u) => bend * Math.pow(u, 1.3));
  k.black(k.corners(MA, [[508, 290], [530, 290], [532, 308], [512, 310]], 1.5), 0, 0); // pommel
  k.paper(MA, [[496, 252], [538, 244], [550, 262], [546, 290], [504, 296], [492, 274]]);
  k.stroke(MA, [[498, 254], [516, 243], [540, 248]], OUTLINE_W, {over: 3, j: 2}); // thumb
  k.stroke(MA, [[540, 248], [552, 264], [548, 292], [506, 297], [493, 276], [498, 254]], OUTLINE_W, {over: 4, j: 2});
  for (const y of [262, 274, 286]) k.stroke(MA, [[524, y], [548, y + 1]], 3.4, {p: 0.6, over: 3, j: 1.5});

  // head with a flat cap, hooked nose, angry brow
  const MH = k.part(12, [380, 380], (p) => xf(p, 0, 0, 0, 380, 438, 1.4), 0.8, 0.5);
  k.paper(MH, [[330, 352], [322, 382], [332, 414], [348, 436], [410, 440], [434, 426], [438, 408], [442, 400], [460, 398], [446, 376], [432, 352]]);
  k.stroke(MH, [[330, 352], [322, 382], [330, 410], [346, 434]], OUTLINE_W, {over: 5});
  k.stroke(MH, [[428, 350], [434, 366], [448, 380], [460, 398], [442, 402]], OUTLINE_W, {over: 4, restate: 0.2});
  k.stroke(MH, [[440, 403], [436, 414], [434, 428], [410, 438], [372, 440]], OUTLINE_W, {over: 6});
  k.stroke(MH, [[354, 382], [346, 387], [348, 399], [356, 401]], 3.4, {p: 0.6, over: 2, j: 1.5}); // ear
  k.black(k.corners(MH, [[320, 354], [330, 322], [362, 306], [406, 308], [430, 322], [470, 336], [472, 350], [430, 354]], 2.5), 10, 2);
  const look = o.look ?? 0;
  k.dot(MH, [416 + look * 1, 374 - look * 4], 3.6);
  if (o.puzzled) k.stroke(MH, [[398, 362], [410, 354], [424, 358]], 4.4, {p: 0.9, over: 2, j: 1});
  else k.stroke(MH, [[400, 360], [425, 369]], 5, {p: 0.95, over: 2, j: 1});
  const sr = rng(F, 901);
  for (let i = 0; i < 7; i++) k.dot(MH, [412 + sr(0, 22), 414 + sr(0, 18)], 1.2, 0.55); // stubble

  // ---- the woman on the floor, scooting back, one hand up ----
  const VB = k.part(20, [700, 760], undefined, 0.4);
  k.black(k.corners(VB, limb([[716, 798], [664, 708], [614, 810]], 38, 30), 2.5), 120, 4); // far leg, knee up
  k.black(k.corners(VB, limb([[690, 818], [610, 812], [548, 826]], 42, 32), 2.5), 0, 5); // near leg, flat on the floor
  k.black(k.corners(VB, [[516, 842], [520, 814], [556, 814], [564, 842]], 1.5), 0, 0);
  k.black(k.corners(VB, [[592, 832], [598, 806], [630, 806], [636, 830]], 1.5), 0, 0);
  // propping arm behind her
  k.paper(VB, [[790, 700], [836, 768], [874, 836], [850, 842], [814, 778], [772, 718]]);
  k.stroke(VB, [[792, 698], [838, 766], [876, 834]], OUTLINE_W, {over: 4});
  k.stroke(VB, [[772, 720], [814, 780], [848, 840]], OUTLINE_W, {over: 4});
  k.stroke(VB, [[846, 840], [862, 830], [890, 842]], OUTLINE_W, {over: 3, j: 2});
  // blouse
  k.paper(VB, [[664, 838], [730, 838], [798, 722], [776, 690], [738, 684], [690, 756]]);
  k.stroke(VB, [[666, 836], [690, 756], [736, 686]], OUTLINE_W, {over: 6, restate: 0.2});
  k.stroke(VB, [[730, 838], [796, 722], [780, 692]], OUTLINE_W, {over: 6});
  k.stroke(VB, [[664, 812], [712, 820], [742, 812]], 3.6, {p: 0.6, over: 4}); // waist
  // head: small upturned nose, wide eye, hair falling behind
  if (!o.noHerHead) {
    const VH = k.part(21, [784, 630], (p) => xf(p, 0, 0, 0, 772, 668, 1.35), 0.8, 0.5);
    k.scribble(VH, [[786, 590], [818, 600], [830, 632], [824, 668], [814, 700]], 26, 20, HAIR_W * 0.8, 0.1);
    k.paper(VH, [[790, 592], [770, 594], [752, 606], [744, 620], [734, 630], [748, 636], [748, 648], [756, 660], [780, 670], [806, 652], [812, 620], [806, 598]]);
    k.stroke(VH, [[792, 590], [770, 593], [752, 606], [746, 618], [734, 630], [748, 635]], OUTLINE_W, {over: 4});
    k.stroke(VH, [[750, 652], [758, 664], [784, 670]], OUTLINE_W, {over: 5});
    k.stroke(VH, [[750, 640], [756, 643], [754, 650], [748, 648], [750, 640]], 3.2, {p: 0.8, over: 1, j: 0.8}); // open mouth
    k.stroke(VH, [[758, 608], [766, 604], [772, 610], [768, 618], [760, 618], [757, 610]], 3.2, {p: 0.85, over: 1, j: 0.7}); // wide eye
    k.dot(VH, [762, 610], 2.8);
    k.stroke(VH, [[750, 598], [762, 593], [774, 596]], 3.8, {p: 0.8, over: 2, j: 1.2}); // worried brow
  }
  k.stroke(VB, [[772, 666], [770, 690]], OUTLINE_W, {over: 3});
  // raised hand, palm out, shaking
  const VA = k.part(22, [690, 640], (p) => xf(p, tr(-3.5, 3.5), tr(-3.5, 3.5)), 0.7);
  k.paper(VA, [[748, 704], [700, 650], [672, 628], [690, 616], [724, 640], [770, 690]]);
  k.stroke(VA, [[750, 702], [702, 652], [674, 630]], OUTLINE_W, {over: 4});
  k.stroke(VA, [[770, 690], [724, 642], [694, 618]], OUTLINE_W, {over: 4});
  k.paper(VA, [[694, 632], [650, 628], [630, 596], [640, 566], [664, 556], [690, 584], [700, 620]]);
  const fingers: [P, P][] = [[[654, 582], [622, 552]], [[664, 576], [640, 538]], [[676, 576], [664, 536]], [[688, 584], [690, 548]]];
  for (const [a, b] of fingers) k.stroke(VA, [a, [(a[0] + b[0]) / 2 + 2, (a[1] + b[1]) / 2], b], 4.2, {over: 3, j: 2});
  k.stroke(VA, [[694, 616], [700, 596], [714, 590]], 4.2, {over: 3, j: 2}); // thumb
  k.stroke(VA, [[690, 626], [660, 630], [640, 612], [632, 588]], OUTLINE_W, {over: 4, j: 2}); // palm edge

  // ---- God's hand (only in S4 / S6) ----
  if (o.hand) {
    const ang = -35, s = 1.18;
    const dir: P = [Math.cos((ang * Math.PI) / 180), Math.sin((ang * Math.PI) / 180)]; // local +x in frame space
    const touch: P = [bl.mid[0] + 8, bl.mid[1] - 6];
    const away = o.hand.gap + (1 - o.hand.p) * 620 + (o.hand.lift ?? 0);
    const tip: P = [touch[0] + dir[0] * away, touch[1] + dir[1] * away];
    const HAND = k.part(30, tip, (p) => xf(p, tip[0], tip[1], ang, 0, 0, s), 0.6, 0.3);
    godHand(k, HAND, o.hand.far);
  }
};

// ---------------- close-ups ----------------

export const herFace = (k: Kit, F: number, o: {noHand?: boolean; noPupil?: boolean} = {}) => {
  const tr = rng(F, 910);
  const HD = k.part(40, [560, 480], (p) => xf(p, tr(-1.5, 1.5), tr(-1.5, 1.5)), 1, 0.4);
  // blouse collar and shoulders
  k.stroke(k.part(41, [560, 900]), [[300, 1010], [452, 832], [500, 820]], OUTLINE_W, {over: 8});
  k.stroke(k.part(43, [560, 900]), [[620, 812], [690, 840], [830, 1010]], OUTLINE_W, {over: 8});
  k.stroke(k.part(44, [560, 900]), [[478, 826], [552, 920], [640, 818]], OUTLINE_W, {over: 6, restate: 0.2});
  k.stroke(HD, [[505, 676], [498, 830]], OUTLINE_W, {over: 4});
  k.stroke(HD, [[606, 664], [616, 800]], OUTLINE_W, {over: 4});
  k.scribble(HD, [[560, 270], [660, 296], [712, 380], [722, 490], [712, 610], [690, 700]], 44, 52, HAIR_W * 1.35, 0.1);
  k.scribble(HD, [[620, 280], [700, 340], [720, 460], [700, 640]], 22, 40, HAIR_W * 1.5, 0.1);
  k.paper(HD, [[560, 284], [500, 300], [452, 350], [430, 410], [402, 456], [374, 490], [410, 502], [414, 524], [420, 566], [432, 604], [472, 652], [540, 682], [618, 664], [668, 590], [676, 420], [640, 320]]);
  k.stroke(HD, [[566, 282], [500, 298], [452, 350], [430, 410]], OUTLINE_W, {over: 6, restate: 0.25});
  k.stroke(HD, [[430, 410], [402, 456], [372, 490], [384, 502], [412, 500]], OUTLINE_W, {over: 3});
  k.stroke(HD, [[418, 562], [430, 602], [472, 652], [540, 682], [622, 664]], OUTLINE_W, {over: 8});
  k.stroke(HD, [[410, 526], [428, 520], [438, 536], [428, 552], [412, 548], [406, 532]], 4.4, {p: 0.85, over: 1, j: 1.2}); // open mouth
  k.stroke(HD, [[452, 418], [466, 404], [484, 410], [488, 428], [474, 440], [456, 434], [452, 418]], 4.2, {p: 0.85, over: 1, j: 1}); // wide eye
  if (!o.noPupil) k.dot(HD, [465, 416], 6.5);
  k.stroke(HD, [[438, 380], [462, 368], [496, 376]], 5.4, {p: 0.85, over: 3, j: 1.5}); // brow up in the middle
  if (o.noHand) return;
  // her raised hand in front, shaking
  const HA = k.part(42, [240, 600], (p) => xf(p, tr(-4.5, 4.5), tr(-4.5, 4.5)), 1);
  k.paper(HA, [[200, 1010], [190, 760], [170, 660], [140, 560], [126, 470], [160, 470], [196, 560], [210, 420], [244, 416], [250, 548], [262, 400], [296, 404], [292, 552], [318, 440], [350, 450], [326, 590], [376, 560], [400, 586], [330, 700], [330, 1010]]);
  k.stroke(HA, [[196, 1010], [192, 760], [172, 662], [146, 564], [128, 474], [156, 466], [194, 556]], OUTLINE_W, {over: 6});
  k.stroke(HA, [[194, 556], [206, 424], [226, 410], [246, 420], [248, 548]], OUTLINE_W, {over: 4, j: 2.5});
  k.stroke(HA, [[248, 548], [262, 404], [282, 394], [298, 406], [292, 554]], OUTLINE_W, {over: 4, j: 2.5});
  k.stroke(HA, [[292, 554], [318, 444], [338, 436], [350, 452], [328, 586]], OUTLINE_W, {over: 4, j: 2.5});
  k.stroke(HA, [[328, 588], [372, 556], [394, 566], [398, 588], [332, 700], [330, 1010]], OUTLINE_W, {over: 6, j: 2.5});
  for (const [x, y] of [[226, 426], [280, 410], [334, 450]] as P[]) k.stroke(HA, [[x - 6, y + 4], [x, y + 14], [x + 8, y + 6]], 3, {p: 0.5, over: 1, j: 1});
  k.stroke(HA, [[196, 900], [330, 880]], OUTLINE_W, {p: 0.7, over: 6}); // cuff
};

const fistAndBlade = (k: Kit, F: number) => {
  const tr = rng(F, 920);
  const FT = k.part(50, [500, 600], (p) => xf(p, tr(-2.5, 2.5), tr(-2.5, 2.5)), 1, 0.5);
  k.black(k.corners(FT, limb([[560, 760], [650, 900], [740, 1080]], 230, 270), 4), 60, 22); // sleeve
  k.black(k.corners(FT, [[468, 768], [532, 766], [538, 824], [474, 830]], 2), 0, 1); // pommel
  blade(k, FT, [496, 548], 4, 450, 44, () => 0, true);
  k.paper(FT, [[384, 566], [566, 540], [612, 580], [618, 702], [584, 768], [424, 774], [382, 704]]);
  k.stroke(FT, [[470, 552], [566, 540], [612, 580], [618, 700], [586, 768]], OUTLINE_W, {over: 6, restate: 0.2});
  k.stroke(FT, [[586, 768], [424, 774], [384, 706], [384, 566], [470, 552]], OUTLINE_W, {over: 6});
  for (let i = 0; i < 4; i++) {
    const y = 594 + i * 48;
    k.stroke(FT, [[528, y - 22], [430, y - 20], [398, y - 6], [402, y + 14], [432, y + 22], [520, y + 22]], OUTLINE_W, {over: 6, j: 2.5});
    k.stroke(FT, [[420, y - 10], [408, y], [418, y + 10], [430, y + 2]], 3, {p: 0.5, over: 1.5, j: 1}); // nail
  }
  k.stroke(FT, [[600, 572], [560, 560], [500, 560], [474, 572]], OUTLINE_W, {over: 5}); // thumb over the top
};

const hisFace = (k: Kit, F: number, t: number) => {
  const tr = rng(F, 930);
  const HD = k.part(60, [440, 600], undefined, 1, 0.4);
  k.black(k.corners(k.part(61, [480, 900]), [[240, 1010], [300, 830], [430, 800], [570, 806], [670, 868], [720, 1010]], 4), 70, 16); // coat collar
  k.paper(HD, [[270, 500], [330, 440], [430, 420], [540, 440], [590, 500], [630, 548], [700, 630], [668, 650], [622, 660], [618, 700], [604, 744], [540, 786], [440, 794], [330, 760], [270, 680], [252, 590]]);
  k.stroke(HD, [[262, 520], [252, 600], [272, 682], [330, 760], [420, 792]], OUTLINE_W, {over: 6, restate: 0.2});
  k.stroke(HD, [[588, 498], [612, 530], [648, 578], [702, 630], [670, 652], [626, 654]], OUTLINE_W, {over: 4, restate: 0.25});
  k.stroke(HD, [[626, 660], [618, 704], [604, 744], [544, 786], [440, 796]], OUTLINE_W, {over: 6});
  k.stroke(HD, [[372, 562], [346, 572], [344, 620], [370, 630]], 4.2, {p: 0.7, over: 2, j: 1.6}); // ear
  k.black(k.corners(HD, [[248, 520], [264, 432], [330, 372], [430, 350], [522, 368], [578, 420], [692, 462], [702, 494], [592, 494], [540, 474], [420, 474], [300, 504]], 4), 12, 10); // cap
  const sr = rng(F, 931);
  for (let i = 0; i < 14; i++) k.dot(HD, [520 + sr(0, 80), 690 + sr(0, 80)], 2, 0.5); // stubble
  // looks up at the knife; the brow goes from angry to puzzled
  k.dot(HD, [566, 540 - Math.min(1, t / 3) * 8], 8);
  if (t >= 4) k.stroke(HD, [[522, 520], [552, 500], [590, 512]], 7.5, {p: 0.95, over: 2, j: 1.4});
  else k.stroke(HD, [[522, 512], [592, 536]], 8.5, {p: 0.95, over: 2, j: 1.4});
  k.stroke(HD, [[560, 712], [586, 708]], 4.4, {p: 0.8, over: 3, j: 1.5}); // mouth
  // the raised fist up in the corner, the limp blade hanging off it
  const FT = k.part(62, [760, 240], (p) => xf(p, tr(-2, 2), tr(-2, 2)), 0.8);
  k.black(k.corners(FT, limb([[790, 300], [900, 520], [1080, 700]], 112, 150), 3), 50, 10);
  const bend = -(150 + 12 * Math.sin(t * 1.7) * Math.exp(-t / 6));
  blade(k, FT, [748, 186], 6, 230, 22, (u) => bend * Math.pow(u, 1.3));
  k.paper(FT, [[706, 196], [790, 182], [814, 214], [806, 268], [722, 280], [700, 240]]);
  k.stroke(FT, [[790, 182], [814, 214], [806, 268], [724, 280], [700, 240], [708, 198]], OUTLINE_W, {over: 4, j: 2.4});
  k.stroke(FT, [[708, 198], [740, 180], [790, 184]], OUTLINE_W, {over: 3, j: 2.4});
  for (const y of [214, 238, 260]) k.stroke(FT, [[760, y], [808, y + 2]], 3.6, {p: 0.6, over: 3, j: 1.6});
};

// ---------------- the film ----------------

export const shotAt = (frame: number) => {
  let t = frame;
  for (let i = 0; i < SHOTS.length; i++) {
    if (t < SHOTS[i].len) return {i, t};
    t -= SHOTS[i].len;
  }
  return {i: SHOTS.length - 1, t: SHOTS[SHOTS.length - 1].len - 1};
};

export const Film: React.FC<{frame: number}> = ({frame}) => {
  const {i, t} = shotAt(frame);
  const seed = frame; // a new drawing every frame (on 1s)
  if (i === 0) {
    const k = makeKit(seed, {frame: WIDE_FRAME});
    wide(k, frame, {});
    return k.render();
  }
  if (i === 1) {
    const k = makeKit(seed);
    herFace(k, frame);
    return k.render();
  }
  if (i === 2) {
    const k = makeKit(seed);
    fistAndBlade(k, frame);
    return k.render();
  }
  if (i === 3) {
    // imagined: the finger comes down (10 frames, near-linear), touches, the blade goes limp, the hand lifts away
    const k = makeKit(seed, {frame: WIDE_FRAME, light: true});
    const p = act(t, 0, 10, 31);
    wide(k, frame, {hand: {p, gap: 0, lift: act(t, 22, 10, 32) * 90}, bend: rubberBend(t, 10), look: t >= 14 ? 1 : 0, puzzled: t >= 17});
    return k.render();
  }
  if (i === 4) {
    const k = makeKit(seed, {light: true});
    hisFace(k, frame, t);
    return k.render();
  }
  // real: the finger comes down the same way and stops short of the blade. Hold.
  const k = makeKit(seed, {frame: WIDE_FRAME});
  wide(k, frame, {hand: {p: act(t, 0, 10, 31), gap: 36}});
  return k.render();
};

