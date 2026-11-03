export const QUEST_RARITIES = ["common", "uncommon", "rare", "epic", "legendary"] as const;
export type QuestRarity = (typeof QUEST_RARITIES)[number];

export const QUEST_CATEGORIES = ["exploration", "outdoors", "creative", "social", "mindful"] as const;
export type QuestCategory = (typeof QUEST_CATEGORIES)[number];

export const QUEST_STATUSES = ["available", "active", "completed", "abandoned"] as const;
export type QuestStatus = (typeof QUEST_STATUSES)[number];

export interface QuestTemplate {
  id: string;
  title: string;
  description: string;
  category: QuestCategory;
  rarity: QuestRarity;
  xp: number;
  estimatedMinutes: number;
  safetyNote?: string;
  tags?: string[];
}

export interface QuestInstance extends QuestTemplate {
  instanceId: string;
  status: QuestStatus;
  offeredAt: string;
  acceptedAt?: string;
  completedAt?: string;
  abandonedAt?: string;
}

export interface Player {
  id: string;
  name: string;
  totalXp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  /** Local calendar date key (YYYY-MM-DD) of the most recent completion. */
  lastCompletionDate?: string;
  createdAt: string;
}

export const ACHIEVEMENT_METRICS = [
  "questsCompleted",
  "outdoorsCompleted",
  "creativeCompleted",
  "longestStreak",
  "rareOrBetterCompleted",
  "epicOrBetterCompleted",
] as const;
export type AchievementMetric = (typeof ACHIEVEMENT_METRICS)[number];

export type AchievementIcon =
  | "footprints"
  | "compass"
  | "map"
  | "trophy"
  | "trees"
  | "palette"
  | "flame"
  | "zap"
  | "sparkles"
  | "crown";

export interface AchievementDefinition {
  id: string;
  name: string;
  description: string;
  icon: AchievementIcon;
  target: number;
  metric: AchievementMetric;
}

export interface AchievementProgress {
  achievementId: string;
  current: number;
  unlockedAt?: string;
}

export interface Settings {
  /** User override. When false, the OS `prefers-reduced-motion` setting still applies. */
  reducedMotion: boolean;
}

/** The persisted shape. Everything here must be JSON-serialisable. */
export interface AppState {
  schemaVersion: number;
  onboarded: boolean;
  player: Player;
  availableQuests: QuestInstance[];
  activeQuest: QuestInstance | null;
  questHistory: QuestInstance[];
  achievements: AchievementProgress[];
  /** Template ids offered/finished recently, newest first. Used to avoid repeats. */
  recentQuestIds: string[];
  settings: Settings;
}

export interface CompletionResult {
  quest: QuestInstance;
  xpEarned: number;
  previousXp: number;
  newXp: number;
  previousLevel: number;
  newLevel: number;
  leveledUp: boolean;
  streak: number;
  unlockedAchievementIds: string[];
}
