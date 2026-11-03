"use client";

import { ArrowRight, Flame, Trophy } from "lucide-react";
import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { useEffect } from "react";
import { findAchievement } from "@/data/achievement-library";
import { levelProgress, titleForLevel } from "@/domain/levels";
import type { CompletionResult } from "@/domain/types";
import { useSideQuest } from "@/hooks/use-sidequest";
import { copy } from "@/lib/copy";
import { AchievementGlyph } from "../achievements/achievement-glyph";
import { Button } from "../ui/button";
import { Dialog } from "../ui/dialog";
import { LevelBar } from "../ui/level-bar";

function XpCounter({ value, instant }: { value: number; instant: boolean }) {
  const count = useMotionValue(instant ? value : 0);
  const text = useTransform(count, (latest) => `+${Math.round(latest).toLocaleString("en")}`);

  useEffect(() => {
    if (instant) {
      count.set(value);
      return;
    }
    const controls = animate(count, value, { duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.15 });
    return () => controls.stop();
  }, [count, value, instant]);

  return <motion.span>{text}</motion.span>;
}

/** Decorative burst. Hidden when motion is reduced. */
function Burst() {
  const rays = Array.from({ length: 12 }, (_, i) => i);
  return (
    <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-16 -translate-x-1/2">
      {rays.map((i) => (
        <motion.span
          key={i}
          className="absolute left-0 top-0 h-1.5 w-1.5 rounded-full bg-accent"
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{
            x: Math.cos((i / rays.length) * Math.PI * 2) * 110,
            y: Math.sin((i / rays.length) * Math.PI * 2) * 70,
            opacity: 0,
            scale: 0.4,
          }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
        />
      ))}
    </div>
  );
}

function CelebrationBody({ result, onContinue }: { result: CompletionResult; onContinue: () => void }) {
  const { reduceMotion } = useSideQuest();
  const previousPercent = levelProgress(result.previousXp).percent;
  const previousTitle = titleForLevel(result.previousLevel);
  const newTitle = titleForLevel(result.newLevel);

  return (
    <div className="relative mt-1 text-center">
      {!reduceMotion && <Burst />}
      <p className="eyebrow">{copy.celebration.title}</p>
      <p className="font-display mt-2 text-xl font-bold leading-snug">{result.quest.title}</p>

      <motion.p
        className="font-display mt-4 text-6xl font-bold tabular-nums text-accent drop-shadow-[0_0_24px_rgb(184_255_90/0.45)]"
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 380, damping: 18 }}
        aria-hidden="true"
      >
        <XpCounter value={result.xpEarned} instant={reduceMotion} />
        <span className="ml-2 text-2xl">XP</span>
      </motion.p>
      <p className="sr-only">{copy.celebration.earned(result.xpEarned)}</p>

      <div className="mt-6 text-left">
        <LevelBar
          totalXp={result.newXp}
          size="lg"
          animateFromZero={result.leveledUp}
          fromPercent={result.leveledUp ? undefined : previousPercent}
        />
      </div>

      {result.leveledUp && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.3 }}
          className="mt-5 rounded-2xl border border-accent/40 bg-accent/10 p-4"
        >
          <p className="font-display text-lg font-bold text-accent">{copy.celebration.levelUp(result.newLevel)}</p>
          {newTitle !== previousTitle && <p className="mt-1 text-sm text-ink/85">{copy.celebration.newTitle(newTitle)}</p>}
        </motion.div>
      )}

      <p className="mt-4 inline-flex items-center gap-1.5 text-sm text-muted">
        <Flame aria-hidden="true" className="size-4 text-legendary" />
        {copy.celebration.streak(result.streak)}
      </p>

      {result.unlockedAchievementIds.length > 0 && (
        <div className="mt-5 text-left">
          <p className="eyebrow mb-2 flex items-center gap-1.5">
            <Trophy aria-hidden="true" className="size-3.5" />
            {copy.celebration.unlocked}
          </p>
          <ul className="space-y-2">
            {result.unlockedAchievementIds.map((id, i) => {
              const achievement = findAchievement(id);
              if (!achievement) return null;
              return (
                <motion.li
                  key={id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                  className="flex items-center gap-3 rounded-xl border border-legendary/40 bg-legendary/10 p-3"
                >
                  <AchievementGlyph icon={achievement.icon} unlocked />
                  <div>
                    <p className="font-display font-bold">{achievement.name}</p>
                    <p className="text-sm text-muted">{achievement.description}</p>
                  </div>
                </motion.li>
              );
            })}
          </ul>
        </div>
      )}

      <Button className="mt-6 w-full text-base" onClick={onContinue}>
        {copy.celebration.continue}
        <ArrowRight aria-hidden="true" className="size-5" />
      </Button>
    </div>
  );
}

export function CompletionCelebration() {
  const { celebration, dismissCelebration } = useSideQuest();
  // AnimatePresence keeps the last rendered body alive during the exit animation.
  return (
    <Dialog open={celebration !== null} onClose={dismissCelebration} title={copy.celebration.title} hideTitle>
      {celebration && <CelebrationBody result={celebration} onContinue={dismissCelebration} />}
    </Dialog>
  );
}
