import React, {useEffect, useState} from 'react';
import {
  AbsoluteFill,
  Easing,
  Sequence,
  continueRender,
  delayRender,
  interpolate,
  random,
  useCurrentFrame,
} from 'remotion';

export const FPS = 25;
export const TOTAL_SECONDS = 215;
const s = (sec: number) => Math.round(sec * FPS);

const C = {
  cream: '#EFE6D4',
  paper: '#F4EBDA',
  honey: '#C89B5A',
  brown: '#3B2A1E',
  darkBrown: '#1E1610',
  night: '#100C09',
  olive: '#7A7A4E',
  chalk: '#2F4A3A',
  flame: '#FFB34D',
  red: '#B5433A',
};
const SANS = '"Be Vietnam Pro", sans-serif';
const HAND = '"Dancing Script", cursive';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ease = Easing.bezier(0.33, 0, 0.2, 1);
const fade = (f: number, from: number, to: number, dur = 0.4) =>
  interpolate(f, [s(from), s(from + dur), s(to - dur), s(to)], [0, 1, 1, 0], clamp);
const ramp = (f: number, from: number, to: number, a = 0, b = 1) =>
  interpolate(f, [s(from), s(to)], [a, b], {...clamp, easing: ease});

/* ---------- Overlays ---------- */

const Grain: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{mixBlendMode: 'overlay', opacity: 0.16, pointerEvents: 'none'}}>
      <svg width="100%" height="100%">
        <filter id="g">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={f % 12} />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#g)" />
      </svg>
    </AbsoluteFill>
  );
};

const Vignette: React.FC = () => (
  <AbsoluteFill
    style={{background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)'}}
  />
);

const Bars: React.FC = () => (
  <>
    <div style={{position: 'absolute', top: 0, left: 0, right: 0, height: 56, background: '#000'}} />
    <div style={{position: 'absolute', bottom: 0, left: 0, right: 0, height: 56, background: '#000'}} />
    <div
      style={{
        position: 'absolute', top: 18, right: 28, fontFamily: SANS, fontWeight: 300, fontSize: 14,
        color: 'rgba(255,255,255,0.45)', letterSpacing: 2,
      }}
    >
      BẢN DEMO · HÌNH MINH HOẠ, CHƯA PHẢI CẢNH QUAY THẬT
    </div>
  </>
);

const SceneLabel: React.FC<{n: string; title: string; time: string; shoot: string}> = ({n, title, time, shoot}) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, s(0.6), s(4), s(5)], [0, 1, 1, 0.35], clamp);
  return (
    <div style={{position: 'absolute', top: 72, left: 40, opacity: o, fontFamily: SANS, color: '#fff'}}>
      <div style={{fontSize: 13, fontWeight: 500, letterSpacing: 3, opacity: 0.8}}>
        {n} · {time}
      </div>
      <div style={{fontSize: 22, fontWeight: 500, marginTop: 2, textShadow: '0 1px 6px rgba(0,0,0,.6)'}}>{title}</div>
      <div style={{fontSize: 13, fontWeight: 300, marginTop: 4, fontStyle: 'italic', opacity: 0.85, maxWidth: 520}}>
        Quay thật: {shoot}
      </div>
    </div>
  );
};

type Line = {from: number; to: number; text: string; who?: string; note?: string};
const Subs: React.FC<{lines: Line[]}> = ({lines}) => {
  const f = useCurrentFrame();
  return (
    <>
      {lines.map((l, i) => {
        const o = fade(f, l.from, l.to, 0.35);
        if (o <= 0) return null;
        return (
          <div
            key={i}
            style={{
              position: 'absolute', bottom: 78, left: 0, right: 0, textAlign: 'center', opacity: o,
              fontFamily: SANS, fontWeight: 300, color: 'rgba(255,255,255,0.95)', fontSize: 26,
              textShadow: '0 1px 8px rgba(0,0,0,0.85)', padding: '0 120px',
            }}
          >
            {l.who ? <span style={{fontSize: 15, opacity: 0.75, display: 'block', marginBottom: 4}}>{l.who}</span> : null}
            {l.text}
            {l.note ? <span style={{fontSize: 13, opacity: 0.6, display: 'block', marginTop: 4, fontStyle: 'italic'}}>{l.note}</span> : null}
          </div>
        );
      })}
    </>
  );
};

/* ---------- Props ---------- */

const OilLamp: React.FC<{lit: number; scale?: number}> = ({lit, scale = 1}) => {
  const f = useCurrentFrame();
  const flick = 1 + Math.sin(f * 0.9) * 0.05 + Math.sin(f * 2.3) * 0.03;
  return (
    <svg width={160 * scale} height={260 * scale} viewBox="0 0 160 260" style={{overflow: 'visible'}}>
      {lit > 0 && (
        <>
          <defs>
            <radialGradient id="lampGlow">
              <stop offset="0%" stopColor="#FFD08A" stopOpacity={0.75 * lit} />
              <stop offset="100%" stopColor="#FFB34D" stopOpacity={0} />
            </radialGradient>
          </defs>
          <circle cx="80" cy="95" r={230 * flick} fill="url(#lampGlow)" />
        </>
      )}
      <rect x="35" y="220" width="90" height="16" rx="6" fill="#6B4A2B" />
      <path d="M45 220 Q80 160 115 220 Z" fill="#8A6236" />
      <rect x="66" y="150" width="28" height="18" fill="#5A3E24" />
      <path d="M58 150 Q50 105 66 70 L94 70 Q110 105 102 150 Z" fill="rgba(235,225,205,0.35)" stroke="rgba(255,255,255,0.45)" strokeWidth="2" />
      {lit > 0 && (
        <g transform={`translate(80 128) scale(${lit * flick})`}>
          <path d="M0 -30 Q12 -8 7 6 Q0 14 -7 6 Q-12 -8 0 -30 Z" fill="#FFC966" />
          <path d="M0 -16 Q5 -4 3 4 Q0 8 -3 4 Q-5 -4 0 -16 Z" fill="#FFF3D1" />
        </g>
      )}
    </svg>
  );
};

