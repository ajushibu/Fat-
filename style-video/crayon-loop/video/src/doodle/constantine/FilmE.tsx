import React from 'react';
import {P, rng} from '../../brush';
import {makePen, Pen} from '../pen';
import {act, chiRho, FigOpt, ground, head, Joints, Look, mirror, person, shield} from '../person';
import {Cam, cross, CON_FPS, DESIGNS, ell, mix, PUSH, RECOIL, SOL_HOLD, STAND, view, walk} from './Film';

/*
 * "Conquer by this", design E pushed further: the same shot plan and characters as constantine-5,
 * with more props and a distinct look and gesture for everyone in every shot.
 *
 *   NIGHT   the camp: tent, fire, a guard dozing on a log, Constantine snoring. The camera rises to the
 *           hollow cross with glow rings; the guard jolts awake; back down to Constantine waking.
 *   DAY     paint pot and brush; four soldiers, each different: one holds still for the brush, one leans
 *           on his spear, one scratches his head, one cheers when his shield gets the sign
 *   MARCH   standard-bearer with the Chi Rho banner, a drummer, dust at their feet, birds overhead
 *   BATTLE  wider framing so nobody overlaps; enemy standard; planks fly off the broken bridge; splash
 *   EMPEROR soldiers cheer either side of the pedestal, a trumpeter, birds; he crowns himself
 */

export const CONE_FPS = CON_FPS;
const N_LEN = 58, D_LEN = 30, M_LEN = 16, B_LEN = 22, E_LEN = 22;
export const CONE_LEN = N_LEN + D_LEN + M_LEN + B_LEN + E_LEN; // 148 frames = 10.4 s
const d = DESIGNS[4];

