import '@fontsource/be-vietnam-pro/300.css';
import '@fontsource/be-vietnam-pro/500.css';
import '@fontsource/dancing-script/400.css';
import React from 'react';
import {Composition} from 'remotion';
import {Demo, FPS, TOTAL_SECONDS} from './Demo';
import {Photo, PHOTO_TOTAL} from './Photo';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="Demo"
      component={Demo}
      durationInFrames={TOTAL_SECONDS * FPS}
      fps={FPS}
      width={1280}
      height={720}
    />
    <Composition
      id="Photo"
      component={Photo}
      durationInFrames={PHOTO_TOTAL}
      fps={30}
      width={1920}
      height={1080}
    />
  </>
);
