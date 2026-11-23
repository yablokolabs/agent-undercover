import { DEFAULT_MODEL, DEFAULT_ROUTER, DEFAULT_TARGET_ORIGIN } from "./config.js";
import type { MissionId, TargetVersion } from "@undercover/harness";
import type { ActionReviewItem } from "./agent/runtime.js";

export interface WorkbenchSettings {
  missionId: MissionId;
  version: TargetVersion;
  targetBaseUrl: string;
  executionMode: "live" | "fixture";
  router: string;
  model: string;
  apiKey: string;
  authorized: boolean;
  autoConfirmHost: boolean;
  issueApprovalToken: boolean;
}

export const INITIAL_SETTINGS: WorkbenchSettings = {
  missionId: "secret",
  version: "vulnerable",
  targetBaseUrl: DEFAULT_TARGET_ORIGIN,
  executionMode: "fixture",
  router: DEFAULT_ROUTER,
  model: DEFAULT_MODEL,
  apiKey: "",
  authorized: false,
  autoConfirmHost: false,
  issueApprovalToken: false,
};

export type ViewName = "mission" | "case" | "compare" | "published";

export interface ConsentInfo {
  origin: string;
  purpose: string;
  request: string;
}

export interface PendingConsent extends ConsentInfo {
  resolve: (allowed: boolean, remember: boolean) => void;
}

export interface PendingHostConfirm {
  items: ActionReviewItem[];
  resolve: (approved: boolean) => void;
}