// ---------- props ----------
const fire = (k: Pen, c: P, F: number, s = 1) => {
  const r = rng(F, 901);
  k.sketch([[c[0] - 64 * s, c[1] + 4], [c[0] + 62 * s, c[1] - 16 * s]], {layers: 2, over: 5});
  k.sketch([[c[0] - 58 * s, c[1] - 16 * s], [c[0] + 60 * s, c[1] + 2]], {layers: 2, over: 5});
  const h = (112 + r(-20, 20)) * s;
  const flame: P[] = [[c[0] - 46 * s, c[1] - 12 * s], [c[0] - 40 * s + r(-6, 6), c[1] - h * 0.5], [c[0] - 16 * s + r(-8, 8), c[1] - h * 0.78], [c[0] - 4 * s + r(-10, 10), c[1] - h], [c[0] + 12 * s, c[1] - h * 0.58], [c[0] + 30 * s + r(-8, 8), c[1] - h * 0.86], [c[0] + 44 * s, c[1] - h * 0.42], [c[0] + 48 * s, c[1] - 12 * s]];
  k.fill(flame);
  k.sketch(flame, {closed: true, curve: true, jit: 1.4});
  const tongue: P[] = [[c[0] - 16 * s, c[1] - 18 * s], [c[0] - 6 * s + r(-5, 5), c[1] - h * 0.48], [c[0] + 10 * s, c[1] - 18 * s]];
  k.paper(tongue, true);
  for (let i = 0; i < 4; i++) k.dot([c[0] + Math.sin(F * 0.7 + i * 2) * 34 * s, c[1] - h - ((F * 11 + i * 37) % 130) * s], 3, 3);
};
const crate = (k: Pen, x: number, y: number, w: number, h: number) => {
  const b: P[] = [[x, y], [x + w, y - 2], [x + w + 2, y - h], [x + 2, y - h - 2]];
  k.paper(b);
  k.sketch(b, {closed: true, over: 5, layers: 2});
  k.sketch([[x + 6, y - 6], [x + w - 6, y - h + 6]], {layers: 1, jit: 1, over: 2});
};
const jug = (k: Pen, c: P, s = 1) => {
  const b = ell([c[0], c[1] - 34 * s], 26 * s, 34 * s, 12);
  k.paper(b, true);
  k.sketch(b, {closed: true, curve: true, jit: 1.4, layers: 2});
  k.sketch([[c[0] - 10 * s, c[1] - 66 * s], [c[0] - 12 * s, c[1] - 84 * s], [c[0] + 12 * s, c[1] - 84 * s], [c[0] + 10 * s, c[1] - 66 * s]], {layers: 2, jit: 1});
  k.scrawl([[c[0] + 22 * s, c[1] - 56 * s], [c[0] + 42 * s, c[1] - 50 * s], [c[0] + 40 * s, c[1] - 28 * s], [c[0] + 24 * s, c[1] - 22 * s]], 3, {jit: 0.6});
};
const cup = (k: Pen, c: P) => {
  const b: P[] = [[c[0] - 16, c[1] - 34], [c[0] + 16, c[1] - 34], [c[0] + 12, c[1]], [c[0] - 12, c[1]]];
  k.paper(b);
  k.sketch(b, {closed: true, layers: 2, jit: 1, over: 3});
};
// a helmet hung on a post
const helmetPost = (k: Pen, base: P) => {
  k.sketch([base, [base[0] + 4, base[1] - 210]], {layers: 2, jit: 1, wob: 1});
  const dome: P[] = [[base[0] - 46, base[1] - 196], [base[0] - 40, base[1] - 240], [base[0], base[1] - 262], [base[0] + 44, base[1] - 240], [base[0] + 52, base[1] - 196]];
  k.paper(dome, true);
  k.sketch(dome, {curve: true, layers: 2, jit: 1.2});
  k.sketch([[base[0] - 54, base[1] - 196], [base[0] + 60, base[1] - 194]], {layers: 2, jit: 1});
};
// a pole with a flag that flaps. emblem: 'chi' = the sign, 'ring' = the enemy's mark
const banner = (k: Pen, base: P, h: number, F: number, emblem: 'chi' | 'ring' | 'none', w = 130, dir = 1) => {
  const top: P = [base[0] + 4 * dir, base[1] - h];
  k.sketch([base, top], {layers: 2, jit: 1, over: 3, wob: 1.2});
  k.dot(top, 7, 7);
  const fh = w * 1.1;
  const flap = (y: number) => 10 * Math.sin(F * 0.9 + y * 0.03);
  const flag: P[] = [[top[0], top[1] + 12], [top[0] + dir * (w + flap(0)), top[1] + 16], [top[0] + dir * (w + flap(fh * 0.5)), top[1] + 12 + fh * 0.55], [top[0] + dir * (w + flap(fh)), top[1] + 8 + fh], [top[0], top[1] + 12 + fh]];
  k.paper(flag);
  k.sketch(flag, {closed: true, jit: 1.2, over: 4, layers: 2});
  const fc: P = [top[0] + (dir * w) / 2, top[1] + 12 + fh / 2];
  if (emblem === 'chi') chiRho(k, fc, fh * 0.34, 1, 3.2);
  else if (emblem === 'ring') {
    k.sketch(ell(fc, fh * 0.26, fh * 0.26, 12), {closed: true, curve: true, layers: 2, jit: 1});
    k.dot(fc, 8, 8);
  }
};
const paintPot = (k: Pen, c: P) => {
  const b: P[] = [[c[0] - 40, c[1] - 66], [c[0] + 40, c[1] - 66], [c[0] + 32, c[1]], [c[0] - 32, c[1]]];
  k.paper(b);
  k.sketch(b, {closed: true, layers: 2, jit: 1.2, over: 4});
  const top = ell([c[0], c[1] - 66], 40, 11, 12);
  k.fill(top);
  k.sketch(top, {closed: true, curve: true, jit: 1});
  k.scrawl([[c[0] + 20, c[1] - 62], [c[0] + 22, c[1] - 40]], 3.4, {jit: 0.4});
  k.scrawl([[c[0] - 12, c[1] - 62], [c[0] - 12, c[1] - 50]], 3.4, {jit: 0.4});
  // handle
  k.scrawl([[c[0] - 40, c[1] - 66], [c[0] - 30, c[1] - 110], [c[0] + 30, c[1] - 110], [c[0] + 40, c[1] - 66]], 2.8, {jit: 0.8});
};
const drum = (k: Pen, c: P, F: number) => {
  const r0 = 52, h = 70;
  const body: P[] = [[c[0] - r0, c[1] - h / 2], [c[0] + r0, c[1] - h / 2], [c[0] + r0, c[1] + h / 2], [c[0] - r0, c[1] + h / 2]];
  k.paper(body);
  k.sketch(body, {closed: true, layers: 2, jit: 1.2, over: 3});
  k.sketch(ell([c[0], c[1] - h / 2], r0, 13, 12), {closed: true, curve: true, layers: 2, jit: 1});
  const zz: P[] = [];
  for (let i = 0; i <= 6; i++) zz.push([c[0] - r0 + (i * 2 * r0) / 6, c[1] + (i % 2 ? -h * 0.3 : h * 0.3)]);
  k.scrawl(zz, 2.6, {jit: 0.6});
  // the stick goes up and down
  const up = Math.abs(Math.sin(F * 1.3)) * 50;
  k.sketch([[c[0] + 10, c[1] - h / 2 - 4 - up], [c[0] + 70, c[1] - h / 2 - 50 - up * 0.6]], {layers: 2, jit: 0.8, over: 2});
  k.dot([c[0] + 10, c[1] - h / 2 - 4 - up], 7, 7);
};
const birds = (k: Pen, c: P, F: number, n = 3, s = 1) => {
  const q = rng(888, n);
  for (let i = 0; i < n; i++) {
    const p: P = [c[0] + q(-160, 160) * s + F * 3, c[1] + q(-60, 60) * s];
    const fl = Math.sin(F * 1.4 + i * 2) * 12 * s;
    k.scrawl([[p[0] - 22 * s, p[1] - fl], [p[0], p[1] + 6 * s], [p[0] + 22 * s, p[1] - fl]], 2.8, {jit: 0.4, faint: 0});
  }
};
const dust = (k: Pen, p: P, F: number, seed: number) => {
  const r = rng(F, seed);
  if (r() < 0.45) return;
  const c: P = [p[0] - 30 + r(-8, 8), p[1] - 14];
  k.scrawl(Array.from({length: 7}, (_, i) => [c[0] + Math.cos(i * 1.1) * 16 * (1 + i * 0.1), c[1] + Math.sin(i * 1.1) * 10] as P), 2.4, {jit: 0.5});
};
// little loops rising from a sleeper (no letters)
const snore = (k: Pen, p: P, F: number) => {
  for (let i = 0; i < 3; i++) {
    const age = (F * 0.8 + i * 5) % 15;
    const c: P = [p[0] + age * 6 + Math.sin(age) * 6, p[1] - age * 11];
    const rr = 6 + age * 1.3;
    k.scrawl(Array.from({length: 9}, (_, j) => [c[0] + Math.cos(j * 0.8) * rr, c[1] + Math.sin(j * 0.8) * rr] as P), 2.4, {jit: 0.4});
  }
};