const Candle: React.FC<{lit: number; x: number; y: number; size?: number}> = ({lit, x, y, size = 1}) => {
  const f = useCurrentFrame();
  const flick = 1 + Math.sin(f * 1.1 + x) * 0.07;
  return (
    <g transform={`translate(${x} ${y}) scale(${size})`}>
      {lit > 0 && <circle cx="0" cy="-18" r={70 * flick * lit} fill="url(#candleGlow)" />}
      <rect x="-9" y="0" width="18" height="10" rx="3" fill="rgba(220,210,190,0.5)" />
      <rect x="-7" y="-6" width="14" height="8" fill="#EDE3CF" />
      {lit > 0 && (
        <g transform={`translate(0 -10) scale(${lit * flick})`}>
          <path d="M0 -16 Q7 -4 4 3 Q0 7 -4 3 Q-7 -4 0 -16 Z" fill="#FFC966" />
          <path d="M0 -8 Q3 -2 2 2 Q0 4 -2 2 Q-3 -2 0 -8 Z" fill="#FFF3D1" />
        </g>
      )}
    </g>
  );
};

const Person: React.FC<{x: number; y: number; s?: number; color?: string; bun?: boolean}> = ({x, y, s: sc = 1, color = '#1A130E', bun}) => (
  <g transform={`translate(${x} ${y}) scale(${sc})`} fill={color}>
    <circle cx="0" cy="-70" r="26" />
    {bun && <circle cx="-18" cy="-88" r="12" />}
    <path d="M-55 0 Q-50 -42 0 -42 Q50 -42 55 0 Z" />
  </g>
);

const BWPortrait: React.FC<{gray: number; tint?: string}> = ({gray, tint = '#D9CBB0'}) => (
  <svg width="100%" height="100%" viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice"
    style={{filter: `grayscale(${gray}) sepia(${0.25 * (1 - gray)}) contrast(0.95)`}}>
    <rect width="400" height="500" fill={tint} />
    <rect x="0" y="0" width="400" height="300" fill="#4E6B57" />
    <text x="40" y="120" fontFamily={HAND} fontSize="44" fill="rgba(255,255,255,0.75)">a, ă, â…</text>
    <circle cx="200" cy="230" r="70" fill="#5B4636" />
    <path d="M70 500 Q80 330 200 320 Q320 330 330 500 Z" fill="#E8E1D2" />
    <circle cx="200" cy="240" r="58" fill="#C9A587" />
  </svg>
);

/* ---------- Scenes ---------- */

// 1. Nhà bà ngoại (25s)
const Scene1: React.FC = () => {
  const f = useCurrentFrame();
  const push = ramp(f, 14, 25, 1, 1.9);
  const flip1 = interpolate(f, [s(3), s(5)], [1, -1], clamp);
  const flip2 = interpolate(f, [s(6), s(8)], [1, -1], clamp);
  const lampHi = fade(f, 9, 13, 0.6);
  return (
    <AbsoluteFill style={{background: 'linear-gradient(180deg,#3A2B1F 0%,#2A1F16 100%)'}}>
      <AbsoluteFill style={{transform: `scale(${push})`, transformOrigin: '42% 66%'}}>
        <svg width="1280" height="720">
          <defs>
            <linearGradient id="win" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#F7EBD3" />
              <stop offset="1" stopColor="#E7CF9F" />
            </linearGradient>
          </defs>
          <rect x="760" y="70" width="420" height="470" fill="url(#win)" />
          <g stroke="#2A1F16" strokeWidth="14">
            <line x1="970" y1="70" x2="970" y2="540" />
            <line x1="760" y1="300" x2="1180" y2="300" />
            <rect x="760" y="70" width="420" height="470" fill="none" />
          </g>
          <polygon points="760,90 760,520 120,720 330,720" fill="#F7E3B8" opacity="0.13" />
          {Array.from({length: 26}).map((_, i) => {
            const px = 300 + random(`dx${i}`) * 520 + Math.sin((f + i * 20) / 40) * 12;
            const py = 200 + ((random(`dy${i}`) * 400 + f * 0.25) % 420);
            return <circle key={i} cx={px} cy={py} r={1.4} fill="#FFF1D0" opacity={0.5} />;
          })}
          <rect x="0" y="590" width="1280" height="130" fill="#4A3424" />
          <Person x={330} y={600} s={2.4} color="#17110C" bun />
          <g transform="translate(250 470)">
            <rect x="0" y="0" width="360" height="150" rx="6" fill="#E9DDC5" transform="skewX(-8)" />
            <line x1="170" y1="0" x2="160" y2="150" stroke="#B8A27F" strokeWidth="3" />
            <g transform={`translate(175 0) scale(${flip1} 1)`}>
              <rect x="0" y="0" width="170" height="150" fill="#E2D4B8" transform="skewX(-8)" />
            </g>
            <g transform={`translate(175 0) scale(${flip2} 1)`}>
              <rect x="0" y="0" width="170" height="150" fill="#E6D9BF" transform="skewX(-8)" />
            </g>
            <g transform="translate(195 18)">
              <foreignObject width="120" height="110">
                <div style={{width: 120, height: 110, overflow: 'hidden', border: '4px solid #fff'}}>
                  <BWPortrait gray={1} />
                </div>
              </foreignObject>
            </g>
          </g>
        </svg>
        <div style={{position: 'absolute', left: 1010, top: 360}}>
          <OilLamp lit={0} scale={0.9} />
          <div style={{
            position: 'absolute', left: -10, top: 250, opacity: lampHi, fontFamily: SANS, fontWeight: 300,
            fontSize: 15, color: '#F4E6C8', whiteSpace: 'nowrap',
          }}>đèn dầu của bà · chưa thắp</div>
        </div>
      </AbsoluteFill>
      <Subs lines={[
        {from: 2, to: 8, who: '(giọng bà)', text: '“Hồi ấy… tối nào bà cũng soạn bài bên cái đèn này.”', note: 'câu ví dụ, thay bằng câu bà thật sự nói'},
        {from: 15, to: 21, text: 'Nhà mình có ba thế hệ đứng lớp.'},
      ]} />
      <SceneLabel n="CẢNH 1" time="0:00" title="Nhà bà ngoại" shoot="bà lật album bên cửa sổ, đèn dầu chưa thắp" />
    </AbsoluteFill>
  );
};

