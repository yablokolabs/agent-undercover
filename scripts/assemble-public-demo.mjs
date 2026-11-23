import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";

const raw = join(process.cwd(), "video/out/agent-undercover-public-demo-raw.mp4");
const card = join(process.cwd(), "video/out/public-demo-closing.png");
const voiceover = join(process.cwd(), "video/public/voiceover-public-demo.wav");
const outputDir = join(process.cwd(), "docs/assets");
const silentOutput = join(outputDir, "agent-undercover-demo-public-silent.mp4");
const finalOutput = join(outputDir, "agent-undercover-demo-public.mp4");

const run = (args) =>
  new Promise((resolve, reject) => {
    const child = spawn("ffmpeg", args, { stdio: "inherit" });
    child.on("error", reject);
    child.on("close", (code) => (code === 0 ? resolve() : reject(new Error(`ffmpeg exited ${code}`))));
  });

await mkdir(outputDir, { recursive: true });
if (!existsSync(raw)) throw new Error(`Missing raw recording: ${raw}`);
if (!existsSync(card)) throw new Error(`Missing closing card: ${card}`);

const videoFilter = [
  "[0:v]fps=30,scale=1920:1080,setsar=1,fade=t=out:st=99.83:d=1.0[v0]",
  "[1:v]fps=30,scale=1920:1080,setsar=1,fade=t=in:st=0:d=0.8[v1]",
  "[v0][v1]concat=n=2:v=1:a=0[v]",
].join(";");

const common = [
  "-y",
  "-hide_banner",
  "-loglevel",
  "error",
  "-i",
  raw,
  "-loop",
  "1",
  "-t",
  "8",
  "-i",
  card,
];

await run([
  ...common,
  "-filter_complex",
  videoFilter,
  "-map",
  "[v]",
  "-c:v",
  "libx264",
  "-preset",
  "medium",
  "-crf",
  "18",
  "-pix_fmt",
  "yuv420p",
  "-movflags",
  "+faststart",
  silentOutput,
]);
console.log(`wrote ${silentOutput}`);

if (existsSync(voiceover)) {
  await run([
    ...common,
    "-i",
    voiceover,
    "-filter_complex",
    `${videoFilter};[2:a]apad=whole_dur=108.83,atrim=0:108.83,asetpts=N/SR/TB[a]`,
    "-map",
    "[v]",
    "-map",
    "[a]",
    "-t",
    "108.83",
    "-c:v",
    "libx264",
    "-preset",
    "medium",
    "-crf",
    "18",
    "-pix_fmt",
    "yuv420p",
    "-c:a",
    "aac",
    "-b:a",
    "192k",
    "-ar",
    "48000",
    "-movflags",
    "+faststart",
    finalOutput,
  ]);
  console.log(`wrote ${finalOutput}`);
} else {
  console.log(`no ${voiceover}; silent master only. Record the WAV there and rerun this script.`);
}
