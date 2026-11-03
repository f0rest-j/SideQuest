"use client";

import { RotateCcw, X } from "lucide-react";
import { useId, useState, type FormEvent } from "react";
import { MAX_NAME_LENGTH } from "@/domain/transitions";
import { useSideQuest } from "@/hooks/use-sidequest";
import { copy } from "@/lib/copy";
import { Button } from "../ui/button";
import { Dialog } from "../ui/dialog";

function SettingsBody({ onClose }: { onClose: () => void }) {
  const { app, rename, setReducedMotion, reset, devGrantXp, announce } = useSideQuest();
  const [name, setName] = useState(app.player.name);
  const [saved, setSaved] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const nameId = useId();
  const motionId = useId();
  const motionHintId = useId();

  function submitName(event: FormEvent) {
    event.preventDefault();
    rename(name);
    setSaved(true);
    announce(copy.settings.nameSaved);
  }

  return (
    <div className="mt-5 space-y-6">
      <form onSubmit={submitName} className="space-y-2">
        <label htmlFor={nameId} className="block text-sm font-semibold">
          {copy.settings.name}
        </label>
        <div className="flex gap-2">
          <input
            id={nameId}
            value={name}
            maxLength={MAX_NAME_LENGTH}
            autoComplete="nickname"
            onChange={(e) => {
              setName(e.target.value);
              setSaved(false);
            }}
            className="min-h-11 min-w-0 flex-1 rounded-xl border border-line bg-bg px-3 text-ink placeholder:text-muted focus-visible:border-accent"
          />
          <Button type="submit" variant="secondary">
            {copy.settings.saveName}
          </Button>
        </div>
        <p className="min-h-5 text-sm text-accent" aria-live="polite">
          {saved ? copy.settings.nameSaved : ""}
        </p>
      </form>

      <div className="flex items-start justify-between gap-4">
        <div>
          <label htmlFor={motionId} className="text-sm font-semibold">
            {copy.settings.reducedMotion}
          </label>
          <p id={motionHintId} className="mt-1 text-sm text-muted">
            {copy.settings.reducedMotionHint}
          </p>
        </div>
        <button
          id={motionId}
          type="button"
          role="switch"
          aria-checked={app.settings.reducedMotion}
          aria-describedby={motionHintId}
          onClick={() => setReducedMotion(!app.settings.reducedMotion)}
          className="inline-flex min-h-11 min-w-14 shrink-0 items-center justify-center"
        >
          <span
            aria-hidden="true"
            className={`relative inline-flex h-7 w-12 items-center rounded-full border transition-colors ${
              app.settings.reducedMotion ? "border-accent bg-accent" : "border-line bg-surface-2"
            }`}
          >
            <span
              className={`inline-block size-5 rounded-full transition-transform ${
                app.settings.reducedMotion ? "translate-x-6 bg-bg" : "translate-x-1 bg-muted"
              }`}
            />
          </span>
        </button>
      </div>

      <section aria-labelledby="reset-heading" className="rounded-2xl border border-danger/30 p-4">
        <h3 id="reset-heading" className="font-semibold">
          {copy.settings.dangerZone}
        </h3>
        <p className="mt-1 text-sm text-muted">{copy.settings.resetHint}</p>
        <Button variant="danger" className="mt-3 w-full" onClick={() => setConfirmReset(true)}>
          <RotateCcw aria-hidden="true" className="size-4" />
          {copy.settings.reset}
        </Button>
      </section>

      {process.env.NODE_ENV === "development" && (
        <section aria-label={copy.settings.dev} className="rounded-2xl border border-dashed border-line p-4">
          <p className="eyebrow mb-2">{copy.settings.dev}</p>
          <Button variant="secondary" className="w-full" onClick={() => devGrantXp(1000)}>
            {copy.settings.devGrant}
          </Button>
        </section>
      )}

      <p className="text-center text-xs text-muted">{copy.version}</p>

      <Dialog
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        role="alertdialog"
        title={copy.settings.resetConfirmTitle}
        description={copy.settings.resetConfirmBody}
      >
        <div className="mt-5 flex flex-col gap-2 sm:flex-row-reverse">
          <Button variant="secondary" className="w-full sm:flex-1" onClick={() => setConfirmReset(false)}>
            {copy.settings.resetConfirmNo}
          </Button>
          <Button
            variant="danger"
            className="w-full sm:w-auto"
            onClick={() => {
              setConfirmReset(false);
              onClose();
              reset();
            }}
          >
            {copy.settings.resetConfirmYes}
          </Button>
        </div>
      </Dialog>
    </div>
  );
}

export function SettingsDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onClose={onClose} title={copy.settings.heading}>
      <Button
        variant="ghost"
        onClick={onClose}
        aria-label={copy.settings.close}
        className="absolute right-3 top-3"
      >
        <X aria-hidden="true" className="size-5" />
      </Button>
      {open && <SettingsBody onClose={onClose} />}
    </Dialog>
  );
}
