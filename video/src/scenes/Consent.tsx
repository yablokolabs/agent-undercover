import React from 'react';
import {EvidenceScene} from '../components/EvidenceScene';

export const Consent: React.FC = () => (
  <EvidenceScene
    clip="clips/consent.webm"
    start={1.0}
    end={7.0}
    zoom={1.06}
    eyebrow="Consent"
    title="Contact needs consent."
    chip="EXACT ORIGIN · THIS SESSION"
    chipTone="cyan"
    notes={[
      'The workbench names the exact origin before the first artifact fetch.',
      'The request is read-only: manifest and declared network JSON.',
      'The provider key, canary and action arguments are not sent.',
    ]}
    callout="A redirect to a different origin is denied, not followed."
    calloutTone="#6fd6c8"
  />
);
