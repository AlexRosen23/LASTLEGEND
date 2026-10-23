# LAST LEGEND — Full Preproduction + Executable Prototype + Claude Code Handoff

**Version:** 0.2.0 | **Prepared:** October 22, 2026 | **Status:** Functioning **headless reference simulator** and offline replay preview, with a complete but **provisional** playable 252-athlete dataset. The full React game still needs to be built using the included master prompt.

> 12 athletes per game. 252 selectable athlete profiles (original 250 preserved, plus Tyrese Haliburton and Aaron Judge). 20 attributes + 5 fictional behavior settings per athlete. One signature perk and two secondary perks per athlete. Four map setups and three randomness presets. Deterministic seeded outcomes, event-backed eliminations and one winner. Stick figures with sport-correct kit classes and ONLY source-verified jersey numbers visible. Every real appearance number other than Haliburton #0 and Judge #99 must be researched/approved before public display.

## Start here

1. **To build the full web app with Claude Code:** read `prompts/CLAUDE_CODE_MASTER_PROMPT.md`. Copy the **entire ZIP** into a new project folder and pass the prompt to Claude Code, which must inspect this README and all referenced files.
2. **To see an offline UI concept:** open `preview/index.html` in any modern browser. It replays a *previously generated* match; it does not run new matches in the browser.
3. **To see the tested uniform rendering:** open `preview/verified_kit_encounter.svg`.
4. **To run a match:** `python -m engine.cli --seed 20261022 --out examples/my_match.json`
5. **To run validation:** `python -m unittest discover -s tests -v`
6. **To compare outcomes:** `python -m engine.cli --batch 100 --seed 20261022 --arena CITY --mode BALANCED --out reports/city_balance.json`
7. **To regenerate generated athlete data:** `python generate_roster.py` (pure stdlib; this is reproducible from the bundled `source_v0_1/` source data).

Run Python commands from this package root. Python 3.10+ recommended. No network access, keys, databases or external Python packages needed for the reference engine.

## Files

| File/folder | Contents |
|---|---|
| `prompts/CLAUDE_CODE_MASTER_PROMPT.md` | Comprehensive build prompt: final deliverables, tech stack, implementation milestones, tests, source of truth, acceptance gates |
| `data/athletes_252.json` | 252 completed schema-shape profiles: 20 ratings, 5 behavior settings, attire, source/review flags, perk references |
| `data/athletes_252_summary.csv` | Sortable audit/report version of the full roster |
| `data/signature_perks_252.json` | 252 deterministic contextual perk entries; includes triggers, limits, costs and rationale labels |
| `data/secondary_perks.json` | 25 secondary modifiers |
| `data/ruleset_config.json` | Eight contest scoring weight sets, presets and four arena configurations |
| `data/appearance_verification_queue.json` | Pending costume and number research queue |
| `data/official_verified_appearance_sources.json` | Official source links for Haliburton #0 and Judge #99 |
| `engine/simulation.py` | Executable **reference** engine with seeded decisions, 2D positions, contact/chase/fights/alliances, supplies, zones, final stat-based encounters and event log |
| `engine/cli.py` | Single-match runner and batch runner |
| `tests/test_simulation.py` | Data and core simulation regression tests |
| `examples/sample_match.json` | Full recorded match (original 12) |
| `examples/haliburton_judge_match.json` | Full recorded match including both requested additions |
| `preview/index.html` | Play/pause/seek narrated 2D viewer for recorded match, using SVG stick figures |
| `preview/verified_kit_encounter.svg` | Standalone schematic of Haliburton, Judge and Tyson with appropriate kit number rules |
| `docs/` | Release scope, data QA, limitations, tests and developer handoff notes |
| `source_v0_1/` | Original design and initial input dataset preserved, not overwritten |

## Tested vs. intentionally not claimed

**Actually implemented and tested:** executable headless 12-athlete Python reference engine; reproducible winner/placements and event ledger across same seeded inputs; 252 complete *provisional* stat records and 252 typed signature definitions; outcome probabilities in three modes; four arena definitions; recorded match JSON; offline SVG replay prototype; source-verified #0/#99; automated invariants and matchup tests. See `reports/validation_summary.json` for measured test totals.

**Still to implement or independently verify:** a true interactive browser simulation engine/TypeScript port; sophisticated 3–6-way coalition logic; advanced spatial pathfinding/line-of-sight, water and obstacle terrain effects; fully executable behavior for every situational perk trigger in the Python reference; source-quality athlete ratings for **all 252**; candidate jersey numbers and historical appearance editions; rights/licensing; multi-thousand-run calibrated tuning; game-grade animation/performance/mobile QA. These are mandatory tasks in the Claude Code prompt. Do not present this ZIP as a finished commercial game or a scientifically validated prediction engine.

## Decision log
- Added Tyrese Haliburton, basketball, Pacers #0 confirmed via NBA official profile.
- Added Aaron Judge, baseball, Yankees #99 confirmed via MLB official profile.
- Preserved all original 250 choices, so pool size is **252**; selection remains exactly **12** per match.
- No assumption that the athlete's real behavior resembles any fictional game choice. No generated claims of real-world violence.
- All non-verified jersey numbers remain candidate metadata and **must not render** until reviewed. For sports without permanent numbers, no made-up number.
- Reference finale now resolves by actual seeded, attribute-based encounters rather than arbitrary sudden-death HP selection.
