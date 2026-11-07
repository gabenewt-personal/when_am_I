import "server-only";

/**
 * Editorial scenario id -> neutral art key. Server/build-time only, so the browser
 * never sees a descriptive scenario id (e.g. "jurassic-river") next to its art.
 * Scenarios without an entry get the neutral placeholder landscape.
 */
export const ART_ASSIGNMENTS: Record<string, string> = {
  "carboniferous-swamp": "scene-01",
  "jazz-after-dark": "scene-02",
  "jurassic-river": "scene-03",
  "world-watches-moon": "scene-04",
  "devonian-shallows": "scene-05",
  "dust-on-windowsill": "scene-06",
  "last-dinosaur-forest": "scene-07",
};
