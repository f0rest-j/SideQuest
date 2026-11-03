/**
 * Lightweight, dependency-free validation for persisted state. Each parser
 * either returns a well-typed value or `null`; collection parsers drop invalid
 * items instead of rejecting the whole save, so valid progress survives.
 */
import { ACHIEVEMENT_LIBRARY } from "@/data/achievement-library";
import { initialAchievementProgress } from "@/domain/achievements";
import { levelForXp } from "@/domain/levels";
import { SCHEMA_VERSION, createInitialState, sanitizeName } from "@/domain/transitions";
import {
  QUEST_CATEGORIES,
  QUEST_RARITIES,
  QUEST_STATUSES,
  type AchievementProgress,
  type AppState,
  type Player,
  type QuestInstance,
  type QuestStatus,
} from "@/domain/types";
import { isDateKey, isValidIsoDate } from "./dates";

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isOneOf<T extends string>(options: readonly T[], value: unknown): value is T {
  return typeof value === "string" && (options as readonly string[]).includes(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isNonNegativeInt(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0;
}

function optionalIso(value: unknown): string | undefined {
  return isValidIsoDate(value) ? value : undefined;
}

export function parseQuestInstance(value: unknown, expectedStatus?: QuestStatus): QuestInstance | null {
  if (!isRecord(value)) return null;
  const v = value;
  if (
    !isNonEmptyString(v.id) ||
    !isNonEmptyString(v.instanceId) ||
    !isNonEmptyString(v.title) ||
    typeof v.description !== "string" ||
    !isOneOf(QUEST_CATEGORIES, v.category) ||
    !isOneOf(QUEST_RARITIES, v.rarity) ||
    !isOneOf(QUEST_STATUSES, v.status) ||
    !isNonNegativeInt(v.xp) ||
    !isNonNegativeInt(v.estimatedMinutes) ||
    !isValidIsoDate(v.offeredAt)
  ) {
    return null;
  }
  if (expectedStatus && v.status !== expectedStatus) return null;

  const quest: QuestInstance = {
    id: v.id,
    instanceId: v.instanceId,
    title: v.title,
    description: v.description,
    category: v.category,
    rarity: v.rarity,
    status: v.status,
    xp: v.xp,
    estimatedMinutes: v.estimatedMinutes,
    offeredAt: v.offeredAt,
  };
  if (typeof v.safetyNote === "string" && v.safetyNote) quest.safetyNote = v.safetyNote;
  if (Array.isArray(v.tags)) quest.tags = v.tags.filter((t): t is string => typeof t === "string");
  const acceptedAt = optionalIso(v.acceptedAt);
  const completedAt = optionalIso(v.completedAt);
  const abandonedAt = optionalIso(v.abandonedAt);
  if (acceptedAt) quest.acceptedAt = acceptedAt;
  if (completedAt) quest.completedAt = completedAt;
  if (abandonedAt) quest.abandonedAt = abandonedAt;
  return quest;
}

export function parsePlayer(value: unknown): Player | null {
  if (!isRecord(value)) return null;
  const v = value;
  if (!isNonEmptyString(v.id) || typeof v.name !== "string" || !isNonNegativeInt(v.totalXp)) return null;

  const currentStreak = isNonNegativeInt(v.currentStreak) ? v.currentStreak : 0;
  const longestStreak = Math.max(isNonNegativeInt(v.longestStreak) ? v.longestStreak : 0, currentStreak);
  const player: Player = {
    id: v.id,
    name: sanitizeName(v.name),
    totalXp: v.totalXp,
    // Level is always derived from XP, so a corrupted level can't desync progress.
    level: levelForXp(v.totalXp),
    currentStreak,
    longestStreak,
    createdAt: isValidIsoDate(v.createdAt) ? v.createdAt : new Date(0).toISOString(),
  };
  if (isDateKey(v.lastCompletionDate)) player.lastCompletionDate = v.lastCompletionDate;
  return player;
}

function parseAchievements(value: unknown): AchievementProgress[] {
  const saved = new Map<string, AchievementProgress>();
  if (Array.isArray(value)) {
    for (const item of value) {
      if (!isRecord(item) || !isNonEmptyString(item.achievementId)) continue;
      const progress: AchievementProgress = {
        achievementId: item.achievementId,
        current: isNonNegativeInt(item.current) ? item.current : 0,
      };
      const unlockedAt = optionalIso(item.unlockedAt);
      if (unlockedAt) progress.unlockedAt = unlockedAt;
      saved.set(progress.achievementId, progress);
    }
  }
  // Always produce exactly one entry per known definition.
  return initialAchievementProgress(ACHIEVEMENT_LIBRARY).map((empty) => saved.get(empty.achievementId) ?? empty);
}

function parseQuestList(value: unknown, filter?: (q: QuestInstance) => boolean): QuestInstance[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  const quests: QuestInstance[] = [];
  for (const item of value) {
    const quest = parseQuestInstance(item);
    if (!quest || seen.has(quest.instanceId) || (filter && !filter(quest))) continue;
    seen.add(quest.instanceId);
    quests.push(quest);
  }
  return quests;
}

export interface ParseResult {
  state: AppState;
  /** True when anything had to be dropped or repaired. */
  repaired: boolean;
}

/**
 * Validate a (migrated) persisted object. Returns null only when nothing
 * salvageable remains (no valid player).
 */
export function parseAppState(value: unknown): ParseResult | null {
  if (!isRecord(value)) return null;
  const player = parsePlayer(value.player);
  if (!player) return null;

  const defaults = createInitialState();
  const activeQuest = value.activeQuest == null ? null : parseQuestInstance(value.activeQuest, "active");
  const usedTemplates = new Set<string>(activeQuest ? [activeQuest.id] : []);
  const availableQuests = parseQuestList(value.availableQuests, (q) => {
    if (q.status !== "available" || usedTemplates.has(q.id)) return false;
    usedTemplates.add(q.id);
    return true;
  });
  const questHistory = parseQuestList(
    value.questHistory,
    (q) => q.status === "completed" || q.status === "abandoned",
  );
  const recentQuestIds = Array.isArray(value.recentQuestIds)
    ? value.recentQuestIds.filter((id): id is string => typeof id === "string")
    : [];
  const settings = isRecord(value.settings) && typeof value.settings.reducedMotion === "boolean"
    ? { reducedMotion: value.settings.reducedMotion }
    : defaults.settings;

  const state: AppState = {
    schemaVersion: SCHEMA_VERSION,
    onboarded: value.onboarded === true,
    player,
    availableQuests,
    activeQuest,
    questHistory,
    achievements: parseAchievements(value.achievements),
    recentQuestIds,
    settings,
  };

  const repaired =
    (value.activeQuest != null && !activeQuest) ||
    (Array.isArray(value.availableQuests) ? value.availableQuests.length !== availableQuests.length : true) ||
    (Array.isArray(value.questHistory) ? value.questHistory.length !== questHistory.length : true) ||
    (isRecord(value.player) && value.player.level !== player.level);

  return { state, repaired };
}
