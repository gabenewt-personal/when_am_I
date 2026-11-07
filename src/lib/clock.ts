"use client";
import { useSyncExternalStore } from "react";

/**
 * A shared, coarse wall clock. Ticks every 15s and whenever the tab becomes
 * visible again, so a UTC rollover in an open (or backgrounded) tab is noticed.
 * Returns 0 during server render / hydration.
 */
let now = 0;
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | null = null;

function tick() {
  now = Date.now();
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1) {
    now = Date.now();
    timer = setInterval(tick, 15_000);
    document.addEventListener("visibilitychange", tick);
    window.addEventListener("focus", tick);
    queueMicrotask(tick);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      if (timer) clearInterval(timer);
      document.removeEventListener("visibilitychange", tick);
      window.removeEventListener("focus", tick);
    }
  };
}

export function useNow(): number {
  return useSyncExternalStore(
    subscribe,
    () => now || (now = Date.now()),
    () => 0,
  );
}