// ---------- looks ----------
const SOL: Look = d.sol;
const SOLDIERS: {id: number; look: Look}[] = [
  {id: 21, look: {...SOL, build: {tall: 1.06, belly: 0.9}}},
  {id: 22, look: {garb: 'tunic', hair: 'full', beard: true, build: {belly: 1.28, tall: 0.92}}},
  {id: 23, look: {...SOL, build: {nose: 2.1}}},
  {id: 24, look: {garb: 'tunic', helmet: 'brush', build: {tall: 1.1}}},
];
const CON: Look = d.con;

// ---------- NIGHT ----------
const SIT: Joints = {hip: [0, 70], neck: [14, 160], head: [34, 208], tilt: 0, kneeN: [52, 76], footN: [56, 6], kneeF: [44, 70], footF: [40, 6], elbowN: [46, 120], handN: [76, 128], elbowF: [34, 118], handF: [64, 120]};
const night = (k: Pen, F: number, t: number) => {
  const CAM_BED: Cam = {c: [800, 560], z: 0.68}, CAM_SKY: Cam = {c: [620, 80], z: 0.6}, CAM_FACE: Cam = {c: [370, 610], z: 1.6};
  const up = act(t, 16, 8, 501), down = act(t, 44, 6, 502);
  const cam = down > 0 ? mix(CAM_SKY, CAM_FACE, down) : mix(CAM_BED, CAM_SKY, up);
  view(k, cam, 1.8);
  const awake = t >= 51, seen = t >= 30;
  const base = 768;
  const r = rng(F, 510);
  const moon: P[] = [[1060, 20], [1100, 60], [1106, 110], [1076, 150], [1098, 104], [1086, 60]];
  k.sketch(moon, {closed: true, curve: true, jit: 1.2, layers: 2});
  const sq = rng(73, 1);
  for (let i = 0; i < 11; i++) {
    const sp: P = [sq(40, 1240), sq(-760, 60)];
    if (Math.hypot(sp[0] - 560, sp[1] + 330) < 470 || r() < 0.25) continue;
    k.dot(sp, 3.2, 3.2);
  }
  // tent, open at the front
  k.sketch([[60, 822], [500, 170]], {layers: 2, over: 12, wob: 1.6});
  k.sketch([[500, 170], [940, 822]], {layers: 2, over: 12, wob: 1.6});
  banner(k, [500, 170], 90, F, 'none', 56);
  ground(k, -300, 1600, 822);
  cross(k, [560, -330], 215, act(t, 25, 9, 503), F, d.cross);

  // inside: helmet on a post, a crate with a jug and a cup
  helmetPost(k, [120, 822]);
  crate(k, 852, 822, 96, 70);
  jug(k, [884, 752], 0.8);
  cup(k, [928, 752]);
  // bed
  const mat: P[] = [[200, base - 28], [822, base - 28], [822, base], [200, base]];
  k.paper(mat);
  k.sketch(mat, {closed: true, over: 6, layers: 2});
  k.sketch([[236, base], [236, 822]], {layers: 2, over: 3});
  k.sketch([[786, base], [786, 822]], {layers: 2, over: 3});
  // sandals under the bed
  for (const x of [330, 380]) {
    const sd = ell([x, 812], 22, 8, 10);
    k.paper(sd, true);
    k.sketch(sd, {closed: true, curve: true, jit: 1.2});
  }
  const pil = ell([300, base - 52], 82, 26);
  k.paper(pil, true);
  k.sketch(pil, {closed: true, curve: true, jit: 2, layers: 2});
  for (const [x, y] of [[838, base - 76], [868, base - 66]] as P[]) {
    const ft = ell([x, y], 17, 40, 10);
    k.paper(ft, true);
    k.sketch(ft, {closed: true, curve: true, jit: 1.6, layers: 2});
  }
  const b = awake ? -20 : -8 * Math.sin(F * 0.5);
  const bl: P[] = [[400, base - 32], [416, base - 98 + b], [530, base - 130 + b * 1.2], [690, base - 106 + b * 0.6], [792, base - 74], [814, base - 30]];
  k.fill(bl);
  k.sketch(bl, {closed: true, over: 7, layers: 2});
  // head on the pillow: asleep, snoring; awake, eyes open and mouth open, still flat on his back
  head(k, [318, base - 150 - (awake ? 10 : 0)], 1.8, awake ? -84 : -90, {id: d.conId, face: 1, look: CON, eye: awake ? 'dot' : 'shut', mouth: awake ? 'open' : 'shut', ticks: awake});
  if (!awake) snore(k, [400, base - 230], F);
  // outside: the fire and a guard on a log, nodding off; he jolts awake when the cross appears
  fire(k, [1060, 822], F);
  const log: P[] = [[1290, 822], [1296, 790], [1470, 786], [1474, 820]];
  k.paper(log);
  k.sketch(log, {closed: true, layers: 2, jit: 1.2, over: 4});
  const nod = seen ? -10 : 8 + 10 * Math.max(0, Math.sin(F * 0.35));
  const g: Joints = {...SIT, tilt: nod, head: seen ? [26, 214] : [34, 202]};
  person(k, [1390, 790], mirror(g), {id: 25, face: -1, look: {...SOL, build: {belly: 1.15}}, handN: 'fist', handF: 'fist', spear: true, eye: seen ? 'dot' : 'shut', mouth: seen ? 'open' : 'shut', ticks: seen && t < 44});
};

