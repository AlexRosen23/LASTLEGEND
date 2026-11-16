# LAST LEGEND: features

LAST LEGEND is a free browser game. Athletes, team mascots and other characters fight a storm-driven survival battle until one is left. You draft 2 to 100 contestants, pick an arena and a randomness level, and watch a seeded match play out on a 2D map. It is for anyone who wants to set up an impossible matchup and see who survives. What it does best: the same seed and lineup always give the same match, so a result can be replayed, shared as a link and tested.

**This is the source-of-truth features list.** Every PR that adds, changes, removes or switches off something a person can see or use updates this file in the same PR (see "Keeping this file true").

- **Repo:** AlexRosen23/LASTLEGEND (public) · **Folder:** `~/Desktop/Claude Projects/Last Legend`
- **Status:** Working and public, live on GitHub Pages · **Version:** the feature modules are named V2 to V30 · **`main`:** `297d283` (2026-11-15)
- **Last updated:** 2026-11-15, written from the code, README, docs and tests.

> **Fictional game data.** The roster uses real names, but every rating, personality trait, ability and encounter is game design, not a claim about a real person. Mascot and character depictions are provisional interpretations, not licensed likenesses. The project is not affiliated with any league, team or athlete.

**Status words** (a feature with no status word is live):

| Word | Means |
| --- | --- |
| *Live* | on `main` and working, and deployed to the live site |
| *Merged, not live* | on `main`, not yet copied to the `gh-pages` branch that the site serves |
| *Off by default* | built, behind a setting |
| *Planned* | in a roadmap or limits doc, not built |

## At a glance

