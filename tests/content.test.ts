import { describe, expect, it } from "vitest";
import { seal, unseal } from "@/lib/content/seal";
import { validateContent } from "@/lib/content/validate";
import { exactOption, suggest } from "@/lib/search";
import { addDays, nextResetAt, pickScenario, utcDateKey } from "@/lib/schedule";
import { categories, category, scenario, scenarios, schedule } from "./helpers";

const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v));

describe("content validation", () => {
  it("seed content is valid", () => {
    expect(validateContent(categories, scenarios, schedule)).toEqual([]);
  });

  it("catches broken scenarios and schedules", () => {
    const sc = clone(scenarios);
    sc.scenarios[0].clues.pop();
    sc.scenarios[1].answerId = "paleozoic";
    sc.scenarios[2].categoryId = "nope";
    sc.scenarios[3].epilogue = " ";
    sc.scenarios[4].id = sc.scenarios[5].id;
    sc.scenarios[6].clues[2] = "";
    const sched = clone(schedule);
    sched.entries = [
      { date: "2026-02-30", scenarioId: "jazz-after-dark" },
      { date: "2026-12-01", scenarioId: "missing" },
      { date: "2026-12-01", scenarioId: "jazz-after-dark" },
    ];
    const errors = validateContent(categories, sc, sched).join("\n");
    expect(errors).toMatch(/exactly 6 clues/);
    expect(errors).toMatch(/answerId "paleozoic"/);
    expect(errors).toMatch(/unknown categoryId/);
    expect(errors).toMatch(/missing epilogue/);
    expect(errors).toMatch(/duplicate scenario id/);
    expect(errors).toMatch(/clue 3 is empty/);
    expect(errors).toMatch(/invalid date "2026-02-30"/);
    expect(errors).toMatch(/unknown scenario "missing"/);
    expect(errors).toMatch(/scheduled twice/);
  });

  it("rejects colliding aliases", () => {
    const cats = clone(categories);
    cats.categories[1].options[0].aliases.push("Roaring Twenties!");
    expect(validateContent(cats, scenarios, schedule).join()).toMatch(/used by both/);
  });

  it("seals revelations so answers aren't in plain text", () => {
    const s = scenario("carboniferous-swamp");
    const sealed = seal(s.id, { scenarioId: s.id, answerId: s.answerId, sceneTitle: s.sceneTitle, epilogue: s.epilogue, sourceUrls: s.sourceUrls });
    expect(sealed).not.toMatch(/carbon/i);
    expect(unseal(s.id, sealed).answerId).toBe("carboniferous");
    expect(unseal(s.id, sealed).epilogue).toBe(s.epilogue); // unicode-safe round trip
  });
});

describe("autocomplete", () => {
  const geo = category("geologic-periods");
  const decades = category("us-history-decades");
  const ids = (q: string, c = geo) => suggest(c, q).map((x) => x.option.id);

  it("empty query lists the entire category in canonical order", () => {
    expect(ids("")).toEqual(geo.options.map((o) => o.id));
  });

  it("is tolerant of case, accents, punctuation and spacing", () => {
    expect(ids("CARBON")).toEqual(["carboniferous"]);
    expect(ids("  crétacé ")).toEqual(["cretaceous"]);
    expect(ids("jurassic!")).toEqual(["jurassic"]);
    expect(ids("1920's", decades)).toEqual(["1920s"]);
    expect(ids("1920", decades)).toEqual(["1920s"]);
  });

  it("matches defined aliases", () => {
    expect(ids("roaring", decades)).toEqual(["1920s"]);
    expect(ids("roar twen", decades)).toEqual(["1920s"]);
    expect(ids("nineteen sixties", decades)).toEqual(["1960s"]);
    expect(exactOption(decades, "Roaring Twenties")?.id).toBe("1920s");
  });

  it("never offers eras or epochs as geologic periods", () => {
    expect(ids("paleozoic")).toEqual([]);
    expect(ids("holocene")).toEqual([]);
    expect(ids("cold war", decades)).toEqual([]);
  });

  it("selected category suggestions never mix other categories", () => {
    const geoIds = new Set(geo.options.map((o) => o.id));
    const decadeIds = new Set(decades.options.map((o) => o.id));
    for (const q of ["", "1", "19", "s", "an", "c", "1920", "jur", "e"]) {
      for (const s of suggest(geo, q)) expect(geoIds.has(s.option.id)).toBe(true);
      for (const s of suggest(decades, q)) expect(decadeIds.has(s.option.id)).toBe(true);
    }
    expect(ids("1920")).toEqual([]);
  });
});

describe("daily schedule", () => {
  it("derives the day from UTC, not local time", () => {
    expect(utcDateKey(new Date("2026-11-07T23:59:59Z"))).toBe("2026-11-07");
    expect(utcDateKey(new Date("2026-11-08T00:00:00Z"))).toBe("2026-11-08");
    expect(utcDateKey(new Date("2026-11-07T18:30:00-08:00"))).toBe("2026-11-08");
    expect(nextResetAt(new Date("2026-11-07T12:00:00Z")).toISOString()).toBe("2026-11-08T00:00:00.000Z");
    expect(nextResetAt(new Date("2026-11-08T00:00:00Z")).toISOString()).toBe("2026-11-09T00:00:00.000Z");
  });

  it("a day change uses a new scenario", () => {
    const a = pickScenario("2026-11-07", schedule)!;
    const b = pickScenario(addDays("2026-11-07", 1), schedule)!;
    expect(a.scenarioId).not.toBe(b.scenarioId);
    expect(b.puzzleNumber).toBe(a.puzzleNumber + 1);
  });

  it("numbers puzzles from the epoch and returns nothing before it", () => {
    expect(pickScenario(schedule.epoch, schedule)?.puzzleNumber).toBe(1);
    expect(pickScenario(addDays(schedule.epoch, -1), schedule)).toBeNull();
  });

  it("explicit entries win; 'none' fallback leaves gaps empty instead of repeating", () => {
    const sched = clone(schedule);
    sched.entries = [{ date: "2026-11-20", scenarioId: "jazz-after-dark" }];
    sched.fallback = "none";
    expect(pickScenario("2026-11-20", sched)).toMatchObject({ scenarioId: "jazz-after-dark", source: "scheduled" });
    expect(pickScenario("2026-11-21", sched)).toBeNull();
  });
});
