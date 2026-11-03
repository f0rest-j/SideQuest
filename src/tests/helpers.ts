import { QUEST_LIBRARY } from "@/data/quest-library";
import { instantiateQuest } from "@/domain/quests";
import { completeOnboarding, createInitialState, type Clock } from "@/domain/transitions";
import type { AppState, QuestInstance } from "@/domain/types";
import { toLocalDateKey } from "@/lib/dates";
import { createRng } from "@/lib/random";

/** Clock for a local calendar date (month is 1-based), noon to avoid DST edges. */
export function clockAt(year: number, month: number, day: number, seed = 1, hour = 12): Clock {
  const date = new Date(year, month - 1, day, hour, 0, 0);
  return { now: date.toISOString(), today: toLocalDateKey(date), seed };
}

export function onboardedState(seed = 1): AppState {
  return completeOnboarding(createInitialState(), "Tester", clockAt(2026, 11, 3, seed));
}

export function questFromTemplate(id: string, overrides: Partial<QuestInstance> = {}): QuestInstance {
  const template = QUEST_LIBRARY.find((q) => q.id === id);
  if (!template) throw new Error(`Unknown template ${id}`);
  return { ...instantiateQuest(template, new Date(2026, 10, 3).toISOString(), createRng(id.length)), ...overrides };
}

/** State with the given quest already active. */
export function withActive(state: AppState, templateId: string): AppState {
  return {
    ...state,
    activeQuest: questFromTemplate(templateId, { status: "active", acceptedAt: state.player.createdAt }),
    availableQuests: state.availableQuests.filter((q) => q.id !== templateId).slice(0, 2),
  };
}
