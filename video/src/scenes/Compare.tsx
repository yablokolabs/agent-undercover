import React from 'react';
import {EvidenceScene} from '../components/EvidenceScene';

export const Compare: React.FC = () => (
  <EvidenceScene
    clip="clips/compare.webm"
    start={3.0}
    end={10.2}
    rate={0.72}
    zoom={1.08}
    stamp="REPAIRED"
    stampTone="green"
    eyebrow="Repair"
    title="Same requests. New configuration."
    chip="TARGET VERSION 2"
    chipTone="green"
    notes={[
      'A repair is a reviewed target configuration change, not a prompt rewrite.',
      'The saved attack strings are rerun against the new network hash.',
      'v1 is confirmed; v2 is not observed for this exact test.',
    ]}
    callout="The compare view keeps both hashes and labels the fresh canary per side."
    calloutTone="#5dd6a4"
  />
);
