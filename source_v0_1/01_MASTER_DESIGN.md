# LAST LEGEND — Master Game Design Specification
**Version:** 0.1 preproduction, 22 October 2026  
**Status:** Design-ready, NOT a working application or verified sports reference.

## North star
Twelve legendary athletes compete in a strategic survival battle on a light 2D map. During interactions, the UI shows expressive animated stick figures with **their correct sport-specific uniform and historically appropriate jersey number when that sport/athlete has one**. A narrated event feed tells the entire causally correct story. One person wins. Ratings create advantages; constrained uncertainty, environment, decisions, resources, and luck create upsets. Every match produces a replayable event log.

### Locked decisions
- **Roster library:** 250 curated candidate athletes at launch (expandable after verification).
- **Selection:** 12 athletes PER MATCH; add/remove individually or fill from searchable draft pool. No 250-character live battle. (Optional fewer than 12 for dev tests, not primary public mode.)
- **View:** small top-down animated 2D arena; large SVG/canvas stick-figure scenes for interactions involving 2+ athletes. Not 3D.
- **Story:** prominent causal, suspenseful, readable scene-by-scene narration, drawn only from confirmed engine events.
- **Winner:** sole non-eliminated athlete; full 1–12 placements, stats, highlights, replay and rematch.
- **Randomness:** user selects Realistic/Balanced/Chaos; every result derives from stats + actual situation + reproducible seeded draws.
- **Tone:** playful, cinematic, PG-13 stylized sports-fiction. Avoid gore and unfounded allegations about real athletes' behavior or character.
- **Development phase:** design and data-prep only. This is NOT a Claude Code build prompt.

## Match UX / screen flow
1. **Home**: New Battle; Rematch; Replay; Simulation Lab; Athlete Codex.
2. **Roster draft**: 12/12 slots, autosuggest sports/eras, search, previews, inspect rated traits, remove and shuffle, prevent duplicate athlete IDs, allow prime-era visual editions only if properly curated.
3. **Setup**: Map (Wilderness/City/Ruins/Frozen), match seed auto/manual, randomness preset, speed (1×/2×/4×/Instant), accessibility.
4. **Live screen**: Header = phase/day/remaining; left = alive roster with health/stamina; center = 2D top-down map; right = scrolling live story; lower strip = pause, next major event, speed, camera follow, replay timeline.
5. **Encounter**: Scene card/sidebar shows 2–6 *participating* stick figures, correct kit/number, step sequence, motivations, tested attributes, modifiers, and consequence. For bigger groups, horizontal scrolling rather than truncation. Other characters continue to occupy map positions.
6. **Elimination**: Clear callout of cause and actor(s), not gratuitous descriptions; never contradict engine state.
7. **End**: Champion cinematic/summary; full placements; performance breakdown; pivotal play; encounter timeline; rematch same roster/new seed; replay exact seed.

## Principles of fairness
- Strength is not combat technique. Elite sprinting isn't marathon endurance. Strategy isn't omniscience. Popularity has no power score.
- Athlete stats differ by **domain**; contest-specific weights choose relevant ratings. No universal overall-power win roll.
- Real achievements support physical/competitive ratings; speculative survival or social personality is an openly fictional game tendency, not biography.
- Default opponents can disengage rather than fight. Alliances must have observable reasons and future consequences.
- No athlete has a guaranteed match outcome. Don't hardcode favorite wins, scripted rivalries, branded antagonism, or reality-show betrayal.
- In a more uncertain ruleset, superior athletes still retain an edge in situations that match their strengths.

## Domain system
**20 base ratings (1–100)**: strength; acceleration; top_speed; agility; endurance; durability; reflexes; coordination; balance; recovery; striking; grappling; combat_defense; tactical_iq; awareness; composure; adaptability; resourcefulness; leadership; clutch.

**Five fictional in-game preference scores (0–100)**: aggression; caution; alliance_drive; loyalty; opportunism. Preferences affect **chosen actions**, not automatic winning or intrinsic moral character. These are designer-defined personas and should be labeled accordingly.

**Separate measured data** (nullable): height_cm, weight_kg, reach_cm; historical uniform/team/era; sport-specific skill tags. Never guess athlete measurements to fill gaps. These can influence silhouettes and modest bounded bonuses only with support and user-visible disclosure.

**Mutable state**: health 0–100; stamina 0–100; hunger 0–100; hydration 0–100; stress 0–100; wounds list; inventory; temporary buffs; relationships; team/alliance; position; heading; last observed enemies; pending decision; eliminated flag/reason; survival ticks. Starting values equal unless a map setting says otherwise.

