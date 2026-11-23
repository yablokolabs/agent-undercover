// Shared record shapes for missions, runs and public reports. These are data-only:
// no runtime objects, provider keys or private canary values belong here.

export type MissionId = "secret" | "discount" | "approval";
export type TargetVersion = "vulnerable" | "repaired";
export type Outcome =
  | "confirmed_disclosure"
  | "no_match"
  | "confirmed_unauthorized_effect"
  | "blocked"
  | "authorized_effect"
  | "inconclusive"
  | "cancelled"
  | "error";

export type ExecutionSource = "live-model" | "fixture";

export interface AttackTurn {
  id: string;
  tactic: string;
  text: string;
}

export interface SpyGrammar {
  maxChars: number;
  allowUrls: boolean;
  allowCode: boolean;
  note: string;
}

export interface MissionDefinition {
  id: MissionId;
  title: string;
  short: string;
  objective: string;
  grammar: SpyGrammar;
  attacks: AttackTurn[];
  target: {
    brand: string;
    description: string;
    publicFacts: string[];
  };
  groundTruth: Record<string, string | number | boolean>;
  oracle: string;
}

export interface TargetNetworkVersion {
  missionId: MissionId;
  version: TargetVersion;
  versionNumber: 1 | 2;
  label: string;
  networkName: string;
  artifactPath: string;
  hash?: string;
  change?: string;
}

export interface EventRecord {
  seq: number;
  atMs: number;
  type: string;
  payload: Record<string, unknown>;
}

export interface ActionEvidence {
  action: string;
  effect: "read" | "write" | "irreversible";
  arguments: Record<string, unknown>;
  status: "proposed" | "applied" | "rejected" | "unknown" | "cancelled";
  result?: Record<string, unknown> | string;
  reason?: string;
}

export interface TargetRunEvidence {
  targetOrigin: string;
  targetUrl: string;
  networkName: string;
  networkHash: string;
  manifestHash: string;
  configVersion: number;
  configLabel: string;
  validation: { errors: string[]; warnings: string[]; external: string[] };
}

export interface OracleEvidence {
  kind: MissionId;
  outcome: Outcome;
  summary: string;
  detail: Record<string, unknown>;
  limitations: string[];
}

export interface RunResult {
  outcome: Outcome;
  summary: string;
  oracle: OracleEvidence;
  misleadingPromise: boolean;
  actions: ActionEvidence[];
  hostConfirmations: HostConfirmation[];
}

export interface HostConfirmation {
  action: string;
  arguments: Record<string, unknown>;
  approved: boolean;
  atMs: number;
}

export interface RunRecord {
  schemaVersion: 1;
  runId: string;
  createdAt: string;
  missionId: MissionId;
  scenarioVersion: TargetVersion;
  configVersion: number;
  configLabel: string;
  executionSource: ExecutionSource;
  runtimeCommit: string;
  upstreamCommit: string;
  specVersion: string;
  target: TargetRunEvidence;
  routerOrigin: string;
  modelId: string;
  generationSettings: Record<string, string | number | boolean>;
  attackPlanId: string;
  attackPlanHash: string;
  attackRequests: string[];
  scenarioSetup: {
    businessApprovalIssued: boolean;
  };
  requestedLimits: {
    maxTurns: number;
    maxReplyChars: number;
    maxOutputChars: number;
    timeoutMs: number;
    maxRequests: number;
  };
  observedUsage: {
    turns: number;
    targetReplies: number;
    elapsedMs: number;
    modelCalls: number;
    requestCharacters: number;
    replyCharacters: number;
  };
  events: EventRecord[];
  result: RunResult;
  /** True when a saved test was rerun with the exact stored request strings. */
  replay: boolean;
  /** Present only for adaptive retests; the fixed plan stays the regression baseline. */
  attackSource: "fixed" | "adaptive";
  notes: string[];
}

export interface PublicReport {
  schemaVersion: 1;
  runId: string;
  createdAt: string;
  missionId: MissionId;
  scenarioVersion: TargetVersion;
  configVersion: number;
  executionSource: ExecutionSource;
  runtimeCommit: string;
  upstreamCommit: string;
  specVersion: string;
  targetOrigin: string;
  networkName: string;
  networkHash: string;
  routerOrigin: string;
  modelId: string;
  generationSettings: Record<string, string | number | boolean>;
  attackPlanHash: string;
  attackRequests: string[];
  scenarioSetup: RunRecord["scenarioSetup"];
  requestedLimits: RunRecord["requestedLimits"];
  observedUsage: RunRecord["observedUsage"];
  events: EventRecord[];
  result: RunResult;
  replay: boolean;
  attackSource: RunRecord["attackSource"];
  redactions: string[];
  limitations: string[];
}

export interface TargetModule {
  missionId: MissionId;
  version: TargetVersion;
  spec: {
    networkName: string;
    actions: string[];
    canaryPlaceholder: boolean;
  };
}
