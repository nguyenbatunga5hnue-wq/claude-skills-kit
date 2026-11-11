import React, {useEffect, useState} from 'react';
import {
  AbsoluteFill, Audio, Img, OffthreadVideo, interpolate, spring,
  staticFile, useCurrentFrame, useVideoConfig, Sequence, delayRender, continueRender,
} from 'remotion';

// Clip plays, then its last frame "prints" into a photo you could hold.
export const CLIP_FRAMES = 207;   // frames of lop.mp4 to play (30 fps)
export const TAIL_FRAMES = 135;   // photo segment length
export const PHOTO_TOTAL = CLIP_FRAMES + TAIL_FRAMES;

const IMG_W = 1152;               // photo image size in the final layout
const IMG_H = 648;
const B = 30;                     // white border, sides and top
const BB = 120;                   // wider bottom border, for the date
const CARD_W = IMG_W + 2 * B;
const CARD_H = IMG_H + B + BB;

const PhotoTail: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: f - 3, fps, config: {damping: 200, mass: 1.1}, durationInFrames: 42});

  // Start: image fills the screen exactly. End: card centered, tilted.
  const s = interpolate(p, [0, 1], [1920 / IMG_W, 1]);
  const imgOffsetY = (BB - B) / 2;              // image centre sits above card centre
  const ty = interpolate(p, [0, 1], [imgOffsetY, -10]);
  const t = f / fps;
  const settle = interpolate(f, [30, 60], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const rot = interpolate(p, [0, 1], [0, -3]) + settle * 0.45 * Math.sin(t * 1.1);
  const floatY = settle * 5 * Math.sin(t * 1.4 + 0.6);
  const floatX = settle * 3 * Math.sin(t * 0.8);

  const flash = interpolate(f, [0, 2, 12], [0, 0.9, 0], {extrapolateRight: 'clamp'});
  const sepia = interpolate(f, [10, 70], [0, 0.22], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const sheenX = interpolate(f, [28, 62], [-40, 140], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const caption = interpolate(f, [34, 58], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const fadeOut = interpolate(f, [TAIL_FRAMES - 20, TAIL_FRAMES], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill style={{backgroundColor: '#0d0a07'}}>
      {/* background: same picture, blurred, dark and warm */}
      <AbsoluteFill style={{opacity: p}}>
        <Img src={staticFile('lop-cuoi.png')} style={{
          width: '100%', height: '100%', objectFit: 'cover',
          filter: 'blur(28px) brightness(0.38) sepia(0.5) saturate(0.8)', transform: 'scale(1.12)',
        }} />
        <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 35%, rgba(8,5,2,0.75) 100%)'}} />
      </AbsoluteFill>

      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
        <div style={{
          width: CARD_W, height: CARD_H, position: 'relative',
          backgroundColor: '#f4efe4',
          transform: `translate(${floatX}px, ${ty + floatY}px) scale(${s}) rotate(${rot}deg)`,
          boxShadow: `0 ${30 * p}px ${70 * p}px rgba(0,0,0,${0.6 * p}), 0 ${4 * p}px ${10 * p}px rgba(0,0,0,${0.35 * p})`,
        }}>
          <div style={{position: 'absolute', left: B, top: B, width: IMG_W, height: IMG_H, overflow: 'hidden'}}>
            <Img src={staticFile('lop-cuoi.png')} style={{
              width: '100%', height: '100%', objectFit: 'cover',
              filter: `sepia(${sepia}) contrast(${1 - sepia * 0.2}) brightness(${1 + sepia * 0.08})`,
            }} />
            {/* glossy sheen sweeping once across the print */}
            <div style={{
              position: 'absolute', inset: 0,
              background: `linear-gradient(115deg, rgba(255,255,255,0) ${sheenX - 18}%, rgba(255,255,255,0.22) ${sheenX}%, rgba(255,255,255,0) ${sheenX + 18}%)`,
            }} />
            <div style={{position: 'absolute', inset: 0, boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.12)'}} />
          </div>
          <div style={{
            position: 'absolute', left: 0, right: 0, bottom: 0, height: BB,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: '"Dancing Script", cursive', fontSize: 64, color: '#3b2f25', opacity: caption,
          }}>
            20 · 11 · 2026
          </div>
        </div>
      </AbsoluteFill>

      <AbsoluteFill style={{backgroundColor: 'white', opacity: flash}} />
      <AbsoluteFill style={{backgroundColor: 'black', opacity: fadeOut}} />
    </AbsoluteFill>
  );
};

export const Photo: React.FC = () => {
  const [handle] = useState(() => delayRender('fonts'));
  useEffect(() => {
    document.fonts.load('64px "Dancing Script"').then(() => continueRender(handle));
  }, [handle]);
  return (
  <AbsoluteFill style={{backgroundColor: 'black'}}>
    <Sequence durationInFrames={CLIP_FRAMES}>
      <OffthreadVideo src={staticFile('lop.mp4')} />
    </Sequence>
    <Sequence from={CLIP_FRAMES}>
      <PhotoTail />
      <Audio src={staticFile('shutter.wav')} />
    </Sequence>
  </AbsoluteFill>
  );
};
