import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {Chip, Pop, Title, hexA} from '../components/ui';
import {C, F} from '../theme';
import {BRAND} from '../config';
import {SOFT, useT} from '../hooks';

export const Outro: React.FC = () => {
  const {sp, frame} = useT();
  const logo = sp(0.15, SOFT);
  const ring = (frame % 70) / 70;
  return (
    <AbsoluteFill style={{padding: '0 130px', flexDirection: 'row', alignItems: 'center', gap: 100}}>
      <div style={{flex: 0.72, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26}}>
        <div style={{position: 'relative'}}>
          <div
            style={{
              position: 'absolute',
              inset: -34 - ring * 46,
              borderRadius: 48,
              border: `2px solid ${hexA(C.coral, 0.42 * (1 - ring))}`,
            }}
          />
          <div
            style={{
              position: 'relative',
              width: 270,
              height: 270,
              borderRadius: 36,
              background: '#faf8f2',
              display: 'grid',
              placeItems: 'center',
              transform: `scale(${0.55 + 0.45 * logo}) rotate(${(1 - logo) * -8}deg)`,
              opacity: Math.min(1, logo * 1.5),
              boxShadow: `0 30px 90px rgba(0,0,0,0.5), 0 0 120px ${hexA(C.coral, 0.38)}`,
            }}
          >
            {BRAND.logo ? (
              <Img src={staticFile(BRAND.logo)} style={{width: 210, height: 210, objectFit: 'contain'}} />
            ) : (
              <div style={{fontFamily: F.display, fontSize: 40, fontWeight: 800, color: C.navy}}>{BRAND.name}</div>
            )}
          </div>
        </div>
        <div style={{fontFamily: F.mono, fontSize: 13, letterSpacing: 3, color: C.coral}}>AGENT UNDERCOVER</div>
      </div>

      <div style={{flex: 1.28, display: 'flex', flexDirection: 'column', gap: 34}}>
        <Title text="Test the boundary before you [trust] the agent." at={0.3} size={82} />
        <Pop at={1.2} y={20}>
          <div style={{fontFamily: F.body, fontSize: 28, lineHeight: 1.4, color: C.muted, maxWidth: 880}}>
            Owned fixtures. Deterministic oracles. Execution in the caller&apos;s browser.
          </div>
        </Pop>
        <Pop at={1.6} y={14}>
          <div style={{display: 'flex', gap: 12, flexWrap: 'wrap'}}>
            <Chip tone="coral" size={17}>
              CONSENT FIRST
            </Chip>
            <Chip tone="cyan" size={17}>
              OBSERVED EFFECTS
            </Chip>
            <Chip tone="green" size={17}>
              REPAIR + REPLAY
            </Chip>
          </div>
        </Pop>
        <Pop at={2.1} y={10}>
          <div style={{fontFamily: F.mono, fontSize: 12, color: C.faint, letterSpacing: 1.3}}>
            Open Agentic Web MVP Profile 0.2 · local fixture evidence
          </div>
        </Pop>
      </div>
    </AbsoluteFill>
  );
};
