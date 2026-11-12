import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {PAPER} from './brush';
import {Drawing} from './Drawing';

// The whole clip is a pure function of the frame number: see Drawing.tsx (the picture)
// and brush.tsx (the crayon). Vignette, paper grain and flicker were measured at ~0 on
// the reference, so the paper is a flat #fdfdfd.
export const Scene: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{backgroundColor: PAPER}}>
      <Drawing frame={frame} />
    </AbsoluteFill>
  );
};
