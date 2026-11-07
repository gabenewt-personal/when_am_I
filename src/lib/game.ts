/**
 * Pure game state machine. No React, no storage, no clock.
 *
 * clue      = number of clues currently revealed (1..6)
 * events    = every guess / voluntary reveal, in order (one action per clue)
 * status    = playing | solved | failed
 */

export const POINTS = [100, 80, 60, 40, 20, 10] as const;
export const MAX_CLUES = POINTS.length;

export type GameEvent =
  | { kind: "guess"; clue: number; optionId: string; correct: boolean }
  | { kind: "skip"; clue: number };

export type GameStatus = "playing" | "solved" | "failed";

export interface GameState {
  scenarioId: string;
  dateKey: string;
  clue: number;
  events: GameEvent[];
  status: GameStatus;
  /** Final score once finished; null while playing. */
  score: number | null;
}

export interface Rules {
  answerId: string;
  /** Every valid option id in the scenario's category. */
  validIds: ReadonlySet<string>;
}

export type Outcome = "correct" | "wrong" | "skipped" | "failed";
export type Rejection = "finished" | "invalid" | "repeat" | "no-more-clues";

export type StepResult = { ok: true; state: GameState; outcome: Outcome } | { ok: false; reason: Rejection };

export function newGame(scenarioId: string, dateKey: string): GameState {
  return { scenarioId, dateKey, clue: 1, events: [], status: "playing", score: null };
}

export function pointsForClue(clue: number): number {
  return POINTS[Math.min(Math.max(clue, 1), MAX_CLUES) - 1];
}

/** "Score" on screen: points still available while playing, final score after. */
export function displayScore(state: GameState): number {
  return state.status === "playing" ? pointsForClue(state.clue) : (state.score ?? 0);
}

export function guessedIds(state: GameState): string[] {
  return state.events.flatMap((e) => (e.kind === "guess" ? [e.optionId] : []));
}

export function applyGuess(state: GameState, optionId: string, rules: Rules): StepResult {
  if (state.status !== "playing") return { ok: false, reason: "finished" };
  if (!rules.validIds.has(optionId)) return { ok: false, reason: "invalid" };
  if (guessedIds(state).includes(optionId)) return { ok: false, reason: "repeat" };

  const correct = optionId === rules.answerId;
  const events: GameEvent[] = [...state.events, { kind: "guess", clue: state.clue, optionId, correct }];

  if (correct) {
    return { ok: true, outcome: "correct", state: { ...state, events, status: "solved", score: pointsForClue(state.clue) } };
  }
  if (state.clue >= MAX_CLUES) {
    return { ok: true, outcome: "failed", state: { ...state, events, status: "failed", score: 0 } };
  }
  return { ok: true, outcome: "wrong", state: { ...state, events, clue: state.clue + 1 } };
}

/** Voluntary "Reveal next clue": costs points like a wrong guess, but records no guess. */
export function applySkip(state: GameState): StepResult {
  if (state.status !== "playing") return { ok: false, reason: "finished" };
  if (state.clue >= MAX_CLUES) return { ok: false, reason: "no-more-clues" };
  const events: GameEvent[] = [...state.events, { kind: "skip", clue: state.clue }];
  return { ok: true, outcome: "skipped", state: { ...state, events, clue: state.clue + 1 } };
}

/**
 * Rebuild a state by replaying stored actions through the rules. This is how saved
 * games are restored: the score is always recomputed, never trusted from storage.
 * Replay stops at the first action that the rules reject (corrupt/tampered data).
 */
export function replay(
  scenarioId: string,
  dateKey: string,
  actions: ReadonlyArray<{ kind: "guess"; optionId: string } | { kind: "skip" }>,
  rules: Rules,
): GameState {
  let state = newGame(scenarioId, dateKey);
  for (const a of actions) {
    const r = a.kind === "guess" ? applyGuess(state, a.optionId, rules) : applySkip(state);
    if (!r.ok) break;
    state = r.state;
  }
  return state;
}
