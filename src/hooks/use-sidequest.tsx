"use client";

import { MotionConfig, useReducedMotion } from "motion/react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Clock } from "@/domain/transitions";
import { toLocalDateKey } from "@/lib/dates";
import { randomSeed } from "@/lib/random";
import { createLocalStorageRepository, type StateRepository } from "@/lib/storage";
import { createUiState, reducer, type NoticeKind, type UiState } from "@/state/reducer";

export function makeClock(date = new Date()): Clock {
  return { now: date.toISOString(), today: toLocalDateKey(date), seed: randomSeed() };
}

interface SideQuestContextValue extends UiState {
  reduceMotion: boolean;
  announcement: string;
  onboard: (name: string) => void;
  accept: (instanceId: string) => void;
  complete: (instanceId: string) => void;
  abandon: (instanceId: string) => void;
  reroll: () => void;
  rename: (name: string) => void;
  setReducedMotion: (value: boolean) => void;
  reset: () => void;
  dismissCelebration: () => void;
  dismissNotice: () => void;
  devGrantXp: (xp: number) => void;
  announce: (message: string) => void;
}

const SideQuestContext = createContext<SideQuestContextValue | null>(null);

const LOAD_NOTICE: Record<string, NoticeKind | null> = {
  ok: null,
  empty: null,
  recovered: "recovered",
  corrupt: "corrupt",
  unavailable: "storage-unavailable",
};

export function SideQuestProvider({
  children,
  repository,
}: {
  children: ReactNode;
  repository?: StateRepository;
}) {
  const [state, dispatch] = useReducer(reducer, undefined, createUiState);
  const [announcement, setAnnouncement] = useState("");
  const repoRef = useRef<StateRepository | null>(repository ?? null);
  const storageWorks = useRef(true);
  const osReducedMotion = useReducedMotion() ?? false;

  // Load once on the client. Server render always shows the loading shell, so
  // there is no hydration mismatch.
  useEffect(() => {
    repoRef.current ??= createLocalStorageRepository();
    const result = repoRef.current.load();
    storageWorks.current = result.status !== "unavailable";
    const app = "state" in result ? result.state : createUiState().app;
    dispatch({ type: "HYDRATE", app, notice: LOAD_NOTICE[result.status], clock: makeClock() });
  }, []);

  // Persist after every change once hydrated.
  useEffect(() => {
    if (!state.hydrated || !repoRef.current || !storageWorks.current) return;
    if (!repoRef.current.save(state.app)) {
      storageWorks.current = false;
      dispatch({ type: "SET_NOTICE", notice: "save-failed" });
    }
  }, [state.hydrated, state.app]);

  // Keep "today" fresh if the app sits in a background tab across midnight.
  useEffect(() => {
    function refresh() {
      if (document.visibilityState === "visible") dispatch({ type: "SET_TODAY", today: toLocalDateKey(new Date()) });
    }
    document.addEventListener("visibilitychange", refresh);
    return () => document.removeEventListener("visibilitychange", refresh);
  }, []);

  const reduceMotion = state.app.settings.reducedMotion || osReducedMotion;

  useEffect(() => {
    document.documentElement.dataset.reducedMotion = reduceMotion ? "true" : "false";
  }, [reduceMotion]);

  const announce = useCallback((message: string) => {
    // Clear first so repeating the same message is still announced.
    setAnnouncement("");
    window.setTimeout(() => setAnnouncement(message), 50);
  }, []);

  const actions = useMemo(
    () => ({
      onboard: (name: string) => dispatch({ type: "ONBOARD", name, clock: makeClock() }),
      accept: (instanceId: string) => dispatch({ type: "ACCEPT", instanceId, clock: makeClock() }),
      complete: (instanceId: string) => dispatch({ type: "COMPLETE", instanceId, clock: makeClock() }),
      abandon: (instanceId: string) => dispatch({ type: "ABANDON", instanceId, clock: makeClock() }),
      reroll: () => dispatch({ type: "REROLL", clock: makeClock() }),
      rename: (name: string) => dispatch({ type: "RENAME", name }),
      setReducedMotion: (value: boolean) => dispatch({ type: "SET_REDUCED_MOTION", value }),
      reset: () => {
        repoRef.current?.clear();
        dispatch({ type: "RESET" });
      },
      dismissCelebration: () => dispatch({ type: "DISMISS_CELEBRATION" }),
      dismissNotice: () => dispatch({ type: "SET_NOTICE", notice: null }),
      devGrantXp: (xp: number) => dispatch({ type: "DEV_GRANT_XP", xp }),
    }),
    [],
  );

  const value = useMemo<SideQuestContextValue>(
    () => ({
      ...state,
      ...actions,
      reduceMotion,
      announcement,
      announce,
    }),
    [state, actions, reduceMotion, announcement, announce],
  );

  return (
    <SideQuestContext.Provider value={value}>
      <MotionConfig reducedMotion={state.app.settings.reducedMotion ? "always" : "user"}>{children}</MotionConfig>
    </SideQuestContext.Provider>
  );
}

export function useSideQuest(): SideQuestContextValue {
  const context = useContext(SideQuestContext);
  if (!context) throw new Error("useSideQuest must be used inside <SideQuestProvider>");
  return context;
}
