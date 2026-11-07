# When Am I? — data sources and editorial pipeline

## What already exists in this starter pack

- `data/categories.json`: **complete category-limited autocomplete sets for the two prototype categories**, with canonical IDs, display labels, and aliases. It is a manually curated seed, not a direct synchronized copy of an API.
- `data/scenarios.json`: **seven written six-clue mysteries**, including `categoryId`, `answerId`, `contextForEditor`, `epilogue`, `visualBrief`, and `sourceUrls`. They are seed editorial content. Verify every scenario before public publication.
- **No live third-party service is needed to run this prototype**. Load and validate these files at build time.

## Sources to connect when scaling content

1. **International Commission on Stratigraphy (ICS)** — https://stratigraphy.org/chart/ ; structured RDF chart at https://github.com/i-c-stratigraphy/chart . Authoritative names, hierarchies, time boundaries of geologic periods/epochs. CC BY 4.0 attribution required. Export and normalize it *offline* to app-owned JSON; do not have clients query RDF. Periods, eras, and epochs are different answer categories.
2. **Wikidata** — https://query.wikidata.org/ . Candidate historical eras, events, civilizations, date ranges, names and aliases. Machine-readable, broad coverage, but crowd maintained and uneven: cross-check with authoritative historical sources before publishing. Preserve stable IDs and review aliases for collisions and differing definitions.
3. **Library of Congress** — https://www.loc.gov/apis/ . Historical documents, photos, maps, metadata; useful for research and illustrated epilogues. An accessible item does not mean its media is public domain. Check rights and restrictions per item. The JSON API does not require an API key but is rate limited.
4. **National Park Service** — https://www.nps.gov/subjects/digital/nps-data-api.htm . When future *Where Am I?* categories launch, the official parks endpoint can seed names, park designations, coordinates, descriptions, and photos. Requires a free API key; use only server-side/offline ingestion. Park types are not interchangeable: National Parks and National Monuments should have separate autocomplete scopes. Check individual image rights and attribution.

## Proposed creation flow

`official source / research -> normalized candidate categories + source-backed fact notes -> drafted 6-clue scene -> fact and ambiguity review -> narrative and clue-difficulty review -> spoiler/art review -> approved versioned scenario -> published daily manifest`

Do **not** conflate factual structured data with prose. A date range or park metadata can be imported automatically; the fiction-like scene should be human reviewed (even if Claude drafts it). For visual art, use original pixel art, licensed assets, or vetted public-domain media. Capture rights/attribution requirements independently of factual reference citations.

## What to build now vs later

- **Now:** Make the existing local JSON content work perfectly with deterministic autocomplete and daily puzzles. Add schema validation, editorial reference field support, and a dev-only scenario picker. No API integration necessary.
- **Next:** Add a simple CLI ingestion tool (separate from gameplay) that imports one authoritative dataset at a time and writes candidate JSON. Require manual review and an explicit publish step before candidates appear in daily games.
- **Later:** Add editorial workflow UI, calendar of approved challenges, automated duplicate checks, play-test ratings by clue, provenance/license metadata, and end-user analytics. Do not publish LLM-written mysteries without review.

## Data integrity checks

- Six nonempty clues in order; first two intriguing but not answer giveaways; clue six very strong but not mechanically dependent on an unsourced fact.
- Valid category and canonical answer; autocomplete includes the **full eligible category pool**, not only upcoming puzzle answers.
- Stable answer IDs and aliases; no duplicate or confusing aliases; variants grouped consistently.
- All factually identifying clues backed by source notes; sources and evidence internally available, spoilers withheld from players until solve/fail.
- Verified no image, text alternative, asset filename, or developer-mode leakage gives away the answer.
- Source text is not copied into narrative; original storytelling remains the product's signature feature.
