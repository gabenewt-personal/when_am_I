import type { Category, CategoryOption } from "./content/types";
import { normalize, singular } from "./text";

/**
 * Autocomplete over ONE category's complete option list.
 * - tolerant to case, accents, punctuation, simple plurals and defined aliases
 * - results stay in the category's canonical order (chronological), so ranking
 *   never depends on — and never hints at — the correct answer
 * - an empty query returns the whole list (the full pool is always visible)
 */
export interface Suggestion {
  option: CategoryOption;
  /** Alias that matched, if the match wasn't on the label (shown as a hint). */
  matchedAlias?: string;
}

function terms(o: CategoryOption): { text: string; alias?: string }[] {
  return [{ text: o.label }, ...o.aliases.map((a) => ({ text: a, alias: a }))];
}

function matches(term: string, query: string): boolean {
  const t = normalize(term);
  if (t.includes(query)) return true;
  const ts = singular(t);
  const qs = singular(query);
  if (ts.includes(qs)) return true;
  // word-prefix match: "roar twen" -> "roaring twenties"
  const words = ts.split(" ");
  const qWords = qs.split(" ");
  return qWords.every((q) => words.some((w) => w.startsWith(q)));
}

export function suggest(category: Category, rawQuery: string): Suggestion[] {
  const query = normalize(rawQuery);
  if (!query) return category.options.map((option) => ({ option }));
  const out: Suggestion[] = [];
  for (const option of category.options) {
    const hit = terms(option).find((t) => matches(t.text, query));
    if (hit) out.push({ option, matchedAlias: hit.alias });
  }
  return out;
}

/** Exact resolution of typed text to an option (label or alias), or null. Used only to
 *  auto-highlight; a guess still requires an explicit selection. */
export function exactOption(category: Category, rawQuery: string): CategoryOption | null {
  const q = singular(normalize(rawQuery));
  if (!q) return null;
  return category.options.find((o) => terms(o).some((t) => singular(normalize(t.text)) === q)) ?? null;
}
