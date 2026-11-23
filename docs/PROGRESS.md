# Progress

**Checkpoint:** 23 November 2026, 18:34 UTC  
**Git:** source published at <https://github.com/yablokolabs/agent-undercover>, branch `main`; `gh-pages` continues to serve the site  
**State:** local fixture build ready; both public origins live; narrated demo master published on YouTube at <https://youtu.be/AfliF9OMVOo>

## Milestones

- [x] **M0 — spec and runtime.** Pinned the Open Agentic Web MVP Profile 0.2 material at `agentic-web@7817c1f`; vendored the reference browser runtime with two documented adapter changes; copied it byte-identically to both public origins.
- [x] **M1 — two-origin loading and consent.** Built the exact-origin, redirect-denying artifact fetch; consent dialog; exact-name validation; runtime loader; BYOK session state.
- [x] **M2 — three missions.** Implemented secret disclosure, unauthorized discount and approval bypass, each with vulnerable and repaired published networks.
- [x] **M3 — deterministic findings and effects.** Implemented per-run canary, spy grammar, budgets, discount and approval ledgers, oracles, bounded event log and hashes.
- [x] **M4 — repair, replay and reports.** Implemented versioned repair, stored-request replay, hash checks, IndexedDB sanitized records and JSON/Markdown export.
- [x] **M5 — local conformance and evidence.** Added 35 tests, 61 artifact checks, schema validation, architecture diagram, screenshots and conformance report.
- [x] **M6 — public demo.** Both origins are live on separate GitHub Pages repositories with DNS-only CNAMEs, approved exact-hostname certificates and HTTPS enforced. Public artifact, CORS and cross-origin fixture checks pass.
- [~] **M7 — live model proof.** Browser reachability verified on 23 November 2026: headed Chromium passes the Hugging Face Router preflight and receives HTTP 401 for a placeholder key, and OpenRouter, Mistral, Gemini and Groq also pass. The earlier 405 was headless-only. A completed live mission still needs a provider key.
- [~] **M8 — submission.** The narrated public demo master is finalized at `docs/assets/agent-undercover-demo-public.mp4`: 119.4 seconds (1:59.4), 1920×1080, 30 fps, H.264 with 48 kHz stereo AAC, −17.9 LUFS integrated, −4.3 dBFS true peak. It was supplied byte-identically from `video/public/agent-undercover-demo.mp4` (same MD5, streams untouched). The earlier 108.8-second silent cut (`docs/assets/agent-undercover-demo-public-silent.mp4`) and the 66.5-second Remotion picture lock remain as sources. The narrated cut is public on YouTube at <https://youtu.be/AfliF9OMVOo> (`agent undercover demo`, 119 s) with a Vimeo mirror at <https://vimeo.com/1249258448>, and the source is published at <https://github.com/yablokolabs/agent-undercover>. The portal submission and the live-model row stay open.

## Exact checks at this checkpoint

```text
npm test                 7 files, 35 tests passed
npm run test:e2e         1 Playwright browser test passed
npm run check:artifacts  61/61 checks passed
npm run typecheck        passed
npm run build            passed
```

Browser flows: consent, secret v1/v2, discount v1/v2, approval v1/v2, host confirmation, exact-name rejection, export, compare, replay and published explainer. No console errors in the checked flows.

Public HTTPS checks (17 November 2026): both root documents, both manifests, all six target networks, the workbench network and all runtime files returned HTTP 200 with `access-control-allow-origin: *` using normal DNS and certificate validation. A cross-origin headless Chromium run loaded `https://undercover-target.yablokolabs.com/agent-manifest.json` and `undercover_secret_v1.network.json`, completed with **Confirmed disclosure**, and produced no console or page errors. A fake key appeared in neither local nor session storage and cleared from memory. Both HTTP origins return `301` to HTTPS. See `docs/DEPLOYMENT.md`.

Re-checked 23 November 2026: both root documents, both manifests and `undercover_secret_v1.network.json` returned HTTP 200 with `access-control-allow-origin: *`. The narrated master was added and `npm run verify`, `npm run test:e2e` and `npm run check:artifacts` (61/61) passed again.

## Evidence paths

- `docs/CONFORMANCE_RESULTS.md` — clause-to-evidence map.
- `docs/EVALUATION.md` — commands and observed browser results.
- `docs/assets/screenshots/` — public UI screenshots.
- `docs/assets/agent-undercover-demo-public.mp4` — 119.4-second narrated public demo master.
- `docs/assets/agent-undercover-submission.pdf` — 9-page submission dossier (1.3 MB), rebuilt by `npm run build:submission-pdf`.
- `docs/assets/agent-undercover-demo-public-silent.mp4` — 108.8-second live-public silent cut.
- `docs/DEMO_NARRATION.txt` and `docs/DEMO_NARRATION_TIMED.md` — first-person script, timestamps, pauses and audio setup.
- `assets/architecture.svg` and `assets/architecture.png` — architecture.
- `vendor/agentic-web-runtime/UNDERCOVER_ADAPTER.md` — adapter changes and upstream pin.
- `tests/` — deterministic regression suite.

## Blockers and boundaries

- The default live router is reachable from a headed browser but blocked for headless Chromium; no live-model result is claimed.
- Public deployment is static GitHub Pages; the target does not execute the mission.
- The 66.5-second Remotion cut is silent; the narrated public demo master is the submission candidate.
- `docs/DEMO_NARRATION_TIMED.md` timings describe the 108.8-second silent cut, not the 119.4-second narrated master.
- The Devpost form has not been filled in or submitted; the video link for it is <https://youtu.be/AfliF9OMVOo>.
- Devpost pages sit behind an interactive Cloudflare check that blocks automated reads; rules were read through a text mirror on 23 November 2026.
- The synthetic fixture is not a production target and does not certify any real system.

## Next concrete actions

1. Verify a browser-CORS provider route, then add a clearly labeled live run if it succeeds.
2. Fill in and submit the Devpost form using the published YouTube link <https://youtu.be/AfliF9OMVOo> before 11 January 2027, 16:00 UTC.
3. Re-run `npm run verify` on the final source and refresh the conformance and deployment records.
