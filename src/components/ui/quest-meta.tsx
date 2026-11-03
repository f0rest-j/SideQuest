import { Circle, Compass, Crown, Diamond, Gem, Palette, Sparkles, Trees, Users, Wind, type LucideIcon } from "lucide-react";
import type { QuestCategory, QuestRarity } from "@/domain/types";
import { CATEGORY_LABEL, RARITY_LABEL } from "@/lib/copy";

const RARITY_ICON: Record<QuestRarity, LucideIcon> = {
  common: Circle,
  uncommon: Diamond,
  rare: Gem,
  epic: Sparkles,
  legendary: Crown,
};

/** Text + icon + colour, so rarity never relies on colour alone. */
export const RARITY_STYLE: Record<QuestRarity, { text: string; border: string; glow: string; bar: string }> = {
  common: { text: "text-common", border: "border-common/30", glow: "", bar: "bg-common" },
  uncommon: { text: "text-uncommon", border: "border-uncommon/35", glow: "", bar: "bg-uncommon" },
  rare: { text: "text-rare", border: "border-rare/40", glow: "shadow-[0_0_32px_-12px_rgb(93_169_255/0.6)]", bar: "bg-rare" },
  epic: { text: "text-epic", border: "border-epic/45", glow: "shadow-[0_0_36px_-10px_rgb(185_130_255/0.65)]", bar: "bg-epic" },
  legendary: {
    text: "text-legendary",
    border: "border-legendary/50",
    glow: "shadow-[0_0_40px_-10px_rgb(255_173_66/0.7)]",
    bar: "bg-legendary",
  },
};

export const CATEGORY_ICON: Record<QuestCategory, LucideIcon> = {
  exploration: Compass,
  outdoors: Trees,
  creative: Palette,
  social: Users,
  mindful: Wind,
};

export function RarityBadge({ rarity }: { rarity: QuestRarity }) {
  const Icon = RARITY_ICON[rarity];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border bg-bg/40 px-2.5 py-1 text-xs font-bold uppercase tracking-wider ${RARITY_STYLE[rarity].text} ${RARITY_STYLE[rarity].border}`}
    >
      <Icon aria-hidden="true" className="size-3.5" strokeWidth={2.5} />
      {RARITY_LABEL[rarity]}
    </span>
  );
}

export function CategoryTag({ category }: { category: QuestCategory }) {
  const Icon = CATEGORY_ICON[category];
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted">
      <Icon aria-hidden="true" className="size-4" />
      {CATEGORY_LABEL[category]}
    </span>
  );
}
