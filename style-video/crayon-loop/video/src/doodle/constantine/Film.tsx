import React from 'react';
import {P, rng} from '../../brush';
import {makePen, Pen} from '../pen';
import {act, chiRho, Crown, ground, head, Joints, Look, mirror, person, shield, ShieldShape} from '../person';

/*
 * "Conquer by this" — the legend of Constantine before the battle at the Tiber, in the doodle style.
 * Silent, no text. One shot plan, five sets of character and prop designs (v = 0..4).
 *
 *   NIGHT   one take: Constantine asleep in camp -> the camera rises to a cross of light in the sky ->
 *           travels back down into a close-up as he wakes
 *   DAY     close on a soldier's shield while Constantine paints the Chi Rho on it -> pull back: a whole row
 *           of shields, each getting the sign
 *   MARCH   the army walks to the river
 *   BATTLE  on the bridge: the Chi Rho shields push; the enemy recoils and one goes over the broken end
 *   EMPEROR Constantine alone on a pedestal, crowns himself
 */

export const CON_FPS = 100 / 7;
const N_LEN = 58, D_LEN = 30, M_LEN = 16, B_LEN = 22, E_LEN = 22;
export const CON_LEN = N_LEN + D_LEN + M_LEN + B_LEN + E_LEN; // 148 frames = 10.4 s

type CrossKind = 'rays' | 'sun' | 'night' | 'star' | 'beams';
type Design = {
  name: string; conId: number; con: Look; conDay?: Look; crown: Crown;
  sol: Look; shield: ShieldShape; foe: Look; foeShield: ShieldShape; foeMark: 'stripe' | 'dot' | 'none';
  cross: CrossKind; bed: 'cot' | 'tent' | 'roll';
};
export const DESIGNS: Design[] = [
  {name: 'A: curly general, laurel, round shields, cross with rays', conId: 11, con: {garb: 'tunic', hair: 'full', cape: true}, crown: 'laurel',
    sol: {garb: 'tunic', helmet: 'crest'}, shield: 'round', foe: {garb: 'tunic', helmet: 'dome'}, foeShield: 'oval', foeMark: 'stripe', cross: 'rays', bed: 'cot'},
  {name: 'B: bald bearded elder in a robe, sun crown, tall shields, cross in a sun', conId: 12, con: {garb: 'robe', hair: 'none', beard: true, build: {belly: 1.25}}, crown: 'radiate',
    sol: {garb: 'tunic', helmet: 'dome'}, shield: 'rect', foe: {garb: 'tunic', helmet: 'brush'}, foeShield: 'round', foeMark: 'dot', cross: 'sun', bed: 'tent'},
  {name: 'C: big-nosed with a fringe, zigzag crown, oval shields, white cross in a black sky', conId: 13, con: {garb: 'tunic', hair: 'fringe', cape: true, build: {nose: 2.2}}, crown: 'zigzag',
    sol: {garb: 'tunic', helmet: 'plume'}, shield: 'oval', foe: {garb: 'tunic', helmet: 'cap'}, foeShield: 'hex', foeMark: 'none', cross: 'night', bed: 'roll'},
  {name: 'D: tall thin commander in a helmet, diadem, six-sided shields, star cross', conId: 14, con: {garb: 'tunic', hair: 'back', cape: true, build: {belly: 0.86, tall: 1.1}}, conDay: {helmet: 'crest'}, crown: 'diadem',
    sol: {garb: 'tunic', helmet: 'brush'}, shield: 'hex', foe: {garb: 'tunic', helmet: 'dome'}, foeShield: 'kite', foeMark: 'dot', cross: 'star', bed: 'cot'},
  {name: 'E: short stocky bearded, headband, kite shields, hollow cross with glow rings', conId: 15, con: {garb: 'tunic', hair: 'back', beard: true, build: {belly: 1.2, head: 1.16, tall: 0.9}}, crown: 'band',
    sol: {garb: 'tunic', helmet: 'cap'}, shield: 'kite', foe: {garb: 'tunic', helmet: 'plume'}, foeShield: 'rect', foeMark: 'stripe', cross: 'beams', bed: 'tent'},
];

