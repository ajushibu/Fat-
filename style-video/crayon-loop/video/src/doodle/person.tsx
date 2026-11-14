import {P, rng} from '../brush';
import {hyp, Pen} from './pen';

/*
 * The doodle figure (the approved construction: lopsided sweater block, white trousers, flat shoes,
 * wedge head with a long pointed nose, dot eye, scribbled hair, crude hands), plus optional looks and
 * props so the same figure can be a Roman: tunic or robe, cape, helmets, crowns, beard, shield, spear.
 * With no `look` it draws exactly the approved figure.
 *
 * Joints are in style-sheet px (a figure is ~340 tall): x right, y UP from the ground, relative to `origin`.
 * `sc` = world px per style-sheet px (2.1 on the approved sheet).
 */

export type Joints = {
  hip: P; neck: P; head: P; tilt?: number;
  kneeN: P; footN: P; kneeF: P; footF: P;
  elbowN?: P; handN?: P; elbowF?: P; handF?: P;
};
export type Helmet = 'crest' | 'dome' | 'brush' | 'plume' | 'cap';
export type Crown = 'laurel' | 'radiate' | 'diadem' | 'zigzag' | 'band';
export type ShieldShape = 'round' | 'oval' | 'rect' | 'hex' | 'kite';
export type Look = {
  garb?: 'sweater' | 'tunic' | 'robe';
  hair?: 'full' | 'back' | 'none' | 'fringe';
  beard?: boolean;
  helmet?: Helmet;
  crown?: Crown;
  cape?: boolean;
  build?: {belly?: number; nose?: number; head?: number; tall?: number};
};
export type Shield = {shape: ShieldShape; size?: number; emblem?: number; mark?: 'stripe' | 'dot' | 'none'};
export type FigOpt = {
  id: number; face: 1 | -1; look?: Look; hair?: 'full' | 'back'; mouth?: 'shut' | 'open'; eye?: 'dot' | 'shut';
  handN?: 'fist' | 'palm'; handF?: 'fist' | 'palm'; knife?: {dir: number; len?: number}; stick?: {dir: number; len: number};
  ticks?: boolean; shield?: Shield; spear?: boolean; crownLift?: number;
};

const lerp = (a: P, b: P, t: number): P => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
const perp = (a: P, b: P): P => {
  const d = hyp(a, b) || 1;
  return [-(b[1] - a[1]) / d, (b[0] - a[0]) / d];
};
const tube = (pts: P[], w: number[]): {L: P[]; Rr: P[]} => {
  const L: P[] = [], Rr: P[] = [];
  for (let i = 0; i < pts.length; i++) {
    const n = perp(pts[Math.max(0, i - 1)], pts[Math.min(pts.length - 1, i + 1)]), h = w[i] / 2;
    L.push([pts[i][0] + n[0] * h, pts[i][1] + n[1] * h]);
    Rr.push([pts[i][0] - n[0] * h, pts[i][1] - n[1] * h]);
  }
  return {L, Rr};
};
export const mirror = (J: Joints): Joints => {
  const m = (p?: P): P | undefined => (p ? [-p[0], p[1]] : undefined);
  return {hip: m(J.hip)!, neck: m(J.neck)!, head: m(J.head)!, tilt: J.tilt === undefined ? undefined : -J.tilt, kneeN: m(J.kneeN)!, footN: m(J.footN)!, kneeF: m(J.kneeF)!, footF: m(J.footF)!, elbowN: m(J.elbowN), handN: m(J.handN), elbowF: m(J.elbowF), handF: m(J.handF)};
};
// near-linear spacing with hand-drawn irregularity: no easing, no overshoot
export const act = (f: number, start: number, len: number, key: number) => {
  if (f <= start) return 0;
  if (f >= start + len) return 1;
  const steps = Array.from({length: len}, (_, k) => 1 + rng(key, k)(-0.5, 0.5));
  const tot = steps.reduce((a, b) => a + b, 0);
  let acc = 0;
  for (let k = 0; k < f - start; k++) acc += steps[k];
  return acc / tot;
};