| | |
| --- | --- |
| Live site | https://alexrosen23.github.io/LASTLEGEND/ (GitHub Pages, branch `gh-pages`) |
| Stack | Vanilla JavaScript, HTML, CSS and SVG; no build step, no server. Python for the reference engine, roster tools and browser tests; Node for feature tests |
| Code | one 1.58 MB `index.html` (inline simulation and roster), 29 JS modules and 16 stylesheets in `ui/`, `identity-lab.html`, 8 Python tools, a Python engine |
| Library | 1,664 built-in entries (1,645 base entries plus 19 historical editions), including 258 mascots; plus up to 5,056 current team players when the daily snapshot loads (README check, 2026-11-10) |
| Match size | 2 to 100 contestants |
| Arenas / modes | 4 arenas, 3 randomness modes |
| Encounter scenarios | exactly 500 authored (`ui/encounters-v10.js`) |
| Tests (counted from source) | 24 Node scripts, 4 Python unit-test files (37 test functions), 9 Playwright browser tests |
| Merged PRs | 30 merged, 1 closed (31 total, #1 to #31) |
| CI | 3 GitHub Actions workflows (tests, daily roster sync, manual deploy) |
| License | none; all rights reserved |

## Contents

1. What it is and who it's for
2. How to run it
3. Architecture at a glance
4. Features
5. Integrations
6. Data and privacy
7. Tests and evidence
8. Known limits and gaps
9. Change log

## 1. What it is and who it's for

- **Players** who want a quick "who wins" battle with any mix of athletes, mascots and wildcard characters.
- **Sharers**: a seeded link recreates the exact lineup, arena, mode and seed.
- **Engineers** curious how far one static page with a seed-keyed simulation can go. The README has the design write-up.
- Not built: accounts, global leaderboards, multiplayer, a backend.

## 2. How to run it

Play: open the live site, choose **Enter the Arena**, press **Fill Rest** (or pick a lineup), then **Start the Battle**.

Run locally (any static server; serve the folder, do not open the file directly because modules load by relative URL):

```bash
git clone https://github.com/AlexRosen23/LASTLEGEND.git
cd LASTLEGEND
python3 -m http.server 8000 --bind 127.0.0.1    # then open http://127.0.0.1:8000/#play
```

- Locally the current-team-roster snapshot (`data/active_rosters_v24.json`) is missing (it lives only on `gh-pages`), so the game uses the built-in library and shows a notice.

Reference engine and checks (Python 3.10+, Node 22+; Playwright only for browser tests and `validate_package.py`):

```bash
python3 -m venv .venv && . .venv/bin/activate
python -m pip install -r requirements-dev.txt && python -m playwright install chromium   # once
python -m engine.cli --seed 42 --out examples/match_42.json   # one 12-athlete match
python -m engine.cli --batch 100 --arena CITY --mode BALANCED # win counts over 100 seeds
python validate_package.py                                    # unit tests + 300 smoke matches
for f in tests/*.cjs; do node "$f" || echo "FAIL $f"; done    # Node feature tests
```

No environment variables or secrets are needed to play or to run the tests.

## 3. Architecture at a glance

Everything that decides a match is one inline `<script>` in `index.html`. The modules in `ui/` add roster data, art, pages and presentation, and talk to it through the `opts` state object and a few `window.LastLegend*` hooks.

| Path | What lives there |
| --- | --- |
| `index.html` | The game: inline roster and ability JSON, simulation core, draft, playback |
| `identity-lab.html` | Character Identity Lab, a searchable roster inspection page |
| `ui/` | Feature modules and stylesheets, one per version (art, spectator, website, encounters, survival AI, routing, rosters, tournaments, replay, broadcast, settings) |
| `data/` | Roster datasets (252, 500, 700, v4), ability catalogues, ruleset, appearance sources, roster provenance |
| `engine/` | Python reference simulation (`simulation.py`) and CLI (`cli.py`) |
| `tools/` | Roster builders, the ESPN roster sync, the `main` to `gh-pages` copy (`pages_deploy.py`), package and example builders |
| `tests/` | Node (`*.cjs`), Python and Playwright browser tests |
| `docs/`, `source_v0_1/`, `prompts/` | Release notes, limits, roadmaps; original design package; original build prompt |
| `.github/workflows/` | `gameplay-regressions.yml`, `roster-sync-v24.yml`, `deploy-pages.yml` |

Data flow: draft -> `Simulation.run()` computes the whole match (every event plus one snapshot per tick) -> playback, leaderboards, captions and the champion screen only read the recorded frames. Presentation cannot change a result.

## 4. Features

### Draft and setup

- **Draft 2 to 100 contestants** from the built-in library, unique entries only. `index.html`
- **Fill Rest and Clear Lineup**: fill empty slots, or empty the lineup. `tests/test_lineup_controls.cjs`
- **Four arenas**: The Wilderness, Neon City, The Gauntlet, Frozen Frontier (ids `WILDERNESS`, `CITY`, `RUINS`, `FROZEN`). `index.html`
- **Three randomness modes**: Realistic, Balanced, Chaos. They set how sharply a rating gap decides a fight. `TEMPS` in `index.html`
- **Seed and "New map every battle"**: on by default (new seed from `crypto.getRandomValues`); turn it off to type a seed.
- **Mascot-only filter** and sport filters in the draft grid. `ui/spectator-v7.js`
- **Library counters** refresh whenever entries are added. `refreshCatalogCounts()`, `tests/test_catalog_counts.cjs`

### The simulation

- **Seed-keyed draws**: every random choice is a hash of seed, purpose, tick and actors, never `Math.random`. Lineup order does not matter (roster is sorted).
- **Eight contest types** (sprint escape, pursuit, attack, defence, cache grab, negotiation, hazard, long trek), each with its own rating weights; a logistic curve turns the score gap into a win chance clamped to 2.5 to 97.5%. `WEIGHTS`, `Simulation.contest()`
- **Procedural maps** from the seed: 48 terrain features of four arena-specific kinds, 10 supply caches, 3 paths. `generateMap()`, `tests/test_v4.cjs`
- **Shrinking storm**: the circle shrinks to radius 0.5 by the tick limit (140 by default). Storms, traps, finds and zone exposure deal damage; a competitor at 0 HP is out with a recorded cause.
- **Always one champion**: if more than one is left at the tick limit, seeded final engagements run until one remains. Alliances dissolve at three survivors.
- **Storm survival AI** (V9, V13, V21): competitors forecast the zone three ticks ahead and escape first; supply targets are scored by distance, future storm exposure and stock. `ui/survival-ai-v21.js`, `tests/test_zone_v9.cjs`, `tests/test_survival_ai_v21.cjs`
- **Terrain-aware routing** (V22): seeded routing around map obstacles (no physics collision). `ui/pathfinding-v22.js`
- **Intents and tendencies**: heal, rest, approach, evade, observe or negotiate, weighted by five fictional tendencies.
- **Alliances, ambushes, betrayals, traps** appear as recorded events.
- **Optional rivalry AI** (V26) *(off by default)*: opponents remember encounters and adjust targeting. `ui/rival-ai-v26.js`, `tests/test_future_v30.cjs`
- **Event ledger**: every state change goes through `emit()`; `snapshot()` stores positions, HP, stamina, alliances and supplies each tick.

### Characters and abilities

- **20 ratings, 5 tendencies and a signature ability per entry**, shown in dossiers on Legends and Draft. `ui/profiles-v11.js`, `tests/test_profiles_v11.cjs`
- **Ability activations** (V19) are shown during recorded encounters. `ui/abilities-v19.js`
- **Animated SVG characters**: styled athletes with sport uniforms and verified jersey numbers only; distinct mascot, horse, vehicle, aquatic and undead silhouettes; category-specific victory celebrations. `ui/character-renderer.js`, `ui/character-rebirth-v18.js`, `tests/test_v6.cjs` (1,203 profiles rendered when written)
- **Jersey numbers only when sourced**; otherwise blank. `data/verified_jersey_v26.json`
- **Sourced heights and weights** for NBA/NFL/MLB/NHL entries (V26). `tests/test_roster_physicals_v26.py`
- **Historical team editions** (V22): 19 editions with ratings inherited from the base entry (not era-adjusted). `ui/eras-v22.js`
- **Character Identity Lab**: searchable roster inspection page. `identity-lab.html`

### Playback and spectating

- **Spectator view**: play, speed control, camera modes, follow a chosen competitor, live HP leaderboard and top-10 scrollable elimination leaderboard. Boards never show later scores. `ui/spectator-v7.js`
- **Illustrated arenas and broadcast UI** (V18, V19): collision-safe name labels, broadcast arena. `ui/visual-rebirth-v18.js`, `ui/battle-vision-v19.js`
- **500 contextual encounter scenarios** (V10): 110 realistic, 100 comedic, 100 sport/identity-specific, 85 nonhuman, 65 heavy-impact, 40 optional mature. Each attaches to a recorded event and keeps its participants, damage and winner. `ui/encounters-v10.js`
- **Content intensity**: Standard (default), Intense, and Graphic 18+ (explicit opt-in).
- **Choreography and encounter cinema** (V12, V20): motion families and extra staging by event severity. These are labels and staging, not 500 separate animations. `ui/choreography-v12.js`, `ui/encounter-cinema-v20.js`
- **Captions** (V29): text taken from the last important recorded event; **browser speech** is opt-in with mute *(off by default)*. `ui/broadcast-v29.js`
- **Confirmed battle exit**, live replay title and action text kept in front of players (#20). `ui/spectator-v7.js`
- **Champion screen**: final HP, eliminations, encounters, affiliation, standings, confetti; Rematch, Replay, Share and **Back to Home** (V17).
- **Match history**: results saved on the device. `ui/spectator-v7.js`

### Website pages

- **Hash-routed pages** that survive a refresh on Pages: Home, Play, Legends, Champions, How to Play, About, Updates. `ui/website-v8.js`, `tests/test_browser_website_v8.py`
- **Legends** catalogue with profiles. **Champions** page from local history.
- **Accessibility and SEO basics** (V14): skip link, focus visibility, reduced motion, contrast, metadata. No third-party audit. `ui/polish-v14.css`, `tests/test_polish_v14.cjs`

### Sharing, analysis and extras (all device-local)

- **Seeded challenge links** (V15): 2 to 12 ids plus seed, map and mode; loads the draft from the link. `ui/challenges-v15.js`
- **Win-share lab** (V16): 16 seeded trials for 2 to 12 contestants; counts wins, mean placement and mean eliminations. Never changes the current match. `ui/analytics-v16.js`
- **Tournaments** (V23): single elimination with 4, 8, 16, 32 or 64 unique athletes, results by round. `ui/tournaments-v23.js`
- **Daily Draw** (V24): a UTC-day seed, 12 legends and arena, the same for everyone on this roster version; no ranking. `ui/daily-v24.js`
- **Replay bookmarks** (V25): bookmark frames, jump to key events. `ui/replay-v25.js`
- **Character creator** (V27): up to 20 original fictional characters, template ratings, 4 sports, 5 specializations, stored in `localStorage`. `ui/creator-v27.js`
- **JSON export** (V28) of local history and creator data. `ui/data-v28.js`
- **Display settings** (V30): high contrast and reduced motion *(off by default)*. `ui/polish-v30.js`

### Current team rosters (NBA, NFL, MLB, NHL)

- **Daily capture of all 124 team rosters** from ESPN's public feed, published as `data/active_rosters_v24.json` on `gh-pages`. Counts on 2026-11-09: 5,056 players (NBA 522, NFL 2,567, MLB 1,113, NHL 854). `tools/sync_active_rosters_v24.py`
- **Fail-closed sync**: refuses a capture with a missing team or suspicious count; MLB off-season rule (at least 15 per club, at most 4 short clubs, league median at least 26). #23
- **Browser re-validation**: schema, per-team counts, duplicates, floors; installs all players at once or none; stale warning after 48 hours. `ui/active-rosters-v24.js`
- **Snapshot gate in CI**: each new snapshot also passes the browser's validator before publishing. `tools/check_roster_snapshot_v24.cjs`
- Labelled "ESPN-reported", not official league registration.

### Python reference engine and tools

- **Reference engine and CLI**: 12 contestants, 252-athlete dataset, SHA-256 state hash, invariant checks; `--seed`, `--out`, `--batch`, `--arena`, `--mode`. `engine/`
- **Package validation**: unit tests plus a 300-match smoke batch. `validate_package.py`
- **Roster builders**: `generate_roster.py`, `tools/build_roster_v4.py`, `expand_roster.py`, `expand_current.py`; release zip `package_release.py`.
- The browser engine and the Python engine have diverged; there is no parity test.

### Deploy tooling

- **Manual deploy workflow**: copies game files from `main` to `gh-pages`; dry run by default, publish only when ticked. `.github/workflows/deploy-pages.yml`, `tools/pages_deploy.py`, `docs/DEPLOY.md`
- **Deploy list check**: fails if the site loads a file the deploy would not copy. `tests/test_pages_deploy.py`

## 5. Integrations

- **ESPN public site API** for team rosters (read in CI only, never from visitors' browsers).
- **GitHub Pages** (branch `gh-pages`, HTTPS enforced) and **GitHub Actions**.
- No other external services; no analytics or accounts.

**Publishing note:** the site serves `gh-pages`, not `main`. This file is not in the deploy list, so merging it changes nothing on the live site.

## 6. Data and privacy

- **No backend and no tracking.** Everything runs in the visitor's browser.
- **Stored on the device** (`localStorage`): match history, created characters (`lastlegend.custom.v27`), display settings (`lastlegend.display.v30`). Nothing is sent anywhere.
- **Fictional ratings** for real names; jersey numbers only with a recorded source; unreviewed appearances are labelled deterministic cartoon styling.
- **Team rosters** come from ESPN's public feed and carry its attribution.
- No secrets; `.gitleaks.toml` has one scoped allowlist for a racehorse's id that looked like a key.

## 7. Tests and evidence

Counted from source on 2026-11-15, not run:

| Suite | Count | Command |
| --- | --- | --- |
| Node feature tests | 24 scripts | `for f in tests/*.cjs; do node "$f"; done` |
| Python unit tests | 37 test functions in 4 files (engine 15, roster guard 9, roster physicals 7, deploy 6) | `python validate_package.py` |
| Playwright browser tests | 9 scripts, each at desktop and phone width | `python tests/test_browser_v7.py` (and the others) |

Recorded results (from the README):

- 2026-11-09, `main` at `8b4641c`: Node 22 of 22 then, 24 of 24 on 2026-11-11 (9 s); Python 31 of 31; `validate_package.py` `"pass": true`, 300 of 300 smoke matches in 9.8 s; browser 9 of 9, three flaky under load.
- Live site 2026-11-09, seed 42: 2, 12, 24 and 100 contestants each ended with one survivor; same seed with reversed lineup gave an identical event log; 100 contestants simulated in 162 ms (single run, not a benchmark).
- Live site 2026-11-10: current team rosters loaded (6,720 draftable entries), a 12-contestant match ran to one champion, no console errors.
- CI: `gameplay-regressions.yml` runs on every PR and push to `main`; a commit message with `[skip ci]` skips it.

## 8. Known limits and gaps

- **Deploys are manual**: a merge to `main` is not live until copied to `gh-pages`.
- **Ratings, tendencies and most appearances are game estimates**; no real-performance validation. *Planned*: balance study of at least 1,000 seeds per arena and mode (`docs/VALIDATION_AND_LIMITS.md`).
- **No collision physics**: routing is seeded, not physical.
- **Encounters are labels and staging**, not 500 rigged animations.
- **Two engines, no parity test.**
- **Heavy first load**: 1.58 MB page plus about 45 requests. *Planned*: lazy-load the inline roster.
- **Captions are template text** and sometimes read awkwardly.
- **Hand-verified jersey overrides expire** on 2026-12-17 unless re-checked (34 entries, last checked against the official team roster pages on 2026-11-16).
- **Everything social is local**: no accounts, global leaderboards or multiplayer.
- **Rights**: names, colours and mascots are provisional; a rights review is needed before commercial use.

## 9. Change log

| Date | PR | Change |
| --- | --- | --- |
| 2026-11-11 | #31 | Docs: all 24 node scripts listed, V8/V11 planning docs marked historical |
| 2026-11-10 | #30 | Roster counters, browser validator gate in the roster sync, CI Playwright pin |
| 2026-11-10 | #29 | Manual `main` to `gh-pages` deploy workflow and `docs/DEPLOY.md` |
| 2026-11-10 | #28 | Browser validator accepts MLB off-season rosters (live rosters restored) |
| 2026-11-10 | #27 | Full README write-up |
| 2026-11-09 | #26 | `validate_package.py` passes from a clean checkout |
| 2026-11-07 | #25 | Professional README |
| 2026-11-04 | #24 | Scoped gitleaks allowlist for one false positive |
| 2026-11-04 | #23 | Season-aware MLB roster guard in the sync |
| 2026-10-26 | #22 | Remove a stale v3 rules test |
| 2026-10-23 | #21 | Integrate V18 to V30 features without losing V24 to V26 fixes |
| 2026-10-23 | #20 | Fix live replay title and action text behind players |
| 2026-10-23 | #19 | V26: sourced jerseys, heights and weights |
| 2026-10-23 | #18 | V25: strict Big Four roster reconciliation, safe import |
| 2026-10-23 | #17 | V24: all 124 team rosters with nightly sync |
| 2026-10-23 | #16 | V23: 442 more entries (1,652 characters) |
| 2026-10-23 | #15 | V22: terrain-aware pathfinding |
| 2026-10-23 | #14 | V21: survival intelligence |
| 2026-10-23 | #13 | V20: encounter cinema |
| 2026-10-23 | #12 | V19: match vision, collision-safe names |
| 2026-10-23 | #11 | V18: illustrated arenas and broadcast UI |
| 2026-10-23 | #10 | V18 to V30 review candidate: tournaments, daily, creator, broadcast |
| 2026-10-23 | #9 | V12 to V17: choreography, survival, QA, challenges, analytics, Home |
| 2026-10-23 | #8 | V11: full stat spreads and abilities |
| 2026-10-23 | #7 | V10: 500 contextual encounters |
| 2026-10-23 | #6 | V9: storm survival |
| 2026-10-23 | #5 | Closed: older website draft with a failing test |
| 2026-10-23 | #4 | V8 website foundation |
| 2026-10-23 | #3 | Fix draft lineup: Clear All, Fill Rest |
| 2026-10-23 | #2 | V7: confirmed exit, top-10 leaders, spectator UX, match history |
| 2026-10-23 | #1 | V6: animated character identities and victories |
| 2026-10-22 | n/a | Design package: spec, 252 athletes, Python engine; then V2 to V5 (500/700 athletes, 2 to 100 contestants, mascots) by direct commits |

## Keeping this file true

- **Same PR, same change.** A PR that adds, changes, removes or switches off something a person can see or use updates this file.
- **Status moves with reality.** "Live" means copied to `gh-pages`; a feature merged to `main` only is *Merged, not live* until the deploy.
- **Only what is true.** Say "unverified" or leave it out. Counts in section 7 say whether they were run or counted.
- **Public repo.** Do not add private repos, private-app ports, trading systems, machine paths or anything not already public here.
