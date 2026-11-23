import React from 'react';
import {C, F} from '../theme';
import {SNAPPY, useT} from '../hooks';
import {Pop, hexA} from './ui';

export const NoteList: React.FC<{
  items: string[];
  at?: number;
  color?: string;
}> = ({items, at = 1.2, color = C.coral}) => (
  <div style={{display: 'flex', flexDirection: 'column', gap: 17}}>
    {items.map((item, index) => (
      <Pop key={item} at={at + index * 0.18} y={18} config={SNAPPY}>
        <div style={{display: 'flex', alignItems: 'flex-start', gap: 14}}>
          <div
            style={{
              flex: '0 0 auto',
              width: 26,
              height: 26,
              borderRadius: 7,
              border: `1px solid ${hexA(color, 0.55)}`,
              background: hexA(color, 0.1),
              color,
              display: 'grid',
              placeItems: 'center',
              fontFamily: F.mono,
              fontSize: 11,
              fontWeight: 700,
              marginTop: 2,
            }}
          >
            {String(index + 1).padStart(2, '0')}
          </div>
          <div style={{fontFamily: F.body, fontSize: 19, lineHeight: 1.42, color: C.ink}}>{item}</div>
        </div>
      </Pop>
    ))}
  </div>
);

export const Callout: React.FC<{children: React.ReactNode; at?: number; tone?: string}> = ({
  children,
  at = 2.2,
  tone = C.coral,
}) => {
  const {sp} = useT();
  const p = sp(at, {damping: 20, stiffness: 90, mass: 1});
  return (
    <div
      style={{
        marginTop: 26,
        padding: '14px 18px',
        borderLeft: `3px solid ${tone}`,
        background: hexA(tone, 0.08),
        borderRadius: '0 8px 8px 0',
        fontFamily: F.mono,
        fontSize: 14,
        lineHeight: 1.45,
        color: C.muted,
        opacity: Math.min(1, p * 2),
        transform: `translateY(${(1 - p) * 16}px)`,
      }}
    >
      {children}
    </div>
  );
};
