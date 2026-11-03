import { describe, expect, it } from "vitest";
import {
  abandonQuest,
  acceptQuest,
  completeOnboarding,
  completeQuest,
  createInitialState,
  ensureBoard,
  rerollBoard,
  sanitizeName,
} from "@/domain/transitions";
import { reducer, createUiState } from "@/state/reducer";
import { clockAt, onboardedState, withActive } from "./helpers";

describe("onboarding", () => {
  it("names the player and deals a board of three", () => {
    const state = completeOnboarding(createInitialState(), "  Robin  ", clockAt(2026, 11, 3));
    expect(state.onboarded).toBe(true);
    expect(state.player.name).toBe("Robin");
    expect(state.availableQuests).toHaveLength(3);
  });

  it("defaults an empty name to Adventurer", () => {
    expect(sanitizeName("   ")).toBe("Adventurer");
    expect(sanitizeName("x".repeat(40))).toHaveLength(24);
  });
});

describe("acceptQuest", () => {
  it("moves the quest from available to active", () => {
    const state = onboardedState();
    const target = state.availableQuests[1];
    const { state: next, error } = acceptQuest(state, target.instanceId, { now: "2026-11-03T13:00:00.000Z" });
    expect(error).toBeUndefined();
    expect(next.activeQuest).toMatchObject({ instanceId: target.instanceId, status: "active", acceptedAt: "2026-11-03T13:00:00.000Z" });
    expect(next.availableQuests).toHaveLength(2);
    expect(next.availableQuests.some((q) => q.instanceId === target.instanceId)).toBe(false);
  });

  it("refuses a second active quest", () => {
    const state = onboardedState();
    const first = acceptQuest(state, state.availableQuests[0].instanceId, { now: "2026-11-03T13:00:00.000Z" }).state;
    const second = acceptQuest(first, first.availableQuests[0].instanceId, { now: "2026-11-03T13:01:00.000Z" });
    expect(second.error).toBe("quest-already-active");
    expect(second.state).toBe(first);
  });

  it("reports unknown quests", () => {
    expect(acceptQuest(onboardedState(), "nope", { now: "x" }).error).toBe("quest-not-found");
  });
});

describe("completeQuest", () => {
  it("awards XP, records history, updates streak and refills the board", () => {
    const state = withActive(onboardedState(), "scenic-route");
    const active = state.activeQuest!;
    const { state: next, result } = completeQuest(state, active.instanceId, clockAt(2026, 11, 3, 9));

    expect(result).not.toBeNull();
    expect(result!.xpEarned).toBe(80);
    expect(next.player.totalXp).toBe(80);
    expect(next.player.currentStreak).toBe(1);
    expect(next.player.lastCompletionDate).toBe("2026-11-03");
    expect(next.activeQuest).toBeNull();
    expect(next.questHistory[0]).toMatchObject({ instanceId: active.instanceId, status: "completed" });
    expect(next.questHistory[0].completedAt).toBeDefined();
    expect(next.availableQuests).toHaveLength(3);
    expect(new Set(next.availableQuests.map((q) => q.id)).size).toBe(3);
    expect(next.availableQuests.some((q) => q.id === "scenic-route")).toBe(false);
  });

  it("never awards XP twice for repeated dispatch", () => {
    const state = withActive(onboardedState(), "scenic-route");
    const id = state.activeQuest!.instanceId;
    const once = completeQuest(state, id, clockAt(2026, 11, 3, 2));
    const twice = completeQuest(once.state, id, clockAt(2026, 11, 3, 3));
    expect(twice.result).toBeNull();
    expect(twice.state).toBe(once.state);
    expect(twice.state.player.totalXp).toBe(80);
    expect(twice.state.questHistory.filter((q) => q.status === "completed")).toHaveLength(1);
  });

  it("ignores a stale instance id", () => {
    const state = withActive(onboardedState(), "scenic-route");
    const { state: next, result } = completeQuest(state, "other", clockAt(2026, 11, 3));
    expect(result).toBeNull();
    expect(next).toBe(state);
  });

  it("detects level-ups, including multi-level jumps", () => {
    const base = withActive(onboardedState(), "new-horizon"); // 400 XP
    const almost = { ...base, player: { ...base.player, totalXp: 120 } };
    const { result } = completeQuest(almost, base.activeQuest!.instanceId, clockAt(2026, 11, 3));
    expect(result!.previousLevel).toBe(1);
    expect(result!.newLevel).toBe(3);
    expect(result!.leveledUp).toBe(true);
  });

  it("does not report a level-up when staying within a level", () => {
    const state = withActive(onboardedState(), "three-left-turns"); // 30 XP
    const { result } = completeQuest(state, state.activeQuest!.instanceId, clockAt(2026, 11, 3));
    expect(result!.leveledUp).toBe(false);
  });

  it("unlocks First Steps on the first completion only", () => {
    const state = withActive(onboardedState(), "three-left-turns");
    const first = completeQuest(state, state.activeQuest!.instanceId, clockAt(2026, 11, 3));
    expect(first.result!.unlockedAchievementIds).toContain("first-steps");

    const again = withActive(first.state, "fresh-air-reset");
    const second = completeQuest(again, again.activeQuest!.instanceId, clockAt(2026, 11, 3, 5));
    expect(second.result!.unlockedAchievementIds).not.toContain("first-steps");
    const progress = second.state.achievements.find((a) => a.achievementId === "first-steps");
    expect(progress!.unlockedAt).toBe(first.state.achievements.find((a) => a.achievementId === "first-steps")!.unlockedAt);
  });
});

