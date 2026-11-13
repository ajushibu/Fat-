import React from 'react';
import {CrayonDefs, hatch, lerp, P, polyPath, ribbon, Rnd, rng, sample, xf} from '../brush';
import {clipToRect, offFrame} from './shape';

/*
 * Flow kit: the crayon drawing kit, extended for continuous transitions (see ../../../transitions/FRAMEWORK.md).
 *
 * On top of the knife kit it adds:
 *  - setFrame(xf)     swap the world -> frame transform mid-drawing (camera, nested scenes)
 *  - setPol(inverse)  polarity per layer: black crayon on white, or white crayon on black, in the same frame
 *  - clip(poly, out)  draw the following layers only inside (or outside) a moving contour: wipes
 *  - stroke draw: t   a line that draws itself (0..1 of its length)
 *  - stroke paperInk  a stroke in the paper colour (lines on top of a solid mass)
 *  - culling          strokes and fills that are off-frame are skipped; fills are clipped to the frame,
 *                     so a shape can grow far beyond the frame and become the new "paper"
 */

export const OUTLINE_W = 5.0; // face / hand outline (measured median 4.4 after the crayon)
export const HEAVY_W = 6.6; // floor line, fill outline (measured 6.4)
export const HAIR_W = 7.6;
export const P_LINE = 0.76;
export const P_HEAVY = 0.95;
const PART_ROT = 2.2;
const PART_SCALE = 0.035;
const PART_SHIFT = 2.0;
const JIT = 4.3;

export type Xf = (p: P) => P;
export type SOpt = {p?: number; j?: number; over?: number; closed?: boolean; tin?: number; tout?: number; waver?: number; restate?: number; draw?: number; paperInk?: boolean};
type LayerName = 'ink' | 'fill' | 'fleck' | 'paper' | 'grey';

// near-linear spacing with hand-drawn irregularity (+/-50% per frame): no easing, no overshoot
export const act = (f: number, start: number, len: number, key: number) => {
  if (f <= start) return 0;
  if (f >= start + len) return 1;
  const steps = Array.from({length: len}, (_, k) => 1 + rng(key, k)(-0.5, 0.5));
  const tot = steps.reduce((a, b) => a + b, 0);
  let acc = 0;
  for (let k = 0; k < f - start; k++) acc += steps[k];
  return acc / tot;
};

export const inside = (pt: P, poly: P[]) => {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i], q = poly[j];
    if (a[1] > pt[1] !== q[1] > pt[1] && pt[0] < ((q[0] - a[0]) * (pt[1] - a[1])) / (q[1] - a[1]) + a[0]) c = !c;
  }
  return c;
};

// polygon around a polyline (sleeves, legs): width can taper from w0 to w1
export const limb = (pts: P[], w0: number, w1 = w0): P[] => {
  const line = sample(pts, false, 10);
  const n = line.length;
  const L: P[] = [], R: P[] = [];
  for (let i = 0; i < n; i++) {
    const a = line[Math.max(0, i - 1)], b = line[Math.min(n - 1, i + 1)];
    const dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1;
    const h = lerp(w0, w1, i / (n - 1)) / 2;
    L.push([line[i][0] - (dy / d) * h, line[i][1] + (dx / d) * h]);
    R.push([line[i][0] + (dy / d) * h, line[i][1] - (dx / d) * h]);
  }
  // keep every 2nd point: the fill outline gets drawn as straight-ish crayon edges
  const keep = (a: P[]) => a.filter((_, i) => i % 2 === 0 || i === a.length - 1);
  return [...keep(L), ...keep(R).reverse()];
};

