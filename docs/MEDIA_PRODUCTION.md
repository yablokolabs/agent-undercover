# Media status

## Architecture

`assets/architecture.svg` is the source diagram. `assets/architecture.png` is the rendered version used in the README. It shows:

- the workbench origin and the second target origin;
- public data-only artifacts crossing the origin boundary after consent;
- the pinned runtime executing in the caller tab;
- caller-local synthetic action ledgers;
- the spy context without canary or oracle state;
- session memory holding the canary, oracle ground truth and key;
- the key path to the selected inference endpoint only;
- bounded findings and the sanitized report.

The diagram does not show peer networks executing on a publisher's server.

## Screenshots

Captured from the running local build with Playwright and Chromium at 1440×1000:

- `docs/assets/screenshots/mission-setup.png`
- `docs/assets/screenshots/consent.png`
- `docs/assets/screenshots/case-file.png`
- `docs/assets/screenshots/compare.png`
- `docs/assets/screenshots/host-confirmation.png`
- `docs/assets/screenshots/published-network.png`
- `docs/assets/screenshots/target-site.png`

The case-file screenshot hides the session-only exact-reply panel so it does not publish a concrete canary. All other screenshots are fixture runs.

## Video

A **108.8-second silent live-public cut** is at `docs/assets/agent-undercover-demo-public-silent.mp4`. It is a real headed-Chromium capture of <https://agent-undercover.yablokolabs.com/> with the address bar visible, running the deterministic fixture mission against <https://undercover-target.yablokolabs.com/>. It is 1920×1080, 30 fps, H.264, no audio track.

The cut shows the confirmed disclosure, the reviewed repair and the v1/v2 compare with the same request strings. The session-only exact-reply panel is hidden so no concrete canary appears. The closing card repeats the workbench URL.

First-person narration for Santhosh Balasa is in `docs/DEMO_NARRATION.txt`; `docs/DEMO_NARRATION_TIMED.md` maps every line to the footage, pauses and known boundaries.

The **narrated master** is `docs/assets/agent-undercover-demo-public.mp4`: 119.4 seconds (1:59.4), 1920×1080, 30 fps, H.264 with 48 kHz stereo AAC, −17.9 LUFS integrated, −4.3 dBFS true peak. It came from `video/public/agent-undercover-demo.mp4` and the streams were copied without re-encoding, so the file is byte-identical (MD5 `b27173d827212caa24935b352555a7b4`). The voice runs continuously, including over the closing card that starts around 1:30. This is the upload candidate.

To re-record instead, write the voice to `video/public/voiceover-public-demo.wav` (48 kHz, 24-bit PCM WAV) and run `node scripts/assemble-public-demo.mjs`.

A **66.5-second silent Remotion picture lock** remains at `docs/assets/agent-undercover-demo-silent.mp4`, built from local app recordings. Its source is in `video/`; `video/narration-script.md` covers that older cut.

The contest requires the entrant to explain the project in their own voice; AI narration must not replace that audio. No synthetic narration is present in any cut. Keep keys and private data out of frame and stay under two minutes.

## Branding

`assets/logo.png` and `assets/icon.png` are the supplied brand assets. Copies used by the public origins are under each app's `public/branding/` directory.
