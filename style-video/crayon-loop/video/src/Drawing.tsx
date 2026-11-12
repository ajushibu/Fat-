import React from 'react';
import {CrayonDefs, hatch, lerp, P, polyPath, ribbon, Rnd, rng, sample, xf} from './brush';

/*
 * "Tea break": an original character drawn the way the reference is drawn
 * (see ../STYLE.md): dry crayon, every frame a fresh drawing, straight-edged
 * construction with overshooting corners, black stroke-filled clothing, giant hands.
 * The whole picture is a pure function of the frame number.
 */

// ---- measured style constants ----
const BOIL_EVERY = 1; // animated on 1s: a new drawing every frame
const OUTLINE_W = 5.0; // face / hand outline width (px, measured median 4.4)
const HEAVY_W = 6.6; // table line, coat outline (measured 6.4)
const HAIR_W = 7.6; // hair scribble (measured up to 12.8)
const P_LINE = 0.76; // normal drawing pressure: grainy, slightly dry line
const P_HEAVY = 0.95; // hair, fill outline
const P_LIGHT = 0.34; // faint secondary marks
const PART_ROT = 2.2; // redraw variation per part and frame: rotation (deg) ...
const PART_SCALE = 0.035; // ... size ...
const PART_SHIFT = 2.0; // ... and position (px) -> ~2 px median outline boil
const JIT = 4.3; // per-point jitter (px)
const HAND_S = 1.17; // hand + cup scale: the creator draws hands huge

type Xf = (p: P) => P;
type SOpt = {p?: number; j?: number; over?: number; closed?: boolean; tin?: number; tout?: number; waver?: number; restate?: number};

// near-linear spacing with hand-drawn irregularity (+/-50% per frame): no easing,
// no anticipation, no overshoot, as measured on the reference action
const act = (f: number, start: number, len: number, key: number) => {
  if (f <= start) return 0;
  if (f >= start + len) return 1;
  const steps = Array.from({length: len}, (_, k) => 1 + rng(key, k)(-0.5, 0.5));
  const tot = steps.reduce((a, b) => a + b, 0);
  let acc = 0;
  for (let k = 0; k < f - start; k++) acc += steps[k];
  return acc / tot;
};

