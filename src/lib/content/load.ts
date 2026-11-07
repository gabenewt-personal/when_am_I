import "server-only";
import { createHash } from "node:crypto";
import categoriesJson from "../../../data/categories.json";
import scenariosJson from "../../../data/scenarios.json";
import scheduleJson from "../../../data/schedule.json";
import { ART_ASSIGNMENTS } from "../../art/assignments";
import { seal } from "./seal";
import type { CategoriesFile, PublicContent, ScenariosFile, ScheduleFile } from "./types";
import { validateContent } from "./validate";

export function publicIdFor(scenarioId: string): string {
  return `m${createHash("sha256").update(`when-am-i:${scenarioId}`).digest("hex").slice(0, 11)}`;
}

/**
 * Server/build-time loader. Validates the JSON content and produces the
 * player-facing payload:
 *  - editor-only fields (contextForEditor, visualBrief) are stripped
 *  - descriptive scenario ids are replaced with opaque ids (schedule too)
 *  - post-solve fields (answer, title, epilogue, sources) are sealed
 */
export function loadPublicContent(): PublicContent {
  const categories = categoriesJson as CategoriesFile;
  const scenarios = scenariosJson as ScenariosFile;
  const schedule = scheduleJson as ScheduleFile;

  const errors = validateContent(categories, scenarios, schedule);
  for (const id of Object.keys(ART_ASSIGNMENTS)) {
    if (!scenarios.scenarios.some((s) => s.id === id)) errors.push(`art assignment for unknown scenario "${id}"`);
  }
  if (errors.length) {
    throw new Error(`Content validation failed:\n  - ${errors.join("\n  - ")}`);
  }

  const contentVersion = createHash("sha256")
    .update(JSON.stringify([categories, scenarios, schedule]))
    .digest("hex")
    .slice(0, 10);

  return {
    contentVersion,
    demo: scenarios.demo === true || schedule.fallback === "demo-rotation",
    categories: categories.categories,
    scenarios: scenarios.scenarios.map((s) => {
      const id = publicIdFor(s.id);
      return {
        id,
        artId: ART_ASSIGNMENTS[s.id] ?? null,
        categoryId: s.categoryId,
        clues: s.clues,
        sealed: seal(id, {
          scenarioId: s.id,
          answerId: s.answerId,
          sceneTitle: s.sceneTitle,
          epilogue: s.epilogue,
          sourceUrls: s.sourceUrls,
        }),
      };
    }),
    schedule: {
      ...schedule,
      notes: undefined,
      demoRotation: schedule.demoRotation.map(publicIdFor),
      entries: schedule.entries.map((e) => ({ date: e.date, scenarioId: publicIdFor(e.scenarioId) })),
    },
  };
}
