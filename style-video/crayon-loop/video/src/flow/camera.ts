import {P} from '../brush';

/*
 * One continuous world, one camera.
 *
 * Every scene is drawn in world coordinates. Scenes can be nested at any scale with place():
 * a whole scene can live inside a pupil, a window pane or a dot at the end of a road ("the seed").
 * The camera maps world -> the 1000 x 1000 frame. Line weight stays in frame pixels, so the crayon
 * line is the same weight at any zoom; lod() says how much detail a thing deserves at its current size.
 */

export type Xf = (p: P) => P;
export type Cam = {c: P; zoom: number; rot: number}; // world point at frame centre, magnification, rotation (deg)

const rotate = (x: number, y: number, deg: number): P => {
  const a = (deg * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a);
  return [x * c - y * s, x * s + y * c];
};

// world -> frame
export const camXf = (cam: Cam): Xf => (p) => {
  const [x, y] = rotate((p[0] - cam.c[0]) * cam.zoom, (p[1] - cam.c[1]) * cam.zoom, cam.rot);
  return [500 + x, 500 + y];
};

// local scene coordinates -> world. The scene's `pivot` lands on `at`, scaled and rotated.
export const place = (at: P, scale: number, rotDeg = 0, pivot: P = [500, 500]): Xf => (p) => {
  const [x, y] = rotate((p[0] - pivot[0]) * scale, (p[1] - pivot[1]) * scale, rotDeg);
  return [at[0] + x, at[1] + y];
};

// the camera that shows a placed scene exactly as it was drawn (scene pivot at frame centre, upright, 1:1)
export const camFor = (at: P, scale: number, rotDeg = 0): Cam => ({c: at, zoom: 1 / scale, rot: -rotDeg});

// Travel between two cameras ("seed and travel"). Zoom moves on a log scale, so the push feels even at any
// magnification; the focus point (default: where camera b looks) slides in a straight line on screen.
export const travel = (a: Cam, b: Cam, p: number, focus: P = b.c): Cam => {
  const zoom = a.zoom * Math.pow(b.zoom / a.zoom, p);
  const rot = a.rot + (b.rot - a.rot) * p;
  const sa = camXf(a)(focus), sb = camXf(b)(focus);
  const sx = sa[0] + (sb[0] - sa[0]) * p - 500, sy = sa[1] + (sb[1] - sa[1]) * p - 500;
  const [wx, wy] = rotate(sx / zoom, sy / zoom, -rot);
  return {c: [focus[0] - wx, focus[1] - wy], zoom, rot};
};

// level of detail: 0 below `lo`, 1 above `hi` (sizes are on-screen magnification of the thing)
export const lod = (screenScale: number, lo: number, hi: number) => Math.max(0, Math.min(1, (Math.log(screenScale) - Math.log(lo)) / (Math.log(hi) - Math.log(lo))));

export const compose = (...fs: Xf[]): Xf => (p) => fs.reduceRight((q, f) => f(q), p);
