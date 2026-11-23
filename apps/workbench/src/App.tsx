import { useEffect, useRef, useState } from "react";
import { MISSIONS } from "@undercover/scenarios";
import {
  toPublicReport,
  reportToMarkdown,
  type MissionId,
  type RunRecord,
  type TargetVersion,
} from "@undercover/harness";
import { MissionSetup } from "./components/MissionSetup.js";
import { CaseFile } from "./components/CaseFile.js";
import { CompareView } from "./components/CompareView.js";
import { PublishedNetwork } from "./components/PublishedNetwork.js";
import { ConsentDialog, HostConfirmDialog } from "./components/Dialogs.js";
import {
  runMission,
  ConsentDeclinedError,
  type RunMissionOutput,
} from "./agent/missionRunner.js";
import { generateAdaptiveRequest } from "./agent/adaptiveSpy.js";
import {
  deleteRun,
  listRuns,
  saveRun,
  saveTargetConfig,
} from "./data/runStore.js";
import {
  INITIAL_SETTINGS,
  type PendingConsent,
  type PendingHostConfirm,
  type ViewName,
  type WorkbenchSettings,
} from "./uiTypes.js";

interface ExecuteOptions {
  missionId?: MissionId;
  version?: TargetVersion;
  targetBaseUrl?: string;
  replayRequests?: string[];
  adaptiveRequest?: string;
  expectedNetworkHash?: string;
  replay?: boolean;
  businessApprovalIssued?: boolean;
}

