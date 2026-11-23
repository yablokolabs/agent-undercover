# Demo video

The narrated master is `../docs/assets/agent-undercover-demo-public.mp4` (119.4 s, source `public/agent-undercover-demo.mp4`, streams copied without re-encoding). It is the upload candidate.

There are two picture edits:

- The **live public demo** is a 108.8-second headed-Chromium screen capture of <https://agent-undercover.yablokolabs.com/> with the real address bar visible. Its silent master is `../docs/assets/agent-undercover-demo-public-silent.mp4`. Use `../docs/DEMO_NARRATION.txt` and `../docs/DEMO_NARRATION_TIMED.md`.
- The older **Remotion cut** is a 66.5-second 1920×1080 picture lock built from local page recordings. Its silent output is `out/agent-undercover-demo-silent.mp4`.

The contest requires the entrant to explain the project in their own voice. Neither cut contains synthetic narration.

## Live public demo

Record the deployed workbench with real browser chrome:

```bash
node scripts/record-public-demo.mjs
node scripts/assemble-public-demo.mjs
```

The recorder uses Xvfb, a headed Chromium window and `ffmpeg` x11grab. The page-video API cannot capture the address bar. The assembly script appends an 8-second URL card and, if the voice file exists, muxes it.

Preferred voice file: `public/voiceover-public-demo.wav` — 48 kHz, 24-bit PCM, mono or stereo, about -16 LUFS, true peak at or below -1.5 dBFS. Read `../docs/DEMO_NARRATION.txt`; use the timed map. When the WAV exists, the assembly writes `../docs/assets/agent-undercover-demo-public.mp4`; otherwise it writes the silent master.

The delivered narrated master took the other path: the entrant supplied a finished video at `public/agent-undercover-demo.mp4`, which was copied unchanged to `../docs/assets/agent-undercover-demo-public.mp4`. Do not re-cut it; `assemble-public-demo.mjs` stays for the WAV workflow.

## What the footage shows

- Mission setup with the owned fixture, exact target URL and version selection.
- The per-origin consent dialog before the first artifact fetch.
- The secret-disclosure case file with the exact canary hidden from the public recording.
- The repaired comparison with the same request strings and two network hashes.
- The host confirmation dialog for the synthetic finalize action.
- The published `case_explainer` network and its labeled browser-mock result.

The recordings are fixture runs. No live-model result is shown or implied.

## Rebuild the picture

The workbench and target must be running:

```bash
# from the repository root
npm run dev
npm run record:demo
cd video
npm install
npx remotion render Video out/agent-undercover-demo-silent.mp4 --concurrency=4
```

The Remotion config uses CRF 21 for a delivery-sized 1080p file. `npm run record:demo` writes the six WebM clips to `public/clips/`. It hides the session-only exact-reply panel so no concrete canary is published in the video.

Preview stills before a render:

```bash
npm run typecheck
node scripts/stills.mjs review 2 8.5 17 29 38 47 55 62
```

Read `stills/review/sheet.jpg`.

## Add the entrant voice to the Remotion cut

1. Record `narration-script.md` as a 48 kHz WAV.
2. Put it at `public/voiceover.wav`.
3. Set `AUDIO.voiceover` to `'voiceover.wav'` in `src/config.ts`.
4. Render again and verify both streams:

```bash
npx remotion render Video out/agent-undercover-demo-final.mp4 --concurrency=4
ffprobe -v error -show_entries format=duration -show_entries stream=codec_type,codec_name -of default=nw=1 out/agent-undercover-demo-final.mp4
```

The final video must stay under two minutes and must not include keys, private data or a concrete canary.

## Sources and licensing

- Remotion 4.0.534, React 18, TypeScript and Fontsource fonts.
- Remotion is free for individuals and small companies; larger companies need a paid licence. Check <https://remotion.dev/license>.
- The app recordings come from this repository's owned synthetic fixtures.
- The skill/template came from the provided `remotion-video-skill` directory.