// first `frac` of a polyline
const cut = (pts: P[], frac: number): P[] => {
  if (frac >= 1) return pts;
  const len = [0];
  for (let i = 1; i < pts.length; i++) len.push(len[i - 1] + hyp(pts[i - 1], pts[i]));
  const L = len[len.length - 1] * frac;
  const out: P[] = [pts[0]];
  for (let i = 1; i < pts.length; i++) {
    if (len[i] <= L) out.push(pts[i]);
    else { out.push(lerp(pts[i - 1], pts[i], (L - len[i - 1]) / (len[i] - len[i - 1] || 1))); break; }
  }
  return out;
};

// The Chi Rho: a P with an X through its stem, drawn stroke by stroke (p = 0..1). c = centre, h = half height (world px).
export const chiRho = (k: Pen, c: P, h: number, p: number, w = 3.3) => {
  const strokes: P[][] = [
    [[0, -1], [0, 0], [0, 1]],
    [[0, -1], [0.34, -0.98], [0.52, -0.72], [0.4, -0.42], [0, -0.34]],
    [[-0.6, -0.3], [0, 0.22], [0.6, 0.74]],
    [[0.6, -0.3], [0, 0.22], [-0.6, 0.74]],
  ];
  strokes.forEach((s, i) => {
    const fr = Math.max(0, Math.min(1, p * strokes.length - i));
    if (fr <= 0.05) return;
    k.scrawl(cut(s.map(([x, y]) => [c[0] + x * h, c[1] + y * h] as P), fr), w, {jit: 0.7, faint: 0});
  });
};

export const shield = (k: Pen, c: P, s: number, sh: Shield, id: number) => {
  const q = rng(977, id);
  const ell = (rx: number, ry: number, n = 14): P[] => Array.from({length: n}, (_, i) => [c[0] + Math.cos((i / n) * 6.283) * rx * q(0.94, 1.06), c[1] + Math.sin((i / n) * 6.283) * ry * q(0.94, 1.06)] as P);
  let poly: P[], curve = true, hh = s;
  if (sh.shape === 'round') poly = ell(s, s);
  else if (sh.shape === 'oval') { poly = ell(s * 0.74, s * 1.22); hh = s * 1.1; }
  else if (sh.shape === 'rect') { poly = [[-0.72, -1.2], [0.72, -1.24], [0.78, 1.2], [-0.76, 1.24]].map(([x, y]) => [c[0] + x * s, c[1] + y * s] as P); curve = false; hh = s * 1.05; }
  else if (sh.shape === 'hex') { poly = [[0, -1.3], [0.78, -0.72], [0.8, 0.7], [0, 1.3], [-0.8, 0.72], [-0.78, -0.7]].map(([x, y]) => [c[0] + x * s, c[1] + y * s] as P); curve = false; hh = s * 1.05; }
  else { poly = [[-0.8, -1.0], [0, -1.16], [0.8, -1.0], [0.78, 0.1], [0, 1.4], [-0.78, 0.1]].map(([x, y]) => [c[0] + x * s, c[1] + y * s] as P); curve = false; hh = s * 0.95; }
  k.paper(poly, curve);
  k.sketch(poly, {closed: true, curve, jit: 1.4, over: 5});
  if (sh.emblem !== undefined) chiRho(k, [c[0], c[1] - (sh.shape === 'kite' ? s * 0.12 : 0)], hh * 0.62, sh.emblem, 3.4);
  else if (sh.mark === 'stripe') {
    k.scrawl([[c[0] - s * 0.55, c[1] - s * 0.25], [c[0] + s * 0.55, c[1] - s * 0.3]], 3, {jit: 0.8});
    k.scrawl([[c[0] - s * 0.55, c[1] + s * 0.25], [c[0] + s * 0.55, c[1] + s * 0.2]], 3, {jit: 0.8});
  } else if (sh.mark === 'dot') {
    k.scrawl(Array.from({length: 9}, (_, i) => [c[0] + Math.cos((i / 8) * 6.283) * s * 0.26, c[1] + Math.sin((i / 8) * 6.283) * s * 0.26] as P), 3, {jit: 0.6});
  }
};