describe("abandonQuest", () => {
  it("clears the active quest without any penalty", () => {
    const start = withActive(onboardedState(), "golden-hour");
    const state = { ...start, player: { ...start.player, totalXp: 500, currentStreak: 3, longestStreak: 4, lastCompletionDate: "2026-11-02" } };
    const id = state.activeQuest!.instanceId;
    const next = abandonQuest(state, id, clockAt(2026, 11, 3));

    expect(next.activeQuest).toBeNull();
    expect(next.player).toEqual(state.player);
    expect(next.questHistory[0]).toMatchObject({ instanceId: id, status: "abandoned" });
    expect(next.questHistory[0].abandonedAt).toBeDefined();
    expect(next.availableQuests).toHaveLength(3);
  });

  it("is a no-op without a matching active quest", () => {
    const state = onboardedState();
    expect(abandonQuest(state, "missing", clockAt(2026, 11, 3))).toBe(state);
  });
});

describe("rerollBoard", () => {
  it("replaces available quests without immediate duplicates", () => {
    const state = onboardedState();
    const next = rerollBoard(state, clockAt(2026, 11, 3, 77));
    expect(next.availableQuests).toHaveLength(3);
    const before = new Set(state.availableQuests.map((q) => q.id));
    expect(next.availableQuests.some((q) => before.has(q.id))).toBe(false);
  });

  it("preserves the active quest", () => {
    const state = withActive(onboardedState(), "urban-sketch");
    const next = rerollBoard(state, clockAt(2026, 11, 3, 78));
    expect(next.activeQuest).toBe(state.activeQuest);
    expect(next.availableQuests).toHaveLength(2);
    expect(next.availableQuests.some((q) => q.id === "urban-sketch")).toBe(false);
  });
});

describe("ensureBoard", () => {
  it("restores an empty board", () => {
    const state = { ...onboardedState(), availableQuests: [] };
    expect(ensureBoard(state, clockAt(2026, 11, 3, 3)).availableQuests).toHaveLength(3);
  });
});

describe("reducer", () => {
  it("double COMPLETE dispatch only celebrates and awards once", () => {
    const app = withActive(onboardedState(), "scenic-route");
    const id = app.activeQuest!.instanceId;
    let ui = { ...createUiState(), hydrated: true, app };
    ui = reducer(ui, { type: "COMPLETE", instanceId: id, clock: clockAt(2026, 11, 3, 1) });
    const afterFirst = ui;
    ui = reducer(ui, { type: "COMPLETE", instanceId: id, clock: clockAt(2026, 11, 3, 2) });
    expect(ui).toBe(afterFirst);
    expect(ui.app.player.totalXp).toBe(80);
    expect(ui.celebration?.xpEarned).toBe(80);
  });

  it("explains why a second quest cannot be accepted", () => {
    const app = withActive(onboardedState(), "scenic-route");
    const ui = reducer({ ...createUiState(), hydrated: true, app }, {
      type: "ACCEPT",
      instanceId: app.availableQuests[0].instanceId,
      clock: clockAt(2026, 11, 3),
    });
    expect(ui.notice).toBe("quest-locked");
    expect(ui.app).toBe(app);
  });

  it("RESET returns to a fresh, un-onboarded state", () => {
    const app = withActive(onboardedState(), "scenic-route");
    const ui = reducer({ ...createUiState(), hydrated: true, app }, { type: "RESET" });
    expect(ui.app.onboarded).toBe(false);
    expect(ui.app.player.totalXp).toBe(0);
    expect(ui.notice).toBe("reset-complete");
  });
});
