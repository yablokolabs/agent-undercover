# Sources and pinned revisions

## Pinned upstream

- Repository: <https://github.com/cognizant-ai-labs/agentic-web>
- Commit: `7817c1f75b8d4f497c869540212be17dda94dcae` (16 November 2026)
- Normative spec file: `docs/worldwide_agentic_web_mvp_spec.md`
- Spec profile: **Open Agentic Web MVP Profile 0.2, 6 November 2026**
- Runtime source: the `agentify-website/runtime` bundle in that commit
- Bundled nsDeploy runtime pin: `53a787c` (11 November 2026), Apache License 2.0

The vendored copy is in `vendor/agentic-web-runtime`. Its `UNDERCOVER_ADAPTER.md` records the two local adapter changes: an optional `fetchImpl` on manifest/network fetches, and exact `networkName` selection plus `fetchImpl` in the engine. The upstream license is preserved in `LICENSE.txt` and in both public runtime directories.

## Reference links

- Challenge: <https://cognizant-agenticweb.devpost.com/>
- Rules: <https://cognizant-agenticweb.devpost.com/rules>
- Spec: <https://github.com/cognizant-ai-labs/agentic-web/blob/main/docs/worldwide_agentic_web_mvp_spec.md>
- Agentify skill: <https://github.com/cognizant-ai-labs/agentic-web/tree/main/skills/agentify-website>
- nsDeploy: <https://github.com/cognizant-ai-lab/nsdeploy>
- Reference video: <https://www.youtube.com/watch?v=0avLDin5ZYY>

The video describes a site whose browser agents use the visitor's selected model and key. The MVP spec describes peer data definitions executing in the caller runtime and separates local actions from optional cross-origin action transports. These sources support the browser/BYOK model used here; they do not grant authority to test arbitrary third-party sites.

## Provider route

- Hugging Face Router: <https://router.huggingface.co/v1>
- Suggested model at build time: `openai/gpt-oss-20b`

Browser CORS was tested on 17 and 23 November 2026. A direct OPTIONS request returns 200, and a headed Chromium browser reaches the router (preflight OK, HTTP 401 for a placeholder key). Headless Chromium is blocked at the edge with HTTP 405, so capture and CI browsers cannot use this route. No live completion is claimed because no provider key was used. Verify the current provider behavior before relying on this route.

## Deadline

The official rules read on 23 November 2026 state the submission period ends Monday, 11 January 2027 at 8:00 am Pacific Time, which is 16:00 UTC / 21:30 IST. The same rules require the demonstration video to be uploaded to and publicly visible on YouTube, under two minutes, with the Entrant explaining the project.
