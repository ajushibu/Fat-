import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';

/*
 * "Tea break": an original character in the dry-crayon, redrawn-every-frame
 * style measured in ../STYLE.md. Everything is drawn from the frame number only.
 */
// ---- style constants (measured on the reference, see STYLE.md) ----
const PAPER = '#fdfdfd'; // paper RGB 253
const INK = '#020202'; // ink: k-means darkest cluster #030303 (p2 luma = 1); edges soften it to ~10
const OUTLINE_W = 5.2; // face / hand outlines (measures ~4.4 px median after the crayon erosion)
const SCRIBBLE_W = 8.2; // hair scribble + table line (measures ~6.4 px)
const BOIL_EVERY = 1; // animated on 1s: new boil seed every frame
const JITTER = 5.2; // per-point redraw jitter, px (-> ~2 px median outline boil)
const REGISTER = 0.8; // extra whole-drawing re-registration per frame, px (the low-freq warp adds the rest -> ~2 px)
// Measured vignette / paper grain / flicker were all ~0, so they stay at 0.
const VIGNETTE = 0;
const FLICKER = 0;

type P = [number, number];
type Rnd = (lo?: number, hi?: number) => number;

// ---------- deterministic randomness ----------
const mulberry = (a: number) => () => {
  a |= 0;
  a = (a + 0x6d2b79f5) | 0;
  let t = Math.imul(a ^ (a >>> 15), 1 | a);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const rng = (...keys: number[]): Rnd => {
  const r = mulberry(keys.reduce((h, k) => Math.imul(h ^ (k * 2654435761), 1597334677) >>> 0, 0x9e3779b9));
  return (lo = 0, hi = 1) => lo + (hi - lo) * r();
};

// ---------- geometry helpers ----------
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (pts: P[], closed = false): string => {
  const n = pts.length;
  const at = (i: number) => (closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]);
  let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
  const last = closed ? n : n - 1;
  for (let i = 0; i < last; i++) {
    const p0 = at(i - 1), p1 = at(i), p2 = at(i + 1), p3 = at(i + 2);
    const c1: P = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2: P = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return closed ? d + ' Z' : d;
};
// redraw jitter: every point moves a little each frame; open line ends over/undershoot
const wob = (pts: P[], r: Rnd, amp = JITTER, open = true): P[] => {
  const out = pts.map(([x, y]) => [x + r(-amp, amp), y + r(-amp, amp)] as P);
  if (open && out.length > 1) {
    const ext = (a: P, b: P) => {
      const dx = a[0] - b[0], dy = a[1] - b[1], L = Math.hypot(dx, dy) || 1, k = r(-6, 10);
      return [a[0] + (dx / L) * k, a[1] + (dy / L) * k] as P;
    };
    out[0] = ext(out[0], out[1]);
    out[out.length - 1] = ext(out[out.length - 1], out[out.length - 2]);
  }
  return out;
};
// rotate (deg) + scale about pivot, then translate
const xf = (pts: P[], tx: number, ty: number, deg = 0, px = 0, py = 0, s = 1): P[] => {
  const a = (deg * Math.PI) / 180, c = Math.cos(a) * s, si = Math.sin(a) * s;
  return pts.map(([x, y]) => [px + (x - px) * c - (y - py) * si + tx, py + (x - px) * si + (y - py) * c + ty] as P);
};

// near-linear spacing with hand-drawn irregularity (+/-50% per frame), no easing,
// no anticipation, no overshoot (as measured on the reference finger drum)
const act = (f: number, start: number, len: number, key: number) => {
  if (f <= start) return 0;
  if (f >= start + len) return 1;
  const steps = Array.from({length: len}, (_, k) => 1 + rng(key, k)(-0.5, 0.5));
  const tot = steps.reduce((a, b) => a + b, 0);
  let acc = 0;
  for (let k = 0; k < f - start; k++) acc += steps[k];
  return acc / tot;
};

// dense coil scribble that travels along a spine (the hair), re-scribbled every frame
const coil = (r: Rnd, spine: P[], turns: number, rad: [number, number]): string => {
  const pts: P[] = [];
  const total = turns * 5;
  let ang = r(0, 6.28);
  for (let i = 0; i < total; i++) {
    const t = i / (total - 1);
    const seg = Math.min(spine.length - 2, Math.floor(t * (spine.length - 1)));
    const u = t * (spine.length - 1) - seg;
    const cx = lerp(spine[seg][0], spine[seg + 1][0], u) + r(-5, 5);
    const cy = lerp(spine[seg][1], spine[seg + 1][1], u) + r(-5, 5);
    ang += r(1.0, 1.6);
    const rr = r(rad[0], rad[1]);
    pts.push([cx + Math.cos(ang) * rr * 1.25, cy + Math.sin(ang) * rr * 0.8]);
  }
  return smooth(pts);
};
// hair scribble along a spine; each frame randomly zigzags or loops, like the reference
const hairScribble = (r: Rnd, spine: P[], n: number, width: number): string => {
  const zig = r() < 0.5;
  const pts: P[] = [];
  let ang = r(0, 6.28);
  for (let i = 0; i < n; i++) {
    const t = Math.max(0, Math.min(0.999, i / (n - 1) + r(-0.02, 0.02)));
    const seg = Math.min(spine.length - 2, Math.floor(t * (spine.length - 1)));
    const u = t * (spine.length - 1) - seg;
    const a = spine[seg], b = spine[seg + 1];
    const cx = lerp(a[0], b[0], u), cy = lerp(a[1], b[1], u);
    const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1;
    const nx = -dy / L, ny = dx / L;
    if (zig) {
      const side = (i % 2 ? 1 : -1) * width * r(0.45, 1.1);
      pts.push([cx + nx * side + r(-6, 6), cy + ny * side + r(-6, 6)]);
    } else {
      ang += r(1.0, 2.3);
      const rr = width * r(0.45, 1.0);
      pts.push([cx + Math.cos(ang) * rr, cy + Math.sin(ang) * rr * 0.8]);
    }
  }
  return smooth(pts);
};
// short zigzag strokes straddling a closed outline: ragged scribble silhouette
const roughEdge = (r: Rnd, poly: P[], n: number): string[] =>
  Array.from({length: n}, () => {
    const i = Math.floor(r(0, poly.length));
    const a = poly[i], b = poly[(i + 1) % poly.length];
    const u = r(0, 1);
    const x = lerp(a[0], b[0], u), y = lerp(a[1], b[1], u);
    const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1;
    const tx = dx / L, ty = dy / L, nx = -ty, ny = tx;
    const pts: P[] = [];
    for (let k = 0; k < 4; k++) {
      const along = (k - 1.5) * r(8, 16);
      const out = (k % 2 ? 1 : -1) * r(3, 10);
      pts.push([x + tx * along + nx * out, y + ty * along + ny * out]);
    }
    return smooth(pts);
  });

export const Scene: React.FC = () => {
  const frame = useCurrentFrame();
  const seed = Math.floor(frame / BOIL_EVERY);
  const R = (k: number) => rng(seed, k);

  // ---------- timeline (frames @ 14.29 fps; 5 to peak, 7 to settle as measured) ----------
  const lean = act(frame, 18, 5, 1) - act(frame, 29, 7, 2); // lean in + blow on the tea
  const raise = act(frame, 37, 5, 3) - act(frame, 50, 7, 4); // lift cup, sip, lower
  const bliss = act(frame, 57, 5, 5); // payoff: eyes shut, shoulders drop, cheek smudge
  const puff = act(frame, 57, 10, 6); // contented exhale rises
  const blowing = frame >= 21 && frame < 31;

  const drop = bliss * 10;
  const reg = R(1);
  const gx = reg(-REGISTER, REGISTER), gy = reg(-REGISTER, REGISTER);

  // ---------- head pose (big head, pivot at neck) ----------
  const NECK: P = [565, 405];
  const HS = 1.18; // head scale vs body: the creator draws heads big
  const headRot = lean * 7 - raise * 12 + bliss * 5;
  const H = (pts: P[]) => xf(pts, lean * 14, drop, headRot, NECK[0], NECK[1], HS);

  // ---------- cup pose: oversized hands around a cup on the table ----------
  const CS = 1.5;
  const cupX = lerp(668, 732, raise) + lean * 6;
  const cupY = lerp(690, 352, raise) + drop * 0.5;
  const cupRot = lerp(0, -28, raise);
  const C = (pts: P[]) => xf(pts, cupX, cupY, cupRot, 0, 0, CS);

  // ---------- table line ----------
  const table = wob([[140, 772], [420, 769], [700, 774], [900, 770]], R(2), JITTER);

  // ---------- coat (solid black scribble mass) ----------
  const coatBase: P[] = [
    [548, 398 + drop], [622, 436 + drop], [646, 540], [664, 772],
    [470, 778], [240, 776], [248, 690], [300, 550], [352, 466 + drop], [430, 420 + drop], [500, 404 + drop],
  ];
  const coat = wob(coatBase, R(3), JITTER * 1.5, false);
  const hatch = R(4);
  const streaks = Array.from({length: 52}, () => {
    const x = hatch(260, 670), y = hatch(410, 790), L = hatch(30, 110);
    return `M${x.toFixed(1)},${y.toFixed(1)} l${(L * 0.4).toFixed(1)},${(-L).toFixed(1)}`;
  });
  const coatEdge = roughEdge(R(5), coat, 48);

  // forearm sleeve: elbow -> wrist at the cup's left side
  const wrist = C([[-92, 8]])[0];
  const elbow: P = [520 + R(6)(-2, 2), 735 + drop + R(6)(-2, 2)];
  const mid: P = [lerp(elbow[0], wrist[0], 0.5) - 10, lerp(elbow[1], wrist[1], 0.5) + 6];
  const sleeve = smooth(wob([elbow, mid, wrist], R(7), JITTER, false));
  const sleeveEdge = roughEdge(R(8), [elbow, mid, wrist], 8);

  // ---------- head ----------
  const headFill = smooth(H([[455, 230], [520, 190], [600, 205], [688, 278], [712, 300], [698, 322], [640, 324], [626, 352], [616, 372], [580, 392], [520, 395], [470, 340]]), true);
  const profile = smooth(wob(H([[525, 194], [590, 202], [640, 232], [690, 280], [713, 301], [702, 322], [642, 326]]), R(9)));
  const chin = smooth(wob(H([[632, 332], [623, 354], [616, 374], [590, 390], [560, 394]]), R(10)));
  const neckA = smooth(wob([[548, 396 + drop], [544, 432 + drop]], R(11)));
  const neckB = smooth(wob([[600, 386 + drop], [606, 428 + drop]], R(12)));
  // hair: heavy coil down the back of the head + topknot, new scribble every frame
  const hairSpine = H([[548, 190], [492, 210], [462, 258], [464, 314], [494, 362]]);
  const hairBack = hairScribble(R(13), hairSpine, 40, 42);
  const hairBack2 = hairScribble(R(19), hairSpine, 22, 26);
  const bun = coil(R(14), H([[476, 172], [510, 162], [496, 146], [468, 158]]), 4, [14, 30]);

  // eye: one mark, dot or dash picked fresh each frame; shut arc in the payoff
  const eyeP = H([[634, 262]])[0];
  const er = R(15);
  const eyeShut = bliss > 0.2;
  const eyeIsDot = er() < 0.5;
  // cheek smudge: grey blob in ~40% of frames (5/13 in reference); every frame in the payoff
  const smudgeP = H([[604, 302]])[0];
  const sr = R(16);
  const smudgeBlob = bliss > 0.2 || sr() < 0.38;
  const mouth = H([[636, 346]])[0];

  // ---------- cup + hand (cup-local coords, origin = cup centre) ----------
  const cr = R(17);
  const cupBody = smooth(wob(C([[-56, -46], [-50, 10], [-40, 48], [0, 56], [40, 48], [50, 10], [56, -46]]), cr, JITTER, false));
  const rim = smooth(wob(C([[-56, -46], [-20, -58], [30, -57], [56, -46], [20, -36], [-30, -36], [-56, -46]]), cr, JITTER, false));
  const handle = smooth(wob(C([[54, -24], [80, -24], [84, 2], [70, 20], [48, 24]]), cr, JITTER));
  const hr = R(18);
  const palm = smooth(wob(C([[-92, -26], [-100, 6], [-94, 36], [-74, 56]]), hr, JITTER));
  const handFill = smooth(C([[-92, -30], [-30, -28], [44, -18], [48, 54], [-74, 60], [-100, 6]]), true);
  const fingers = [-14, 5, 24, 42].map((y, i) => {
    const tip = 30 + i * 3 + hr(-3, 3);
    const top = smooth(wob(C([[-70, y - 8], [-20, y - 9], [tip, y - 8]]), hr, JITTER * 0.7));
    const tipCurve = smooth(wob(C([[tip, y - 8], [tip + 10, y - 2], [tip + 7, y + 7], [tip - 4, y + 9]]), hr, JITTER * 0.5));
    const under = smooth(wob(C([[tip - 4, y + 9], [-36, y + 10]]), hr, JITTER * 0.7));
    const loop = smooth(wob(C([[tip - 2, y - 4], [tip + 3, y + 1], [tip, y + 5], [tip - 6, y + 3]]), hr, 1.0));
    return {top, tipCurve, under, loop};
  });
  const cyc = frame % 13;
  const rub = (cyc < 5 ? act(cyc, 0, 5, 40) : 1 - act(cyc, 5, 8, 41)) * (1 - raise) * 16;
  const thumb = smooth(wob(C([[-90, -30], [-58, -42], [-22 + rub, -42 - rub * 0.3], [-10 + rub, -35 - rub * 0.3], [-28 + rub, -28], [-66, -24]]), hr, JITTER));

  // steam: two wavy lines, pushed sideways when she blows, gone while sipping
  const steamOn = raise < 0.15;
  const rimW = C([[0, -58]])[0];
  const steamH = bliss > 0 ? 70 : 125;
  const steam = [-16, 16].map((off, si) => {
    const pts: P[] = [];
    for (let k = 0; k <= 6; k++) {
      const t = k / 6;
      const y = rimW[1] - 20 - t * steamH;
      const x = rimW[0] + off + Math.sin(t * 6.5 + frame * 0.9 + si * 2) * 10 + lean * t * 80;
      pts.push([x, y]);
    }
    return smooth(wob(pts, R(20 + si), 1.6));
  });

  // exhale: a little scribble cloud drifting up-right from the mouth in the payoff
  const puffPath =
    puff > 0 && puff < 1
      ? coil(R(30), [[mouth[0] + 40 + puff * 60, mouth[1] - 10 - puff * 120], [mouth[0] + 90 + puff * 70, mouth[1] - 30 - puff * 130]], 3, [10 + puff * 14, 16 + puff * 18])
      : null;

  const filterId = `crayon-${seed}`;
  return (
    <AbsoluteFill style={{backgroundColor: PAPER}}>
      <svg width={1000} height={1000} viewBox="0 0 1000 1000">
        <defs>
          <filter id={filterId} filterUnits="userSpaceOnUse" x={0} y={0} width={1000} height={1000} colorInterpolationFilters="sRGB">
            {/* line boil: low-frequency warp, new seed every BOIL_EVERY frames */}
            <feTurbulence type="fractalNoise" baseFrequency="0.014" numOctaves={2} seed={seed} result="lo" />
            <feDisplacementMap in="SourceGraphic" in2="lo" scale={20} xChannelSelector="R" yChannelSelector="G" result="boil" />
            {/* dry crayon edge: mid-frequency displacement */}
            <feTurbulence type="turbulence" baseFrequency="0.32" numOctaves={2} seed={seed + 101} result="hi" />
            <feDisplacementMap in="boil" in2="hi" scale={6} xChannelSelector="R" yChannelSelector="B" result="rough" />
            {/* crayon grain: sparse per-frame specks knocked out of the ink */}
            <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves={1} seed={seed + 202} result="grain" />
            <feColorMatrix in="grain" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -21 16.7" result="gmask" />
            <feComposite in="rough" in2="gmask" operator="in" result="tex" />
            <feGaussianBlur in="tex" stdDeviation={0.7} />
          </filter>
          <clipPath id={`coat-${seed}`}>
            <path d={smooth(coat, true)} />
          </clipPath>
        </defs>
        <g transform={`translate(${(gx + 4).toFixed(2)},${(gy + 78).toFixed(2)}) scale(0.97)`}>
          <g filter={`url(#${filterId})`} strokeLinecap="round" strokeLinejoin="round" fill="none">
            <path d={smooth(table)} stroke={INK} strokeWidth={SCRIBBLE_W} />
            {/* coat */}
            <path d={smooth(coat, true)} fill={INK} stroke={INK} strokeWidth={SCRIBBLE_W} />
            {coatEdge.map((d, i) => <path key={i} d={d} stroke={INK} strokeWidth={SCRIBBLE_W * 0.9} />)}
            <g clipPath={`url(#coat-${seed})`}>
              {streaks.map((d, i) => <path key={i} d={d} stroke={i % 3 ? "#262626" : "#4a4a4a"} strokeWidth={i % 3 ? 1.6 : 2.4} />)}
            </g>
            {/* head */}
            <path d={headFill} fill={PAPER} />
            <path d={profile} stroke={INK} strokeWidth={OUTLINE_W * 1.1} />
            {/* hair scribbled over the back of the skull */}
            <path d={hairBack} stroke={INK} strokeWidth={SCRIBBLE_W * 1.3} />
            <path d={hairBack2} stroke={INK} strokeWidth={SCRIBBLE_W * 1.6} />
            <path d={bun} stroke={INK} strokeWidth={SCRIBBLE_W * 1.15} />
            <path d={chin} stroke={INK} strokeWidth={OUTLINE_W} />
            <path d={neckA} stroke={INK} strokeWidth={OUTLINE_W} />
            <path d={neckB} stroke={INK} strokeWidth={OUTLINE_W} />
            {smudgeBlob ? (
              <ellipse cx={smudgeP[0] + sr(-3, 3)} cy={smudgeP[1] + sr(-3, 3)} rx={sr(15, 24)} ry={sr(12, 18)} fill="#ebebeb" />
            ) : (
              <path d={smooth(wob([[smudgeP[0] - 6, smudgeP[1]], [smudgeP[0], smudgeP[1] - 5], [smudgeP[0] + 5, smudgeP[1] + 3], [smudgeP[0] - 2, smudgeP[1] + 6]], sr, 2))} stroke="#b8b8b8" strokeWidth={1.8} />
            )}
            {eyeShut ? (
              <path d={smooth(wob([[eyeP[0] - 10, eyeP[1] - 2], [eyeP[0], eyeP[1] + 5], [eyeP[0] + 10, eyeP[1] - 2]], er, 1.2))} stroke={INK} strokeWidth={OUTLINE_W} />
            ) : blowing ? (
              <path d={smooth(wob([[eyeP[0] - 9, eyeP[1]], [eyeP[0] + 9, eyeP[1] + 1]], er, 1))} stroke={INK} strokeWidth={OUTLINE_W * 1.2} />
            ) : eyeIsDot ? (
              <circle cx={eyeP[0] + er(-2, 2)} cy={eyeP[1] + er(-2, 2)} r={er(5, 7)} fill={INK} />
            ) : (
              <path d={smooth(wob([[eyeP[0] - 3, eyeP[1] - 6], [eyeP[0] + 2, eyeP[1] + 6]], er, 1.2))} stroke={INK} strokeWidth={OUTLINE_W * 1.4} />
            )}
            {blowing && <circle cx={mouth[0] + 6} cy={mouth[1]} r={10 + R(31)(-1.5, 1.5)} stroke={INK} strokeWidth={OUTLINE_W * 0.9} fill={PAPER} />}
            {puffPath && <path d={puffPath} stroke={INK} strokeWidth={OUTLINE_W * 0.8} />}
            {steamOn && steam.map((d, i) => <path key={i} d={d} stroke={INK} strokeWidth={OUTLINE_W * 0.8} />)}
            {/* forearm, cup, hand */}
            <path d={sleeve} stroke={INK} strokeWidth={104} />
            {sleeveEdge.map((d, i) => <path key={i} d={d} stroke={INK} strokeWidth={SCRIBBLE_W} transform="translate(0,46)" />)}
            <path d={cupBody + ' Z'} fill={PAPER} stroke="none" />
            <path d={cupBody} stroke={INK} strokeWidth={OUTLINE_W} />
            <path d={rim} stroke={INK} strokeWidth={OUTLINE_W} />
            <path d={handle} stroke={INK} strokeWidth={OUTLINE_W} />
            <path d={handFill} fill={PAPER} />
            <path d={palm} stroke={INK} strokeWidth={OUTLINE_W} />
            <path d={thumb} stroke={INK} strokeWidth={OUTLINE_W} fill={PAPER} />
            {fingers.map((fg, i) => (
              <g key={i}>
                <path d={fg.top} stroke={INK} strokeWidth={OUTLINE_W} />
                <path d={fg.tipCurve} stroke={INK} strokeWidth={OUTLINE_W} />
                <path d={fg.under} stroke={INK} strokeWidth={OUTLINE_W} />
                <path d={fg.loop} stroke={INK} strokeWidth={OUTLINE_W * 0.8} />
              </g>
            ))}
          </g>
        </g>
        {/* measured vignette / flicker are 0 for this style; kept as explicit no-ops */}
        {VIGNETTE > 0 && <rect width={1000} height={1000} fill="black" opacity={VIGNETTE} />}
        {FLICKER > 0 && <rect width={1000} height={1000} fill="white" opacity={FLICKER} />}
      </svg>
    </AbsoluteFill>
  );
};