// ---------- DAY ----------
const day = (k: Pen, F: number, t: number) => {
  const cam = mix({c: [600, 455], z: 1.1}, {c: [1180, 470], z: 0.48}, act(t, 18, 9, 520));
  view(k, cam);
  ground(k, -400, 2700, 822);
  // the camp behind them
  k.sketch([[2120, 822], [2330, 520], [2540, 822]], {layers: 2, over: 8, wob: 1.4});
  banner(k, [2330, 520], 70, F, 'none', 44);
  crate(k, 2240, 822, 90, 66);
  crate(k, 2250, 756, 70, 56);
  const xs = [905, 1260, 1610, 1960];
  const e0 = act(t, 3, 14, 521);
  xs.forEach((x, i) => {
    const e = i === 0 ? e0 : act(t, 17 + 2 * i, 5, 522 + i);
    const S = SOLDIERS[i];
    let J: Joints = SOL_HOLD;
    const o: FigOpt = {id: S.id, face: -1, look: S.look, shield: {shape: d.shield, emblem: e > 0 ? e : undefined}, spear: true, handF: 'fist', mouth: 'shut', ticks: false};
    if (i === 1) J = {...SOL_HOLD, hip: [6, 150], neck: [-6, 240], head: [-14, 292], tilt: -8}; // leans back on his spear, bored
    if (i === 2) {
      // scratches his head with the far hand
      J = {...SOL_HOLD, elbowF: [-40, 268], handF: [-6, 320 + 6 * Math.sin(F * 2.2)]};
      o.handF = 'fist';
      o.spear = false;
    }
    if (i === 3 && e >= 1) {
      // cheers when his shield gets the sign
      J = {...SOL_HOLD, elbowF: [-40, 280], handF: [-30, 352 + 10 * Math.sin(F * 1.6)]};
      o.spear = false;
      o.mouth = 'open';
      o.ticks = true;
    }
    if (i === 0) o.mouth = e > 0 && e < 1 ? 'open' : 'shut'; // holds his breath while being painted
    person(k, [x, 822], mirror(J), o);
  });
  // the paint pot, and Constantine with the brush
  paintPot(k, [610, 822]);
  const hy = 226 - 22 * Math.sin(e0 * 9) * (e0 < 1 ? 1 : 0);
  person(k, [330, 822], {...STAND, elbowN: [50, 214], handN: [102, hy], elbowF: [-22, 198], handF: [-18, 160]}, {id: d.conId, face: 1, look: {...CON, ...d.conDay}, handN: 'fist', handF: 'fist', stick: {dir: 0, len: 52}});
  // a blob of black paint on the brush tip
  k.dot([330 + 102 * 2.1 + 52 * 2.1, 822 - hy * 2.1], 7, 7);
};

