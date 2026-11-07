import { describe, expect, it } from "vitest";
import { validateContent } from "@/lib/content/validate";
import { earthClock, timelineModel } from "@/lib/timeline";
import { scrollDeltaToShow } from "@/lib/viewport";
import { categories, category, scenarios, schedule } from "./helpers";

const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v));

describe("discovery timeline", () => {
  const geo = category("geologic-periods");
  const decades = category("us-history-decades");

  it("places geologic periods proportionally inside Earth's history", () => {
    const m = timelineModel(geo, "jurassic")!;
    expect(m.kind).toBe("deep-time");
    expect(m.range).toBe("201.4–145 million years ago");
    const total = m.segments.reduce((n, s) => n + s.width, 0);
    expect(total).toBeCloseTo(100, 6);
    expect(m.segments.filter((s) => s.isAnswer).map((s) => s.id)).toEqual(["jurassic"]);
    // the Phanerozoic is the last ~12% of Earth's history; the Jurassic sits near the very end
    expect(m.overview!.spanLeft).toBeGreaterThan(87);
    expect(m.overview!.spanLeft).toBeLessThan(89);
    expect(m.overview!.marker).toBeGreaterThan(96);
    expect(m.groups.map((g) => g.label)).toEqual(["Paleozoic", "Mesozoic", "Cenozoic"]);
  });

  it("handles the period that runs to the present", () => {
    expect(timelineModel(geo, "quaternary")!.range).toBe("2.58 million years ago – today");
  });

  it("lays decades out as equal cells", () => {
    const m = timelineModel(decades, "1920s")!;
    expect(m.range).toBe("1920–1929");
    expect(m.answer.left).toBeCloseTo((2 / 13) * 100, 6);
    expect(m.answer.width).toBeCloseTo(100 / 13, 6);
    expect(m.overview).toBeUndefined();
  });

  it("maps deep time onto a 24-hour clock", () => {
    expect(earthClock(4567)).toBe("12:00 AM");
    expect(earthClock(201.4)).toBe("10:56 PM");
  });

  it("validation catches gaps and missing spans", () => {
    const cats = clone(categories);
    cats.categories[0].options[2].start = 440;
    delete cats.categories[1].options[4].end;
    const errors = validateContent(cats, scenarios, schedule).join("\n");
    expect(errors).toMatch(/gap or overlap between "ordovician" and "silurian"/);
    expect(errors).toMatch(/"1940s" needs numeric start and end/);
  });
});

describe("mobile scrolling", () => {
  const view = { top: 0, height: 600 };

  it("does nothing when the clue and answer field are already visible", () => {
    expect(scrollDeltaToShow(100, 500, view)).toBe(0);
  });

  it("aligns the answer field to the bottom when everything fits", () => {
    // clue at 400, form ending at 900: scroll so the form's bottom is 12px above the fold
    expect(scrollDeltaToShow(400, 900, view)).toBe(900 - 588);
  });

  it("puts the clue at the top when the block is taller than the screen", () => {
    expect(scrollDeltaToShow(400, 1200, view)).toBe(400 - 12);
  });

  it("measures against the visual viewport while a keyboard is open", () => {
    expect(scrollDeltaToShow(100, 300, { top: 200, height: 300 })).toBe(100 - 212);
  });
});
