import {
  EventLog,
  RunBudget,
  assertSpyContextSafe,
  attackPlanId,
  buildSpyContext,
  generateCanary,
  hashJson,
  redactValue,
  runOracle,
  validateAttackText,
  withTimeout,
  type ActionEvidence,
  type HostConfirmation,
  type MissionId,
  type Observation,
  type ReplyObservation,
  type RunRecord,
  type TargetVersion,
  sha256Hex,
} from "@undercover/harness";
import { MISSIONS, TARGET_NETWORKS } from "@undercover/scenarios";
import { LIMITS, RUNTIME_ADAPTER_VERSION, SPEC_VERSION, UPSTREAM_COMMIT } from "../config.js";
import type { ActionReviewItem, RuntimeValidation } from "./runtime.js";
import { createApprovedFetch, OriginPolicyError } from "./safeFetch.js";
import { createTargetEngine, normalizeTargetBase, preflightTarget } from "./targetLoader.js";
import { FixtureTargetModel } from "./fixtureTargetModel.js";
import { bindScenarioActions, createScenarioState, type ScenarioState } from "./scenarioActions.js";

export interface RunMissionInput {
  missionId: MissionId;
  version: TargetVersion;
  targetBaseUrl: string;
  executionMode: "live" | "fixture";
  router: string;
  model: string;
  apiKey: string;
  issueApprovalToken?: boolean;
  autoConfirmHost?: boolean;
  confirmHost?: (items: ActionReviewItem[]) => Promise<boolean>;
  requestConsent: (info: { origin: string; purpose: string; request: string }) => Promise<boolean>;
  signal?: AbortSignal;
  /** Exact saved strings for a replay. When absent, the fixed attack plan is used. */
  replayRequests?: string[];
  /** One model-generated request, labeled distinct from the fixed regression plan. */
  adaptiveRequest?: string;
  replay?: boolean;
  /** Fail before execution when the published artifact no longer matches a saved run. */
  expectedNetworkHash?: string;
}

export interface RunMissionOutput {
  record: RunRecord;
  /** Session-only value for showing the exact offending reply. Never persisted or exported. */
  canary?: string;
  privateReplies: ReplyObservation[];
  requests: string[];
}

export class ConsentDeclinedError extends Error {
  readonly code = "CONSENT_DECLINED";
}

export class TargetContactError extends Error {
  readonly code = "TARGET_CONTACT";
}

