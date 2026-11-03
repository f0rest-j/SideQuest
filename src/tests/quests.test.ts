import { describe, expect, it } from "vitest";
import { QUEST_LIBRARY } from "@/data/quest-library";
import { BOARD_SIZE, RARITY_WEIGHTS, drawQuests, rememberQuestIds } from "@/domain/quests";
import { QUEST_CATEGORIES } from "@/domain/types";
import { createRng } from "@/lib/random";

const NOW = "2026-11-03T12:00:00.000Z";

describe("quest library", () => {
  it("has at least 35 unique quests across every category", () => {
    expect(QUEST_LIBRARY.length).toBeGreaterThanOrEqual(35);
    expect(new Set(QUEST_LIBRARY.map((q) => q.id)).size).toBe(QUEST_LIBRARY.length);
    for (const category of QUEST_CATEGORIES) {
      expect(QUEST_LIBRARY.some((q) => q.category === category)).toBe(true);
    }
  });

  it("keeps XP inside each rarity band", () => {
    const bands = { common: [25, 50], uncommon: [60, 100], rare: [125, 225], epic: [300, 500], legendary: [750, 1000] };
    for (const quest of QUEST_LIBRARY) {
      const [min, max] = bands[quest.rarity];
      expect(quest.xp, quest.id).toBeGreaterThanOrEqual(min);
      expect(quest.xp, quest.id).toBeLessThanOrEqual(max);
    }
  });
});

describe("drawQuests", () => {
  it("returns three unique templates with unique instance ids", () => {
    for (let seed = 0; seed < 200; seed++) {
      const board = drawQuests({ library: QUEST_LIBRARY, rng: createRng(seed), now: NOW, count: BOARD_SIZE });
      expect(board).toHaveLength(3);
      expect(new Set(board.map((q) => q.id)).size).toBe(3);
      expect(new Set(board.map((q) => q.instanceId)).size).toBe(3);
      expect(board.every((q) => q.status === "available" && q.offeredAt === NOW)).toBe(true);
    }
  });

  it("is deterministic for a given seed", () => {
    const a = drawQuests({ library: QUEST_LIBRARY, rng: createRng(42), now: NOW, count: 3 });
    const b = drawQuests({ library: QUEST_LIBRARY, rng: createRng(42), now: NOW, count: 3 });
    expect(a).toEqual(b);
  });

  it("never offers legendary quests on the standard board", () => {
    expect(RARITY_WEIGHTS.legendary).toBe(0);
    for (let seed = 0; seed < 300; seed++) {
      const board = drawQuests({ library: QUEST_LIBRARY, rng: createRng(seed), now: NOW, count: 3 });
      expect(board.some((q) => q.rarity === "legendary")).toBe(false);
    }
  });

  it("prefers varied categories", () => {
    let varied = 0;
    for (let seed = 0; seed < 100; seed++) {
      const board = drawQuests({ library: QUEST_LIBRARY, rng: createRng(seed), now: NOW, count: 3 });
      if (new Set(board.map((q) => q.category)).size === 3) varied++;
    }
    expect(varied).toBeGreaterThan(90);
  });

  it("never returns excluded templates and avoids recent ones when possible", () => {
    const exclude = QUEST_LIBRARY.slice(0, 5).map((q) => q.id);
    const avoid = QUEST_LIBRARY.slice(5, 20).map((q) => q.id);
    for (let seed = 0; seed < 100; seed++) {
      const board = drawQuests({ library: QUEST_LIBRARY, rng: createRng(seed), now: NOW, count: 3, exclude, avoid });
      for (const quest of board) {
        expect(exclude).not.toContain(quest.id);
        expect(avoid).not.toContain(quest.id);
      }
    }
  });

  it("falls back to recently seen quests rather than returning an empty board", () => {
    const avoid = QUEST_LIBRARY.map((q) => q.id);
    const board = drawQuests({ library: QUEST_LIBRARY, rng: createRng(7), now: NOW, count: 3, avoid });
    expect(board).toHaveLength(3);
  });

  it("returns fewer quests only when the library is exhausted", () => {
    const tiny = QUEST_LIBRARY.filter((q) => q.rarity === "common").slice(0, 2);
    expect(drawQuests({ library: tiny, rng: createRng(1), now: NOW, count: 3 })).toHaveLength(2);
  });
});

describe("rememberQuestIds", () => {
  it("keeps newest first, de-duplicated and capped", () => {
    expect(rememberQuestIds(["a", "b"], ["c", "a"])).toEqual(["c", "a", "b"]);
    const many = Array.from({ length: 40 }, (_, i) => `q${i}`);
    expect(rememberQuestIds([], many)).toHaveLength(15);
  });
});
