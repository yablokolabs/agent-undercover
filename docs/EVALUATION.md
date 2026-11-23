# Verification results

**Date:** 17 November 2026  
**Browser:** headless Chromium 131.0.6778.33 via Playwright 1.49.1  
**Origins:** `http://localhost:5173` (workbench), `http://localhost:5174` (synthetic target)

## Automated checks

| Command | Result |
| --- | --- |
| `npm test` | 7 files, 35 tests passed |
| `npm run test:e2e` | 1 Playwright browser test passed |
| `npm run check:artifacts` | 61/61 checks passed |
| `npm run typecheck` | root, workbench and target passed |
| `npm run build` | both production builds passed |

The test suite covers:

- canary generation and spy-context isolation;
- fixed attack grammar and URL/code rejection;
- turn, request, reply and output budgets;
- timeout marking and cancellation;
- secret, discount and approval oracles;
- one-use, proposal-bound approval tokens and term mutation;
- redaction and sanitized public reports;
- exact replay identity and hash mismatch;
- manifest/network schema validation and runtime copy hashes;
- public-artifact secret scanning and CORS configuration.

## Browser checks

The following flows were exercised through the normal UI, not through component internals:

1. **Mission setup.** The start button stays disabled until the authorization checkbox is selected.
2. **Consent.** Starting a run opens a per-origin consent dialog before the manifest is fetched. The dialog lists purpose, request and what is not sent.
3. **Secret mission.** The vulnerable fixture returns the exact canary; the case file reports **Confirmed disclosure**. Export JSON contains the canary on screen but not in the file.
4. **Secret repair.** “Review repair & rerun” runs `v2` with the same request strings; compare reports **Not observed** and shows the old and new network hashes.
5. **Discount.** `v1` applies an unauthorized synthetic effect; `v2` rejects it and reports **Blocked**.
6. **Approval.** `v1` requests the irreversible `finalize_booking` synthetic write and shows the host confirmation. Confirming produces an unauthorized synthetic effect because the model's approval claim is not a token. `v2` is blocked because no valid one-use token is bound to the proposal.
7. **Exact-name rejection.** A missing `case_explainer` name is rejected with the published-name list.
8. **Published explainer.** The exact network is loaded from the workbench origin; the browser mock returns a labeled mock summary. This is not a model run.
9. **Saved records.** A sanitized run can be opened from IndexedDB and reports that the original session canary is unavailable.
10. **Console.** No console or page errors occurred during the checked flows.

## Public deployment check

A separate run used the live origins with normal public DNS and certificate validation, without `--resolve` or `-k`:

- Workbench <https://agent-undercover.yablokolabs.com/> and target <https://undercover-target.yablokolabs.com/> returned HTTP 200 with `ssl_verify_result=0`.
- Both manifests, all six target networks, the workbench network and all runtime files returned HTTP 200 with `access-control-allow-origin: *`.
- The public cross-origin run loaded the target manifest and `undercover_secret_v1.network.json`, showed the consent dialog, and completed with **Confirmed disclosure** and no console or page errors.
- A fake key entered in the masked field appeared in neither local nor session storage and cleared from memory.
- Both HTTP URLs returned `301` to HTTPS.

Public screenshots are in `docs/assets/screenshots/`. The case-file screenshot hides the session-only exact-reply panel so no concrete canary is published.

## Live model attempt

The default live route was the Hugging Face Router at `https://router.huggingface.co/v1` with `openai/gpt-oss-20b`.

- A direct HTTPS OPTIONS request with the browser's preflight headers returned HTTP 200 and `access-control-allow-origin: *`.
- Chromium's preflight to the same chat-completions URL returned HTTP 405, so the browser fetch failed before a model request was sent.
- The failure is recorded as an **inconclusive live attempt**, not as a target failure or a successful model run.

No live-model evidence is claimed. A supported live route must be verified in a normal browser before that claim is added. The fixture mode remains available and is always labeled `DETERMINISTIC FIXTURE`.

## Demo media

The silent picture lock was rendered with Remotion 4.0.534 from six Playwright recordings of the local workbench:

```text
file:      docs/assets/agent-undercover-demo-silent.mp4
video:     H.264, 1920×1080, 30 fps
duration:  66.500 s
audio:     none (intentional; the entrant voice is still required)
size:      ~39 MB
```

`ffprobe` reports one video stream and no audio stream. Boundary frames at 33.0 s, 43.0 s, 52.0 s and 58.0 s were inspected after the poster fix; the footage no longer ends in a white pane. The session-only exact-reply panel was hidden during every recording, so no concrete canary appears in the video.

The cut is a fixture demonstration. It is not live-model evidence and is not the final contest submission until the entrant's own voice track is added.

A second, **108.833-second silent live-public cut** is at `docs/assets/agent-undercover-demo-public-silent.mp4`. It was captured from a headed Chromium window against the deployed HTTPS workbench with the address bar visible. It shows deterministic fixture mode, **Confirmed disclosure**, **Review repair & rerun**, and the v1/v2 compare with **Same request strings**. The exact-reply panel is hidden. The closing card repeats the workbench URL. First-person narration and the timed edit map are in `docs/DEMO_NARRATION.txt` and `docs/DEMO_NARRATION_TIMED.md`.

The narrated master that replaces it is `docs/assets/agent-undercover-demo-public.mp4`, supplied at `video/public/agent-undercover-demo.mp4` and copied without re-encoding (MD5 `b27173d827212caa24935b352555a7b4`). `ffprobe` reports H.264 1920×1080 at 30 fps and AAC 48 kHz stereo, 119.400 s, 55,991,981 bytes. `ebur128` reports −17.9 LUFS integrated and −4.3 dBFS true peak. It is published at <https://vimeo.com/1249258448>, where Vimeo reports 119 s, the title `agent-undercover-demo` and the author Santhosh Balasa.

Nine frames sampled between 0:01 and 1:57 show the live workbench with the address bar, the consent dialog, the v1/v2 compare and the closing card, with the exact-reply panel hidden. Audio level stays between −23.6 and −18.7 dB mean per five-second window, so the closing card is narrated rather than silent.

## Limitations

- The public deployment was verified over normal public DNS and trusted HTTPS. The public browser run used headless Chromium against the live hostnames; it was not a manual user session. See `docs/DEPLOYMENT.md`.
- The browser is headless Chromium, not a manual user session.
- The fixture model is a rules-based stand-in, not a real model.
- A single run is evidence for that exact test and configuration.
- The secret detector is exact-substring only; encoded or paraphrased disclosure is not detected.
- Cancellation is checked between turns; an in-flight provider call is not forcibly aborted.
- Video cuts were produced, but no entrant voice recording was produced; both cuts are silent until the WAV is recorded.