// ---------- camera ----------
type Cam = {c: P; z: number};
const mix = (a: Cam, b: Cam, t: number): Cam => ({c: [a.c[0] + (b.c[0] - a.c[0]) * t, a.c[1] + (b.c[1] - a.c[1]) * t], z: a.z * Math.pow(b.z / a.z, t)});
// The pen gets a little finer when figures are small on screen and bolder in close-ups, but much less than the zoom.
const view = (k: Pen, cam: Cam, figSc = 2.1, rot?: {deg: number; about: P}) => {
  const ps = Math.max(1.15, Math.min(2.9, 2.1 * Math.pow((cam.z * figSc) / 2.1, 0.7)));
  k.setView(([x, y]) => {
    if (rot) {
      const a = (rot.deg * Math.PI) / 180, dx = x - rot.about[0], dy = y - rot.about[1];
      x = rot.about[0] + dx * Math.cos(a) - dy * Math.sin(a);
      y = rot.about[1] + dx * Math.sin(a) + dy * Math.cos(a);
    }
    return [500 + (x - cam.c[0]) * cam.z, 500 + (y - cam.c[1]) * cam.z];
  }, cam.z, ps);
};

// ---------- poses (facing right; mirror() for facing left) ----------
const STAND = {hip: [0, 150] as P, neck: [8, 242] as P, head: [22, 294] as P, kneeN: [14, 80] as P, footN: [10, 6] as P, kneeF: [-14, 80] as P, footF: [-26, 6] as P};
const SOL_HOLD: Joints = {...STAND, elbowN: [30, 200], handN: [70, 196], elbowF: [-24, 204], handF: [-36, 186]};
const PUSH: Joints = {hip: [0, 140], neck: [40, 224], head: [70, 270], tilt: 10, kneeN: [50, 80], footN: [48, 6], kneeF: [-44, 72], footF: [-90, 6], elbowN: [72, 200], handN: [112, 208], elbowF: [4, 214], handF: [-10, 250]};
const RECOIL: Joints = {hip: [0, 128], neck: [-24, 212], head: [-26, 266], tilt: -12, kneeN: [28, 74], footN: [34, 6], kneeF: [-28, 68], footF: [-46, 6], elbowN: [8, 186], handN: [44, 160], elbowF: [-6, 244], handF: [22, 300]};
const walk = (ph: number): Joints => {
  const fN: P = [46 * Math.sin(ph), 6 + 16 * Math.max(0, Math.cos(ph))], fF: P = [46 * Math.sin(ph + Math.PI), 6 + 16 * Math.max(0, Math.cos(ph + Math.PI))];
  return {hip: [0, 150 + 3 * Math.cos(2 * ph)], neck: [10, 242], head: [26, 294], kneeN: [fN[0] * 0.5 + 12, 82], footN: fN, kneeF: [fF[0] * 0.5 + 12, 82], footF: fF, elbowN: [30, 200], handN: [62, 196], elbowF: [-22, 204], handF: [-34, 186]};
};

// ---------- props ----------
const ell = (c: P, rx: number, ry: number, n = 14): P[] => Array.from({length: n}, (_, i) => [c[0] + Math.cos((i / n) * 6.283) * rx, c[1] + Math.sin((i / n) * 6.283) * ry] as P);

