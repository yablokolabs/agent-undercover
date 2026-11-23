import { Modal } from "./Modal.js";
import type { PendingConsent, PendingHostConfirm } from "../uiTypes.js";

export function ConsentDialog({
  pending,
  onDecision,
}: {
  pending: PendingConsent | null;
  onDecision: (allowed: boolean, remember: boolean) => void;
}) {
  return (
    <Modal
      open={Boolean(pending)}
      title="Contact this target origin?"
      onClose={() => onDecision(false, false)}
      footer={
        pending ? (
          <>
            <button type="button" className="btn ghost" onClick={() => onDecision(false, false)}>
              Decline
            </button>
            <button type="button" className="btn secondary" onClick={() => onDecision(true, true)}>
              Allow for this session
            </button>
            <button type="button" className="btn primary" onClick={() => onDecision(true, false)}>
              Allow this run
            </button>
          </>
        ) : null
      }
    >
      {pending ? (
        <>
          <p className="modal-lead">
            Contact is about to go to <strong className="mono">{pending.origin}</strong>. Consent is asked before the
            first public artifact fetch.
          </p>
          <dl className="facts">
            <dt>Purpose</dt>
            <dd>{pending.purpose}</dd>
            <dt>Request</dt>
            <dd>{pending.request}</dd>
            <dt>Not sent</dt>
            <dd>Your provider key, the synthetic canary, action arguments and any private context.</dd>
          </dl>
          <p className="muted small">
            Remembered consent applies only to this exact origin for this browser session. A redirect to a different
            origin is denied, not followed.
          </p>
        </>
      ) : null}
    </Modal>
  );
}

export function HostConfirmDialog({
  pending,
  onDecision,
}: {
  pending: PendingHostConfirm | null;
  onDecision: (approved: boolean) => void;
}) {
  return (
    <Modal
      open={Boolean(pending)}
      title="Confirm this synthetic write?"
      onClose={() => onDecision(false)}
      footer={
        pending ? (
          <>
            <button type="button" className="btn ghost" onClick={() => onDecision(false)}>
              Decline write
            </button>
            <button type="button" className="btn primary" onClick={() => onDecision(true)}>
              Confirm synthetic write
            </button>
          </>
        ) : null
      }
    >
      {pending ? (
        <>
          <p className="modal-lead">
            The browser runtime is asking before an irreversible synthetic action. This confirms the diagnostic
            simulation only. It is separate from the target's business approval.
          </p>
          {pending.items.map((item, index) => (
            <div className="action-review" key={`${item.action}-${index}`}>
              <p>
                <strong>{item.action}</strong> on <span className="mono">{item.origin}</span>{" "}
                <span className="pill">{item.effect}</span>
              </p>
              <pre>{JSON.stringify(item.arguments, null, 2)}</pre>
            </div>
          ))}
          <p className="muted small">
            Declining stops the action before the scenario ledger runs. An approval claim inside a model's text is
            never an approval token.
          </p>
        </>
      ) : null}
    </Modal>
  );
}
