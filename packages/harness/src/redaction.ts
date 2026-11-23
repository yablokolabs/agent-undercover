const SENSITIVE_KEY = /(authorization|api[-_]?key|provider[-_]?key|bearer|token|password|secret|canary|cookie)/i;
const QUERY_URL = /\bhttps?:\/\/[^\s<>"']+/g;

export interface RedactionOptions {
  canary?: string;
  apiKey?: string;
  secrets?: string[];
  maxString?: number;
}

/**
 * Replace secrets and query strings before any trace, report or persisted record
 * leaves the run. The canary is replaced with a stable marker, not a hash: a hash
 * of a synthetic low-entropy value could still be brute-forced.
 */
export function redactText(input: string, options: RedactionOptions = {}): string {
  let text = String(input ?? "");
  for (const secret of [options.canary, options.apiKey, ...(options.secrets || [])]) {
    if (secret && secret.length >= 4) text = text.split(secret).join("[REDACTED]");
  }
  text = text.replace(/\bBearer\s+[^\s,;]+/gi, "Bearer [REDACTED]");
  text = text.replace(QUERY_URL, (url) => stripUrlQuery(url));
  const max = options.maxString ?? 2000;
  return text.length > max ? `${text.slice(0, max)}… [truncated ${text.length - max} chars]` : text;
}

export function stripUrlQuery(url: string): string {
  try {
    const parsed = new URL(url);
    return `${parsed.origin}${parsed.pathname}`;
  } catch {
    return url.split("?")[0] ?? url;
  }
}

/** Recursively sanitize JSON-safe data; keys that can hold credentials are replaced. */
export function redactValue(value: unknown, options: RedactionOptions = {}, depth = 0): unknown {
  if (depth > 8) return "[depth limit]";
  if (value == null) return value;
  if (typeof value === "string") return redactText(value, options);
  if (typeof value === "number" || typeof value === "boolean") return value;
  if (Array.isArray(value)) return value.slice(0, 100).map((item) => redactValue(item, options, depth + 1));
  if (typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, entry] of Object.entries(value as Record<string, unknown>).slice(0, 100)) {
      out[key] = SENSITIVE_KEY.test(key) ? "[REDACTED]" : redactValue(entry, options, depth + 1);
    }
    return out;
  }
  return String(value);
}

/** Assert that a provider key does not occur anywhere in a JSON-safe value. */
export function assertNoSecret(value: unknown, secrets: string[], path = "$"): void {
  const text = typeof value === "string" ? value : JSON.stringify(value);
  for (const secret of secrets) {
    if (secret && secret.length >= 4 && text.includes(secret)) {
      throw new Error(`Secret material found at ${path}; refusing to export.`);
    }
  }
}

export function redactUrlForDisplay(url: string): string {
  return stripUrlQuery(url);
}
