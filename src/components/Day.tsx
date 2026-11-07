"use client";

import { useEffect, useMemo, useState } from "react";
import type { PublicContent } from "@/lib/content/types";
import { unseal } from "@/lib/content/seal";
import { applyGuess, applySkip, newGame, type GameState, type StepResult } from "@/lib/game";
import {
  browserStorage,
  computeStats,
  loadGame,
  loadHistory,
  playKey,
  recordResult,
  saveGame,
  HISTORY_KEY,
} from "@/lib/persistence";
import type { DailyPick } from "@/lib/schedule";
import { Discovery } from "./Discovery";
import { Home } from "./Home";
import { Mystery } from "./Mystery";

type Screen = "home" | "mystery" | "discovery";

/** One daily round: owns the game state for a (date, scenario) pair. */
export function Day({
  content,
  pick,
  dateKey,
  todayKey,
  now,
  onPin,
}: {
  content: PublicContent;
  pick: DailyPick | null;
  dateKey: string;
  todayKey: string;
  now: number;
  onPin: (pinned: boolean) => void;
}) {
  const storage = useMemo(() => browserStorage(), []);
  const scenario = pick ? content.scenarios.find((s) => s.id === pick.scenarioId) : undefined;
  const category = scenario ? content.categories.find((c) => c.id === scenario.categoryId) : undefined;

  // Decoded in memory only; never rendered until the round is over.
  const revelation = useMemo(() => (scenario ? unseal(scenario.id, scenario.sealed) : null), [scenario]);
  const rules = useMemo(
    () =>
      revelation && category
        ? { answerId: revelation.answerId, validIds: new Set(category.options.map((o) => o.id)) }
        : null,
    [revelation, category],
  );

  const [game, setGame] = useState<GameState | null>(() =>
    scenario && rules ? (loadGame(storage, dateKey, scenario.id, rules) ?? newGame(scenario.id, dateKey)) : null,
  );
  const [history, setHistory] = useState(() => loadHistory(storage));
  const [screen, setScreen] = useState<Screen>("home");
  const [feedback, setFeedback] = useState<{ text: string; id: number } | null>(null);

  // Another tab played this round? Pick up its progress so it can't be replayed here.
  useEffect(() => {
    if (!scenario || !rules) return;
    const key = playKey(dateKey, scenario.id);
    const onStorage = (e: StorageEvent) => {
      if (e.key === key) {
        const next = loadGame(storage, dateKey, scenario.id, rules);
        if (next && next.events.length > (game?.events.length ?? 0)) setGame(next);
      }
      if (e.key === HISTORY_KEY) setHistory(loadHistory(storage));
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [storage, dateKey, scenario, rules, game]);

  if (!pick || !scenario || !category || !revelation || !rules || !game) {
    return <Home kind="none" todayKey={todayKey} now={now} stats={computeStats(history, todayKey)} />;
  }

  const go = (next: Screen) => {
    setScreen(next);
    onPin(next !== "home");
    setFeedback(null);
    window.scrollTo({ top: 0 });
  };

  const commit = (r: StepResult) => {
    if (!r.ok) {
      if (r.reason === "repeat") setFeedback({ text: "You've already tried that answer.", id: Date.now() });
      return;
    }
    setGame(r.state);
    saveGame(storage, r.state, content.contentVersion);
    if (r.state.status !== "playing") {
      setHistory(recordResult(storage, r.state, pick.puzzleNumber));
      go("discovery");
      return;
    }
    setFeedback({
      text: r.outcome === "wrong" ? "Not quite. The world offers another clue." : "The world offers another clue.",
      id: Date.now(),
    });
  };

  const stats = computeStats(history, todayKey);
  const finished = game.status !== "playing";

  if (screen === "mystery" && !finished) {
    return (
      <Mystery
        category={category}
        artId={scenario.artId}
        clues={scenario.clues}
        game={game}
        feedback={feedback}
        onGuess={(id) => commit(applyGuess(game, id, rules))}
        onSkip={() => commit(applySkip(game))}
        onHome={() => go("home")}
      />
    );
  }

  if (screen === "discovery" || (screen === "mystery" && finished)) {
    return (
      <Discovery
        category={category}
        artId={scenario.artId}
        clues={scenario.clues}
        game={game}
        revelation={revelation}
        puzzleNumber={pick.puzzleNumber}
        onHome={() => go("home")}
      />
    );
  }

  return (
    <Home
      kind={finished ? "finished" : game.events.length > 0 ? "resume" : "start"}
      category={category}
      game={game}
      pick={pick}
      todayKey={todayKey}
      now={now}
      stats={stats}
      onPlay={() => go(finished ? "discovery" : "mystery")}
    />
  );
}
