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
- The narrated demo published publicly at <https://vimeo.com/1249258448> (1:59, entrant voice).

## Submission dossier

A 9-page PDF covering the product, the three missions, architecture, four screenshots, verification results, conformance summary, boundaries, reproduction steps and checklist status is at `docs/assets/agent-undercover-submission.pdf` (about 1.3 MB). Rebuild it with `npm run build:submission-pdf`; the source of the content is `scripts/build-submission-pdf.mjs`.

## Not ready

- A verified live-model run.
- YouTube upload of the narrated master and the contest submission.

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
- [ ] Exact-name rejection verified from the public origin.
- [ ] Live route verified, or the submission clearly states fixture-only evidence.
- [x] Public video under two minutes with the entrant voice and genuine footage: <https://vimeo.com/1249258448> (119 s).
- [ ] Confirm the portal accepts Vimeo or requires a YouTube link.
- [ ] Screenshots and project description use the same claims as the conformance report.
- [x] Source repository and reusable harness published: <https://github.com/yablokolabs/agent-undercover> (branch `main`; `gh-pages` still serves the site).
- [ ] Current rules and deadline verified on the portal.
- [ ] No secrets, private data or concrete canary in the submission package.

The supplied deadline is 11 January 2027, 16:00 UTC / 21:30 IST. Verify it against the live portal before submission.
