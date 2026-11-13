import React from 'react';
import {P, rng, xf} from '../brush';
import {Cam, camFor, camXf, compose, place, travel} from '../flow/camera';
import {act, HEAVY_W, makeKit, OUTLINE_W, Xf} from '../flow/kit';
import {circle} from '../flow/shape';
import {herFace, rubberBend, wide} from './Film';

/*
 * "Rubber knife", one continuous take (no cuts), built on the flow framework
 * (see ../../../transitions/FRAMEWORK.md).
 *
 *   A   wide, black on white: a man stands over a woman on the floor, knife raised
 *   T1  seed and travel: push into her eye; the pupil dilates until black fills the frame.
 *       The glint in the pupil is a blade: a second, white-on-black world is nested inside it.
 *   B   inside her eye, white on black: his fist and the blade. A giant finger comes down,
 *       touches the blade, and it goes limp. (The rescue only exists in her eye.)
 *   T3  travel back out: the limp blade shrinks to a glint, the pupil contracts, the wide shot returns.
 *       The real knife is rigid.
 *   C   the giant finger comes down and stops just short. The camera slowly pulls back:
 *       the two people get small under the hand.
 */

export const FILM2_FPS = 100 / 7;
const A_END = 16; // wide hold
const T1_LEN = 16; // push into the eye
const B_START = A_END + T1_LEN; // 32
const FINGER_START = B_START + 7; // 39: finger starts coming down inside the eye
const TOUCH = FINGER_START + 8; // 47
const T3_START = TOUCH + 16; // 63: start pulling out
const T3_LEN = 12;
const C_START = T3_START + T3_LEN; // 75: back in the wide shot
const PULL_START = C_START + 12; // 87: slow pull-back begins
export const FILM2_LEN = 128;

// ---- the world ----
const EYE: P = [758.5, 589.7]; // her eye, in wide-scene world coordinates
const CAM_WIDE: Cam = {c: [460.5, 437.3], zoom: 0.86, rot: 0}; // same framing as the first film's wide shot
const CAM_FAR: Cam = {c: [720, 250], zoom: 0.47, rot: 0}; // the final pull-back
const EYE_ROT = 22; // the world inside the eye is tilted, so the push-in turns as it goes
const R0 = 1.9; // pupil radius in world units, at rest
const R1 = 18.5; // fully dilated: 740 frame px at the end of the push (covers the frame corners)
const INNER = (rp: number): Xf => place(EYE, rp / 740, EYE_ROT); // the nested scene always fits inside the pupil
const CAM_EYE: Cam = camFor(EYE, R1 / 740, EYE_ROT);

// ---- B: the world inside her eye (local 1000-space, white crayon on black) ----
const bladePoly = (base: P, dirDeg: number, len: number, hw: number, bend: (u: number) => number) => {
  const N = 18;
  const back: P[] = [], edge: P[] = [], bevel: P[] = [];
  let x = base[0], y = base[1];
  for (let i = 0; i <= N; i++) {
    const u = i / N;
    const th = ((dirDeg + bend(u)) * Math.PI) / 180;
    const w = 2 * hw * (1 - Math.pow(u, 2.3));
    back.push([x, y]);
    edge.push([x + Math.cos(th) * w, y + Math.sin(th) * w]);
    if (u > 0.08 && u < 0.76) bevel.push([x + Math.cos(th) * w * 0.45, y + Math.sin(th) * w * 0.45]);
    x += (Math.sin(th) * len) / N;
    y -= (Math.cos(th) * len) / N;
  }
  const thin = (a: P[], n: number) => a.filter((_, i) => i % n === 0 || i === a.length - 1);
  const rigid = Math.abs(bend(1)) < 1;
  return {poly: [...thin(back, rigid ? 6 : 2), ...thin(edge.slice().reverse(), rigid ? 6 : 2)], bevel: thin(bevel, rigid ? 6 : 2), touch: edge[13]};
};

