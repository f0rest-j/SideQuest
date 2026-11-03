import { calendarDaysBetween } from "@/lib/dates";

export interface StreakState {
  currentStreak: number;
  longestStreak: number;
  lastCompletionDate?: string;
}

/**
 * Apply a completion on local calendar day `todayKey` (YYYY-MM-DD).
 * - no previous completion → 1
 * - same day → unchanged
 * - previous day → +1
 * - earlier → reset to 1
 */
export function applyCompletionToStreak(streak: StreakState, todayKey: string): StreakState {
  const { lastCompletionDate } = streak;
  let currentStreak: number;

  if (!lastCompletionDate) {
    currentStreak = 1;
  } else {
    const gap = calendarDaysBetween(lastCompletionDate, todayKey);
    if (gap === 0) currentStreak = Math.max(1, streak.currentStreak);
    else if (gap === 1) currentStreak = streak.currentStreak + 1;
    // gap > 1 (missed a day) or gap < 0 (clock moved backwards): start fresh.
    else currentStreak = 1;
  }

  return {
    currentStreak,
    longestStreak: Math.max(streak.longestStreak, currentStreak),
    lastCompletionDate: todayKey,
  };
}

/**
 * The streak worth showing right now. A streak stays alive through "today"
 * until the end of the following day, after that it displays as 0.
 */
export function activeStreak(streak: StreakState, todayKey: string): number {
  if (!streak.lastCompletionDate) return 0;
  const gap = calendarDaysBetween(streak.lastCompletionDate, todayKey);
  return gap === 0 || gap === 1 ? streak.currentStreak : 0;
}