// Chuyển cảnh 1: mặt bà trẻ → mặt mẹ (5s)
const Trans1: React.FC = () => {
  const f = useCurrentFrame();
  const z = ramp(f, 0, 5, 1, 1.25);
  const mix = ramp(f, 1.5, 4);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
        <div style={{width: 420, height: 525, position: 'relative', transform: `scale(${z})`, border: `${10 * (1 - mix)}px solid #fff`, boxSizing: 'border-box'}}>
          <div style={{position: 'absolute', inset: 0, opacity: 1 - mix}}><BWPortrait gray={1} /></div>
          <div style={{position: 'absolute', inset: 0, opacity: mix}}><BWPortrait gray={1 - mix} tint="#E3D2B4" /></div>
        </div>
      </AbsoluteFill>
      <div style={{position: 'absolute', top: 72, left: 40, fontFamily: SANS, fontWeight: 300, fontSize: 15, color: '#fff', opacity: 0.8}}>
        chuyển cảnh: gương mặt bà thời trẻ hoà vào gương mặt mẹ · đen trắng → màu phai
      </div>
    </AbsoluteFill>
  );
};

const WriteOn: React.FC<{text: string; start: number; dur: number; font?: string; size: number; color: string}> = ({text, start, dur, font = HAND, size, color}) => {
  const f = useCurrentFrame();
  const p = ramp(f, start, start + dur);
  return (
    <div style={{display: 'inline-block', position: 'relative'}}>
      <div style={{fontFamily: font, fontSize: size, color, whiteSpace: 'nowrap', clipPath: `inset(0 ${100 - p * 100}% 0 0)`}}>{text}</div>
    </div>
  );
};

// 2. Mẹ trên lớp (22s)
const Scene2: React.FC = () => {
  const f = useCurrentFrame();
  const close = ramp(f, 16, 21, 1, 2.1);
  return (
    <AbsoluteFill style={{background: '#D9C9A8', filter: 'sepia(0.35) saturate(0.75)'}}>
      <AbsoluteFill style={{transform: `scale(${close})`, transformOrigin: '38% 30%'}}>
        <div style={{position: 'absolute', left: 140, top: 90, width: 1000, height: 300, background: C.chalk, border: '14px solid #7B5A3A'}}>
          <div style={{position: 'absolute', left: 230, top: 70}}>
            <WriteOn text="Bài 10: …" start={9} dur={4} size={78} color="rgba(255,255,255,0.9)" />
          </div>
        </div>
        <svg width="1280" height="720" style={{position: 'absolute'}}>
          <Person x={250} y={560} s={1.9} color="#2A2019" />
          {Array.from({length: 3}).map((_, r) =>
            Array.from({length: 5}).map((__, c) => (
              <g key={`${r}-${c}`}>
                <Person x={420 + c * 160 + r * 20} y={570 + r * 60} s={0.7 + r * 0.12} color="#3C2E24" />
                <rect x={370 + c * 160 + r * 20} y={560 + r * 60} width={100 + r * 10} height={18} fill="#8B6A45" />
              </g>
            )),
          )}
        </svg>
      </AbsoluteFill>
      <Subs lines={[{from: 3, to: 8.5, text: 'Bà truyền cho mẹ. Mẹ truyền cho mình.'}]} />
      <SceneLabel n="CẢNH 2" time="0:30" title="Mẹ trên lớp" shoot="lớp tiểu học thật ở trường của mẹ; mẹ viết “Bài 10” bằng phấn" />
    </AbsoluteFill>
  );
};

