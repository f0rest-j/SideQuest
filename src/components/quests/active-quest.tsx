"use client";

import { Check, Flag, ShieldAlert } from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import type { QuestInstance } from "@/domain/types";
import { copy } from "@/lib/copy";
import { Button } from "../ui/button";
import { Dialog } from "../ui/dialog";
import { CategoryTag, RARITY_STYLE, RarityBadge } from "../ui/quest-meta";
import { QuestStats } from "./quest-card";

interface ActiveQuestProps {
  quest: QuestInstance;
  onComplete: (instanceId: string) => void;
  onAbandon: (instanceId: string) => void;
}

function formatAccepted(iso?: string): string {
  if (!iso) return copy.quest.activeNow;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return copy.quest.activeNow;
  const time = date.toLocaleTimeString("en", { hour: "numeric", minute: "2-digit" });
  const sameDay = date.toDateString() === new Date().toDateString();
  return copy.quest.acceptedAt(sameDay ? `at ${time}` : `${date.toLocaleDateString("en", { month: "short", day: "numeric" })}, ${time}`);
}

export function ActiveQuest({ quest, onComplete, onAbandon }: ActiveQuestProps) {
  const [confirm, setConfirm] = useState<"complete" | "abandon" | null>(null);
  // Guards against double submission before the state update lands.
  const submitted = useRef(false);
  const style = RARITY_STYLE[quest.rarity];

  function finish(kind: "complete" | "abandon") {
    if (submitted.current) return;
    submitted.current = true;
    setConfirm(null);
    if (kind === "complete") onComplete(quest.instanceId);
    else onAbandon(quest.instanceId);
  }

  return (
    <motion.section
      aria-labelledby="active-quest-title"
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 28 }}
      className={`card relative overflow-hidden border-2 border-accent/50 p-5 shadow-[0_0_48px_-16px_rgb(184_255_90/0.5)]`}
    >
      <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-accent/10 blur-3xl" />
      <div className="relative">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-accent">
            <span className="relative flex size-2.5" aria-hidden="true">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-60" />
              <span className="relative inline-flex size-2.5 rounded-full bg-accent" />
            </span>
            {copy.quest.activeLabel}
          </p>
          <p className="text-xs text-muted">{formatAccepted(quest.acceptedAt)}</p>
        </div>

        <h2 id="active-quest-title" className="font-display mt-3 text-2xl font-bold leading-tight">
          {quest.title}
        </h2>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <RarityBadge rarity={quest.rarity} />
          <CategoryTag category={quest.category} />
        </div>
        <p className="mt-3 leading-relaxed text-ink/85">{quest.description}</p>

        <div className="mt-4">
          <QuestStats quest={quest} />
        </div>

        {quest.safetyNote && (
          <div className={`mt-4 flex gap-2.5 rounded-xl border bg-bg/50 p-3 text-sm ${style.border}`}>
            <ShieldAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-legendary" />
            <p>
              <span className="font-semibold">{copy.quest.safety}: </span>
              <span className="text-ink/80">{quest.safetyNote}</span>
            </p>
          </div>
        )}

        <div className="mt-5 flex flex-col gap-2 sm:flex-row-reverse">
          <Button className="w-full text-base sm:flex-1" onClick={() => setConfirm("complete")}>
            <Check aria-hidden="true" className="size-5" strokeWidth={3} />
            {copy.quest.complete}
          </Button>
          <Button variant="ghost" className="w-full sm:w-auto" onClick={() => setConfirm("abandon")}>
            <Flag aria-hidden="true" className="size-4" />
            {copy.quest.abandon}
          </Button>
        </div>
      </div>

      <Dialog
        open={confirm === "complete"}
        onClose={() => setConfirm(null)}
        title={copy.quest.confirmCompleteTitle}
        description={copy.quest.confirmCompleteBody}
      >
        <p className="font-display mt-4 text-lg font-bold">{quest.title}</p>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row-reverse">
          <Button className="w-full sm:flex-1" onClick={() => finish("complete")}>
            {copy.quest.confirmCompleteYes}
          </Button>
          <Button variant="secondary" className="w-full sm:w-auto" onClick={() => setConfirm(null)}>
            {copy.quest.confirmCompleteNo}
          </Button>
        </div>
      </Dialog>

      <Dialog
        open={confirm === "abandon"}
        onClose={() => setConfirm(null)}
        title={copy.quest.confirmAbandonTitle}
        description={copy.quest.confirmAbandonBody}
      >
        <div className="mt-5 flex flex-col gap-2 sm:flex-row-reverse">
          <Button variant="secondary" className="w-full sm:flex-1" onClick={() => setConfirm(null)}>
            {copy.quest.confirmAbandonNo}
          </Button>
          <Button variant="danger" className="w-full sm:w-auto" onClick={() => finish("abandon")}>
            {copy.quest.confirmAbandonYes}
          </Button>
        </div>
      </Dialog>
    </motion.section>
  );
}
