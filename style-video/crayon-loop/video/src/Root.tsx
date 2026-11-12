import React from 'react';
import {Composition} from 'remotion';
import {Scene} from './Scene';

// Measured from the reference: 1000x1000, 70 ms per frame = 100/7 fps.
export const FPS = 100 / 7;
export const RemotionRoot: React.FC = () => (
  <Composition id="TeaBreak" component={Scene} durationInFrames={72} fps={FPS} width={1000} height={1000} />
);