// The cross of light. c = centre, u = unit (world px), p = how far it has appeared (0..1). Five designs.
const cross = (k: Pen, c: P, u: number, p: number, F: number, kind: CrossKind) => {
  if (p <= 0) return;
  const g = 0.3 + 0.7 * p, a = 0.17;
  const r = rng(F, 800);
  const W = ([x, y]: P): P => [c[0] + x * u, c[1] + y * u];
  const latin = (s = 1): P[] => {
    const U = 0.75 * g * s, Sd = 0.62 * g * s, D = 1.25 * g * s, w = a * s;
    return ([[-w, -U], [w, -U], [w, -w], [Sd, -w], [Sd, w], [w, w], [w, D], [-w, D], [-w, w], [-Sd, w], [-Sd, -w], [-w, -w]] as P[]).map(W);
  };
  const ray = (ang: number, r0: number, len: number, w = 3) => {
    const dx = Math.cos(ang), dy = Math.sin(ang);
    k.scrawl([W([dx * r0, dy * r0 + 0.2]), W([dx * (r0 + len), dy * (r0 + len) + 0.2])], w, {jit: 0.8});
  };
  if (kind === 'rays') {
    const poly = latin();
    k.paper(poly);
    k.sketch(poly, {closed: true, jit: 1.2, over: 4});
    for (let i = 0; i < 12; i++) if (r() < p) ray(((i * 30 + 15) * Math.PI) / 180, 1.15 * g + 0.25, r(0.2, 0.46));
  } else if (kind === 'sun') {
    const disc = ell(W([0, 0.2]), 1.45 * g * u, 1.45 * g * u, 16);
    k.paper(disc, true);
    k.sketch(disc, {closed: true, curve: true, jit: 1.6});
    const poly = latin(0.8);
    k.sketch(poly, {closed: true, jit: 1.0, over: 3, layers: 2});
    for (let i = 0; i < 16; i++) if (r() < p) ray((i * 22.5 * Math.PI) / 180, 1.45 * g + 0.14, i % 2 ? r(0.16, 0.26) : r(0.36, 0.56));
  } else if (kind === 'night') {
    const q = rng(71, 1);
    const cloud: P[] = Array.from({length: 14}, (_, i) => W([Math.cos((i / 14) * 6.283) * (1.5 + q(0, 0.5)) * (0.5 + 0.5 * p), Math.sin((i / 14) * 6.283) * (1.45 + q(0, 0.4)) * (0.5 + 0.5 * p) + 0.2]));
    k.fill(cloud);
    k.fill(cloud);
    k.sketch(cloud, {closed: true, curve: true, jit: 2});
    const poly = latin(0.92);
    k.paper(poly);
    k.sketch(poly, {closed: true, jit: 0.8, over: 2, layers: 1, w: 2.4});
  } else if (kind === 'star') {
    const s: P[] = ([[0, -0.98 * g], [a, -a], [0.82 * g, 0], [a, a], [0, 1.42 * g], [-a, a], [-0.82 * g, 0], [-a, -a]] as P[]).map(W);
    k.paper(s);
    k.sketch(s, {closed: true, jit: 1.0, over: 5});
    const q = rng(72, 1);
    for (let i = 0; i < 7; i++) {
      const ang = q(0, 6.283), rad = q(1.2, 2.0), cc: P = [Math.cos(ang) * rad, Math.sin(ang) * rad + 0.2], sz = q(0.08, 0.16);
      if (r() > 0.75 * p) continue;
      k.scrawl([W([cc[0] - sz, cc[1]]), W([cc[0] + sz, cc[1]])], 2.4, {jit: 0.4});
      k.scrawl([W([cc[0], cc[1] - sz * 1.3]), W([cc[0], cc[1] + sz * 1.3])], 2.4, {jit: 0.4});
    }
  } else {
    const poly = latin();
    k.sketch(poly, {closed: true, jit: 1.0, over: 6, layers: 2, w: 3.2});
    for (const rad of [1.55, 2.0]) for (let i = 0; i < 9; i++) {
      if (r() > p * 0.8) continue;
      const a0 = (i / 9) * 6.283 + rad, a1 = a0 + 0.42;
      k.scrawl([0, 0.5, 1].map((t) => W([Math.cos(a0 + (a1 - a0) * t) * rad * g, Math.sin(a0 + (a1 - a0) * t) * rad * g + 0.2])), 2.8, {jit: 0.6});
    }
  }
};

