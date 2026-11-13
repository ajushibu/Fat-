import React from 'react';
import {P} from '../brush';
import {camXf, place, travel} from './camera';
import {makeKit} from './kit';
import {circle, morphPoly} from './shape';

// Test card for the transition primitives. frame 0..10 = progress 0..1.
export const FlowTest: React.FC<{frame: number}> = ({frame}) => {
  const t = Math.min(1, frame / 10);
  const k = makeKit(frame);
  const I = (p: P) => p;

  // 1) polarity per layer: a black disc grows; inside it, white crayon on black
  const disc = circle([250, 250], 40 + t * 150, 28);
  k.black(k.corners(I, disc, 2), 60, 6);
  k.setPol(true);
  k.stroke(I, [[200, 250], [250, 215], [300, 250], [250, 285], [200, 250]], 5, {p: 0.9});
  k.black(k.corners(I, circle([250, 250], 14, 12), 1), 0, 0);
  k.setPol(false);

  // 2) morph: a blade outline becomes a circle (one shape, many identities)
  const bladeShape: P[] = [[640, 380], [700, 380], [690, 250], [672, 120], [650, 250]];
  k.black(k.corners(I, morphPoly(bladeShape, circle([680, 260], 70, 24), t, 48), 1.5), 80, 4);

  // 3) a line that draws itself, then houses grow from it (line becomes contour)
  k.stroke(I, [[60, 620], [200, 600], [330, 640], [460, 610]], 6, {draw: t, p: 0.9, over: 0});
  if (t > 0.5) {
    const h = (t - 0.5) * 2 * 70;
    k.stroke(I, [[180, 603], [180, 603 - h], [215, 603 - h - 22], [250, 603 - h], [250, 612]], 5, {over: 3});
  }

  // 4) contour wipe: scene A outside a sweeping edge, scene B inside it
  const edge = 520 + t * 440;
  const wipe: P[] = [[520, 540], [edge, 540], [edge - 60, 760], [edge, 980], [520, 980]];
  k.clip(wipe, true);
  for (let i = 0; i < 5; i++) k.stroke(I, [[540, 580 + i * 80], [960, 600 + i * 80]], 5);
  k.clip(wipe);
  k.black(k.corners(I, [[520, 540], [980, 540], [980, 980], [520, 980]], 2), 40, 8);
  k.setPol(true);
  k.stroke(I, [[600, 700], [760, 620], [900, 760], [760, 900], [600, 700]], 6, {p: 0.95});
  k.setPol(false);
  k.clip(null);
  k.stroke(I, [[edge, 540], [edge - 60, 760], [edge, 980]], 7, {p: 0.95});

  // 5) camera travel into a nested scene: a small square placed at 1/8 scale, seen through a moving camera
  const cam = travel({c: [500, 500], zoom: 1, rot: 0}, {c: [120, 880], zoom: 3, rot: -20}, t);
  const T = (p: P) => camXf(cam)(place([120, 880], 1 / 8, 20)(p));
  if (frame > 10) k.stroke(T, [[100, 100], [900, 100], [900, 900], [100, 900], [100, 100]], 5);
  else k.stroke(place([120, 880], 1 / 8, 20), [[100, 100], [900, 100], [900, 900], [100, 900], [100, 100]], 5);
  return k.render();
};
