import { Compass, Crown, Flame, Footprints, Lock, Map, Palette, Sparkles, Trees, Trophy, Zap, type LucideIcon } from "lucide-react";
import type { AchievementIcon } from "@/domain/types";

const ICONS: Record<AchievementIcon, LucideIcon> = {
  footprints: Footprints,
  compass: Compass,
  map: Map,
  trophy: Trophy,
  trees: Trees,
  palette: Palette,
  flame: Flame,
  zap: Zap,
  sparkles: Sparkles,
  crown: Crown,
};

export function AchievementGlyph({ icon, unlocked }: { icon: AchievementIcon; unlocked: boolean }) {
  const Icon = ICONS[icon];
  return (
    <span
      aria-hidden="true"
      className={`relative inline-flex size-12 shrink-0 items-center justify-center rounded-2xl border ${
        unlocked
          ? "border-legendary/50 bg-gradient-to-br from-legendary/25 to-legendary/5 text-legendary shadow-[0_0_24px_-8px_rgb(255_173_66/0.7)]"
          : "border-line bg-surface-2 text-muted"
      }`}
    >
      <Icon className="size-6" />
      {!unlocked && (
        <span className="absolute -bottom-1 -right-1 inline-flex size-5 items-center justify-center rounded-full border border-line bg-bg">
          <Lock className="size-3" />
        </span>
      )}
    </span>
  );
}
