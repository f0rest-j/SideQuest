/**
 * User-facing copy, kept in one place so it is easy to review and localise.
 */
import type { QuestCategory, QuestRarity } from "@/domain/types";
import type { NoticeKind } from "@/state/reducer";

export const APP_VERSION = "0.1";

export const copy = {
  appName: "SideQuest",
  tagline: "Your life is the open world.",
  version: `SideQuest v${APP_VERSION}`,

  nav: { quests: "Quests", hero: "Hero", achievements: "Achievements", label: "Main" },

  onboarding: {
    eyebrow: "New game",
    title: "Your life is the open world.",
    body: "Small real-world quests. Real XP. Accept one, put the phone away, and go do it.",
    points: [
      "Pick a quest that fits today",
      "Do it out there, not in here",
      "Come back, claim XP, level up",
    ],
    nameLabel: "What should we call you?",
    nameHint: "You can change this later in Settings.",
    begin: "Begin adventure",
    privacy: "No account. Progress stays on this device.",
  },

  board: {
    greeting: (name: string) => `Hey, ${name}.`,
    subtitle: "Your next adventure is waiting.",
    available: "Quest board",
    availableWhileActive: "Up next",
    lockedHint: "Finish or abandon your active quest to pick another.",
    reroll: "Reroll quests",
    rerollHint: "No penalty. Pick something that fits today.",
    empty: "The board is empty. Reroll to draw fresh quests.",
  },

  quest: {
    accept: "Accept quest",
    complete: "Complete quest",
    abandon: "Abandon quest",
    activeNow: "Active now",
    activeLabel: "Active quest",
    acceptedAt: (time: string) => `Accepted ${time}`,
    minutes: (min: number) => (min >= 60 ? `${Math.floor(min / 60)} h${min % 60 ? ` ${min % 60} min` : ""}` : `${min} min`),
    xp: (xp: number) => `${xp.toLocaleString("en")} XP`,
    safety: "Safety note",
    confirmCompleteTitle: "Quest complete?",
    confirmCompleteBody: "Did you complete this quest in the real world?",
    confirmCompleteYes: "Yes, claim XP",
    confirmCompleteNo: "Not yet",
    confirmAbandonTitle: "Abandon this quest?",
    confirmAbandonBody: "No penalty. Your XP and streak stay exactly as they are.",
    confirmAbandonYes: "Abandon quest",
    confirmAbandonNo: "Keep it",
    announceAccepted: (title: string) => `Quest accepted: ${title}.`,
    announceAbandoned: "Quest abandoned. New quests are on the board.",
    announceRerolled: "New quests are on the board.",
  },

  celebration: {
    title: "Quest complete",
    earned: (xp: number) => `You earned ${xp.toLocaleString("en")} XP.`,
    levelUp: (level: number) => `You reached Level ${level}.`,
    newTitle: (title: string) => `New title: ${title}`,
    streak: (days: number) => (days === 1 ? "1-day streak" : `${days}-day streak`),
    unlocked: "Achievement unlocked",
    continue: "Continue",
  },

  hero: {
    heading: "Hero",
    level: (level: number) => `Level ${level}`,
    totalXp: "Total XP",
    completed: "Quests completed",
    currentStreak: "Current streak",
    longestStreak: "Longest streak",
    rareOrBetter: "Rare or better",
    days: (n: number) => (n === 1 ? "1 day" : `${n} days`),
    recent: "Recent quests",
    noHistory: "No completed quests yet. Your story starts with the first one.",
    toNext: (xp: number, level: number) => `${xp.toLocaleString("en")} XP to Level ${level}`,
    completedOn: "Completed",
    abandonedOn: "Abandoned",
    settings: "Settings",
  },

  achievements: {
    heading: "Achievements",
    summary: (unlocked: number, total: number) => `${unlocked} of ${total} unlocked`,
    unlocked: "Unlocked",
    locked: "Locked",
    unlockedOn: (date: string) => `Unlocked ${date}`,
    progress: (current: number, target: number) => `${current} / ${target}`,
  },

  settings: {
    heading: "Settings",
    open: "Open settings",
    close: "Close settings",
    name: "Player name",
    saveName: "Save name",
    nameSaved: "Name saved.",
    reducedMotion: "Reduce motion",
    reducedMotionHint: "Tone down animations. Your device's reduced-motion setting is always respected.",
    dangerZone: "Reset",
    reset: "Reset all progress",
    resetHint: "Removes your hero, XP, streaks, achievements, and quest history from this device.",
    resetConfirmTitle: "Reset all progress?",
    resetConfirmBody:
      "This permanently removes all SideQuest progress stored in this browser. There's no undo.",
    resetConfirmYes: "Yes, reset everything",
    resetConfirmNo: "Cancel",
    dev: "Developer",
    devGrant: "Grant 1,000 XP",
  },

  levelBar: {
    label: (level: number) => `Level ${level}`,
    progress: (into: number, span: number) => `${into.toLocaleString("en")} / ${span.toLocaleString("en")} XP`,
    aria: (level: number, into: number, span: number) =>
      `Level ${level} progress: ${into.toLocaleString("en")} of ${span.toLocaleString("en")} XP`,
  },

  notices: {
    recovered: "Some saved data couldn't be read, so we repaired it. Your progress is intact.",
    corrupt: "Your saved progress couldn't be read, so SideQuest started fresh.",
    "storage-unavailable": "This browser isn't letting SideQuest save. You can play, but progress won't survive a reload.",
    "save-failed": "Progress couldn't be saved in this browser. You can keep playing for now.",
    "reset-complete": "Progress reset. A fresh start awaits.",
    "quest-locked": "You already have an active quest. Finish or abandon it first.",
    dismiss: "Dismiss",
  } satisfies Record<NoticeKind | "dismiss", string>,

  loading: "Loading your adventure",
} as const;

export const RARITY_LABEL: Record<QuestRarity, string> = {
  common: "Common",
  uncommon: "Uncommon",
  rare: "Rare",
  epic: "Epic",
  legendary: "Legendary",
};

export const CATEGORY_LABEL: Record<QuestCategory, string> = {
  exploration: "Exploration",
  outdoors: "Outdoors",
  creative: "Creative",
  social: "Social",
  mindful: "Mindful",
};
