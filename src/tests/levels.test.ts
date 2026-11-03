import { describe, expect, it } from "vitest";
import {
  clampPercent,
  currentLevelThreshold,
  didLevelUp,
  levelForXp,
  levelProgress,
  nextLevelThreshold,
  titleForLevel,
  xpIntoLevel,
  xpRequiredForLevel,
  xpToNextLevel,
} from "@/domain/levels";

describe("xpRequiredForLevel", () => {
  it("starts level 1 at 0 XP", () => {
    expect(xpRequiredForLevel(1)).toBe(0);
    expect(xpRequiredForLevel(0)).toBe(0);
    expect(xpRequiredForLevel(-3)).toBe(0);
  });

  it("follows the 125 * (L-1)^1.65 curve", () => {
    expect(xpRequiredForLevel(2)).toBe(125);
    expect(xpRequiredForLevel(3)).toBe(392);
    expect(xpRequiredForLevel(4)).toBe(766);
    expect(xpRequiredForLevel(10)).toBe(Math.round(125 * Math.pow(9, 1.65)));
  });

  it("is strictly increasing", () => {
    for (let level = 1; level < 60; level++) {
      expect(xpRequiredForLevel(level + 1)).toBeGreaterThan(xpRequiredForLevel(level));
    }
  });
});

describe("levelForXp", () => {
  it("handles exact boundaries and the values either side", () => {
    expect(levelForXp(0)).toBe(1);
    expect(levelForXp(124)).toBe(1);
    expect(levelForXp(125)).toBe(2);
    expect(levelForXp(126)).toBe(2);
    expect(levelForXp(391)).toBe(2);
    expect(levelForXp(392)).toBe(3);
    expect(levelForXp(393)).toBe(3);
  });

  it("can cross multiple levels in one jump", () => {
    expect(levelForXp(800)).toBe(4);
    expect(didLevelUp(0, 800)).toBe(true);
    expect(levelForXp(800) - levelForXp(0)).toBe(3);
  });

  it("is safe with invalid input", () => {
    expect(levelForXp(-50)).toBe(1);
    expect(levelForXp(Number.NaN)).toBe(1);
    expect(levelForXp(Number.POSITIVE_INFINITY)).toBe(1);
  });
});

describe("level progress helpers", () => {
  it("computes thresholds and in-level XP", () => {
    expect(currentLevelThreshold(200)).toBe(125);
    expect(nextLevelThreshold(200)).toBe(392);
    expect(xpIntoLevel(200)).toBe(75);
    expect(xpToNextLevel(200)).toBe(192);
  });

  it("reports 0% exactly on a threshold", () => {
    const progress = levelProgress(125);
    expect(progress.level).toBe(2);
    expect(progress.xpIntoLevel).toBe(0);
    expect(progress.percent).toBe(0);
  });

  it("reports just under 100% right before a threshold", () => {
    const progress = levelProgress(124);
    expect(progress.level).toBe(1);
    expect(progress.xpToNextLevel).toBe(1);
    expect(progress.percent).toBeCloseTo((124 / 125) * 100);
    expect(progress.percent).toBeLessThan(100);
  });

  it("clamps percentages", () => {
    expect(clampPercent(-5)).toBe(0);
    expect(clampPercent(150)).toBe(100);
    expect(clampPercent(Number.NaN)).toBe(0);
  });

  it("detects level-ups by comparing levels", () => {
    expect(didLevelUp(100, 124)).toBe(false);
    expect(didLevelUp(124, 125)).toBe(true);
  });
});

describe("titleForLevel", () => {
  it.each([
    [1, "Wanderer"],
    [2, "Wanderer"],
    [3, "Explorer"],
    [5, "Explorer"],
    [6, "Adventurer"],
    [9, "Adventurer"],
    [10, "Trailblazer"],
    [14, "Trailblazer"],
    [15, "Pathfinder"],
    [19, "Pathfinder"],
    [20, "Living Legend"],
    [42, "Living Legend"],
  ])("level %i is %s", (level, title) => {
    expect(titleForLevel(level)).toBe(title);
  });
});
