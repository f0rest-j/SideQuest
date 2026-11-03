"use client";

import { ACHIEVEMENT_LIBRARY } from "@/data/achievement-library";
import { useSideQuest } from "@/hooks/use-sidequest";
import { copy } from "@/lib/copy";
import { AchievementGlyph } from "./achievement-glyph";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" });
}

export function AchievementsScreen() {
  const { app } = useSideQuest();
  const progress = new Map(app.achievements.map((a) => [a.achievementId, a]));
  const rows = ACHIEVEMENT_LIBRARY.map((definition) => ({ definition, progress: progress.get(definition.id) }));
  const unlocked = rows.filter((row) => row.progress?.unlockedAt);
  const locked = rows.filter((row) => !row.progress?.unlockedAt);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-bold">{copy.achievements.heading}</h1>
        <p className="mt-1 text-muted">{copy.achievements.summary(unlocked.length, rows.length)}</p>
      </header>

      {[
        { title: copy.achievements.unlocked, items: unlocked, id: "unlocked" },
        { title: copy.achievements.locked, items: locked, id: "locked" },
      ].map(
        (group) =>
          group.items.length > 0 && (
            <section key={group.id} aria-labelledby={`ach-${group.id}`}>
              <h2 id={`ach-${group.id}`} className="eyebrow mb-3">
                {group.title} · {group.items.length}
              </h2>
              <ul className="grid gap-3 sm:grid-cols-2">
                {group.items.map(({ definition, progress: p }) => {
                  const isUnlocked = Boolean(p?.unlockedAt);
                  const current = Math.min(p?.current ?? 0, definition.target);
                  const percent = (current / definition.target) * 100;
                  return (
                    <li
                      key={definition.id}
                      className={`card flex gap-3 p-4 ${isUnlocked ? "border-legendary/30" : ""}`}
                    >
                      <AchievementGlyph icon={definition.icon} unlocked={isUnlocked} />
                      <div className="min-w-0 flex-1">
                        <h3 className={`font-display font-bold ${isUnlocked ? "" : "text-ink/85"}`}>
                          {definition.name}
                          <span className="sr-only">, {isUnlocked ? copy.achievements.unlocked : copy.achievements.locked}</span>
                        </h3>
                        <p className="text-sm text-muted">{definition.description}</p>
                        {isUnlocked && p?.unlockedAt ? (
                          <p className="mt-2 text-xs font-semibold text-legendary">
                            {copy.achievements.unlockedOn(formatDate(p.unlockedAt))}
                          </p>
                        ) : (
                          definition.target > 1 && (
                            <div className="mt-2.5 flex items-center gap-2">
                              <div
                                className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2"
                                role="progressbar"
                                aria-label={`${definition.name} progress`}
                                aria-valuemin={0}
                                aria-valuemax={definition.target}
                                aria-valuenow={current}
                              >
                                <div className="h-full rounded-full bg-muted" style={{ width: `${percent}%` }} />
                              </div>
                              <span className="text-xs tabular-nums text-muted">
                                {copy.achievements.progress(current, definition.target)}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          ),
      )}
    </div>
  );
}
