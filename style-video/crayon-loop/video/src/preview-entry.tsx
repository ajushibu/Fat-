import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {BrushTest} from './BrushTest';
import {Drawing} from './Drawing';
import {Film} from './knife/Film';

const all: Record<string, React.FC<{frame: number}>> = {BrushTest, Drawing, Film};
export const render = (name: string, frame: number) => {
  const C = all[name];
  return renderToStaticMarkup(<C frame={frame} />);
};