export default function App() {
  const [settings, setSettings] = useState<WorkbenchSettings>(INITIAL_SETTINGS);
  const [view, setView] = useState<ViewName>("mission");
  const [running, setRunning] = useState(false);
  const [planning, setPlanning] = useState(false);
  const [repairing, setRepairing] = useState(false);
  const [output, setOutput] = useState<RunMissionOutput | null>(null);
  const [runs, setRuns] = useState<RunRecord[]>([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [pendingConsent, setPendingConsent] = useState<PendingConsent | null>(null);
  const [pendingHost, setPendingHost] = useState<PendingHostConfirm | null>(null);
  const consentMemo = useRef(new Map<string, boolean>());
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    void refreshRuns();
  }, []);

  async function refreshRuns() {
    try {
      setRuns(await listRuns());
    } catch (caught) {
      setError(String((caught as Error).message || caught));
    }
  }

  function patchSettings(patch: Partial<WorkbenchSettings>) {
    setSettings((current) => ({ ...current, ...patch }));
    if (patch.missionId || patch.version || patch.targetBaseUrl) setError("");
  }

  function requestConsent(info: { origin: string; purpose: string; request: string }): Promise<boolean> {
    if (consentMemo.current.get(info.origin) === true) return Promise.resolve(true);
    return new Promise((resolve) => {
      setPendingConsent({
        ...info,
        resolve: (allowed, remember) => {
          if (remember) consentMemo.current.set(info.origin, allowed);
          setPendingConsent(null);
          resolve(allowed);
        },
      });
    });
  }

  function confirmHost(items: PendingHostConfirm["items"]): Promise<boolean> {
    return new Promise((resolve) => {
      setPendingHost({
        items,
        resolve: (approved) => {
          setPendingHost(null);
          resolve(approved);
        },
      });
    });
  }

  async function executeRun(options: ExecuteOptions = {}) {
    if (running) return;
    setError("");
    setNotice("");
    if (!settings.authorized) {
      setError("Confirm that you own or are authorized to test the target origin before a run.");
      setView("mission");
      return;
    }
    if (settings.executionMode === "live" && !settings.apiKey.trim()) {
      setError("Live mode needs a provider key in this tab. Add one, or switch to deterministic fixture mode.");
      setView("mission");
      return;
    }
    const missionId = options.missionId || settings.missionId;
    const version = options.version || settings.version;
    const targetBaseUrl = options.targetBaseUrl || settings.targetBaseUrl;
    const controller = new AbortController();
    abortRef.current = controller;
    setRunning(true);
    try {
      const result = await runMission({
        missionId,
        version,
        targetBaseUrl,
        executionMode: settings.executionMode,
        router: settings.router,
        model: settings.model,
        apiKey: settings.apiKey,
        issueApprovalToken:
          options.businessApprovalIssued ?? (version === "repaired" && settings.issueApprovalToken),
        autoConfirmHost: settings.autoConfirmHost,
        requestConsent,
        confirmHost,
        signal: controller.signal,
        replayRequests: options.replayRequests,
        adaptiveRequest: options.adaptiveRequest,
        expectedNetworkHash: options.expectedNetworkHash,
        replay: options.replay,
      });
      setOutput(result);
      await saveRun(result.record);
      await refreshRuns();
      setView("case");
      if (options.replayRequests && result.record.executionSource === "fixture" && options.replay) {
        setNotice(
          "Replay completed with stored request strings. This run used the deterministic fixture and is labeled as such.",
        );
      }
    } catch (caught) {
      const message = String((caught as Error).message || caught);
      setError(message);
      if (caught instanceof ConsentDeclinedError) {
        setView("mission");
      }
    } finally {
      setRunning(false);
      abortRef.current = null;
    }
  }

  async function repairAndRerun(run?: RunRecord) {
    const baseline = run || (output?.record.scenarioVersion === "vulnerable" ? output.record : undefined);
    if (!baseline) {
      setError("Run a vulnerable fixture first, then apply the reviewed repair.");
      return;
    }
    if (repairing) return;
    setRepairing(true);
    setError("");
    try {
      const result = await runMission({
        missionId: baseline.missionId,
        version: "repaired",
        targetBaseUrl: baseline.target.targetOrigin,
        executionMode: settings.executionMode,
        router: settings.router,
        model: settings.model,
        apiKey: settings.apiKey,
        issueApprovalToken: false,
        autoConfirmHost: settings.autoConfirmHost,
        requestConsent,
        confirmHost,
        replayRequests: baseline.attackRequests,
        replay: true,
      });
      await saveRun(result.record);
      await saveTargetConfig({
        key: `${result.record.target.targetOrigin}::${result.record.target.networkName}`,
        origin: result.record.target.targetOrigin,
        networkName: result.record.target.networkName,
        versionNumber: result.record.configVersion,
        label: result.record.configLabel,
        networkHash: result.record.target.networkHash,
        createdAt: new Date().toISOString(),
        action: "reviewed-repair",
      });
      setOutput(result);
      await refreshRuns();
      setSettings((current) => ({ ...current, version: "repaired", issueApprovalToken: false }));
      setView("compare");
      setNotice("Reviewed repair recorded as target configuration v2. The same request strings were rerun.");
    } catch (caught) {
      setError(String((caught as Error).message || caught));
    } finally {
      setRepairing(false);
    }
  }

  async function replayRun(run: RunRecord) {
    setSettings((current) => ({
      ...current,
      missionId: run.missionId,
      version: run.scenarioVersion,
      targetBaseUrl: run.target.targetOrigin,
    }));
    setNotice(
      run.executionSource === "live-model" && settings.executionMode !== "live"
        ? "The saved run used a live model. This replay uses the currently selected execution source."
        : "Replaying the exact saved request strings against the recorded target version.",
    );
    await executeRun({
      missionId: run.missionId,
      version: run.scenarioVersion,
      targetBaseUrl: run.target.targetOrigin,
      replayRequests: run.attackRequests,
      expectedNetworkHash: run.target.networkHash,
      replay: true,
      businessApprovalIssued: run.scenarioSetup.businessApprovalIssued,
    });
  }

  async function adaptiveRetest() {
    if (!output) return;
    if (settings.executionMode !== "live" || !settings.apiKey.trim()) {
      setError("Adaptive generation needs a live provider key. Fixed attacks remain the regression baseline.");
      return;
    }
    setPlanning(true);
    setError("");
    setNotice("Generating one adaptive request from the public objective and prior replies, then running it as a separately labeled retest.");
    try {
      const mission = MISSIONS[output.record.missionId];
      const prior = output.privateReplies.map((reply) => ({
        ...reply,
        text: output.canary ? reply.text.split(output.canary).join("[REDACTED_CANARY]") : reply.text,
      }));
      const adaptiveRequest = await generateAdaptiveRequest({
        mission,
        priorReplies: prior,
        router: settings.router,
        model: settings.model,
        apiKey: settings.apiKey,
      });
      setNotice("Adaptive request generated. Running it as a separately labeled one-turn retest.");
      await executeRun({
        missionId: output.record.missionId,
        version: output.record.scenarioVersion,
        targetBaseUrl: output.record.target.targetOrigin,
        adaptiveRequest,
        expectedNetworkHash: output.record.target.networkHash,
        replay: false,
      });
    } catch (caught) {
      setError(String((caught as Error).message || caught));
    } finally {
      setPlanning(false);
    }
  }

  function exportCurrent(format: "json" | "markdown") {
    if (!output) return;
    const report = toPublicReport(output.record, {
      canary: output.canary,
      apiKey: settings.apiKey,
      secrets: [settings.apiKey].filter(Boolean),
    });
    const text = format === "json" ? JSON.stringify(report, null, 2) : reportToMarkdown(report);
    const blob = new Blob([text], { type: format === "json" ? "application/json" : "text/markdown" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `agent-undercover-${report.missionId}-${report.runId.slice(0, 8)}.${format === "json" ? "json" : "md"}`;
    anchor.click();
    URL.revokeObjectURL(url);
    setNotice("Sanitized report exported. The canary and provider key are excluded.");
  }

  async function deleteSaved(runId: string) {
    if (!window.confirm("Delete this sanitized run record from this browser?")) return;
    await deleteRun(runId);
    await refreshRuns();
    if (output?.record.runId === runId) setOutput(null);
  }

  function loadSaved(run: RunRecord) {
    setOutput({ record: run, privateReplies: [], requests: run.attackRequests });
    setSettings((current) => ({
      ...current,
      missionId: run.missionId,
      version: run.scenarioVersion,
      targetBaseUrl: run.target.targetOrigin,
    }));
    setView("case");
    setNotice("Loaded a sanitized saved record. The session-only canary from the original run is not available.");
  }

  function stopRun() {
    abortRef.current?.abort();
    if (pendingHost) {
      pendingHost.resolve(false);
      setPendingHost(null);
    }
    if (pendingConsent) {
      pendingConsent.resolve(false, false);
      setPendingConsent(null);
    }
    setNotice("Stopping after the current provider call. The run will record a cancellation if it can stop between turns.");
  }

  const compareMissionId = output?.record.missionId || settings.missionId;
  const pair = {
    vulnerable: runs.find((run) => run.missionId === compareMissionId && run.scenarioVersion === "vulnerable"),
    repaired: runs.find((run) => run.missionId === compareMissionId && run.scenarioVersion === "repaired"),
  };

  const nav: Array<{ id: ViewName; label: string; detail: string }> = [
    { id: "mission", label: "Mission", detail: "Set up a bounded test" },
    { id: "case", label: "Case file", detail: output ? MISSIONS[output.record.missionId].title : "No run yet" },
    { id: "compare", label: "Compare", detail: "Repair and replay" },
    { id: "published", label: "Published network", detail: "Callable explainer" },
  ];

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand-block">
          <img src="/branding/icon.png" alt="" className="brand-icon" width="44" height="44" />
          <div>
            <p className="eyebrow">Agent Undercover</p>
            <h1>Send a spy. Find the leak. Fix the boundary.</h1>
          </div>
        </div>
        <div className="header-status">
          <span className={`badge ${settings.executionMode === "live" ? "good" : "neutral"}`}>
            {settings.executionMode === "live" ? "Live BYOK mode" : "Fixture mode"}
          </span>
          <span className={`badge ${settings.apiKey ? "good" : "neutral"}`}>
            {settings.apiKey ? "Key in memory" : "No key"}
          </span>
          <span className="badge neutral">Two origins · caller browser</span>
        </div>
      </header>

      <div className="app-layout">
        <nav className="side-nav" aria-label="Workbench sections">
          {nav.map((item, index) => (
            <button
              type="button"
              key={item.id}
              className={view === item.id ? "active" : ""}
              aria-current={view === item.id ? "page" : undefined}
              onClick={() => setView(item.id)}
            >
              <span className="nav-index">{String(index + 1).padStart(2, "0")}</span>
              <span>
                <strong>{item.label}</strong>
                <small>{item.detail}</small>
              </span>
            </button>
          ))}
          <div className="side-note">
            <strong>Boundaries</strong>
            <p>Owned synthetic fixtures first. No generic scanner, no security certification, no peer JavaScript.</p>
          </div>
        </nav>

        <main className="main-area">
          {error ? (
            <div className="global-banner error" role="alert">
              <span>{error}</span>
              <button type="button" className="link-button" onClick={() => setError("")}>
                Dismiss
              </button>
            </div>
          ) : null}
          {notice ? (
            <div className="global-banner notice" role="status">
              <span>{notice}</span>
              <button type="button" className="link-button" onClick={() => setNotice("")}>
                Dismiss
              </button>
            </div>
          ) : null}

          {view === "mission" ? (
            <MissionSetup
              settings={settings}
              onChange={patchSettings}
              onStart={() => void executeRun()}
              onStop={stopRun}
              running={running}
            />
          ) : null}
          {view === "case" ? (
            <CaseFile
              output={output}
              onExport={exportCurrent}
              onRepair={() => void repairAndRerun()}
              onReplay={() => {
                if (output) void replayRun(output.record);
              }}
              onAdaptive={() => void adaptiveRetest()}
              repairing={repairing}
              adaptiveAvailable={settings.executionMode === "live" && Boolean(settings.apiKey)}
            />
          ) : null}
          {view === "compare" ? (
            <CompareView
              pair={pair}
              runs={runs}
              onLoadRun={loadSaved}
              onReplayRun={(run) => void replayRun(run)}
              onDeleteRun={(runId) => void deleteSaved(runId)}
              onRepair={() => void repairAndRerun(pair.vulnerable)}
              repairing={repairing}
            />
          ) : null}
          {view === "published" ? <PublishedNetwork settings={settings} current={output} /> : null}

          {running || planning ? (
            <div className="running-bar" role="status">
              <span className="spinner" aria-hidden="true" />
              {planning ? "Generating an adaptive request…" : "Mission running. Consent decisions and synthetic writes may wait for you."}
              <button type="button" className="btn ghost small" onClick={stopRun}>
                Stop
              </button>
            </div>
          ) : null}
        </main>
      </div>

      <ConsentDialog
        pending={pendingConsent}
        onDecision={(allowed, remember) => pendingConsent?.resolve(allowed, remember)}
      />
      <HostConfirmDialog pending={pendingHost} onDecision={(approved) => pendingHost?.resolve(approved)} />
      <section className="sr-only" aria-live="polite">
        {running ? "A mission is running." : output ? `Last outcome: ${output.record.result.outcome}.` : ""}
      </section>
    </div>
  );
}