type HeadOpt = {id: number; face: 1 | -1; look?: Look; hair?: 'full' | 'back'; mouth?: 'shut' | 'open'; eye?: 'dot' | 'shut'; ticks?: boolean; crownLift?: number};

// The head on its own: hc = centre (world), sc = world px per sheet px, tiltDeg rotates it (-90 = lying on its back, nose up).
export const head = (k: Pen, hc: P, sc: number, tiltDeg: number, o: HeadOpt, neck?: P) => {
  const q = rng(4242, o.id);
  for (let i = 0; i < 15; i++) q(); // same quirk stream as the body, so a head matches its figure
  const Q = {head: q(0.95, 1.1), nose: q(1.62, 1.95), noseDrop: q(-0.04, 0.14), brow: q(-0.12, 0.08), chin: q(0.78, 0.98), jaw: q(-0.15, 0.1), crown: q(-0.12, 0.1)};
  const b = o.look?.build;
  if (b?.nose) Q.nose = b.nose;
  if (b?.head) Q.head = b.head;
  const r = k.R();
  const f = o.face, look = o.look ?? {};
  const HR = 46 * Q.head * sc, tilt = (tiltDeg * Math.PI) / 180;
  const H = ([x, y]: P): P => {
    const X = x * Math.cos(tilt) - y * Math.sin(tilt), Y = x * Math.sin(tilt) + y * Math.cos(tilt);
    return [hc[0] + f * X * HR, hc[1] + Y * HR];
  };
  const hj = (p: P, a = 0.05): P => [p[0] + r(-a, a), p[1] + r(-a, a)];
  const jt = (p: P, a: number): P => [p[0] + r(-a, a) * sc, p[1] + r(-a, a) * sc];
  if (neck) {
    k.sketch([H([-0.42, 0.9]), jt([neck[0] - f * 9 * sc, neck[1] + 6 * sc], 1.5)], {layers: 2, jit: 1, over: 4});
    k.sketch([H([0.12, 1.02]), jt([neck[0] + f * 11 * sc, neck[1] + 6 * sc], 1.5)], {layers: 2, jit: 1, over: 4});
  }
  const skull: P[] = [[-0.38, 0.92], [-0.88, 0.5], [-1.02, -0.05], [-0.82, -0.6], [-0.3, -0.98 + Q.crown], [0.22, -1.0 + Q.crown]].map((p) => hj(p as P));
  const tip: P = hj([Q.nose, 0.04 + Q.noseDrop], 0.06);
  const under: P = hj([0.72, 0.2 + Q.noseDrop * 0.5]);
  const face: P[] = o.mouth === 'open'
    ? [skull[skull.length - 1], hj([0.62 + Q.brow, -0.62]), tip, under, hj([0.66, 0.4]), hj([0.46, 0.5]), hj([0.82, 0.62]), hj([0.6, Q.chin]), hj([0.08, 1.0 + Q.jaw])]
    : [skull[skull.length - 1], hj([0.62 + Q.brow, -0.62]), tip, under, hj([0.68, 0.5]), hj([0.58, 0.56]), hj([0.7, 0.6]), hj([0.58, Q.chin]), hj([0.08, 1.0 + Q.jaw])];
  k.paper([...skull, ...face.slice(1), skull[0]].map(H));
  k.sketch(skull.map(H), {jit: 1.6, over: 4});
  k.sketch(face.map(H), {jit: 1.0, over: 6});
  if (o.eye === 'shut') k.scrawl([H([0.36, -0.2]), H([0.5, -0.14]), H([0.64, -0.2])], 2.6, {jit: 0.5, faint: 0});
  else k.dot(H(hj([0.52, -0.26], 0.04)), 2.6 * sc * r(0.85, 1.15), 3.2 * sc * r(0.85, 1.15));

  const hairKind = look.hair ?? o.hair ?? 'full';
  if (look.helmet) {
    const dome: P[] = [[-1.08, 0.12], [-1.04, -0.5], [-0.62, -1.02], [0.0, -1.16], [0.5, -1.0], [0.78, -0.58], [0.2, -0.52], [-0.5, -0.34], [-0.72, 0.16]].map((p) => H(hj(p as P, 0.03)));
    k.paper(dome);
    k.sketch(dome, {closed: true, jit: 1.2, over: 4, layers: 2});
    if (look.helmet === 'crest') {
      const cr: P[] = [[-0.92, -0.86], [-0.5, -1.4], [0.1, -1.54], [0.62, -1.32], [0.8, -0.92], [0.5, -1.06], [0.0, -1.2], [-0.6, -1.06]].map((p) => H(hj(p as P, 0.04)));
      k.fill(cr);
      k.sketch(cr, {closed: true, jit: 1.2, over: 4, layers: 2});
    } else if (look.helmet === 'brush') {
      for (let i = 0; i < 8; i++) {
        const t = i / 7, x = -0.62 + t * 1.12, y = -1.02 - 0.14 * Math.sin(t * Math.PI);
        k.scrawl([H([x, y]), H([x + r(-0.08, 0.08), y - r(0.3, 0.46)])], 3.2, {jit: 0.6});
      }
    } else if (look.helmet === 'plume') {
      k.tangle([[0.05, -1.16], [-0.2, -1.5], [-0.7, -1.62], [-1.2, -1.34], [-1.42, -0.86]].map((p) => H(p as P)), (t) => (5 + 5 * Math.sin(Math.PI * t)) * sc);
    } else if (look.helmet === 'dome') {
      k.scrawl(Array.from({length: 8}, (_, i) => H([0.0 + Math.cos((i / 7) * 6.283) * 0.12, -1.3 + Math.sin((i / 7) * 6.283) * 0.12])), 2.8, {jit: 0.5});
      k.sketch([H([0.74, -0.58]), H([1.08, -0.5])], {layers: 2, jit: 0.8, over: 3});
    } else {
      k.sketch([H([-1.06, 0.1]), H([-1.32, 0.34])], {layers: 2, jit: 0.8, over: 3});
      k.sketch([[-0.46, -0.32], [-0.42, 0.42], [-0.12, 0.5], [0.0, -0.42]].map((p) => H(p as P)), {layers: 2, jit: 0.8, over: 3});
    }
  } else if (hairKind !== 'none') {
    const spine: P[] = hairKind === 'full'
      ? [[0.5, -1.02], [0.02, -1.16], [-0.58, -1.02], [-0.98, -0.6], [-1.08, -0.08]]
      : hairKind === 'back'
        ? [[-0.32, -1.04], [-0.84, -0.78], [-1.08, -0.24], [-1.02, 0.3], [-0.76, 0.66]]
        : [[0.56, -0.92], [0.1, -1.08], [-0.5, -1.02], [-0.92, -0.62]];
    const hw = hairKind === 'full' ? [11, 7] : hairKind === 'back' ? [10, 6] : [6, 4];
    k.tangle(spine.map((p) => H(hj(p as P, 0.04))), (t) => (hw[0] + hw[1] * Math.sin(Math.PI * Math.min(1, t * (hairKind === 'full' ? 1.15 : 1)))) * sc);
  }
  if (look.beard) k.tangle([[0.74, 0.5], [0.6, 0.98], [0.14, 1.14], [-0.3, 1.0]].map((p) => H(p as P)), (t) => (5 + 4 * Math.sin(Math.PI * t)) * sc);

  if (look.crown) {
    const lift = (o.crownLift ?? 0) / HR; // in head units
    const C = ([x, y]: P): P => H([x, y - lift]);
    if (look.crown === 'laurel') {
      // a wreath: pairs of leaves along the hairline from the brow round to the nape
      for (let i = 0; i < 8; i++) {
        const t = i / 7, a = (-24 - t * 160) * (Math.PI / 180), x = Math.cos(a) * 1.04, y = Math.sin(a) * 1.04;
        for (const sgn of [-1, 1]) {
          const d2 = a - 1.25 + sgn * 0.5, tipx = x + Math.cos(d2) * 0.5, tipy = y + Math.sin(d2) * 0.5;
          k.scrawl([C([x, y]), C([(x + tipx) / 2 + Math.cos(d2 + sgn * 1.4) * 0.1, (y + tipy) / 2 + Math.sin(d2 + sgn * 1.4) * 0.1]), C([tipx, tipy])], 3.4, {jit: 0.5, faint: 0});
        }
      }
    } else if (look.crown === 'radiate') {
      const band: P[] = [[0.66, -0.66], [0.2, -0.98], [-0.4, -1.0], [-0.9, -0.62], [-1.04, -0.22]];
      k.sketch(band.map(C), {layers: 2, jit: 0.8, over: 3});
      for (let i = 0; i < 5; i++) {
        const a = (-38 - i * 30) * (Math.PI / 180), bx = Math.cos(a), by = Math.sin(a);
        const base = 1.04, tipR = 1.5 + r(-0.05, 0.08), wv = 0.13;
        k.sketch([C([bx * base - by * wv, by * base + bx * wv]), C([bx * tipR, by * tipR]), C([bx * base + by * wv, by * base - bx * wv])], {layers: 2, jit: 0.9, over: 2});
      }
    } else if (look.crown === 'diadem') {
      k.sketch([[0.68, -0.6], [0.2, -0.92], [-0.4, -0.94], [-0.92, -0.56], [-1.06, -0.16]].map((p) => C(p as P)), {layers: 2, jit: 0.7, over: 3});
      k.sketch([[0.62, -0.78], [0.18, -1.08], [-0.42, -1.1], [-0.98, -0.7], [-1.14, -0.26]].map((p) => C(p as P)), {layers: 2, jit: 0.7, over: 3});
      for (const [x, y] of [[0.28, -0.94], [-0.26, -1.03], [-0.8, -0.78]] as P[]) k.dot(C([x, y]), 2.4 * sc, 2.4 * sc);
    } else if (look.crown === 'zigzag') {
      const z: P[] = [[-0.74, -0.84], [-0.84, -1.5], [-0.44, -1.2], [-0.1, -1.66], [0.2, -1.22], [0.6, -1.5], [0.56, -0.82]].map((p) => C(hj(p as P, 0.03)));
      k.paper(z);
      k.sketch(z, {closed: true, jit: 1.0, over: 4, layers: 2});
    } else {
      k.sketch([[0.68, -0.58], [0.2, -0.9], [-0.4, -0.92], [-0.94, -0.52]].map((p) => C(p as P)), {layers: 3, jit: 0.8, over: 3});
      k.scrawl([C([-0.94, -0.52]), C([-1.3, -0.3]), C([-1.5, 0.1])], 3, {jit: 0.8});
      k.scrawl([C([-0.94, -0.52]), C([-1.24, -0.1]), C([-1.3, 0.34])], 3, {jit: 0.8});
    }
  }
  if (o.ticks) for (const a of [-0.5, 0, 0.5]) {
    const base = H([-0.1 + a * 0.9 + r(-0.1, 0.1), -1.5 - (a === 0 ? 0.12 : 0) + r(-0.06, 0.06) - (look.helmet || look.crown ? 0.5 : 0)]);
    k.scrawl([base, [base[0] + f * a * r(12, 20) * sc, base[1] - r(14, 26) * sc]], r(2.4, 3.2), {jit: 1.0});
  }
};

