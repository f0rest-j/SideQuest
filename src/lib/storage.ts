/**
 * Persistence boundary. The rest of the app depends only on `StateRepository`,
 * so localStorage can later be swapped for a backend without touching UI or
 * domain code. Never call these during server rendering.
 */
import { SCHEMA_VERSION } from "@/domain/transitions";
import type { AppState } from "@/domain/types";
import { parseAppState } from "./validation";

export const STORAGE_KEY = "sidequest:v1";

export type LoadResult =
  | { status: "empty" }
  | { status: "ok"; state: AppState }
  /** Saved data was partly invalid; the salvageable parts were kept. */
  | { status: "recovered"; state: AppState }
  /** Saved data was unreadable and has been set aside. */
  | { status: "corrupt" }
  | { status: "unavailable" };

export interface StateRepository {
  load(): LoadResult;
  save(state: AppState): boolean;
  clear(): boolean;
}

type Migration = (data: Record<string, unknown>) => Record<string, unknown>;

/**
 * `MIGRATIONS[n]` upgrades a schema-version-n object to n+1. Version 0 covers
 * saves written before `schemaVersion` existed.
 */
const MIGRATIONS: Record<number, Migration> = {
  0: (data) => ({ ...data, onboarded: data.onboarded ?? true, schemaVersion: 1 }),
};

export function migrate(raw: unknown): unknown {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) return raw;
  let data = raw as Record<string, unknown>;
  let version = typeof data.schemaVersion === "number" ? data.schemaVersion : 0;
  // A save from a newer app version: attempt to read it as the current version.
  if (version > SCHEMA_VERSION) return { ...data, schemaVersion: SCHEMA_VERSION };
  while (version < SCHEMA_VERSION) {
    const step = MIGRATIONS[version];
    if (!step) return null;
    data = step(data);
    version += 1;
  }
  return data;
}

/** Parse raw stored text into a load result. Pure, for easy testing. */
export function decodeState(text: string | null): LoadResult {
  if (text === null) return { status: "empty" };
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return { status: "corrupt" };
  }
  const parsed = parseAppState(migrate(raw));
  if (!parsed) return { status: "corrupt" };
  return parsed.repaired ? { status: "recovered", state: parsed.state } : { status: "ok", state: parsed.state };
}

function getStorage(): Storage | null {
  try {
    if (typeof window === "undefined" || !window.localStorage) return null;
    const probe = `${STORAGE_KEY}:probe`;
    window.localStorage.setItem(probe, "1");
    window.localStorage.removeItem(probe);
    return window.localStorage;
  } catch {
    return null;
  }
}

export function createLocalStorageRepository(key = STORAGE_KEY): StateRepository {
  return {
    load() {
      const storage = getStorage();
      if (!storage) return { status: "unavailable" };
      let text: string | null;
      try {
        text = storage.getItem(key);
      } catch {
        return { status: "unavailable" };
      }
      const result = decodeState(text);
      if (result.status === "corrupt" && text !== null) {
        // Keep the unreadable save aside instead of silently destroying it.
        try {
          storage.setItem(`${key}:corrupt`, text);
        } catch {
          /* best effort */
        }
      }
      return result;
    },
    save(state) {
      const storage = getStorage();
      if (!storage) return false;
      try {
        storage.setItem(key, JSON.stringify(state));
        return true;
      } catch {
        return false;
      }
    },
    clear() {
      const storage = getStorage();
      if (!storage) return false;
      try {
        storage.removeItem(key);
        storage.removeItem(`${key}:corrupt`);
        return true;
      } catch {
        return false;
      }
    },
  };
}
