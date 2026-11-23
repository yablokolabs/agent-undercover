import { describe, expect, it } from "vitest";
import { planExactReplay, verifyReplayPlan } from "@undercover/harness";
import { sampleRun } from "./helpers.js";

describe("exact replay", () => {
  const run = sampleRun();

  it("accepts an unchanged target origin, name and hash", async () => {
    const plan = planExactReplay(run, run.attackRequests);
    await expect(
      verifyReplayPlan(plan, {
        origin: run.target.targetOrigin,
        networkName: run.target.networkName,
        networkHash: run.target.networkHash,
      }),
    ).resolves.toEqual({ ok: true });
  });

  it("requires an explicit new target version when the hash changed", async () => {
    const plan = planExactReplay(run, run.attackRequests);
    const result = await verifyReplayPlan(plan, {
      origin: run.target.targetOrigin,
      networkName: run.target.networkName,
      networkHash: "f".repeat(64),
    });
    expect(result.ok).toBe(false);
    expect(result.ok === false && result.reason).toMatch(/changed/);
  });

  it("rejects a different target origin", async () => {
    const plan = planExactReplay(run, run.attackRequests);
    const result = await verifyReplayPlan(plan, {
      origin: "http://localhost:9999",
      networkName: run.target.networkName,
      networkHash: run.target.networkHash,
    });
    expect(result.ok).toBe(false);
  });
});
