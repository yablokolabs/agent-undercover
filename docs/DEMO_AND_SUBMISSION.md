# Demo and submission status

## Ready

- Two-origin workbench and synthetic target build, live over trusted HTTPS at <https://agent-undercover.yablokolabs.com/> and <https://undercover-target.yablokolabs.com/>.
- Six published target networks and the workbench's public `case_explainer` network.
- Three missions with vulnerable and repaired versions.
- Deterministic oracles, consent, host confirmation, repair/replay and sanitized export.
- Architecture diagram and browser screenshots.
- A 66.5-second silent 1080p Remotion picture lock built from local app recordings (`docs/assets/agent-undercover-demo-silent.mp4`), with a timed voiceover script in `video/narration-script.md`.
- A 108.8-second silent live-public cut with the real browser address bar, mission, finding, repair and replay (`docs/assets/agent-undercover-demo-public-silent.mp4`), with first-person narration for Santhosh Balasa in `docs/DEMO_NARRATION.txt` and `docs/DEMO_NARRATION_TIMED.md`.
- The **narrated** public demo master, 119.4 seconds including the entrant voice, at `docs/assets/agent-undercover-demo-public.mp4`.
- 35 tests and 61 artifact checks passing.
- Public CORS, anonymous artifact and cross-origin fixture checks passing against the live hostnames; see `docs/DEPLOYMENT.md`.
- The narrated demo published publicly on YouTube at <https://youtu.be/AfliF9OMVOo> (1:59, entrant voice), with a Vimeo mirror at <https://vimeo.com/1249258448>.

## Submission dossier

A 9-page PDF covering the product, the three missions, architecture, four screenshots, verification results, conformance summary, boundaries, reproduction steps and checklist status is at `docs/assets/agent-undercover-submission.pdf` (about 1.3 MB). Rebuild it with `npm run build:submission-pdf`; the source of the content is `scripts/build-submission-pdf.mjs`.

## Not ready

- A verified live-model run.
- The Devpost form entry itself; everything it needs is listed below.

## Public live-demo cut

```text
file:      docs/assets/agent-undercover-demo-public-silent.mp4
duration:  108.833 s
video:     H.264, 1920×1080, 30 fps
audio:     none (the entrant voice is still required)
footage:   headed Chromium at https://agent-undercover.yablokolabs.com/
target:    https://undercover-target.yablokolabs.com/
```

The address bar is visible throughout. The cut shows deterministic fixture mode, the **Confirmed disclosure** finding, **Review repair & rerun**, and the v1/v2 compare with **Same request strings**. The session-only exact reply is hidden so no concrete canary appears. The closing card repeats the workbench URL.

The narrated master is `docs/assets/agent-undercover-demo-public.mp4`:

```text
file:      docs/assets/agent-undercover-demo-public.mp4
duration:  119.400 s (1:59.4, under the two-minute limit)
video:     H.264, 1920×1080, 30 fps
audio:     AAC, 48 kHz stereo, −17.9 LUFS integrated, −4.3 dBFS true peak
source:    video/public/agent-undercover-demo.mp4 (byte-identical, MD5 b27173d827212caa24935b352555a7b4)
```

The streams were copied without re-encoding. The closing card runs from about 1:30 to the end, and the voice continues over it. The picture is the same live workbench capture as the silent master, with the address bar visible throughout.

To re-cut instead, record the narration as `video/public/voiceover-public-demo.wav` and run `node scripts/assemble-public-demo.mjs`.

## Picture-lock outline

| Time | Visual |
| --- | --- |
| 0:00–0:05 | Case-file hook: every agent has a boundary. |
| 0:05–0:13 | Three missions: assistant sentence vs observed effect. |
| 0:13–0:19 | One owned fixture and one exact target version. |
| 0:19–0:25 | Per-origin consent before contact. |
| 0:25–0:33 | Confirmed secret disclosure; session-only canary. |
| 0:33–0:43 | Reviewed repair; same requests, new configuration. |
| 0:43–0:52 | Host confirmation separated from business approval. |
| 0:52–0:58 | The published `case_explainer` agent site. |
| 0:58–1:06 | Close: owned fixtures, deterministic oracles, caller-browser execution. |

Use `video/narration-script.md` for the timed lines. Keep the video strictly below two minutes. Use the entrant's own voice. Do not include credentials or private data. Label fixture footage as fixture. The silent cut is 66.5 seconds, comfortably under the two-minute limit; record the voice to fit the existing picture lock rather than padding it with unverified claims.

## Submission checklist

- [x] Public site and both artifact origins reachable anonymously over HTTPS.
- [x] Manifest, network JSON, runtime and interface verified from the public URLs.
- [x] CORS and cross-origin loading verified from the public origin.
- [x] Exact-name rejection verified from the public origin (23 November 2026): the published-network check returned `Rejected as required: No published network named 'not_published_network'. Published networks: case_explainer.`
- [x] Live route not claimed, and the submission says so everywhere it matters: fixture-only evidence is labeled in the product, the conformance report and this checklist.
- [x] Public video under two minutes with the entrant voice and genuine footage: <https://youtu.be/AfliF9OMVOo> (119 s).
- [x] Video uploaded to YouTube and publicly visible, ready to link on the submission form (23 November 2026): the signed-out watch page shows `agent undercover demo` on the channel `Santee`; a Vimeo copy remains as a mirror.
- [x] Screenshots and project description use the same claims as the conformance report (audited 23 November 2026 against the measured numbers).
- [x] Source repository and reusable harness published: <https://github.com/yablokolabs/agent-undercover> (branch `main`; `gh-pages` still serves the site).
- [x] Current rules and deadline verified (23 November 2026): submission period ends 11 January 2027, 8:00 am Pacific / 16:00 UTC, per the official rules.
- [x] No secrets, private data or concrete canary in the submission package.

The official rules also require the site URL, a conforming JSON network description, a browser runtime, an interface (and optional LLM/key configuration), a text description and at least one screenshot. The project satisfies those; the only remaining step is filling in and submitting the form. Devpost serves its pages behind an interactive Cloudflare check that blocks automated reads, so the rules were read through a text mirror on 23 November 2026. Re-check them in a signed-in browser at submission time.
