import { describe, expect, it, vi } from "vitest";
import { RunBudget, withTimeout } from "@undercover/harness";

const limits = {
  maxTurns: 2,
  maxRequests: 2,
  maxReplyChars: 10,
  maxOutputChars: 25,
  timeoutMs: 1000,
};

describe("run budget", () => {
  it("stops after the turn and request limits", () => {
    const budget = new RunBudget(limits);
    expect(budget.canStartTurn().ok).toBe(true);
    budget.consumeTurn(5);
    budget.consumeReply("hello");
    expect(budget.canStartTurn().ok).toBe(true);
    budget.consumeTurn(5);
    const stopped = budget.canStartTurn();
    expect(stopped.ok).toBe(false);
    expect(stopped.reason).toContain("Turn budget");
  });

  it("truncates replies and tracks output characters", () => {
    const budget = new RunBudget(limits);
    const clipped = budget.consumeReply("x".repeat(100));
    expect(clipped.text).toHaveLength(10);
    expect(clipped.truncated).toBe(true);
    expect(budget.outputChars).toBe(10);
  });

  it("cancels immediately between turns", () => {
    const budget = new RunBudget(limits);
    budget.cancel("operator pressed stop");
    expect(budget.canStartTurn()).toMatchObject({ ok: false });
    expect(budget.cancelReason).toContain("operator");
  });

  it("marks a timed-out call and resolves the timeout branch", async () => {
    vi.useFakeTimers();
    const budget = new RunBudget(limits);
    const pending = withTimeout(new Promise<string>(() => {}), 20, () => budget.markTimeout());
    await vi.advanceTimersByTimeAsync(25);
    const result = await pending;
    expect(result.ok).toBe(false);
    expect(budget.timedOut).toBe(true);
    vi.useRealTimers();
  });
});
