import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {BrushTest} from './BrushTest';
import {Drawing} from './Drawing';
import {Film} from './knife/Film';
import {FlowTest} from './flow/FlowTest';
import {Film2} from './knife/Film2';
import {Sheet} from './doodle/Sheet';
import {Constantine} from './doodle/constantine/Film';
import {ConstantineE} from './doodle/constantine/FilmE';

const con = (v: number): React.FC<{frame: number}> => ({frame}) => <Constantine frame={frame} v={v} />;
const all: Record<string, React.FC<{frame: number}>> = {BrushTest, Drawing, Film, FlowTest, Film2, Sheet, Con1: con(0), Con2: con(1), Con3: con(2), Con4: con(3), Con5: con(4), ConE: ConstantineE};
export const render = (name: string, frame: number) => {
  const C = all[name];
  return renderToStaticMarkup(<C frame={frame} />);
};
