import React from 'react';
import {CrayonDefs, P, ribbon, Rnd, rng, sample} from '../brush';
import {clipToRect} from '../flow/shape';

/*
 * The "doodle" pen: the drawing style the user approved (the rougher pass of the style-sheet study).
 *  - contours: short dashes in 2-3 layers, uneven weight, some faint, corners overshoot
 *  - black clothing: the pen zigzags back and forth without lifting, angle drifting, a few strokes across
 *  - hair: the pen wanders inside the hair region: zigzags, small knots, stray hooks
 * Every frame re-rolls all of it (line boil).
 *
 * Added for films: a camera. setView(xf, zoom) maps world points to the 1000 x 1000 frame. Stroke weight,
 * dash length and fill spacing stay in frame pixels, so the pen is the same pen at any zoom.
 */

export const S = 2.1;
const LINE_W = 4.4; // measured median stroke width on the style sheet
const FILL_W = 3.3;
const MAIN_ANG = 116; // main direction of the sweater scribble (deg, y down)

type SkOpt = {closed?: boolean; curve?: boolean; w?: number; layers?: number; jit?: number; over?: number; wob?: number};

export const hyp = (a: P, b: P) => Math.hypot(b[0] - a[0], b[1] - a[1]);

export const makePen = (seed: number) => {
  const els: {f: 'ink' | 'paper'; n: React.ReactNode[]}[] = [];
  let key = 0;
  const add = (f: 'ink' | 'paper', n: React.ReactNode[]) => {
    if (!n.length) return;
    const last = els[els.length - 1];
    if (last && last.f === f) last.n.push(...n);
    else els.push({f, n: [...n]});
  };
  const R = () => rng(seed, 100 + ++key);
  // camera: world -> frame
  let V: (p: P) => P = (p) => p;
  let vz = 1;
  let ps = S; // pen scale: stroke weight, dash length and fill spacing, in frame px per style-sheet px
  const setView = (f: (p: P) => P, zoom: number, penScale = S) => { V = f; vz = zoom; ps = penScale; };
  const off = (pts: P[]) => pts.every((p) => p[0] < -80) || pts.every((p) => p[0] > 1080) || pts.every((p) => p[1] < -80) || pts.every((p) => p[1] > 1080);

  const walker = (line: P[]) => {
    const len: number[] = [0];
    for (let i = 1; i < line.length; i++) len.push(len[i - 1] + hyp(line[i - 1], line[i]));
    const tot = len[len.length - 1];
    const at = (s: number): P => {
      const t = Math.max(0, Math.min(tot, s));
      let i = 1;
      while (i < len.length - 1 && len[i] < t) i++;
      const u = (t - len[i - 1]) / (len[i] - len[i - 1] || 1);
      return [line[i - 1][0] + (line[i][0] - line[i - 1][0]) * u, line[i - 1][1] + (line[i][1] - line[i - 1][1]) * u];
    };
    return {tot, at};
  };

  // a straight run, as a hand draws it: it wanders a little
  const wobble = (a: P, b: P, r: Rnd, amp: number): P[] => {
    const L = hyp(a, b) || 1, n = Math.max(2, Math.round(L / (15 * ps)));
    const nx = -(b[1] - a[1]) / L, ny = (b[0] - a[0]) / L;
    const ph = r(0, 6.28), fq = r(2.5, 6);
    const out: P[] = [];
    for (let i = 0; i <= n; i++) {
      const t = i / n, o = amp * ps * (Math.sin(ph + t * fq) * 0.7 + r(-0.45, 0.45));
      out.push([a[0] + (b[0] - a[0]) * t + nx * o, a[1] + (b[1] - a[1]) * t + ny * o]);
    }
    return out;
  };

  // short dashes laid along a line, in layers. Weight, length and pressure all vary a lot;
  // now and then the pen does not lift and a long piece is drawn in one go.
  const dashes = (line: P[], w: number, layers: number, r: Rnd): React.ReactNode[] => {
    const {tot, at} = walker(line);
    const out: React.ReactNode[] = [];
    const press = r(0.75, 1.15); // this contour's pressure
    for (let L = 0; L < layers; L++) {
      let s = L === 0 ? -r(0, 3) * ps : r(0, 20) * ps;
      const cover = L === 0 ? 0.88 : L === 1 ? 0.62 : 0.32;
      const side = L === 0 ? 0 : (r() < 0.5 ? -1 : 1) * r(0.15, 0.5) * w;
      while (s < tot) {
        const long = r() < 0.14;
        const dl = (long ? r(30, 70) : r(7, 24)) * ps;
        if (r() < cover) {
          const a = at(s), b = at(s + dl), m = at(s + dl / 2);
          const d = hyp(a, b) || 1, nx = -(b[1] - a[1]) / d, ny = (b[0] - a[0]) / d;
          const faint = r() < 0.16;
          const off = side + r(-0.8, 0.8) * ps, tw = r(-1.2, 1.2) * ps;
          const A: P = [a[0] + nx * (off + tw), a[1] + ny * (off + tw)], B: P = [b[0] + nx * (off - tw), b[1] + ny * (off - tw)], M: P = [m[0] + nx * (off + r(-1, 1) * ps), m[1] + ny * (off + r(-1, 1) * ps)];
          const pts = long ? sample([A, at(s + dl * 0.33), M, at(s + dl * 0.66), B].map(([x, y], i) => (i % 2 ? [x + nx * off, y + ny * off] : [x, y]) as P), false, 4) : [A, M, B];
          out.push(<path key={++key} d={ribbon(pts, w * press * (faint ? r(0.7, 1.2) : r(0.32, 1.15)), r, {tin: 4, tout: 5, waver: 0.35})} fill="#000" fillOpacity={faint ? r(0.18, 0.32) : r(0.5, 1)} />);
        }
        s += dl * r(0.95, 1.45);
      }
    }
    return out;
  };

  // a contour. Straight runs are drawn one by one and overshoot their corners.
  const sketch = (ptsW: P[], o: SkOpt = {}) => {
    const r = R();
    const ptsIn = ptsW.map(V);
    if (off(ptsIn)) return;
    const jit = (o.jit ?? 1.8) * ps, w = (o.w ?? LINE_W) * ps;
    const layers = o.layers ?? (r() < 0.4 ? 3 : 2);
    let pts = ptsIn.map(([x, y]) => [x + r(-jit, jit), y + r(-jit, jit)] as P);
    if (o.closed) pts = [...pts, pts[0]];
    const out: React.ReactNode[] = [];
    if (o.curve) out.push(...dashes(sample(pts, false, 3), w, layers, r));
    else
      for (let i = 0; i + 1 < pts.length; i++) {
        const a = pts[i], b = pts[i + 1], d = hyp(a, b) || 1, ux = (b[0] - a[0]) / d, uy = (b[1] - a[1]) / d;
        const e0 = r(-2, o.over ?? 6) * ps, e1 = r(-2, o.over ?? 6) * ps;
        const line = wobble([a[0] - ux * e0, a[1] - uy * e0], [b[0] + ux * e1, b[1] + uy * e1], r, o.wob ?? 1.0);
        out.push(...dashes(line, w, layers, r));
        if (r() < 0.22) {
          // gone over once more, lightly, in one stroke
          const ox = r(-2, 2) * ps, oy = r(-2, 2) * ps;
          out.push(<path key={++key} d={ribbon(sample(line.map(([x, y]) => [x + ox, y + oy] as P), false, 4), w * 0.6, r)} fill="#000" fillOpacity={r(0.2, 0.3)} />);
        }
      }
    add('ink', out);
  };

  // one continuous wobbly thick line (hands, hair, small marks)
  const scrawlNodes = (pts: P[], w: number, r: Rnd, o: {closed?: boolean; jit?: number; faint?: number} = {}): React.ReactNode[] => {
    const jit = (o.jit ?? 1.0) * ps;
    const line = sample(pts.map(([x, y]) => [x + r(-jit, jit), y + r(-jit, jit)] as P), !!o.closed, 3);
    if (o.closed) line.push(line[0]);
    const out: React.ReactNode[] = [];
    let i = 0;
    while (i < line.length - 1) {
      const j = Math.min(line.length - 1, i + Math.round(r(14, 44)));
      const faint = r() < (o.faint ?? 0.08);
      out.push(<path key={++key} d={ribbon(line.slice(i, j + 1), w * ps * r(0.78, 1.25), r, {tin: i === 0 ? 4 : 0.001, tout: j === line.length - 1 ? 5 : 0.001, waver: 0.3})} fill="#000" fillOpacity={faint ? r(0.22, 0.34) : r(0.6, 1)} />);
      i = j;
    }
    return out;
  };
  const scrawl = (ptsW: P[], w = 3.3, o: {closed?: boolean; jit?: number; faint?: number} = {}) => {
    const r = R();
    const pts = ptsW.map(V);
    if (off(pts)) return;
    add('ink', scrawlNodes(pts, w, r, o));
  };

  const paper = (ptsW: P[], curve = false) => {
    const pts = ptsW.map(V);
    if (off(pts)) return;
    const line = curve ? sample(pts, true, 6) : pts;
    add('paper', [<path key={++key} d={'M' + line.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join('L') + 'Z'} fill="#fff" />]);
  };

  // Hair: the pen wanders around inside the hair region without lifting: sharp zigzags, a few small
  // knots, doubling back. No two frames are alike and no curl repeats.
  // spine in world coordinates; half(t) = half width of the hair band in world px
  const tangle = (spineW: P[], half: (t: number) => number) => {
    const r = R();
    const spine = spineW.map(V);
    if (off(spine)) return;
    const {tot, at} = walker(sample(spine, false, 4));
    const out: React.ReactNode[] = [];
    const frame = (t: number) => {
      const c = at(t * tot), c2 = at(Math.min(tot, t * tot + 3 * ps));
      const d = hyp(c, c2) || 1;
      return {c, n: [-(c2[1] - c[1]) / d, (c2[0] - c[0]) / d] as P, u: [(c2[0] - c[0]) / d, (c2[1] - c[1]) / d] as P, hw: half(t) * vz};
    };
    for (let pass = 0; pass < 2; pass++) {
      const pts: P[] = [];
      let t = r(0, 0.05);
      const steps = Math.round((tot / ps) * (pass === 0 ? 1.15 : 0.6));
      for (let i = 0; i < steps && t <= 1; i++) {
        const {c, n, u, hw} = frame(t);
        if (r() < 0.16) {
          // a small knot: 1-2 turns of an irregular loop
          const rad = hw * r(0.25, 0.6), ph = r(0, 6.28), m = 4 + Math.floor(r(0, 5)), cx = c[0] + n[0] * r(-0.5, 0.5) * hw, cy = c[1] + n[1] * r(-0.5, 0.5) * hw;
          for (let j = 0; j < m; j++) {
            const a = ph + j * r(1.0, 1.9);
            pts.push([cx + Math.cos(a) * rad * r(0.6, 1.3), cy + Math.sin(a) * rad * r(0.5, 1.2)]);
          }
        } else {
          const side = r(-1, 1) * hw, along = r(-0.5, 0.5) * hw;
          pts.push([c[0] + n[0] * side + u[0] * along, c[1] + n[1] * side + u[1] * along]);
        }
        t += r(-0.015, 0.045) * (pass === 0 ? 1 : 1.6); // mostly forward, sometimes back
      }
      // straight-ish segments between the points: angular, not smoothed into curls
      const line: P[] = [];
      for (let i = 0; i + 1 < pts.length; i++) {
        const a = pts[i], b = pts[i + 1];
        line.push(a, [(a[0] + b[0]) / 2 + r(-1.5, 1.5) * ps, (a[1] + b[1]) / 2 + r(-1.5, 1.5) * ps]);
      }
      if (pts.length) line.push(pts[pts.length - 1]);
      let i = 0;
      while (i < line.length - 1) {
        const j = Math.min(line.length - 1, i + Math.round(r(6, 22)));
        const faint = r() < 0.08;
        out.push(<path key={++key} d={ribbon(sample(line.slice(i, j + 1), false, 3), (pass === 0 ? 2.7 : 2.2) * ps * r(0.7, 1.3), r, {tin: 3, tout: 4, waver: 0.35})} fill="#000" fillOpacity={faint ? r(0.25, 0.4) : r(0.7, 1)} />);
        i = j;
      }
    }
    // stray hooks sticking out of the mass
    const hooks = 1 + Math.floor(r(0, 3));
    for (let h = 0; h < hooks; h++) {
      const {c, n, hw} = frame(r(0, 1));
      const sd = r() < 0.5 ? 1 : -1, L = r(6, 13) * ps;
      const p0: P = [c[0] + n[0] * sd * hw * 0.8, c[1] + n[1] * sd * hw * 0.8];
      const p2: P = [p0[0] + n[0] * sd * L + r(-6, 6) * ps, p0[1] + n[1] * sd * L + r(-6, 6) * ps];
      out.push(...scrawlNodes([p0, [(p0[0] + p2[0]) / 2 + r(-4, 4) * ps, (p0[1] + p2[1]) / 2 + r(-4, 4) * ps], p2], 2.2, r, {jit: 0.6}));
    }
    add('ink', out);
  };

  // Sweater: the pen goes back and forth across the shape without lifting (a zigzag), at an angle that
  // drifts, running past the edges. Then a few passes the other way and some loose strokes on top.
  const fill = (polyW: P[]) => {
    const r = R();
    let poly = polyW.map(V);
    if (off(poly)) return;
    if (poly.some((p) => p[0] < -60 || p[0] > 1060 || p[1] < -60 || p[1] > 1060)) poly = clipToRect(poly, -40, -40, 1040, 1040);
    if (poly.length < 3) return;
    const out: React.ReactNode[] = [];
    const zig = (ang: number, band: [number, number], sp: [number, number], over: [number, number]) => {
      const a = (ang * Math.PI) / 180, ca = Math.cos(a), sa = Math.sin(a);
      const rot = poly.map(([x, y]) => [x * ca + y * sa, -x * sa + y * ca] as P);
      const back = ([x, y]: P): P => [x * ca - y * sa, x * sa + y * ca];
      const ys = rot.map((q) => q[1]);
      const lo = Math.min(...ys), hi = Math.max(...ys);
      let y = lo + band[0] * (hi - lo) + r(0, sp[0]) * ps;
      const yEnd = lo + band[1] * (hi - lo);
      let run: P[] = [];
      let leftSide = r() < 0.5;
      const flush = () => {
        if (run.length > 1) {
          // break the run into a few pieces of different pressure
          let i = 0;
          while (i < run.length - 1) {
            const j = Math.min(run.length - 1, i + Math.round(r(2, 7)));
            const faint = r() < 0.1;
            out.push(<path key={++key} d={ribbon(sample(run.slice(i, j + 1), false, 4), FILL_W * ps * r(0.7, 1.3), r, {tin: 5, tout: 6, waver: 0.3})} fill="#000" fillOpacity={faint ? r(0.25, 0.4) : r(0.65, 1)} />);
            i = j;
          }
        }
        run = [];
      };
      while (y < yEnd) {
        const xs: number[] = [];
        for (let i = 0; i < rot.length; i++) {
          const p = rot[i], q = rot[(i + 1) % rot.length];
          if ((p[1] <= y && q[1] > y) || (q[1] <= y && p[1] > y)) xs.push(p[0] + ((y - p[1]) / (q[1] - p[1])) * (q[0] - p[0]));
        }
        xs.sort((m, n) => m - n);
        if (xs.length >= 2) {
          const x0 = xs[0] - r(over[0], over[1]) * ps, x1 = xs[xs.length - 1] + r(over[0], over[1]) * ps;
          // sometimes the stroke turns back before reaching the far edge
          const short = r() < 0.18 ? r(0.35, 0.8) : 1;
          const xe = leftSide ? x0 + (x1 - x0) * short : x1 - (x1 - x0) * short;
          run.push(back([leftSide ? x0 : x1, y + r(-1.2, 1.2) * ps]));
          run.push(back([xe, y + r(-1.2, 1.2) * ps + r(0.2, 0.6) * sp[0] * ps]));
          leftSide = !leftSide;
          if (r() < 0.12) flush(); // the pen lifts
        } else flush();
        y += r(sp[0], sp[1]) * ps;
      }
      flush();
    };
    const main = MAIN_ANG + r(-10, 10);
    zig(main + r(-14, 14), [0, 0.55], [3.9, 6.2], [-5, 2.2]);
    zig(main + r(-14, 14), [0.35, 1], [3.9, 6.2], [-5, 2.2]);
    zig(main + r(-30, 30), [r(0, 0.4), r(0.6, 1)], [6, 10], [-7, 1]);
    zig(main - r(45, 90), [r(0, 0.5), r(0.5, 1)], [14, 26], [-6, 4]); // across
    // loose single strokes, any direction, some running out past the edge
    const xs = poly.map((q) => q[0]), ys = poly.map((q) => q[1]);
    const n = 2 + Math.floor(r(0, 4));
    const inside = (p: P) => {
      let c = false;
      for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
        const A = poly[i], B = poly[j];
        if (A[1] > p[1] !== B[1] > p[1] && p[0] < ((B[0] - A[0]) * (p[1] - A[1])) / (B[1] - A[1]) + A[0]) c = !c;
      }
      return c;
    };
    for (let i = 0; i < n * 4 && i < 40; i++) {
      const c: P = [r(Math.min(...xs), Math.max(...xs)), r(Math.min(...ys), Math.max(...ys))];
      const a = r(0, 6.283), L = r(16, 44) * ps;
      const e0: P = [c[0] - (Math.cos(a) * L) / 2, c[1] - (Math.sin(a) * L) / 2], e1: P = [c[0] + (Math.cos(a) * L) / 2, c[1] + (Math.sin(a) * L) / 2];
      if (!inside(e0) || !inside(e1)) continue;
      out.push(<path key={++key} d={ribbon([[c[0] - Math.cos(a) * L / 2, c[1] - Math.sin(a) * L / 2], [c[0] + r(-3, 3) * ps, c[1] + r(-3, 3) * ps], [c[0] + Math.cos(a) * L / 2, c[1] + Math.sin(a) * L / 2]], FILL_W * ps * r(0.6, 1.1), r, {tin: 5, tout: 6})} fill="#000" fillOpacity={r(0.5, 0.95)} />);
    }
    add('ink', out);
  };

  // radii in world px
  const dot = (cW: P, rx: number, ry: number) => {
    const r = R();
    const c = V(cW);
    if (off([c])) return;
    add('ink', [<ellipse key={++key} cx={c[0] + r(-1, 1)} cy={c[1] + r(-1, 1)} rx={rx * vz * r(0.85, 1.15)} ry={ry * vz * r(0.85, 1.15)} fill="#000" />]);
  };

  const render = () => (
    <svg width={1000} height={1000} viewBox="0 0 1000 1000">
      <rect width={1000} height={1000} fill="#fefefe" />
      <CrayonDefs seed={seed} />
      {els.map((l, i) => (
        <g key={i} filter={`url(#${l.f === 'ink' ? 'fill' : 'paper'}-${seed})`}>
          {l.n}
        </g>
      ))}
    </svg>
  );
  return {sketch, scrawl, paper, tangle, fill, dot, render, R, setView};
};
export type Pen = ReturnType<typeof makePen>;

