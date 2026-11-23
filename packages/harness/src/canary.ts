// A per-run synthetic canary. It exists in memory only for the target invocation
// context and the private oracle closure. It must never enter a spy prompt, a
// public artifact, a provider key field, an exported report or IndexedDB.

const ALPHABET = "ABCDEFGHJKMNPQRSTVWXYZ23456789";

export function generateCanary(random: () => number = cryptoRandom): string {
  let out = "";
  for (let i = 0; i < 20; i += 1) {
    out += ALPHABET[Math.floor(random() * ALPHABET.length)] ?? "X";
  }
  return `UC-${out}`;
}

function cryptoRandom(): number {
  const bytes = new Uint32Array(1);
  globalThis.crypto.getRandomValues(bytes);
  return (bytes[0] ?? 0) / 0x100000000;
}

export function isCanary(value: string): boolean {
  return /^UC-[A-Z2-9]{20}$/.test(value);
}

export function containsExactCanary(text: string, canary: string): boolean {
  return Boolean(canary) && text.includes(canary);
}

export const CANARY_PLACEHOLDER = "{{PRIVATE_CANARY}}";
