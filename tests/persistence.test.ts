import { describe, expect, it } from "vitest";
import { applyGuess, applySkip, newGame, type GameState } from "@/lib/game";
import {
  clearGame,
  computeStats,
  loadGame,
  loadHistory,
  playKey,
  recordResult,
  saveGame,
} from "@/lib/persistence";
import { MemoryStorage, rulesFor } from "./helpers";

const SWAMP = "carboniferous-swamp";
const DAY = "2026-11-07";
const rules = rulesFor(SWAMP);
const ok = (r: ReturnType<typeof applySkip>): GameState => {
  if (!r.ok) throw new Error(r.reason);
  return r.state;
};

describe("persistence", () => {
  it("refresh retains state (clue, guesses, available score)", () => {
    const storage = new MemoryStorage();
    const s = ok(applySkip(ok(applyGuess(newGame(SWAMP, DAY), "cambrian", rules))));
    saveGame(storage, s, "abc");
    const restored = loadGame(storage, DAY, SWAMP, rules);
    expect(restored).toEqual(s);
    expect(restored?.clue).toBe(3);
  });

  it("never restores spent points, even if the stored summary is tampered with", () => {
    const storage = new MemoryStorage();
    const s = ok(applyGuess(newGame(SWAMP, DAY), "cambrian", rules));
    saveGame(storage, s, "abc");
    const key = playKey(DAY, SWAMP);
    const rec = JSON.parse(storage.getItem(key)!);
    storage.setItem(key, JSON.stringify({ ...rec, clue: 1, score: 100 }));
    expect(loadGame(storage, DAY, SWAMP, rules)?.clue).toBe(2);
  });

  it("a completed round stays completed after reload", () => {
    const storage = new MemoryStorage();
    const solved = ok(applyGuess(newGame(SWAMP, DAY), "carboniferous", rules));
    saveGame(storage, solved, "abc");
    const restored = loadGame(storage, DAY, SWAMP, rules)!;
    expect(restored.status).toBe("solved");
    expect(applyGuess(restored, "cambrian", rules)).toEqual({ ok: false, reason: "finished" });
  });

  it("keys by date and scenario: another day starts fresh", () => {
    const storage = new MemoryStorage();
    saveGame(storage, ok(applySkip(newGame(SWAMP, DAY))), "abc");
    expect(loadGame(storage, "2026-11-08", SWAMP, rules)).toBeNull();
    expect(loadGame(storage, DAY, "jazz-after-dark", rulesFor("jazz-after-dark"))).toBeNull();
  });

  it("handles malformed storage gracefully", () => {
    const storage = new MemoryStorage();
    storage.setItem(playKey(DAY, SWAMP), "{not json");
    expect(loadGame(storage, DAY, SWAMP, rules)).toBeNull();
    storage.setItem(playKey(DAY, SWAMP), JSON.stringify({ v: 1, scenarioId: SWAMP, dateKey: DAY, actions: "nope" }));
    expect(loadGame(storage, DAY, SWAMP, rules)).toBeNull();
    storage.setItem(playKey(DAY, SWAMP), JSON.stringify({ v: 99, scenarioId: SWAMP, dateKey: DAY, actions: [] }));
    expect(loadGame(storage, DAY, SWAMP, rules)).toBeNull();
    storage.setItem("whenami:v1:history", "[1,2,3]");
    expect(loadHistory(storage)).toEqual({});
    expect(loadGame(null, DAY, SWAMP, rules)).toBeNull();
  });

  it("replay stops at invalid stored actions", () => {
    const storage = new MemoryStorage();
    storage.setItem(
      playKey(DAY, SWAMP),
      JSON.stringify({
        v: 1,
        scenarioId: SWAMP,
        dateKey: DAY,
        actions: [{ kind: "guess", optionId: "cambrian" }, { kind: "guess", optionId: "cambrian" }, { kind: "skip" }],
      }),
    );
    const s = loadGame(storage, DAY, SWAMP, rules)!;
    expect(s.clue).toBe(2);
    expect(s.events).toHaveLength(1);
  });

  it("tracks a streak of consecutive solved days", () => {
    const storage = new MemoryStorage();
    const solve = (day: string) => recordResult(storage, ok(applyGuess(newGame(SWAMP, day), "carboniferous", rules)), 1);
    solve("2026-11-05");
    solve("2026-11-06");
    expect(computeStats(loadHistory(storage), "2026-11-07").streak).toBe(2); // today not played yet
    solve("2026-11-07");
    expect(computeStats(loadHistory(storage), "2026-11-07")).toEqual({ streak: 3, played: 3, solved: 3 });
    expect(computeStats(loadHistory(storage), "2026-11-09").streak).toBe(0);
    clearGame(storage, "2026-11-07", SWAMP);
    expect(computeStats(loadHistory(storage), "2026-11-07").streak).toBe(2);
  });
});
