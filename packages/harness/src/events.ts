import type { EventRecord } from "./types.js";
import { redactValue, type RedactionOptions } from "./redaction.js";

/** A bounded, sanitized event log. It never accepts provider keys or private canaries. */
export class EventLog {
  private readonly events: EventRecord[] = [];
  private readonly startedAt = performance.now();
  private readonly redactions: RedactionOptions;

  constructor(redactions: RedactionOptions = {}) {
    this.redactions = redactions;
  }

  add(type: string, payload: Record<string, unknown> = {}): EventRecord {
    const event: EventRecord = {
      seq: this.events.length + 1,
      atMs: Math.round(performance.now() - this.startedAt),
      type,
      payload: redactValue(payload, this.redactions, 0) as Record<string, unknown>,
    };
    this.events.push(event);
    if (this.events.length > 500) this.events.splice(0, this.events.length - 500);
    return event;
  }

  all(): EventRecord[] {
    return [...this.events];
  }

  get elapsedMs(): number {
    return Math.round(performance.now() - this.startedAt);
  }
}

export function countEvents(events: EventRecord[], type: string): number {
  return events.filter((event) => event.type === type).length;
}

export function lastEvent(events: EventRecord[], type: string): EventRecord | undefined {
  return [...events].reverse().find((event) => event.type === type);
}
