#!/usr/bin/env node
// Copy the pinned, documented runtime into each public origin. The copies are
// build artifacts; edit only vendor/agentic-web-runtime.
import { cp, mkdir, readdir, stat } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();
const source = join(root, "vendor/agentic-web-runtime");
const destinations = [
  join(root, "apps/workbench/public/runtime"),
  join(root, "apps/demo-target/public/runtime"),
];

for (const destination of destinations) {
  await mkdir(destination, { recursive: true });
  await cp(source, destination, {
    recursive: true,
    force: true,
    filter: (entry) => !entry.includes("UNDERCOVER_ADAPTER.md"),
  });
  const files = await readdir(destination);
  const hasIndex = files.includes("index.js");
  const license = await stat(join(destination, "LICENSE.txt"));
  if (!hasIndex || !license.isFile()) throw new Error(`Runtime copy incomplete at ${destination}`);
  console.log(`runtime -> ${destination}`);
}
