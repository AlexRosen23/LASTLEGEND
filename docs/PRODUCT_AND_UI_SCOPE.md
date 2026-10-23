# Product specification and acceptance scenarios

## Locked V1
- 252 draftable named athletes, exactly 12 per match. Search/filter by sport, decade, name, archetype; draft slots with clear difference between saved roster and active match.
- One athlete champion, full 1st–12th order, seed-recorded match metadata and reproducible rematch.
- 20 attributes + 5 explicitly FICTIONAL gameplay tendencies, one signature and two secondary perks per athlete. All appear in an athlete detail inspector.
- Four arenas: Wilderness, City, Ruins, Frozen; each should materially change the terrain rules.
- Realistic/Balanced/Chaos randomness. Stats and contexts bias outcomes; seeded rolls allow upsets.
- 2D overhead arena with 12 animated stick figures in sport-correct unbranded kits. During **any 2+ person interaction**, enlarge the **actual participants** with jerseys, caps, trunks, singlets, gloves and correct verified number or **no number**, including dialogue-free alliance and chase scenes.
- Sport-aware kit silhouettes: NBA basketball jerseys, NFL padded uniforms, baseball buttoned jerseys + caps, soccer shirts/shorts, hockey sweaters, cricket shirts, motorsport jumpsuits, cycling/skiing gear, swimming suit, tennis outfit, track singlet, gymnastics attire, boxing trunks/gloves, MMA/wrestling variants and non-numbered uniforms.
- Side panels: roster/alive/HP/stamina; live map/safe-zone overlay; narrated story with event IDs; controls; inspector for roll probability, relevant ratings, active context bonuses and roll; postgame results and rematch.
- Dark, clean, tongue-in-cheek sports-broadcast aesthetic. No 3D. No graphic real-world violence. No imaginary direct quotes spoken by named real athletes.

## User flows
1. Home → Build Roster (12 slots) → Map + randomness + seed → Start.
2. Simulation plays visually → map tokens move smoothly → notable encounter triggers enlarged stick-figure scene → structured narrator explains committed state changes.
3. Story entries clickable to seek saved timeline; advanced panel reveals exact percent, seeded RNG draw and modifiers.
4. Play/pause/1×/2×/4×/Instant and Next Major Event. These only control presentation, not actual engine results.
5. 12 → 1, champion scene, placements & eliminations, statistics, pivotal highlights, export/download match JSON, Same Seed Replay, New Seed Rematch.
6. Simulation Lab runs N independent seeds headless, reports ranked win frequencies and a clear "GAME MODEL OUTPUT, NOT REAL WORLD ODDS" qualifier.

## Game-invariant scenarios Claude must test
- 12 selection slots; >12 is blocked, same athlete twice is blocked; different input order alone doesn't alter seed/result.
- Every actor visually dressed for their sport; #0 Haliburton and #99 Judge; Tyson no number; unreviewed candidates no visible numerals (may show one after human verification, tied to appearance edition).
- Three people approaching a cache display **three**, not a cherry-picked pair; aggregate scene roles reflect each actor's intent and actual outcome.
- Bolt's open sprint can beat bigger athletes, but not guaranteed. Tyson's close-range fight skill matters without making him unbeatable. Phelps receives water advantage in actual water terrain when port is finished, not dry roads.
- A two-actor contest shows probability and sampled roll; user can replay with identical seed and see identical result.
- Alliance needs proximity/visibility and consent; alliance effects persist into movement and future decisions and can terminate for logged reasons.
- Injuries, fatigue, resources, map, cover and zone contraction propagate through later decisions.
- Final six may take many ticks; no arbitrarily selected champion or scripted celebrity comeback. Match still ends reliably with exactly one winner.
- No fabricated narration or outfit number; every sentence tied to event facts.

## Architecture target
- Vite + React + TypeScript strict mode; CSS/SVG for figures & encounter close-ups; SVG or Canvas2D for 32×20 map. No WebGL or imported trademark images.
- Pure TypeScript deterministic simulation library independent of React; typed versioned rules and safe stable PRNG; structured event log and snapshots; no AI model in outcome path.
- Local persistence IndexedDB (or localStorage where small), downloadable JSON replays; simulation worker for background calculation if needed, UI clock separate.
- Data imported from `data/*.json`, verified at build time; initialize from complete 252 roster, all marked game estimates, none silently omitted.
- A11y: keyboard focus, screen reader event announcements, reduced-motion, no color-only state; responsive desktop/mobile.
