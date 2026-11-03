import {
  abandonQuest,
  acceptQuest,
  completeOnboarding,
  completeQuest,
  createInitialState,
  ensureBoard,
  grantXp,
  renamePlayer,
  rerollBoard,
  setReducedMotion,
  type Clock,
} from "@/domain/transitions";
import type { AppState, CompletionResult } from "@/domain/types";

export type NoticeKind = "recovered" | "corrupt" | "storage-unavailable" | "save-failed" | "reset-complete" | "quest-locked";

export interface UiState {
  hydrated: boolean;
  app: AppState;
  /** Transient: the result to celebrate. Not persisted. */
  celebration: CompletionResult | null;
  notice: NoticeKind | null;
  /** Local date key of the most recent clock reading; empty until hydrated. */
  today: string;
}

export type Action =
  | { type: "HYDRATE"; app: AppState; notice: NoticeKind | null; clock: Clock }
  | { type: "ONBOARD"; name: string; clock: Clock }
  | { type: "ACCEPT"; instanceId: string; clock: Clock }
  | { type: "COMPLETE"; instanceId: string; clock: Clock }
  | { type: "ABANDON"; instanceId: string; clock: Clock }
  | { type: "REROLL"; clock: Clock }
  | { type: "RENAME"; name: string }
  | { type: "SET_REDUCED_MOTION"; value: boolean }
  | { type: "RESET" }
  | { type: "DISMISS_CELEBRATION" }
  | { type: "SET_NOTICE"; notice: NoticeKind | null }
  | { type: "DEV_GRANT_XP"; xp: number }
  | { type: "SET_TODAY"; today: string };

export function createUiState(): UiState {
  return { hydrated: false, app: createInitialState(), celebration: null, notice: null, today: "" };
}

function withApp(state: UiState, app: AppState): UiState {
  return app === state.app ? state : { ...state, app };
}

export function reducer(state: UiState, action: Action): UiState {
  const next = transition(state, action);
  if ("clock" in action && next.today !== action.clock.today) return { ...next, today: action.clock.today };
  return next;
}

function transition(state: UiState, action: Action): UiState {
  switch (action.type) {
    case "HYDRATE": {
      // Self-heal: a missing or corrupted board is regenerated.
      const app = action.app.onboarded ? ensureBoard(action.app, action.clock) : action.app;
      return { hydrated: true, app, celebration: null, notice: action.notice, today: action.clock.today };
    }
    case "SET_TODAY":
      return state.today === action.today ? state : { ...state, today: action.today };
    case "ONBOARD":
      return { ...withApp(state, completeOnboarding(state.app, action.name, action.clock)), notice: null };
    case "ACCEPT": {
      const { state: app, error } = acceptQuest(state.app, action.instanceId, action.clock);
      if (error === "quest-already-active") return { ...state, notice: "quest-locked" };
      return withApp(state, app);
    }
    case "COMPLETE": {
      const { state: app, result } = completeQuest(state.app, action.instanceId, action.clock);
      if (!result) return state;
      return { ...state, app, celebration: result };
    }
    case "ABANDON":
      return withApp(state, abandonQuest(state.app, action.instanceId, action.clock));
    case "REROLL":
      return withApp(state, rerollBoard(state.app, action.clock));
    case "RENAME":
      return withApp(state, renamePlayer(state.app, action.name));
    case "SET_REDUCED_MOTION":
      return withApp(state, setReducedMotion(state.app, action.value));
    case "RESET":
      return { ...state, app: createInitialState(), celebration: null, notice: "reset-complete" };
    case "DISMISS_CELEBRATION":
      return state.celebration ? { ...state, celebration: null } : state;
    case "SET_NOTICE":
      return state.notice === action.notice ? state : { ...state, notice: action.notice };
    case "DEV_GRANT_XP":
      return withApp(state, grantXp(state.app, action.xp));
  }
}
