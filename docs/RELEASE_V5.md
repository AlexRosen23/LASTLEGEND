# LAST LEGEND V5 — Player Identity & Live Leaders
Date: 2026-10-23

## Requested visual behavior
- Different cartoon stick figures rather than the same generic head and single-color sport shirt. Figures now distinguish by skin tone, hairstyles, facial hair, team/era color, sport uniform, sport accessories and, only when known, uniform number.
- Explicit artist-directed examples:
  - LeBron James: dark skin, full beard, #23 in the selected Cavaliers-era wine-and-gold basketball uniform.
  - Trey McBride: lighter skin, Cardinals red #85 football jersey, helmet, faceguard, and eye black.
- Team/era palettes for the most common Big Four teams and Indiana.
- Visible arena leaders: top 3 living athletes by current HP and top 3 competitors by eliminations (including eliminated athletes labeled OUT). Both are computed from the *current replay frame*, not the match's final stats.
- Desktop leaderboard is pinned in the sidebar above STORY/SURVIVORS; mobile has a sticky 2-column compact leaderboard immediately above the map and encounter camera.

## Fidelity / data policy
- Artist-directed presets are included for a small set of notable competitors; only specific cited uniform details for LeBron and Trey were independently checked this pass.
- Default skin tones, hair and facial hair for the remainder are stable deterministic cartoon styling based on ID, **not verified portrayals or claims about a real person's appearance**.
- Unverified player numbers remain unnumbered. Do not silently assign a guessed uniform number.
- Nonhuman characters retain their existing dedicated silhouettes from V4.
- Game mechanics, roster (1,203 profiles), 2–100 match sizes, deterministic procedural maps, seeded behavior, and prior encounter/event animations are retained.

## Tests
- `node tests/test_v5.cjs` verifies appearance presets, jersey numbers, distinct style combinations, leaderboard rankings at the opening/middle/end of matches, and 2, 12, 24, 100-competitor outcomes.
- Local Chromium checks at 390px and 1280px viewport confirmed no JavaScript errors, zero horizontal overflow, correct responsive board, champion screen, and side-panel leaderboard during a match.
- The corrupted font import at the start of V4's stylesheet was corrected so the dark-mode page colors render consistently.

## Sources
- LeBron #23 (official Lakers player profile): https://www.nba.com/lakers/team/player-pages/lebron-james-2544
- Trey McBride Cardinals #85 (official Cardinals roster): https://www.azcardinals.com/team/players-roster/
- Additional skin/hair/accessory art remains illustrative until individually reviewed.
