# V4 — Large-Scale Crossover Mechanics
Date: 2026-10-23

## Delivered
- 1,178 unique selectable records; 700 legacy entries preserved.
- Chicago Bears Top 100: 100 tagged players.
- Indiana championship-season team: 57 tagged entries (including Andrew Turvy), unresolved names flagged.
- Mascots: 133 named pro mascots across NFL/NBA/NHL/MLB, plus 100 college mascots. Some teams have no official mascot; no invented mascot is created.
- Friends-requested athlete and pop-culture wildcard profiles, with horse and jockey separate.
- Boomer Esiason Prime and Current are independent draft entries; Anthony Richardson green variant is a selectable **costume only**.
- Editable 2–100 competitor draft; large-match serverless simulator; category and mascot-only filtering.
- Nonhuman silhouette placeholders; design-level visuals intentionally deferred.
- Existing seeded maps, final-three alliance rule, events and podium retained.

## QA
Headless deterministic results and full completion at sizes 2/3/4/12/24/50/75/100. Mobile 390px browser smoke passes for two-mascot and 100-competitor modes. High-watermark match runtime under 1 sec in local headless JS test.

## Integrity
See `data/manifest_v4.json` for counts and unresolved names. This is a game, not a verified simulation of real people or a rights-cleared release.
