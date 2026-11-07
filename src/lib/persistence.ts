import { replay, type GameState, type Rules } from "./game";
import { addDays, isValidDateKey } from "./schedule";

/**
 * localStorage persistence.
 *
 * Keys carry the storage schema version, the UTC daily date and the scenario id:
 *   whenami:v1:play:<YYYY-MM-DD>:<scenarioId>
 * A fresh key therefore exists per day AND per scenario, so a schedule edit can't
 * resurrect an old round onto a new mystery. The content hash is stored inside the
 * record (not in the key) so a typo-fix redeploy never hands players a second attempt.
 *
 * Only the player's actions are trusted from storage; clue position, status and
 * score are recomputed by replaying them through the rules, so refreshing can never
 * restore spent points.
 */

export const STORAGE_VERSION = 1;
const PREFIX = `whenami:v${STORAGE_VERSION}`;
export const HISTORY_KEY = `${PREFIX}:history`;

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

type StoredAction = { kind: "guess"; optionId: string } | { kind: "skip" };

interface PlayRecord {
  v: number;
  scenarioId: string;
  dateKey: string;
  contentVersion: string;
  actions: StoredAction[];
  // denormalized for humans reading devtools; ignored on load
  clue: number;
  status: GameState["status"];
  score: number | null;
  updatedAt: string;
}

export interface HistoryEntry {
  scenarioId: string;
  puzzleNumber: number;
  status: "solved" | "failed";
  score: number;
}
export type History = Record<string, HistoryEntry>;

export function playKey(dateKey: string, scenarioId: string): string {
  return `${PREFIX}:play:${dateKey}:${scenarioId}`;
}

/** Safe wrapper: storage can be missing, full, or throw (private mode, blocked cookies). */
export function browserStorage(): StorageLike | null {
  try {
    const s = window.localStorage;
    const probe = `${PREFIX}:probe`;
    s.setItem(probe, "1");
    s.removeItem(probe);
    return s;
  } catch {
    return null;
  }
}

/**
 * Read-only view of localStorage: reads pass through, writes are dropped. Demo Mode
 * uses this to show "played today" badges without any chance of touching real data
 * (it doesn't even run the write probe in browserStorage()).
 */
export function readOnlyStorage(): StorageLike | null {
  try {
    const s = window.localStorage;
    return { getItem: (k) => s.getItem(k), setItem: () => {}, removeItem: () => {} };
  } catch {
    return null;
  }
}

function readJson(storage: StorageLike | null, key: string): unknown {
  if (!storage) return null;
  try {
    const raw = storage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeJson(storage: StorageLike | null, key: string, value: unknown): void {
  if (!storage) return;
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota or privacy mode: the round still works for this page view */
  }
}

function parseActions(value: unknown): StoredAction[] | null {
  if (!Array.isArray(value)) return null;
  const out: StoredAction[] = [];
  for (const a of value) {
    if (a && typeof a === "object" && (a as { kind?: unknown }).kind === "skip") out.push({ kind: "skip" });
    else if (
      a &&
      typeof a === "object" &&
      (a as { kind?: unknown }).kind === "guess" &&
      typeof (a as { optionId?: unknown }).optionId === "string"
    ) {
      out.push({ kind: "guess", optionId: (a as { optionId: string }).optionId });
    } else return null;
  }
  return out;
}

/** Load (and re-derive) a saved round, or null if there is none / it is unreadable. */
export function loadGame(
  storage: StorageLike | null,
  dateKey: string,
  scenarioId: string,
  rules: Rules,
): GameState | null {
  const rec = readJson(storage, playKey(dateKey, scenarioId)) as Partial<PlayRecord> | null;
  if (!rec || typeof rec !== "object") return null;
  if (rec.v !== STORAGE_VERSION || rec.scenarioId !== scenarioId || rec.dateKey !== dateKey) return null;
  const actions = parseActions(rec.actions);
  if (!actions) return null;
  return replay(scenarioId, dateKey, actions, rules);
}

export function saveGame(storage: StorageLike | null, state: GameState, contentVersion: string): void {
  const record: PlayRecord = {
    v: STORAGE_VERSION,
    scenarioId: state.scenarioId,
    dateKey: state.dateKey,
    contentVersion,
    actions: state.events.map((e) => (e.kind === "guess" ? { kind: "guess", optionId: e.optionId } : { kind: "skip" })),
    clue: state.clue,
    status: state.status,
    score: state.score,
    updatedAt: new Date().toISOString(),
  };
  writeJson(storage, playKey(state.dateKey, state.scenarioId), record);
}

export function clearGame(storage: StorageLike | null, dateKey: string, scenarioId: string): void {
  try {
    storage?.removeItem(playKey(dateKey, scenarioId));
  } catch {
    /* ignore */
  }
  const history = loadHistory(storage);
  if (history[dateKey]?.scenarioId === scenarioId) {
    delete history[dateKey];
    writeJson(storage, HISTORY_KEY, history);
  }
}

// ---------- history & streak ----------

export function loadHistory(storage: StorageLike | null): History {
  const raw = readJson(storage, HISTORY_KEY);
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const out: History = {};
  for (const [date, e] of Object.entries(raw as Record<string, unknown>)) {
    const v = e as Partial<HistoryEntry> | null;
    if (
      isValidDateKey(date) &&
      v &&
      typeof v.scenarioId === "string" &&
      typeof v.puzzleNumber === "number" &&
      (v.status === "solved" || v.status === "failed") &&
      typeof v.score === "number"
    ) {
      out[date] = { scenarioId: v.scenarioId, puzzleNumber: v.puzzleNumber, status: v.status, score: v.score };
    }
  }
  return out;
}

export function recordResult(storage: StorageLike | null, state: GameState, puzzleNumber: number): History {
  const history = loadHistory(storage);
  if (state.status === "playing" || !isValidDateKey(state.dateKey)) return history;
  history[state.dateKey] = {
    scenarioId: state.scenarioId,
    puzzleNumber,
    status: state.status,
    score: state.score ?? 0,
  };
  writeJson(storage, HISTORY_KEY, history);
  return history;
}

export interface Stats {
  streak: number;
  played: number;
  solved: number;
}

/** Streak = consecutive solved days ending today (or yesterday, if today isn't finished yet). */
export function computeStats(history: History, todayKey: string): Stats {
  const entries = Object.values(history);
  let day = history[todayKey] ? todayKey : addDays(todayKey, -1);
  let streak = 0;
  while (history[day]?.status === "solved") {
    streak++;
    day = addDays(day, -1);
  }
  return { streak, played: entries.length, solved: entries.filter((e) => e.status === "solved").length };
}
