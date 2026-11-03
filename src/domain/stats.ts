import type { AchievementMetric, AppState, QuestCategory, QuestInstance, QuestRarity } from "./types";
import { QUEST_CATEGORIES } from "./types";

const RARITY_RANK: Record<QuestRarity, number> = {
  common: 0,
  uncommon: 1,
  rare: 2,
  epic: 3,
  legendary: 4,
};

export function isRareOrBetter(rarity: QuestRarity): boolean {
  return RARITY_RANK[rarity] >= RARITY_RANK.rare;
}

export function isEpicOrBetter(rarity: QuestRarity): boolean {
  return RARITY_RANK[rarity] >= RARITY_RANK.epic;
}

export interface PlayerStats {
  questsCompleted: number;
  questsAbandoned: number;
  rareOrBetterCompleted: number;
  epicOrBetterCompleted: number;
  byCategory: Record<QuestCategory, number>;
}

export function completedQuests(history: readonly QuestInstance[]): QuestInstance[] {
  return history.filter((quest) => quest.status === "completed");
}

/** Stats are derived from history so they can never drift out of sync. */
export function computeStats(history: readonly QuestInstance[]): PlayerStats {
  const byCategory = Object.fromEntries(QUEST_CATEGORIES.map((c) => [c, 0])) as Record<QuestCategory, number>;
  let questsCompleted = 0;
  let questsAbandoned = 0;
  let rareOrBetterCompleted = 0;
  let epicOrBetterCompleted = 0;

  for (const quest of history) {
    if (quest.status === "abandoned") questsAbandoned += 1;
    if (quest.status !== "completed") continue;
    questsCompleted += 1;
    byCategory[quest.category] += 1;
    if (isRareOrBetter(quest.rarity)) rareOrBetterCompleted += 1;
    if (isEpicOrBetter(quest.rarity)) epicOrBetterCompleted += 1;
  }

  return { questsCompleted, questsAbandoned, rareOrBetterCompleted, epicOrBetterCompleted, byCategory };
}

export function metricValue(metric: AchievementMetric, state: Pick<AppState, "questHistory" | "player">): number {
  const stats = computeStats(state.questHistory);
  switch (metric) {
    case "questsCompleted":
      return stats.questsCompleted;
    case "outdoorsCompleted":
      return stats.byCategory.outdoors;
    case "creativeCompleted":
      return stats.byCategory.creative;
    case "longestStreak":
      return state.player.longestStreak;
    case "rareOrBetterCompleted":
      return stats.rareOrBetterCompleted;
    case "epicOrBetterCompleted":
      return stats.epicOrBetterCompleted;
  }
}
