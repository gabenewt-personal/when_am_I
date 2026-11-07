import { readFileSync } from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { applyGuess, displayScore, newGame } from "@/lib/game";
import { computeStats, HISTORY_KEY, loadHistory, readOnlyStorage, recordResult, saveGame } from "@/lib/persistence";
import { feedbackFor, jumpToClue } from "@/lib/round";
import { MemoryStorage, rulesFor } from "./helpers";

describe("shared round helpers", () => {
  const rules = rulesFor("jurassic-river");

  it("jump to clue replays real reveals, so points match the scoring table", () => {
    expect([1, 2, 3, 4, 5, 6].map((c) => displayScore(jumpToClue("x", "demo", c)))).toEqual([100, 80, 60, 40, 20, 10]);
    const s = jumpToClue("x", "demo", 4);
    expect(s.events.map((e) => e.kind)).toEqual(["skip", "skip", "skip"]);
    expect(jumpToClue("x", "demo", 99).clue).toBe(6);
    expect(jumpToClue("x", "demo", 0).clue).toBe(1);
  });

  it("feedback text is identical for daily and demo", () => {
    const g = newGame("jurassic-river", "demo");
    expect(feedbackFor(applyGuess(g, "triassic", rules))).toBe("Not quite. The world offers another clue.");
    expect(feedbackFor(applyGuess(g, "jurassic", rules))).toBeNull();
    const after = applyGuess(g, "triassic", rules);
    if (!after.ok) throw new Error();
    expect(feedbackFor(applyGuess(after.state, "triassic", rules))).toBe("You've already tried that answer.");
  });
});

describe("demo progress isolation", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("the read-only view reads real history but can never write it", () => {
    const real = new MemoryStorage();
    const solved = applyGuess(newGame("jurassic-river", "2026-11-07"), "jurassic", rulesFor("jurassic-river"));
    if (!solved.ok) throw new Error();
    recordResult(real, solved.state, 7);
    const before = new Map(real.map);
    vi.stubGlobal("window", { localStorage: real });

    const ro = readOnlyStorage()!;
    expect(loadHistory(ro)["2026-11-07"]).toMatchObject({ status: "solved", score: 100 });
    // Even if a write were attempted through it, nothing changes.
    const demoFail = applyGuess(jumpToClue("jurassic-river", "2026-11-07", 6), "triassic", rulesFor("jurassic-river"));
    if (!demoFail.ok) throw new Error();
    recordResult(ro, demoFail.state, 7);
    saveGame(ro, demoFail.state, "v");
    ro.removeItem(HISTORY_KEY);
    expect(real.map).toEqual(before);
    expect(computeStats(loadHistory(real), "2026-11-07").streak).toBe(1);
  });

  it("demo rounds use a day key that can never be recorded as a real day", () => {
    const store = new MemoryStorage();
    const r = applyGuess(newGame("jurassic-river", "demo"), "jurassic", rulesFor("jurassic-river"));
    if (!r.ok) throw new Error();
    recordResult(store, r.state, 1);
    expect(store.map.has(HISTORY_KEY)).toBe(false);
  });

  it("Demo Mode imports no storage writers", () => {
    const src = readFileSync(path.join(import.meta.dirname, "../src/components/Demo.tsx"), "utf8");
    const imports = src.split("\n").filter((l) => l.startsWith("import"));
    for (const banned of ["saveGame", "recordResult", "clearGame", "browserStorage", "localStorage"]) {
      expect(imports.join("\n")).not.toContain(banned);
    }
    expect(src).not.toMatch(/localStorage\.(setItem|removeItem|clear)/);
  });
});
