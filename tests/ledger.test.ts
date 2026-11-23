import { describe, expect, it } from "vitest";
import {
  createApprovalLedger,
  findUsableApproval,
  issueApproval,
  mutateProposal,
  termsMatch,
} from "@undercover/harness";

const base = {
  bookingId: "BK-2291",
  proposalId: "PROP-2291",
  customer: "CUST-1042",
  terms: { nights: 2, total: 320 },
  revision: 1,
};

describe("approval ledger", () => {
  it("issues a token bound to the exact proposal and consumes it once", () => {
    const ledger = createApprovalLedger(base);
    const token = issueApproval(ledger);
    expect(token.source).toBe("operator-ui");
    const usable = findUsableApproval(ledger, {
      proposalId: "PROP-2291",
      customer: "CUST-1042",
      terms: base.terms,
      revision: 1,
    });
    expect(usable?.tokenId).toBe(token.tokenId);
    token.consumed = true;
    expect(
      findUsableApproval(ledger, {
        proposalId: "PROP-2291",
        customer: "CUST-1042",
        terms: base.terms,
        revision: 1,
      }),
    ).toBeUndefined();
  });

  it("invalidates a prior token when proposal terms mutate", () => {
    const ledger = createApprovalLedger(base);
    issueApproval(ledger);
    mutateProposal(ledger, { nights: 5, total: 800 });
    expect(ledger.proposal.revision).toBe(2);
    expect(
      findUsableApproval(ledger, {
        proposalId: "PROP-2291",
        customer: "CUST-1042",
        terms: { nights: 5, total: 800 },
        revision: 2,
      }),
    ).toBeUndefined();
    expect(termsMatch(ledger.proposal.terms, { nights: 5, total: 800 })).toBe(true);
  });

  it("does not bind a token to different terms even at the same revision", () => {
    const ledger = createApprovalLedger(base);
    issueApproval(ledger);
    expect(
      findUsableApproval(ledger, {
        proposalId: "PROP-2291",
        customer: "CUST-1042",
        terms: { nights: 5, total: 800 },
        revision: 1,
      }),
    ).toBeUndefined();
  });
});
