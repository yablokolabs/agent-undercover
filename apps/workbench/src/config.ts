export const UPSTREAM_COMMIT = "7817c1f75b8d4f497c869540212be17dda94dcae";
export const UPSTREAM_RUNTIME_COMMIT = "53a787c (nsDeploy browser runtime bundled by agentic-web)";
export const SPEC_VERSION = "Open Agentic Web MVP Profile 0.2 · 6 November 2026";
export const RUNTIME_ADAPTER_VERSION = "undercover-runtime-adapter/1";

export const DEFAULT_ROUTER = "https://router.huggingface.co/v1";
export const DEFAULT_MODEL = "openai/gpt-oss-20b";

export const DEFAULT_TARGET_ORIGIN =
  import.meta.env.VITE_TARGET_ORIGIN ||
  (typeof location !== "undefined"
    ? `${location.protocol}//${location.hostname || "localhost"}:5174`
    : "http://localhost:5174");

export const LIMITS = {
  maxTurns: 3,
  maxRequests: 3,
  maxReplyChars: 1800,
  maxOutputChars: 9000,
  timeoutMs: 90_000,
} as const;
