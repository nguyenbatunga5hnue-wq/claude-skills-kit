import '@fontsource/be-vietnam-pro/300.css';
import '@fontsource/be-vietnam-pro/500.css';
import '@fontsource/dancing-script/400.css';
import React from 'react';
import {Composition} from 'remotion';
import {Demo, FPS, TOTAL_SECONDS} from './Demo';

export const RemotionRoot: React.FC = () => (
  <Composition
    id="Demo"
    component={Demo}
    durationInFrames={TOTAL_SECONDS * FPS}
    fps={FPS}
    width={1280}
    height={720}
  />
);
