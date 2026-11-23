import { chromium } from "@playwright/test";
import { mkdir, rename, rm } from "node:fs/promises";
import { join } from "node:path";

const output = join(process.cwd(), "video/public/clips");
const temp = join(output, ".recording");
await mkdir(temp, { recursive: true });

const browser = await chromium.launch({ headless: true });

async function record(name, run) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    recordVideo: { dir: temp, size: { width: 1440, height: 1000 } },
  });
  const page = await context.newPage();
  await page.goto("http://localhost:5173/", { waitUntil: "networkidle" });
  // Never put the session-only exact reply into a public recording.
  await page.addStyleTag({ content: ".session-evidence{display:none !important}" });
  await page.waitForTimeout(700);
  await run(page);
  const video = page.video();
  await context.close();
  const path = await video.path();
  await rename(path, join(output, `${name}.webm`));
  console.log(`recorded ${name}.webm`);
}

async function authorize(page) {
  await page.getByRole("checkbox").first().check();
}

async function toTop(page) {
  await page.evaluate(() => {
    window.scrollTo(0, 0);
    document.scrollingElement?.scrollTo?.(0, 0);
    document.body.scrollTop = 0;
  });
  await page.waitForTimeout(500);
}

async function runSecret(page) {
  await authorize(page);
  await page.getByRole("button", { name: "Start mission" }).click();
  const allow = page.getByRole("button", { name: "Allow for this session" });
  if (await allow.count()) await allow.click();
  await page.waitForSelector(".outcome-badge");
}

await record("setup", async (page) => {
  await page.evaluate(() => window.scrollTo({ top: 500, behavior: "smooth" }));
  await page.waitForTimeout(900);
  await authorize(page);
  await page.waitForTimeout(1200);
  await page.getByRole("button", { name: "v2 · repaired" }).click();
  await page.waitForTimeout(1200);
  await page.getByRole("button", { name: "v1 · weak" }).click();
  await page.waitForTimeout(1200);
});

await record("consent", async (page) => {
  await authorize(page);
  await page.getByRole("button", { name: "Start mission" }).click();
  await page.waitForSelector("dialog[open]");
  await page.waitForTimeout(4000);
  await page.getByRole("button", { name: "Allow for this session" }).click();
  await page.waitForTimeout(1000);
});

await record("case", async (page) => {
  await runSecret(page);
  await page.waitForTimeout(1000);
  await toTop(page);
  await page.waitForTimeout(5000);
});

await record("compare", async (page) => {
  await runSecret(page);
  await page.getByRole("button", { name: "Review repair & rerun" }).click();
  await page.waitForTimeout(3000);
  await toTop(page);
  await page.waitForTimeout(5000);
});

await record("approval", async (page) => {
  await page.locator(".mission-card").filter({ hasText: "Approval bypass" }).click();
  await authorize(page);
  await page.getByRole("button", { name: "v1 · weak" }).click();
  await page.getByRole("button", { name: "Start mission" }).click();
  const allow = page.getByRole("button", { name: "Allow for this session" });
  if (await allow.count()) await allow.click();
  await page.waitForSelector("dialog[open]");
  await page.waitForTimeout(3000);
  await page.getByRole("button", { name: "Confirm synthetic write" }).click();
  await page.waitForTimeout(1000);
  await toTop(page);
  await page.waitForTimeout(3000);
});

await record("published", async (page) => {
  await page.getByRole("button", { name: /Published network/ }).first().click();
  await toTop(page);
  await page.waitForTimeout(1200);
  await page.getByRole("button", { name: "Explain with published network" }).click();
  await page.waitForTimeout(2400);
  await toTop(page);
  await page.waitForTimeout(1500);
});

await browser.close();
await rm(temp, { recursive: true, force: true });
console.log("demo clips ready");