// Chuyển cảnh 2: phấn → bút dạ (3s)
const Trans2: React.FC = () => {
  const f = useCurrentFrame();
  const cut = f >= s(1.2);
  return (
    <AbsoluteFill style={{background: cut ? '#F5F4EF' : C.chalk, filter: cut ? 'none' : 'sepia(0.35) saturate(0.75)'}}>
      <div style={{position: 'absolute', left: 260, top: 250}}>
        {!cut ? (
          <div style={{fontFamily: HAND, fontSize: 150, color: 'rgba(255,255,255,0.9)'}}>Bài 10:</div>
        ) : (
          <WriteOn text="Unit 10" start={1.2} dur={1.4} font={HAND} size={150} color="#1F3B73" />
        )}
      </div>
      <div style={{position: 'absolute', top: 72, left: 40, fontFamily: SANS, fontWeight: 300, fontSize: 15, color: cut ? '#333' : '#fff', opacity: 0.8}}>
        chuyển cảnh: nét phấn của mẹ → nét bút dạ của thầy, cùng góc máy, cùng tốc độ viết
      </div>
    </AbsoluteFill>
  );
};

const Panel: React.FC<{title: string; children: React.ReactNode; dur: number}> = ({title, children, dur}) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, s(0.4), s(dur - 0.4), s(dur)], [0, 1, 1, 0], clamp);
  const z = interpolate(f, [0, s(dur)], [1, 1.06]);
  return (
    <AbsoluteFill style={{opacity: o}}>
      <AbsoluteFill style={{transform: `scale(${z})`}}>{children}</AbsoluteFill>
      <div style={{position: 'absolute', right: 40, top: 80, fontFamily: SANS, fontWeight: 300, fontSize: 16, color: '#3B2A1E', background: 'rgba(244,235,218,0.85)', padding: '6px 12px', borderRadius: 4}}>
        {title}
      </div>
    </AbsoluteFill>
  );
};

// 3. Lớp học của thầy (30s)
const Scene3: React.FC = () => {
  const f = useCurrentFrame();
  const pull = ramp(f, 0, 3, 2.4, 1);
  const timer = Math.max(0, 40 * 60 - Math.floor((f - s(15)) * 20));
  const mm = String(Math.floor(timer / 60)).padStart(2, '0');
  const ss = String(timer % 60).padStart(2, '0');
  const warm = {background: 'linear-gradient(180deg,#E9DCC2,#D8C4A0)'};
  return (
    <AbsoluteFill style={warm}>
      <Sequence durationInFrames={s(5)}>
        <AbsoluteFill style={{transform: `scale(${pull})`, transformOrigin: '50% 30%'}}>
          <div style={{position: 'absolute', left: 240, top: 80, width: 800, height: 260, background: '#F5F4EF', border: '10px solid #B9B9B5'}}>
            <div style={{position: 'absolute', left: 30, top: 40, fontFamily: HAND, fontSize: 90, color: '#1F3B73'}}>Unit 10</div>
          </div>
          <svg width="1280" height="720" style={{position: 'absolute'}}>
            {Array.from({length: 7}).map((_, i) => <Person key={i} x={180 + i * 155} y={690} s={1.1} color="#4A382A" />)}
          </svg>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={s(5)} durationInFrames={s(5)}>
        <Panel title="Speaking: vấp, cả lớp cười, bạn ấy nói tiếp" dur={5}>
          <svg width="1280" height="720">
            <Person x={640} y={640} s={2.6} color="#3E2E22" />
            <rect x="720" y="170" width="380" height="120" rx="28" fill="#fff" />
            <text x="760" y="245" fontFamily={SANS} fontSize="40" fill="#333">Well… I think…</text>
            {Array.from({length: 9}).map((_, i) => (
              <circle key={i} cx={160 + i * 60} cy={560 - Math.abs(Math.sin((f + i * 6) / 4)) * 18} r="20" fill="#6B5444" />
            ))}
          </svg>
        </Panel>
      </Sequence>
      <Sequence from={s(10)} durationInFrames={s(5)}>
        <Panel title="Thầy cúi xuống bàn một học sinh, chỉ vào vở, gật đầu" dur={5}>
          <svg width="1280" height="720">
            <rect x="380" y="260" width="520" height="340" fill="#FBF6EA" stroke="#C9B89A" />
            {Array.from({length: 8}).map((_, i) => <line key={i} x1="410" y1={310 + i * 34} x2={860} y2={310 + i * 34} stroke="#B9C7D9" />)}
            <text x="420" y="345" fontFamily={HAND} fontSize="30" fill="#2A3E66">Some people believe that…</text>
            <path d={`M740 470 l30 30 l60 -70`} stroke={C.red} strokeWidth="9" fill="none" strokeDasharray="140" strokeDashoffset={140 - ramp(f, 12, 13.2, 0, 140)} />
          </svg>
        </Panel>
      </Sequence>
      <Sequence from={s(15)} durationInFrames={s(5)}>
        <Panel title="Đồng hồ đếm ngược Writing, cả lớp cắm cúi viết" dur={5}>
          <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
            <div style={{fontFamily: SANS, fontWeight: 500, fontSize: 170, color: C.brown, letterSpacing: 6}}>{mm}:{ss}</div>
            <div style={{fontFamily: SANS, fontWeight: 300, fontSize: 28, color: C.brown}}>Writing Task 2</div>
          </AbsoluteFill>
        </Panel>
      </Sequence>
      <Sequence from={s(20)} durationInFrames={s(5)}>
        <Panel title="Khoảnh khắc riêng của lớp bạn: một câu đùa, một trò chơi" dur={5}>
          <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
            <div style={{width: 760, height: 380, border: '3px dashed #8A7558', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SANS, fontWeight: 300, fontSize: 30, color: '#6B5843'}}>
              [ cảnh riêng của lớp bạn ]
            </div>
          </AbsoluteFill>
        </Panel>
      </Sequence>
      <Sequence from={s(25)} durationInFrames={s(5)}>
        <Panel title="Học sinh giơ tay: một, rồi gần như cả lớp" dur={5}>
          <svg width="1280" height="720">
            {Array.from({length: 9}).map((_, i) => {
              const up = ramp(f, 25.5 + (i === 4 ? 0 : 1.2 + i * 0.12), 26.3 + (i === 4 ? 0 : 1.2 + i * 0.12));
              return (
                <g key={i}>
                  <rect x={150 + i * 115} y={560 - up * 220} width="26" height={up * 220} rx="13" fill="#6B5444" />
                  <Person x={163 + i * 115} y={690} s={0.9} color="#4A382A" />
                </g>
              );
            })}
          </svg>
        </Panel>
      </Sequence>
      <Subs lines={[
        {from: 5.5, to: 12, text: 'Lớp của mình không có phấn trắng, bảng đen.'},
        {from: 13, to: 21, text: 'Nhưng có những đứa trẻ dám nói, dám sai, và dám cười thật to.'},
      ]} />
      <SceneLabel n="CẢNH 3" time="0:55" title="Lớp học của thầy" shoot="4–5 khoảnh khắc thật ở lớp IELTS, mỗi cảnh 3–5 giây" />
    </AbsoluteFill>
  );
};

