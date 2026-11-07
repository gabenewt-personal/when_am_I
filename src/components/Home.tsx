"use client";

import Link from "next/link";
import type { Category } from "@/lib/content/types";
import { displayScore, MAX_CLUES, POINTS, type GameState } from "@/lib/game";
import type { Stats } from "@/lib/persistence";
import { formatPuzzleNumber, nextResetAt, type DailyPick } from "@/lib/schedule";

type Props =
  | { kind: "none"; todayKey: string; now: number; stats: Stats }
  | {
      kind: "start" | "resume" | "finished";
      category: Category;
      game: GameState;
      pick: DailyPick;
      todayKey: string;
      now: number;
      stats: Stats;
      onPlay: () => void;
    };

function ResetInfo({ now }: { now: number }) {
  const reset = nextResetAt(now);
  const mins = Math.max(0, Math.ceil((reset.getTime() - now) / 60_000));
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  const local = reset.toLocaleString(undefined, {
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });
  return (
    <p className="reset">
      <span className="label">Next mystery</span>
      <span>
        {local} <span className="muted">· in {h}h {String(m).padStart(2, "0")}m · resets 00:00 UTC</span>
      </span>
    </p>
  );
}

function StatsCard({ stats }: { stats: Stats }) {
  return (
    <div className="card card--dark stats">
      <div>
        <span className="label">Streak</span>
        <span className="num stats__big">{stats.streak}</span>
      </div>
      <div>
        <span className="label">Solved</span>
        <span className="num">
          {stats.solved}/{stats.played}
        </span>
      </div>
    </div>
  );
}

export function Home(props: Props) {
  return (
    <div className="home appear">
      <div className="title">
        <h1 className="title__name">When Am I?</h1>
        <p className="title__sub">A daily mystery through time.</p>
      </div>

      {props.kind === "none" ? (
        <div className="dialog">
          <p className="dialog__text">No mystery has been scheduled for today. Check back after the next reset.</p>
        </div>
      ) : (
        <>
          <div className="dialog today">
            <p className="label today__meta">
              Mystery {formatPuzzleNumber(props.pick.puzzleNumber)} · {props.todayKey} UTC
            </p>
            <p className="label">Today&apos;s category</p>
            <h2 className="today__category">{props.category.label}</h2>
            <p className="today__hint">{props.category.subtitle}</p>
            {props.kind === "resume" && (
              <p className="today__status">
                In progress · clue {props.game.clue} of {MAX_CLUES} · {displayScore(props.game)} pts available
              </p>
            )}
            {props.kind === "finished" && (
              <p className="today__status">
                {props.game.status === "solved" ? "Solved" : "Lost in time"} · {props.game.score} pts. Come back tomorrow.
              </p>
            )}
          </div>
          <button className="btn btn--primary btn--wide press" type="button" onClick={props.onPlay}>
            {props.kind === "start" ? "▶ Wake up" : props.kind === "resume" ? "▶ Resume" : "▶ See results"}
          </button>
        </>
      )}

      <StatsCard stats={props.stats} />
      <ResetInfo now={props.now} />

      <details className="dialog howto" open={props.kind === "start" && props.stats.played === 0}>
        <summary className="label">How to play</summary>
        <ol>
          <li>You wake somewhere in time. The category tells you what kind of answer is wanted.</li>
          <li>Read the first fragment, then pick an answer from the list. One guess per clue.</li>
          <li>A wrong guess, or choosing to reveal the next clue, uncovers more of the scene and lowers the points available.</li>
          <li>
            Points: {POINTS.join(" · ")}. Miss on the sixth clue and the mystery ends at 0.
          </li>
          <li>One mystery a day for everyone. No timer — take your time.</li>
        </ol>
      </details>

      <Link className="link-btn" href="/demo">
        Demo mode ▶ replay any mystery
      </Link>
    </div>
  );
}
