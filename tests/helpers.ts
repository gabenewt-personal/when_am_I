import categoriesJson from "../data/categories.json";
import scenariosJson from "../data/scenarios.json";
import scheduleJson from "../data/schedule.json";
import type { CategoriesFile, ScenariosFile, ScheduleFile } from "@/lib/content/types";
import type { Rules } from "@/lib/game";
import type { StorageLike } from "@/lib/persistence";

export const categories = categoriesJson as CategoriesFile;
export const scenarios = scenariosJson as ScenariosFile;
export const schedule = scheduleJson as ScheduleFile;

export function category(id: string) {
  const c = categories.categories.find((x) => x.id === id);
  if (!c) throw new Error(`no category ${id}`);
  return c;
}

export function scenario(id: string) {
  const s = scenarios.scenarios.find((x) => x.id === id);
  if (!s) throw new Error(`no scenario ${id}`);
  return s;
}

export function rulesFor(scenarioId: string): Rules {
  const s = scenario(scenarioId);
  return { answerId: s.answerId, validIds: new Set(category(s.categoryId).options.map((o) => o.id)) };
}

export class MemoryStorage implements StorageLike {
  map = new Map<string, string>();
  getItem(k: string) {
    return this.map.has(k) ? this.map.get(k)! : null;
  }
  setItem(k: string, v: string) {
    this.map.set(k, v);
  }
  removeItem(k: string) {
    this.map.delete(k);
  }
}
