import type { ScheduleFile } from "./content/types";

/**
 * DAILY RESET: one global reset at 00:00 UTC.
 * A "day" is the UTC calendar date. The same derivation (utcDateKey) is used for
 * scenario selection AND for persistence keys, so they can never disagree.
 */
export const RESET_UTC_HOUR = 0;

const DAY_MS = 86_400_000;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function isValidDateKey(key: unknown): key is string {
  if (typeof key !== "string" || !DATE_RE.test(key)) return false;
  const d = new Date(`${key}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === key;
}

/** UTC calendar date of an instant, e.g. "2026-11-07". */
export function utcDateKey(now: Date | number): string {
  return new Date(now).toISOString().slice(0, 10);
}

/** Whole days from `from` to `to` (both date keys). */
export function daysBetween(from: string, to: string): number {
  return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / DAY_MS);
}

export function addDays(key: string, days: number): string {
  return utcDateKey(Date.parse(`${key}T00:00:00Z`) + days * DAY_MS);
}

/** The next reset instant strictly after `now`. */
export function nextResetAt(now: Date | number): Date {
  const key = utcDateKey(now);
  return new Date(Date.parse(`${addDays(key, 1)}T00:00:00Z`));
}

export interface DailyPick {
  dateKey: string;
  scenarioId: string;
  /** #001 on the epoch date. */
  puzzleNumber: number;
  source: "scheduled" | "demo-rotation";
}

/** Which scenario plays on a given UTC date, or null if nothing is scheduled. */
export function pickScenario(dateKey: string, schedule: ScheduleFile): DailyPick | null {
  if (!isValidDateKey(dateKey)) return null;
  const index = daysBetween(schedule.epoch, dateKey);
  if (index < 0) return null;
  const puzzleNumber = index + 1;
  const entry = schedule.entries.find((e) => e.date === dateKey);
  if (entry) return { dateKey, scenarioId: entry.scenarioId, puzzleNumber, source: "scheduled" };
  if (schedule.fallback === "demo-rotation" && schedule.demoRotation.length > 0) {
    const scenarioId = schedule.demoRotation[index % schedule.demoRotation.length];
    return { dateKey, scenarioId, puzzleNumber, source: "demo-rotation" };
  }
  return null;
}

export function formatPuzzleNumber(n: number): string {
  return `#${String(n).padStart(3, "0")}`;
}