export const person = (k: Pen, origin: P, J: Joints, o: FigOpt, sc = 2.1) => {
  const q = rng(4242, o.id);
  const Q = {
    thigh: [q(40, 56), q(40, 56)], knee: [q(30, 44), q(30, 44)], ankle: [q(22, 32), q(22, 32)], shoe: [q(54, 78), q(54, 78)],
    kneeKink: [q(-9, 9), q(-9, 9)], shoulder: q(-0.12, 0.12), hem: q(-0.12, 0.12), lean: q(-0.16, 0.16), belly: q(0.92, 1.2), backW: q(0.85, 1.15),
    head: q(0.95, 1.1), nose: q(1.62, 1.95), noseDrop: q(-0.04, 0.14), brow: q(-0.12, 0.08), chin: q(0.78, 0.98), jaw: q(-0.15, 0.1), crown: q(-0.12, 0.1),
    sleeve: [q(0.84, 1.18), q(0.84, 1.18)], hipOff: q(2, 16),
  };
  const look = o.look ?? {};
  if (look.build?.belly) Q.belly = look.build.belly;
  const tall = look.build?.tall ?? 1;
  const r = k.R();
  const T = ([x, y]: P): P => [origin[0] + x * sc, origin[1] - y * tall * sc];
  const jt = (p: P, a: number): P => [p[0] + r(-a, a) * sc, p[1] + r(-a, a) * sc];
  const f = o.face;
  const hip = jt(T(J.hip), 2), neck = jt(T(J.neck), 2);

  // cape: hangs from the shoulders down the back, behind everything
  if (look.cape) {
    const cp: P[] = [[neck[0] + f * 4 * sc, neck[1] + 4 * sc], [neck[0] - f * 52 * sc, neck[1] + 24 * sc], [hip[0] - f * 88 * sc, hip[1] + 30 * sc], [hip[0] - f * 80 * sc, hip[1] + 104 * sc], [hip[0] - f * 14 * sc, hip[1] + 90 * sc]].map((p) => jt(p as P, 3));
    k.paper(cp);
    k.sketch(cp, {closed: true, over: 6, layers: 2});
    k.sketch([lerp(cp[1], cp[0], 0.3), lerp(cp[3], cp[4], 0.35)], {layers: 1, jit: 2, over: 2});
  }

  const leg = (i: number, kneeJ: P, foot: P, off: number) => {
    const h0: P = [hip[0] + off * sc, hip[1] + 2 * sc];
    const knee = jt(T(kneeJ), 3.5), ank = jt(T([foot[0], foot[1] + 14]), 2);
    const t = tube([h0, knee, ank], [Q.thigh[i] * sc, Q.knee[i] * sc, Q.ankle[i] * sc]);
    t.L[1] = [t.L[1][0] + Q.kneeKink[i] * sc, t.L[1][1] + r(-3, 3) * sc];
    t.Rr[1] = [t.Rr[1][0] - Q.kneeKink[i] * 0.4 * sc, t.Rr[1][1] + r(-3, 3) * sc];
    k.paper([...t.L, ...t.Rr.slice().reverse()]);
    k.sketch(t.L, {over: 7});
    k.sketch(t.Rr, {over: 7});
    const a = T(foot), len = Q.shoe[i] * sc, h = 15 * sc;
    const shoe: P[] = [jt([a[0] - f * 14 * sc, a[1] - h * 0.9], 2), jt([a[0] + f * len * 0.45, a[1] - h * 1.1], 2), jt([a[0] + f * len * 0.86, a[1] - h * 0.35], 2), jt([a[0] + f * len * 0.8, a[1] + h * 0.15], 2), jt([a[0] - f * 18 * sc, a[1] + h * 0.15], 2)];
    k.paper(shoe, true);
    k.sketch(shoe, {closed: true, curve: true, jit: 2.6});
  };
  leg(1, J.kneeF, J.footF, -f * Q.hipOff);
  leg(0, J.kneeN, J.footN, f * Q.hipOff * 0.5);

  const arm = (i: number, elbow: P | undefined, hand: P | undefined, kind: 'fist' | 'palm' | undefined, shoulderOff: number) => {
    if (!elbow || !hand) return;
    const sh: P = [neck[0] - f * shoulderOff * sc, neck[1] + 17 * sc];
    const el = jt(T(elbow), 3.5), hd = jt(T(hand), 1.5);
    const wrist = lerp(el, hd, 0.72);
    const w = Q.sleeve[i];
    const c = hd;
    if (i === 1 && o.spear) {
      // spear: a long shaft through the far fist, leaf point on top
      const top: P = [c[0] + f * 8 * sc, c[1] - 196 * sc], bot: P = [c[0] - f * 6 * sc, c[1] + 150 * sc];
      k.sketch([bot, top], {layers: 2, jit: 1.2, over: 2, wob: 1.2});
      const tipP: P = [top[0] + f * 2 * sc, top[1] - 44 * sc];
      const pt: P[] = [[top[0] - 9 * sc, top[1] - 8 * sc], tipP, [top[0] + 9 * sc, top[1] - 8 * sc], [top[0], top[1] + 4 * sc]];
      k.paper(pt);
      k.sketch(pt, {closed: true, layers: 2, jit: 1.0, over: 3});
    }
    const t = tube([sh, el, wrist], [36 * w * sc, 26 * w * sc, 24 * w * sc]);
    const poly = [...t.L, ...t.Rr.slice().reverse()];
    k.paper(poly);
    k.fill(poly);
    k.sketch(t.L, {over: 5, layers: 2});
    k.sketch(t.Rr, {over: 5, layers: 2});
    k.sketch([t.L[2], t.Rr[2]], {over: 4, layers: 1});
    if (kind === 'palm') {
      const tiltA = f * (0.12 + r(-0.14, 0.14));
      const pd: P = [Math.sin(tiltA), -Math.cos(tiltA)], pn: P = [Math.cos(tiltA), Math.sin(tiltA)];
      const W = 18.5 * sc * r(0.92, 1.08), L = 50 * sc * r(0.92, 1.06), tb = -f;
      const b0: P = [c[0] - pd[0] * L * 0.45, c[1] - pd[1] * L * 0.45];
      const g = (u: number, v: number): P => [b0[0] + pd[0] * L * v + pn[0] * W * u * tb + r(-1.4, 1.4) * sc, b0[1] + pd[1] * L * v + pn[1] * W * u * tb + r(-1.4, 1.4) * sc];
      const nF = r() < 0.75 ? 4 : 3;
      const tops = Array.from({length: nF}, (_, n) => r(0.86, 1.1) - (n === 0 || n === nF - 1 ? 0.08 : 0));
      const fw = 1.7 / nF;
      const outline: P[] = [g(-0.82, 0.0), g(-1.02, 0.4)];
      for (let n = 0; n < nF; n++) {
        const u0 = -0.85 + fw * n, u1 = u0 + fw, top = tops[n];
        outline.push(g(u0 + 0.02, top - 0.2), g(u0 + fw * 0.2, top - 0.02), g(u0 + fw * 0.5, top + 0.06), g(u0 + fw * 0.8, top - 0.02), g(u1 - 0.02, top - 0.18));
        if (n < nF - 1) outline.push(g(u1, Math.min(top, tops[n + 1]) - r(0.24, 0.34)));
      }
      outline.push(g(1.0, 0.5), g(1.5 + r(-0.12, 0.12), 0.56 + r(-0.08, 0.08)), g(1.62, 0.36), g(1.4, 0.2), g(1.0, 0.14), g(0.82, 0.0));
      k.paper(outline, true);
      k.scrawl(outline, 2.9, {jit: 0.55, faint: 0.1});
      for (let n = 0; n < nF - 1; n++) {
        if (r() < 0.3) continue;
        const u = -0.85 + fw * (n + 1);
        k.scrawl([g(u, Math.min(tops[n], tops[n + 1]) - 0.3), g(u + r(-0.1, 0.1), r(0.42, 0.6))], 2.3, {jit: 0.5});
      }
    } else {
      if (o.knife && i === 0) {
        const a = (o.knife.dir * Math.PI) / 180, ux = Math.cos(a), uy = -Math.sin(a), px = -uy, py = ux;
        const Lb = (o.knife.len ?? 80) * sc, bw = 8 * sc, hw = 10 * sc;
        const at = (al: number, si: number): P => [c[0] + ux * al * sc + px * si, c[1] + uy * al * sc + py * si];
        const tipP: P = [c[0] + ux * (12 * sc + Lb), c[1] + uy * (12 * sc + Lb)];
        const blade: P[] = [jt(at(12, bw * 1.25), 1), jt(at(12 + (Lb / sc) * 0.55, bw * 1.15), 1.2), jt(tipP, 1.5), jt(at(12 + (Lb / sc) * 0.4, -bw * 0.75), 1.2), jt(at(12, -bw * 0.9), 1)];
        k.paper(blade);
        k.sketch(blade, {closed: true, layers: 2, jit: 1.6, over: 6});
        const handle: P[] = [jt(at(-32, hw), 1.5), jt(at(13, hw), 1.5), jt(at(13, -hw), 1.5), jt(at(-32, -hw), 1.5)];
        k.paper(handle);
        k.sketch(handle, {closed: true, layers: 2, jit: 1.6, over: 6});
      }
      if (o.stick && i === 0) {
        const a = (o.stick.dir * Math.PI) / 180;
        k.sketch([[c[0] - Math.cos(a) * 16 * sc, c[1] + Math.sin(a) * 16 * sc], [c[0] + Math.cos(a) * o.stick.len * sc, c[1] - Math.sin(a) * o.stick.len * sc]], {layers: 2, jit: 0.8, over: 1, wob: 0.8});
      }
      const n = 5 + Math.floor(r(0, 3)), ph = r(0, 6.28);
      const lump: P[] = [];
      for (let m = 0; m < n; m++) {
        const a0 = ph + (m / n) * 6.283, a1 = ph + ((m + 0.5) / n) * 6.283, R0 = r(11, 15) * sc;
        lump.push([c[0] + Math.cos(a0) * R0, c[1] + Math.sin(a0) * R0 * 0.9], [c[0] + Math.cos(a1) * (R0 + r(2, 6) * sc), c[1] + Math.sin(a1) * (R0 + r(2, 6) * sc) * 0.9]);
      }
      k.paper(lump, true);
      k.scrawl(lump, 3.3, {closed: true, jit: 1.2, faint: 0.12});
    }
    if (i === 0 && o.shield) shield(k, c, 62 * sc * (o.shield.size ?? 1), o.shield, o.id);
  };
  arm(1, J.elbowF, J.handF, o.handF, -10);

  // the black garment: sweater (to the hip), tunic (to mid-thigh) or robe (to the shins)
  const garb = look.garb ?? 'sweater';
  const hemF = garb === 'sweater' ? 0.13 : garb === 'tunic' ? 0.46 : 0.98, flare = garb === 'sweater' ? 1 : garb === 'tunic' ? 1.12 : 1.3;
  const tn = perp(hip, neck), ax: P = [hip[0] - neck[0], hip[1] - neck[1]];
  const sw = 45 * sc, hw = 48 * sc * Q.belly;
  const hemC: P = [hip[0] + ax[0] * hemF, hip[1] + ax[1] * hemF];
  const pt = (c: P, side: number, along: number): P => jt([c[0] + tn[0] * side + ax[0] * along, c[1] + tn[1] * side + ax[1] * along], 3.5);
  const torso: P[] = [
    pt(neck, sw * 0.38, -0.04), pt(neck, sw * (0.95 + Q.lean), 0.1 + Q.shoulder), pt(neck, sw * (1.12 + Q.lean * 0.6), 0.58),
    ...(garb === 'sweater' ? [] : [pt(hip, hw * 1.04, 0.1)]),
    pt(hemC, hw * 1.04 * flare, Q.hem), pt(hemC, -hw * Q.backW * flare, -Q.hem),
    ...(garb === 'sweater' ? [] : [pt(hip, -hw * Q.backW, 0.1)]),
    pt(neck, -sw * (1.05 - Q.lean), 0.52), pt(neck, -sw * (0.95 - Q.lean * 0.5), 0.1 - Q.shoulder), pt(neck, -sw * 0.38, -0.04),
  ];
  k.paper(torso);
  k.fill(torso);
  k.sketch(torso, {closed: true, over: 9, layers: 2});

  head(k, T(J.head), sc, J.tilt ?? 0, o, neck);
  arm(0, J.elbowN, J.handN, o.handN, 6);
};

export const ground = (k: Pen, x0: number, x1: number, y: number) => {
  const mid = (x0 + x1) / 2;
  k.sketch([[x0, y], [mid - 40, y + 2]], {layers: 2, jit: 1.2, over: 10, wob: 1.4});
  k.sketch([[mid - 60, y + 1], [x1, y - 1]], {layers: 2, jit: 1.2, over: 10, wob: 1.4});
};
