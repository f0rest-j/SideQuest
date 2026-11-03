"use client";

import { RefreshCw } from "lucide-react";
import { AnimatePresence } from "motion/react";
import type { QuestInstance } from "@/domain/types";
import { useSideQuest } from "@/hooks/use-sidequest";
import { copy } from "@/lib/copy";
import { Button } from "../ui/button";
import { LevelBar } from "../ui/level-bar";
import { NoticeBanner } from "../ui/notice-banner";
import { ActiveQuest } from "./active-quest";
import { QuestCard } from "./quest-card";

export function QuestBoard() {
  const { app, accept, complete, abandon, reroll, announce } = useSideQuest();
  const { player, activeQuest, availableQuests } = app;
  const locked = activeQuest !== null;

  function handleAccept(quest: QuestInstance) {
    accept(quest.instanceId);
    if (!locked) announce(copy.quest.announceAccepted(quest.title));
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-bold leading-tight">{copy.board.greeting(player.name)}</h1>
        <p className="mt-1 text-muted">{copy.board.subtitle}</p>
        <div className="card mt-4 p-4">
          <LevelBar totalXp={player.totalXp} />
        </div>
      </header>

      <NoticeBanner />

      {activeQuest && (
        <ActiveQuest
          key={activeQuest.instanceId}
          quest={activeQuest}
          onComplete={complete}
          onAbandon={(id) => {
            abandon(id);
            announce(copy.quest.announceAbandoned);
          }}
        />
      )}

      <section aria-labelledby="board-heading">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 id="board-heading" className="font-display text-lg font-bold">
            {locked ? copy.board.availableWhileActive : copy.board.available}
          </h2>
          <Button
            variant="ghost"
            className="-mr-2 text-sm"
            onClick={() => {
              reroll();
              announce(copy.quest.announceRerolled);
            }}
          >
            <RefreshCw aria-hidden="true" className="size-4" />
            {copy.board.reroll}
          </Button>
        </div>

        {locked && (
          <p id="locked-hint" className="mb-3 text-sm text-muted">
            {copy.board.lockedHint}
          </p>
        )}

        {availableQuests.length === 0 ? (
          <div className="card flex flex-col items-center gap-3 p-6 text-center">
            <p className="text-muted">{copy.board.empty}</p>
            <Button onClick={reroll}>
              <RefreshCw aria-hidden="true" className="size-4" />
              {copy.board.reroll}
            </Button>
          </div>
        ) : (
          <ul className="space-y-3">
            <AnimatePresence initial={false} mode="popLayout">
              {availableQuests.map((quest, index) => (
                <li key={quest.instanceId}>
                  <QuestCard quest={quest} onAccept={handleAccept} locked={locked} compact={locked} index={index} />
                </li>
              ))}
            </AnimatePresence>
          </ul>
        )}

        {!locked && <p className="mt-4 text-center text-sm text-muted">{copy.board.rerollHint}</p>}
      </section>
    </div>
  );
}
