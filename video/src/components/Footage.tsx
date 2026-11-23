import React from 'react';
import {Img, OffthreadVideo, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {C, F} from '../theme';
import {useT} from '../hooks';
import {hexA} from './ui';

const SOURCE_FPS = 25;

export const Footage: React.FC<{
  clip: string;
  start: number;
  end: number;
  rate?: number;
  zoom?: number;
  anchor?: 'top' | 'center';
  stamp?: string;
  stampTone?: 'red' | 'green' | 'cyan';
  stampAt?: number;
}> = ({clip, start, end, rate = 1, zoom = 1.1, anchor = 'top', stamp, stampTone = 'red', stampAt = 1.4}) => {
  const frame = useCurrentFrame();
  const {sp, at} = useT();
  const stampPop = sp(stampAt, {damping: 11, stiffness: 190, mass: 0.7});
  const tone = stampTone === 'red' ? C.red : stampTone === 'green' ? C.green : C.cyan;
  const poster = clip.replace(/\.webm$/, '-end.jpg');
  const mediaStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transform: `scale(${zoom})`,
    transformOrigin: anchor === 'top' ? 'center top' : 'center center',
    filter: 'saturate(0.94) contrast(1.02)',
  };
  return (
    <div
      style={{
        width: 1240,
        borderRadius: 18,
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.16)',
        background: '#0d1822',
        boxShadow: '0 40px 100px rgba(0,0,0,0.55), 0 0 0 1px rgba(0,0,0,0.4)',
      }}
    >
      <div
        style={{
          height: 42,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '0 16px',
          background: '#132432',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div style={{display: 'flex', gap: 7}}>
          {['#ff6b6b', '#f4c45e', '#5dd6a4'].map((color) => (
            <div key={color} style={{width: 9, height: 9, borderRadius: 9, background: color, opacity: 0.8}} />
          ))}
        </div>
        <div
          style={{
            flex: 1,
            marginLeft: 8,
            marginRight: 8,
            padding: '4px 14px',
            borderRadius: 8,
            background: 'rgba(255,255,255,0.06)',
            fontFamily: F.mono,
            fontSize: 13,
            color: C.muted,
          }}
        >
          localhost:5173 · Agent Undercover workbench
        </div>
        <div
          style={{
            fontFamily: F.mono,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 1.4,
            color: C.cyan,
          }}
        >
          FIXTURE
        </div>
      </div>
      <div style={{position: 'relative', height: 858, overflow: 'hidden', background: '#f6f3ea'}}>
        <Img src={staticFile(poster)} style={mediaStyle} />
        <OffthreadVideo
          src={staticFile(clip)}
          startFrom={Math.round(start * SOURCE_FPS)}
          endAt={Math.round(end * SOURCE_FPS)}
          playbackRate={rate}
          muted
          style={mediaStyle}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            boxShadow: 'inset 0 0 100px rgba(7,21,33,0.16)',
          }}
        />
        {stamp ? (
          <div
            style={{
              position: 'absolute',
              left: 28,
              bottom: 26,
              padding: '12px 20px',
              border: `2px solid ${tone}`,
              borderRadius: 8,
              color: tone,
              background: hexA(C.bg, 0.78),
              fontFamily: F.mono,
              fontSize: 20,
              fontWeight: 700,
              letterSpacing: 3,
              transform: `rotate(-4deg) scale(${interpolate(stampPop, [0, 1], [1.8, 1])})`,
              opacity: Math.min(1, stampPop * 3),
              boxShadow: `0 0 30px ${hexA(tone, 0.2)}`,
            }}
          >
            {stamp}
          </div>
        ) : null}
        <div
          style={{
            position: 'absolute',
            right: 18,
            bottom: 15,
            fontFamily: F.mono,
            fontSize: 11,
            color: 'rgba(255,255,255,0.48)',
            letterSpacing: 1,
            opacity: interpolate(frame, [at(0), at(0.4)], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }),
          }}
        >
          RECORDED FROM THE RUNNING APP · 1440×1000
        </div>
      </div>
    </div>
  );
};