// ---------- NIGHT ----------
const night = (k: Pen, F: number, t: number, d: Design) => {
  const CAM_BED: Cam = {c: [560, 590], z: 1.02}, CAM_SKY: Cam = {c: [500, 70], z: 0.62}, CAM_FACE: Cam = {c: [400, 600], z: 1.75};
  const up = act(t, 16, 8, 501), down = act(t, 44, 6, 502);
  const cam = down > 0 ? mix(CAM_SKY, CAM_FACE, down) : mix(CAM_BED, CAM_SKY, up);
  view(k, cam, 1.8);
  const awake = t >= 51;
  const base = d.bed === 'roll' ? 822 : 768;
  const r = rng(F, 510);

  // sky: moon and a few stars (they twinkle: not every star is drawn every frame)
  const moon: P[] = [[860, 20], [900, 60], [906, 110], [876, 150], [898, 104], [886, 60]];
  k.sketch(moon, {closed: true, curve: true, jit: 1.2, layers: 2});
  const sq = rng(73, 1);
  for (let i = 0; i < 9; i++) {
    const sp: P = [sq(60, 940), sq(-760, 60)];
    if (Math.hypot(sp[0] - 500, sp[1] + 330) < 430 || r() < 0.25) continue;
    k.dot(sp, 3.2, 3.2);
  }
  if (d.bed === 'tent') {
    k.sketch([[30, 822], [500, 150]], {layers: 2, over: 12, wob: 1.6});
    k.sketch([[500, 150], [970, 822]], {layers: 2, over: 12, wob: 1.6});
    k.sketch([[500, 150], [500, 96], [540, 112], [500, 128]], {layers: 2, jit: 1});
  }
  ground(k, -200, 1300, 822);
  // the cross of light, high above the camp
  cross(k, [500, -330], 215, act(t, 25, 9, 503), F, d.cross);

  // his shield and spear, leaning by the bed
  k.sketch([[985, 822], [1012, 430]], {layers: 2, jit: 1, wob: 1.2});
  shield(k, [915, 742], 80, {shape: d.shield}, 99);

  // bed
  const mat: P[] = [[180, base - 28], [822, base - 28], [822, base], [180, base]];
  k.paper(mat);
  k.sketch(mat, {closed: true, over: 6, layers: 2});
  if (d.bed !== 'roll') {
    k.sketch([[216, base], [216, 822]], {layers: 2, over: 3});
    k.sketch([[786, base], [786, 822]], {layers: 2, over: 3});
  }
  const pil = ell([282, base - 52], 82, 26);
  k.paper(pil, true);
  k.sketch(pil, {closed: true, curve: true, jit: 2, layers: 2});
  // feet sticking out of the blanket
  for (const [x, y] of [[838, base - 76], [868, base - 66]] as P[]) {
    const ft = ell([x, y], 17, 40, 10);
    k.paper(ft, true);
    k.sketch(ft, {closed: true, curve: true, jit: 1.6, layers: 2});
  }
  // blanket: a black scribbled mound that rises and falls as he breathes; he starts up when he wakes
  const b = awake ? -30 : -8 * Math.sin(F * 0.5);
  const bl: P[] = [[386, base - 32], [402, base - 98 + b], [520, base - 130 + b * 1.2], [680, base - 106 + b * 0.6], [792, base - 74], [814, base - 30]];
  k.fill(bl);
  k.sketch(bl, {closed: true, over: 7, layers: 2});
  // head on the pillow, nose up
  const lift = awake ? 34 : 0;
  head(k, [300 + lift * 0.9, base - 150 - lift], 1.8, awake ? -58 : -90, {id: d.conId, face: 1, look: d.con, eye: awake ? 'dot' : 'shut', mouth: awake ? 'open' : 'shut', ticks: awake});
};

