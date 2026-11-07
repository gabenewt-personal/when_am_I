import type { Category } from "./content/types";

/** Age of the Earth in millions of years (≈4.567 billion). */
export const EARTH_AGE_MA = 4567;

export interface Segment {
  id: string;
  label: string;
  /** Position and size as percentages of the strip. */
  left: number;
  width: number;
  isAnswer: boolean;
}

export interface TimelineModel {
  kind: "deep-time" | "decades";
  segments: Segment[];
  groups: Segment[];
  answer: Segment;
  /** e.g. "201.4–145 million years ago" or "1920–1929" */
  range: string;
  /** Deep time only: where the category's whole span sits inside Earth's history. */
  overview?: { spanLeft: number; marker: number; clock: string };
  startLabel: string;
  endLabel: string;
}

const fmtMa = (ma: number) => (ma >= 100 ? String(Math.round(ma * 10) / 10) : String(Math.round(ma * 100) / 100));

/** "11:04 PM" — when this began if all of Earth's history were squeezed into one day. */
export function earthClock(ma: number): string {
  const minutes = Math.round((1 - ma / EARTH_AGE_MA) * 24 * 60);
  const h24 = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${h24 < 12 ? "AM" : "PM"}`;
}

/**
 * Lay out a category's options as a proportional strip and mark the answer.
 * Returns null when the category has no timeline data (the reveal just skips it).
 */
export function timelineModel(category: Category, answerId: string): TimelineModel | null {
  const t = category.timeline;
  const opts = category.options;
  if (!t || opts.some((o) => typeof o.start !== "number" || typeof o.end !== "number")) return null;

  const first = opts[0].start!;
  const last = opts[opts.length - 1].end!;
  const total = Math.abs(last - first);
  const pos = (v: number) => (Math.abs(v - first) / total) * 100;
  const seg = (id: string, label: string, s: number, e: number): Segment => ({
    id,
    label,
    left: pos(s),
    width: pos(e) - pos(s),
    isAnswer: id === answerId,
  });

  const segments = opts.map((o) => seg(o.id, o.label, o.start!, o.end!));
  const answer = segments.find((s) => s.isAnswer);
  if (!answer) return null;
  const a = opts.find((o) => o.id === answerId)!;
  const groups = (t.groups ?? []).map((g) => ({ ...seg(g.label, g.label, g.start, g.end), isAnswer: false }));

  if (t.kind === "deep-time") {
    const mid = (a.start! + a.end!) / 2;
    return {
      kind: "deep-time",
      segments,
      groups,
      answer,
      range: a.end === 0 ? `${fmtMa(a.start!)} million years ago – today` : `${fmtMa(a.start!)}–${fmtMa(a.end!)} million years ago`,
      overview: {
        spanLeft: ((EARTH_AGE_MA - first) / EARTH_AGE_MA) * 100,
        marker: ((EARTH_AGE_MA - mid) / EARTH_AGE_MA) * 100,
        clock: earthClock(a.start!),
      },
      startLabel: `${Math.round(first)} Ma`,
      endLabel: last === 0 ? "Today" : `${fmtMa(last)} Ma`,
    };
  }

  return {
    kind: "decades",
    segments,
    groups,
    answer,
    range: `${a.start}–${a.end! - 1}`,
    startLabel: String(first),
    endLabel: String(last - 1),
  };
}
