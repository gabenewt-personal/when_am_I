import { normalize } from "../text";
import { isValidDateKey } from "../schedule";
import type { CategoriesFile, Category, ScenariosFile, ScheduleFile } from "./types";

export const CLUE_COUNT = 6;

/**
 * Validate all content. Returns a list of human-readable problems (empty = valid).
 * Runs at build time (scripts/validate-content.ts, and again when the page is
 * statically rendered) and in tests.
 */
export function validateContent(
  categoriesFile: CategoriesFile,
  scenariosFile: ScenariosFile,
  schedule: ScheduleFile,
): string[] {
  const errors: string[] = [];
  const err = (msg: string) => errors.push(msg);
  const nonEmpty = (v: unknown) => typeof v === "string" && v.trim().length > 0;

  // ---- categories ----
  if (!Array.isArray(categoriesFile?.categories) || categoriesFile.categories.length === 0) {
    err("categories.json: no categories");
    return errors;
  }
  const categoryIds = new Set<string>();
  const optionIdsByCategory = new Map<string, Set<string>>();
  for (const c of categoriesFile.categories) {
    const where = `category "${c.id}"`;
    if (!nonEmpty(c.id)) err("category with empty id");
    if (categoryIds.has(c.id)) err(`${where}: duplicate category id`);
    categoryIds.add(c.id);
    if (!nonEmpty(c.label)) err(`${where}: missing label`);
    if (c.mode !== "when" && c.mode !== "where") err(`${where}: mode must be "when" or "where"`);
    if (!Array.isArray(c.options) || c.options.length < 2) {
      err(`${where}: needs at least two options`);
      continue;
    }
    const ids = new Set<string>();
    // every searchable term (label or alias) must point at exactly one option
    const termOwner = new Map<string, string>();
    for (const o of c.options) {
      if (!nonEmpty(o.id)) err(`${where}: option with empty id`);
      if (ids.has(o.id)) err(`${where}: duplicate option id "${o.id}"`);
      ids.add(o.id);
      if (!nonEmpty(o.label)) err(`${where}: option "${o.id}" missing label`);
      if (!Array.isArray(o.aliases)) err(`${where}: option "${o.id}" aliases must be an array`);
      for (const term of [o.label, ...(o.aliases ?? [])]) {
        const n = normalize(term ?? "");
        if (!n) {
          err(`${where}: option "${o.id}" has an empty label/alias`);
          continue;
        }
        const owner = termOwner.get(n);
        if (owner && owner !== o.id) err(`${where}: term "${term}" is used by both "${owner}" and "${o.id}"`);
        termOwner.set(n, o.id);
      }
    }
    optionIdsByCategory.set(c.id, ids);
    if (c.timeline) validateTimeline(c, err);
  }

  // ---- scenarios ----
  const scenarioIds = new Set<string>();
  if (!Array.isArray(scenariosFile?.scenarios) || scenariosFile.scenarios.length === 0) {
    err("scenarios.json: no scenarios");
    return errors;
  }
  for (const s of scenariosFile.scenarios) {
    const where = `scenario "${s.id}"`;
    if (!nonEmpty(s.id)) err("scenario with empty id");
    if (scenarioIds.has(s.id)) err(`${where}: duplicate scenario id`);
    scenarioIds.add(s.id);
    const options = optionIdsByCategory.get(s.categoryId);
    if (!options) err(`${where}: unknown categoryId "${s.categoryId}"`);
    else if (!options.has(s.answerId)) err(`${where}: answerId "${s.answerId}" is not an option in "${s.categoryId}"`);
    if (!Array.isArray(s.clues) || s.clues.length !== CLUE_COUNT) {
      err(`${where}: must have exactly ${CLUE_COUNT} clues (has ${Array.isArray(s.clues) ? s.clues.length : 0})`);
    } else {
      s.clues.forEach((clue, i) => {
        if (!nonEmpty(clue)) err(`${where}: clue ${i + 1} is empty`);
      });
    }
    if (!nonEmpty(s.sceneTitle)) err(`${where}: missing sceneTitle`);
    if (!nonEmpty(s.epilogue)) err(`${where}: missing epilogue`);
    if (!nonEmpty(s.contextForEditor)) err(`${where}: missing contextForEditor`);
    if (!Array.isArray(s.sourceUrls) || s.sourceUrls.length === 0) {
      err(`${where}: needs at least one source URL for fact-checking`);
    } else {
      for (const u of s.sourceUrls) {
        try {
          const url = new URL(u);
          if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error();
        } catch {
          err(`${where}: invalid source URL "${u}"`);
        }
      }
    }
  }

  // ---- schedule ----
  if (!isValidDateKey(schedule?.epoch)) err(`schedule.json: invalid epoch "${schedule?.epoch}"`);
  if (schedule.fallback !== "demo-rotation" && schedule.fallback !== "none") {
    err(`schedule.json: fallback must be "demo-rotation" or "none"`);
  }
  if (!Array.isArray(schedule.demoRotation)) err("schedule.json: demoRotation must be an array");
  else {
    if (schedule.fallback === "demo-rotation" && schedule.demoRotation.length === 0) {
      err("schedule.json: demo-rotation fallback needs at least one scenario");
    }
    for (const id of schedule.demoRotation) {
      if (!scenarioIds.has(id)) err(`schedule.json: demoRotation references unknown scenario "${id}"`);
    }
  }
  const seenDates = new Set<string>();
  for (const e of schedule.entries ?? []) {
    if (!isValidDateKey(e.date)) err(`schedule.json: invalid date "${e.date}"`);
    else if (isValidDateKey(schedule.epoch) && e.date < schedule.epoch) err(`schedule.json: ${e.date} is before the epoch`);
    if (seenDates.has(e.date)) err(`schedule.json: ${e.date} is scheduled twice`);
    seenDates.add(e.date);
    if (!scenarioIds.has(e.scenarioId)) err(`schedule.json: ${e.date} references unknown scenario "${e.scenarioId}"`);
  }

  return errors;
}

/** Timeline spans must be numeric, run in one direction (older first) and leave no gaps or overlaps. */
function validateTimeline(c: Category, err: (msg: string) => void) {
  const where = `category "${c.id}" timeline`;
  const t = c.timeline!;
  if (t.kind !== "deep-time" && t.kind !== "decades") err(`${where}: kind must be "deep-time" or "decades"`);
  // deep time counts down (Ma before present); calendar years count up
  const forward = t.kind === "decades";
  const ordered = (a: number, b: number) => (forward ? a < b : a > b);
  const isNum = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);
  c.options.forEach((o, i) => {
    if (!isNum(o.start) || !isNum(o.end)) {
      err(`${where}: option "${o.id}" needs numeric start and end`);
      return;
    }
    if (!ordered(o.start, o.end)) err(`${where}: option "${o.id}" span runs the wrong way`);
    const next = c.options[i + 1];
    if (next && isNum(next.start) && next.start !== o.end) err(`${where}: gap or overlap between "${o.id}" and "${next.id}"`);
  });
  for (const g of t.groups ?? []) {
    if (!nonEmptyStr(g.label) || !isNum(g.start) || !isNum(g.end) || !ordered(g.start, g.end)) {
      err(`${where}: invalid group "${g.label}"`);
    }
  }
}

const nonEmptyStr = (v: unknown) => typeof v === "string" && v.trim().length > 0;
