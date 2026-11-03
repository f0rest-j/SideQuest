import { describe, expect, it } from "vitest";
import { evaluateAchievements, initialAchievementProgress } from "@/domain/achievements";
import { createInitialState } from "@/domain/transitions";
import type { QuestInstance } from "@/domain/types";
import { questFromTemplate } from "./helpers";

const NOW = "2026-11-03T12:00:00.000Z";

function completed(templateId: string, n: number): QuestInstance[] {
  return Array.from({ length: n }, (_, i) =>
    questFromTemplate(templateId, { instanceId: `${templateId}-${i}`, status: "completed", completedAt: NOW }),
  );
}

function evaluate(history: QuestInstance[], longestStreak = 0, achievements = initialAchievementProgress()) {
  const base = createInitialState();
  return evaluateAchievements(
    { questHistory: history, player: { ...base.player, longestStreak }, achievements },
    NOW,
  );
}

function progressOf(result: ReturnType<typeof evaluate>, id: string) {
  return result.achievements.find((a) => a.achievementId === id)!;
}

describe("evaluateAchievements", () => {
  it("unlocks nothing for a fresh player", () => {
    expect(evaluate([]).newlyUnlocked).toEqual([]);
  });

  it("unlocks First Steps on the first completion", () => {
    const result = evaluate(completed("long-way-home", 1));
    expect(result.newlyUnlocked).toEqual(["first-steps"]);
    expect(progressOf(result, "first-steps").unlockedAt).toBe(NOW);
    expect(progressOf(result, "adventurer").current).toBe(1);
  });

  it("ignores abandoned quests", () => {
    const abandoned = questFromTemplate("long-way-home", { status: "abandoned", abandonedAt: NOW });
    expect(evaluate([abandoned]).newlyUnlocked).toEqual([]);
  });

  it("tracks category counts for Touch Grass", () => {
    const nine = evaluate(completed("fresh-air-reset", 9));
    expect(progressOf(nine, "touch-grass")).toEqual({ achievementId: "touch-grass", current: 9 });

    const ten = evaluate(completed("fresh-air-reset", 10), 0, nine.achievements);
    expect(ten.newlyUnlocked).toContain("touch-grass");
    expect(ten.newlyUnlocked).toContain("adventurer");
    expect(ten.newlyUnlocked).not.toContain("creative-spark");
  });

  it("unlocks Creative Spark after 10 creative quests", () => {
    expect(evaluate(completed("texture-hunt", 10)).newlyUnlocked).toContain("creative-spark");
  });

  it("unlocks streak achievements from the longest streak", () => {
    expect(evaluate([], 2).newlyUnlocked).toEqual([]);
    expect(evaluate([], 3).newlyUnlocked).toEqual(["on-a-roll"]);
    expect(evaluate([], 7).newlyUnlocked).toEqual(["on-a-roll", "unbroken"]);
  });

  it("handles rarity achievements", () => {
    const rare = evaluate(completed("golden-hour", 1));
    expect(rare.newlyUnlocked).toContain("main-character-energy");
    expect(rare.newlyUnlocked).not.toContain("epic-tale");

    const epic = evaluate(completed("new-horizon", 1));
    expect(epic.newlyUnlocked).toEqual(expect.arrayContaining(["main-character-energy", "epic-tale"]));
  });

  it("never unlocks twice and keeps the original timestamp", () => {
    const first = evaluate(completed("long-way-home", 1));
    const later = evaluateAchievements(
      { questHistory: completed("long-way-home", 2), player: createInitialState().player, achievements: first.achievements },
      "2027-01-01T00:00:00.000Z",
    );
    expect(later.newlyUnlocked).not.toContain("first-steps");
    expect(later.achievements.find((a) => a.achievementId === "first-steps")!.unlockedAt).toBe(NOW);
  });

  it("is deterministic", () => {
    const history = completed("golden-hour", 3);
    expect(evaluate(history)).toEqual(evaluate(history));
  });
});