**Equipment**: supplies (food, water, first aid, shelter material), traversal equipment, defensive tools and generic game weapons. Avoid detailed real-world injury mechanics; item effects are abstract gameplay modifiers. Inventory mass/capacity forces choices.

## Match phase progression (illustrative tuning)
- **Opening (0–20% of intended match progress)**: 12 competitors begin at fairly dispersed locations. Initial movement; caches; exploratory meetings. Avoid instant guaranteed spawn eliminations.
- **Exploration (20–50%)**: resources matter; alliances; navigation; hazards; escape decisions; stakes rise.
- **Convergence (50–80%)**: resource scarcity, shrinking zone and new incidents push separated athletes together.
- **Finale (80–100%)**: decisive but still fair encounters. Escalating safe-zone pressure forces conclusion; no unexplained automatic winner.
- **Hard fail-safe**: at maximum ticks, continuously shrink traversable safe tiles to force contested meetings; if multiple competitors die in a single event, resolve prior initiative and causation consistently; never arbitrarily choose a winner by rating.

Virtual time: 1 tick = 15 in-world minutes (tunable). Start with 32×20 logical tile map, speed-dependent interpolation for smooth character movement. Deterministic engine updates and visual frame rate are separate; rendering never changes physics/RNG. Upper bound 500 ticks with progressively escalating zone pressure; adjust with simulated playtesting, not prescriptive match length.

## Arena tile schema
Tile has biome, traversal cost, cover, sightline, elevation, water depth, temperature/hazard, resource slots, structure ID, passability. Example biomes: open field, dense forest, river, ruins, cliffs, sheltered compound, snow. The sport isn't a free terrain bonus; an athlete's trained/relevant traits and explicitly curated sport-tag perk are the mechanism.

A believable map has a connected main traversable network, safe spawn separation, escape routes, varied risks, and no inescapable pockets except deliberately signaled hazards. Supply scarcity may introduce competition, but every competitor should have plausible initial choices.

## Dynamic story
Each engine event is an immutable object with tick, actors, locations, intentions, attempted actions, check inputs, chosen outcomes and state deltas. Narrative templates render from this ledger only. Example: "Bolt sees Kobe near the eastern cache. Bolt breaks away. Kobe keeps the supplies." The writer MUST NOT add unsupported violence, relationships, motives, gear, movements or eliminations.

Narrative priority: critical elimination > multi-actor encounter > alliance shift > injury > hazard > major supplies > movement > ambient. Rate-limit low-value lines; preserve all in replay. Story scenes and map location are synced by event ID.

## Uniform / number truth rules
- NBA/WNBA, NFL, soccer, MLB, NHL, cricket and motorsport often support distinctive jersey/race numbers, **but the number may change by era/team**. Pick a documented *appearance edition*; never call one number universally correct across career.
- Running race bibs and swimming lane labels are **event-specific**, not athlete-owned permanent numbers. Do not fabricate #1 for Bolt or Phelps.
- Boxing, MMA, tennis, golf, gymnastics, judo, wrestling and many other sports do **not** use a permanent player number on the primary uniform. Render sport-correct apparel **without a made-up jersey number**. Every character still gets readable name label.
- Historical affiliation logos and licensed likenesses are optional and must pass a separate rights review before commercial distribution. Generic sport silhouettes/unbranded uniform colors are safe provisional assets from a production standpoint, subject to legal review.
- Exact display number is only shown when appearance_verification=VERIFIED; otherwise omit number and show a small "kit pending verification" admin flag, not a made-up numeral.

## Risk register
- **Subjective ratings**: clear provisional labels, source/provenance, review workflow, simulation validation, correction log.
- **Cross-era/cross-sport comparison**: avoid treating self-reported sports statistics as commensurate. Human sports-data curator reviews normalized traits.
- **Athlete likeness/licensing**: real names/depictions/uniform marks raise differing publicity/trademark issues across jurisdictions; obtain professional review before public commercial launch.
- **Violence and storytelling**: fictional non-graphic eliminations only; no claims about actual people being malicious, violent or deceitful.
- **Engine exploitability**: seed isolation, fair starting positions, condition checks, no rule-changing narration.

## What V1 is NOT
No 3D assets, no open-world fighting mechanics, no multiplayer PvP, no sports betting, no monetization-first mechanics, no AI deciding who wins, no live player statistics ingestion, no full licensable celebrity art pipeline, and no promises that subjective ratings constitute scientific predictions.
