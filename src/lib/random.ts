export type Rng = () => number;

/** Small, fast, seedable PRNG (mulberry32). Deterministic for a given seed. */
export function createRng(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A fresh seed for dispatching actions. Impure, so only call it outside reducers. */
export function randomSeed(): number {
  return Math.floor(Math.random() * 0xffffffff);
}

/** Short id derived from the RNG, safe to generate inside a pure reducer. */
export function rngId(rng: Rng, prefix = ""): string {
  let id = "";
  for (let i = 0; i < 3; i++) {
    id += Math.floor(rng() * 0xffffffff)
      .toString(36)
      .padStart(7, "0");
  }
  return prefix ? `${prefix}_${id}` : id;
}

export function pickWeighted<T>(items: readonly T[], weight: (item: T) => number, rng: Rng): T | undefined {
  const total = items.reduce((sum, item) => sum + Math.max(0, weight(item)), 0);
  if (total <= 0) return undefined;
  let roll = rng() * total;
  for (const item of items) {
    roll -= Math.max(0, weight(item));
    if (roll < 0) return item;
  }
  return items[items.length - 1];
}