// 4. Những đêm không ai thấy (17s)
const Scene4: React.FC = () => {
  const f = useCurrentFrame();
  const dim = interpolate(f, [s(11), s(17)], [1, 0.7], clamp);
  return (
    <AbsoluteFill style={{background: C.night}}>
      <svg width="1280" height="720">
        <defs>
          <radialGradient id="deskLight" cx="50%" cy="10%" r="80%">
            <stop offset="0%" stopColor="#FFDFA6" stopOpacity={0.55 * dim} />
            <stop offset="100%" stopColor="#FFDFA6" stopOpacity="0" />
          </radialGradient>
        </defs>
        <polygon points="560,120 720,120 1100,640 180,640" fill="url(#deskLight)" />
        <path d="M600 80 L680 80 L720 130 L560 130 Z" fill="#2B2A28" />
        <rect x="630" y="20" width="10" height="70" fill="#2B2A28" />
        <rect x="100" y="600" width="1080" height="70" fill="#2A1E15" />
        {Array.from({length: 9}).map((_, i) => (
          <rect key={i} x={430 + (i % 2) * 6} y={590 - i * 9} width="260" height="9" fill={i % 2 ? '#EDE5D3' : '#E3D9C4'} />
        ))}
        <line x1="720" y1="560" x2="840" y2="520" stroke={C.red} strokeWidth="9" strokeLinecap="round" />
        <rect x="860" y="540" width="170" height="60" rx="10" fill="#6E6A5E" />
        <text x="878" y="582" fontFamily={SANS} fontSize="22" fill="#CFCABB">cơm nguội</text>
        <Person x={330} y={600} s={2} color="#0B0806" />
      </svg>
      <div style={{position: 'absolute', right: 120, top: 150, fontFamily: SANS, fontWeight: 500, fontSize: 64, color: '#E5604D', opacity: 0.85}}>01:12</div>
      <Subs lines={[
        {from: 2, to: 9, text: 'Cũng có những đêm chấm bài đến sáng, những bữa cơm nguội lúc nào không hay.'},
        {from: 10, to: 16.5, text: 'Có lúc mình tự hỏi, ngọn lửa trong mình còn đủ không.'},
      ]} />
      <SceneLabel n="CẢNH 4" time="1:25" title="Những đêm không ai thấy" shoot="đồng hồ khuya, chồng bài, bút đỏ, hộp cơm nguội, thầy xoa thái dương" />
    </AbsoluteFill>
  );
};

