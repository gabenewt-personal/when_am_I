/** Content schema. JSON files in /data are the source of truth; these types describe them. */

export type CategoryMode = "when" | "where";

export interface CategoryOption {
  id: string;
  label: string;
  aliases: string[];
}

export interface Category {
  id: string;
  label: string;
  mode: CategoryMode;
  subtitle: string;
  options: CategoryOption[];
}

export interface CategoriesFile {
  schemaVersion: number;
  categories: Category[];
}

export interface Scenario {
  id: string;
  categoryId: string;
  answerId: string;
  sceneTitle: string;
  /** Editor-only anchor (place / time). Never shipped to the client. */
  contextForEditor: string;
  clues: string[];
  epilogue: string;
  /** Editor-only art direction. Never shipped to the client. */
  visualBrief?: string;
  sourceUrls: string[];
}

export interface ScenariosFile {
  schemaVersion: number;
  demo?: boolean;
  notes?: string;
  scenarios: Scenario[];
}

export interface ScheduleEntry {
  date: string; // YYYY-MM-DD (UTC calendar date)
  scenarioId: string;
}

export interface ScheduleFile {
  schemaVersion: number;
  notes?: string;
  /** Puzzle #001 is this UTC date. */
  epoch: string;
  /** What to do on a date with no explicit entry. */
  fallback: "demo-rotation" | "none";
  demoRotation: string[];
  entries: ScheduleEntry[];
}

/** Post-solve information. Shipped to the client only in sealed (obfuscated) form. */
export interface Revelation {
  /** Editorial scenario id (for dev tools / debugging only). */
  scenarioId: string;
  answerId: string;
  sceneTitle: string;
  epilogue: string;
  sourceUrls: string[];
}

/** What the browser receives for each scenario: clues + a sealed revelation. No editor fields. */
export interface PublicScenario {
  /** Opaque id (hash of the editorial id) so descriptive ids never reach the browser. */
  id: string;
  /** Neutral art key, or null for the placeholder. */
  artId: string | null;
  categoryId: string;
  clues: string[];
  sealed: string;
}

export interface PublicContent {
  contentVersion: string;
  demo: boolean;
  categories: Category[];
  scenarios: PublicScenario[];
  schedule: ScheduleFile;
}
