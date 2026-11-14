import React from 'react';
import {makePen} from './pen';
import {ground, Joints, person} from './person';

// The approved style sheet: attacker and victim in three poses (frame 0..2 = pose, then repeats with new boil).
const A1: Joints = {hip: [0, 150], neck: [30, 238], head: [62, 286], tilt: 6, kneeN: [60, 86], footN: [56, 6], kneeF: [-46, 84], footF: [-100, 6], elbowN: [-26, 286], handN: [-50, 338]};
const V1: Joints = {hip: [0, 116], neck: [30, 196], head: [26, 250], tilt: -8, kneeN: [-48, 78], footN: [-52, 6], kneeF: [-6, 62], footF: [30, 6], elbowN: [-18, 196], handN: [-60, 236], elbowF: [-24, 204], handF: [-92, 240]};
const A2: Joints = {hip: [0, 152], neck: [10, 246], head: [26, 298], kneeN: [26, 80], footN: [34, 6], kneeF: [-26, 80], footF: [-58, 6], elbowN: [30, 196], handN: [62, 176], elbowF: [-10, 196], handF: [-6, 150]};
const V2: Joints = {hip: [0, 146], neck: [14, 236], head: [10, 290], tilt: -4, kneeN: [-14, 76], footN: [-26, 6], kneeF: [16, 76], footF: [22, 6], elbowN: [-42, 232], handN: [-84, 252], elbowF: [-34, 218], handF: [-76, 230]};
const A3: Joints = {hip: [0, 138], neck: [40, 214], head: [76, 258], tilt: 12, kneeN: [56, 78], footN: [58, 6], kneeF: [-44, 70], footF: [-86, 6], elbowN: [70, 178], handN: [100, 166], elbowF: [-10, 200], handF: [-44, 186]};
const V3: Joints = {hip: [0, 92], neck: [30, 166], head: [34, 220], tilt: -14, kneeN: [-50, 62], footN: [-62, 6], kneeF: [-8, 50], footF: [26, 6], elbowN: [-16, 152], handN: [-46, 198], elbowF: [-22, 162], handF: [-74, 206]};

export const Sheet: React.FC<{frame: number}> = ({frame}) => {
  const n = (frame % 3) + 1;
  const k = makePen(frame * 7 + n);
  ground(k, 30, 970, 912);
  if (n === 1) {
    person(k, [285, 905], A1, {id: 1, face: 1, hair: 'full', handN: 'fist', knife: {dir: 30}});
    person(k, [800, 905], V1, {id: 2, face: -1, hair: 'back', mouth: 'open', handN: 'palm', handF: 'palm', ticks: true});
  } else if (n === 2) {
    person(k, [230, 905], A2, {id: 1, face: 1, hair: 'full', handN: 'fist', knife: {dir: 12}});
    person(k, [790, 905], V2, {id: 2, face: -1, hair: 'back', mouth: 'open', handN: 'palm', handF: 'palm', ticks: true});
  } else {
    person(k, [235, 905], A3, {id: 1, face: 1, hair: 'full', handN: 'fist', handF: 'fist', knife: {dir: 8, len: 66}});
    person(k, [790, 905], V3, {id: 2, face: -1, hair: 'back', mouth: 'open', handN: 'palm', handF: 'palm', ticks: true});
  }
  return k.render();
};
