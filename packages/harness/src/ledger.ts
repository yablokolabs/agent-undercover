export interface SyntheticCustomer {
  id: string;
  maxEligiblePercent: number;
  staffEligible: boolean;
}

export interface DiscountEntry {
  turnId: string;
  percent: number;
  subtotal: number;
  total: number;
  authorized: boolean;
  requestedPercent: number;
  reason?: string;
}

export interface RejectedDiscount {
  turnId: string;
  percent: number;
  reason: string;
}

export interface DiscountLedger {
  customer: SyntheticCustomer;
  applied: DiscountEntry[];
  rejected: RejectedDiscount[];
}

export interface BookingTerms {
  nights: number;
  total: number;
}

export interface BookingState {
  id: string;
  customer: string;
  status: "pending" | "finalized";
  terms: BookingTerms;
  revision: number;
}

export interface ProposalState {
  id: string;
  bookingId: string;
  customer: string;
  terms: BookingTerms;
  revision: number;
  status: "pending" | "approved" | "consumed" | "invalidated";
}

export interface ApprovalToken {
  tokenId: string;
  proposalId: string;
  customer: string;
  terms: BookingTerms;
  revision: number;
  consumed: boolean;
  source: "operator-ui";
}

export interface Finalization {
  turnId: string;
  bookingId: string;
  proposalId: string;
  terms: BookingTerms;
  revision: number;
  tokenId?: string;
  authorized: boolean;
  reason?: string;
}

export interface RejectedFinalization {
  turnId: string;
  bookingId: string;
  proposalId: string;
  reason: string;
}

export interface ApprovalLedger {
  booking: BookingState;
  proposal: ProposalState;
  approvals: ApprovalToken[];
  finalizations: Finalization[];
  rejected: RejectedFinalization[];
}

export function createDiscountLedger(customer: SyntheticCustomer): DiscountLedger {
  return { customer, applied: [], rejected: [] };
}

export function createApprovalLedger(input: {
  bookingId: string;
  proposalId: string;
  customer: string;
  terms: BookingTerms;
  revision: number;
}): ApprovalLedger {
  return {
    booking: {
      id: input.bookingId,
      customer: input.customer,
      status: "pending",
      terms: { ...input.terms },
      revision: input.revision,
    },
    proposal: {
      id: input.proposalId,
      bookingId: input.bookingId,
      customer: input.customer,
      terms: { ...input.terms },
      revision: input.revision,
      status: "pending",
    },
    approvals: [],
    finalizations: [],
    rejected: [],
  };
}

export function termsMatch(a: BookingTerms, b: BookingTerms): boolean {
  return a.nights === b.nights && a.total === b.total;
}

/** Issue a one-use approval for the exact current proposal. Never called from model text. */
export function issueApproval(ledger: ApprovalLedger, now = Date.now()): ApprovalToken {
  const token: ApprovalToken = {
    tokenId: `APR-${now.toString(36)}-${ledger.approvals.length + 1}`,
    proposalId: ledger.proposal.id,
    customer: ledger.proposal.customer,
    terms: { ...ledger.proposal.terms },
    revision: ledger.proposal.revision,
    consumed: false,
    source: "operator-ui",
  };
  ledger.approvals.push(token);
  ledger.proposal.status = "approved";
  return token;
}

/** Mutating proposal terms or revision makes every prior approval unusable. */
export function mutateProposal(ledger: ApprovalLedger, terms: BookingTerms): void {
  ledger.proposal.terms = { ...terms };
  ledger.proposal.revision += 1;
  ledger.proposal.status = "pending";
  for (const token of ledger.approvals) token.consumed = true;
}

export function findUsableApproval(ledger: ApprovalLedger, input: {
  proposalId: string;
  customer: string;
  terms: BookingTerms;
  revision: number;
}): ApprovalToken | undefined {
  return ledger.approvals.find(
    (token) =>
      !token.consumed &&
      token.proposalId === input.proposalId &&
      token.customer === input.customer &&
      token.revision === input.revision &&
      termsMatch(token.terms, input.terms),
  );
}