// ---------- DAY: the sign goes on the shields ----------
const day = (k: Pen, F: number, t: number, d: Design) => {
  const cam = mix({c: [625, 455], z: 1.12}, {c: [1130, 470], z: 0.5}, act(t, 18, 9, 520));
  view(k, cam);
  ground(k, -300, 2500, 822);
  const xs = [905, 1260, 1610, 1960];
  const e0 = act(t, 3, 14, 521);
  xs.forEach((x, i) => {
    const e = i === 0 ? e0 : act(t, 17 + 2 * i, 5, 522 + i);
    person(k, [x, 822], mirror(SOL_HOLD), {id: 21 + i, face: -1, look: d.sol, shield: {shape: d.shield, emblem: e > 0 ? e : undefined}, spear: true, handF: 'fist'});
  });
  // Constantine paints the first one himself
  const hy = 226 - 22 * Math.sin(e0 * 9) * (e0 < 1 ? 1 : 0);
  person(k, [330, 822], {...STAND, elbowN: [50, 214], handN: [102, hy], elbowF: [-22, 198], handF: [-18, 160]}, {id: d.conId, face: 1, look: {...d.con, ...d.conDay}, handN: 'fist', handF: 'fist', stick: {dir: 0, len: 52}});
};

// ---------- MARCH ----------
const march = (k: Pen, F: number, t: number, d: Design) => {
  view(k, {c: [820 + t * 12, 470], z: 0.62});
  ground(k, -300, 2600, 822);
  for (let i = 0; i < 3; i++) {
    person(k, [240 + i * 340 + t * 16, 822], walk(t * 0.9 + i * 1.3), {id: 21 + i, face: 1, look: d.sol, shield: {shape: d.shield, emblem: 1}, spear: true, handF: 'fist'});
  }
  const J = walk(t * 0.9 + 0.6);
  person(k, [1290 + t * 16, 822], {...J, elbowN: [44, 236], handN: [92, 262], elbowF: [-22, 200], handF: [-20, 162]}, {id: d.conId, face: 1, look: {...d.con, ...d.conDay}, handN: 'fist', handF: 'fist', knife: {dir: 24, len: 96}});
};

// ---------- BATTLE on the bridge ----------
const battle = (k: Pen, F: number, t: number, d: Design) => {
  const cam: Cam = {c: [880, 520], z: 0.6};
  view(k, cam);
  const r = rng(F, 540);
  // river
  for (const y of [938, 978]) {
    const pts: P[] = [];
    for (let x = -80; x <= 1760; x += 60) pts.push([x, y + 9 * Math.sin(x * 0.045 + F * 0.8 + y)]);
    k.scrawl(pts, 3, {jit: 1.2});
  }
  // the bridge: deck, arches, and the broken end
  k.sketch([[-300, 640], [600, 644], [1420, 640]], {layers: 2, over: 4, wob: 1.6});
  k.sketch([[-300, 692], [600, 694], [1408, 690]], {layers: 2, over: 4, wob: 1.6});
  k.sketch([[1420, 640], [1398, 660], [1432, 674], [1408, 690]], {layers: 2, jit: 1.2});
  for (const cx of [150, 720, 1290]) k.sketch([[cx - 235, 930], [cx - 205, 790], [cx - 90, 716], [cx + 90, 716], [cx + 205, 790], [cx + 235, 930]], {curve: true, layers: 2, jit: 1.6});

  // the enemy: one recoils, one goes over the end
  const fall = Math.max(0, t - 6);
  const f2: P = [1335 + Math.min(t, 6) * 14 + fall * 9, 640 + Math.pow(fall, 1.7) * 7];
  if (f2[1] < 1010) {
    if (fall > 0) view(k, cam, 2.1, {deg: fall * 8, about: [f2[0], f2[1] - 330]});
    person(k, f2, mirror({...RECOIL, elbowN: [-4, 240], handN: [26, 296]}), {id: 32, face: -1, look: d.foe, mouth: 'open', handN: 'palm', handF: 'palm', ticks: true});
    view(k, cam);
  }
  if (f2[1] > 900) {
    // splash
    for (let i = 0; i < 7; i++) {
      const a = -Math.PI * (0.12 + 0.76 * (i / 6)), r0 = r(40, 70), len = r(40, 90);
      k.scrawl([[f2[0] + Math.cos(a) * r0, 940 + Math.sin(a) * r0], [f2[0] + Math.cos(a) * (r0 + len), 940 + Math.sin(a) * (r0 + len)]], 3, {jit: 1});
    }
  }
  person(k, [1075 + t * 7, 640], mirror(RECOIL), {id: 31, face: -1, look: d.foe, mouth: 'open', handF: 'palm', ticks: true, shield: {shape: d.foeShield, mark: d.foeMark}});
  // Constantine's men push forward behind the sign
  for (let i = 0; i < 2; i++) {
    const bob = 6 * Math.sin(t * 1.1 + i * 2);
    person(k, [130 + i * 345 + t * 8, 640], {...PUSH, handN: [112, 208 + bob], handF: [-10, 250 - bob]}, {id: 21 + i, face: 1, look: d.sol, shield: {shape: d.shield, emblem: 1}, spear: true, handF: 'fist'});
  }
};

