# Resume Agent Undercover

**Last checkpoint:** 23 November 2026, 18:34 UTC  
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
- the narrated demo published publicly on YouTube at <https://youtu.be/AfliF9OMVOo> (1:59), with a Vimeo mirror at <https://vimeo.com/1249258448>.

## Not complete

- A successful live-model run. Route reachability was re-checked on 23 November 2026: a headed Chromium browser passes preflight and the router answers HTTP 401 for a placeholder key, so the route works with a real key. The earlier HTTP 405 came from headless Chromium, which the provider's edge blocks. No live completion is claimed because no provider key was used.
- The Devpost form itself: the site, description, screenshots and YouTube link are ready, but the form has not been filled in or submitted.

## Guardrails

Keep the canary and oracle ground truth out of spy prompts, public artifacts, saved records and exports. Keep provider keys in session memory and send them only to the selected inference endpoint. Do not run peer-provided executable JavaScript. Do not describe a fixture run as live-model evidence. Do not claim general security certification or NANDA/A2A/MCP/WebMCP support.

## Next action

Fill in the Devpost form from `docs/DEVPOST_PROJECT_STORY.md` and `docs/DEMO_AND_SUBMISSION.md`, using <https://youtu.be/AfliF9OMVOo> as the video link, then submit before 11 January 2027, 16:00 UTC. Separately, run one live mission with a provider key before any live-model claim. If a key is ever printed by local tooling, revoke and rotate it before continuing.