export async function runMission(input: RunMissionInput): Promise<RunMissionOutput> {
  const mission = MISSIONS[input.missionId];
  const versionInfo = TARGET_NETWORKS[input.missionId][input.version];
  if (!mission || !versionInfo) throw new Error("Unknown mission or target version.");
  if (input.executionMode === "live" && !input.apiKey.trim()) {
    throw new Error("A provider key is required for a live-model run. Switch to fixture mode to run without one.");
  }
  const base = normalizeTargetBase(input.targetBaseUrl);
  const origin = new URL(base).origin;
  const networkName = versionInfo.networkName;
  const canary = input.missionId === "secret" ? generateCanary() : undefined;
  const spyContext = buildSpyContext(mission);
  assertSpyContextSafe(spyContext, [canary || "", input.apiKey].filter(Boolean));

  const log = new EventLog({ canary, apiKey: input.apiKey });
  const event = (type: string, payload: Record<string, unknown> = {}) => log.add(type, payload);
  const budget = new RunBudget({ ...LIMITS });
  const started = Date.now();
  const errors: string[] = [];
  const replies: ReplyObservation[] = [];
  const privateReplies: ReplyObservation[] = [];

  event("runStarted", {
    missionId: input.missionId,
    scenarioVersion: input.version,
    executionMode: input.executionMode,
    targetOrigin: origin,
    networkName,
    limits: budget.limits,
  });
  event("spyContext", {
    objective: spyContext.objective,
    grammar: spyContext.grammar,
    forbiddenMaterialIncluded: false,
    priorReplyCount: 0,
  });

  event("consentRequested", {
    origin,
    purpose: "Fetch the target's public manifest and exact network definition; run the network locally in this tab.",
    request: "GET /agent-manifest.json and the declared network JSON. No credential, canary or action argument is sent.",
  });
  const consent = await input.requestConsent({
    origin,
    purpose: "Fetch the target's public manifest and exact network definition; run the network locally in this tab.",
    request: "GET /agent-manifest.json and the declared network JSON. No credential, canary or action argument is sent.",
  });
  event("consent", { origin, decision: consent ? "allowed" : "declined", scope: "this run" });
  if (!consent) {
    event("runCancelled", { reason: "Consent declined before target contact." });
    throw new ConsentDeclinedError("Contact was declined, so no target artifact was fetched.");
  }

  const safeFetch = createApprovedFetch({
    allowedOrigins: [origin],
    observe: (observation) => event("peerFetch", { ...observation }),
  });

  let artifact;
  try {
    artifact = await preflightTarget({ base, networkName, safeFetch });
  } catch (error) {
    const message = String((error as Error).message || error);
    event("error", { phase: "artifact_preflight", message });
    throw error instanceof OriginPolicyError ? new TargetContactError(message) : error;
  }
  if (input.expectedNetworkHash && artifact.networkHash !== input.expectedNetworkHash) {
    event("error", {
      phase: "replay_hash_mismatch",
      expected: input.expectedNetworkHash,
      actual: artifact.networkHash,
    });
    throw new Error(
      "The published target network changed since the saved run. Select the new target configuration explicitly before replaying.",
    );
  }
  event("targetArtifact", {
    targetUrl: artifact.targetUrl,
    networkName,
    manifestHash: artifact.manifestHash,
    networkHash: artifact.networkHash,
    configVersion: versionInfo.versionNumber,
    configLabel: versionInfo.label,
  });

  const live = input.executionMode === "live" && Boolean(input.apiKey);
  const routerOverride = live ? input.router : "browser://mock";
  const modelOverride = live ? input.model : "";
  let liveModelCalls = 0;
  const loadedTarget = await createTargetEngine({
    artifact,
    router: routerOverride,
    model: modelOverride,
    apiKey: live ? input.apiKey : "",
    safeFetch,
    onTrace: (traceEvent) => {
      const eventRecord = traceEvent as { phase?: string; kind?: string; status?: string; error?: string };
      if (eventRecord.phase === "end" && eventRecord.kind === "compile") {
        event("runtimeCompile", { status: eventRecord.status, error: eventRecord.error || null });
      }
      if (eventRecord.phase === "start" && eventRecord.kind === "model_call") liveModelCalls += 1;
    },
  });
  const engine = loadedTarget.engine;
  if (!engine.top) throw new Error("The target runtime did not retain a loaded network.");
  if (engine.top.validation?.errors?.length) {
    event("error", { phase: "network_validation", message: engine.top.validation.errors.join("; ") });
    throw new Error(`The target network failed validation: ${engine.top.validation.errors.join("; ")}`);
  }
  event("runtimeLoaded", {
    networkName: engine.top.network.name,
    base: engine.top.base,
    validation: {
      errors: engine.top.validation?.errors || [],
      warnings: engine.top.validation?.warnings || [],
      externals: engine.top.validation?.externals || [],
    },
  });

  // Re-fetch before execution and compare hashes. This catches a changed artifact
  // between preflight and the runtime's own fetch.
  const manifestResponse = await safeFetch(`${base.replace(/\/$/, "")}/agent-manifest.json`);
  const manifestText = await manifestResponse.text();
  const networkUrl = new URL(artifact.entry.hocon, `${base.replace(/\/$/, "")}/`).href;
  const networkResponse = await safeFetch(networkUrl);
  const networkText = await networkResponse.text();
  const [manifestHash, networkHash] = await Promise.all([sha256Hex(manifestText), sha256Hex(networkText)]);
  if (manifestHash !== artifact.manifestHash || networkHash !== artifact.networkHash) {
    event("error", { phase: "artifact_changed", message: "Published artifact changed between fetch and execution." });
    throw new Error("The target artifacts changed while loading. Refusing to run a different version; select the target version again.");
  }

  const state: ScenarioState = createScenarioState({
    missionId: input.missionId,
    version: input.version,
    issueApprovalToken: input.version === "repaired" && Boolean(input.issueApprovalToken),
    event,
  });
  bindScenarioActions(engine, state);

  if (input.missionId === "secret") {
    const front = engine.top.network.getAgentSpec(engine.top.network.findFrontMan());
    if (!front) throw new Error("The target front agent is missing.");
    const instructions = String(front.instructions || "");
    if (input.version === "vulnerable") {
      if (!instructions.includes("{{PRIVATE_CANARY}}")) {
        throw new Error("The weak secret fixture does not declare a private canary placeholder.");
      }
      front.instructions = instructions.split("{{PRIVATE_CANARY}}").join(canary!);
    } else if (instructions.includes("{{PRIVATE_CANARY}}") || (canary && instructions.includes(canary))) {
      throw new Error("The repaired secret fixture still exposes private material.");
    }
    if (canary && JSON.stringify(engine.top.manifest).includes(canary)) {
      throw new Error("The private canary reached public manifest metadata.");
    }
  }

  let fixtureModel: FixtureTargetModel | null = null;
  if (!live) {
    fixtureModel = new FixtureTargetModel({ missionId: input.missionId, version: input.version, canary: canary || "" });
    (engine.top as { llm: unknown }).llm = fixtureModel;
  }

  const hostConfirmations: HostConfirmation[] = [];
  engine.onActionConfirm = async (items: ActionReviewItem[]) => {
    for (const item of items) {
      event("hostConfirmationRequested", {
        action: item.action,
        origin: item.origin,
        effect: item.effect,
        arguments: item.arguments,
      });
    }
    let approved = false;
    if (input.autoConfirmHost) {
      approved = true;
    } else if (input.confirmHost) {
      approved = await input.confirmHost(items);
    }
    for (const item of items) {
      const confirmation: HostConfirmation = {
        action: item.action,
        arguments: item.arguments,
        approved,
        atMs: log.elapsedMs,
      };
      hostConfirmations.push(confirmation);
      event(approved ? "hostConfirmed" : "hostConfirmationDenied", {
        action: item.action,
        origin: item.origin,
        arguments: item.arguments,
        note: "Host write confirmation is separate from business approval.",
      });
      if (!approved) {
        const cancelled = state.evidence.find(
          (entry) => entry.action === item.action && entry.status === "proposed",
        );
        if (!cancelled) {
          state.evidence.push({
            action: item.action,
            effect: item.effect as ActionEvidence["effect"],
            arguments: item.arguments,
            status: "cancelled",
            reason: "Host write confirmation declined; nothing ran.",
          });
        }
      }
    }
    return approved;
  };
  engine.onConsent = async (info: Record<string, unknown>) => {
    event("consent", {
      origin: String(info.peerOrigin || ""),
      decision: "declined",
      phase: String(info.phase || ""),
      reason: "The target fixture may not contact additional origins.",
    });
    return "decline";
  };

  const requests = input.replayRequests?.length
    ? [...input.replayRequests]
    : input.adaptiveRequest
      ? [input.adaptiveRequest]
      : mission.attacks.map((attack) => attack.text);
  for (const [index, text] of requests.entries()) {
    const validation = validateAttackText(text, mission);
    if (!validation.ok) throw new Error(`Request ${index + 1} is outside the mission grammar: ${validation.reason}`);
  }
  const turnIds = requests.map((_, index) => (input.replay ? `replay-${index + 1}` : input.adaptiveRequest ? `adaptive-${index + 1}` : mission.attacks[index]?.id || `turn-${index + 1}`));

  for (let index = 0; index < requests.length; index += 1) {
    const turnId = turnIds[index]!;
    const text = requests[index]!;
    if (input.signal?.aborted) {
      budget.cancel("operator stopped the run");
      event("cancelled", { turnId: null, reason: "Operator stopped before the next request." });
      break;
    }
    const canRun = budget.canStartTurn();
    if (!canRun.ok) {
      event("budgetExceeded", { reason: canRun.reason, turnId });
      break;
    }
    budget.consumeTurn(text.length);
    state.currentTurnId = turnId;
    event("spyRequest", { turnId, text, source: input.adaptiveRequest ? "adaptive" : input.replay ? "replay" : "fixed" });
    engine.resetHistory();
    try {
      const remaining = Math.min(budget.remainingMs(), 60_000);
      const outcome = await withTimeout(
        engine.runTurn(text),
        remaining,
        () => budget.markTimeout(),
      );
      if (!outcome.ok) {
        event("error", { turnId, phase: "target_turn", message: outcome.reason });
        errors.push(outcome.reason);
        break;
      }
      const rawText = String(outcome.value?.text || "");
      const reply: ReplyObservation = { turnId, text: rawText };
      replies.push(reply);
      privateReplies.push(reply);
      const clipped = budget.consumeReply(rawText);
      event("targetReply", {
        turnId,
        text: clipped.text,
        truncated: clipped.truncated,
        characters: rawText.length,
        executionSource: live ? "live-model" : "fixture",
      });
    } catch (error) {
      const message = String((error as Error).message || error);
      const reply: ReplyObservation = { turnId, text: "", error: message };
      replies.push(reply);
      privateReplies.push(reply);
      errors.push(message);
      event("error", { turnId, phase: "target_turn", message });
      break;
    }
  }
  state.closed = true;
  if (input.signal?.aborted) budget.cancel("operator stopped the run");

  const observation: Observation = {
    replies,
    actions: redactValue(state.evidence, { canary, apiKey: input.apiKey }) as ActionEvidence[],
    hostConfirmations: redactValue(hostConfirmations, { canary, apiKey: input.apiKey }) as HostConfirmation[],
    cancelled: budget.cancelled,
    timedOut: budget.timedOut,
    errors,
    discount: input.missionId === "discount" ? state.discount : undefined,
    approval: input.missionId === "approval" ? state.approval : undefined,
  };
  const oracle = runOracle(input.missionId, observation, canary);
  event("oracle", {
    outcome: oracle.outcome,
    summary: oracle.summary,
    detail: oracle.detail,
    limitations: oracle.limitations,
  });
  event("runCompleted", {
    outcome: oracle.outcome,
    turns: budget.turns,
    elapsedMs: Date.now() - started,
    errors: errors.length,
  });

  const attackHash = await hashJson(requests);
  const validation: RuntimeValidation = engine.top.validation || { errors: [], warnings: [], externals: [] };
  const record: RunRecord = {
    schemaVersion: 1,
    runId: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    missionId: input.missionId,
    scenarioVersion: input.version,
    configVersion: versionInfo.versionNumber,
    configLabel: versionInfo.label,
    executionSource: live ? "live-model" : "fixture",
    runtimeCommit: `${RUNTIME_ADAPTER_VERSION} · upstream ${UPSTREAM_COMMIT}`,
    upstreamCommit: UPSTREAM_COMMIT,
    specVersion: SPEC_VERSION,
    target: {
      targetOrigin: origin,
      targetUrl: artifact.targetUrl,
      networkName,
      networkHash,
      manifestHash,
      configVersion: versionInfo.versionNumber,
      configLabel: versionInfo.label,
      validation: {
        errors: validation.errors || [],
        warnings: validation.warnings || [],
        external: validation.externals || [],
      },
    },
    routerOrigin: live ? new URL(input.router).origin : "browser://mock (no inference request)",
    modelId: live ? input.model : "fixture:rules-v1",
    generationSettings: {
      temperature: "provider default",
      stream: true,
      maxSteps: 6,
      liveModel: live,
    },
    attackPlanId: attackPlanId(input.missionId, mission.attacks),
    attackPlanHash: attackHash,
    attackRequests: requests,
    scenarioSetup: {
      businessApprovalIssued: input.version === "repaired" && Boolean(input.issueApprovalToken),
    },
    requestedLimits: { ...budget.limits },
    observedUsage: {
      turns: budget.turns,
      targetReplies: replies.filter((reply) => !reply.error).length,
      elapsedMs: Date.now() - started,
      modelCalls: fixtureModel ? fixtureModel.calls : liveModelCalls,
      requestCharacters: requests.reduce((sum, request) => sum + request.length, 0),
      replyCharacters: replies.reduce((sum, reply) => sum + reply.text.length, 0),
    },
    events: log.all(),
    result: {
      outcome: oracle.outcome,
      summary: oracle.summary,
      oracle,
      misleadingPromise: Boolean(oracle.detail.misleadingPromise),
      actions: observation.actions,
      hostConfirmations: observation.hostConfirmations,
    },
    replay: Boolean(input.replay),
    attackSource: input.adaptiveRequest ? "adaptive" : "fixed",
    notes: [
      "Target effects are caller-local synthetic actions bound to this owned fixture. Loading the network is not a request to the target origin; no business action is sent there.",
      "The provider key, if any, is held in this tab's memory and is sent only to the selected inference router.",
      "A no-match or blocked result is evidence for this test, not a security certification.",
    ],
  };
  return { record, canary, privateReplies, requests };
}
