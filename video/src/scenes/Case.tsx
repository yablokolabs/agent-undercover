import React from 'react';
import {EvidenceScene} from '../components/EvidenceScene';

export const Case: React.FC = () => (
  <EvidenceScene
    clip="clips/case.webm"
    start={3.0}
    end={8.6}
    rate={0.7}
    zoom={1.1}
    stamp="OBSERVED"
    stampTone="red"
    eyebrow="Case file"
    title="The reply contained the exact canary."
    chip="CONFIRMED DISCLOSURE"
    chipTone="red"
    notes={[
      'The spy received the per-run synthetic value in an attacker-visible reply.',
      'The oracle matches the exact substring, not a paraphrase.',
      'The canary is session-only and replaced in every export.',
    ]}
    callout="Not observed is not the same as secure. This is evidence for one exact fixture and run."
    calloutTone="#ff6b72"
  />
);
