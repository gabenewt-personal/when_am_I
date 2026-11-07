# When Am I?

*A daily mystery through time.* A mobile-first narrative deduction game: you wake somewhere in Earth's or human history, read up to six progressively revealed fragments, and work out **when** you are, choosing from a category-specific answer list.

Built from the starter pack in [`docs/`](docs/) (brief, content guide, data sources). Visual DNA follows the Rare Encounter handheld/arcade style: forest green and cream, warm gold, thick pixel borders, pixel type for menus, and a legible serif (Literata) for the prose.

## Run it

```bash
npm install
npm run dev          # http://localhost:3200 (includes the dev-only scenario/date picker)
```

Checks:

```bash
npm run check        # content validation + lint + typecheck + tests
npm run build        # validates content, then writes a fully static site to out/
npx serve out        # preview the production build
```

## Deploy

The app is a **static export** (`output: "export"`): no server, database, API key or AI call at runtime.

- **Vercel:** import the repo; the framework preset is Next.js and needs no settings.
- **Cloudflare Workers** (same setup as gabrielnewton.com): add a `wrangler.jsonc` with `"assets": { "directory": "./out" }`, then `npm run build && npx wrangler deploy`.
- **Anything else:** upload `out/`.

## Demo Mode (`/demo`)

Replay any mystery as often as you like without touching your daily progress. Open it from the **Demo mode** link at the bottom of Home, or go straight to `/demo`.

