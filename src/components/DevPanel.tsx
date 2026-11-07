"use client";

import type { PublicContent } from "@/lib/content/types";
import { unseal } from "@/lib/content/seal";
import { browserStorage, clearGame } from "@/lib/persistence";
import { addDays, formatPuzzleNumber, isValidDateKey, type DailyPick } from "@/lib/schedule";

/**
 * DEVELOPMENT ONLY. Rendered behind `process.env.NODE_ENV === "development"`, which
 * Next.js inlines at build time, so production bundles drop this panel entirely.
 */
export interface DevOverride {
  dateKey?: string;
  scenarioId?: string;
}

const KEY = "whenami:dev-override";

export function loadDevOverride(): DevOverride {
  if (typeof window === "undefined") return {};
  try {
    const v = JSON.parse(window.localStorage.getItem(KEY) ?? "{}");
    return {
      dateKey: isValidDateKey(v.dateKey) ? v.dateKey : undefined,
      scenarioId: typeof v.scenarioId === "string" ? v.scenarioId : undefined,
    };
  } catch {
    return {};
  }
}

export function saveDevOverride(o: DevOverride) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(o));
  } catch {
    /* ignore */
  }
}

export function DevPanel({
  content,
  override,
  onChange,
  dateKey,
  pick,
  onReset,
}: {
  content: PublicContent;
  override: DevOverride;
  onChange: (o: DevOverride) => void;
  dateKey: string;
  pick: DailyPick | null;
  onReset: () => void;
}) {
  return (
    <details className="dev">
      <summary className="label">Dev tools (not in production)</summary>
      <div className="dev__body">
        <p className="dev__row">
          Playing <b>{dateKey}</b> · {pick ? `${formatPuzzleNumber(pick.puzzleNumber)} · ${pick.scenarioId}` : "nothing scheduled"}
        </p>
        <label className="dev__row">
          Date (UTC)
          <input
            type="date"
            value={override.dateKey ?? ""}
            onChange={(e) => onChange({ ...override, dateKey: isValidDateKey(e.target.value) ? e.target.value : undefined })}
          />
        </label>
        <div className="dev__row">
          <button className="btn btn--small" type="button" onClick={() => onChange({ ...override, dateKey: addDays(dateKey, -1) })}>
            ◀ Day
          </button>
          <button className="btn btn--small" type="button" onClick={() => onChange({ ...override, dateKey: addDays(dateKey, 1) })}>
            Day ▶
          </button>
        </div>
        <label className="dev__row">
          Scenario
          <select
            value={override.scenarioId ?? ""}
            onChange={(e) => onChange({ ...override, scenarioId: e.target.value || undefined })}
          >
            <option value="">(use schedule)</option>
            {content.scenarios.map((s) => (
              <option key={s.id} value={s.id}>
                {unseal(s.id, s.sealed).scenarioId}
              </option>
            ))}
          </select>
        </label>
        <div className="dev__row">
          <button
            className="btn btn--small"
            type="button"
            disabled={!pick}
            onClick={() => {
              if (pick) clearGame(browserStorage(), dateKey, pick.scenarioId);
              onReset();
            }}
          >
            Reset this day
          </button>
          <button className="btn btn--small" type="button" onClick={() => onChange({})}>
            Clear overrides
          </button>
        </div>
      </div>
    </details>
  );
}
