/* Build-time content check: `npm run validate` (also runs before `npm run build`). */
import { readFileSync } from "node:fs";
import path from "node:path";
import { validateContent } from "../src/lib/content/validate";

const dataDir = path.resolve(__dirname, "..", "data");
const read = (name: string) => JSON.parse(readFileSync(path.join(dataDir, name), "utf8"));

const categories = read("categories.json");
const scenarios = read("scenarios.json");
const schedule = read("schedule.json");

const errors = validateContent(categories, scenarios, schedule);
if (errors.length) {
  console.error(`✖ Content validation failed (${errors.length}):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

console.log(
  `✔ Content valid: ${categories.categories.length} categories, ${scenarios.scenarios.length} scenarios, ` +
    `${schedule.entries.length} scheduled dates, fallback "${schedule.fallback}".`,
);
if (schedule.fallback === "demo-rotation") {
  console.log("  ⚠ Demo rotation is on: unscheduled days repeat the fixtures. Set fallback to \"none\" for production.");
}
