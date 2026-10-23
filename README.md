# LAST LEGEND

**Pick 2–24 legendary athletes. One champion remains.**

**Play free on iPhone, Android or desktop:** https://alexrosen23.github.io/LASTLEGEND/

## V3 — Living Arenas & Triumph (2026-10-23)

- **700 pickable athletes:** retained the original 500 and added **100 October 2026 NFL roster-listed players** and **100 players listed in the NBA's 2026–27 opening-night roster report**.
- **Procedurally generated seeded maps:** each new match randomizes the seed by default; terrain objects, paths and supply-cache positions change on every seed. The same manual seed, competitors, arena and settings reproduce an identical simulation and map. Terrain affects situational scoring.
- **Final-three alliance prohibition:** no negotiation or alliance creation once fewer than four competitors remain. Existing alliances break as the field falls to three.
- **Cinematic victory screen:** a large triumphant uniformed stick figure poses with both arms raised on a podium, with confetti, champion name, map ID and finishing order.
- **Event variety and animations:** storms, arena traps, ambushes, surprise supplies and shelters join chases, clashes, alliances, resource contests and the zone. Event-specific animations visually depict outcomes recorded by the same simulation.
- Retains **2–24** competitors, 500 previous legends, slow adjustable playback and all original arena themes.

Open in iPhone Safari → Share → Add to Home Screen for a Home Screen shortcut.

## Reproducibility

The playable site is a self-contained `index.html` with HTML, CSS, SVG, JavaScript, embedded athlete/perk data and local client-side simulation. GitHub Pages serves exactly that file from `gh-pages`. Source of truth is `main`. No backend, credential, or account is required.

Use the **New map every battle** toggle (on by default) to get a new seed. Uncheck it to control the seed manually and replay the same seeded scenario.

## Files

- `index.html` — playable mobile web game.
- `data/athletes_700.json` and `data/signature_perks_700.json` — game roster, stats and signature abilities.
- `data/current_roster_provenance.json` — exact 100 new NBA and 100 NFL names and sources.
- `data/athletes_700_summary.csv` — sortable review dataset.
- `tools/expand_current.py` — deterministic expansion using prior `data/athletes_500.json`, `data/signature_perks_500.json` and `generate_roster.py` for archetype baselines.
- `tests/test_v3_rules.cjs` — headless 140-match testing of draft sizes, seed consistency, map variations, championship and alliance rules.
- `tests/test_browser_v3.py` — optional Chromium / Playwright UI smoke test.
- `engine/`, `examples/`, `reports/`, `docs/`, `source_v0_1/` — retained reference simulator, historical specifications and prior tests.

## Test

```bash
node tests/test_v3_rules.cjs
# Optional: pip install playwright, install chromium
python tests/test_browser_v3.py
```

## Sources and limitations

- NBA: [2026–27 international opening-night player roster](https://www.nba.com/news/2026-27-international-players-opening-night), NBA.com, October 20, 2026.
- NFL: [2026 NFL depth charts](https://www.profootballnetwork.com/nfl-hq/depth-charts), Pro Football Network, October 23, 2026.

The 200 newly added **roster entries** are grounded in those dates and need rechecking for subsequent transactions. **All game ratings, behaviors, and perks are fictional provisional game design estimates**, not factual measurements or claims about actual athletes. No additional jersey numbers were displayed without verification. Commercial use of names/likenesses/real team designs needs independent rights review.