// 5. Hộp quà của học trò (33s)
const Scene5: React.FC = () => {
  const f = useCurrentFrame();
  const open = ramp(f, 1, 3.5);
  const pan = ramp(f, 4, 16, 0, -420);
  const cardIn = ramp(f, 17, 19);
  const cardOpen = ramp(f, 19.5, 21);
  const back = ramp(f, 27, 29);
  const items = ['#D98E73', '#9DB0A0', '#E4C27A', '#B7A3C9', '#E9D7B5', '#8FA6BF', '#D7B48A', '#C27F68'];
  return (
    <AbsoluteFill style={{background: '#1A130E'}}>
      <AbsoluteFill style={{opacity: 1 - back}}>
        <svg width="1280" height="720">
          <defs>
            <radialGradient id="cabGlow" cx="50%" cy="50%" r="60%">
              <stop offset="0%" stopColor="#FFDFA6" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#FFDFA6" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="1280" height="720" fill="url(#cabGlow)" />
          <g transform={`translate(${pan} 0)`}>
            <rect x="180" y="110" width="1320" height="520" fill="#4A3424" />
            {[0, 1, 2].map((r) => <rect key={r} x="180" y={270 + r * 170} width="1320" height="12" fill="#2E2016" />)}
            {Array.from({length: 24}).map((_, i) => {
              const row = i % 3;
              const col = Math.floor(i / 3);
              const x = 220 + col * 160;
              const y = 270 + row * 170;
              const c = items[i % items.length];
              const kind = i % 4;
              if (kind === 0) return <rect key={i} x={x} y={y - 110} width="90" height="110" fill={c} transform={`rotate(-4 ${x} ${y})`} />;
              if (kind === 1) return <polygon key={i} points={`${x},${y} ${x + 60},${y - 60} ${x + 120},${y} ${x + 60},${y - 25}`} fill={c} />;
              if (kind === 2) return <rect key={i} x={x} y={y - 120} width="100" height="120" fill="#F4EBDA" stroke={c} strokeWidth="8" />;
              return <rect key={i} x={x} y={y - 80} width="110" height="80" rx="6" fill={c} />;
            })}
          </g>
          <rect x="180" y="110" width={660 * (1 - open)} height="520" fill="#5C412C" stroke="#2E2016" strokeWidth="4" />
          <rect x={840 + 660 * open} y="110" width={660 * (1 - open)} height="520" fill="#5C412C" stroke="#2E2016" strokeWidth="4" />
        </svg>
        {cardIn > 0 && (
          <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: cardIn, background: `rgba(10,7,5,${0.6 * cardIn})`}}>
            <div style={{display: 'flex', transform: `scale(${0.6 + 0.4 * cardIn})`}}>
              <div style={{width: 340, height: 420, background: '#E7B9A6', transformOrigin: 'right center', transform: `perspective(1200px) rotateY(${-180 * (1 - cardOpen)}deg)`}} />
              <div style={{width: 340, height: 420, background: '#FBF4E6', padding: 34, boxSizing: 'border-box', display: 'flex', alignItems: 'center'}}>
                <div style={{opacity: cardOpen}}>
                  <WriteOn text="Thank you for" start={21.5} dur={1.6} size={40} color="#2C3A63" />
                  <WriteOn text="never giving up" start={23.1} dur={1.6} size={40} color="#2C3A63" />
                  <WriteOn text="on me." start={24.7} dur={0.8} size={40} color="#2C3A63" />
                </div>
              </div>
            </div>
          </AbsoluteFill>
        )}
      </AbsoluteFill>
      <AbsoluteFill style={{opacity: back, background: C.night}}>
        <svg width="1280" height="720">
          <polygon points="560,120 720,120 1100,640 180,640" fill="#FFDFA6" opacity="0.18" />
          {Array.from({length: 9}).map((_, i) => <rect key={i} x={430} y={590 - i * 9} width="260" height="9" fill="#E8DFCB" />)}
          <rect x="730" y="470" width="130" height="160" fill="#E7B9A6" transform="rotate(8 795 550)" />
          <line x1="560" y1="540" x2="680" y2="500" stroke={C.red} strokeWidth="9" strokeLinecap="round" />
        </svg>
      </AbsoluteFill>
      <Subs lines={[
        {from: 5, to: 11, text: 'Mỗi món quà là một khoá học, một lứa học trò.'},
        {from: 11.5, to: 15.5, text: 'Mình giữ hết.'},
        {from: 28, to: 32.5, text: 'Vì những đêm như thế này, mình lại mở ra đọc.'},
      ]} />
      <SceneLabel n="CẢNH 5" time="1:42" title="Hộp quà của học trò" shoot="mở tủ quà, lướt chậm 5–6 món, đọc một tấm thiệp thật, đặt nó cạnh chồng bài" />
    </AbsoluteFill>
  );
};

// 6. Lời chúc của học trò (45s)
const WISHES = [
  {tag: 'Khoá 2025 · học sinh hiện tại', text: 'Em nhớ nhất hôm thầy cho cả lớp thi nói mà ai cũng run.', voice: false},
  {tag: 'Khoá 2024', text: 'Thầy bảo: sai cũng được, miễn là dám nói. Em vẫn nhớ.', voice: false},
  {tag: 'Khoá 2023 · tin nhắn thoại', text: 'Nhờ thầy mà em không còn sợ tiếng Anh nữa.', voice: true},
  {tag: 'Khoá 2022 · đang du học', text: 'Giờ em ở xa, nhưng mỗi lần thuyết trình em lại nhớ lớp mình.', voice: false},
  {tag: 'Khoá 2021 · đã đi làm', text: 'Cảm ơn thầy vì chưa bao giờ bỏ cuộc với em.', voice: false},
  {tag: 'Khoá 2020 · tin nhắn thoại', text: 'Chúc thầy 20/11 thật vui, thật khoẻ.', voice: true},
  {tag: 'Khoá 2019', text: 'Em thương thầy.', voice: false},
];
const WishCard: React.FC<{i: number}> = ({i}) => {
  const f = useCurrentFrame();
  const w = WISHES[i];
  const hue = ['#CDB89A', '#B9C0A8', '#C9B1A0', '#AFBCC4', '#D2BE9C', '#BFB5A8', '#D6C2A6'][i];
  return (
    <AbsoluteFill style={{background: `linear-gradient(160deg, ${hue}, #8C7A64)`}}>
      {w.voice ? (
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', background: 'rgba(30,22,16,0.55)'}}>
          <svg width="700" height="160">
            {Array.from({length: 60}).map((_, k) => {
              const h = 12 + Math.abs(Math.sin(k * 0.7 + f * 0.35)) * 90 * (0.4 + random(`w${i}${k}`) * 0.6);
              return <rect key={k} x={k * 11.6} y={80 - h / 2} width="6" height={h} rx="3" fill="#F2E6CF" />;
            })}
          </svg>
          <div style={{fontFamily: SANS, fontWeight: 300, fontSize: 16, color: '#F2E6CF', marginTop: 10}}>tin nhắn thoại trên hình lớp học vắng</div>
        </AbsoluteFill>
      ) : (
        <svg width="1280" height="720"><Person x={640} y={720} s={4.2} color="rgba(40,30,22,0.75)" /></svg>
      )}
      <div style={{position: 'absolute', left: 40, bottom: 140, fontFamily: SANS, fontWeight: 500, fontSize: 16, color: '#fff', background: 'rgba(0,0,0,0.35)', padding: '4px 10px'}}>{w.tag}</div>
    </AbsoluteFill>
  );
};
const Scene6: React.FC = () => {
  const lines: Line[] = WISHES.map((w, i) => ({from: 3 + i * 6, to: 3 + i * 6 + 5.6, text: `“${w.text}”`, note: i === 0 ? 'lời mẫu, thay bằng lời chúc thật của học trò' : undefined}));
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Sequence durationInFrames={s(3)}>
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
          <div style={{fontFamily: SANS, fontWeight: 300, fontSize: 30, color: '#EDE3CF', opacity: fade(useCurrentFrame(), 0, 3, 0.6)}}>lời chúc của các em</div>
        </AbsoluteFill>
      </Sequence>
      {WISHES.map((_, i) => (
        <Sequence key={i} from={s(3 + i * 6)} durationInFrames={s(6)}>
          <WishCard i={i} />
        </Sequence>
      ))}
      <Subs lines={lines} />
      <SceneLabel n="CẢNH 6" time="2:15" title="Lời chúc của học trò" shoot="video học sinh tự quay (ngang), em nào ngại thì gửi tin nhắn thoại" />
    </AbsoluteFill>
  );
};