const eyeWorld = (k: ReturnType<typeof makeKit>, F: number, size: number, o: {finger: number; bend: number}) => {
  // size = on-screen magnification of this nested scene. Detail arrives as it grows (level of detail).
  if (size * 1000 < 7) return;
  const tr = rng(F, 940);
  const shake = size > 0.6 ? 2.5 : 0;
  k.setPol(true);
  const BIG: Xf = (p) => xf(p, 0, 0, 0, 500, 640, 1.32);
  const FT = k.part(70, [500, 740], (p) => BIG(xf(p, tr(-shake, shake), tr(-shake, shake))), size > 0.5 ? 1 : 0.2, size > 0.5 ? 0.5 : 0.1);
  const J = Math.min(1.6, 0.4 + size * 2); // corner jitter shrinks with the drawing
  const bl = bladePoly([478, 700], 3, 400, 40, (u) => o.bend * Math.pow(u, 1.3));
  // the blade: a solid white shape. At a few px across it is just the glint in her pupil.
  k.black(k.corners(FT, bl.poly, J), 86, size > 0.5 ? 6 : 0);
  if (size > 0.12) {
    // fist
    k.black(k.corners(FT, [[384, 706], [566, 680], [612, 720], [618, 842], [584, 908], [424, 914], [382, 844]], J * 1.5), 20, size > 0.5 ? 6 : 0);
  }
  if (size > 0.35) {
    k.stroke(FT, bl.bevel, OUTLINE_W * 0.7, {paperInk: true, p: 0.8, over: 4, j: 1.6});
    for (let i = 0; i < 4; i++) {
      const y = 734 + i * 48;
      k.stroke(FT, [[528, y - 22], [430, y - 20], [400, y - 6], [404, y + 14], [432, y + 22], [520, y + 22]], OUTLINE_W, {paperInk: true, over: 6, j: 2.5});
    }
    k.stroke(FT, [[600, 712], [560, 700], [500, 700], [474, 712]], OUTLINE_W, {paperInk: true, over: 5});
    // the sleeve is black on black: only its edges catch the light
    k.stroke(FT, [[430, 916], [470, 990], [540, 1090]], OUTLINE_W, {p: 0.6, over: 8});
    k.stroke(FT, [[604, 890], [680, 980], [790, 1090]], OUTLINE_W, {p: 0.6, over: 8});
  }
  // the giant finger, solid white, coming down from the top right
  if (o.finger > 0 && size > 0.35) {
    const ang = -52, s = 3.1;
    const dir: P = [Math.cos((ang * Math.PI) / 180), Math.sin((ang * Math.PI) / 180)];
    const away = (1 - o.finger) * 760;
    const tip: P = [bl.touch[0] + 10 + dir[0] * away, bl.touch[1] - 4 + dir[1] * away];
    const HAND = k.part(71, tip, (p) => BIG(xf(p, tip[0], tip[1], ang, 0, 0, s)), 0.5, 0.25);
    k.black(k.corners(HAND, [[0, 0], [8, -18], [30, -27], [120, -30], [520, -38], [520, 34], [120, 26], [30, 23], [8, 14]], 2), 40, 5);
    k.stroke(HAND, [[36, -19], [17, -11], [22, 2], [40, -4]], OUTLINE_W, {paperInk: true, p: 0.9, over: 2, j: 1.5});
    k.stroke(HAND, [[100, -22], [95, -6]], OUTLINE_W * 0.8, {paperInk: true, p: 0.8, over: 2, j: 1.5});
    k.stroke(HAND, [[112, -21], [108, -8]], OUTLINE_W * 0.8, {paperInk: true, p: 0.8, over: 2, j: 1.5});
  }
  k.setPol(false);
};

// ---- the film ----
export const Film2: React.FC<{frame: number}> = ({frame: f}) => {
  // p: how far into the eye we are (0 = wide shot, 1 = fully inside)
  const p = f < A_END ? 0 : f < B_START ? act(f, A_END, T1_LEN, 81) : f < T3_START ? 1 : f < C_START ? 1 - act(f, T3_START, T3_LEN, 82) : 0;
  const pull = act(f, PULL_START, FILM2_LEN - PULL_START + 6, 83);
  const outer = pull > 0 ? travel(CAM_WIDE, CAM_FAR, pull, CAM_FAR.c) : CAM_WIDE;
  const cam = travel(outer, CAM_EYE, p, EYE);
  const rp = R0 * Math.pow(R1 / R0, p); // the pupil dilates as we approach
  const view = camXf(cam);
  const inside = p >= 1;
  const k = makeKit(f, {frame: view, bg: inside ? 'ink' : 'paper'});

  if (!inside) {
    // the wide world (reality): rigid knife; in part C the hand comes down and stops short
    const close = cam.zoom > 2;
    wide(k, f, {noHerHead: close, hand: f >= C_START ? {p: act(f, C_START, 10, 31), gap: 36, far: true} : undefined});
    if (cam.zoom > 1.7) {
      // level of detail: the close-up drawing of her face takes over from the small one
      k.setFrame(compose(view, place(EYE, 0.3, 0, [465, 416])));
      herFace(k, f, {noHand: true, noPupil: true});
      k.setFrame(view);
      // the pupil: a black disc in world space, so it scales with the camera and can swallow the frame
      const rScreen = rp * cam.zoom;
      const disc = circle(EYE, rp, Math.max(10, Math.min(36, Math.round(rScreen / 7)))).map(view);
      k.black(k.corners((q) => q, disc, Math.min(2, rScreen / 12)), 60, rScreen > 200 ? 4 : 0);
    }
  }
  // the world nested inside the pupil
  if (p > 0.25) {
    const size = (rp / 740) * cam.zoom;
    k.setFrame(compose(view, INNER(rp)));
    const finger = f >= FINGER_START ? act(f, FINGER_START, TOUCH - FINGER_START, 84) : 0;
    eyeWorld(k, f, size, {finger: f >= T3_START ? 1 - act(f, T3_START, 5, 85) * 0.5 : finger, bend: rubberBend(f, TOUCH)});
    k.setFrame(view);
  }
  return k.render();
};

export const FILM2_BEATS = {A_END, B_START, FINGER_START, TOUCH, T3_START, C_START, PULL_START, HEAVY_W};
