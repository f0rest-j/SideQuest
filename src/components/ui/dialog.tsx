"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useId, useRef, type ReactNode, type RefObject } from "react";
import { createPortal } from "react-dom";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Open dialogs, innermost last. Only the topmost one handles keyboard events. */
const dialogStack: string[] = [];

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  /** When false, Escape and backdrop clicks do nothing (e.g. celebrations). */
  dismissible?: boolean;
  role?: "dialog" | "alertdialog";
  initialFocusRef?: RefObject<HTMLElement | null>;
  /** Visually hide the title (it stays the accessible name). */
  hideTitle?: boolean;
  className?: string;
}

/**
 * Accessible modal: labelled, traps focus, closes on Escape, and restores
 * focus to the trigger when it closes.
 */
export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  dismissible = true,
  role = "dialog",
  initialFocusRef,
  hideTitle = false,
  className = "",
}: DialogProps) {
  const titleId = useId();
  const descriptionId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    dialogStack.push(titleId);
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;
    const target = initialFocusRef?.current ?? panel?.querySelector<HTMLElement>(FOCUSABLE) ?? panel;
    target?.focus();

    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (dialogStack[dialogStack.length - 1] !== titleId) return;
      if (event.key === "Escape") {
        if (dismissible) onCloseRef.current();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;
      const focusable = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      const index = dialogStack.lastIndexOf(titleId);
      if (index !== -1) dialogStack.splice(index, 1);
      document.removeEventListener("keydown", onKeyDown);
      if (dialogStack.length === 0) document.body.style.overflow = "";
      if (previouslyFocused?.isConnected) previouslyFocused.focus();
    };
  }, [open, dismissible, initialFocusRef, titleId]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-3 sm:items-center sm:p-6">
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-[2px]"
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={dismissible ? () => onCloseRef.current() : undefined}
          />
          <motion.div
            ref={panelRef}
            role={role}
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={description ? descriptionId : undefined}
            tabIndex={-1}
            className={`card relative max-h-[calc(100dvh-1.5rem)] w-full max-w-[480px] overflow-y-auto p-5 shadow-2xl shadow-black/60 sm:p-6 ${className}`}
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 420, damping: 34 }}
          >
            <h2 id={titleId} className={hideTitle ? "sr-only" : "font-display text-xl font-bold"}>
              {title}
            </h2>
            {description && (
              <p id={descriptionId} className="mt-2 text-[0.95rem] leading-relaxed text-muted">
                {description}
              </p>
            )}
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
