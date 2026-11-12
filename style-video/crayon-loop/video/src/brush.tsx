import React from 'react';

/*
 * A dry-crayon brush model in plain SVG.
 *
 * How the reference line behaves (see ../STYLE.md):
 *  - grain is ~1 px and reacts to pressure: heavy strokes are solid with a fuzzy
 *    halo of grain, light strokes dissolve into dots
 *  - one stroke changes weight along its length, tapers at the ends
 *  - black areas are filled by back-and-forth strokes, leaving small flecks
 *
 * Model: every stroke is a variable-width ribbon whose opacity is its PRESSURE.
 * The filter blurs that pressure a little (soft crayon edge), adds paper tooth
 * (fine noise) and dry patches (coarse noise), then thresholds. Where pressure
 * is high the ink is solid; where it is low only the grain peaks take ink.
 */

export const PAPER = '#fdfdfd'; // measured paper RGB 253
export const INK = '#030303'; // measured ink: darkest k-means cluster #030303, mean of ink pixels RGB 10

export type P = [number, number];
export type Rnd = (lo?: number, hi?: number) => number;

// ---------- deterministic randomness (frame number in, same drawing out) ----------
const mulberry = (a: number) => () => {
  a |= 0;
  a = (a + 0x6d2b79f5) | 0;
  let t = Math.imul(a ^ (a >>> 15), 1 | a);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
export const rng = (...keys: number[]): Rnd => {
  const r = mulberry(keys.reduce((h, k) => Math.imul(h ^ (Math.round(k) * 2654435761), 1597334677) >>> 0, 0x9e3779b9));
  r(); r();
  return (lo = 0, hi = 1) => lo + (hi - lo) * r();
};

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const lerpP = (a: P, b: P, t: number): P => [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];

// rotate (deg) + scale about a pivot, then translate
export const xf = (p: P, tx: number, ty: number, deg = 0, px = 0, py = 0, s = 1): P => {
  const a = (deg * Math.PI) / 180, c = Math.cos(a) * s, si = Math.sin(a) * s;
  return [px + (p[0] - px) * c - (p[1] - py) * si + tx, py + (p[0] - px) * si + (p[1] - py) * c + ty];
};

// Catmull-Rom through the points, sampled to a dense polyline
export const sample = (pts: P[], closed = false, step = 4): P[] => {
  const n = pts.length;
  if (n < 2) return pts.slice();
  const at = (i: number) => (closed ? pts[((i % n) + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]);
  const out: P[] = [];
  const segs = closed ? n : n - 1;
  for (let i = 0; i < segs; i++) {
    const p0 = at(i - 1), p1 = at(i), p2 = at(i + 1), p3 = at(i + 2);
    const L = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]);
    const k = Math.max(1, Math.ceil(L / step));
    for (let j = 0; j < k; j++) {
      const t = j / k, t2 = t * t, t3 = t2 * t;
      const f = (a: number, b: number, c: number, d: number) =>
        0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
      out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
    }
  }
  if (!closed) out.push(pts[n - 1]);
  return out;
};

