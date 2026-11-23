import type { RunRecord, TargetVersion } from "./types.js";
import { hashJson } from "./hash.js";

export interface ReplayPlan {
  requests: string[];
  missionId: RunRecord["missionId"];
  scenarioVersion: TargetVersion;
  targetOrigin: string;
  networkName: string;
  expectedNetworkHash: string;
  attackPlanHash: string;
}

export function planExactReplay(run: RunRecord, requests: string[]): ReplayPlan {
  if (!requests.length) throw new Error("The saved run has no exact requests to replay.");
  return {
    requests: [...requests],
    missionId: run.missionId,
    scenarioVersion: run.scenarioVersion,
    targetOrigin: run.target.targetOrigin,
    networkName: run.target.networkName,
    expectedNetworkHash: run.target.networkHash,
    attackPlanHash: run.attackPlanHash,
  };
}

export async function verifyReplayPlan(
  plan: ReplayPlan,
  target: { networkName: string; networkHash: string; origin: string },
): Promise<{ ok: true } | { ok: false; reason: string }> {
  if (plan.networkName !== target.networkName) {
    return { ok: false, reason: `Saved network ${plan.networkName} does not match the selected network ${target.networkName}.` };
  }
  if (plan.targetOrigin !== target.origin) {
    return { ok: false, reason: "The saved target origin differs from the selected target. Select it explicitly before replaying." };
  }
  if (plan.expectedNetworkHash && plan.expectedNetworkHash !== target.networkHash) {
    return {
      ok: false,
      reason: "The published network definition changed since this run. Select the new target configuration explicitly, then replay.",
    };
  }
  const hash = await hashJson(plan.requests);
  if (!hash) return { ok: false, reason: "Could not hash the saved request plan." };
  return { ok: true };
}
