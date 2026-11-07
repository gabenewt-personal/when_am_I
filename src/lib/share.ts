import { MAX_CLUES, POINTS, type GameState } from "./game";
import { formatPuzzleNumber } from "./schedule";

/**
 * Spoiler-free share text, one square per clue:
 *   🟨 wrong guess   ⬛ clue revealed without guessing   🟩 solved   🟥 final miss   ⬜ unused
 * e.g. "WHEN AM I? #014 · 🟨🟩⬜⬜⬜⬜ · 80/100"
 */
export function shareSquares(state: GameState): string {
  const squares: string[] = Array(MAX_CLUES).fill("⬜");
  for (const e of state.events) {
    const i = e.clue - 1;
    if (e.kind === "skip") squares[i] = "⬛";
    else if (e.correct) squares[i] = "🟩";
    else squares[i] = state.status === "failed" && e.clue === MAX_CLUES ? "🟥" : "🟨";
  }
  return squares.join("");
}

export function shareText(state: GameState, puzzleNumber: number): string {
  return `WHEN AM I? ${formatPuzzleNumber(puzzleNumber)} · ${shareSquares(state)} · ${state.score ?? 0}/${POINTS[0]}`;
}
