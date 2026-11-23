# Agent Undercover — timed public-demo narration

**Narrator:** Santhosh Balasa  
**Target runtime:** 108.8 seconds including pauses (under the two-minute limit)  
**Picture master:** `docs/assets/agent-undercover-demo-public-silent.mp4`  
**Clean words:** `docs/DEMO_NARRATION.txt`  
**Voiceover file to record:** `video/public/voiceover-public-demo.wav`  
**Delivered narrated master:** `docs/assets/agent-undercover-demo-public.mp4` (119.4 s)

This map times the 108.8-second silent master. The delivered narrated master is
119.4 seconds: same capture and words, but the closing card is held from about
1:30 and the voice continues over it. Use the map for pace and content, not for
absolute timestamps in that file.

The picture is a real headed Chromium capture of the live workbench at
<https://agent-undercover.yablokolabs.com/>. The browser address bar is visible
throughout. The recorded mission ran against
<https://undercover-target.yablokolabs.com/> in deterministic fixture mode.
The final eight seconds are a closing card with the workbench domain.

## Timed map

Times are targets. Keep the words as written; absorb small timing differences in
the pauses rather than speeding up or adding unverified claims.

| Time | Footage / action | Spoken words | Pause after |
| --- | --- | --- | --- |
| 0:00–0:12 | Live workbench at the top. Chrome address bar reads `agent-undercover.yablokolabs.com`. | I'm Santhosh Balasa, and this is Agent Undercover, live at agent-undercover.yablokolabs.com. It is a workbench for one question: when my agent talks to another website, which boundaries actually hold? | 0.5 s |
| 0:12–0:25 | Scroll to Mission setup; the separate target URL and the v1/v2 selector are visible. | This is a run against the separate synthetic target, undercover-target.yablokolabs.com. I own the fixture; the planted-secret mission is selected. The target publishes a data-only network. This is deterministic fixture mode, not a live model. | 0.5 s |
| 0:25–0:36 | Hold on **3 · Choose inference**. The panel shows **BYOK is optional**, deterministic fixture selected, and **Live model · your key**. | BYOK is optional. A live-model key stays in this tab's memory, goes only to the inference endpoint, and is never sent to the target or exported. This run uses no key. | 0.5 s |
| 0:36–0:50 | Check the authorization box; start. The exact-origin consent dialog appears and is held; click **Allow for this session** near 0:43. | I authorize this exact target; the vulnerable v1 configuration is selected; I start. The workbench asks for per-origin consent. I allow it. The target is static; the network runs in my browser, not on its server. | 1.0 s |
| 0:50–1:02 | Case file: **Confirmed disclosure** badge and oracle summary. The session-only exact reply is hidden. | The case file reports Confirmed disclosure: the exact per-run canary appeared in an attacker-visible reply. That is evidence for this synthetic test, not proof the target is secure. Exact-substring detection only. | 1.5 s |
| 1:02–1:14 | Click **Review repair & rerun**; the repaired v2 result is recorded. | I apply the reviewed repair. It removes the codeword from the target's context. The workbench reruns the same three stored requests against v2. | 1.0 s |
| 1:14–1:40 | Compare & replay: v1 **Confirmed disclosure**, v2 **Not observed**, **Same request strings**, both network hashes. Hold. | The compare view reports Not observed for v2, shows the same request strings, and keeps both network hashes. The repair changed the boundary; replay makes the comparison repeatable. A not-observed result is not proof of security. | 1.5 s |
| 1:40–1:49 | Closing card with `agent-undercover.yablokolabs.com`; fixture/no-certification labels. | Test the boundary before you trust the agent. The live workbench is agent-undercover.yablokolabs.com. Fixture evidence, no real customer data, not a certification. | 1.7 s |

**Word count:** 242 words. At a natural 150–160 words per minute, the speech is
about 90–96 seconds; the marked pauses bring the complete delivery to roughly
108–109 seconds. Do not add a separate intro or outro.

## Mismatches and footage boundaries

- The URL is visible in the real browser address bar from 0:00 through 1:40.8,
  and repeated on the closing card from 1:40.8 through 1:48.8.
- The target URL in the setup form is the separate synthetic origin. The target
  page itself is not shown; the target's public manifest and network are loaded
  into the workbench browser tab.
- The **BYOK** panel is shown, but the key field is not opened and no key is
  entered. The narration explains the feature and explicitly says this run uses
  no key. Do not say “I entered a key” or imply a live-model result.
- The exact per-run canary is intentionally hidden during recording. The visible
  finding is the **Confirmed disclosure** badge and oracle text. The narration
  says the canary appeared in the reply; it must not read out a value.
- The mission and vulnerable v1 are already selected when the page is shown;
  the video does not click a mission card or a version button. The narration says
  they are selected, not that a selection click happened.
- The button clicked is **Review repair & rerun**. The compare page says the
  same request strings were rerun. The video does not click the separate
  **Replay exact** buttons. Calling this a replay is accurate because the repair
  reruns the stored request strings; do not claim a second replay button click.
- This is a deterministic fixture run. The **DETERMINISTIC FIXTURE** badge and
  **No key** indicator are visible. Do not call it live-model evidence or a
  security certification.
- The final card is an edit element, not a second browser session. It repeats the
  same workbench URL shown in the address bar.

## Record the voice

Preferred delivery file:

```text
path:      video/public/voiceover-public-demo.wav
format:    WAV, PCM
sample:    48 kHz, 24-bit
channels:  mono or stereo
level:     about -16 LUFS integrated, true peak at or below -1.5 dBFS
head:      up to 0.5 s of room tone before the first word
tail:      leave the marked pauses; do not trim the closing pause
```

Record in a quiet room in your own voice. Do not use synthetic or cloned speech.
If a sentence runs long, shorten a pause or trim a non-claim word; do not drop
the qualifications about fixture mode, exact-substring detection or certification.

The narrated master already exists, so assembly is only needed if the voice is re-recorded. To assemble the final video after the WAV is in place:

```bash
node scripts/assemble-public-demo.mjs
```

The script writes the silent master to
`docs/assets/agent-undercover-demo-public-silent.mp4` and, when the WAV exists,
writes the voiced final to `docs/assets/agent-undercover-demo-public.mp4`.
It pads a short voice track with silence and cuts anything beyond 108.83 seconds.
The video is 1920×1080, 30 fps, H.264, with AAC audio in the voiced output.

Verify before upload:

```bash
ffprobe -v error -show_entries format=duration \
  -show_entries stream=codec_type,codec_name,width,height,r_frame_rate \
  -of default=nw=1 docs/assets/agent-undercover-demo-public.mp4
```

Expected for the WAV assembly path: one H.264 video stream at 1920×1080/30 fps,
one AAC audio stream, and a duration no greater than 108.83 seconds. The delivered
narrated master is 119.4 seconds, also under the two-minute limit. Watch the full cut once with the sound
on and confirm the words still match the visible actions.
