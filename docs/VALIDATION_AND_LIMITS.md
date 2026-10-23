# Validation report, known limitations, next QA gates

## Terminology
- **Schema-complete**: field is present, type valid, unique identity and relationships resolved. Yes: 252/252 current profiles.
- **Prototype-implemented**: code path runs, has tests, produces coherent outcome. Yes for basic solo movements, perception radius, supply pickups, contact/escape, pair skirmishes, pair negotiations, zones and endgame.
- **Historically verified**: source corroborates asserted facts. Currently for attire number only **Tyrese Haliburton #0** and **Aaron Judge #99** via official league pages; **not for the other 250 numbers**. Rated capabilities are game estimates for all 252, not verified.
- **Balance validated**: cross-roster, cross-era, cross-map meaningful fairness established with statistical QA and reviewed assumptions. **Not yet achieved**; current batch outputs are smoke checks.

## How to interpret ratings
Every one of the 20 rated attributes (integer 1–100) and five fictional behavior preferences is **fictional game data**. The original 12 retain initial hand-entered design values. Haliburton and Judge have explicit provisional individual values. The other 238 are filled through (a) sport baseline, (b) manually assigned role when recognizable, (c) deterministic ±3 variation, and (d) limited named superstar overrides. This supplies *complete inputs* for development; it does not establish athletic-trait correctness or individual athlete psychology. The metadata records the method for auditing.

## Signature perk status
All 252 have distinct keys and athlete-labeled skill effects: one trigger, magnitude, target stat, stamina cost, activation limit and game-design description. This is a complete **structured rules data table**. Signature diversity is based largely on 30+ sport-role templates; it has NOT been independently researched for 252 unique biographies or each independently playtested.

The reference Python engine currently exercises general movement, contact, open sprints, two-sided defense, first contact, contested supply, alliances and some conditional late/pressure/observation perks. Specialized water, traversal, obstacle, recovery, and full post-betrayal social rules are not complete. The Claude prompt requires each catalog trigger to have implemented semantics and automated coverage in the TypeScript game.

## Known simplifications of current reference engine
- Basic Euclidean steering instead of actual tile-based A* navigation and occlusion.
- Perception uses distance and limited memory, not complete physical line of sight.
- Alliances are pair-based rather than full group memberships; no trustworthy long-term directed relationship graph.
- Pair encounters are the baseline; 3–6-person events must use group intent resolution in production.
- Arena map changes cache positions/labels but does not yet give each tile independent hazard, cover or traversal effects.
- Health is game HP, not realistic injury modeling; actor states include only health, stamina and generic supplies (full nutrition, equipment and injuries to follow).
- Late-stage forced convergence uses visible stat-based encounters, and is **explicitly** a simplification for the prototype.
- Presentation: offline replay samples recorded logs rather than live match simulation; seek positions use periodic snapshots and are approximate between stored ticks.
- Default narrative filters low-value events for UI (all committed events remain in match JSON).

## QA required before saying "ready"
1. Verify official/credible sport records and appearance editions individually. Mark `VERIFIED` only after audit and retain URLs.
2. Source and review athlete stat rationales per field with uncertainty. No claim of evidence where only a gameplay guess exists.
3. Implement every signature/secondary effect in actual engine. Explicitly fail on unsupported triggers instead of silently ignoring them.
4. Cross-run ≥1,000 seeds per mode/arena over multiple diverse 12-person groups, mirrored spawns and equipment configurations, with confidence intervals, statistic ablations and fairness investigations.
5. Assert renderer does not influence RNG; same seed/roster/versions produce identical event hashes; no act-after-death, negative inventory, duplicated HP or fake number.
6. Full TypeScript simulator parity tests against a stable **scenario outcome semantic contract**; do not claim byte-identical floats across languages if differing computations and hash algorithms are used.
7. Validate narration facts match event ledger, verified number rules, arena geometry, plural participant displays and champion story.
8. Rights and age-suitability review for names, likeness, historic outfits and promotional usage before public/commercial launch.

## Recommended evaluation reports
Run 12 mode×arena cells at several roster compositions. Report winner count/rate and Wilson confidence interval, top-three rate, median placement, encounter success by probability bucket, elims by cause, contribution of perks vs raw stats, mean match duration, alliance count, per-actor action counts, completion failure count, unreached resource count and exposure penalty counts. Avoid setting a target for a specific famous athlete's victory odds as a hard-coded design objective.