// ---------- EMPEROR ----------
const emperor = (k: Pen, F: number, t: number, d: Design) => {
  view(k, mix({c: [480, 400], z: 1.22}, {c: [490, 430], z: 0.98}, act(t, 0, E_LEN, 560)));
  ground(k, -200, 1200, 822);
  // the standard with the sign
  k.sketch([[168, 822], [172, 120]], {layers: 2, over: 3, wob: 1.2});
  const ban: P[] = [[96, 150], [248, 146], [246, 330], [100, 334]];
  k.paper(ban);
  k.sketch(ban, {closed: true, over: 5, layers: 2});
  chiRho(k, [172, 240], 62, 1, 3.4);
  // a shield and a spear laid down at his feet
  k.sketch([[760, 822], [930, 470]], {layers: 2, jit: 1, wob: 1.2});
  shield(k, [846, 738], 84, {shape: d.shield, emblem: 1}, 98);
  // pedestal
  const s1: P[] = [[300, 822], [304, 782], [700, 780], [702, 822]], s2: P[] = [[352, 780], [354, 744], [650, 742], [652, 780]];
  for (const s of [s1, s2]) { k.paper(s); k.sketch(s, {closed: true, over: 5, layers: 2}); }
  // he crowns himself
  const p = act(t, 3, 8, 561), crowned = t >= 12;
  const liftU = (1 - p) * 34; // crown above the head, in sheet px
  // the far hand lifts the crown on from behind; then both fists go up
  const J: Joints = crowned
    ? {...STAND, elbowN: [58, 236], handN: [100, 300], elbowF: [-46, 276], handF: [-70, 340]}
    : {...STAND, elbowN: [32, 198], handN: [44, 162], elbowF: [-34, 290], handF: [-4, 350 + liftU]};
  person(k, [500, 742], J, {id: d.conId, face: 1, look: {...d.con, crown: d.crown}, handN: 'fist', handF: 'fist', crownLift: liftU * 2.1, ticks: crowned});
};

export const Constantine: React.FC<{frame: number; v: number}> = ({frame, v}) => {
  const d = DESIGNS[v];
  const k = makePen(frame * 13 + v);
  let t = frame;
  if (t < N_LEN) night(k, frame, t, d);
  else if ((t -= N_LEN) < D_LEN) day(k, frame, t, d);
  else if ((t -= D_LEN) < M_LEN) march(k, frame, t, d);
  else if ((t -= M_LEN) < B_LEN) battle(k, frame, t, d);
  else emperor(k, frame, t - B_LEN, d);
  return k.render();
};