export const Drawing: React.FC<{frame: number}> = ({frame}) => {
  const seed = Math.floor(frame / BOIL_EVERY);
  let sid = 0;

  // ---------- timeline @ 14.29 fps: 5 frames to a peak, 7 to settle (measured) ----------
  const lean = act(frame, 18, 5, 1) - act(frame, 29, 7, 2); // leans in and blows on the tea
  const raise = act(frame, 37, 5, 3) - act(frame, 50, 7, 4); // lifts the cup, sips, lowers it
  const sipDeep = act(frame, 42, 8, 7) * (raise > 0.95 ? 1 : 0); // tips further while drinking
  const bliss = act(frame, 57, 5, 5); // payoff: eyes shut, smile, shoulders drop
  const puff = act(frame, 58, 10, 6); // contented exhale drifts up
  const blowing = frame >= 21 && frame < 31;
  const drop = bliss * 9;

  // ---------- transforms ----------
  const gr = rng(seed, 1);
  const G: Xf = (p) => xf(p, 20 + gr(-0.4, 0.4), 22 + gr(-0.4, 0.4), gr(-0.08, 0.08), 500, 500, 0.955); // framing + re-registration
  // every part is re-drawn each frame: slightly different angle, size and place
  const part = (id: number, c: P, pose: Xf, amt = 1, rotAmt = amt): Xf => {
    const r = rng(seed, 500 + id);
    const rot = r(-PART_ROT, PART_ROT) * rotAmt, sc = 1 + r(-PART_SCALE, PART_SCALE) * amt;
    const dx = r(-PART_SHIFT, PART_SHIFT) * amt, dy = r(-PART_SHIFT, PART_SHIFT) * amt;
    return (p) => G(pose(xf(p, dx, dy, rot, c[0], c[1], sc)));
  };

  const NECK: P = [505, 420];
  const headRot = lean * 7 - raise * 7 - sipDeep * 4 - bliss * 3;
  const headPose: Xf = (p) => xf(p, lean * 12 - raise * 4, drop + lean * 4, headRot, NECK[0], NECK[1]);
  const HEAD = part(1, [600, 310], headPose, 1, 0.5);
  const HAIR = part(2, [440, 300], headPose, 0.8, 0.5);

  const cupC: P = [770 - raise * 50 - lean * 8, 505 - raise * 84 + drop * 0.5 + lean * 3];
  const cupRot = -raise * 22 - sipDeep * 7;
  const cupPose: Xf = (p) => xf(p, cupC[0], cupC[1], cupRot, 0, 0);
  const CUP = part(3, [0, 0], (p) => cupPose(xf(p, 0, 0, 0, 0, 0, 1.25 * HAND_S)), 0.8);
  const GRIP = part(4, [-30, 20], (p) => cupPose(xf(p, 0, 0, 0, 0, 0, HAND_S)));
    const BODY = part(6, [400, 620], (p) => p, 0.15);

  // ---------- stroke + fill builders ----------
  const S = (T: Xf, pts: P[], w: number, o: SOpt = {}): React.ReactNode[] => {
    const id = ++sid;
    const r = rng(seed, 2000 + id);
    const j = o.j ?? JIT;
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
    const line = sample(q, !!o.closed, 4).map(([x, y], i) => {
      const t = 0.75 * Math.sin(i * 0.5 + ph1) + 0.55 * Math.sin(i * 1.25 + ph2); // hand tremor, ~1 px
      return [x + t * 0.7, y + t] as P;
    });
    const ww = w * r(0.86, 1.2);
    const p = Math.min(1, (o.p ?? P_LINE) * r(0.82, 1.2));
    const out: React.ReactNode[] = [];
    if (!o.closed && line.length > 18 && r() < 0.45) {
      const k = Math.floor(r(0.25, 0.75) * line.length), dry = p * r(0.5, 0.78), first = r() < 0.5;
      out.push(<path key={`s${id}`} d={ribbon(line.slice(0, k + 1), ww, r, {...o, tout: 0.001})} fill="#000" fillOpacity={first ? dry : p} />);
      out.push(<path key={`t${id}`} d={ribbon(line.slice(k), ww, r, {...o, tin: 0.001})} fill="#000" fillOpacity={first ? p : dry} />);
    } else {
      out.push(<path key={`s${id}`} d={ribbon(line, ww, r, o)} fill="#000" fillOpacity={p} />);
    }
    const nCr = Math.floor((line.length * 4) / 80 + r());
    for (let c = 0; c < nCr; c++) {
      const i = Math.floor(r(0, line.length - 1)), a = line[i], b = line[Math.min(line.length - 1, i + 1)];
      const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, off = (r() < 0.5 ? -1 : 1) * (ww / 2 + r(1.6, 4.5));
      out.push(<circle key={`c${id}-${c}`} cx={a[0] - (dy / L) * off} cy={a[1] + (dx / L) * off} r={r(1.2, 2.1)} fill="#000" fillOpacity={r(0.8, 1)} />);
    }
    if (o.restate && r() < o.restate && line.length > 12) {
      // the artist goes over part of the line again, a few px off
      const a = Math.floor(r(0, 0.35) * line.length), b = Math.floor(r(0.6, 1) * line.length);
      const ox = r(-3.2, 3.2), oy = r(-3.2, 3.2);
      const seg = line.slice(a, b).map(([x, y]) => [x + ox, y + oy] as P);
      out.push(<path key={`r${id}`} d={ribbon(seg, ww * 0.75, r)} fill="#000" fillOpacity={p * 0.75} />);
    }
    return out;
  };
  // straight-edged polygon: jittered corners, each edge bowed a little
  const corners = (T: Xf, pts: P[], key: number, j = 3): P[] => {
    const r = rng(seed, 3000 + key);
    return pts.map(T).map(([x, y]) => [x + r(-j, j), y + r(-j, j)] as P);
  };
  // black area the way crayon fills it: solid mass, rows of strokes on top, a heavy rough outline,
  // a few stroke tails poking out, and sparse clusters of flecks where the crayon skipped
  const inside = (pt: P, poly: P[]) => {
    let c = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const a = poly[i], q = poly[j];
      if (a[1] > pt[1] !== q[1] > pt[1] && pt[0] < ((q[0] - a[0]) * (pt[1] - a[1])) / (q[1] - a[1]) + a[0]) c = !c;
    }
    return c;
  };
  const blackFill = (poly: P[], key: number, ang: number, nClusters: number): {ink: React.ReactNode[]; fill: React.ReactNode[]; flecks: React.ReactNode[]} => {
    const r = rng(seed, 4000 + key);
    const a1 = ang + r(-10, 10);
    const dir: P = [Math.cos((a1 * Math.PI) / 180), Math.sin((a1 * Math.PI) / 180)];
    const ink: React.ReactNode[] = [
      <path key={`b${key}`} d={polyPath(poly, true)} fill="#000" fillOpacity={0.9} />,
      <path key={`h${key}`} d={hatch(poly, a1, 13, r, -1, 8)} stroke="#000" strokeWidth={13} strokeOpacity={0.9} strokeLinecap="round" fill="none" />,
    ];
    for (let i = 0; i < poly.length; i++) {
      const a = poly[i], b = poly[(i + 1) % poly.length];
      const m1: P = [lerp(a[0], b[0], 0.33) + r(-6, 6), lerp(a[1], b[1], 0.33) + r(-6, 6)];
      const m2: P = [lerp(a[0], b[0], 0.67) + r(-6, 6), lerp(a[1], b[1], 0.67) + r(-6, 6)];
      ink.push(...S((p) => p, [a, m1, m2, b], HEAVY_W * 1.2, {p: P_HEAVY, j: 1.6, over: 14, waver: 0.4}));
      // stroke tails: now and then a filling stroke runs past the outline
      const nt = Math.floor(r(0, 3.6));
      for (let k = 0; k < nt; k++) {
        const u = r(0.08, 0.92), L = r(8, 22), sgn = r() < 0.5 ? 1 : -1;
        const c: P = [lerp(a[0], b[0], u), lerp(a[1], b[1], u)];
        ink.push(...S((p) => p, [[c[0] - dir[0] * L * sgn, c[1] - dir[1] * L * sgn], [c[0] + dir[0] * L * sgn, c[1] + dir[1] * L * sgn]], 7, {p: 0.9, j: 1.5, over: 3}));
      }
    }
    // flecks: short skips along the stroke direction, in small clusters
    const flecks: React.ReactNode[] = [];
    const xs = poly.map((q) => q[0]), ys = poly.map((q) => q[1]);
    const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
    for (let c = 0; c < nClusters; c++) {
      const cc: P = [r(x0, x1), r(y0, y1)];
      if (!inside(cc, poly)) continue;
      const n = 1 + Math.floor(r(0, 3.5));
      for (let k = 0; k < n; k++) {
        const o: P = [cc[0] + r(-9, 9), cc[1] + r(-9, 9)];
        const L = r(1.5, 11), tw = r(-0.7, 0.7);
        const e: P = [o[0] + (dir[0] - dir[1] * tw) * L, o[1] + (dir[1] + dir[0] * tw) * L];
        if (!inside(o, poly) || !inside(e, poly)) continue;
        flecks.push(<path key={`f${key}-${c}-${k}`} d={ribbon([o, [(o[0] + e[0]) / 2, (o[1] + e[1]) / 2], e], r(1.9, 4.6), r, {tin: 2, tout: 2})} fill="#fff" fillOpacity={r(0.4, 0.9)} />);
      }
    }
    const nStreak = Math.round(nClusters / 2.2);
    for (let c = 0; c < nStreak; c++) {
      const o: P = [r(x0, x1), r(y0, y1)];
      const L = r(24, 100);
      const across = r() < 0.38; // some strokes went the other way: the fill reads as woven
      const d2: P = across ? [-dir[1], dir[0]] : dir;
      const e: P = [o[0] + d2[0] * L, o[1] + d2[1] * L];
      if (!inside(o, poly) || !inside(e, poly)) continue;
      flecks.push(<path key={`st${key}-${c}`} d={ribbon(sample([o, [(o[0] + e[0]) / 2 + r(-4, 4), (o[1] + e[1]) / 2 + r(-4, 4)], e]), r(1.6, 2.9), r)} fill="#fff" fillOpacity={r(0.22, 0.44)} />);
    }
    return {ink: ink.slice(2), fill: ink.slice(0, 2), flecks};
  };
  const paperFill = (T: Xf, pts: P[], key: number) => <path key={`pf${key}`} d={polyPath(sample(pts.map(T), true, 8), true)} fill="#fff" />;

  // ================= table =================
  const table = S(part(7, [500, 806], (p) => p, 0.12), [[96, 808], [300, 804], [520, 808], [716, 805], [884, 808]], HEAVY_W, {p: 0.9, over: 34, j: 1.6});

  // ================= coat: one big black mass, straight edges =================
  const coatPts: P[] = [[458, 420 + drop], [334, 452 + drop], [272, 606], [218, 808], [600, 812], [610, 690], [606, 592], [562, 446 + drop]];
  const coat = blackFill(corners(BODY, coatPts, 1, 6.5), 1, 72, 40);
  // the upper arm inside the mass is only hinted: a broken row of flecks where the crayon skipped
  const armHint: React.ReactNode[] = [];
  const ahr = rng(seed, 605);
  for (let i = 0; i < 4; i++) {
    const t0 = 0.12 + i * 0.22 + ahr(-0.05, 0.05), t1 = t0 + ahr(0.03, 0.09);
    const at = (t: number): P => [lerp(440, 580, t), lerp(500 + drop, 748, t)];
    if (ahr() < 0.75) armHint.push(...S(BODY, [at(t0), at(t1)], 2.6, {p: 0.7, j: 2.5, over: 2}));
  }

  // ================= near forearm: elbow on the table, rising to the cup =================
  const er = rng(seed, 600);
  const EL: P = G([632 - raise * 8 + er(-2.5, 2.5), 790 - raise * 30 + er(-2.5, 2.5)]);
  const WR: P = GRIP([-56, 128]);
  const fdx = WR[0] - EL[0], fdy = WR[1] - EL[1], fL = Math.hypot(fdx, fdy) || 1;
  const ux = fdx / fL, uy = fdy / fL, nx = -uy, ny = ux; // n points to the left of the arm (towards the body)
  const fore: P[] = [
    [EL[0] - ux * 24, EL[1] - uy * 24 + 4], // pointed elbow
    [EL[0] + nx * 50, EL[1] + ny * 50],
    [WR[0] + nx * 34 - ux * 4, WR[1] + ny * 34 - uy * 4],
    [WR[0] - nx * 32 + ux * 4, WR[1] - ny * 32 + uy * 4],
    [EL[0] - nx * 54, EL[1] - ny * 54],
  ].map(([x, y]) => [x + er(-4.5, 4.5), y + er(-4.5, 4.5)] as P);
  const forearm = blackFill(fore, 2, 60, 10);

  // ================= head =================
  const headFill = paperFill(HEAD, [[452, 216], [505, 193], [575, 192], [628, 214], [660, 258], [716, 297], [772, 304], [803, 290], [770, 328], [710, 342], [672, 347], [664, 402], [630, 425], [575, 435], [520, 430], [468, 404], [440, 330], [438, 262]], 1);
  const head: React.ReactNode[] = [
    ...S(HEAD, [[486, 199], [540, 191], [596, 196], [634, 218]], OUTLINE_W, {p: 0.5, restate: 0.2}), // top of the skull, light
    ...S(HEAD, [[626, 212], [658, 258], [714, 297], [770, 305], [804, 289]], OUTLINE_W * 1.05, {p: 0.74, over: 4}), // brow, concave slope, upturned tip
    ...S(HEAD, [[805, 291], [772, 327], [712, 342], [668, 348]], OUTLINE_W, {p: 0.7, over: 5}), // under the nose, crosses the face line
    ...S(HEAD, [[673, 338], [670, 372], [664, 405]], OUTLINE_W, {over: 9}), // front of the face
    ...S(HEAD, [[672, 400], [632, 424], [578, 436], [522, 431]], OUTLINE_W, {over: 10, restate: 0.25}), // jaw
    ...S(G, [[498, 428 + drop], [494, 460 + drop]], OUTLINE_W, {over: 6}), // neck
    ...S(G, [[561, 436 + drop], [567, 464 + drop]], OUTLINE_W, {over: 6}),
  ];
  // mouth: a dash; an "o" when blowing; a small smile in the payoff; hidden by the cup while sipping
  if (blowing) head.push(...S(HEAD, [[676, 372], [692, 379], [689, 393], [675, 396], [669, 383], [677, 372]], 4, {p: 0.85, over: 1, j: 1}));
  else if (bliss > 0.2) head.push(...S(HEAD, [[630, 384], [644, 393], [660, 386]], OUTLINE_W, {p: 0.8, over: 3, j: 1.2}));
  else head.push(...S(HEAD, [[634, 391], [657, 389]], OUTLINE_W, {p: 0.8, over: 4, j: 1.4}));
  // eye: ONE mark, dot or dash, picked fresh each frame (as in the reference); a shut arc in the payoff
  const eyeR = rng(seed, 601);
  if (bliss > 0.2) head.push(...S(HEAD, [[622, 280], [634, 289], [648, 281]], OUTLINE_W, {p: 0.9, over: 2, j: 1}));
  else if (blowing) head.push(...S(HEAD, [[624, 284], [646, 283]], OUTLINE_W * 1.1, {p: 0.9, over: 3, j: 1}));
  else if (eyeR() < 0.55) head.push(...S(HEAD, [[634, 278], [637, 287]], 8.5, {p: 1, over: 0.5, j: 1, tin: 3, tout: 3}));
  else head.push(...S(HEAD, [[627, 280], [643, 286]], OUTLINE_W * 1.2, {p: 0.9, over: 3, j: 1.2}));
  // cheek: mostly a few faint scratches; a soft grey smudge in ~38% of frames (5/13 measured), always in the payoff
  const ckR = rng(seed, 602);
  const smudge = bliss > 0.2 || ckR() < 0.38;
  const cheekMarks: React.ReactNode[] = [];
  const cheekSmudge: React.ReactNode[] = [];
  if (smudge) {
    const c = HEAD([606, 334]);
    const pts: P[] = Array.from({length: 7}, (_, i) => [c[0] + (i % 2 ? 13 : -13) * ckR(0.5, 1.1), c[1] - 12 + i * 4 + ckR(-2, 2)] as P);
    cheekSmudge.push(<path key="sm" d={ribbon(sample(pts), 11, ckR)} fill="#000" fillOpacity={0.42} />);
  } else {
    const n = 2 + Math.floor(ckR(0, 2));
    for (let i = 0; i < n; i++) cheekMarks.push(...S(HEAD, [[594 + i * 4, 338 + i * 6], [616 + i * 5, 327 + i * 6]], 2.6, {p: P_LIGHT, over: 4, j: 2.5}));
  }

  // hair: heavy scribble down the back of the skull, re-scribbled from scratch every frame,
  // sometimes zigzag and sometimes loops (the reference alternates), plus a bun
  const hair: React.ReactNode[] = [];
  const hr = rng(seed, 603);
  const spine = sample([[580, 192], [500, 196], [448, 238], [432, 300], [442, 362], [478, 410]].map((p) => HAIR(p as P)), false, 6);
  const scribble = (r: Rnd, n: number, half: number, zig: boolean): P[] => {
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
    return pts;
  };
  const zig = hr() < 0.5;
  hair.push(<path key="h1" d={ribbon(sample(scribble(hr, zig ? 24 : 34, zig ? 42 : 32, zig)), HAIR_W * hr(0.9, 1.2), hr, {waver: 0.25})} fill="#000" fillOpacity={P_HEAVY} />);
  hair.push(<path key="h2" d={ribbon(sample(scribble(hr, 13, 28, !zig)), HAIR_W * hr(0.9, 1.3), hr, {waver: 0.25})} fill="#000" fillOpacity={P_HEAVY} />);
  const bunC = HAIR([408, 206]);
  const bunPts: P[] = [];
  let ba = hr(0, 6.28);
  for (let i = 0; i < 17; i++) {
    ba += hr(0.9, 1.9);
    const rr = hr(14, 42);
    bunPts.push([bunC[0] + Math.cos(ba) * rr * 1.1, bunC[1] + Math.sin(ba) * rr * 0.9]);
  }
  hair.push(<path key="h3" d={ribbon(sample(bunPts), HAIR_W * hr(0.85, 1.1), hr, {waver: 0.25})} fill="#000" fillOpacity={P_HEAVY} />);
  if (hr() < 0.5) hair.push(...S(HAIR, [[556, 186], [588, 174], [612, 182]], 6.5, {p: 0.85, j: 4})); // a stray flick

  // ================= cup =================
  const cupFill = paperFill(CUP, [[-56, -50], [-20, -61], [30, -60], [56, -50], [51, 6], [41, 49], [0, 58], [-41, 49], [-51, 6]], 2);
  const cup: React.ReactNode[] = [
    ...S(CUP, [[-56, -48], [-51, 5], [-41, 48]], OUTLINE_W, {over: 6}),
    ...S(CUP, [[-42, 47], [0, 57], [42, 47]], OUTLINE_W, {over: 6}),
    ...S(CUP, [[41, 49], [51, 5], [56, -48]], OUTLINE_W, {over: 6}),
    ...S(CUP, [[-57, -48], [-20, -60], [28, -60], [57, -48]], OUTLINE_W, {over: 4}),
    ...S(CUP, [[-56, -47], [-22, -37], [26, -37], [56, -47]], OUTLINE_W * 0.9, {p: 0.55, over: 4}),
  ];
  // steam: thin light lines; pushed sideways when she blows; gone while she drinks
  const steam: React.ReactNode[] = [];
  if (raise < 0.15) {
    const h = bliss > 0 ? 66 : 122;
    [-15, 13].forEach((off, si) => {
      const pts: P[] = [];
      for (let k = 0; k <= 5; k++) {
        const t = k / 5;
        pts.push([off + Math.sin(t * 6.2 + frame * 0.9 + si * 2.1) * 9 + lean * t * 78, -66 - t * h]);
      }
      steam.push(...S(CUP, pts, 3.4, {p: 0.5, j: 1.6, over: 5}));
    });
  }
  // exhale: a little light scribble drifting up and away in the payoff
  const exhale: React.ReactNode[] = [];
  if (puff > 0 && puff < 1) {
    const m = HEAD([690, 380]);
    const xr = rng(seed, 604);
    const c: P = [m[0] + 24 + puff * 150, m[1] - 4 - puff * puff * 120];
    const pts: P[] = [];
    let a = xr(0, 6.28);
    for (let i = 0; i < 15; i++) {
      a += xr(0.6, 1.0);
      const rr = (4 + i * 1.5 + puff * 9) * xr(0.8, 1.15);
      pts.push([c[0] + Math.cos(a) * rr * 1.2, c[1] + Math.sin(a) * rr]);
    }
    exhale.push(<path key="ex" d={ribbon(sample(pts), 3.4, xr)} fill="#000" fillOpacity={0.62 - puff * 0.22} />);
  }

  // ================= near hand: wrapped round the cup =================
  const gripFill = paperFill(GRIP, [[-80, 128], [-108, 70], [-113, 10], [-99, -32], [-62, -77], [-43, -71], [-43, -58], [-70, -42], [42, -42], [62, -20], [66, 30], [54, 57], [-52, 60], [-34, 124]], 4);
  const grip: React.ReactNode[] = [];
  grip.push(...S(GRIP, [[-80, 130], [-108, 70], [-113, 10], [-100, -30]], OUTLINE_W, {over: 6, restate: 0.25})); // back of the hand
  // thumb points up the side of the cup and rubs it: 13-frame cycle, 5 out / 8 back (the reference's rhythm)
  const cyc = frame % 13;
  const rub = (cyc < 5 ? act(cyc, 0, 5, 40) : 1 - act(cyc, 5, 8, 41)) * (1 - raise) * (1 - bliss) * 13;
  const TH: Xf = (p) => GRIP(xf(p, 0, 0, rub * 0.9, -92, -32));
  grip.push(...S(TH, [[-100, -31], [-82, -58], [-61, -76]], OUTLINE_W, {over: 3}));
  grip.push(...S(TH, [[-61, -76], [-46, -73], [-43, -60]], OUTLINE_W, {over: 2, j: 1.2}));
  grip.push(...S(TH, [[-43, -60], [-60, -47], [-73, -40]], OUTLINE_W, {over: 6}));
  grip.push(...S(TH, [[-57, -70], [-50, -67], [-53, -61]], 3, {p: 0.5, over: 1, j: 0.9}));
  // four long fingers across the cup; in the payoff they ripple one after another
  const tipsG = [40, 52, 54, 44];
  tipsG.forEach((tip, i) => {
    const y = -30 + i * 25;
    const wave = bliss > 0.5 ? Math.max(0, Math.sin(((frame - 57) / 13) * Math.PI * 2 - i * 1.0)) : 0;
    const F: Xf = (p) => GRIP(xf(p, wave * 3, 0, -wave * 5, -72, y));
    grip.push(...S(F, [[-72, y - 11], [-24, y - 12], [tip, y - 11]], OUTLINE_W, {over: 7, restate: 0.3}));
    grip.push(...S(F, [[tip, y - 11], [tip + 12, y - 1], [tip + 3, y + 10]], OUTLINE_W, {over: 2, j: 1.3}));
    grip.push(...S(F, [[tip + 3, y + 10], [-10, y + 11.5], [-38 + i * 6, y + 11]], OUTLINE_W, {over: 10, j: 1.6}));
    grip.push(...S(F, [[tip - 6, y - 5], [tip + 2, y], [tip - 2, y + 6], [tip - 10, y + 3]], 3.2, {p: 0.5, over: 2, j: 1.1}));
  });
  grip.push(...S(GRIP, [[-52, 60], [-40, 96], [-34, 126]], OUTLINE_W, {over: 6})); // heel of the hand

  const ink = `url(#ink-${seed})`, paper = `url(#paper-${seed})`;
  return (
    <svg width={1000} height={1000} viewBox="0 0 1000 1000">
      <CrayonDefs seed={seed} />
      <g filter={`url(#fill-${seed})`}>{coat.fill}</g>
      <g filter={ink}>{coat.ink}{table}</g>
      <g filter={`url(#fleck-${seed})`}>{coat.flecks}</g>
      <g filter={paper}>{armHint.map((e, i) => React.cloneElement(e as React.ReactElement<{fill: string}>, {fill: '#fff', key: `ah${i}`}))}</g>
      <g filter={paper}>{headFill}</g>
      <g filter={`url(#grey-${seed})`}>{cheekSmudge}</g>
      <g filter={ink}>{head}{cheekMarks}{hair}</g>
      <g filter={`url(#fill-${seed})`}>{forearm.fill}</g>
      <g filter={ink}>{forearm.ink}</g>
      <g filter={`url(#fleck-${seed})`}>{forearm.flecks}</g>
      <g filter={paper}>{cupFill}</g>
      <g filter={ink}>{cup}{steam}{exhale}</g>
      <g filter={paper}>{gripFill}</g>
      <g filter={ink}>{grip}</g>
    </svg>
  );
};
