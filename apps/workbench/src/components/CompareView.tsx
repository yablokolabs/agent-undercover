import { MISSIONS, TARGET_NETWORKS } from "@undercover/scenarios";
import type { RunRecord } from "@undercover/harness";
import { OutcomeBadge } from "./OutcomeBadge.js";

export function CompareView({
  pair,
  runs,
  onLoadRun,
  onReplayRun,
  onDeleteRun,
  onRepair,
  repairing,
}: {
  pair: { vulnerable?: RunRecord; repaired?: RunRecord };
  runs: RunRecord[];
  onLoadRun: (run: RunRecord) => void;
  onReplayRun: (run: RunRecord) => void;
  onDeleteRun: (runId: string) => void;
  onRepair: () => void;
  repairing: boolean;
}) {
  const missionId = pair.vulnerable?.missionId || pair.repaired?.missionId || "secret";
  const mission = MISSIONS[missionId];
  const sameRequests =
    pair.vulnerable && pair.repaired
      ? JSON.stringify(pair.vulnerable.attackRequests) === JSON.stringify(pair.repaired.attackRequests)
      : false;
  return (
    <div className="stack">
      <section className="panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Compare & replay</p>
            <h2>{mission.title}: weak and repaired target versions</h2>
          </div>
          <span className="pill">Observations, not guaranteed wins</span>
        </div>
        <p className="lead">
          A repair is a reviewed configuration change, not a prompt rewrite. It creates a new target configuration
          version and reruns the same saved requests with a fresh paired canary. Compare what the ledger observed; do not
          treat a blocked result as proof that the target is secure.
        </p>
        {pair.vulnerable && !pair.repaired ? (
          <div className="repair-callout">
            <div>
              <strong>Repair available for {TARGET_NETWORKS[missionId].repaired.label}</strong>
              <p>{TARGET_NETWORKS[missionId].repaired.change}</p>
            </div>
            <button type="button" className="btn accent" onClick={onRepair} disabled={repairing}>
              {repairing ? "Applying repair…" : "Create v2 and rerun same requests"}
            </button>
          </div>
        ) : null}
        <div className="compare-grid">
          <CompareCard title="v1 · vulnerable" run={pair.vulnerable} onLoadRun={onLoadRun} onReplayRun={onReplayRun} />
          <CompareCard title="v2 · repaired" run={pair.repaired} onLoadRun={onLoadRun} onReplayRun={onReplayRun} />
        </div>
        {pair.vulnerable && pair.repaired ? (
          <div className="compare-table-wrap">
            <div className="inline-actions">
              <span className={`pill ${sameRequests ? "good" : "warn"}`}>
                {sameRequests ? "Same request strings" : "Different request strings"}
              </span>
              <span className="muted small">Fresh canary per side; both sides must be configured with it.</span>
            </div>
            <table>
              <caption className="sr-only">Vulnerable and repaired run comparison</caption>
              <thead>
                <tr>
                  <th scope="col">Observation</th>
                  <th scope="col">v1 · vulnerable</th>
                  <th scope="col">v2 · repaired</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">Outcome</th>
                  <td><OutcomeBadge outcome={pair.vulnerable.result.outcome} /></td>
                  <td><OutcomeBadge outcome={pair.repaired.result.outcome} /></td>
                </tr>
                <tr>
                  <th scope="row">Synthetic effects applied</th>
                  <td>{countStatus(pair.vulnerable, "applied")}</td>
                  <td>{countStatus(pair.repaired, "applied")}</td>
                </tr>
                <tr>
                  <th scope="row">Actions rejected</th>
                  <td>{countStatus(pair.vulnerable, "rejected")}</td>
                  <td>{countStatus(pair.repaired, "rejected")}</td>
                </tr>
                <tr>
                  <th scope="row">Host confirmations</th>
                  <td>{hostSummary(pair.vulnerable)}</td>
                  <td>{hostSummary(pair.repaired)}</td>
                </tr>
                <tr>
                  <th scope="row">Execution source</th>
                  <td>{pair.vulnerable.executionSource}</td>
                  <td>{pair.repaired.executionSource}</td>
                </tr>
                <tr>
                  <th scope="row">Network hash</th>
                  <td className="mono small">{short(pair.vulnerable.target.networkHash)}</td>
                  <td className="mono small">{short(pair.repaired.target.networkHash)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : null}
        <p className="callout">
          <strong>Repair scope:</strong> {TARGET_NETWORKS[missionId].repaired.change} The workbench does not modify an
          arbitrary remote site; an operator selects and reviews this owned fixture change.
        </p>
      </section>

      <section className="panel" aria-labelledby="saved-heading">
        <div className="panel-heading">
          <h3 id="saved-heading">Saved run records</h3>
          <span className="muted small">IndexedDB · sanitized · no keys or canary values</span>
        </div>
        {runs.length ? (
          <div className="table-wrap">
            <table>
              <caption className="sr-only">Saved sanitized runs</caption>
              <thead>
                <tr>
                  <th scope="col">Created</th>
                  <th scope="col">Mission</th>
                  <th scope="col">Version</th>
                  <th scope="col">Source</th>
                  <th scope="col">Outcome</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {runs.map((run) => (
                  <tr key={run.runId}>
                    <td>
                      <time dateTime={run.createdAt}>{new Date(run.createdAt).toLocaleString()}</time>
                      <div className="mono small">{run.runId.slice(0, 8)}</div>
                    </td>
                    <td>{MISSIONS[run.missionId].title}</td>
                    <td>{run.configVersion} · {run.scenarioVersion}</td>
                    <td>{run.executionSource === "live-model" ? "live model" : "fixture"}</td>
                    <td><OutcomeBadge outcome={run.result.outcome} /></td>
                    <td>
                      <div className="row-actions">
                        <button type="button" className="link-button" onClick={() => onLoadRun(run)}>
                          Open
                        </button>
                        <button type="button" className="link-button" onClick={() => onReplayRun(run)}>
                          Replay
                        </button>
                        <button type="button" className="link-button danger-text" onClick={() => onDeleteRun(run.runId)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="muted">No runs saved yet. A completed run is stored automatically in this browser.</p>
        )}
      </section>
    </div>
  );
}

function CompareCard({
  title,
  run,
  onLoadRun,
  onReplayRun,
}: {
  title: string;
  run?: RunRecord;
  onLoadRun: (run: RunRecord) => void;
  onReplayRun: (run: RunRecord) => void;
}) {
  return (
    <article className="compare-card">
      <h3>{title}</h3>
      {run ? (
        <>
          <div className="inline-actions">
            <OutcomeBadge outcome={run.result.outcome} />
            <span className={`source-badge ${run.executionSource}`}>{run.executionSource}</span>
          </div>
          <p>{run.result.summary}</p>
          <dl className="facts compact">
            <dt>Requests</dt>
            <dd>{run.attackRequests.length} exact strings</dd>
            <dt>Network</dt>
            <dd className="mono small">{run.target.networkName}</dd>
            <dt>Hash</dt>
            <dd className="mono small">{short(run.target.networkHash)}</dd>
            <dt>Recorded</dt>
            <dd>{new Date(run.createdAt).toLocaleString()}</dd>
          </dl>
          <div className="inline-actions">
            <button type="button" className="btn ghost small" onClick={() => onLoadRun(run)}>
              Open case file
            </button>
            <button type="button" className="btn ghost small" onClick={() => onReplayRun(run)}>
              Replay exact
            </button>
          </div>
        </>
      ) : (
        <p className="muted">No run recorded for this target version in this browser.</p>
      )}
    </article>
  );
}

function countStatus(run: RunRecord, status: string): string {
  const count = run.result.actions.filter((action) => action.status === status).length;
  return String(count);
}

function hostSummary(run: RunRecord): string {
  if (!run.result.hostConfirmations.length) return "none";
  return run.result.hostConfirmations
    .map((item) => `${item.action}: ${item.approved ? "confirmed" : "declined"}`)
    .join("; ");
}

function short(hash: string): string {
  return `${hash.slice(0, 16)}…`;
}
