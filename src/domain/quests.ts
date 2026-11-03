import { pickWeighted, rngId, type Rng } from "@/lib/random";
import type { QuestCategory, QuestInstance, QuestRarity, QuestTemplate } from "./types";

export const BOARD_SIZE = 3;
/** How many recently seen template ids we try not to repeat. */
export const RECENT_MEMORY = 15;

/** Probability weights for the standard board. Legendary is deliberately off. */
export const RARITY_WEIGHTS: Record<QuestRarity, number> = {
  common: 45,
  uncommon: 35,
  rare: 17,
  epic: 3,
  legendary: 0,
};

export interface BoardOptions {
  library: readonly QuestTemplate[];
  rng: Rng;
  now: string;
  /** Number of quests to add. */
  count: number;
  /** Template ids that must never appear (already on board, active quest). */
  exclude?: Iterable<string>;
  /** Template ids to avoid when possible (recently offered/completed/abandoned). */
  avoid?: Iterable<string>;
  /** Categories already represented, used to prefer variety. */
  presentCategories?: Iterable<QuestCategory>;
  rarityWeights?: Record<QuestRarity, number>;
}

export function instantiateQuest(template: QuestTemplate, now: string, rng: Rng): QuestInstance {
  return {
    ...template,
    tags: template.tags ? [...template.tags] : undefined,
    instanceId: rngId(rng, "q"),
    status: "available",
    offeredAt: now,
  };
}

/**
 * Pick `count` unique quests. Selection order of preference:
 *  1. weighted rarity roll among rarities that still have candidates
 *  2. within the rarity, prefer categories not yet on the board
 *  3. if "avoid" leaves nothing, fall back to recently seen quests
 * Hard exclusions (board duplicates, active quest) are never relaxed.
 */
export function drawQuests(options: BoardOptions): QuestInstance[] {
  const { library, rng, now, count } = options;
  const weights = options.rarityWeights ?? RARITY_WEIGHTS;
  const excluded = new Set(options.exclude ?? []);
  const avoided = new Set(options.avoid ?? []);
  const categories = new Set(options.presentCategories ?? []);
  const picked: QuestInstance[] = [];

  const eligible = library.filter((quest) => weights[quest.rarity] > 0);

  for (let i = 0; i < count; i++) {
    const notExcluded = eligible.filter((quest) => !excluded.has(quest.id));
    if (notExcluded.length === 0) break;
    const fresh = notExcluded.filter((quest) => !avoided.has(quest.id));
    const pool = fresh.length > 0 ? fresh : notExcluded;

    const rarities = [...new Set(pool.map((quest) => quest.rarity))];
    const rarity = pickWeighted(rarities, (r) => weights[r], rng) ?? rarities[0];
    const ofRarity = pool.filter((quest) => quest.rarity === rarity);
    const varied = ofRarity.filter((quest) => !categories.has(quest.category));
    const candidates = varied.length > 0 ? varied : ofRarity;

    const template = candidates[Math.floor(rng() * candidates.length)] ?? candidates[0];
    excluded.add(template.id);
    categories.add(template.category);
    picked.push(instantiateQuest(template, now, rng));
  }

  return picked;
}

/** Newest first, de-duplicated, capped. */
export function rememberQuestIds(recent: readonly string[], ids: readonly string[]): string[] {
  const merged = [...ids, ...recent];
  return [...new Set(merged)].slice(0, RECENT_MEMORY);
}
