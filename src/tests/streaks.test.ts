import { describe, expect, it } from "vitest";
import { activeStreak, applyCompletionToStreak } from "@/domain/streaks";
import { calendarDaysBetween, isDateKey, toLocalDateKey } from "@/lib/dates";

describe("dates", () => {
  it("builds local date keys from local time, not UTC", () => {
    expect(toLocalDateKey(new Date(2026, 0, 5, 0, 30))).toBe("2026-01-05");
    expect(toLocalDateKey(new Date(2026, 0, 5, 23, 59))).toBe("2026-01-05");
  });

  it("counts calendar days across month, year and DST changes", () => {
    expect(calendarDaysBetween("2026-01-31", "2026-02-01")).toBe(1);
    expect(calendarDaysBetween("2025-12-31", "2026-01-01")).toBe(1);
    expect(calendarDaysBetween("2026-03-28", "2026-03-30")).toBe(2);
    expect(calendarDaysBetween("2026-10-24", "2026-10-26")).toBe(2);
    expect(calendarDaysBetween("2026-05-02", "2026-05-01")).toBe(-1);
  });

  it("validates date keys", () => {
    expect(isDateKey("2026-02-28")).toBe(true);
    expect(isDateKey("2026-02-30")).toBe(false);
    expect(isDateKey("2026-2-3")).toBe(false);
    expect(isDateKey(20260203)).toBe(false);
  });
});

describe("applyCompletionToStreak", () => {
  const base = { currentStreak: 0, longestStreak: 0 };

  it("starts at 1 with no previous completion", () => {
    expect(applyCompletionToStreak(base, "2026-11-03")).toEqual({
      currentStreak: 1,
      longestStreak: 1,
      lastCompletionDate: "2026-11-03",
    });
  });

  it("does not increase for a second completion on the same day", () => {
    const s = applyCompletionToStreak({ currentStreak: 4, longestStreak: 6, lastCompletionDate: "2026-11-03" }, "2026-11-03");
    expect(s.currentStreak).toBe(4);
    expect(s.longestStreak).toBe(6);
  });

  it("increases by 1 on the next day and updates longest", () => {
    const s = applyCompletionToStreak({ currentStreak: 6, longestStreak: 6, lastCompletionDate: "2026-11-02" }, "2026-11-03");
    expect(s.currentStreak).toBe(7);
    expect(s.longestStreak).toBe(7);
  });

  it("resets to 1 after a missed day but keeps longest", () => {
    const s = applyCompletionToStreak({ currentStreak: 5, longestStreak: 9, lastCompletionDate: "2026-10-31" }, "2026-11-03");
    expect(s.currentStreak).toBe(1);
    expect(s.longestStreak).toBe(9);
  });

  it("treats a backwards clock as a fresh start", () => {
    const s = applyCompletionToStreak({ currentStreak: 3, longestStreak: 3, lastCompletionDate: "2026-11-05" }, "2026-11-03");
    expect(s.currentStreak).toBe(1);
  });
});

describe("activeStreak", () => {
  it("stays alive through the following day, then shows 0", () => {
    const streak = { currentStreak: 3, longestStreak: 3, lastCompletionDate: "2026-11-02" };
    expect(activeStreak(streak, "2026-11-02")).toBe(3);
    expect(activeStreak(streak, "2026-11-03")).toBe(3);
    expect(activeStreak(streak, "2026-11-04")).toBe(0);
    expect(activeStreak({ currentStreak: 0, longestStreak: 0 }, "2026-11-04")).toBe(0);
  });
});
