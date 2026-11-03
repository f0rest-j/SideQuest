"use client";

import { Clock, Lock, Zap } from "lucide-react";
import { motion } from "motion/react";
import type { QuestInstance } from "@/domain/types";
import { copy } from "@/lib/copy";
import { buttonClasses } from "../ui/button";
import { CategoryTag, RARITY_STYLE, RarityBadge } from "../ui/quest-meta";

interface QuestCardProps {
  quest: QuestInstance;
  onAccept: (quest: QuestInstance) => void;
  /** Another quest is active: accepting is blocked (but still explained on press). */
  locked?: boolean;
  compact?: boolean;
  index?: number;
}

export function QuestStats({ quest }: { quest: QuestInstance }) {
  return (
    <dl className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
      <div className="flex items-center gap-1.5 text-muted">
        <dt className="sr-only">Estimated duration</dt>
        <Clock aria-hidden="true" className="size-4" />
        <dd className="tabular-nums">{copy.quest.minutes(quest.estimatedMinutes)}</dd>
      </div>
      <div className="flex items-center gap-1.5 font-bold text-accent">
        <dt className="sr-only">Reward</dt>
        <Zap aria-hidden="true" className="size-4" fill="currentColor" />
        <dd className="tabular-nums">{copy.quest.xp(quest.xp)}</dd>
      </div>
    </dl>
  );
}

export function QuestCard({ quest, onAccept, locked = false, compact = false, index = 0 }: QuestCardProps) {
  const style = RARITY_STYLE[quest.rarity];
  return (
    <motion.article
      layout="position"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.28, delay: index * 0.05, ease: "easeOut" }}
      aria-labelledby={`quest-${quest.instanceId}`}
      className={`card group relative overflow-hidden border ${style.border} ${style.glow} ${
        compact ? "p-4" : "p-5"
      } transition-colors hover:bg-surface-2 ${locked ? "opacity-80" : ""}`}
    >
      <span aria-hidden="true" className={`absolute inset-y-0 left-0 w-1 ${style.bar} opacity-80`} />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <RarityBadge rarity={quest.rarity} />
        <CategoryTag category={quest.category} />
      </div>

      <h3 id={`quest-${quest.instanceId}`} className={`font-display mt-3 font-bold ${compact ? "text-lg" : "text-xl"}`}>
        {quest.title}
      </h3>
      <p className={`mt-1.5 leading-relaxed text-ink/80 ${compact ? "text-sm" : "text-[0.95rem]"}`}>{quest.description}</p>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <QuestStats quest={quest} />
        <button
          type="button"
          onClick={() => onAccept(quest)}
          aria-disabled={locked || undefined}
          aria-describedby={locked ? "locked-hint" : undefined}
          className={buttonClasses(locked ? "secondary" : "primary", "ml-auto")}
        >
          {locked && <Lock aria-hidden="true" className="size-4" />}
          {copy.quest.accept}
          <span className="sr-only">: {quest.title}</span>
        </button>
      </div>
    </motion.article>
  );
}
