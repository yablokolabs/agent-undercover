import { CANARY_PLACEHOLDER, isCanary } from "@undercover/harness";
import { sha256Hex } from "@undercover/harness";
import type { RuntimeEngine, RuntimeManifest, RuntimeValidation } from "./runtime.js";
import { loadRuntime, runtimeSandboxUrl } from "./runtime.js";
import { type FetchObservation } from "./safeFetch.js";

export interface TargetArtifact {
  base: string;
  networkName: string;
  targetUrl: string;
  manifest: RuntimeManifest;
  manifestText: string;
  manifestHash: string;
  networkText: string;
  networkHash: string;
  entry: RuntimeManifest["networks"][number];
}

export interface TargetLoadResult extends TargetArtifact {
  engine: RuntimeEngine;
  validation: RuntimeValidation;
}

export function normalizeTargetBase(input: string): string {
  let url: URL;
  try {
    url = new URL(String(input || "").trim());
  } catch {
    throw new Error("Enter a complete http:// or https:// target site URL.");
  }
  if (!["http:", "https:"].includes(url.protocol)) throw new Error("The target must use http or https.");
  if (url.username || url.password) throw new Error("Target URLs must not contain credentials.");
  if (url.search || url.hash) throw new Error("The target site URL must not contain a query string or fragment.");
  return `${url.origin}${url.pathname.replace(/\/$/, "")}`;
}

function resolveArtifact(base: string, path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${base.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}

export function publicArtifactLooksSafe(text: string): { ok: true } | { ok: false; reason: string } {
  const canary = text.match(/UC-[A-Z2-9]{20}/)?.[0];
  if (canary && isCanary(canary)) {
    return { ok: false, reason: "A concrete synthetic canary appears in a public artifact; this fixture is invalid." };
  }
  if (/Bearer\s+[A-Za-z0-9._~+/=-]{12,}/i.test(text)) {
    return { ok: false, reason: "A bearer credential form appears in a public artifact." };
  }
  if (/sk-[A-Za-z0-9]{20,}/.test(text)) {
    return { ok: false, reason: "A provider-key form appears in a public artifact." };
  }
  return { ok: true };
}

/** Fetch and verify the exact target manifest entry and network definition. */
export async function preflightTarget(options: {
  base: string;
  networkName: string;
  safeFetch: typeof fetch;
}): Promise<TargetArtifact> {
  const manifestUrl = `${options.base.replace(/\/$/, "")}/agent-manifest.json`;
  const manifestResponse = await options.safeFetch(manifestUrl);
  if (!manifestResponse.ok) throw new Error(`The target manifest returned HTTP ${manifestResponse.status}.`);
  const manifestText = await manifestResponse.text();
  const safety = publicArtifactLooksSafe(manifestText);
  if (!safety.ok) throw new Error(safety.reason);
  let manifest: RuntimeManifest;
  try {
    manifest = JSON.parse(manifestText) as RuntimeManifest;
  } catch {
    throw new Error("The target manifest is not valid JSON.");
  }
  if (!Array.isArray(manifest.networks) || !manifest.networks.length) {
    throw new Error("The target manifest publishes no networks.");
  }
  const entry = manifest.networks.find((item) => item.name === options.networkName);
  if (!entry) {
    const choices = manifest.networks.map((item) => item.name).join(", ") || "none";
    throw new Error(`No published network named '${options.networkName}'. Published networks: ${choices}.`);
  }
  if (!entry.front_man || !entry.hocon) throw new Error("The manifest entry is missing front_man or hocon.");
  const networkUrl = resolveArtifact(options.base, entry.hocon);
  const networkResponse = await options.safeFetch(networkUrl);
  if (!networkResponse.ok) throw new Error(`The network definition returned HTTP ${networkResponse.status}.`);
  const networkText = await networkResponse.text();
  const networkSafety = publicArtifactLooksSafe(networkText);
  if (!networkSafety.ok) throw new Error(networkSafety.reason);
  let config: Record<string, unknown>;
  try {
    config = JSON.parse(networkText) as Record<string, unknown>;
  } catch {
    throw new Error("The target network definition is not valid JSON.");
  }
  const tools = config.tools;
  if (!Array.isArray(tools) || !tools.length) throw new Error("The network definition has no agent entries.");
  const names = tools.map((tool) => (tool && typeof tool === "object" ? (tool as { name?: string }).name : "")).filter(Boolean);
  if (!names.includes(entry.front_man)) throw new Error(`The network does not define its declared front_man '${entry.front_man}'.`);
  return {
    base: options.base,
    networkName: options.networkName,
    targetUrl: `${options.base.replace(/\/$/, "")}/${entry.name}`,
    manifest,
    manifestText,
    manifestHash: await sha256Hex(manifestText),
    networkText,
    networkHash: await sha256Hex(networkText),
    entry,
  };
}

export async function createTargetEngine(options: {
  artifact: TargetArtifact;
  router: string;
  model: string;
  apiKey: string;
  safeFetch: typeof fetch;
  onTrace?: (event: unknown) => void;
  onFetchObserved?: (observation: FetchObservation) => void;
}): Promise<TargetLoadResult> {
  const runtime = await loadRuntime();
  const trace = new runtime.TraceBus();
  if (options.onTrace) {
    trace.addEventListener("event", (event) => options.onTrace?.((event as CustomEvent).detail));
  }
  const engine = new runtime.Engine({
    originUrl: options.artifact.base,
    networkName: options.artifact.networkName,
    trace,
    sandboxWorkerUrl: runtimeSandboxUrl(),
    byokKey: options.apiKey,
    routerOverride: options.router,
    modelOverride: options.model,
    fetchImpl: options.safeFetch,
  });
  const loaded = await engine.loadTop();
  if (loaded.network.name !== options.artifact.networkName) {
    throw new Error(`The runtime loaded '${loaded.network.name}', not the approved '${options.artifact.networkName}'.`);
  }
  return {
    ...options.artifact,
    engine,
    validation: loaded.validation,
  };
}

export function overlayLegacyCanary(engine: RuntimeEngine, version: "vulnerable" | "repaired", canary: string): void {
  if (!engine.top) throw new Error("The target network is not loaded.");
  const front = engine.top.network.getAgentSpec(engine.top.network.findFrontMan());
  if (!front) throw new Error("The target front agent is missing.");
  const instructions = String(front.instructions || "");
  if (version === "vulnerable") {
    if (!instructions.includes(CANARY_PLACEHOLDER)) {
      throw new Error("The weak fixture does not declare the private canary placeholder; refusing the test.");
    }
    front.instructions = instructions.split(CANARY_PLACEHOLDER).join(canary);
    if (!front.instructions.includes(canary)) throw new Error("The private canary was not placed in the target invocation context.");
  } else {
    if (instructions.includes(CANARY_PLACEHOLDER) || instructions.includes(canary)) {
      throw new Error("The repaired fixture still exposes a private canary placeholder or value.");
    }
  }
  // Keep the private value out of the public manifest/network objects.
  if (JSON.stringify(engine.top.manifest).includes(canary)) {
    throw new Error("The private canary reached manifest metadata; refusing the run.");
  }
}
