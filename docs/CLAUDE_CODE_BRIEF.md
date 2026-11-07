# WHEN AM I? — Claude Code prototype brief

Build a **working, mobile-first daily narrative deduction game** called **When Am I?** using the attached seed content. The mood is literary, mysterious, exploratory, and quietly playful. A player wakes in an unfamiliar period of Earth's or human history and identifies **when** they are by reading six progressively revealed fragments.

Important: **Build the playable application, not a mockup.** Preserve the exact clue text in `data/scenarios.json` initially; do not regenerate or embellish the writing. The JSON files are the content source of truth. Work autonomously, make reasonable implementation choices, run checks, and provide launch instructions.

## Guiding experience

- One daily mystery. Each day has an explicit answer **category**, such as `Geologic Periods` or `Decades of U.S. History`, announced **before** the first clue.
- Start with only clue 1. Each clue is a 1–2 sentence continuation of the same second-person, present-tense scene. Previously revealed clues remain visible in sequence.
- Prompt: "When am I?" Search and **select** one answer from the complete category-specific autocomplete list. Suggestions filter from `data/categories.json`, not from the correct answer or the clues.
- On an incorrect selected answer, record the guess, show restrained feedback ("Not quite. The world offers another clue."), reveal the next clue automatically, and reduce the available score. No factual correction or explanation until after the mystery.
- `Reveal next clue` does the same without recording an incorrect guess. One guess per clue. Disallow repeat answers.
- On a correct answer, stop the game and show score, scene name, brief researched epilogue and previous guesses. At clue 6, an incorrect answer ends the challenge with **0 points** and reveals the correct answer and epilogue.
- No timer or speed bonus. No accounts, advertising, purchases, leaderboard, AI calls, or real-time generation in v1.

## Point schedule

| Correct with | Points |
|---|---:|
| Clue 1 | 100 |
| Clue 2 | 80 |
| Clue 3 | 60 |
| Clue 4 | 40 |
| Clue 5 | 20 |
| Clue 6 | 10 |

Incorrect or skipped clue: proceed to the next clue and update the available score. Do not subtract points from a completed score. `Score` on screen means **points still available** until solved. All answers must be chosen from autocomplete. Do not accept arbitrary submitted text, even if it resembles the answer.

## Content and categories

- Load and validate `data/categories.json` and `data/scenarios.json` at build time.
- Every scenario has one category ID, canonical answer ID, six narrative clues, an epilogue, a location/time anchor (editor-only), an optional art direction, and references for fact-checking.
- The category options form the **entire valid answer list**, not just the correct options for featured scenes. Make search tolerant to case, punctuation, accent, singular/plural common title variations and defined aliases. Display canonical labels; store IDs.
- Geologic periods should not be confused with eras or epochs. `Carboniferous` is correct; `Paleozoic` is not a valid entry in the geologic-period category.
- Decades of U.S. History use exact decades (e.g., `1920s`), not broad eras such as `Cold War` or `Victorian era`. Future modes may include separate, precisely curated categories for eras, civilizations, events, national parks or monuments.
- Do not allow spoilers via image assets, labels, metadata, URL, or autocomplete emphasis. The full category list is visible to every player but the correct answer is not highlighted.
- Preserve the hand-authored narrative word-for-word, including when repeated clues render as separate paragraphs. Use the supplied sources for an editor review workflow, not as player-facing pre-solve hints.

## Daily scheduling and development

- Use a **single documented global UTC reset** for the daily challenge. Show next reset in the user's local timezone, labeled correctly.
- Demo fixtures: seven scenes in `scenarios.json`. Provide a dev-only scenario selector to test any day and reset its demo state. Never display the dev controls in production.
- A demo may rotate these seven fixtures for development, but do not silently pretend seven scenes support an endless production launch. Design a date-to-scenario manifest so newly authored scenarios can be scheduled later without rewriting code. Display `Demo edition` when applicable.
- Persist current daily scenario ID, selected clue, consumed guesses/skips, score, solved/failed outcome, and completion status in localStorage; refresh and browser reopening should preserve state and should **never** restore spent points or allow a second attempt.
- Distinguish the scenario content version and daily date in storage keys. Handle UTC date rollover during an open tab, offline loads and malformed old storage gracefully. Use the same date derivation for manifest selection and persistence.

