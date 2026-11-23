import React from 'react';
import {EvidenceScene} from '../components/EvidenceScene';

export const Published: React.FC = () => (
  <EvidenceScene
    clip="clips/published.webm"
    start={1.5}
    end={7.2}
    rate={0.95}
    zoom={1.03}
    eyebrow="Published network"
    title="The workbench is also an agent site."
    chip="CASE_EXPLAINER → FINDING_READER"
    chipTone="cyan"
    notes={[
      'A public manifest, network JSON, runtime entry and normal interface.',
      'The explainer reads a sanitized report and declares no target actions.',
      'No oracle, canary or provider key is part of the public bundle.',
    ]}
    callout="The fixture-mode explainer shows a clearly labeled browser mock, not live-model evidence."
    calloutTone="#6fd6c8"
  />
);
