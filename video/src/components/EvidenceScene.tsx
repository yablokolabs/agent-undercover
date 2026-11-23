import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Chip, Eyebrow, Title} from './ui';
import {Callout, NoteList} from './Notes';
import {Footage} from './Footage';
import {C, F} from '../theme';
import {hexA} from './ui';

export const EvidenceScene: React.FC<{
  clip: string;
  start: number;
  end: number;
  rate?: number;
  zoom?: number;
  anchor?: 'top' | 'center';
  stamp?: string;
  stampTone?: 'red' | 'green' | 'cyan';
  eyebrow: string;
  title: string;
  chip: string;
  chipTone?: 'coral' | 'red' | 'cyan' | 'green' | 'muted' | 'solid';
  notes: string[];
  callout: React.ReactNode;
  calloutTone?: string;
}> = ({
  clip,
  start,
  end,
  rate,
  zoom,
  anchor,
  stamp,
  stampTone,
  eyebrow,
  title,
  chip,
  chipTone = 'coral',
  notes,
  callout,
  calloutTone = C.coral,
}) => (
  <AbsoluteFill style={{padding: '74px 66px', flexDirection: 'row', alignItems: 'center', gap: 44}}>
    <Footage
      clip={clip}
      start={start}
      end={end}
      rate={rate}
      zoom={zoom}
      anchor={anchor}
      stamp={stamp}
      stampTone={stampTone}
    />
    <div style={{width: 480, display: 'flex', flexDirection: 'column', gap: 22}}>
      <Eyebrow text={eyebrow} at={0.2} />
      <Title text={title} at={0.3} size={50} stagger={0.06} />
      <div style={{marginTop: 2}}>
        <Chip tone={chipTone} size={15}>
          {chip}
        </Chip>
      </div>
      <div style={{height: 1, background: hexA(C.ink, 0.14), margin: '4px 0 2px'}} />
      <NoteList items={notes} at={1.2} color={calloutTone} />
      <Callout at={2.1} tone={calloutTone}>
        {callout}
      </Callout>
      <div style={{fontFamily: F.mono, fontSize: 10, letterSpacing: 1.2, color: C.faint, marginTop: 8}}>
        RECORDED LOCALLY · FIXTURE MODE
      </div>
    </div>
  </AbsoluteFill>
);