## Visual direction

**The previously built Rare Encounter Pokémon game is the design benchmark.** Match its approachable, nostalgic, Game Boy/GBA-style 8-bit arcade visual DNA: forest-green and cream palette, warm gold highlights, thick pixel borders, crisp sprite-style environmental illustrations, boxy menus, compact mobile game-screen proportions, pixel type for menus and counters, and simple quick reveal animations. Do not redesign this into a generic modern dashboard or a formal historical website. The mystery should be atmospheric, but the interface should be playful, tactile, clear, and approachable. For longer second-person prose, prioritize comfortable mobile reading (a highly legible complementary text font is acceptable). Use original design elements rather than copying proprietary Pokémon artwork or game screens. Avoid glassmorphism, glossy gradients, and superfluous effects. Respect reduced motion. Treat visual scene artwork as a *clue with spoiler controls*: an early scene must not show distinctive evidence before its corresponding narrative reveal.

Screen sequence:
1. **Home:** title, subtitle (`A daily mystery through time.`), today's category, start/resume/revisit results, brief How to Play, next reset and personal streak.
2. **Mystery:** category at top, clue number and remaining points; atmospheric landscape panel; growing narrative fragments; accessible searchable input with dropdown; selected guess, submit and voluntary reveal buttons; wrong-guess history.
3. **Discovery:** solved/failed result, score, all six clues optionally expandable, correct period/decade, factual epilogue, small source links, shareable spoiler-free outcome (e.g., `WHEN AM I? #014 · 🟩🟨⬜⬜⬜⬜ · 80/100`), and Return Home.

For the prototype, use **original CSS/SVG layered environments or neutral placeholders** rather than requiring image generation. The scene background can reveal more details or brighten as new clues appear, but it must not identify the answer before the corresponding textual clue. Keep artwork modular so commissioned pixel art can later replace it.

## Data provenance and content pipeline

Read `DATA_SOURCES.md` before implementing content ingestion. The bundled `data/categories.json` and `data/scenarios.json` are **the working local seed database for MVP**; no external API key or live data call is required to run this first version.

Treat three different kinds of information separately: (1) canonical, versioned answer lists (`categories.json`) for deterministic autocomplete; (2) historically/scientifically verified source notes and reference URLs; (3) original, editorially approved second-person narrative clues (`scenarios.json`). A historical API is not an automatic story generator. Do not call an LLM during player sessions or use a live API to validate a guess. Do not bulk-generate or silently publish new mysteries. For expansion, build an offline import-and-review pipeline with clear provenance, license check, human approval, and versioned publishing.

## Architecture

Preferred: Next.js + TypeScript, React, CSS/Tailwind, local data files, localStorage; deployable to Vercel. Small, readable modules: content schema/loader; daily schedule; autosuggest; game state machine; score logic; persistence; visuals; results. A future `Where Am I?` mode should be an additional category namespace using the same engine, not a second hardcoded codebase. Avoid a database until needed.

## Accessibility and reliability

- Keyboard navigate suggestions; Enter selects rather than accidentally submits; visible focus; Escape closes the menu; ARIA combobox and option state; no hidden controls behind mobile keyboard.
- Do not lock a player out by pressing an input key before a suggestion is selected. Make tap targets generous.
- Warn before abandoning an unfinished round if needed, while preserving progress on navigation.
- Validate all content on build: category exists, answerId is in category, exactly six nonempty clues, unique IDs, required epilogues, dates/schedule valid.
- Tests: choosing Cambrian in the Carboniferous scene advances from 100 to 80; guessing Carboniferous at clue 2 yields 80; skip lowers available score; repeat guess rejected; wrong sixth guess fails at 0; refresh retains state; selected category suggestions never mix other categories; day change uses new scenario; completed game cannot replay.

## Deliverable

Implement and launch locally. Run lint, typecheck, tests and production build if available, fix failures, and provide exact run/deploy steps. Clearly identify placeholder artwork, demo limitations, and any factual or source questions to review before public launch.