// ---------- MARCH ----------
const march = (k: Pen, F: number, t: number) => {
  view(k, {c: [1060 + t * 14, 440], z: 0.47});
  ground(k, -400, 2800, 822);
  birds(k, [900, 0], F, 4, 1.4);
  // the drummer at the back
  const dx = 40 + t * 16;
  person(k, [dx, 822], {...walk(t * 0.9 + 2.2), elbowN: [44, 200], handN: [74, 176], elbowF: [-10, 196], handF: [10, 170]}, {id: 26, face: 1, look: {garb: 'tunic', hair: 'full', build: {belly: 1.3, tall: 0.9}}, handN: 'fist', handF: 'fist'});
  drum(k, [dx + 120, 822 - 300], F);
  dust(k, [dx, 822], F, 610);
  for (let i = 0; i < 3; i++) {
    const x = 420 + i * 410 + t * 16;
    const S = SOLDIERS[i === 2 ? 3 : i];
    person(k, [x, 822], walk(t * 0.9 + i * 1.3), {id: S.id, face: 1, look: S.look, shield: {shape: d.shield, emblem: 1}, spear: true, handF: 'fist'});
    dust(k, [x, 822], F, 611 + i);
  }
  // the standard-bearer with the sign, then Constantine
  const sx = 1660 + t * 16;
  person(k, [sx, 822], {...walk(t * 0.9 + 3.1), elbowN: [30, 220], handN: [48, 250], elbowF: [-22, 200], handF: [-10, 170]}, {id: 23, face: 1, look: SOLDIERS[2].look, handN: 'fist', handF: 'fist'});
  banner(k, [sx + 48 * 2.1, 822 - 120], 980, F, 'chi', 190, -1);
  dust(k, [sx, 822], F, 615);
  const J = walk(t * 0.9 + 0.6);
  const cx = 2060 + t * 16;
  person(k, [cx, 822], {...J, elbowN: [44, 236], handN: [92, 262], elbowF: [-22, 200], handF: [-20, 162]}, {id: d.conId, face: 1, look: {...CON, ...d.conDay}, handN: 'fist', handF: 'fist', knife: {dir: 24, len: 96}});
  dust(k, [cx, 822], F, 616);
};

