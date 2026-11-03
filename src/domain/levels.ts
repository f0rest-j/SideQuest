/** Safety ceiling so corrupted XP values can never cause an unbounded loop. */
export const MAX_LEVEL = 200;

/** Total XP required to *reach* `level`. Level 1 starts at 0 XP. */
export function xpRequiredForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.round(125 * Math.pow(level - 1, 1.65));
}

export function levelForXp(totalXp: number): number {
  const xp = Number.isFinite(totalXp) ? Math.max(0, totalXp) : 0;
  let level = 1;
  while (level < MAX_LEVEL && xpRequiredForLevel(level + 1) <= xp) {
    level += 1;
  }
  return level;
}

export interface LevelProgress {
  level: number;
  /** Total XP threshold for the current level. */
  currentLevelXp: number;
  /** Total XP threshold for the next level. */
  nextLevelXp: number;
  /** XP earned since reaching the current level. */
  xpIntoLevel: number;
  /** XP still needed to reach the next level. */
  xpToNextLevel: number;
  /** Size of the current level band. */
  levelSpan: number;
  /** 0–100, clamped. */
  percent: number;
}

export function currentLevelThreshold(totalXp: number): number {
  return xpRequiredForLevel(levelForXp(totalXp));
}

export function nextLevelThreshold(totalXp: number): number {
  return xpRequiredForLevel(levelForXp(totalXp) + 1);
}

export function xpIntoLevel(totalXp: number): number {
  return Math.max(0, totalXp) - currentLevelThreshold(totalXp);
}

export function xpToNextLevel(totalXp: number): number {
  return nextLevelThreshold(totalXp) - Math.max(0, totalXp);
}

export function clampPercent(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, value));
}

export function levelProgress(totalXp: number): LevelProgress {
  const xp = Number.isFinite(totalXp) ? Math.max(0, totalXp) : 0;
  const level = levelForXp(xp);
  const currentLevelXp = xpRequiredForLevel(level);
  const nextLevelXp = xpRequiredForLevel(level + 1);
  const levelSpan = nextLevelXp - currentLevelXp;
  const into = xp - currentLevelXp;
  return {
    level,
    currentLevelXp,
    nextLevelXp,
    xpIntoLevel: into,
    xpToNextLevel: nextLevelXp - xp,
    levelSpan,
    percent: levelSpan > 0 ? clampPercent((into / levelSpan) * 100) : 100,
  };
}

export function didLevelUp(previousXp: number, newXp: number): boolean {
  return levelForXp(newXp) > levelForXp(previousXp);
}

export function titleForLevel(level: number): string {
  if (level >= 20) return "Living Legend";
  if (level >= 15) return "Pathfinder";
  if (level >= 10) return "Trailblazer";
  if (level >= 6) return "Adventurer";
  if (level >= 3) return "Explorer";
  return "Wanderer";
}
