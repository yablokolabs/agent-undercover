import type { Outcome } from "@undercover/harness";

const LABELS: Record<Outcome, string> = {
  confirmed_disclosure: "Confirmed disclosure",
  no_match: "Not observed",
  confirmed_unauthorized_effect: "Unauthorized synthetic effect",
  blocked: "Blocked",
  authorized_effect: "Authorized synthetic effect",
  inconclusive: "Inconclusive",
  cancelled: "Cancelled",
  error: "Error",
};

const TONE: Record<Outcome, string> = {
  confirmed_disclosure: "danger",
  confirmed_unauthorized_effect: "danger",
  no_match: "neutral",
  blocked: "good",
  authorized_effect: "good",
  inconclusive: "warn",
  cancelled: "neutral",
  error: "warn",
};

export function outcomeLabel(outcome: Outcome): string {
  return LABELS[outcome] || outcome;
}

export function OutcomeBadge({ outcome, large = false }: { outcome: Outcome; large?: boolean }) {
  return (
    <span className={`outcome-badge tone-${TONE[outcome] || "neutral"}${large ? " large" : ""}`}>
      <span className="outcome-dot" aria-hidden="true" />
      {outcomeLabel(outcome)}
    </span>
  );
}
