import React from 'react';
import {Composition, useCurrentFrame} from 'remotion';
import {Scene} from './Scene';
import {Film, FILM_FPS, FILM_LEN} from './knife/Film';

// Measured from the reference: 1000x1000, 70 ms per frame = 100/7 fps.
export const FPS = 100 / 7;
const RubberKnife: React.FC = () => <Film frame={useCurrentFrame()} />;
export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="TeaBreak" component={Scene} durationInFrames={72} fps={FPS} width={1000} height={1000} />
    <Composition id="RubberKnife" component={RubberKnife} durationInFrames={FILM_LEN} fps={FILM_FPS} width={1000} height={1000} />
  </>
);
