# Runtime provenance

Source: the browser runtime bundled with the official agentic-web examples at
`cognizant-ai-labs/agentic-web` commit `7817c1f75b8d4f497c869540212be17dda94dcae`
(skill `agentify-website/runtime`). The runtime README inside that bundle pins the
underlying nsDeploy browser runtime to commit `53a787c` (2026-11-11).

License: Apache License 2.0, preserved in `LICENSE.txt`.

## Local adapter changes

Two small changes are made here and nowhere else. They are intentionally marked
`Undercover adapter` in the source.

1. `remote.js` — `fetchManifest` and `fetchText` accept an optional `fetchImpl`.
   This lets the workbench apply an exact-origin, redirect-denying fetch policy at
   the public-artifact boundary instead of silently following an undeclared hop.
2. `engine.js` — `Engine` accepts `fetchImpl` and `networkName`. `loadTop()` selects
   the exact named network (and fails if it is absent) rather than always taking
   `networks[0]`. All manifest/network/links fetches use the supplied fetch.

No runtime method is fabricated, no global `fetch` is patched, and no remote
JavaScript is downloaded in v1. `scripts/sync-runtime.mjs` copies this directory
verbatim into both public origins; `scripts/check-artifacts.mjs` verifies it.
