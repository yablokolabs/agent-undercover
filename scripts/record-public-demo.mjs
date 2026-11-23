import { chromium } from "@playwright/test";
import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";

// Records the deployed workbench with the real Chromium window chrome, so the
// address bar contains the public HTTPS URL. The page video API cannot capture
// browser chrome, hence the Xvfb + x11grab path.
const DISPLAY = process.env.DEMO_DISPLAY || ":99";
const WIDTH = 1920;
const HEIGHT = 1080;
const FPS = 30;
const OUTPUT_DIR = join(process.cwd(), "video/out");
const OUTPUT = join(OUTPUT_DIR, "agent-undercover-public-demo-raw.mp4");
const URL = "https://agent-undercover.yablokolabs.com/";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  await mkdir(OUTPUT_DIR, { recursive: true });

  const xvfb = spawn("Xvfb", [DISPLAY, "-screen", "0", `${WIDTH}x${HEIGHT}x24`, "-nolisten", "tcp"], {
    stdio: "ignore",
  });
  xvfb.on("error", (error) => {
    throw new Error(`Could not start Xvfb: ${error.message}`);
  });
  for (let i = 0; i < 40 && !existsSync(`/tmp/.X11-unix/X${DISPLAY.replace(":", "")}`); i += 1) {
    await sleep(250);
  }
  if (!existsSync(`/tmp/.X11-unix/X${DISPLAY.replace(":", "")}`)) {
    xvfb.kill("SIGTERM");
    throw new Error(`Xvfb did not create a socket for ${DISPLAY}`);
  }

  process.env.DISPLAY = DISPLAY;
  let browser;
  let ffmpeg;
  try {
    browser = await chromium.launch({
      headless: false,
      env: { ...process.env, DISPLAY },
      args: [
        "--window-position=0,0",
        `--window-size=${WIDTH},${HEIGHT}`,
        "--force-device-scale-factor=1",
        "--disable-infobars",
        "--disable-notifications",
        "--no-first-run",
        "--no-default-browser-check",
      ],
    });
    const page = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT - 100 } });
    await page.goto(URL, { waitUntil: "networkidle", timeout: 60000 });
    // The exact reply and raw event text can contain the per-run canary. Hide
    // them before the first captured frame; the finding badge and oracle remain.
    await page.addStyleTag({
      content: ".session-evidence, .exact-reply, .event-text { display: none !important; }",
    });
    await sleep(1800);

    ffmpeg = spawn(
      "ffmpeg",
      [
        "-y",
        "-hide_banner",
        "-loglevel",
        "error",
        "-f",
        "x11grab",
        "-framerate",
        String(FPS),
        "-video_size",
        `${WIDTH}x${HEIGHT}`,
        "-i",
        `${DISPLAY}.0`,
        "-c:v",
        "libx264",
        "-preset",
        "veryfast",
        "-crf",
        "18",
        "-pix_fmt",
        "yuv420p",
        OUTPUT,
      ],
      { stdio: ["pipe", "ignore", "inherit"] },
    );
    await sleep(1000);

    // Live mission against the separate synthetic target. Holds are deliberately
    // long enough for the entrant's own narration; do not synthesize audio here.
    await sleep(9000);
    await page.getByRole("heading", { name: "1 · Choose a mission" }).scrollIntoViewIfNeeded();
    await sleep(9000);
    await page.getByRole("heading", { name: "3 · Choose inference" }).scrollIntoViewIfNeeded();
    await sleep(15000);
    await page.getByRole("checkbox").first().check();
    await sleep(3500);
    await page.getByRole("button", { name: "Start mission" }).click();
    await page.locator("dialog[open]").waitFor({ state: "visible", timeout: 30000 });
    await sleep(11000);
    await page.getByRole("button", { name: "Allow for this session" }).click();
    await page.locator(".outcome-badge").waitFor({ state: "visible", timeout: 60000 });
    await page.locator(".finding-panel").scrollIntoViewIfNeeded();
    await sleep(18000);

    // Repair and rerun the same stored requests.
    const repair = page.getByRole("button", { name: "Review repair & rerun" });
    await repair.scrollIntoViewIfNeeded();
    await sleep(3500);
    await repair.click();
    await page.getByText("Compare & replay").waitFor({ state: "visible", timeout: 60000 });
    await page.locator(".compare-grid").scrollIntoViewIfNeeded();
    await sleep(22000);

    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "smooth" }));
    await sleep(7000);
  } finally {
    if (ffmpeg) {
      ffmpeg.kill("SIGINT");
      await new Promise((resolve) => ffmpeg.once("close", resolve));
    }
    if (browser) await browser.close();
    xvfb.kill("SIGTERM");
  }
  console.log(`recorded ${OUTPUT}`);
}

await main();
