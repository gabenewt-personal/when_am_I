import { applySkip, MAX_CLUES, newGame, type GameState, type StepResult } from "./game";

/**
 * Player-facing feedback for one step of a round. Shared by the daily game and
 * Demo Mode so both say exactly the same thing. Null = nothing to say.
 */
export function feedbackFor(r: StepResult): string | null {
  if (!r.ok) return r.reason === "repeat" ? "You've already tried that answer." : null;
  if (r.state.status !== "playing") return null;
  return r.outcome === "wrong" ? "Not quite. The world offers another clue." : "The world offers another clue.";
}

/**
 * A fresh round advanced to `clue` through the real rules (voluntary reveals), so
 * the points shown are exactly what a player would have left at that stage.
 */
export function jumpToClue(scenarioId: string, dateKey: string, clue: number): GameState {
  const target = Math.min(Math.max(Math.round(clue), 1), MAX_CLUES);
  let state = newGame(scenarioId, dateKey);
  while (state.clue < target) {
    const r = applySkip(state);
    if (!r.ok) break;
    state = r.state;
  }
  return state;
}
