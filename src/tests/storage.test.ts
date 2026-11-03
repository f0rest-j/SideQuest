import { describe, expect, it, vi } from "vitest";
import { completeQuest } from "@/domain/transitions";
import { STORAGE_KEY, createLocalStorageRepository, decodeState, migrate } from "@/lib/storage";
import { clockAt, onboardedState, withActive } from "./helpers";

function progressedState() {
  const state = withActive(onboardedState(), "golden-hour");
  return completeQuest(state, state.activeQuest!.instanceId, clockAt(2026, 11, 3)).state;
}

describe("decodeState", () => {
  it("round-trips a valid state", () => {
    const state = progressedState();
    const result = decodeState(JSON.stringify(state));
    expect(result).toEqual({ status: "ok", state });
  });

  it("reports empty storage", () => {
    expect(decodeState(null)).toEqual({ status: "empty" });
  });

  it("treats malformed JSON as corrupt instead of throwing", () => {
    expect(decodeState("{not json")).toEqual({ status: "corrupt" });
    expect(decodeState("42")).toEqual({ status: "corrupt" });
    expect(decodeState("null")).toEqual({ status: "corrupt" });
    expect(decodeState(JSON.stringify({ player: { name: 5 } }))).toEqual({ status: "corrupt" });
  });

  it("drops invalid quests but keeps valid progress", () => {
    const state = progressedState();
    const tampered = {
      ...state,
      availableQuests: [state.availableQuests[0], { id: "x", rarity: "mythic" }, "garbage"],
      activeQuest: { title: 123 },
    };
    const result = decodeState(JSON.stringify(tampered));
    expect(result.status).toBe("recovered");
    if (result.status !== "recovered") return;
    expect(result.state.player.totalXp).toBe(state.player.totalXp);
    expect(result.state.questHistory).toEqual(state.questHistory);
    expect(result.state.availableQuests).toEqual([state.availableQuests[0]]);
    expect(result.state.activeQuest).toBeNull();
  });

  it("re-derives a corrupted level from XP", () => {
    const state = progressedState();
    const result = decodeState(JSON.stringify({ ...state, player: { ...state.player, level: 99 } }));
    expect(result.status).toBe("recovered");
    if (result.status === "recovered") expect(result.state.player.level).toBe(state.player.level);
  });

  it("fills in achievements that are missing from an older save", () => {
    const state = progressedState();
    const result = decodeState(JSON.stringify({ ...state, achievements: state.achievements.slice(0, 2) }));
    expect(result.status).toBe("ok");
    if (result.status === "ok") expect(result.state.achievements).toHaveLength(state.achievements.length);
  });
});

describe("migrate", () => {
  it("upgrades a save without schemaVersion", () => {
    const { schemaVersion: _omit, onboarded: _o, ...legacy } = progressedState();
    void _omit;
    void _o;
    const migrated = migrate(legacy) as Record<string, unknown>;
    expect(migrated.schemaVersion).toBe(1);
    expect(migrated.onboarded).toBe(true);
    expect(decodeState(JSON.stringify(legacy)).status).toBe("ok");
  });
});

describe("local storage repository", () => {
  it("saves and loads under the namespaced key", () => {
    const repo = createLocalStorageRepository();
    const state = progressedState();
    expect(repo.save(state)).toBe(true);
    expect(window.localStorage.getItem(STORAGE_KEY)).not.toBeNull();
    expect(repo.load()).toEqual({ status: "ok", state });
    expect(repo.clear()).toBe(true);
    expect(repo.load()).toEqual({ status: "empty" });
  });

  it("keeps a copy of corrupt data aside", () => {
    window.localStorage.setItem(STORAGE_KEY, "{broken");
    expect(createLocalStorageRepository().load()).toEqual({ status: "corrupt" });
    expect(window.localStorage.getItem(`${STORAGE_KEY}:corrupt`)).toBe("{broken");
  });

  it("reports unavailable storage without throwing", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("SecurityError");
    });
    const repo = createLocalStorageRepository();
    expect(repo.load()).toEqual({ status: "unavailable" });
    expect(repo.save(progressedState())).toBe(false);
  });
});
