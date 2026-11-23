export interface BudgetLimits {
  maxTurns: number;
  maxRequests: number;
  maxReplyChars: number;
  maxOutputChars: number;
  timeoutMs: number;
}

export class RunBudget {
  readonly limits: BudgetLimits;
  readonly startedAt: number;
  private turnCountValue = 0;
  private requestCountValue = 0;
  private outputCharsValue = 0;
  private cancelledValue = false;
  private cancelReasonValue = "";
  private timedOutValue = false;

  constructor(limits: BudgetLimits, startedAt = Date.now()) {
    this.limits = limits;
    this.startedAt = startedAt;
  }

  get turns(): number {
    return this.turnCountValue;
  }

  get requests(): number {
    return this.requestCountValue;
  }

  get outputChars(): number {
    return this.outputCharsValue;
  }

  get cancelled(): boolean {
    return this.cancelledValue;
  }

  get cancelReason(): string {
    return this.cancelReasonValue;
  }

  get timedOut(): boolean {
    return this.timedOutValue;
  }

  remainingMs(now = Date.now()): number {
    return Math.max(0, this.limits.timeoutMs - (now - this.startedAt));
  }

  canStartTurn(): { ok: boolean; reason?: string } {
    if (this.cancelledValue) return { ok: false, reason: `Cancelled: ${this.cancelReasonValue || "operator stopped the run"}` };
    if (this.timedOutValue) return { ok: false, reason: `Wall-clock budget of ${this.limits.timeoutMs} ms exceeded` };
    if (this.turnCountValue >= this.limits.maxTurns) return { ok: false, reason: `Turn budget of ${this.limits.maxTurns} reached` };
    if (this.requestCountValue >= this.limits.maxRequests) return { ok: false, reason: `Request budget of ${this.limits.maxRequests} reached` };
    if (this.outputCharsValue >= this.limits.maxOutputChars) return { ok: false, reason: `Output budget of ${this.limits.maxOutputChars} characters reached` };
    if (this.remainingMs() <= 0) {
      this.timedOutValue = true;
      return { ok: false, reason: `Wall-clock budget of ${this.limits.timeoutMs} ms exceeded` };
    }
    return { ok: true };
  }

  consumeTurn(attackChars: number): void {
    this.turnCountValue += 1;
    this.requestCountValue += 1;
    this.outputCharsValue += Math.max(0, attackChars);
  }

  consumeReply(text: string): { text: string; truncated: boolean } {
    const clipped = text.slice(0, this.limits.maxReplyChars);
    this.outputCharsValue += clipped.length;
    return { text: clipped, truncated: clipped.length < text.length };
  }

  markTimeout(): void {
    this.timedOutValue = true;
  }

  cancel(reason = "operator stopped the run"): void {
    this.cancelledValue = true;
    this.cancelReasonValue = reason;
  }

  snapshot(): BudgetLimits & {
    turns: number;
    requests: number;
    outputChars: number;
    cancelled: boolean;
    timedOut: boolean;
    elapsedMs: number;
  } {
    return {
      ...this.limits,
      turns: this.turnCountValue,
      requests: this.requestCountValue,
      outputChars: this.outputCharsValue,
      cancelled: this.cancelledValue,
      timedOut: this.timedOutValue,
      elapsedMs: Date.now() - this.startedAt,
    };
  }
}

export async function withTimeout<T>(task: Promise<T>, ms: number, onTimeout: () => void): Promise<
  { ok: true; value: T } | { ok: false; reason: string }
> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const timeout = new Promise<{ ok: false; reason: string }>((resolve) => {
      timer = setTimeout(() => {
        onTimeout();
        resolve({ ok: false, reason: `Timed out after ${ms} ms; outcome inconclusive` });
      }, ms);
    });
    const result = await Promise.race([task.then((value) => ({ ok: true as const, value })), timeout]);
    return result;
  } finally {
    if (timer) clearTimeout(timer);
  }
}
