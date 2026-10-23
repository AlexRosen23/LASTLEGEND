# Character Identity Lab — implementation status

Launch [identity-lab.html](../identity-lab.html) alongside the repository's `data/roster_v4.json` via a local HTTP server (for example `python -m http.server 8000`).

## Added
- Filterable, paginated roster inspection page using the existing V4 roster JSON; falls back to two featured previews when the roster cannot load.
- Render categories: articulated human, oversized-costume mascot, quadrupedal animal, wheeled vehicle, aquatic creature. Each has a different SVG silhouette and CSS animation.
- Reduced-motion support, accessible portrait buttons, responsive grid, and character-specific victory *preview*.
- LeBron James and Trey McBride featured styling, with documented official sources for jersey numbers; other demographic/appearance attributes remain deliberately labeled as illustrative.
- No guessed numbers on unsourced entrants, no roster deletions, and no simulation changes.

## Deliberate limits / follow-up QA
- This is **not yet integrated** with the shipping `index.html` battle royale. It is an additive art/identity inspection surface, not evidence that the full game is visually polished.
- The `index.html` file is around 1.56 MB. Connected read access did not return its contents; replacing it without inspecting the exact source would be unsafe.
- Sprite category heuristics are temporary and may misclassify some names. A verified per-ID `render_type` should override heuristics; human/mascot/animal/vehicle/aquatic taxonomy needs a full roster audit.
- The victory screen here is a demo, **not** the actual end-of-match presentation. It does not fabricate eliminations, remaining HP, or rankings.
- V5's live HP/elimination leaderboard is unchanged; this release does **not** claim to have re-tested it in a running browser.
- Automated or manual full-roster screenshot tests, historical uniform/source verification, and real gameplay integration remain outstanding.

## Quality checks to run in a browser
1. Serve the repository over HTTP and load `/identity-lab.html`.
2. Verify the status reports roster entries rather than just the featured fallback.
3. Search for LeBron and Trey. Check #23 wine/gold and #85 Cardinals red with helmet/faceguard.
4. Filter mascots, animals, aquatic creatures, and vehicles. Confirm appropriate non-stick outlines, motion, no layout overflow.
5. Click each category to inspect the champion preview. Confirm no game statistics are invented.
6. Enable reduced-motion OS preference; verify animations stop.
7. Run `node tests/test_v5.cjs` against the untouched main gameplay to monitor regression.

This is a partial functional implementation and an explicit QA gate, not a completed roster-wide production art overhaul.
