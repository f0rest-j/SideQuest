"use client";

import { Info, X } from "lucide-react";
import { useSideQuest } from "@/hooks/use-sidequest";
import { copy } from "@/lib/copy";

export function NoticeBanner() {
  const { notice, dismissNotice } = useSideQuest();
  if (!notice) return null;
  const warning = notice !== "reset-complete";

  return (
    <div
      role="status"
      className={`mb-4 flex items-start gap-3 rounded-2xl border p-3 pl-4 text-sm leading-relaxed ${
        warning ? "border-legendary/40 bg-legendary/10 text-ink" : "border-accent/40 bg-accent/10 text-ink"
      }`}
    >
      <Info aria-hidden="true" className={`mt-0.5 size-4 shrink-0 ${warning ? "text-legendary" : "text-accent"}`} />
      <p className="flex-1">{copy.notices[notice]}</p>
      <button
        type="button"
        onClick={dismissNotice}
        aria-label={copy.notices.dismiss}
        className="-my-2 -mr-1 inline-flex size-11 shrink-0 items-center justify-center rounded-xl text-muted hover:bg-surface-2 hover:text-ink"
      >
        <X aria-hidden="true" className="size-4" />
      </button>
    </div>
  );
}
