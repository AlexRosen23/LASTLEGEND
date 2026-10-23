# LAST LEGEND — V4 mechanics release

## V5 — Athlete identity + always-visible arena leaders

- Individualized 2D stick-figure styling: team/era jersey palettes, stable stylized skin-tone/hair/facial-hair variation, helmets, eye black, gloves, tattoos and sport-specific accessories.
- Featured art direction: LeBron James full beard, darker skin and #23; Trey McBride lighter skin, Cardinals red #85, helmet and faceguard.
- Top three live HP and top three total eliminations appear in a fixed sidebar on desktop and a compact sticky scoreboard directly above the arena map on phones. Rankings update from the current replay frame and never spoil future scores.
- Full V4 crossover roster (1,203), 2–100 player mode, procedural arenas and events preserved. 
- See [V5 release notes](docs/RELEASE_V5.md), [appearance sources](data/appearance_v5_sources.json) and run `node tests/test_v5.cjs`.

**[Play LAST LEGEND](https://alexrosen23.github.io/LASTLEGEND/)**

Build 4 adds draftable crossovers and large arenas before a dedicated art update. Matches support **2–100 contestants** from **1,203 selectable records**. The source is in `main`; GitHub Pages serves `gh-pages`.

### Content
- 700 existing competitors preserved; 503 new distinct profile entries.
- **100 Chicago Bears Top 100** members, **57 Indiana championship-season entries**, and 94 friends-requested themed entries; overlapping names are tagged rather than duplicated.
- 100 college mascots and 158 pro mascots (named team mascots only; teams with no active official mascot aren't given a fictional replacement). Mascot-only draft filter; full crossover draft is also supported.
- Multiple editions of Boomer Esiason as distinct choices, plus an alternate fictional green outfit for Anthony Richardson.
- Horses, cars, aquatic creatures, creatures and mascots have **non-stick placeholder silhouettes**; detailed character art deferred.
- The selected IU championship roster contains all requested verifiable players, starters and notable reserves plus Andrew Turvy, flagged for identity check where documentation is insufficient.

### Simulator
- Adjustable 2–100 contestants with the original 500- and 700-player libraries preserved.
- Seeded generation, group encounters, contextual scoring, deterministic match replay, one sole champion and no newly formed alliances with fewer than four survivors.
- Regular and mascot-only modes; additional category filters make large drafts manageable.
- Existing victory screen and event animation pipeline preserved.

### Test
```bash
node tests/test_v4.cjs
python tests/test_browser_v4.py
```
Local checks passed for contestant counts 2, 3, 4, 12, 24, 50, 75 and 100. A 390px browser test confirmed a mascot match and 100-character match, with no horizontal scroll. The 100-character test ran in approximately 0.6s headlessly in the local environment.

### Source and safety notes
The `data/manifest_v4.json` tracks collection counts, sources and **identity-review exceptions**. The labels in unresolved entries are placeholders, not verifications. The real-world athlete ratings, personalities, combat mechanics and fictional abilities are **game design, not factual claims**. Fictional characters and trademarked mascot depictions need rights clearance before monetization or marketing. Official mascot programs vary: not every franchise has one.

### Next release
Visual-focused: specialized animations for vehicles, horses, aquatic characters, all individual mascots, supers, outfits, environment, and a more cinematic victory screen.
