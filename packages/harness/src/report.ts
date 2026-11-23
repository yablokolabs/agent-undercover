import type { PublicReport, RunRecord } from "./types.js";
import { assertNoSecret, redactValue, type RedactionOptions } from "./redaction.js";

export interface PublicReportOptions extends RedactionOptions {
  extraLimitations?: string[];
}

/** Export only sanitized fields. Provider keys, the canary and query strings never appear. */
export function toPublicReport(run: RunRecord, options: PublicReportOptions = {}): PublicReport {
  const report: PublicReport = {
    schemaVersion: 1,
    runId: run.runId,
    createdAt: run.createdAt,
    missionId: run.missionId,
    scenarioVersion: run.scenarioVersion,
    configVersion: run.configVersion,
    executionSource: run.executionSource,
    runtimeCommit: run.runtimeCommit,
    upstreamCommit: run.upstreamCommit,
    specVersion: run.specVersion,
    targetOrigin: run.target.targetOrigin,
    networkName: run.target.networkName,
    networkHash: run.target.networkHash,
    routerOrigin: run.routerOrigin,
    modelId: run.modelId,
    generationSettings: run.generationSettings,
    attackPlanHash: run.attackPlanHash,
    attackRequests: run.attackRequests,
    scenarioSetup: run.scenarioSetup,
    requestedLimits: run.requestedLimits,
    observedUsage: run.observedUsage,
    events: redactValue(run.events, options) as PublicReport["events"],
    result: redactValue(run.result, options) as PublicReport["result"],
    replay: run.replay,
    attackSource: run.attackSource,
    redactions: [
      "Provider credentials are never recorded.",
      "The per-run synthetic canary is replaced with [REDACTED_CANARY].",
      "URL query strings are removed from artifacts and evidence.",
      "Only bounded, sanitized event payloads are exported.",
    ],
    limitations: [
      ...run.result.oracle.limitations,
      "This record is a reproducible test case, not a security certification.",
      ...(options.extraLimitations || []),
    ],
  };
  assertNoSecret(report, [options.canary, options.apiKey, ...(options.secrets || [])].filter(Boolean) as string[]);
  return report;
}

export function reportToMarkdown(report: PublicReport): string {
  const lines = [
    `# Agent Undercover case file`,
    ``,
    `- Run: ${report.runId}`,
    `- Created: ${report.createdAt}`,
    `- Mission: ${report.missionId}`,
    `- Target: ${report.targetOrigin}/${report.networkName}`,
    `- Network hash: ${report.networkHash}`,
    `- Target configuration: v${report.configVersion} (${report.scenarioVersion})`,
    `- Execution: ${report.executionSource}${report.executionSource === "fixture" ? " (deterministic fixture, not a live model run)" : ""}`,
    `- Model: ${report.modelId}`,
    `- Router: ${report.routerOrigin}`,
    `- Runtime: ${report.runtimeCommit}`,
    `- Spec: ${report.specVersion} (upstream ${report.upstreamCommit})`,
    ``,
    `## Result`,
    ``,
    `**${report.result.outcome}** — ${report.result.summary}`,
    ``,
    `Misleading assistant promise: ${report.result.misleadingPromise ? "yes" : "no"}`,
    ``,
    `## Evidence`,
    ``,
    `| # | Time | Event | Detail |`,
    `| --- | --- | --- | --- |`,
    ...report.events.map(
      (event) =>
        `| ${event.seq} | ${event.atMs} ms | ${escapeCell(event.type)} | ${escapeCell(compact(event.payload))} |`,
    ),
    ``,
    `## Limits and interpretation`,
    ``,
    ...report.limitations.map((item) => `- ${item}`),
    ``,
    `## Reproduction`,
    ``,
    `1. Open the workbench and import this JSON report.`,
    `2. Select **${report.missionId}**, target version **${report.scenarioVersion}**, and the recorded target origin.`,
    `3. Use the stored fixed attack plan ${report.attackPlanHash.slice(0, 16)}… and the same limits.`,
    `4. A live-model result requires the same router/model family; outputs can vary.`,
    ``,
  ];
  return lines.join("\n");
}

function compact(value: unknown): string {
  const text = typeof value === "string" ? value : JSON.stringify(value);
  return text.length > 220 ? `${text.slice(0, 220)}…` : text;
}

function escapeCell(value: string): string {
  return value.replace(/\|/g, "\\|").replace(/\n/g, " ");
}
