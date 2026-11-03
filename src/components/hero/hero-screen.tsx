"use client";

import { Check, Flag, Flame, Gem, Trophy, Zap, type LucideIcon } from "lucide-react";
import { levelProgress, titleForLevel } from "@/domain/levels";
import { computeStats } from "@/domain/stats";
import { activeStreak } from "@/domain/streaks";
import { useSideQuest } from "@/hooks/use-sidequest";
import { copy } from "@/lib/copy";
import { LevelBar } from "../ui/level-bar";
import { CATEGORY_ICON, RarityBadge } from "../ui/quest-meta";

const RECENT_LIMIT = 8;

function Stat({ icon: Icon, label, value, accent }: { icon: LucideIcon; label: string; value: string; accent?: string }) {
  return (
    <div className="card p-4">
      <dt className="flex items-center gap-1.5 text-xs font-semibold text-muted">
        <Icon aria-hidden="true" className={`size-4 ${accent ?? ""}`} />
        {label}
      </dt>
      <dd className="font-display mt-1.5 text-2xl font-bold tabular-nums">{value}</dd>
    </div>
  );
}

/** Abstract emblem: a level-tinted ring with the player's initial. */
function Emblem({ name, level }: { name: string; level: number }) {
  const initial = name.trim().charAt(0).toUpperCase() || "A";
  return (
    <div aria-hidden="true" className="relative size-20 shrink-0">
      <div className="absolute inset-[12px] rotate-45 rounded-[1.1rem] bg-gradient-to-br from-accent to-accent-dark shadow-[0_0_32px_-6px_rgb(184_255_90/0.6)]" />
      <div className="absolute inset-[15px] rotate-45 rounded-[0.95rem] bg-surface" />
      <span className="font-display absolute inset-0 flex items-center justify-center text-3xl font-bold">{initial}</span>
      <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-accent px-2 py-0.5 text-xs font-bold text-bg">
        {level}
      </span>
    </div>
  );
}

function formatDay(iso?: string): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en", { month: "short", day: "numeric" });
}

export function HeroScreen() {
  const { app, today } = useSideQuest();
  const { player, questHistory } = app;
  const progress = levelProgress(player.totalXp);
  const stats = computeStats(questHistory);
  const streakNow = activeStreak(player, today);
  const recent = questHistory.slice(0, RECENT_LIMIT);

  return (
    <div className="space-y-6">
      <h1 className="sr-only">{copy.hero.heading}</h1>
      <section className="card relative overflow-hidden p-5" aria-label="Profile">
        <div aria-hidden="true" className="pointer-events-none absolute -left-10 -top-20 size-56 rounded-full bg-accent/10 blur-3xl" />
        <div className="relative flex items-center gap-5">
          <Emblem name={player.name} level={progress.level} />
          <div className="min-w-0 flex-1">
            <p className="eyebrow text-accent">{titleForLevel(progress.level)}</p>
            <p className="font-display truncate text-2xl font-bold">{player.name}</p>
            <p className="text-sm text-muted">{copy.hero.level(progress.level)}</p>
          </div>
        </div>
        <div className="relative mt-5">
          <LevelBar totalXp={player.totalXp} />
          <p className="mt-2 text-xs text-muted">{copy.hero.toNext(progress.xpToNextLevel, progress.level + 1)}</p>
        </div>
      </section>

      <dl className="grid grid-cols-2 gap-3">
        <Stat icon={Zap} label={copy.hero.totalXp} value={player.totalXp.toLocaleString("en")} accent="text-accent" />
        <Stat icon={Check} label={copy.hero.completed} value={String(stats.questsCompleted)} accent="text-uncommon" />
        <Stat icon={Flame} label={copy.hero.currentStreak} value={copy.hero.days(streakNow)} accent="text-legendary" />
        <Stat icon={Trophy} label={copy.hero.longestStreak} value={copy.hero.days(player.longestStreak)} accent="text-legendary" />
        <div className="col-span-2">
          <Stat icon={Gem} label={copy.hero.rareOrBetter} value={String(stats.rareOrBetterCompleted)} accent="text-rare" />
        </div>
      </dl>

      <section aria-labelledby="recent-heading">
        <h2 id="recent-heading" className="font-display mb-3 text-lg font-bold">
          {copy.hero.recent}
        </h2>
        {recent.length === 0 ? (
          <p className="card p-5 text-center text-muted">{copy.hero.noHistory}</p>
        ) : (
          <ul className="card divide-y divide-line">
            {recent.map((quest) => {
              const Icon = CATEGORY_ICON[quest.category];
              const done = quest.status === "completed";
              return (
                <li key={quest.instanceId} className="flex items-center gap-3 p-4">
                  <Icon aria-hidden="true" className={`size-5 shrink-0 ${done ? "text-ink" : "text-muted"}`} />
                  <div className="min-w-0 flex-1">
                    <p className={`truncate font-semibold ${done ? "" : "text-muted"}`}>{quest.title}</p>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-muted">
                      {done ? (
                        <span className="inline-flex items-center gap-1">
                          <Check aria-hidden="true" className="size-3" />
                          {copy.hero.completedOn} {formatDay(quest.completedAt)}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1">
                          <Flag aria-hidden="true" className="size-3" />
                          {copy.hero.abandonedOn} {formatDay(quest.abandonedAt)}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <RarityBadge rarity={quest.rarity} />
                    {done && <span className="text-sm font-bold tabular-nums text-accent">+{quest.xp} XP</span>}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
