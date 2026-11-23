# BYOK, contact and privacy

## Key handling

The workbench accepts a provider key in a masked session field. The key is held in React state for the tab session. It is not written to `localStorage`, IndexedDB, a URL, a saved run, an exported report or a prompt.

The key is attached only to the selected inference endpoint as an `Authorization: Bearer` header. Public manifest, network and runtime fetches use a separate exact-origin fetch that strips `authorization`, `cookie` and `proxy-authorization`, and refuses redirects.

The default suggested route is the Hugging Face Router (`https://router.huggingface.co/v1`) with `openai/gpt-oss-20b`. This route is not proven in a browser in this build: a direct OPTIONS request returned 200, but Chromium's preflight returned 405. Do not claim a live run until a normal browser completes one.

## Contact

Consent is requested before the first target artifact fetch. The dialog names the exact origin, the request, and what is not sent. A remembered decision applies only to that exact origin for the browser session. A redirect to a different origin is denied, not followed. The target fixture is not allowed to contact additional origins; the runtime consent handler declines those attempts.

## Private test material

The per-run canary and oracle ground truth exist in memory only. The weak secret fixture publishes `{{PRIVATE_CANARY}}`; the runner replaces it inside the target's in-memory front-agent instructions. The public network, manifest, saved record and report never contain the concrete value. The repaired fixture contains no placeholder and no canary.

The visitor controls the browser and can inspect its memory. A browser-side oracle does not protect a secret from a malicious browser owner or compromised same-origin code. The boundary under test is between cooperating runtime components and LLM-visible invocation contexts. Synthetic canaries are not real customer data.

## Redaction

`redactText` and `redactValue` remove supplied secrets, bearer forms and URL query strings. Sensitive object keys such as `authorization`, `apiKey`, `token`, `password`, `secret`, `canary` and `cookie` become `[REDACTED]`. The event log applies redaction at insertion. IndexedDB storage refuses a concrete canary or bearer pattern. Export runs `assertNoSecret` before returning.

The public case-file screenshot intentionally hides the session-only exact-reply panel. The live UI shows that panel so the operator can inspect the exact offending reply; it is never persisted or exported.

## Provider and peer separation

The selected model provider is a separate destination from the target publisher. A target manifest is descriptive metadata, not proof of trust. A peer cannot change the credential destination. No peer-provided executable JavaScript is run in v1.

## Limits of the claim

This is a test harness, not a security certification. A blocked action or a not-observed canary is evidence for that exact test and configuration. Timeouts and provider errors are inconclusive. Export is sanitized by default; local private replay records require an explicit action and contain no provider key. No telemetry is uploaded.
