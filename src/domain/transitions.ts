import { QUEST_LIBRARY } from "@/data/quest-library";
import { createRng, rngId } from "@/lib/random";
import { evaluateAchievements, initialAchievementProgress } from "./achievements";
import { levelForXp } from "./levels";
import { BOARD_SIZE, drawQuests, rememberQuestIds } from "./quests";
import { applyCompletionToStreak } from "./streaks";
import type { AppState, CompletionResult, QuestTemplate } from "./types";

export const SCHEMA_VERSION = 1;
export const DEFAULT_PLAYER_NAME = "Adventurer";
export const MAX_NAME_LENGTH = 24;

/**
 * Everything impure (time, randomness) is passed in, so every transition is a
 * pure function of its inputs.
 */
export interface Clock {
  /** ISO timestamp. */
  now: string;
  /** Local calendar date key (YYYY-MM-DD) for `now`. */
  today: string;
  /** Seed for the deterministic PRNG. */
  seed: number;
}

export function createInitialState(now = new Date(0).toISOString()): AppState {
  return {
    schemaVersion: SCHEMA_VERSION,
    onboarded: false,
    player: {
      id: "player_local",
      name: DEFAULT_PLAYER_NAME,
      totalXp: 0,
      level: 1,
      currentStreak: 0,
      longestStreak: 0,
      createdAt: now,
    },
    availableQuests: [],
    activeQuest: null,
    questHistory: [],
    achievements: initialAchievementProgress(),
    recentQuestIds: [],
    settings: { reducedMotion: false },
  };
}

export function sanitizeName(name: string): string {
  const trimmed = name.replace(/\s+/g, " ").trim().slice(0, MAX_NAME_LENGTH);
  return trimmed.length > 0 ? trimmed : DEFAULT_PLAYER_NAME;
}

/** Number of available offers the board should hold for the current state. */
export function boardTarget(state: Pick<AppState, "activeQuest">): number {
  return state.activeQuest ? BOARD_SIZE - 1 : BOARD_SIZE;
}

/** Top the board up to its target size without touching existing offers. */
export function ensureBoard(state: AppState, clock: Clock, library: readonly QuestTemplate[] = QUEST_LIBRARY): AppState {
  const missing = boardTarget(state) - state.availableQuests.length;
  if (missing <= 0) return state;

  const rng = createRng(clock.seed);
  const exclude = state.availableQuests.map((quest) => quest.id);
  if (state.activeQuest) exclude.push(state.activeQuest.id);

  const drawn = drawQuests({
    library,
    rng,
    now: clock.now,
    count: missing,
    exclude,
    avoid: state.recentQuestIds,
    presentCategories: state.availableQuests.map((quest) => quest.category),
  });

  return {
    ...state,
    availableQuests: [...state.availableQuests, ...drawn],
    recentQuestIds: rememberQuestIds(
      state.recentQuestIds,
      drawn.map((quest) => quest.id),
    ),
  };
}

export function completeOnboarding(state: AppState, name: string, clock: Clock): AppState {
  if (state.onboarded) return state;
  const rng = createRng(clock.seed);
  const onboarded: AppState = {
    ...state,
    onboarded: true,
    player: { ...state.player, id: rngId(rng, "player"), name: sanitizeName(name), createdAt: clock.now },
  };
  return ensureBoard(onboarded, { ...clock, seed: clock.seed + 1 });
}

export type AcceptError = "quest-already-active" | "quest-not-found";

export function acceptQuest(
  state: AppState,
  instanceId: string,
  clock: Pick<Clock, "now">,
): { state: AppState; error?: AcceptError } {
  if (state.activeQuest) return { state, error: "quest-already-active" };
  const quest = state.availableQuests.find((q) => q.instanceId === instanceId);
  if (!quest) return { state, error: "quest-not-found" };

  return {
    state: {
      ...state,
      activeQuest: { ...quest, status: "active", acceptedAt: clock.now },
      availableQuests: state.availableQuests.filter((q) => q.instanceId !== instanceId),
    },
  };
}

/**
 * Complete the active quest. Returns `result: null` (and the unchanged state)
 * unless `instanceId` matches the active quest, so a repeated dispatch can
 * never award XP twice.
 */
export function completeQuest(
  state: AppState,
  instanceId: string,
  clock: Clock,
): { state: AppState; result: CompletionResult | null } {
  const active = state.activeQuest;
  if (!active || active.instanceId !== instanceId) return { state, result: null };

  const completed = { ...active, status: "completed" as const, completedAt: clock.now };
  const previousXp = state.player.totalXp;
  const newXp = previousXp + Math.max(0, active.xp);
  const previousLevel = levelForXp(previousXp);
  const newLevel = levelForXp(newXp);
  const streak = applyCompletionToStreak(state.player, clock.today);

  const player = {
    ...state.player,
    totalXp: newXp,
    level: newLevel,
    currentStreak: streak.currentStreak,
    longestStreak: streak.longestStreak,
    lastCompletionDate: streak.lastCompletionDate,
  };
  const questHistory = [completed, ...state.questHistory];
  const { achievements, newlyUnlocked } = evaluateAchievements(
    { player, questHistory, achievements: state.achievements },
    clock.now,
  );

  const next = ensureBoard(
    {
      ...state,
      player,
      questHistory,
      achievements,
      activeQuest: null,
      recentQuestIds: rememberQuestIds(state.recentQuestIds, [active.id]),
    },
    clock,
  );

  return {
    state: next,
    result: {
      quest: completed,
      xpEarned: newXp - previousXp,
      previousXp,
      newXp,
      previousLevel,
      newLevel,
      leveledUp: newLevel > previousLevel,
      streak: streak.currentStreak,
      unlockedAchievementIds: newlyUnlocked,
    },
  };
}

/** Abandon without penalty: XP and streak are untouched. */
export function abandonQuest(state: AppState, instanceId: string, clock: Clock): AppState {
  const active = state.activeQuest;
  if (!active || active.instanceId !== instanceId) return state;

  return ensureBoard(
    {
      ...state,
      activeQuest: null,
      questHistory: [{ ...active, status: "abandoned", abandonedAt: clock.now }, ...state.questHistory],
      recentQuestIds: rememberQuestIds(state.recentQuestIds, [active.id]),
    },
    clock,
  );
}

/** Replace every available offer. The active quest is never touched. */
export function rerollBoard(state: AppState, clock: Clock): AppState {
  const cleared: AppState = {
    ...state,
    availableQuests: [],
    // The outgoing board counts as "recent" so it isn't offered straight back.
    recentQuestIds: rememberQuestIds(
      state.recentQuestIds,
      state.availableQuests.map((quest) => quest.id),
    ),
  };
  return ensureBoard(cleared, clock);
}

export function renamePlayer(state: AppState, name: string): AppState {
  return { ...state, player: { ...state.player, name: sanitizeName(name) } };
}

export function setReducedMotion(state: AppState, reducedMotion: boolean): AppState {
  return { ...state, settings: { ...state.settings, reducedMotion } };
}

/** Developer-only helper for quickly testing high levels. */
export function grantXp(state: AppState, xp: number): AppState {
  const totalXp = Math.max(0, state.player.totalXp + xp);
  return { ...state, player: { ...state.player, totalXp, level: levelForXp(totalXp) } };
}
