"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Category, PublicContent, PublicScenario, Revelation } from "@/lib/content/types";
import { unseal } from "@/lib/content/seal";
import { useNow } from "@/lib/clock";
import { applyGuess, applySkip, MAX_CLUES, type GameState, type Rules, type StepResult } from "@/lib/game";
import { loadHistory, readOnlyStorage } from "@/lib/persistence";
import { feedbackFor, jumpToClue } from "@/lib/round";
import { formatPuzzleNumber, pickScenario, utcDateKey } from "@/lib/schedule";
import { Discovery } from "./Discovery";
import { Mystery } from "./Mystery";
import { Shell } from "./Shell";

/**
 * DEMO MODE — replay any mystery, any number of times.
 *
 * Progress isolation: demo rounds live only in this component's React state. Nothing
 * here imports saveGame / recordResult / clearGame, and the only storage access is a
 * read-only view used for the "played today" badges. Leaving the page discards the
 * demo round; the real daily result, history and streak are never touched.
 *
 * Gameplay is not reimplemented: the same rules (applyGuess / applySkip), feedback
 * text, Mystery screen (art, clues, autocomplete) and Discovery screen are used.
 */

/** Dummy day for demo rounds. It's not a valid date key, so it can never match a real day. */
const DEMO_DAY = "demo";

interface Entry {
  scenario: PublicScenario;
  category: Category;
  revelation: Revelation;
  rules: Rules;
  number: number;
}

export function Demo({ content }: { content: PublicContent }) {
  const now = useNow();
  const entries = useMemo<Entry[]>(
    () =>
      content.scenarios.flatMap((scenario, i) => {
        const category = content.categories.find((c) => c.id === scenario.categoryId);
        if (!category) return [];
        const revelation = unseal(scenario.id, scenario.sealed);
        const rules = { answerId: revelation.answerId, validIds: new Set(category.options.map((o) => o.id)) };
        return [{ scenario, category, revelation, rules, number: i + 1 }];
      }),
    [content],
  );

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [game, setGame] = useState<GameState | null>(null);
  const [feedback, setFeedback] = useState<{ text: string; id: number } | null>(null);
  // Bumped on every (re)start so the round's screens remount from scratch.
  const [run, setRun] = useState(0);

  const entry = entries.find((e) => e.scenario.id === selectedId) ?? null;

  const start = (id: string, clue = 1) => {
    setSelectedId(id);
    setGame(jumpToClue(id, DEMO_DAY, clue));
    setFeedback(null);
    setRun((n) => n + 1);
    window.scrollTo({ top: 0 });
  };

  const toMenu = () => {
    setSelectedId(null);
    setGame(null);
    setFeedback(null);
    window.scrollTo({ top: 0 });
  };

  const commit = (r: StepResult) => {
    const text = feedbackFor(r);
    if (!r.ok) {
      if (text) setFeedback({ text, id: Date.now() });
      return;
    }
    setGame(r.state);
    setFeedback(text ? { text, id: Date.now() } : null);
    if (r.state.status !== "playing") window.scrollTo({ top: 0 });
  };

  // Badges only (read-only, client-only: `now` is 0 during the static render).
  const today = useMemo(() => {
    if (!now) return null;
    const key = utcDateKey(now);
    return { pick: pickScenario(key, content.schedule), played: loadHistory(readOnlyStorage())[key] ?? null };
  }, [now, content.schedule]);

  return (
    <Shell demo={content.demo} practice>
      <DemoBar
        entry={entry}
        game={game}
        onRestart={() => entry && start(entry.scenario.id)}
        onJump={(clue) => entry && start(entry.scenario.id, clue)}
        onMenu={toMenu}
      />

      {!entry || !game ? (
        <div className="demo-menu appear">
          <div className="title">
            <h1 className="title__name">Demo Mode</h1>
            <p className="title__sub">Play any mystery, as often as you like.</p>
          </div>
          <div className="dialog">
            <p className="dialog__text">
              Nothing here touches your daily result, streak or stats. Demo rounds are kept in memory only and vanish
              when you leave this page.
            </p>
          </div>
          <ul className="demo-list" aria-label="Mysteries">
            {entries.map((e) => {
              const isToday = today?.pick?.scenarioId === e.scenario.id;
              const played = isToday && today?.played?.scenarioId === e.scenario.id ? today.played : null;
              return (
                <li key={e.scenario.id}>
                  <button className="demo-item" type="button" onClick={() => start(e.scenario.id)}>
                    <span className="demo-item__num num">{formatPuzzleNumber(e.number)}</span>
                    <span className="demo-item__body">
                      <span className="label">{e.category.label}</span>
                      <span className="demo-item__title">{e.revelation.sceneTitle}</span>
                      {isToday && (
                        <span className="demo-item__tags">
                          <span className="chip chip--gold">Today</span>
                          {played && (
                            <span className="chip">
                              Played · {played.status === "solved" ? "solved" : "lost"} · {played.score}
                            </span>
                          )}
                        </span>
                      )}
                    </span>
                    <span className="demo-item__go" aria-hidden="true">
                      ▶
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          <Link className="btn btn--wide" href="/">
            ◀ Return home
          </Link>
        </div>
      ) : game.status === "playing" ? (
        <Mystery
          key={run}
          category={entry.category}
          artId={entry.scenario.artId}
          clues={entry.scenario.clues}
          game={game}
          feedback={feedback}
          onGuess={(id) => commit(applyGuess(game, id, entry.rules))}
          onSkip={() => commit(applySkip(game))}
          onHome={toMenu}
          homeLabel="◀ All mysteries (demo not saved)"
        />
      ) : (
        <Discovery
          key={run}
          category={entry.category}
          artId={entry.scenario.artId}
          clues={entry.scenario.clues}
          game={game}
          revelation={entry.revelation}
          puzzleNumber={entry.number}
          onHome={toMenu}
          homeLabel="◀ All mysteries"
          demo
        />
      )}
    </Shell>
  );
}

function DemoBar({
  entry,
  game,
  onRestart,
  onJump,
  onMenu,
}: {
  entry: Entry | null;
  game: GameState | null;
  onRestart: () => void;
  onJump: (clue: number) => void;
  onMenu: () => void;
}) {
  return (
    <div className="demo-bar" role="region" aria-label="Demo controls">
      <div className="demo-bar__head">
        <span className="chip chip--demo">Demo mode</span>
        <span className="demo-bar__note">Progress not saved</span>
      </div>
      {entry && game && (
        <>
          <p className="demo-bar__now">
            <span className="num">{formatPuzzleNumber(entry.number)}</span> {entry.revelation.sceneTitle}
          </p>
          <div className="demo-bar__row">
            <button className="btn btn--small" type="button" onClick={onRestart}>
              ↻ Restart
            </button>
            <label className="demo-bar__jump">
              <span className="label">Jump to clue</span>
              <select
                value={game.status === "playing" ? game.clue : ""}
                onChange={(e) => e.target.value && onJump(Number(e.target.value))}
              >
                {game.status !== "playing" && <option value="">—</option>}
                {Array.from({ length: MAX_CLUES }, (_, i) => (
                  <option key={i} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
            </label>
            <button className="btn btn--small" type="button" onClick={onMenu}>
              ☰ Mysteries
            </button>
            <Link className="btn btn--small" href="/">
              ◀ Home
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
