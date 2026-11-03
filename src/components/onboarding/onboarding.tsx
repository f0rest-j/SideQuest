"use client";

import { ArrowRight, Check } from "lucide-react";
import { motion } from "motion/react";
import { useId, useState, type FormEvent } from "react";
import { DEFAULT_PLAYER_NAME, MAX_NAME_LENGTH } from "@/domain/transitions";
import { useSideQuest } from "@/hooks/use-sidequest";
import { copy } from "@/lib/copy";
import { Wordmark } from "../layout/wordmark";
import { Button } from "../ui/button";
import { NoticeBanner } from "../ui/notice-banner";

export function Onboarding() {
  const { onboard } = useSideQuest();
  const [name, setName] = useState(DEFAULT_PLAYER_NAME);
  const nameId = useId();
  const hintId = useId();

  function submit(event: FormEvent) {
    event.preventDefault();
    onboard(name);
  }

  return (
    <main className="relative z-10 mx-auto flex min-h-dvh w-full max-w-[520px] flex-col px-5 pb-8 pt-6">
      <Wordmark />
      <div className="mt-6">
        <NoticeBanner />
      </div>

      <motion.div
        className="flex flex-1 flex-col justify-center py-8"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <p className="eyebrow text-accent">{copy.onboarding.eyebrow}</p>
        <h1 className="font-display mt-3 text-[2.6rem] font-bold leading-[1.02] sm:text-5xl">{copy.onboarding.title}</h1>
        <p className="mt-4 text-lg leading-relaxed text-ink/80">{copy.onboarding.body}</p>

        <ol className="mt-7 space-y-3">
          {copy.onboarding.points.map((point, i) => (
            <li key={point} className="flex items-center gap-3">
              <span className="font-display inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-accent/40 bg-accent/10 text-sm font-bold text-accent">
                {i + 1}
              </span>
              <span className="text-ink/90">{point}</span>
            </li>
          ))}
        </ol>

        <form onSubmit={submit} className="card mt-8 p-5">
          <label htmlFor={nameId} className="block font-semibold">
            {copy.onboarding.nameLabel}
          </label>
          <input
            id={nameId}
            value={name}
            maxLength={MAX_NAME_LENGTH}
            autoComplete="nickname"
            aria-describedby={hintId}
            onChange={(e) => setName(e.target.value)}
            onFocus={(e) => e.currentTarget.select()}
            className="mt-2 min-h-12 w-full rounded-xl border border-line bg-bg px-4 text-lg text-ink focus-visible:border-accent"
          />
          <p id={hintId} className="mt-2 text-sm text-muted">
            {copy.onboarding.nameHint}
          </p>
          <Button type="submit" className="mt-5 w-full text-base">
            {copy.onboarding.begin}
            <ArrowRight aria-hidden="true" className="size-5" />
          </Button>
        </form>

        <p className="mt-6 flex items-center justify-center gap-1.5 text-xs text-muted">
          <Check aria-hidden="true" className="size-3.5" />
          {copy.onboarding.privacy}
        </p>
      </motion.div>
    </main>
  );
}
