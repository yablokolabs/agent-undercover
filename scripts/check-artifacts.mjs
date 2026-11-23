import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { createHash } from "node:crypto";
import Ajv2020 from "ajv/dist/2020.js";

const root = process.cwd();
const failures = [];
const checks = [];

function check(name, condition, detail = "") {
  checks.push({ name, ok: Boolean(condition), detail });
  if (!condition) failures.push(`${name}${detail ? `: ${detail}` : ""}`);
}

async function text(path) {
  return readFile(join(root, path), "utf8");
}

async function json(path) {
  return JSON.parse(await text(path));
}

const ajv = new Ajv2020({ allErrors: true, strict: false });
const manifestSchema = await json("packages/schemas/agent-manifest.schema.json");
const networkSchema = await json("packages/schemas/network.schema.json");
const validateManifest = ajv.compile(manifestSchema);
const validateNetwork = ajv.compile(networkSchema);

const workbenchManifest = await json("apps/workbench/public/agent-manifest.json");
check("workbench manifest schema", validateManifest(workbenchManifest), JSON.stringify(validateManifest.errors));
const workbenchNetworks = workbenchManifest.networks || [];
check("workbench publishes case_explainer", workbenchNetworks.some((entry) => entry.name === "case_explainer"));
const explainer = await json("apps/workbench/public/case_explainer.network.json");
check("explainer schema", validateNetwork(explainer), JSON.stringify(validateNetwork.errors));
check("explainer has two agents", explainer.tools?.length === 2);
check("explainer declares no actions", workbenchManifest.actions === undefined);
check("explainer has no private oracle material", !JSON.stringify(explainer).includes("PRIVATE_CANARY") && !JSON.stringify(explainer).includes("oracle"));

const targetManifest = await json("apps/demo-target/public/agent-manifest.json");
check("target manifest schema", validateManifest(targetManifest), JSON.stringify(validateManifest.errors));
const targetEntries = targetManifest.networks || [];
const expected = [
  "undercover_secret_v1",
  "undercover_secret_v2",
  "undercover_discount_v1",
  "undercover_discount_v2",
  "undercover_approval_v1",
  "undercover_approval_v2",
];
check("target publishes six exact network names", expected.every((name) => targetEntries.some((entry) => entry.name === name)) && targetEntries.length === 6);

for (const entry of targetEntries) {
  const network = await json(join("apps/demo-target/public", entry.hocon));
  check(`network schema ${entry.name}`, validateNetwork(network), JSON.stringify(validateNetwork.errors));
  const tools = network.tools || [];
  check(`front_man ${entry.name}`, tools.some((tool) => tool.name === entry.front_man));
}

const secretV1 = await text("apps/demo-target/public/undercover_secret_v1.network.json");
const secretV2 = await text("apps/demo-target/public/undercover_secret_v2.network.json");
check("weak secret uses placeholder", secretV1.includes("{{PRIVATE_CANARY}}"));
check("repaired secret removes placeholder", !secretV2.includes("{{PRIVATE_CANARY}}"));

const publicFiles = [
  "apps/workbench/public/agent-manifest.json",
  "apps/workbench/public/case_explainer.network.json",
  "apps/demo-target/public/agent-manifest.json",
  ...expected.map((name) => `apps/demo-target/public/${name}.network.json`),
];
for (const path of publicFiles) {
  const contents = await text(path);
  check(`no canary ${path}`, !/UC-[A-Z2-9]{20}/.test(contents));
  check(`no provider key ${path}`, !/sk-[A-Za-z0-9]{20,}/.test(contents));
  check(`no bearer token ${path}`, !/Bearer\s+[A-Za-z0-9._~+/=-]{12,}/i.test(contents));
}

for (const file of ["engine.js", "remote.js", "index.js", "LICENSE.txt"]) {
  const vendor = await readFile(join(root, "vendor/agentic-web-runtime", file));
  const vendorHash = createHash("sha256").update(vendor).digest("hex");
  for (const app of ["workbench", "demo-target"]) {
    const copy = await readFile(join(root, `apps/${app}/public/runtime`, file));
    const copyHash = createHash("sha256").update(copy).digest("hex");
    check(`runtime copy ${app}/${file}`, vendorHash === copyHash, copyHash.slice(0, 12));
  }
}

for (const app of ["workbench", "demo-target"]) {
  const vite = await text(`apps/${app}/vite.config.ts`);
  check(`CORS ${app}`, vite.includes("Access-Control-Allow-Origin"));
}
check("target production CORS header", (await text("apps/demo-target/public/_headers")).includes("Access-Control-Allow-Origin: *"));

const links = await json("apps/demo-target/public/links.json");
check("links.json lists all networks", expected.every((name) => links.networks?.[name]));

for (const result of checks) console.log(`${result.ok ? "ok" : "FAIL"}  ${result.name}${result.detail && !result.ok ? ` (${result.detail})` : ""}`);
console.log(`\n${checks.length - failures.length}/${checks.length} artifact checks passed.`);
if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