// ---------- BATTLE ----------
const battle = (k: Pen, F: number, t: number) => {
  const cam: Cam = {c: [1010, 460], z: 0.45};
  view(k, cam);
  const r = rng(F, 540);
  for (const y of [938, 978, 1018]) {
    const pts: P[] = [];
    for (let x = -200; x <= 2100; x += 60) pts.push([x, y + 9 * Math.sin(x * 0.045 + F * 0.8 + y)]);
    k.scrawl(pts, 3, {jit: 1.2});
  }
  k.sketch([[-500, 640], [700, 644], [1700, 640]], {layers: 2, over: 4, wob: 1.6});
  k.sketch([[-500, 692], [700, 694], [1688, 690]], {layers: 2, over: 4, wob: 1.6});
  k.sketch([[1700, 640], [1678, 660], [1712, 674], [1688, 690]], {layers: 2, jit: 1.2});
  for (const cx of [-40, 540, 1120]) k.sketch([[cx - 235, 930], [cx - 205, 790], [cx - 90, 716], [cx + 90, 716], [cx + 205, 790], [cx + 235, 930]], {curve: true, layers: 2, jit: 1.6});
  // planks flying off the broken end
  for (let i = 0; i < 3; i++) {
    const age = t - 4 - i * 3;
    if (age < 0) continue;
    const p: P = [1700 + age * (14 + i * 6), 650 + age * age * 3.2 - age * 14];
    if (p[1] > 960) continue;
    const a = age * (0.3 + i * 0.1), L = 46;
    k.sketch([[p[0] - Math.cos(a) * L, p[1] - Math.sin(a) * L], [p[0] + Math.cos(a) * L, p[1] + Math.sin(a) * L]], {layers: 2, jit: 1, over: 2, w: 6});
  }
  // the enemy: their standard drops, one recoils, one goes over the end
  const drop = act(t, 8, 8, 541);
  banner(k, [1480 + drop * 60, 640], 820 - drop * 560, F, 'ring', 170);
  const fall = Math.max(0, t - 6);
  const f2: P = [1600 + Math.min(t, 6) * 12 + fall * 9, 640 + Math.pow(fall, 1.7) * 7];
  if (f2[1] < 1010) {
    if (fall > 0) view(k, cam, 2.1, {deg: fall * 8, about: [f2[0], f2[1] - 330]});
    person(k, f2, mirror({...RECOIL, elbowN: [-4, 240], handN: [26, 296]}), {id: 32, face: -1, look: d.foe, mouth: 'open', handN: 'palm', handF: 'palm', ticks: true});
    view(k, cam);
  }
  if (f2[1] > 900) {
    for (let i = 0; i < 8; i++) {
      const a = -Math.PI * (0.1 + 0.8 * (i / 7)), r0 = r(40, 70), len = r(50, 110);
      k.scrawl([[f2[0] + Math.cos(a) * r0, 940 + Math.sin(a) * r0], [f2[0] + Math.cos(a) * (r0 + len), 940 + Math.sin(a) * (r0 + len)]], 3, {jit: 1});
    }
  }
  person(k, [1240 + t * 6, 640], mirror(RECOIL), {id: 31, face: -1, look: d.foe, mouth: 'open', handF: 'palm', ticks: true, shield: {shape: d.foeShield, mark: d.foeMark}});
  // Constantine's men push behind the sign; the standard-bearer at the back
  person(k, [-90 + t * 8, 640], {...STAND, elbowN: [24, 222], handN: [14, 260], elbowF: [-22, 200], handF: [-12, 170]}, {id: 23, face: 1, look: SOLDIERS[2].look, handN: 'fist', handF: 'fist', mouth: 'open'});
  banner(k, [-90 + t * 8 + 30, 640 - 120], 900, F, 'chi', 190, 1);
  for (let i = 0; i < 2; i++) {
    const bob = 6 * Math.sin(t * 1.1 + i * 2);
    const S = SOLDIERS[i === 0 ? 3 : 0];
    person(k, [300 + i * 440 + t * 8, 640], {...PUSH, handN: [112, 208 + bob], handF: [-10, 250 - bob]}, {id: S.id, face: 1, look: S.look, shield: {shape: d.shield, emblem: 1}, spear: true, handF: 'fist', mouth: 'open'});
  }
};

