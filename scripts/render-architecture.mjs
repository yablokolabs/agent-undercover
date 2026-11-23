import { chromium } from "@playwright/test";
import { fileURLToPath } from "node:url";

const source = fileURLToPath(new URL("../assets/architecture.svg", import.meta.url));
const output = fileURLToPath(new URL("../assets/architecture.png", import.meta.url));
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1800, height: 1120 } });
await page.goto(`file://${source}`);
await page.screenshot({ path: output });
await browser.close();
console.log(`Rendered ${output}`);