// 7. Ngọn nến (15s)
const CANDLES = Array.from({length: 14}).map((_, i) => {
  const t = i / 13;
  return {x: 200 + t * 880, y: 470 + Math.sin(t * Math.PI) * -60 + (i % 2) * 30};
});
const Scene7: React.FC = () => {
  const f = useCurrentFrame();
  const enter = ramp(f, 0, 3.5, -100, 560);
  const lightsOn = ramp(f, 11.8, 12.3);
  return (
    <AbsoluteFill style={{background: C.night}}>
      <svg width="1280" height="720">
        <defs>
          <radialGradient id="candleGlow">
            <stop offset="0%" stopColor="#FFD08A" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#FFB34D" stopOpacity="0" />
          </radialGradient>
        </defs>
        {CANDLES.map((c, i) => {
          const order = Math.abs(i - 6);
          const lit = ramp(f, 4.2 + order * 0.5, 4.6 + order * 0.5);
          return (
            <g key={i}>
              <g opacity={0.25 + 0.75 * lit}>
                <Person x={c.x} y={c.y - 22} s={0.75} color={`rgb(${30 + 60 * lit},${22 + 36 * lit},${16 + 20 * lit})`} />
              </g>
              <Candle lit={lit} x={c.x} y={c.y} size={1.2} />
            </g>
          );
        })}
        <g opacity={interpolate(f, [0, s(1)], [0, 0.9], clamp)}>
          <Person x={enter - 10} y={600} s={1.6} color="#0B0806" />
        </g>
        <Candle lit={1} x={enter + 40} y={520} size={1.6} />
      </svg>
      <AbsoluteFill style={{background: '#F3DEB4', opacity: lightsOn * 0.92}} />
      {lightsOn > 0 && (
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: lightsOn}}>
          <svg width="1280" height="720" style={{position: 'absolute'}}>
            {Array.from({length: 9}).map((_, i) => <Person key={i} x={170 + i * 118} y={720} s={1.5} color="#6B5444" />)}
          </svg>
          <div style={{fontFamily: HAND, fontSize: 96, color: C.brown, marginTop: -120}}>Happy Teachers&apos; Day!</div>
        </AbsoluteFill>
      )}
      <Subs lines={[
        {from: 6, to: 9, text: 'Mình cứ nghĩ, thầy là người thắp lửa…'},
        {from: 9.2, to: 11.8, text: '…hoá ra chính các em đã sưởi ấm lại cho mình.'},
      ]} />
      <SceneLabel n="CẢNH 7" time="3:00" title="Ngọn nến · cảnh nối" shoot="phòng tối, thầy châm nến cho một em, lửa lan ra cả lớp, đèn bật" />
    </AbsoluteFill>
  );
};

// Chuyển cảnh 3: chụp ảnh (3s)
const Trans3: React.FC = () => {
  const f = useCurrentFrame();
  const flash = interpolate(f, [s(0.2), s(0.35), s(1)], [0, 1, 0], clamp);
  const shrink = ramp(f, 1.2, 2.8, 1, 0.42);
  const rot = ramp(f, 1.2, 2.8, 0, -4);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <AbsoluteFill style={{transform: `scale(${shrink}) rotate(${rot}deg)`, border: `${(1 - shrink) * 40}px solid #fff`, boxSizing: 'border-box', background: '#F3DEB4'}}>
        <svg width="1280" height="720">{Array.from({length: 9}).map((_, i) => <Person key={i} x={170 + i * 118} y={720} s={1.5} color="#6B5444" />)}</svg>
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
          <div style={{fontFamily: HAND, fontSize: 96, color: C.brown, marginTop: -120}}>Happy Teachers&apos; Day!</div>
        </AbsoluteFill>
      </AbsoluteFill>
      <AbsoluteFill style={{background: '#fff', opacity: flash}} />
      <div style={{position: 'absolute', top: 72, left: 40, fontFamily: SANS, fontWeight: 300, fontSize: 15, color: '#fff', opacity: 0.8}}>
        chuyển cảnh: tiếng màn trập, loé trắng → thành tấm ảnh in thật
      </div>
    </AbsoluteFill>
  );
};

