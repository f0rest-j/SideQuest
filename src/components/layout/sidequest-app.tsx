"use client";

import { Settings, Swords, Trophy, User, type LucideIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { levelForXp } from "@/domain/levels";
import { SideQuestProvider, useSideQuest } from "@/hooks/use-sidequest";
import { copy } from "@/lib/copy";
import type { StateRepository } from "@/lib/storage";
import { AchievementsScreen } from "../achievements/achievements-screen";
import { HeroScreen } from "../hero/hero-screen";
import { Onboarding } from "../onboarding/onboarding";
import { CompletionCelebration } from "../quests/completion-celebration";
import { QuestBoard } from "../quests/quest-board";
import { SettingsDialog } from "../settings/settings-dialog";
import { Button } from "../ui/button";
import { Wordmark } from "./wordmark";

type Tab = "quests" | "hero" | "achievements";

const TABS: { id: Tab; label: string; icon: LucideIcon }[] = [
  { id: "quests", label: copy.nav.quests, icon: Swords },
  { id: "hero", label: copy.nav.hero, icon: User },
  { id: "achievements", label: copy.nav.achievements, icon: Trophy },
];

function BottomNav({ tab, onChange }: { tab: Tab; onChange: (tab: Tab) => void }) {
  return (
    <nav
      aria-label={copy.nav.label}
      className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-bg/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-md"
    >
      <ul className="mx-auto grid max-w-[520px] grid-cols-3">
        {TABS.map(({ id, label, icon: Icon }) => {
          const current = tab === id;
          return (
            <li key={id}>
              <button
                type="button"
                onClick={() => onChange(id)}
                aria-current={current ? "page" : undefined}
                className={`relative flex min-h-16 w-full flex-col items-center justify-center gap-1 text-xs font-semibold transition-colors ${
                  current ? "text-accent" : "text-muted hover:text-ink"
                }`}
              >
                {current && (
                  <motion.span
                    layoutId="nav-indicator"
                    aria-hidden="true"
                    className="absolute inset-x-6 top-0 h-0.5 rounded-full bg-accent shadow-[0_0_10px_rgb(184_255_90/0.8)]"
                  />
                )}
                <Icon aria-hidden="true" className="size-5" strokeWidth={current ? 2.5 : 2} />
                {label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function LoadingShell() {
  return (
    <div className="relative z-10 mx-auto flex min-h-dvh max-w-[520px] items-center justify-center" role="status">
      <span className="sr-only">{copy.loading}</span>
      <span aria-hidden="true" className="size-8 animate-spin rounded-full border-2 border-line border-t-accent" />
    </div>
  );
}

function AppContent() {
  const { hydrated, app, announcement } = useSideQuest();
  const [tab, setTab] = useState<Tab>("quests");
  const [settingsOpen, setSettingsOpen] = useState(false);

  if (!hydrated) return <LoadingShell />;

  const liveRegion = (
    <div aria-live="polite" aria-atomic="true" className="sr-only">
      {announcement}
    </div>
  );

  if (!app.onboarded) {
    return (
      <>
        <Onboarding />
        {liveRegion}
      </>
    );
  }

  const level = levelForXp(app.player.totalXp);

  return (
    <>
      <div className="relative z-10 mx-auto min-h-dvh w-full max-w-[520px] px-4 pb-28 sm:px-5">
        <header className="sticky top-0 z-20 -mx-4 flex items-center justify-between gap-3 bg-bg/85 px-4 py-2 backdrop-blur-md sm:-mx-5 sm:px-5">
          <Wordmark />
          <div className="flex items-center gap-1">
            <span className="rounded-full border border-accent/40 bg-accent/10 px-2.5 py-1 text-xs font-bold text-accent">
              <span aria-hidden="true">Lv </span>
              <span className="sr-only">Level </span>
              {level}
            </span>
            <Button variant="ghost" aria-label={copy.settings.open} onClick={() => setSettingsOpen(true)}>
              <Settings aria-hidden="true" className="size-5" />
            </Button>
          </div>
        </header>

        <main className="pt-4">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.16 }}
            >
              {tab === "quests" && <QuestBoard />}
              {tab === "hero" && <HeroScreen />}
              {tab === "achievements" && <AchievementsScreen />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <BottomNav
        tab={tab}
        onChange={(next) => {
          setTab(next);
          window.scrollTo({ top: 0 });
        }}
      />
      <CompletionCelebration />
      <SettingsDialog open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      {liveRegion}
    </>
  );
}

export function SideQuestApp({ repository }: { repository?: StateRepository }) {
  return (
    <SideQuestProvider repository={repository}>
      <AppContent />
    </SideQuestProvider>
  );
}
