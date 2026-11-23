// Minimal typed surface over the pinned browser runtime loaded from this origin's
// public /runtime folder. The runtime is data-driven; this file does not wrap or
// replace it.

export interface RuntimeAgentSpec {
  name: string;
  instructions?: string;
  function?: { description?: string; parameters?: Record<string, unknown> };
  tools?: Array<string | { url: string; tools?: string[] }>;
  max_steps?: number;
  llm_config?: { model_name?: string };
}

export interface RuntimeNetwork {
  name: string;
  config: Record<string, unknown>;
  specMap: Map<string, RuntimeAgentSpec>;
  findFrontMan(): string;
  getAgentSpec(name: string): RuntimeAgentSpec | null;
}

export interface RuntimeManifest {
  brand?: string;
  networks: Array<{
    name: string;
    front_man: string;
    hocon: string;
    description?: string;
    sample_queries?: string[];
    undercover_fixture?: { mission: string; version: number; weakness: string };
  }>;
  llm_router?: { base_url?: string; mock?: boolean; byok_router?: string };
  allowed_peers?: string[];
  peer_policy?: { mode?: string; deny_origins?: string[]; note?: string };
  actions?: { version?: number; agentTools?: string[]; module?: string; bridge?: string };
  deployment?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface RuntimeValidation {
  errors: string[];
  warnings: string[];
  externals?: string[];
  mcps?: string[];
}

export interface ActionCatalogEntry {
  ref: string;
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  effect: "read" | "write" | "irreversible";
  availability: string;
}

export interface ActionDefinition {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  outputSchema?: Record<string, unknown>;
  effect?: "read" | "write" | "irreversible";
  availability?: "local-only" | "bridge" | "top-level";
  timeoutMs?: number;
  execute(args: Record<string, unknown>, context: { requestId: string; signal?: AbortSignal }): unknown;
}

export interface RuntimeActions {
  entries: Map<string, unknown>;
  register(scope: { base: string; network: string }, definition: ActionDefinition): string;
  catalog(scope: { base: string; network: string }): ActionCatalogEntry[];
  discoveryIssues: Array<Record<string, unknown>>;
}

export interface TraceEvent {
  phase: string;
  kind?: string;
  seq: number;
  status?: string;
  error?: string;
  [key: string]: unknown;
}

export interface RuntimeTrace {
  events: TraceEvent[];
  start(kind: string, fields?: Record<string, unknown>): string;
  end(id: string, fields?: Record<string, unknown>): void;
  fail(id: string, error: unknown): void;
  note(kind: string, fields?: Record<string, unknown>): void;
  addEventListener(type: string, listener: (event: Event) => void): void;
  removeEventListener(type: string, listener: (event: Event) => void): void;
}

export interface RuntimeEngine {
  originUrl: string;
  top: {
    network: RuntimeNetwork;
    base: string;
    manifest: RuntimeManifest;
    llm: unknown;
    validation?: RuntimeValidation;
    [key: string]: unknown;
  } | null;
  actions: RuntimeActions;
  trace: RuntimeTrace;
  byokKey: string;
  routerOverride: string;
  modelOverride: string;
  mockLLM?: boolean;
  onActionConfirm: (items: ActionReviewItem[]) => Promise<boolean>;
  onConsent: ((info: Record<string, unknown>) => Promise<"allow" | "always" | "decline">) | null;
  resetHistory(): void;
  loadTop(): Promise<{ network: RuntimeNetwork; manifest: RuntimeManifest; validation: RuntimeValidation }>;
  runTurn(text: string, options?: { slyData?: Record<string, unknown> }): Promise<{
    text: string;
    presentation?: unknown;
    [key: string]: unknown;
  }>;
}

export interface ActionReviewItem {
  action: string;
  description?: string;
  origin: string;
  effect: string;
  arguments: Record<string, unknown>;
}

export interface RuntimeExports {
  Engine: new (options: {
    originUrl: string;
    trace: RuntimeTrace;
    sandboxWorkerUrl?: string;
    byokKey?: string;
    routerOverride?: string;
    modelOverride?: string;
    fetchImpl?: typeof fetch;
    networkName?: string;
  }) => RuntimeEngine;
  TraceBus: new () => RuntimeTrace;
  AgentNetwork: new (config: Record<string, unknown>, name: string) => RuntimeNetwork;
  validateNetwork(network: RuntimeNetwork): RuntimeValidation;
}

export async function loadRuntime(): Promise<RuntimeExports> {
  const url = new URL("/runtime/index.js", location.origin).href;
  return (await import(/* @vite-ignore */ url)) as RuntimeExports;
}

export function runtimeSandboxUrl(): string {
  return new URL("/runtime/sandbox-worker.js", location.origin).href;
}