const fmt = (p: P) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`;
export const polyPath = (pts: P[], closed = false) => 'M' + pts.map(fmt).join('L') + (closed ? 'Z' : '');

// variable-width ribbon around a polyline: tapered ends, slow pressure waver along the stroke
export const ribbon = (line: P[], w: number, r: Rnd, o: {tin?: number; tout?: number; waver?: number} = {}): string => {
  const n = line.length;
  if (n < 2) return '';
  const len: number[] = [0];
  for (let i = 1; i < n; i++) len.push(len[i - 1] + Math.hypot(line[i][0] - line[i - 1][0], line[i][1] - line[i - 1][1]));
  const tot = len[n - 1] || 1;
  const tin = Math.min(o.tin ?? 12, tot * 0.4), tout = Math.min(o.tout ?? 18, tot * 0.45);
  const ph = r(0, 6.28), fq = r(0.012, 0.035), wav = o.waver ?? 0.16;
  const L: P[] = [], Rr: P[] = [];
  for (let i = 0; i < n; i++) {
    const a = line[Math.max(0, i - 1)], b = line[Math.min(n - 1, i + 1)];
    let tx = b[0] - a[0], ty = b[1] - a[1];
    const d = Math.hypot(tx, ty) || 1;
    tx /= d; ty /= d;
    const s = len[i];
    const k = Math.min(1, 0.55 + (0.45 * s) / tin) * Math.min(1, 0.4 + (0.6 * (tot - s)) / tout) * (1 + wav * Math.sin(ph + s * fq));
    const h = (w * k) / 2;
    L.push([line[i][0] - ty * h, line[i][1] + tx * h]);
    Rr.push([line[i][0] + ty * h, line[i][1] - tx * h]);
  }
  return 'M' + L.map(fmt).join('L') + 'L' + Rr.reverse().map(fmt).join('L') + 'Z';
};

// fill a polygon the way crayon does: rows of back-and-forth strokes at an angle.
// Row ends overshoot/undershoot the outline, gaps between rows leave flecks.
export const hatch = (poly: P[], angDeg: number, spacing: number, r: Rnd, over = 4, under = 3): string => {
  const a = (angDeg * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a);
  const rot = poly.map(([x, y]) => [x * c + y * s, -x * s + y * c] as P);
  const back = ([x, y]: P): P => [x * c - y * s, x * s + y * c];
  let ymin = Infinity, ymax = -Infinity;
  rot.forEach(([, y]) => { ymin = Math.min(ymin, y); ymax = Math.max(ymax, y); });
  let d = '';
  let flip = false;
  for (let y = ymin + r(0.2, 0.8) * spacing; y < ymax; y += spacing * r(0.7, 1.3)) {
    const xs: number[] = [];
    for (let i = 0; i < rot.length; i++) {
      const p = rot[i], q = rot[(i + 1) % rot.length];
      if ((p[1] <= y && q[1] > y) || (q[1] <= y && p[1] > y)) xs.push(p[0] + ((y - p[1]) / (q[1] - p[1])) * (q[0] - p[0]));
    }
    xs.sort((m, k) => m - k);
    for (let k = 0; k + 1 < xs.length; k += 2) {
      const x0 = xs[k] - r(-under, over), x1 = xs[k + 1] + r(-under, over);
      if (x1 - x0 < 5) continue;
      const A = back([x0, y + r(-2, 2)]), B = back([x1, y + r(-2, 2)]);
      const M = back([(x0 + x1) / 2 + r(-10, 10), y + r(-3.5, 3.5)]);
      d += flip ? `M${fmt(B)}Q${fmt(M)} ${fmt(A)}` : `M${fmt(A)}Q${fmt(M)} ${fmt(B)}`;
      flip = !flip;
    }
  }
  return d;
};

// ---------- the crayon filters ----------
// alpha_out = threshold( pressure * (1 + GRAIN*(tooth-0.5)) ), then flood with ink colour.
// Grain is multiplied by pressure, so bare paper never takes ink; soft stroke edges
// (pressure ~0.5) break into grain, light strokes dissolve into dots.
type Brush = {blur: number; halo: number; grain: number; gain: number; slope: number; fine: number; coarseAmt: number; mottle?: boolean};
export const CrayonDefs: React.FC<{seed: number}> = ({seed}) => {
  const mk = (id: string, color: string, o: Brush) => (
    <filter id={id} filterUnits="userSpaceOnUse" x={0} y={0} width={1000} height={1000} colorInterpolationFilters="sRGB">
      <feGaussianBlur in="SourceAlpha" stdDeviation={o.blur} result="core" />
      <feGaussianBlur in="SourceAlpha" stdDeviation={o.blur * 2.6} result="wide" />
      {/* pressure = core + a faint wide halo (crumbs next to the stroke) */}
      <feComposite in="core" in2="wide" operator="arithmetic" k1={0} k2={1} k3={o.halo} k4={0} result="soft" />
      {/* paper tooth, new every frame (per-frame grain) */}
      <feTurbulence type="fractalNoise" baseFrequency={o.fine} numOctaves={2} seed={seed * 3 + 1} result="fine" />
      {/* dry patches: coarse noise so some stretches break up and others stay solid */}
      <feTurbulence type="fractalNoise" baseFrequency={0.055} numOctaves={2} seed={seed * 3 + 2} result="coarse" />
      <feComposite in="fine" in2="coarse" operator="arithmetic" k1={0} k2={1} k3={o.coarseAmt} k4={-o.coarseAmt / 2} result="tooth" />
      <feComposite in="soft" in2="tooth" operator="arithmetic" k1={o.grain * o.gain} k2={(1 - o.grain / 2) * o.gain} k3={0} k4={0} result="mix" />
      <feComponentTransfer in="mix" result="cut">
        <feFuncA type="linear" slope={o.slope} intercept={0.5 - o.slope * 0.5} />
      </feComponentTransfer>
      {o.mottle ? (
        // the reference black is a pixel-scale mottle of two near-blacks (#030303 / #0c0c0c): tint the ink with the tooth noise
        <feColorMatrix in="tooth" type="matrix" values="0 0 0 0.12 -0.034  0 0 0 0.12 -0.034  0 0 0 0.12 -0.034  0 0 0 0 1" result="col" />
      ) : (
        <feFlood floodColor={color} result="col" />
      )}
      <feComposite in="col" in2="cut" operator="in" />
    </filter>
  );
  return (
    <defs>
      {mk(`ink-${seed}`, INK, {blur: 0.85, halo: 0.6, grain: 2.9, gain: 1.38, slope: 1.8, fine: 0.5, coarseAmt: 0.6, mottle: true})}
      {/* solid areas: pressure saturates, so only the edge is grainy */}
      {mk(`fill-${seed}`, INK, {blur: 1.0, halo: 0.55, grain: 2.3, gain: 2.5, slope: 1.8, fine: 0.5, coarseAmt: 0.5, mottle: true})}
      {/* flecks: where the crayon skipped; low pressure so they break into irregular sparkle */}
      {mk(`fleck-${seed}`, PAPER, {blur: 1.1, halo: 0.3, grain: 3.4, gain: 1.0, slope: 1.5, fine: 0.5, coarseAmt: 0.7})}
      {mk(`paper-${seed}`, PAPER, {blur: 0.8, halo: 0, grain: 1.0, gain: 1.15, slope: 4, fine: 0.5, coarseAmt: 0.2})}
      {mk(`grey-${seed}`, '#c2c2c2', {blur: 2.4, halo: 0.3, grain: 3.0, gain: 1.15, slope: 1.6, fine: 0.5, coarseAmt: 0.6})}
    </defs>
  );
};