// 8. Kết, về lại với bà (17s)
const Scene8: React.FC = () => {
  const f = useCurrentFrame();
  const intoAlbum = ramp(f, 3.5, 6.5);
  const panToLamp = ramp(f, 9.5, 11.5, 0, -620);
  const lampOn = ramp(f, 10, 11);
  const toBlack = ramp(f, 12.6, 13.2);
  const t1 = fade(f, 13.4, 17, 0.6);
  const t2 = fade(f, 14.6, 17, 0.6);
  return (
    <AbsoluteFill style={{background: '#2A1F16'}}>
      <AbsoluteFill style={{transform: `translateX(${panToLamp}px)`}}>
        <svg width="1900" height="720">
          <rect x="0" y="0" width="1900" height="720" fill="#33261B" />
          <rect x="140" y="300" width="760" height="330" fill="#E9DDC5" />
          <line x1="520" y1="300" x2="520" y2="630" stroke="#B8A27F" strokeWidth="3" />
          <rect x="180" y="340" width="140" height="110" fill="#fff" />
          <rect x="190" y="350" width="120" height="90" fill="#9C9C9C" />
          <rect x="340" y="340" width="140" height="110" fill="#fff" />
          <rect x="350" y="350" width="120" height="90" fill="#A8A29A" />
          <rect x="180" y="470" width="140" height="110" fill="#fff" />
          <rect x="190" y="480" width="120" height="90" fill="#B1A493" />
          <rect x="1000" y="610" width="900" height="110" fill="#4A3424" />
        </svg>
        <div style={{
          position: 'absolute',
          left: interpolate(intoAlbum, [0, 1], [380, 600]),
          top: interpolate(intoAlbum, [0, 1], [130, 335]),
          width: interpolate(intoAlbum, [0, 1], [380, 240]),
          height: interpolate(intoAlbum, [0, 1], [270, 170]),
          background: '#fff', padding: 8, boxSizing: 'border-box',
          transform: `rotate(${interpolate(intoAlbum, [0, 1], [-6, 0])}deg)`,
          boxShadow: '0 8px 20px rgba(0,0,0,0.35)',
        }}>
          <div style={{width: '100%', height: '100%', background: '#F3DEB4', overflow: 'hidden', position: 'relative'}}>
            <div style={{position: 'absolute', bottom: 6, width: '100%', textAlign: 'center', fontFamily: HAND, fontSize: 18, color: C.brown}}>Happy Teachers&apos; Day!</div>
          </div>
        </div>
        <div style={{position: 'absolute', left: 640, top: 525}}>
          <WriteOn text="20/11/2026" start={7} dur={2} size={40} color="#2C3A63" />
        </div>
        <div style={{position: 'absolute', left: 1330, top: 330}}>
          <OilLamp lit={lampOn} scale={1.1} />
        </div>
        {intoAlbum < 1 && (
          <svg width="1280" height="720" style={{position: 'absolute', opacity: 1 - intoAlbum}}>
            <ellipse cx="400" cy="420" rx="60" ry="34" fill="#B98D6E" />
            <ellipse cx="760" cy="420" rx="60" ry="34" fill="#B98D6E" />
          </svg>
        )}
      </AbsoluteFill>
      <AbsoluteFill style={{background: '#000', opacity: toBlack, alignItems: 'center', justifyContent: 'center', flexDirection: 'column'}}>
        <div style={{fontFamily: SANS, fontWeight: 300, fontSize: 40, color: '#F1E6D0', opacity: t1, letterSpacing: 1}}>Ba thế hệ. Một ngọn lửa.</div>
        <div style={{fontFamily: SANS, fontWeight: 300, fontSize: 22, color: '#CDBFA6', opacity: t2, marginTop: 22}}>gửi bà, gửi mẹ, và gửi các em · 20.11.2026</div>
      </AbsoluteFill>
      {toBlack < 1 && <SceneLabel n="CẢNH 8" time="3:18" title="Kết · về lại với bà" shoot="bà cầm ảnh lớp, nhét vào album, ghi 20/11/2026; máy lia sang đèn dầu đã thắp" />}
    </AbsoluteFill>
  );
};

/* ---------- Timeline ---------- */

const TIMELINE: [number, number, React.FC][] = [
  [0, 25, Scene1],
  [25, 5, Trans1],
  [30, 22, Scene2],
  [52, 3, Trans2],
  [55, 30, Scene3],
  [85, 17, Scene4],
  [102, 33, Scene5],
  [135, 45, Scene6],
  [180, 15, Scene7],
  [195, 3, Trans3],
  [198, 17, Scene8],
];

export const Demo: React.FC = () => {
  const [handle] = useState(() => delayRender('fonts'));
  useEffect(() => {
    document.fonts.ready.then(() => continueRender(handle));
  }, [handle]);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {TIMELINE.map(([from, dur, Comp], i) => (
        <Sequence key={i} from={s(from)} durationInFrames={s(dur)}>
          <Comp />
        </Sequence>
      ))}
      <Vignette />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0) 70%, rgba(0,0,0,0.5) 100%)'}} />
      <Grain />
      <Bars />
    </AbsoluteFill>
  );
};
