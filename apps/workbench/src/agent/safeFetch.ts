import { redactUrlForDisplay } from "@undercover/harness";

export interface FetchObservation {
  url: string;
  origin: string;
  status: "ok" | "http-error" | "denied-origin" | "redirect-or-network-error";
  httpStatus?: number;
  ms: number;
}

export class OriginPolicyError extends Error {
  readonly code = "ORIGIN_POLICY";
}

/**
 * Build a fetch implementation for public artifact loading. It only contacts
 * explicitly approved origins, refuses redirects, strips request credentials and
 * never sends a provider key. Any undeclared hop fails closed.
 */
export function createApprovedFetch(options: {
  allowedOrigins: string[];
  observe?: (observation: FetchObservation) => void;
}): typeof fetch {
  const allowed = new Set(options.allowedOrigins.map((origin) => new URL(origin).origin));
  return (async (input: RequestInfo | URL, init: RequestInit = {}) => {
    const started = performance.now();
    let url: URL;
    try {
      const raw = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
      url = new URL(raw, location.href);
    } catch {
      throw new OriginPolicyError("The artifact URL is invalid; refusing contact.");
    }
    if (!["http:", "https:"].includes(url.protocol) || !allowed.has(url.origin)) {
      options.observe?.({
        url: redactUrlForDisplay(url.href),
        origin: url.origin,
        status: "denied-origin",
        ms: Math.round(performance.now() - started),
      });
      throw new OriginPolicyError(`Contact with undeclared origin ${url.origin} was denied.`);
    }
    const headers = new Headers(init.headers || {});
    headers.delete("authorization");
    headers.delete("cookie");
    headers.delete("proxy-authorization");
    try {
      const response = await fetch(url.href, {
        ...init,
        headers,
        credentials: "omit",
        redirect: "error",
        cache: init.cache ?? "no-store",
        referrerPolicy: "no-referrer",
      });
      options.observe?.({
        url: redactUrlForDisplay(url.href),
        origin: url.origin,
        status: response.ok ? "ok" : "http-error",
        httpStatus: response.status,
        ms: Math.round(performance.now() - started),
      });
      return response;
    } catch (error) {
      if (error instanceof OriginPolicyError) throw error;
      options.observe?.({
        url: redactUrlForDisplay(url.href),
        origin: url.origin,
        status: "redirect-or-network-error",
        ms: Math.round(performance.now() - started),
      });
      throw new OriginPolicyError(
        `Artifact fetch failed for ${url.origin}${url.pathname}. Redirects to a new origin are denied; check CORS and the published paths.`,
      );
    }
  }) as typeof fetch;
}
