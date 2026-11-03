/**
 * Local-calendar date helpers. Streaks are based on the player's local calendar
 * day, so we never compare raw UTC timestamps.
 */

const DATE_KEY = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Local calendar date key, e.g. `2026-11-03`. */
export function toLocalDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function isDateKey(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const match = DATE_KEY.exec(value);
  if (!match) return false;
  const [, y, m, d] = match.map(Number);
  const probe = new Date(Date.UTC(y, m - 1, d));
  return probe.getUTCFullYear() === y && probe.getUTCMonth() === m - 1 && probe.getUTCDate() === d;
}

/** Day number for a date key, independent of time zone and DST. */
function dayNumber(key: string): number {
  const [y, m, d] = key.split("-").map(Number);
  return Math.round(Date.UTC(y, m - 1, d) / 86_400_000);
}

/** Whole calendar days from `from` to `to` (positive when `to` is later). */
export function calendarDaysBetween(from: string, to: string): number {
  return dayNumber(to) - dayNumber(from);
}

export function isValidIsoDate(value: unknown): value is string {
  return typeof value === "string" && value.length > 0 && !Number.isNaN(Date.parse(value));
}
