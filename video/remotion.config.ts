import {Config} from '@remotion/cli/config';
import fs from 'node:fs';
import path from 'node:path';

Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(92);
Config.setCodec('h264');
Config.setCrf(21);

// Remotion normally downloads its own headless Chrome. In sandboxes where that
// download is blocked, reuse a local one: $REMOTION_BROWSER, or a Playwright
// chrome-headless-shell under /opt/pw-browsers.
const findBrowser = (): string | null => {
  if (process.env.REMOTION_BROWSER && fs.existsSync(process.env.REMOTION_BROWSER)) return process.env.REMOTION_BROWSER;
  const roots = ['/opt/pw-browsers', path.join(process.env.HOME || '', '.cache/ms-playwright')];
  for (const root of roots) {
    if (!fs.existsSync(root)) continue;
    for (const dir of fs.readdirSync(root).filter((d) => d.startsWith('chromium_headless_shell')).sort().reverse()) {
      for (const sub of ['chrome-headless-shell-linux64/chrome-headless-shell', 'chrome-linux/chrome']) {
        const p = path.join(root, dir, sub);
        if (fs.existsSync(p)) return p;
      }
    }
  }
  return null;
};
const browser = findBrowser();
if (browser) Config.setBrowserExecutable(browser);