// ---------- EMPEROR ----------
const emperor = (k: Pen, F: number, t: number) => {
  view(k, mix({c: [500, 420], z: 0.92}, {c: [500, 440], z: 0.7}, act(t, 0, E_LEN, 560)));
  ground(k, -400, 1400, 822);
  birds(k, [420, -60], F, 5, 1.2);
  banner(k, [-120, 822], 640, F, 'chi', 130, 1);
  // two soldiers cheer either side, smaller and behind; a trumpeter on the right
  const ch = act(t, 12, 4, 562);
  const cheer = (x: number, id: number, look: Look, face: 1 | -1) => {
    const J: Joints = ch > 0
      ? {...STAND, elbowN: [40, 270], handN: [36, 340 + 8 * Math.sin(F * 1.7 + id)], elbowF: [-30, 270], handF: [-36, 334 + 8 * Math.sin(F * 1.5 + id)]}
      : {...STAND, elbowN: [24, 196], handN: [36, 160], elbowF: [-22, 198], handF: [-18, 160]};
    person(k, [x, 822], face === 1 ? J : mirror(J), {id, face, look, handN: ch > 0 ? 'palm' : 'fist', handF: ch > 0 ? 'palm' : 'fist', mouth: ch > 0 ? 'open' : 'shut', ticks: ch > 0}, 1.55);
  };
  cheer(110, 22, SOLDIERS[1].look, 1);
  cheer(900, 21, SOLDIERS[0].look, -1);
  // trumpeter, blowing towards the pedestal
  const TX = 1110, TS = 1.55;
  person(k, [TX, 822], mirror({...STAND, elbowN: [40, 238], handN: [70, 262], elbowF: [24, 230], handF: [56, 258], tilt: -14}), {id: 24, face: -1, look: SOLDIERS[3].look, handN: 'fist', handF: 'fist'}, TS);
  const hand: P = [TX - 70 * TS, 822 - 262 * TS];
  const tr: P[] = [[hand[0] + 6, hand[1] - 8], [hand[0] - 150, hand[1] - 40], [hand[0] - 168, hand[1] - 2], [hand[0] + 6, hand[1] + 6]];
  k.paper(tr);
  k.sketch(tr, {closed: true, layers: 2, jit: 1, over: 3});
  if (ch > 0) for (let i = 0; i < 3; i++) k.scrawl([[hand[0] - 180 - i * 4, hand[1] - 40 + i * 22], [hand[0] - 226 - i * 8, hand[1] - 52 + i * 28]], 2.6, {jit: 0.6});
  // shield and spear laid at his feet
  k.sketch([[700, 822], [800, 560]], {layers: 2, jit: 1, wob: 1.2});
  shield(k, [750, 768], 56, {shape: d.shield, emblem: 1}, 98);
  // pedestal
  const s1: P[] = [[300, 822], [304, 782], [700, 780], [702, 822]], s2: P[] = [[352, 780], [354, 744], [650, 742], [652, 780]];
  for (const s of [s1, s2]) { k.paper(s); k.sketch(s, {closed: true, over: 5, layers: 2}); }
  const p = act(t, 3, 8, 561), crowned = t >= 12;
  const liftU = (1 - p) * 34;
  const J: Joints = crowned
    ? {...STAND, elbowN: [58, 236], handN: [100, 300], elbowF: [-46, 276], handF: [-70, 340]}
    : {...STAND, elbowN: [32, 198], handN: [44, 162], elbowF: [-34, 290], handF: [-4, 350 + liftU]};
  person(k, [500, 742], J, {id: d.conId, face: 1, look: {...CON, crown: d.crown}, handN: 'fist', handF: 'fist', crownLift: liftU * 2.1, ticks: crowned});
};

export const ConstantineE: React.FC<{frame: number}> = ({frame}) => {
  const k = makePen(frame * 17 + 5);
  let t = frame;
  if (t < N_LEN) night(k, frame, t);
  else if ((t -= N_LEN) < D_LEN) day(k, frame, t);
  else if ((t -= D_LEN) < M_LEN) march(k, frame, t);
  else if ((t -= M_LEN) < B_LEN) battle(k, frame, t);
  else emperor(k, frame, t - B_LEN);
  return k.render();
};
