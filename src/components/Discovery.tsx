"use client";

import { useState } from "react";
import { SceneArt } from "@/art/SceneArt";
import type { Category, Revelation } from "@/lib/content/types";
import { MAX_CLUES, POINTS, type GameState } from "@/lib/game";
import { shareSquares, shareText } from "@/lib/share";

export function Discovery({
  category,
  artId,
  clues,
  game,
  revelation,
  puzzleNumber,
  onHome,
}: {
  category: Category;
  artId: string | null;
  clues: string[];
  game: GameState;
  revelation: Revelation;
  puzzleNumber: number;
  onHome: () => void;
}) {
  const [shared, setShared] = useState<string | null>(null);
  const solved = game.status === "solved";
  const answer = category.options.find((o) => o.id === revelation.answerId)?.label ?? revelation.answerId;
  const labelOf = (id: string) => category.options.find((o) => o.id === id)?.label ?? id;
  const text = shareText(game, puzzleNumber);

  const share = async () => {
    try {
      if (navigator.share && matchMedia("(pointer: coarse)").matches) {
        await navigator.share({ text });
        return;
      }
      await navigator.clipboard.writeText(text);
      setShared("Copied to clipboard");
    } catch {
      setShared("Couldn't share — copy the line above");
    }
  };

  return (
    <div className="discovery appear">
      <div className={`result-banner ${solved ? "is-solved" : "is-failed"}`}>
        <span className="label">{solved ? "Discovered!" : "Lost in time"}</span>
        <span className="result-banner__score num">
          {game.score}
          <small>/{POINTS[0]}</small>
        </span>
      </div>

      <figure className="scene">
        <SceneArt artId={artId} stage={MAX_CLUES} />
      </figure>

      <div className="dialog">
        <p className="label">{revelation.sceneTitle}</p>
        <h2 className="answer">
          <span className="label">{category.label}</span>
          {answer}
        </h2>
        <p className="epilogue">{revelation.epilogue}</p>
      </div>

      <div className="card path">
        <span className="label">Your path</span>
        <ol>
          {Array.from({ length: MAX_CLUES }, (_, i) => {
            const ev = game.events.find((e) => e.clue === i + 1);
            let what = "—";
            if (ev?.kind === "skip") what = "Revealed next clue";
            else if (ev?.kind === "guess") what = `${labelOf(ev.optionId)} ${ev.correct ? "✓" : "✗"}`;
            return (
              <li key={i} className={ev?.kind === "guess" ? (ev.correct ? "is-right" : "is-wrong") : ""}>
                <span className="num">Clue {i + 1}</span> {what}
              </li>
            );
          })}
        </ol>
      </div>

      <details className="dialog all-clues">
        <summary className="label">Read all six clues</summary>
        {clues.map((c, i) => (
          <p key={i} className="clue">
            <span className="clue__n label">{i + 1}</span>
            {c}
          </p>
        ))}
      </details>

      <div className="card share">
        <span className="label">Share (spoiler-free)</span>
        <p className="share__line">{text}</p>
        <p className="share__legend muted">
          {shareSquares(game)} · 🟨 miss · ⬛ revealed · 🟩 solved · 🟥 final miss
        </p>
        <button className="btn btn--primary" type="button" onClick={share}>
          Share result
        </button>
        <p className="muted" role="status">
          {shared}
        </p>
      </div>

      {revelation.sourceUrls.length > 0 && (
        <p className="sources">
          <span className="label">Sources</span>
          {revelation.sourceUrls.map((u) => (
            <a key={u} href={u} target="_blank" rel="noopener noreferrer">
              {new URL(u).hostname.replace(/^www\./, "")}
            </a>
          ))}
        </p>
      )}

      <button className="btn btn--wide" type="button" onClick={onHome}>
        ◀ Return home
      </button>
    </div>
  );
}
