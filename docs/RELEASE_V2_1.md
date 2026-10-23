# Release V2.1 — Adjustable Match Size

Date: 2026-10-23

- Match size can be selected from 2 through 24 athletes (inclusive), with 12 as the default.
- The draft counter, editable slots, automatic quick-fill, roster sidebar, top survivor counter, and champion standings all adapt to the chosen size.
- The simulation validates unique rosters and distributes starting athletes around the map according to the actual competitor count.
- Elimination validation expects N−1 eliminated competitors and exactly one champion, not a fixed 11 eliminations.
- The existing 500-athlete pool, seed behavior, slow playback, and 2–4-athlete encounter animations remain unchanged.

## Tests

Run `node test_sizes.cjs` from the repository root. It covers 70 completed seeded runs at sizes 2, 3, 4, 8, 12, 18, and 24, with one champion each, correct finishing order and elimination counts, repeatability, and live draft resizing. Separate public browser acceptance checks are performed after deployment.
