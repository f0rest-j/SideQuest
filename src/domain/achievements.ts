import { ACHIEVEMENT_LIBRARY } from "@/data/achievement-library";
import { metricValue } from "./stats";
import type { AchievementDefinition, AchievementProgress, AppState } from "./types";

export function initialAchievementProgress(
  definitions: readonly AchievementDefinition[] = ACHIEVEMENT_LIBRARY,
): AchievementProgress[] {
  return definitions.map((definition) => ({ achievementId: definition.id, current: 0 }));
}

export interface AchievementEvaluation {
  achievements: AchievementProgress[];
  newlyUnlocked: string[];
}

/**
 * Deterministically recompute progress for every definition. An achievement
 * unlocks once: an existing `unlockedAt` is never overwritten or removed.
 */
export function evaluateAchievements(
  state: Pick<AppState, "questHistory" | "player" | "achievements">,
  now: string,
  definitions: readonly AchievementDefinition[] = ACHIEVEMENT_LIBRARY,
): AchievementEvaluation {
  const existing = new Map(state.achievements.map((progress) => [progress.achievementId, progress]));
  const newlyUnlocked: string[] = [];

  const achievements = definitions.map((definition): AchievementProgress => {
    const previous = existing.get(definition.id);
    const current = Math.min(metricValue(definition.metric, state), definition.target);

    if (previous?.unlockedAt) {
      return { achievementId: definition.id, current: definition.target, unlockedAt: previous.unlockedAt };
    }
    if (current >= definition.target) {
      newlyUnlocked.push(definition.id);
      return { achievementId: definition.id, current, unlockedAt: now };
    }
    return { achievementId: definition.id, current };
  });

  return { achievements, newlyUnlocked };
}