export const makeKit = (seed: number, opt: {light?: boolean; frame?: Xf; jit?: number; bg?: 'paper' | 'ink'} = {}) => {
  const light = !!opt.light;
  const PSCALE = light ? 0.6 : 1;
  let sid = 0;
  let key = 0;
  const layers: {f: LayerName; inv: boolean; clip: number; els: React.ReactNode[]}[] = [];
  const clips: {id: number; d: string; outside: boolean}[] = [];
  let inv = false; // current polarity: false = black on white, true = white on black
  let clipId = -1; // current clip region (-1 = none)
  const add = (f: LayerName, ...els: React.ReactNode[]) => {
    if (!els.length) return;
    const last = layers[layers.length - 1];
    if (last && last.f === f && last.inv === inv && last.clip === clipId) last.els.push(...els);
    else layers.push({f, inv, clip: clipId, els: [...els]});
  };
  const setPol = (inverse: boolean) => { inv = inverse; };
  // following layers are drawn only inside the polygon (frame space), or only outside it
  const clip = (poly: P[] | null, outside = false) => {
    if (!poly) { clipId = -1; return; }
    clipId = clips.length;
    clips.push({id: clipId, d: polyPath(poly, true), outside});
  };

  // framing + per-frame re-registration of the whole drawing
  const gr = rng(seed, 1);
  let base: Xf = opt.frame ?? ((p: P) => p);
  const regX = gr(-0.4, 0.4), regY = gr(-0.4, 0.4), regR = gr(-0.08, 0.08);
  const G: Xf = (p) => xf(base(p), regX, regY, regR, 500, 500);
  const setFrame = (f: Xf) => { base = f; };
  // each part is re-drawn every frame: slightly different angle, size and place
  const part = (id: number, c: P, pose: Xf = (p) => p, amt = 1, rotAmt = amt): Xf => {
    const r = rng(seed, 500 + id);
    const rot = r(-PART_ROT, PART_ROT) * rotAmt, sc = 1 + r(-PART_SCALE, PART_SCALE) * amt;
    const dx = r(-PART_SHIFT, PART_SHIFT) * amt, dy = r(-PART_SHIFT, PART_SHIFT) * amt;
    return (p) => G(pose(xf(p, dx, dy, rot, c[0], c[1], sc)));
  };

  // one crayon stroke through the points (already in frame space after T)
  const strokeNodes = (T: Xf, pts: P[], w: number, o: SOpt = {}): React.ReactNode[] => {
    const id = ++sid;
    const r = rng(seed, 2000 + id);
    const j = o.j ?? opt.jit ?? JIT;
    const q = pts.map(T).map(([x, y]) => [x + r(-j, j), y + r(-j, j)] as P);
    if (!o.closed && q.length > 1) {
      const ext = (a: P, b: P): P => {
        const dx = a[0] - b[0], dy = a[1] - b[1], L = Math.hypot(dx, dy) || 1, k = r(-0.4, 1) * (o.over ?? 7);
        return [a[0] + (dx / L) * k, a[1] + (dy / L) * k];
      };
      q[0] = ext(q[0], q[1]);
      q[q.length - 1] = ext(q[q.length - 1], q[q.length - 2]);
    }
    const ph1 = r(0, 6.28), ph2 = r(0, 6.28);
    if (offFrame(q)) return []; // culled: nothing of this stroke is in frame
    let line = sample(q, !!o.closed, 4).map(([x, y], i) => {
      const t = 0.75 * Math.sin(i * 0.5 + ph1) + 0.55 * Math.sin(i * 1.25 + ph2); // hand tremor, ~1 px
      return [x + t * 0.7, y + t] as P;
    });
    if (o.draw !== undefined) {
      // the line draws itself: only the first part exists yet
      const n = Math.round(line.length * Math.max(0, Math.min(1, o.draw)));
      if (n < 2) return [];
      line = line.slice(0, n);
    }
    const ww = w * r(0.86, 1.2);
    const p = Math.min(1, (o.p ?? P_LINE) * PSCALE * r(0.82, 1.2));
    const out: React.ReactNode[] = [];
    if (!o.closed && line.length > 18 && r() < 0.45) {
      const k = Math.floor(r(0.25, 0.75) * line.length), dry = p * r(0.5, 0.78), first = r() < 0.5;
      out.push(<path key={`s${id}`} d={ribbon(line.slice(0, k + 1), ww, r, {...o, tout: 0.001})} fill="#000" fillOpacity={first ? dry : p} />);
      out.push(<path key={`t${id}`} d={ribbon(line.slice(k), ww, r, {...o, tin: 0.001})} fill="#000" fillOpacity={first ? p : dry} />);
    } else {
      out.push(<path key={`s${id}`} d={ribbon(line, ww, r, o)} fill="#000" fillOpacity={p} />);
    }
    const nCr = Math.floor(((line.length * 4) / 80) * (light ? 0.4 : 1) + r());
    for (let c = 0; c < nCr; c++) {
      const i = Math.floor(r(0, line.length - 1)), a = line[i], b = line[Math.min(line.length - 1, i + 1)];
      const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, off = (r() < 0.5 ? -1 : 1) * (ww / 2 + r(1.6, 4.5));
      out.push(<circle key={`c${id}-${c}`} cx={a[0] - (dy / L) * off} cy={a[1] + (dx / L) * off} r={r(1.2, 2.1)} fill="#000" fillOpacity={r(0.8, 1) * PSCALE} />);
    }
    if (o.restate && r() < o.restate && line.length > 12) {
      const a = Math.floor(r(0, 0.35) * line.length), b = Math.floor(r(0.6, 1) * line.length);
      const ox = r(-3.2, 3.2), oy = r(-3.2, 3.2);
      const seg = line.slice(a, b).map(([x, y]) => [x + ox, y + oy] as P);
      out.push(<path key={`r${id}`} d={ribbon(seg, ww * 0.75, r)} fill="#000" fillOpacity={p * 0.75} />);
    }
    return out;
  };
  const stroke = (T: Xf, pts: P[], w = OUTLINE_W, o: SOpt = {}) => add(o.paperInk ? 'paper' : 'ink', ...strokeNodes(T, pts, w, o));

  // dot (eye, pupil)
  const dot = (T: Xf, c: P, rad: number, p = 1) => {
    const r = rng(seed, 6000 + ++key);
    const q = T(c);
    if (offFrame([q])) return;
    add('ink', <ellipse key={`d${key}`} cx={q[0] + r(-1, 1)} cy={q[1] + r(-1, 1)} rx={rad * r(0.85, 1.15)} ry={rad * r(0.85, 1.15)} fill="#000" fillOpacity={p * PSCALE} />);
  };

  // white shape that hides what is behind it
  const paper = (T: Xf, pts: P[], closedSmooth = true) => {
    if (offFrame(pts.map(T))) return;
    add('paper', <path key={`p${++key}`} d={polyPath(closedSmooth ? sample(pts.map(T), true, 8) : pts.map(T), true)} fill="#fff" />);
  };

  // straight-edged polygon with corners jittered per frame
  const corners = (T: Xf, pts: P[], j = 3): P[] => {
    const r = rng(seed, 3000 + ++key);
    return pts.map(T).map(([x, y]) => [x + r(-j, j), y + r(-j, j)] as P);
  };

  // black area built from crayon strokes: solid mass + stroke rows + rough outline + tails + flecks.
  // In light mode: only loose hatching and a light outline (an imagined, half-drawn version).
  const black = (polyIn: P[], ang: number, nClusters: number) => {
    if (offFrame(polyIn)) return;
    // a shape may be far bigger than the frame: fill only the part that is in frame
    const big = polyIn.some(([x, y]) => x < -200 || x > 1200 || y < -200 || y > 1200);
    const poly = big ? clipToRect(polyIn, -70, -70, 1070, 1070) : polyIn;
    if (poly.length < 3) return;
    const k = ++key;
    const r = rng(seed, 4000 + k);
    const a1 = ang + r(-10, 10);
    const dir: P = [Math.cos((a1 * Math.PI) / 180), Math.sin((a1 * Math.PI) / 180)];
    if (light) {
      // a quick cross-hatched tone, not stripes: two passes at ~55 deg apart, uneven spacing
      add('ink',
        <path key={`lh${k}`} d={hatch(poly, a1, 10, r, 5, 2)} stroke="#000" strokeWidth={5} strokeOpacity={0.5} strokeLinecap="round" fill="none" />,
        <path key={`lx${k}`} d={hatch(poly, a1 + 55 + r(-8, 8), 12, r, 4, 3)} stroke="#000" strokeWidth={4.4} strokeOpacity={0.42} strokeLinecap="round" fill="none" />,
      );
      for (let i = 0; i < poly.length; i++) {
        const a = poly[i], b = poly[(i + 1) % poly.length];
        add('ink', ...strokeNodes((p) => p, [a, lerpMid(a, b, r), b], HEAVY_W, {p: 0.85, j: 1.6, over: 12}));
      }
      return;
    }
    add('fill',
      <path key={`b${k}`} d={polyPath(poly, true)} fill="#000" fillOpacity={0.9} />,
      <path key={`h${k}`} d={hatch(poly, a1, 13, r, -1, 8)} stroke="#000" strokeWidth={13} strokeOpacity={0.9} strokeLinecap="round" fill="none" />,
    );
    for (let i = 0; i < poly.length; i++) {
      const a = poly[i], b = poly[(i + 1) % poly.length];
      const m1: P = [lerp(a[0], b[0], 0.33) + r(-6, 6), lerp(a[1], b[1], 0.33) + r(-6, 6)];
      const m2: P = [lerp(a[0], b[0], 0.67) + r(-6, 6), lerp(a[1], b[1], 0.67) + r(-6, 6)];
      add('ink', ...strokeNodes((p) => p, [a, m1, m2, b], HEAVY_W * 1.2, {p: P_HEAVY, j: 1.6, over: 14, waver: 0.4}));
      const nt = Math.floor(r(0, 3.6) * Math.min(1, Math.hypot(b[0] - a[0], b[1] - a[1]) / 60));
      for (let t = 0; t < nt; t++) {
        const u = r(0.08, 0.92), L = r(8, 22), sgn = r() < 0.5 ? 1 : -1;
        const c: P = [lerp(a[0], b[0], u), lerp(a[1], b[1], u)];
        add('ink', ...strokeNodes((p) => p, [[c[0] - dir[0] * L * sgn, c[1] - dir[1] * L * sgn], [c[0] + dir[0] * L * sgn, c[1] + dir[1] * L * sgn]], 7, {p: 0.9, j: 1.5, over: 3}));
      }
    }
    const fl: React.ReactNode[] = [];
    const xs = poly.map((q) => q[0]), ys = poly.map((q) => q[1]);
    const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
    for (let c = 0; c < nClusters; c++) {
      const cc: P = [r(x0, x1), r(y0, y1)];
      if (!inside(cc, poly)) continue;
      const n = 1 + Math.floor(r(0, 3.5));
      for (let t = 0; t < n; t++) {
        const o: P = [cc[0] + r(-9, 9), cc[1] + r(-9, 9)];
        const L = r(1.5, 11), tw = r(-0.7, 0.7);
        const e: P = [o[0] + (dir[0] - dir[1] * tw) * L, o[1] + (dir[1] + dir[0] * tw) * L];
        if (!inside(o, poly) || !inside(e, poly)) continue;
        fl.push(<path key={`f${k}-${c}-${t}`} d={ribbon([o, [(o[0] + e[0]) / 2, (o[1] + e[1]) / 2], e], r(1.9, 4.6), r, {tin: 2, tout: 2})} fill="#fff" fillOpacity={r(0.4, 0.9)} />);
      }
    }
    const nStreak = Math.round(nClusters / 2.2);
    for (let c = 0; c < nStreak; c++) {
      const o: P = [r(x0, x1), r(y0, y1)];
      const L = r(24, 100);
      const d2: P = r() < 0.38 ? [-dir[1], dir[0]] : dir;
      const e: P = [o[0] + d2[0] * L, o[1] + d2[1] * L];
      if (!inside(o, poly) || !inside(e, poly)) continue;
      fl.push(<path key={`st${k}-${c}`} d={ribbon(sample([o, [(o[0] + e[0]) / 2 + r(-4, 4), (o[1] + e[1]) / 2 + r(-4, 4)], e]), r(1.6, 2.9), r)} fill="#fff" fillOpacity={r(0.22, 0.44)} />);
    }
    add('fleck', ...fl);
  };
  const lerpMid = (a: P, b: P, r: Rnd): P => [(a[0] + b[0]) / 2 + r(-4, 4), (a[1] + b[1]) / 2 + r(-4, 4)];

  // heavy scribble (hair): zigzag or loops along a spine, re-scribbled every frame
  const scribble = (T: Xf, spinePts: P[], n: number, half: number, w = HAIR_W, zigBias = 0.5) => {
    const r = rng(seed, 7000 + ++key);
    const spine = sample(spinePts.map(T), false, 6);
    const zig = r() < zigBias;
    const pts: P[] = [];
    let ang = r(0, 6.28);
    for (let i = 0; i < n; i++) {
      const t = Math.max(0, Math.min(0.999, i / (n - 1) + r(-0.02, 0.02)));
      const k = Math.min(spine.length - 2, Math.floor(t * (spine.length - 1)));
      const a = spine[k], b = spine[k + 1];
      const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1;
      if (zig) {
        const side = (i % 2 ? 1 : -1) * half * r(0.5, 1.15);
        pts.push([a[0] + (-dy / L) * side + r(-5, 5), a[1] + (dx / L) * side + r(-5, 5)]);
      } else {
        ang += r(1.0, 2.2);
        const rr = half * r(0.5, 1.05);
        pts.push([a[0] + Math.cos(ang) * rr, a[1] + Math.sin(ang) * rr * 0.85]);
      }
    }
    add('ink', <path key={`sc${key}`} d={ribbon(sample(pts), w * r(0.9, 1.2), r, {waver: 0.25})} fill="#000" fillOpacity={P_HEAVY * PSCALE} />);
  };

  const render = () => (
    <svg width={1000} height={1000} viewBox="0 0 1000 1000">
      <rect width={1000} height={1000} fill={opt.bg === 'ink' ? '#070707' : '#fdfdfd'} />
      <CrayonDefs seed={seed} />
      <defs>
        {clips.map((c) => (
          <clipPath key={c.id} id={`clip-${seed}-${c.id}`}>
            <path d={c.outside ? `M-100,-100H1100V1100H-100Z ${c.d}` : c.d} clipRule="evenodd" />
          </clipPath>
        ))}
      </defs>
      {layers.map((l, i) => {
        const g = (
          <g key={i} filter={`url(#${l.f}${l.inv ? 'w' : ''}-${seed})`}>
            {l.els}
          </g>
        );
        return l.clip >= 0 ? <g key={`c${i}`} clipPath={`url(#clip-${seed}-${l.clip})`}>{g}</g> : g;
      })}
    </svg>
  );

  return {G, part, stroke, strokeNodes, dot, paper, corners, black, scribble, render, light, setFrame, setPol, clip};
};
export type Kit = ReturnType<typeof makeKit>;
