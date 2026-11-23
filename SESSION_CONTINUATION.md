# Resume Agent Undercover

**Last checkpoint:** 23 November 2026, 08:25 UTC  
Read `AGENTS.md`, `docs/PROGRESS.md` and `docs/CONFORMANCE_RESULTS.md` before changing behavior. The source is published at <https://github.com/yablokolabs/agent-undercover> on branch `main`; `gh-pages` serves the site.

## Current state

The local fixture product is built and verified:

- React/Vite workbench on `5173`, static synthetic target on `5174`;
- pinned reference runtime, exact-name loading, consent, budgets and deterministic oracles;
- six target networks (three missions × vulnerable/repaired);
- repair/replay, sanitized IndexedDB records and JSON/Markdown export;
- published `case_explainer` workbench network;
- 35 tests and 61 artifact checks passing;
- architecture diagram and browser screenshots;
- a 66.5-second silent 1080p Remotion picture lock at `docs/assets/agent-undercover-demo-silent.mp4`, with `video/narration-script.md` for the entrant voice;
- a narrated 119.4-second public demo master at `docs/assets/agent-undercover-demo-public.mp4`, copied unchanged from `video/public/agent-undercover-demo.mp4`;
- both public origins live over HTTPS, with public artifact, CORS and cross-origin fixture checks passing;
- the narrated demo published publicly at <https://vimeo.com/1249258448> (1:59).

## Not complete

- A successful live-model run. Route reachability was re-checked on 23 November 2026: a headed Chromium browser passes preflight and the router answers HTTP 401 for a placeholder key, so the route works with a real key. The earlier HTTP 405 came from headless Chromium, which the provider's edge blocks. No live completion is claimed because no provider key was used.
- Portal submission and the remaining checklist rows. The narrated master is public; the portal rules, deadline and accepted video host are unverified.

## Guardrails

Keep the canary and oracle ground truth out of spy prompts, public artifacts, saved records and exports. Keep provider keys in session memory and send them only to the selected inference endpoint. Do not run peer-provided executable JavaScript. Do not describe a fixture run as live-model evidence. Do not claim general security certification or NANDA/A2A/MCP/WebMCP support.

## Next action

Verify the portal accepts a Vimeo link and confirm the deadline, finish the checklist in `docs/DEMO_AND_SUBMISSION.md`, and submit. Separately, verify a browser-CORS inference route before any live-model claim. If a key is ever printed by local tooling, revoke and rotate it before continuing.
