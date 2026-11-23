import { MISSIONS } from "@undercover/scenarios";
import type { EventRecord, HostConfirmation, RunRecord } from "@undercover/harness";
import type { RunMissionOutput } from "../agent/missionRunner.js";
import { OutcomeBadge } from "./OutcomeBadge.js";

export function CaseFile({
  output,
  onExport,
  onRepair,
  onReplay,
  onAdaptive,
  repairing,
  adaptiveAvailable,
}: {
  output: RunMissionOutput | null;
  onExport: (format: "json" | "markdown") => void;
  onRepair: () => void;
  onReplay: () => void;
  onAdaptive: () => void;
  repairing: boolean;
  adaptiveAvailable: boolean;
}) {
  if (!output) {
    return (
      <section className="panel empty-panel">
        <p className="eyebrow">Case file</p>
        <h2>No mission has run in this tab.</h2>
        <p className="lead">
          Start an owned synthetic mission to see numbered requests, actual tool receipts, host confirmations and the
          deterministic finding. Configure a provider for live evidence, or use fixture mode for an offline walkthrough.
        </p>
      </section>
    );
  }
  const record = output.record;
  const mission = MISSIONS[record.missionId];
  const leakedReply = output.privateReplies.find(
    (reply) => output.canary && reply.text.includes(output.canary),
  );
  return (
    <div className="stack">
      <section className={`panel finding-panel outcome-${record.result.outcome}`}>
        <div className="finding-top">
          <div>
            <p className="eyebrow">Case file · {mission.title}</p>
            <h2>{record.result.summary}</h2>
          </div>
          <OutcomeBadge outcome={record.result.outcome} large />
        </div>
        <div className="finding-meta">
          <span className={`source-badge ${record.executionSource}`}>
            {record.executionSource === "live-model" ? "Live model run" : "Deterministic fixture"}
          </span>
          <span className="pill">{record.configLabel}</span>
          <span className="pill">v{record.configVersion}</span>
          <span className="pill">{record.replay ? "Exact replay" : "Fresh run"}</span>
          {record.attackSource === "adaptive" ? <span className="pill warn">Adaptive request</span> : null}
          {record.result.misleadingPromise ? <span className="pill danger">Misleading promise recorded</span> : null}
        </div>
        <div className="summary-grid">
          <div>
            <h4>What supports this</h4>
            <p>{record.result.oracle.summary}</p>
            <EvidenceHighlights record={record} />
          </div>
          <div>
            <h4>What it does not establish</h4>
            <ul className="tight-list">
              {record.result.oracle.limitations.slice(0, 4).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="inline-actions">
          <button type="button" className="btn primary small" onClick={() => onExport("json")}>
            Export sanitized JSON
          </button>
          <button type="button" className="btn secondary small" onClick={() => onExport("markdown")}>
            Export Markdown
          </button>
          <button type="button" className="btn ghost small" onClick={onReplay}>
            Replay exact requests
          </button>
          {record.scenarioVersion === "vulnerable" ? (
            <button type="button" className="btn accent small" onClick={onRepair} disabled={repairing}>
              {repairing ? "Applying repair…" : "Review repair & rerun"}
            </button>
          ) : null}
          <button
            type="button"
            className="btn ghost small"
            onClick={onAdaptive}
            disabled={!adaptiveAvailable}
            title={
              adaptiveAvailable
                ? "Generate one new request with the configured live model"
                : "Add a live provider key in this tab to use adaptive generation"
            }
          >
            Adaptive retest
          </button>
        </div>
      </section>

      {leakedReply && output.canary ? (
        <section className="panel session-evidence" aria-labelledby="session-evidence-heading">
          <div className="panel-heading">
            <h3 id="session-evidence-heading">Session-only exact reply</h3>
            <span className="pill danger">Never exported or saved</span>
          </div>
          <p>
            The dashed value below is the synthetic canary for this run. It is shown here so the operator can inspect
            the exact disclosure. Export replaces it with <span className="mono">[REDACTED_CANARY]</span>; IndexedDB
            stores only the sanitized record.
          </p>
          <pre className="exact-reply">
            {highlightCanary(leakedReply.text, output.canary)}
          </pre>
          <p className="muted small">
            Matched turn: <span className="mono">{leakedReply.turnId}</span>. The spy's requests and context did not
            contain this value.
          </p>
        </section>
      ) : null}

      <section className="panel" aria-labelledby="timeline-heading">
        <div className="panel-heading">
          <h3 id="timeline-heading">Numbered run timeline</h3>
          <span className="muted small">{record.events.length} bounded, sanitized events</span>
        </div>
        <ol className="timeline">
          {record.events.map((event) => (
            <li key={event.seq} className={`timeline-item event-${event.type}`}>
              <div className="timeline-marker" aria-hidden="true">
                {event.seq}
              </div>
              <div className="timeline-body">
                <div className="timeline-head">
                  <strong>{eventLabel(event)}</strong>
                  <span className="muted small">{event.atMs} ms</span>
                </div>
                {renderEvent(event)}
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="panel" aria-labelledby="effects-heading">
        <div className="panel-heading">
          <h3 id="effects-heading">Observed synthetic effects</h3>
          <span className="muted small">Assistant text is separate from executed effects</span>
        </div>
        {record.result.actions.length ? (
          <div className="table-wrap">
            <table>
              <caption className="sr-only">Tool actions, arguments, status and receipts</caption>
              <thead>
                <tr>
                  <th scope="col">Action</th>
                  <th scope="col">Effect</th>
                  <th scope="col">Status</th>
                  <th scope="col">Arguments / receipt</th>
                </tr>
              </thead>
              <tbody>
                {record.result.actions.map((action, index) => (
                  <tr key={`${action.action}-${index}`}>
                    <td className="mono">{action.action}</td>
                    <td>{action.effect}</td>
                    <td>
                      <span className={`status ${action.status}`}>{action.status}</span>
                    </td>
                    <td>
                      <code>{compactJson(action.arguments)}</code>
                      {action.result ? <pre className="table-pre">{compactJson(action.result)}</pre> : null}
                      {action.reason ? <p className="small">{action.reason}</p> : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="muted">No synthetic action was proposed in this run.</p>
        )}
        <h4>Host write confirmations</h4>
        {record.result.hostConfirmations.length ? (
          <ul className="compact-list">
            {record.result.hostConfirmations.map((item, index) => (
              <li key={`${item.action}-${index}`}>
                <strong>{item.action}</strong> — {item.approved ? "confirmed" : "declined"} at {item.atMs} ms
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">No irreversible host confirmation was requested.</p>
        )}
      </section>

      <section className="panel" aria-labelledby="integrity-heading">
        <div className="panel-heading">
          <h3 id="integrity-heading">Run integrity and reproduction</h3>
          <span className="pill">Hashes stored with the result</span>
        </div>
        <div className="integrity-grid">
          <Fact label="Run id" value={record.runId} mono />
          <Fact label="Created" value={record.createdAt} />
          <Fact label="Target origin" value={record.target.targetOrigin} mono />
          <Fact label="Network" value={record.target.networkName} mono />
          <Fact label="Network SHA-256" value={record.target.networkHash} mono />
          <Fact label="Manifest SHA-256" value={record.target.manifestHash} mono />
          <Fact label="Attack plan SHA-256" value={record.attackPlanHash} mono />
          <Fact label="Runtime" value={record.runtimeCommit} />
          <Fact label="Spec" value={record.specVersion} />
          <Fact label="Router origin" value={record.routerOrigin} mono />
          <Fact label="Model" value={record.modelId} mono />
          <Fact label="Observed usage" value={`${record.observedUsage.turns} turns · ${record.observedUsage.modelCalls} model calls · ${record.observedUsage.elapsedMs} ms`} />
        </div>
        <h4>Exact stored requests</h4>
        <ol className="request-list">
          {record.attackRequests.map((request, index) => (
            <li key={index}>{request}</li>
          ))}
        </ol>
        <p className="muted small">
          A replay requires the same target origin and network hash. If the published definition changed, the workbench
          asks you to select the new target configuration explicitly.
        </p>
      </section>
    </div>
  );
}

function EvidenceHighlights({ record }: { record: RunRecord }) {
  const highlights: string[] = [];
  if (record.result.outcome === "confirmed_disclosure") {
    highlights.push("The exact canary appeared in an attacker-visible target reply.");
  }
  if (record.result.outcome === "confirmed_unauthorized_effect") {
    const applied = record.result.actions.filter((action) => action.status === "applied");
    if (applied.length) highlights.push(`${applied.length} synthetic action receipt(s) show an effect the ledger did not authorize.`);
  }
  if (record.result.outcome === "blocked") {
    const rejected = record.result.actions.filter((action) => action.status === "rejected");
    if (rejected.length) {
      const reason = (rejected[0]!.reason || "policy refusal").replace(/\.$/, "");
      highlights.push(`The target action rejected the request: ${reason}.`);
    }
    if (!rejected.length && record.result.hostConfirmations.some((item: HostConfirmation) => !item.approved)) {
      highlights.push("The host write confirmation was declined; the runtime did not bypass it.");
    }
  }
  if (record.result.outcome === "no_match") highlights.push("No exact canary match was observed in this test.");
  if (record.result.misleadingPromise) highlights.push("The assistant claimed an effect that the ledger does not contain.");
  if (!highlights.length) highlights.push("See the timeline and action receipts below for the observed evidence.");
  return (
    <ul className="tight-list">
      {highlights.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function Fact({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="fact">
      <span>{label}</span>
      <strong className={mono ? "mono" : ""}>{value}</strong>
    </div>
  );
}

function eventLabel(event: EventRecord): string {
  const labels: Record<string, string> = {
    runStarted: "Run started",
    spyContext: "Spy context",
    consentRequested: "Consent requested",
    consent: "Consent decision",
    peerFetch: "Public artifact fetch",
    targetArtifact: "Target artifact verified",
    runtimeCompile: "Runtime compile",
    runtimeLoaded: "Target loaded locally",
    spyRequest: "Spy request",
    targetReply: "Target reply",
    actionProposed: "Action proposed",
    actionRead: "Read action",
    actionApplied: "Synthetic effect applied",
    actionRejected: "Synthetic effect rejected",
    actionUnknown: "Action outcome unknown",
    hostConfirmationRequested: "Host confirmation requested",
    hostConfirmed: "Host confirmation approved",
    hostConfirmationDenied: "Host confirmation declined",
    businessApproved: "Business approval issued",
    businessApprovalInvalidated: "Business approval invalidated",
    budgetExceeded: "Budget stop",
    cancelled: "Cancelled",
    error: "Error",
    oracle: "Deterministic oracle",
    runCompleted: "Run completed",
  };
  return labels[event.type] || event.type;
}

function renderEvent(event: EventRecord) {
  const payload = event.payload as Record<string, unknown>;
  if (event.type === "spyRequest" || event.type === "targetReply") {
    return <pre className="event-text">{String(payload.text ?? "")}</pre>;
  }
  if (event.type === "actionProposed" || event.type === "actionApplied" || event.type === "actionRejected") {
    return (
      <>
        <p>
          <span className="mono">{String(payload.action ?? "")}</span>{" "}
          {payload.reason ? <span className="muted">— {String(payload.reason)}</span> : null}
        </p>
        <pre className="event-json">{JSON.stringify(payload.arguments ?? payload.result ?? {}, null, 2)}</pre>
      </>
    );
  }
  if (event.type === "hostConfirmationRequested" || event.type === "hostConfirmed" || event.type === "hostConfirmationDenied") {
    return (
      <>
        <p>
          <span className="mono">{String(payload.action ?? "")}</span> ·{" "}
          {String(payload.origin ?? "")}
        </p>
        <pre className="event-json">{JSON.stringify(payload.arguments ?? {}, null, 2)}</pre>
      </>
    );
  }
  if (event.type === "peerFetch") {
    return (
      <p>
        <span className={`status ${payload.status === "ok" ? "applied" : "rejected"}`}>{String(payload.status)}</span>{" "}
        <span className="mono">{String(payload.url ?? "")}</span>{" "}
        <span className="muted small">{String(payload.ms ?? "")} ms</span>
      </p>
    );
  }
  if (event.type === "consent") {
    return (
      <p>
        <strong>{String(payload.decision ?? "")}</strong> for <span className="mono">{String(payload.origin ?? "")}</span>
        {payload.scope ? <span className="muted"> · {String(payload.scope)}</span> : null}
      </p>
    );
  }
  if (event.type === "oracle") {
    return <p>{String(payload.summary ?? "")}</p>;
  }
  return <pre className="event-json">{JSON.stringify(payload, null, 2)}</pre>;
}

function compactJson(value: unknown): string {
  const text = typeof value === "string" ? value : JSON.stringify(value);
  return text.length > 500 ? `${text.slice(0, 500)}…` : text;
}

function highlightCanary(text: string, canary: string) {
  const parts = text.split(canary);
  return parts.map((part, index) => (
    <span key={index}>
      {part}
      {index < parts.length - 1 ? <mark className="canary-mark">{canary}</mark> : null}
    </span>
  ));
}

