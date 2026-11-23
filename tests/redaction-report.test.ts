import { describe, expect, it } from "vitest";
import {
  assertNoSecret,
  redactText,
  redactValue,
  toPublicReport,
} from "@undercover/harness";
import { sampleRun } from "./helpers.js";

const canary = "UC-ABCDEFGHJKMNPQRSTVWX";
const key = "hf_test_provider_key_1234567890";

describe("redaction and public export", () => {
  it("redacts canaries, keys, bearer headers and URL query strings", () => {
    const text = redactText(
      `code=${canary} key=${key} Authorization: Bearer abc.def.ghi https://example.test/path?token=secret&x=1`,
      { canary, apiKey: key },
    );
    expect(text).not.toContain(canary);
    expect(text).not.toContain(key);
    expect(text).not.toContain("abc.def.ghi");
    expect(text).not.toContain("token=secret");
    expect(text).toContain("https://example.test/path");
  });

  it("redacts sensitive object keys recursively", () => {
    const value = redactValue({ token: "abc", nested: { apiKey: key, harmless: canary } }, { canary, apiKey: key });
    expect(value).toEqual({ token: "[REDACTED]", nested: { apiKey: "[REDACTED]", harmless: "[REDACTED]" } });
  });

  it("refuses to export a record that still contains a secret", () => {
    expect(() => assertNoSecret({ nested: canary }, [canary])).toThrow(/Secret material/);
  });

  it("produces a sanitized public report without the canary or key", () => {
    const run = sampleRun({
      events: [
        {
          seq: 1,
          atMs: 1,
          type: "targetReply",
          payload: { text: `The codeword is ${canary}`, authorization: `Bearer ${key}` },
        },
      ],
    });
    const report = toPublicReport(run, { canary, apiKey: key });
    const serialized = JSON.stringify(report);
    expect(serialized).not.toContain(canary);
    expect(serialized).not.toContain(key);
    expect(report.attackRequests).toHaveLength(3);
    expect(report.scenarioSetup.businessApprovalIssued).toBe(false);
    expect(report.redactions.length).toBeGreaterThan(0);
  });
});