- **Menu:** every scenario, listed with its category and scene title. Today's mystery is tagged, along with your real result if you've played it.
- **Controls:** **Restart**, **Jump to clue** (1–6), **Mysteries** (switch without reloading) and **Home**. A red DEMO MODE chip, the control bar and a dashed red frame show you're in demo.
- **Same game:** it runs the real rules (`applyGuess` / `applySkip`), the same feedback text (`src/lib/round.ts`) and the same Mystery, autocomplete, art and Discovery screens. Jump to clue replays real reveals, so the points shown match what a player would have left. The share line ends in `· DEMO`.
- **Isolation:** demo rounds live only in React state and vanish when you leave the page. `Demo.tsx` never imports `saveGame`, `recordResult`, `clearGame` or `browserStorage`, and a test fails if it ever does. The "played today" badge reads through `readOnlyStorage()`, which drops writes. Demo rounds use the day key `demo`, which can never be recorded as a real day. There are no analytics or leaderboards to isolate from.
- **Public by design:** `/demo` ships in production (it's marked noindex). It lets anyone play any mystery and shows scene titles. That's fine for the demo rotation, but before a real launch either gate or remove it, or limit it to past mysteries.

## How it's built

| Module | Responsibility |
|---|---|
| `data/categories.json` | Canonical answer pools per category (the *entire* valid list), with aliases and timeline spans (ICS dates in Ma; decade years) |
| `data/scenarios.json` | Authored six-clue mysteries (see *Clue revisions* below) |
| `data/schedule.json` | Date → scenario manifest (see below) |
| `src/lib/content/validate.ts` | Build-time validation: category exists, answer is in category, exactly six non-empty clues, unique ids, epilogue present, alias collisions, valid source URLs, valid and unique schedule dates |
| `src/lib/content/load.ts` | Build-time loader: strips editor-only fields, swaps descriptive ids for opaque ones, seals post-solve content |
| `src/lib/schedule.ts` | Single UTC reset, date keys, puzzle numbering, scenario pick |
| `src/lib/search.ts` | Autocomplete: case/accent/punctuation/plural tolerant, aliases, canonical order |
| `src/lib/game.ts` | Pure state machine and scoring (100/80/60/40/20/10) |
| `src/lib/timeline.ts` | Post-solve timeline layout (proportional periods inside Earth's 4.567 Gyr; equal decade cells) |
| `src/lib/viewport.ts` | Visual-viewport scroll helpers for the on-screen keyboard |
| `src/lib/persistence.ts` | localStorage: replay-based restore, history, streak |
| `src/art/` | Clue-gated SVG pixel scenes (placeholders) |
| `src/components/` | Home, Mystery, Discovery, accessible Combobox, Demo (+ `/demo` route), DevPanel |

A future **Where Am I?** mode is a new category with `"mode": "where"` plus scenarios, using the same engine.

### Daily reset and schedule

- **One global reset at 00:00 UTC.** A "day" is the UTC calendar date. The same `utcDateKey()` drives both scenario selection and the storage key.
- Home shows the next reset in the player's local time, with the time-zone name (e.g. "Sat, 5:00 PM MST").
- `schedule.json`: `epoch` is puzzle #001. **Explicit `entries` always win.** On any other date, `fallback` decides:
  - `"demo-rotation"` cycles `demoRotation`. This is today's setting, and the UI shows **Demo edition**.
  - `"none"` shows "No mystery scheduled today" instead of silently repeating content. **Use this for launch.**
- To schedule a new mystery: add it to `scenarios.json`, add `{ "date": "2026-12-01", "scenarioId": "…" }` to `entries`, run `npm run validate`, and deploy. No code changes are needed.
- If UTC rolls over while a tab is open, the round in progress stays on its own day, a banner says a new mystery has arrived, and Home switches to the new day.

### Persistence and fairness

- Key: `whenami:v1:play:<UTC date>:<opaque scenario id>`. The storage schema version, date and scenario identity are all in the key; the content hash is stored inside the record, so a typo-fix redeploy never hands out a second attempt.
- Only the player's actions are stored as trusted data. Clue position, status and score are **recomputed by replaying the actions** through the rules, so a refresh can't restore spent points. Malformed or old records are ignored safely.
- Finished rounds reopen to their results. Other open tabs pick up progress through the `storage` event.

### Spoiler controls

- Editor-only fields (`contextForEditor`, `visualBrief`) never ship to the browser.
- Descriptive ids (e.g. `jurassic-river`) are replaced with hashes; art is keyed by neutral ids (`scene-03`) assigned server-side.
- Answer, scene title, epilogue and sources are **sealed** (XOR + base64) until the round ends. This only stops casual view-source spoilers; it is not security.
- Art layers render into the DOM only once their clue is revealed. Alt text is generic ("3 of 6 details revealed").
- Autocomplete always lists the full category in canonical (chronological) order. The correct answer is never ranked or highlighted.
- The dev panel is behind `NODE_ENV === "development"` and is compiled out of production builds (checked: not present in `out/`).

### Accessibility

ARIA 1.2 combobox with listbox, `aria-activedescendant`, and arrow-key navigation. **Enter selects and never submits.** Escape closes the menu. Answers you've already tried are disabled and marked. Focus outlines are visible, tap targets are at least 44px, and the input font is 18px (no iOS zoom). When a new clue appears, focus moves to it and the page scrolls so that clue and the answer field are both on screen.

**Mobile keyboard:** when you focus the field it scrolls only far enough to leave room for about four options above the keyboard, so the end of the latest clue stays visible. The list is sized to the *visual* viewport, which `vh` doesn't track. After you pick on a touch screen, focus moves to **Guess** and the keyboard closes. `interactive-widget=resizes-content` makes Android Chrome shrink the layout when the keyboard opens. Resuming a round opens at the latest clue. Feedback is announced through an `aria-live` region, and all animation is disabled under `prefers-reduced-motion`.

## Placeholder art and demo limitations

- **All scene artwork is placeholder:** original hand-built SVG pixel art in `src/art/scenes/`. Each scene follows its `visualBrief` layer by layer (for example, the sauropod only at clue 4). To swap in commissioned art, replace a `SceneDef`; the per-clue layer contract stays the same. Some sprites are rough (the triceratops and the dragonfly in particular).
- **Seven fixtures, rotating.** The demo cycles through them daily, which is not a production calendar.
- **Every scenario's clues ship in the page bundle**, so a determined player could read future days' clues. For a public launch, publish only the current day's scenario (per-day static JSON or an edge function).
- **No service worker.** After the page loads it plays fully offline, but reloading while offline needs a cached copy.
- Streaks are per-browser (localStorage). There are no accounts, by design.

## Clue revisions (v2)

Early clues were tightened so each carries one real piece of evidence without giving the answer away. Later beats are unchanged, and every revision still matches the art layer gated to that clue.

| Mystery | Clue | Evidence added |
|---|---|---|
| carboniferous-swamp | 1, 2, 3 | Air that "holds more than it should" (high oxygen); trunks with diamond scars instead of bark (lycopsids); clubmosses "as tall as houses" |
| jazz-after-dark | 1, 2 | Music below the street that someone hushes (secrecy); horse-drawn wagons still on the road |
| jurassic-river | 1, 2 | Three-toed tracks (dinosaurs exist); no flowers anywhere (before flowering plants spread) |
| world-watches-moon | 1, 2, 6 | Black-and-white TV and station wagons; war "in Southeast Asia"; clue 6 no longer states the year |
| devonian-shallows | 1 | Only low, leafless stalks on shore (early land plants) |
| dust-on-windowsill | 1, 4 | Damp sheet hung across the door (a Dust Bowl practice); failed bank |
| last-dinosaur-forest | 1 | Feathered flyers alongside skin-winged ones (birds and pterosaurs together) |

## Review before public launch

Content and factual questions for an editor:

1. **"Geologic Periods" covers only the 12 Phanerozoic periods.** The ICS chart also has Precambrian periods (Ediacaran, Cryogenian, Tonian, …). Either rename the category (e.g. "Phanerozoic Periods") or add them so the pool really is complete.
2. **Common near-misses have no entry:** *Tertiary* (informal, now Paleogene + Neogene), *Mississippian/Pennsylvanian* (U.S. sub-periods of the Carboniferous). Players typing these get "not in this category". Decide whether to alias them or leave them unmatched on purpose.
3. **"1900s"** can read as the whole century. Consider the label "1900s (1900–1909)".
4. ~~`world-watches-moon` clue 6 named "July 1969".~~ Rewritten around the promise to land on the Moon "before the decade was out".
5. **`jazz-after-dark` clue 6:** Prohibition ran 1920–1933, so "the country has banned alcohol" alone also fits the early 1930s. "Jazz Age" carries the clue. Probably fine; worth a conscious call.
6. **`carboniferous-swamp`:** the giant griffinfly (Meganeura-type, ~65–70 cm wingspan) is latest Carboniferous (~300 Ma), versus the ~310 Ma anchor. Close, but check against the sources.
7. **Check that every `sourceUrls` link resolves**, especially `carboniferous.stratigraphy.org`. They were not fetched during this build.
8. **Epilogue dates match ICS boundaries** (Carboniferous 358.9–298.9 Ma, Jurassic 201.4–145, Devonian 419.2–358.9, Cretaceous end 66.0). Rounding is consistent.
9. **Review the v2 clue changes** above, particularly the oxygen hint (Carboniferous O₂ peaked around 30–35%) and the damp sheet in the doorway (documented in Dust Bowl oral histories).
10. **Share squares:** the brief's example (`🟩🟨⬜…` for 80) doesn't map cleanly to one clue per square, so the game uses 🟨 miss · ⬛ revealed · 🟩 solved · 🟥 final miss (e.g. `🟨🟩⬜⬜⬜⬜ · 80/100`). Confirm or adjust in `src/lib/share.ts`.
