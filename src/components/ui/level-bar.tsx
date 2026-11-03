"use client";

import { motion } from "motion/react";
import { levelProgress } from "@/domain/levels";
import { copy } from "@/lib/copy";

interface LevelBarProps {
  totalXp: number;
  size?: "sm" | "lg";
  /** Animate from zero on mount (used in the celebration). */
  animateFromZero?: boolean;
  /** Start the fill here on mount instead of 0, e.g. the pre-completion value. */
  fromPercent?: number;
}

export function LevelBar({ totalXp, size = "sm", animateFromZero = false, fromPercent }: LevelBarProps) {
  const progress = levelProgress(totalXp);
  const height = size === "lg" ? "h-3.5" : "h-2.5";
  const initialWidth = fromPercent !== undefined ? `${fromPercent}%` : animateFromZero ? "0%" : false;

  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
        <span className="font-display font-bold text-ink">{copy.levelBar.label(progress.level)}</span>
        <span className="tabular-nums text-muted">{copy.levelBar.progress(progress.xpIntoLevel, progress.levelSpan)}</span>
      </div>
      <div
        role="progressbar"
        aria-label={copy.levelBar.aria(progress.level, progress.xpIntoLevel, progress.levelSpan)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress.percent)}
        className={`relative ${height} overflow-hidden rounded-full bg-surface-2 ring-1 ring-line`}
      >
        {/* Keyed by level: a level-up restarts the fill instead of sliding backwards. */}
        <motion.div
          key={progress.level}
          className="relative h-full overflow-hidden rounded-full bg-gradient-to-r from-accent-dark to-accent shadow-[0_0_12px_rgb(184_255_90/0.55)]"
          initial={initialWidth === false ? false : { width: initialWidth }}
          animate={{ width: `${progress.percent}%` }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="absolute inset-y-0 left-0 w-1/3 animate-sheen bg-gradient-to-r from-transparent via-white/35 to-transparent" />
        </motion.div>
      </div>
    </div>
  );
}
