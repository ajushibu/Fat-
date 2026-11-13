import {P} from '../brush';

/*
 * Shape tools for transitions. Shapes are plain point lists with no identity, so one outline can
 * turn into another, grow past the frame, or act as a wipe edge.
 */

const FRAME_PAD = 90;
// true when every point is beyond the same edge of the frame (nothing can be visible)
export const offFrame = (pts: P[]) =>
  pts.every((p) => p[0] < -FRAME_PAD) || pts.every((p) => p[0] > 1000 + FRAME_PAD) || pts.every((p) => p[1] < -FRAME_PAD) || pts.every((p) => p[1] > 1000 + FRAME_PAD);

export const bbox = (pts: P[]) => {
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  return {x0: Math.min(...xs), y0: Math.min(...ys), x1: Math.max(...xs), y1: Math.max(...ys)};
};
export const centroid = (pts: P[]): P => [pts.reduce((a, p) => a + p[0], 0) / pts.length, pts.reduce((a, p) => a + p[1], 0) / pts.length];

export const circle = (c: P, r: number, n = 32, squash = 1): P[] =>
  Array.from({length: n}, (_, i) => [c[0] + Math.cos((i / n) * 6.2832) * r, c[1] + Math.sin((i / n) * 6.2832) * r * squash] as P);

// Sutherland-Hodgman: the part of a polygon inside a rectangle
export const clipToRect = (poly: P[], x0: number, y0: number, x1: number, y1: number): P[] => {
  type Edge = {inside: (p: P) => boolean; cut: (a: P, b: P) => P};
  const edges: Edge[] = [
    {inside: (p) => p[0] >= x0, cut: (a, b) => [x0, a[1] + ((b[1] - a[1]) * (x0 - a[0])) / (b[0] - a[0])]},
    {inside: (p) => p[0] <= x1, cut: (a, b) => [x1, a[1] + ((b[1] - a[1]) * (x1 - a[0])) / (b[0] - a[0])]},
    {inside: (p) => p[1] >= y0, cut: (a, b) => [a[0] + ((b[0] - a[0]) * (y0 - a[1])) / (b[1] - a[1]), y0]},
    {inside: (p) => p[1] <= y1, cut: (a, b) => [a[0] + ((b[0] - a[0]) * (y1 - a[1])) / (b[1] - a[1]), y1]},
  ];
  let out = poly;
  for (const e of edges) {
    const inp = out;
    out = [];
    for (let i = 0; i < inp.length; i++) {
      const a = inp[i], b = inp[(i + 1) % inp.length];
      const ia = e.inside(a), ib = e.inside(b);
      if (ia && ib) out.push(b);
      else if (ia && !ib) out.push(e.cut(a, b));
      else if (!ia && ib) { out.push(e.cut(a, b)); out.push(b); }
    }
    if (!out.length) return [];
  }
  return out;
};

// n points evenly spaced along a closed outline
export const resample = (poly: P[], n: number): P[] => {
  const m = poly.length;
  const len: number[] = [0];
  for (let i = 0; i < m; i++) {
    const a = poly[i], b = poly[(i + 1) % m];
    len.push(len[i] + Math.hypot(b[0] - a[0], b[1] - a[1]));
  }
  const tot = len[m];
  const out: P[] = [];
  let k = 0;
  for (let i = 0; i < n; i++) {
    const d = (i / n) * tot;
    while (len[k + 1] < d) k++;
    const a = poly[k], b = poly[(k + 1) % m];
    const u = (d - len[k]) / (len[k + 1] - len[k] || 1);
    out.push([a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u]);
  }
  return out;
};
const area = (p: P[]) => p.reduce((s, a, i) => s + a[0] * p[(i + 1) % p.length][1] - p[(i + 1) % p.length][0] * a[1], 0) / 2;

// Morph one closed outline into another ("one shape, many identities").
// Both are resampled to n points; winding and start point are matched so the shape slides rather than twists.
export const morphPoly = (A: P[], B: P[], t: number, n = 64): P[] => {
  const a = resample(A, n);
  let b = resample(B, n);
  if (Math.sign(area(a)) !== Math.sign(area(b))) b = b.slice().reverse();
  const ca = centroid(a), cb = centroid(b);
  let best = 0, bestD = Infinity;
  for (let s = 0; s < n; s++) {
    let d = 0;
    for (let i = 0; i < n; i += 4) {
      const p = a[i], q = b[(i + s) % n];
      d += (p[0] - ca[0] - q[0] + cb[0]) ** 2 + (p[1] - ca[1] - q[1] + cb[1]) ** 2;
    }
    if (d < bestD) { bestD = d; best = s; }
  }
  return a.map((p, i) => {
    const q = b[(i + best) % n];
    return [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t] as P;
  });
};
