"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { SceneArt } from "@/art/SceneArt";
import type { Category, CategoryOption } from "@/lib/content/types";
import { displayScore, guessedIds, MAX_CLUES, POINTS, type GameState } from "@/lib/game";
import { scrollByDelta, scrollDeltaToShow, visibleArea } from "@/lib/viewport";
import { Combobox } from "./Combobox";

export function Mystery({
  category,
  artId,
  clues,
  game,
  feedback,
  onGuess,
  onSkip,
  onHome,
  homeLabel = "◀ Home (progress is saved)",
}: {
  category: Category;
  artId: string | null;
  clues: string[];
  game: GameState;
  feedback: { text: string; id: number } | null;
  onGuess: (optionId: string) => void;
  onSkip: () => void;
  onHome: () => void;
  homeLabel?: string;
}) {
  const [selected, setSelected] = useState<CategoryOption | null>(null);
  const latestRef = useRef<HTMLParagraphElement>(null);
  const tried = new Set(guessedIds(game));
  const wrong = game.events.filter((e) => e.kind === "guess" && !e.correct);
  const labelOf = (id: string) => category.options.find((o) => o.id === id)?.label ?? id;
  const revealed = clues.slice(0, game.clue);

  const formRef = useRef<HTMLFormElement>(null);
  const submitRef = useRef<HTMLButtonElement>(null);

  // Bring the latest clue into view together with the answer field below it, so the
  // player can read and respond without hunting. Earlier clues stay in the page above.
  // On a new clue, focus moves to it (without a jump) so screen readers read it next.
  const showLatest = useCallback((isNew: boolean) => {
    const clue = latestRef.current;
    const form = formRef.current;
    if (!clue || !form) return;
    if (isNew) clue.focus({ preventScroll: true });
    const delta = scrollDeltaToShow(clue.getBoundingClientRect().top, form.getBoundingClientRect().bottom, visibleArea());
    if (isNew) scrollByDelta(delta);
    else window.scrollBy({ top: delta });
  }, []);

  // Resuming mid-round: start at the latest clue rather than the top.
  const mountClue = useRef(game.clue);
  useEffect(() => {
    // Layout is already committed here, so measuring synchronously is safe (and a
    // second strict-mode run finds nothing left to scroll).
    if (mountClue.current > 1) showLatest(false);
  }, [showLatest]);

  const lastClue = useRef(game.clue);
  useEffect(() => {
    if (game.clue === lastClue.current) return;
    lastClue.current = game.clue;
    showLatest(true);
  }, [game.clue, showLatest]);

  return (
    <div className="mystery">
      <div className="hud">
        <div className="hud__cat">
          <span className="label">Category</span>
          <span className="hud__catname">{category.label}</span>
        </div>
        <div className="hud__clue">
          <span className="label">Clue</span>
          <span className="num">
            {game.clue}/{MAX_CLUES}
          </span>
        </div>
        <div className="hud__score">
          <span className="label">Score</span>
          <span className="num">{displayScore(game)}</span>
        </div>
      </div>
      <div className="pips" aria-hidden="true">
        {POINTS.map((p, i) => (
          <span key={p} className={`pip${i + 1 < game.clue ? " is-spent" : i + 1 === game.clue ? " is-now" : ""}`}>
            {p}
          </span>
        ))}
      </div>

      <figure className="scene">
        <SceneArt artId={artId} stage={game.clue} />
      </figure>

      <section className="dialog narrative" aria-label="What you notice">
        {revealed.map((c, i) => (
          <p
            key={i}
            ref={i === revealed.length - 1 ? latestRef : undefined}
            tabIndex={i === revealed.length - 1 ? -1 : undefined}
            className={`clue${i === revealed.length - 1 ? " clue--new" : ""}`}
          >
            <span className="clue__n label" aria-label={`Clue ${i + 1}`}>
              {i + 1}
            </span>
            {c}
          </p>
        ))}
      </section>

      <p className="feedback" role="status" aria-live="polite" key={feedback?.id}>
        {feedback?.text ?? ""}
      </p>

      <form
        ref={formRef}
        className="guess"
        onSubmit={(e) => {
          e.preventDefault();
          if (selected) {
            onGuess(selected.id);
            setSelected(null);
          }
        }}
      >
        <div className="guess__row">
          <Combobox
            key={game.events.length}
            category={category}
            triedIds={tried}
            selected={selected}
            onSelect={setSelected}
            onPicked={() => submitRef.current?.focus({ preventScroll: true })}
          />
          <button ref={submitRef} className="btn btn--a guess__submit" type="submit" disabled={!selected}>
            Guess
          </button>
        </div>
        <button className="btn btn--wide" type="button" onClick={onSkip} disabled={game.clue >= MAX_CLUES}>
          {game.clue >= MAX_CLUES ? "Final clue — make your guess" : `Reveal next clue (−${POINTS[game.clue - 1] - POINTS[game.clue]} pts)`}
        </button>
      </form>

      {wrong.length > 0 && (
        <div className="tried">
          <span className="label">Not when you are</span>
          <ul>
            {wrong.map((e) =>
              e.kind === "guess" ? (
                <li key={e.optionId} className="chip chip--miss">
                  <s>{labelOf(e.optionId)}</s>
                </li>
              ) : null,
            )}
          </ul>
        </div>
      )}

      <button className="link-btn" type="button" onClick={onHome}>
        {homeLabel}
      </button>
    </div>
  );
}
