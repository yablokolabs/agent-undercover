import { useState } from "react";
import { redactText, toPublicReport } from "@undercover/harness";
import type { RunMissionOutput } from "../agent/missionRunner.js";
import type { WorkbenchSettings } from "../uiTypes.js";
import { createApprovedFetch } from "../agent/safeFetch.js";
import { createTargetEngine, preflightTarget } from "../agent/targetLoader.js";

const SAMPLE_REPORT = {
  schemaVersion: 1,
  runId: "sample-not-a-real-run",
  missionId: "secret",
  scenarioVersion: "repaired",
  executionSource: "fixture",
  networkName: "undercover_secret_v2",
  result: {
    outcome: "no_match",
    summary: "No exact canary match was observed in this test.",
    misleadingPromise: false,
  },
  limitations: ["Not proof of security."],
};

export function PublishedNetwork({
  settings,
  current,
}: {
  settings: WorkbenchSettings;
  current: RunMissionOutput | null;
}) {
  const [reportText, setReportText] = useState(() =>
    current
      ? JSON.stringify(toPublicReport(current.record, { canary: current.canary, apiKey: settings.apiKey }), null, 2)
      : JSON.stringify(SAMPLE_REPORT, null, 2),
  );
  const [answer, setAnswer] = useState("");
  const [status, setStatus] = useState("");
  const [running, setRunning] = useState(false);
  const [nameCheck, setNameCheck] = useState("");
  const live = settings.executionMode === "live" && Boolean(settings.apiKey);
  const origin = typeof location !== "undefined" ? location.origin : "";

  async function explain() {
    setRunning(true);
    setStatus("");
    setAnswer("");
    try {
      const safeFetch = createApprovedFetch({ allowedOrigins: [origin] });
      const artifact = await preflightTarget({
        base: origin,
        networkName: "case_explainer",
        safeFetch,
      });
      const loaded = await createTargetEngine({
        artifact,
        router: live ? settings.router : "browser://mock",
        model: live ? settings.model : "",
        apiKey: live ? settings.apiKey : "",
        safeFetch,
      });
      const safeReport = redactText(
        reportText.slice(0, 20000).replace(/UC-[A-Z2-9]{20}/g, "[REDACTED_CANARY]"),
        { apiKey: settings.apiKey },
      );
      const result = await loaded.engine.runTurn(safeReport);
      setAnswer(String(result.text || ""));
      setStatus(live ? "Live model explanation from the published case_explainer network." : "Browser mock explanation; this is not a model run.");
    } catch (error) {
      setStatus(String((error as Error).message || error));
    } finally {
      setRunning(false);
    }
  }

  async function checkName() {
    setNameCheck("");
    try {
      const safeFetch = createApprovedFetch({ allowedOrigins: [origin] });
      await preflightTarget({ base: origin, networkName: "not_published_network", safeFetch });
      setNameCheck("Unexpected: a missing network name was accepted.");
    } catch (error) {
      setNameCheck(`Rejected as required: ${String((error as Error).message || error)}`);
    }
  }

  return (
    <div className="stack">
      <section className="panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Published network</p>
            <h2>The workbench is also a conforming agent site.</h2>
          </div>
          <span className="pill good">Two-agent public network</span>
        </div>
        <p className="lead">
          This origin publishes a data-only <span className="mono">case_explainer</span> network, its manifest, runtime
          and the interface you are using. Another owned caller can resolve the exact network name, fetch the public
          artifacts and run it in its own browser after its own per-origin consent. The network receives only a
          sanitized report; the private oracle and provider key are not published.
        </p>
        <div className="link-grid">
          <PublicLink label="Interface" href="/" path="/" />
          <PublicLink label="Manifest" href="/agent-manifest.json" path="/agent-manifest.json" />
          <PublicLink label="Network JSON" href="/case_explainer.network.json" path="/case_explainer.network.json" />
          <PublicLink label="Runtime entry" href="/runtime/index.js" path="/runtime/index.js" />
          <PublicLink label="links.json" href="/links.json" path="/links.json" />
        </div>
        <div className="facts-grid">
          <div>
            <h4>Agents</h4>
            <p className="mono small">case_explainer → finding_reader</p>
          </div>
          <div>
            <h4>Callable URL</h4>
            <p className="mono small">{origin}/case_explainer</p>
          </div>
          <div>
            <h4>Actions</h4>
            <p>None. The explainer reads only the supplied sanitized report.</p>
          </div>
          <div>
            <h4>Private material</h4>
            <p>No oracle, canary, key, run database or saved case file is part of the public bundle.</p>
          </div>
        </div>
      </section>

      <section className="panel" aria-labelledby="explain-heading">
        <div className="panel-heading">
          <h3 id="explain-heading">Run the published explainer</h3>
          <span className={`source-badge ${live ? "live-model" : "fixture"}`}>
            {live ? "Live model via your router" : "Browser mock (not a model run)"}
          </span>
        </div>
        <label className="field">
          <span>Sanitized report JSON</span>
          <textarea
            value={reportText}
            onChange={(event) => setReportText(event.target.value)}
            rows={10}
            spellCheck={false}
          />
          <small>
            The explainer runs locally with the caller's inference settings. It does not receive the private canary or
            provider key as prompt content.
          </small>
        </label>
        <div className="inline-actions">
          <button type="button" className="btn primary" onClick={explain} disabled={running || !reportText.trim()}>
            {running ? "Explaining…" : "Explain with published network"}
          </button>
          <span className="muted small">
            {live ? `Router: ${settings.router}` : "Add a live key in mission setup to use a model instead of the browser mock."}
          </span>
        </div>
        {status ? <p className={status.startsWith("Rejected") ? "callout" : "callout"} role="status">{status}</p> : null}
        {answer ? <pre className="explanation-output">{answer}</pre> : null}
      </section>

      <section className="panel" aria-labelledby="conformance-heading">
        <div className="panel-heading">
          <h3 id="conformance-heading">Local conformance checks</h3>
          <span className="pill">Normal browser entry point</span>
        </div>
        <ul className="check-list">
          <li>Public manifest, network JSON, runtime module and interface are served from this origin.</li>
          <li>Exact network name lookup fails closed when no published entry matches.</li>
          <li>Target artifacts are fetched from the second origin only after per-origin consent and are run in this tab.</li>
          <li>Provider keys are attached only to the selected router; public artifact fetches strip credentials.</li>
          <li>Irreversible synthetic actions require a host confirmation; a declined confirmation blocks the action.</li>
        </ul>
        <button type="button" className="btn secondary small" onClick={checkName}>
          Check exact-name rejection
        </button>
        {nameCheck ? <p className="callout" role="status">{nameCheck}</p> : null}
        <p className="muted small">
          Public HTTPS deployment, public CORS behavior and anonymous artifact checks are separate from local
          loopback tests. This build does not claim NANDA discovery, A2A, MCP or WebMCP integration.
        </p>
      </section>
    </div>
  );
}

function PublicLink({ label, href, path }: { label: string; href: string; path: string }) {
  return (
    <a className="public-link" href={href} target="_blank" rel="noreferrer">
      <span>{label}</span>
      <span className="mono small">{path}</span>
    </a>
  );
}
