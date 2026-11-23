import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {Chip, Eyebrow, Glass, Pop, Title, hexA} from '../components/ui';
import {C, F} from '../theme';
import {useT} from '../hooks';
import {BRAND} from '../config';

const ROWS = [
  {code: '01', name: 'Secret disclosure', before: 'confirmed', after: 'not observed', good: true},
  {code: '02', name: 'Unauthorized discount', before: 'applied', after: 'blocked', good: true},
  {code: '03', name: 'Approval bypass', before: 'finalized', after: 'blocked', good: true},
];

export const Hook: React.FC = () => {
  const {frame, sp} = useT();
  const card = sp(0.45, {damping: 18, stiffness: 110, mass: 1});
  const pulse = 0.5 + 0.5 * Math.sin(frame / 18);
  return (
    <AbsoluteFill style={{padding: '0 120px', flexDirection: 'row', alignItems: 'center', gap: 70}}>
      <div style={{flex: 1.08, display: 'flex', flexDirection: 'column', gap: 28}}>
        <Eyebrow text="Bounded adversarial tests" at={0.2} />
        <Title text="Every agent has a [boundary]." at={0.35} size={104} />
        <Pop at={1.1} y={20}>
          <div style={{fontFamily: F.body, fontSize: 32, lineHeight: 1.35, color: C.muted, maxWidth: 800}}>
            The question is what happens when someone tests it.
          </div>
        </Pop>
        <Pop at={1.5} y={14}>
          <div style={{display: 'flex', gap: 12, flexWrap: 'wrap'}}>
            <Chip tone="coral" size={18}>
              CALLER-BROWSER EXECUTION
            </Chip>
            <Chip tone="cyan" size={18}>
              DETERMINISTIC ORACLES
            </Chip>
          </div>
        </Pop>
      </div>

      <div style={{flex: 0.92, perspective: 1400}}>
        <div
          style={{
            transform: `rotateY(${-12 + card * 7}deg) rotateX(${5 - card * 5}deg) translateY(${(1 - card) * 90}px)`,
            opacity: Math.min(1, card * 1.5),
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: -80,
              background: `radial-gradient(closest-side, ${hexA(C.coral, 0.28)}, transparent)`,
              opacity: 0.75,
            }}
          />
          <Glass style={{padding: 34, minHeight: 560, display: 'flex', flexDirection: 'column', gap: 18}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
              {BRAND.logo ? (
                <Img
                  src={staticFile(BRAND.logo)}
                  style={{width: 52, height: 52, borderRadius: 13, border: '1px solid rgba(255,255,255,0.2)'}}
                />
              ) : null}
              <div style={{flex: 1}}>
                <div style={{fontFamily: F.mono, fontSize: 12, letterSpacing: 2.2, color: C.coral}}>
                  CASE FILE / SYNTHETIC TARGET
                </div>
                <div style={{fontFamily: F.display, fontSize: 27, fontWeight: 700, color: C.ink, marginTop: 3}}>
                  Harbor &amp; Ledger
                </div>
              </div>
              <div
                style={{
                  width: 11,
                  height: 11,
                  borderRadius: 9,
                  background: C.green,
                  boxShadow: `0 0 ${12 + 8 * pulse}px ${C.green}`,
                }}
              />
            </div>

            <div style={{height: 1, background: C.line, margin: '4px 0 2px'}} />

            {ROWS.map((row, index) => (
              <Pop key={row.code} at={0.8 + index * 0.14} y={14}>
                <div style={{display: 'flex', alignItems: 'center', gap: 13}}>
                  <div style={{fontFamily: F.mono, fontSize: 12, color: C.faint}}>{row.code}</div>
                  <div style={{flex: 1, fontFamily: F.body, fontSize: 19, color: C.ink}}>{row.name}</div>
                  <div style={{fontFamily: F.mono, fontSize: 11, color: C.muted, textAlign: 'right'}}>
                    {row.before}
                    <span style={{color: C.faint}}> → </span>
                    <span style={{color: row.good ? C.green : C.red}}>{row.after}</span>
                  </div>
                </div>
              </Pop>
            ))}

            <div style={{flex: 1}} />
            <div
              style={{
                padding: '14px 16px',
                borderRadius: 10,
                border: `1px dashed ${hexA(C.coral, 0.55)}`,
                background: hexA(C.coral, 0.07),
              }}
            >
              <div style={{fontFamily: F.mono, fontSize: 11, letterSpacing: 1.8, color: C.coral}}>
                PRIVATE TEST MATERIAL
              </div>
              <div style={{fontFamily: F.mono, fontSize: 14, color: C.muted, marginTop: 7}}>
                canary <span style={{color: C.ink}}>[REDACTED]</span> · oracle <span style={{color: C.ink}}>in memory</span>
              </div>
            </div>
            <div style={{fontFamily: F.mono, fontSize: 11, color: C.faint, letterSpacing: 1.1}}>
              OWNED FIXTURE · NO REAL CUSTOMERS, BOOKINGS OR PAYMENTS
            </div>
          </Glass>
        </div>
      </div>
    </AbsoluteFill>
  );
};
