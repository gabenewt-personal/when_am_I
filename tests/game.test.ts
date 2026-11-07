import { describe, expect, it } from "vitest";
import { applyGuess, applySkip, displayScore, newGame, type GameState } from "@/lib/game";
import { shareText } from "@/lib/share";
import { rulesFor } from "./helpers";

const SWAMP = "carboniferous-swamp";
const rules = rulesFor(SWAMP);
const start = () => newGame(SWAMP, "2026-11-07");

function must(r: ReturnType<typeof applyGuess>): GameState {
  if (!r.ok) throw new Error(`rejected: ${r.reason}`);
  return r.state;
}

describe("game rules", () => {
  it("starts at clue 1 with 100 available", () => {
    expect(start().clue).toBe(1);
    expect(displayScore(start())).toBe(100);
  });

  it("choosing Cambrian in the Carboniferous scene advances from 100 to 80", () => {
    const r = applyGuess(start(), "cambrian", rules);
    expect(r.ok && r.outcome).toBe("wrong");
    const s = must(r);
    expect(s.clue).toBe(2);
    expect(s.status).toBe("playing");
    expect(displayScore(s)).toBe(80);
  });

  it("guessing Carboniferous at clue 2 yields 80", () => {
    const s = must(applyGuess(must(applySkip(start())), "carboniferous", rules));
    expect(s.status).toBe("solved");
    expect(s.score).toBe(80);
    expect(displayScore(s)).toBe(80);
  });

  it("follows the full point schedule", () => {
    const expected = [100, 80, 60, 40, 20, 10];
    for (let skips = 0; skips < 6; skips++) {
      let s = start();
      for (let i = 0; i < skips; i++) s = must(applySkip(s));
      expect(must(applyGuess(s, "carboniferous", rules)).score).toBe(expected[skips]);
    }
  });

  it("skip lowers the available score without recording a guess", () => {
    const s = must(applySkip(start()));
    expect(displayScore(s)).toBe(80);
    expect(s.events).toEqual([{ kind: "skip", clue: 1 }]);
  });

  it("cannot skip past the sixth clue", () => {
    let s = start();
    for (let i = 0; i < 5; i++) s = must(applySkip(s));
    expect(s.clue).toBe(6);
    expect(applySkip(s)).toEqual({ ok: false, reason: "no-more-clues" });
  });

  it("rejects a repeated guess and leaves the state untouched", () => {
    const s = must(applyGuess(start(), "cambrian", rules));
    expect(applyGuess(s, "cambrian", rules)).toEqual({ ok: false, reason: "repeat" });
  });

  it("rejects answers outside the category, including eras like Paleozoic", () => {
    expect(applyGuess(start(), "paleozoic", rules)).toEqual({ ok: false, reason: "invalid" });
    expect(applyGuess(start(), "1920s", rules)).toEqual({ ok: false, reason: "invalid" });
    expect(applyGuess(start(), "Carboniferous", rules)).toEqual({ ok: false, reason: "invalid" }); // labels aren't ids
  });

  it("a wrong sixth guess fails the round at 0 points", () => {
    let s = start();
    for (const id of ["cambrian", "ordovician", "silurian", "devonian", "permian"]) s = must(applyGuess(s, id, rules));
    expect(s.clue).toBe(6);
    expect(displayScore(s)).toBe(10);
    const r = applyGuess(s, "triassic", rules);
    expect(r.ok && r.outcome).toBe("failed");
    const end = must(r);
    expect(end.status).toBe("failed");
    expect(end.score).toBe(0);
    expect(displayScore(end)).toBe(0);
  });

  it("a completed game cannot be played again", () => {
    const solved = must(applyGuess(start(), "carboniferous", rules));
    expect(applyGuess(solved, "cambrian", rules)).toEqual({ ok: false, reason: "finished" });
    expect(applySkip(solved)).toEqual({ ok: false, reason: "finished" });
  });

  it("builds a spoiler-free share line", () => {
    const s = must(applyGuess(must(applyGuess(start(), "cambrian", rules)), "carboniferous", rules));
    expect(shareText(s, 14)).toBe("WHEN AM I? #014 · 🟨🟩⬜⬜⬜⬜ · 80/100");
    expect(shareText(s, 14)).not.toMatch(/carbon/i);
  });
});
