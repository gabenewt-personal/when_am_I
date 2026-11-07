"use client";

import { useCallback, useState } from "react";
import type { PublicContent } from "@/lib/content/types";
import { useNow } from "@/lib/clock";
import { pickScenario, utcDateKey, type DailyPick } from "@/lib/schedule";
import { Day } from "./Day";
import { DevPanel, loadDevOverride, saveDevOverride, type DevOverride } from "./DevPanel";
import { Shell } from "./Shell";

export const DEV_TOOLS = process.env.NODE_ENV === "development";

export function App({ content }: { content: PublicContent }) {
  const now = useNow();
  const [dev, setDevState] = useState<DevOverride>(() => (DEV_TOOLS ? loadDevOverride() : {}));
  const [resetNonce, setResetNonce] = useState(0);
  // While a round (or its results) is open, keep showing that day even if UTC rolls over.
  const [pinnedDate, setPinnedDate] = useState<string | null>(null);

  const setDev = useCallback((next: DevOverride) => {
    saveDevOverride(next);
    setDevState(next);
    setPinnedDate(null);
  }, []);

  if (!now) {
    // Static HTML shell before the client knows the date (avoids hydration mismatch).
    return (
      <Shell demo={content.demo}>
        <p className="boot label">Loading…</p>
      </Shell>
    );
  }

  const todayKey = (DEV_TOOLS && dev.dateKey) || utcDateKey(now);
  const dateKey = pinnedDate ?? todayKey;
  let pick: DailyPick | null = pickScenario(dateKey, content.schedule);
  if (DEV_TOOLS && dev.scenarioId && content.scenarios.some((s) => s.id === dev.scenarioId)) {
    pick = { dateKey, scenarioId: dev.scenarioId, puzzleNumber: pick?.puzzleNumber ?? 0, source: "scheduled" };
  }

  return (
    <Shell demo={content.demo}>
      {pinnedDate && pinnedDate !== todayKey && (
        <p className="banner" role="status">
          A new mystery has arrived. Finish here, then return home.
        </p>
      )}
      <Day
        key={`${dateKey}:${pick?.scenarioId ?? "none"}:${resetNonce}`}
        content={content}
        pick={pick}
        dateKey={dateKey}
        todayKey={todayKey}
        now={now}
        onPin={(on) => setPinnedDate(on ? dateKey : null)}
      />
      {DEV_TOOLS && (
        <DevPanel
          content={content}
          override={dev}
          onChange={setDev}
          dateKey={dateKey}
          pick={pick}
          onReset={() => {
            setPinnedDate(null);
            setResetNonce((n) => n + 1);
          }}
        />
      )}
    </Shell>
  );
}
