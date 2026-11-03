import type { AchievementDefinition } from "@/domain/types";

export const ACHIEVEMENT_LIBRARY: readonly AchievementDefinition[] = [
  {
    id: "first-steps",
    name: "First Steps",
    description: "Complete your first quest.",
    icon: "footprints",
    target: 1,
    metric: "questsCompleted",
  },
  {
    id: "adventurer",
    name: "Adventurer",
    description: "Complete 10 quests.",
    icon: "compass",
    target: 10,
    metric: "questsCompleted",
  },
  {
    id: "explorer",
    name: "Explorer",
    description: "Complete 25 quests.",
    icon: "map",
    target: 25,
    metric: "questsCompleted",
  },
  {
    id: "sidequest-enjoyer",
    name: "SideQuest Enjoyer",
    description: "Complete 100 quests.",
    icon: "trophy",
    target: 100,
    metric: "questsCompleted",
  },
  {
    id: "touch-grass",
    name: "Touch Grass",
    description: "Complete 10 outdoors quests.",
    icon: "trees",
    target: 10,
    metric: "outdoorsCompleted",
  },
  {
    id: "creative-spark",
    name: "Creative Spark",
    description: "Complete 10 creative quests.",
    icon: "palette",
    target: 10,
    metric: "creativeCompleted",
  },
  {
    id: "on-a-roll",
    name: "On a Roll",
    description: "Reach a 3-day streak.",
    icon: "flame",
    target: 3,
    metric: "longestStreak",
  },
  {
    id: "unbroken",
    name: "Unbroken",
    description: "Reach a 7-day streak.",
    icon: "zap",
    target: 7,
    metric: "longestStreak",
  },
  {
    id: "main-character-energy",
    name: "Main Character Energy",
    description: "Complete your first Rare-or-better quest.",
    icon: "sparkles",
    target: 1,
    metric: "rareOrBetterCompleted",
  },
  {
    id: "epic-tale",
    name: "Epic Tale",
    description: "Complete your first Epic quest.",
    icon: "crown",
    target: 1,
    metric: "epicOrBetterCompleted",
  },
];

export function findAchievement(id: string): AchievementDefinition | undefined {
  return ACHIEVEMENT_LIBRARY.find((achievement) => achievement.id === id);
}
