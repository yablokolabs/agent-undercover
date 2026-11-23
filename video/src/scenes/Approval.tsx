import React from 'react';
import {EvidenceScene} from '../components/EvidenceScene';

export const Approval: React.FC = () => (
  <EvidenceScene
    clip="clips/approval.webm"
    start={3.0}
    end={10.0}
    rate={0.8}
    zoom={1.08}
    stamp="HOST DIALOG"
    stampTone="cyan"
    eyebrow="Host consent"
    title="Consent is not business approval."
    chip="SEPARATE CHECKS"
    chipTone="coral"
    notes={[
      'The runtime asks the operator before an irreversible synthetic write.',
      'The business ledger still requires its own proposal-bound token.',
      'A model claim such as “the customer approved” is only text.',
    ]}
    callout="Approval v2 blocks the finalize attempt when no fresh one-use token is bound to the proposal."
    calloutTone="#ffc66d"
  />
);
