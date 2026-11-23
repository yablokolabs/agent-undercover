import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import Ajv2020 from "ajv/dist/2020.js";
import { TARGET_NETWORKS } from "@undercover/scenarios";
import { toPublicReport } from "@undercover/harness";
import { sampleRun } from "./helpers.js";

const root = process.cwd();
const manifestSchema = JSON.parse(await readFile(join(root, "packages/schemas/agent-manifest.schema.json"), "utf8"));
const networkSchema = JSON.parse(await readFile(join(root, "packages/schemas/network.schema.json"), "utf8"));
const reportSchema = JSON.parse(await readFile(join(root, "packages/schemas/public-report.schema.json"), "utf8"));
const ajv = new Ajv2020({ allErrors: true, strict: false });
const validateManifest = ajv.compile(manifestSchema);
const validateNetwork = ajv.compile(networkSchema);
const validateReport = ajv.compile(reportSchema);

async function json(path: string): Promise<Record<string, unknown>> {
  return JSON.parse(await readFile(join(root, path), "utf8")) as Record<string, unknown>;
}

describe("public artifacts", () => {
  it("validates the workbench manifest and two-agent explainer network", async () => {
    const manifest = await json("apps/workbench/public/agent-manifest.json");
    expect(validateManifest(manifest), JSON.stringify(validateManifest.errors)).toBe(true);
    const networks = manifest.networks as Array<{ name: string; front_man: string; hocon: string }>;
    expect(networks.map((network) => network.name)).toEqual(["case_explainer"]);
    const network = await json("apps/workbench/public/case_explainer.network.json");
    expect(validateNetwork(network), JSON.stringify(validateNetwork.errors)).toBe(true);
    const tools = network.tools as Array<{ name: string; tools?: string[] }>;
    expect(tools).toHaveLength(2);
    expect(tools.find((tool) => tool.name === "case_explainer")?.tools).toContain("finding_reader");
    expect(manifest.actions).toBeUndefined();
  });

  it("publishes six exact target networks with matching manifest entries", async () => {
    const manifest = await json("apps/demo-target/public/agent-manifest.json");
    expect(validateManifest(manifest), JSON.stringify(validateManifest.errors)).toBe(true);
    const entries = manifest.networks as Array<{ name: string; front_man: string; hocon: string; undercover_fixture: { mission: string; version: number } }>;
    expect(entries).toHaveLength(6);
    expect(new Set(entries.map((entry) => entry.name)).size).toBe(6);
    for (const mission of ["secret", "discount", "approval"] as const) {
      const expected = TARGET_NETWORKS[mission];
      const vulnerable = entries.find((entry) => entry.name === expected.vulnerable.networkName);
      const repaired = entries.find((entry) => entry.name === expected.repaired.networkName);
      expect(vulnerable?.undercover_fixture).toMatchObject({ mission, version: 1 });
      expect(repaired?.undercover_fixture).toMatchObject({ mission, version: 2 });
      const network = await json(`apps/demo-target/public/${expected.vulnerable.artifactPath.replace(/^\//, "")}`);
      expect(validateNetwork(network), JSON.stringify(validateNetwork.errors)).toBe(true);
      const tools = network.tools as Array<{ name: string }>;
      expect(tools.some((tool) => tool.name === vulnerable?.front_man)).toBe(true);
    }
    const links = await json("apps/demo-target/public/links.json");
    expect(Object.keys(links.networks as Record<string, unknown>).sort()).toEqual(entries.map((entry) => entry.name).sort());
  });

  it("contains no concrete canary or credential form in public files", async () => {
    const files = [
      "apps/workbench/public/agent-manifest.json",
      "apps/workbench/public/case_explainer.network.json",
      "apps/demo-target/public/agent-manifest.json",
      "apps/demo-target/public/undercover_secret_v1.network.json",
      "apps/demo-target/public/undercover_secret_v2.network.json",
      "apps/demo-target/public/undercover_discount_v1.network.json",
      "apps/demo-target/public/undercover_discount_v2.network.json",
      "apps/demo-target/public/undercover_approval_v1.network.json",
      "apps/demo-target/public/undercover_approval_v2.network.json",
    ];
    for (const path of files) {
      const text = await readFile(join(root, path), "utf8");
      expect(text, path).not.toMatch(/UC-[A-Z2-9]{20}/);
      expect(text, path).not.toMatch(/sk-[A-Za-z0-9]{20,}/);
      expect(text, path).not.toMatch(/Bearer\s+[A-Za-z0-9._~+/=-]{12,}/i);
    }
  });

  it("keeps the weak secret fixture free of an actual canary and the repaired one free of the placeholder", async () => {
    const weak = await readFile(join(root, "apps/demo-target/public/undercover_secret_v1.network.json"), "utf8");
    const repaired = await readFile(join(root, "apps/demo-target/public/undercover_secret_v2.network.json"), "utf8");
    expect(weak).toContain("{{PRIVATE_CANARY}}");
    expect(repaired).not.toContain("{{PRIVATE_CANARY}}");
    expect(repaired).not.toMatch(/UC-[A-Z2-9]{20}/);
  });

  it("validates a sanitized public report against the published schema", () => {
    const report = toPublicReport(sampleRun(), { canary: "UC-ABCDEFGHJKMNPQRSTVWX", apiKey: "hf_secret" });
    expect(validateReport(report), JSON.stringify(validateReport.errors)).toBe(true);
  });

  it("keeps the public runtime copies byte-identical to the vendored adapter", async () => {
    for (const file of ["engine.js", "remote.js", "index.js", "LICENSE.txt"]) {
      const vendor = await readFile(join(root, "vendor/agentic-web-runtime", file));
      for (const app of ["workbench", "demo-target"]) {
        const copy = await readFile(join(root, `apps/${app}/public/runtime`, file));
        expect(copy.equals(vendor), `${app}/${file}`).toBe(true);
      }
    }
  });

  it("configures CORS on both local origins", async () => {
    for (const app of ["workbench", "demo-target"]) {
      const config = await readFile(join(root, `apps/${app}/vite.config.ts`), "utf8");
      expect(config).toContain("Access-Control-Allow-Origin");
    }
    const headers = await readFile(join(root, "apps/demo-target/public/_headers"), "utf8");
    expect(headers).toContain("Access-Control-Allow-Origin: *");
  });
});
