import React from 'react';
import {EvidenceScene} from '../components/EvidenceScene';

export const Setup: React.FC = () => (
  <EvidenceScene
    clip="clips/setup.webm"
    start={0.1}
    end={6.0}
    zoom={1.07}
    eyebrow="Mission setup"
    title="One owned fixture. One exact target."
    chip="DETERMINISTIC FIXTURE"
    chipTone="cyan"
    notes={[
      'Choose a mission and a published target version.',
      'The exact network name is fetched from the manifest — no fallback.',
      'Use the offline fixture, or supply a key for your selected model.',
    ]}
    callout="No target server executes the mission. The published network runs in this tab."
    calloutTone="#6fd6c8"
  />
);
