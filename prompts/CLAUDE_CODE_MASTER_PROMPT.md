# CLAUDE CODE — MASTER BUILD PROMPT

## Mission: Build LAST LEGEND from this package into a fully playable local browser game

You are acting as the lead game simulation engineer, frontend engineer, designer, test engineer, and product data curator for a new independent project called **LAST LEGEND**. Read this complete prompt, then immediately inspect this repository. **Do not simply restate the plans. Implement the working application, test it, and leave me an executable build and precise run commands.** Do not ask me a series of design questions. Make sound reversible design choices using the source files, accurately distinguish completed vs. unfinished work, and leave any externally dependent/manual-verification item in an explicit queue instead of fabricating completion.

### Canonical user requirements — DO NOT change

1. User picks **exactly 12 athletes per match** from a library of **252 athletes**. The original 250 were kept and **Tyrese Haliburton** and **Aaron Judge** were added. The library may grow later; the 12-person match count is fixed for V1.
2. The app simulates an autonomously evolving survival tournament with **one** champion. It is a playful PG-13 sports-fiction game inspired by elimination-survival fiction, not a licensed *Hunger Games* product. The narrative covers the entire match and announces the champion with full standings.
3. The simulation is **NOT pure random** and **NOT highest-overall-rating-wins**. Sport-informed ability ratings and domain-specific check weights dominate relevant tasks, while terrain, injuries, fatigue, supplies, strategy, alliances, situational perks and reproducible random rolls make genuine upsets possible. LeBron cannot win every match simply because he has many high ratings.
4. **Barebones animated 2D visuals:** a top-down map with little **stick-figure athletes**. When **two or more athletes interact for any reason**, expand to a panel that visibly shows **all interacting players** as recognizable stick figures wearing the appropriate **sport-specific jerseys / uniforms with their historically verified and edition-appropriate number**. If the sport has no permanent number (boxing, tennis, track outside specific bib editions, etc.) or the number isn't verified, **DO NOT invent a number**. A name label must always display.
5. Every encounter shows what each actor intended, what happened, the context and meaningful stat/check contributions, seeded roll, and specific consequences. The story **must only narrate immutable facts committed by the simulation**. AI-generated commentary is optional polish only and cannot create events or decide outcomes.
6. Controls: play/pause, 1×/2×/4×/Instant, seek, next key moment, replay same seed, rematch new seed. All visual clock settings are independent of physics/RNG.
7. End-of-match screen: champion, complete 1st–12th ranking, eliminations, encounters, most impressive escape, decisive moments, exportable replay and simulation-lab batch outcomes.
8. Keep this a **standalone project**; optional later links to the user's Constellation hub must not block launch. No betting features, no pay-to-win, no 3D.

### Exactly what has already been provided

Read in this order:

- `README.md` and `docs/VALIDATION_AND_LIMITS.md` — source of truth for what is actually implemented and what is provisional.
- `docs/PRODUCT_AND_UI_SCOPE.md` — product UX and acceptance examples.
- `data/athletes_252.json` — *all 252 athlete profile entries already filled*. Each has 20 full gameplay ratings, five fictional behavioral sliders, sport/role, appearance candidate metadata, 1 signature perk and 2 secondaries, and data-quality flags. These values are **game design estimates**. Do not market as factual measurement or scientifically validated.
- `data/signature_perks_252.json` — 252 athlete-keyed, typed signature perks with trigger, target, effect size, stamina cost and activation scope. Template-derived but complete data. Use all 252 records.
- `data/secondary_perks.json` — 25 secondary perk definitions.
- `data/ruleset_config.json` — all contest weight tables, randomness temperatures and arena cache positions.
- `data/official_verified_appearance_sources.json` — primary sources for Haliburton Pacers #0 and Judge Yankees #99.
- `data/appearance_verification_queue.json` — do not confuse unverified `candidate_number` with a display-ready `display_number`.
- `source_v0_1/*.md` — original design documents, formulas and QA intent.
- `engine/simulation.py`, `engine/cli.py` — the **working Python headless REFERENCE**, its caveats explicitly listed in `docs/VALIDATION_AND_LIMITS.md`. Do not blindly translate its simplifications as the final game architecture.
- `tests/test_simulation.py` and `examples/*.json` — existing regression scenarios and sample event logs.
- `preview/index.html` and `preview/verified_kit_encounter.svg` — **working static offline replay concept** and sport-appropriate SVG stick-figure reference. The preview is not a live sim, not the final frontend.

**Preserve source data and source docs intact.** Implement the production app in a clearly separated `app/` (or similarly reasonable) directory. Avoid casually renaming athlete IDs or deleting original candidates. If existing package files are missing, report the exact blockers, not an invented result.

## Concrete implementation deliverables

### A. Real frontend that actually runs a new match

Use React + Vite + TypeScript strict mode (or justified equivalent). Clean black/forest-green/dark-gray stadium broadcast presentation with warm gold highlights. **Stick-figure sprites**, not portraits. Responsive for desktop and iPhone. Avoid protected sports team crests or player headshots; use generic kit shapes and contrasting uniform colors.

Screens:

1. **Home / dashboard:** `NEW BATTLE`, `ROSTER`, `SIMULATION LAB`, `REPLAYS`; preloaded showcase roster; brief disclosure that this is fictional gameplay.
2. **Athlete draft:** searchable/filterable 252 entries by name/sport/role, inspect 20 attributes and perk explanation; select 12 exactly, each with persistent slot and removal; distinct athlete IDs; include Haliburton and Judge in search with clearly visible sport and rating panel; quickfill and shuffle; never allow 13th athlete, duplicate identity or 11-athlete Start.
3. **Match settings:** arena (Wilderness / City / Ruins / Frozen), randomness (Realistic / Balanced / Chaos), optional manual integer seed, visual speed, reduced-motion preference.
4. **Live arena:** SVG or Canvas2D 32×20 tile map; nature/urban/ruins/snow environment aesthetics; caches, walkable routes, terrain blockers, safe-zone edge; moving stick figures with a minimum readable silhouette; left status roster and focus athlete; right story feed; bottom replay controls; top survivor/day/tick status. Status changes must be driven by actual simulated state.
5. **Interaction viewer:** trigger for CONTACT, alliance, negotiation, chase, cache race, hazard affecting groups, fights and finale with **all participants**, typically 2–6 and overflow/pagination up to 12. Modular SVG sprite slots: head, jointed arms/legs, sport-appropriate jersey or singlet/trunks/cap/pads, legitimate `display_number` string only when verified, nickname/name label, health/stamina bars, one simple motion (`approach`, `run`, `brace`, `lunge`, `dodge`, `retreat`, `share`, `celebrate`). All genders correctly supported; no stereotyping required. Accessibility reduced-motion mode shows 2-frame static cards.
6. **Event inspector:** each key event renders intention per actor, observed context, weighted stat input, state penalties, activated perks, probability of chosen outcome, seeded draw, and actual delta. No made-up narration.
7. **Results:** winner spotlight, placements 1–12, timeline, eliminations and causes, encounters, resources, highlights, CSV/JSON optional export, replay same exact seed and new-seed rematch.
8. **Simulation Lab:** run 100/500/1000 headless seeds using the actual production rules; show win rates and sample sizes, not pretend real-world probabilities. Must allow athlete/arena/preset comparison and perform efficiently without stalling UI.

**Performance:** rendering runs at its own frame rate and only interpolates immutable snapshots. Headless sim works without browser UI. 12 on-screen athletes and a continuously updated map must remain fluid on a modern laptop. Make important feed events visible and keep the full raw ledger downloadable.

### B. Ship a serious autonomous simulation engine, not a random winner function

Implement a strict typed pure TypeScript simulation core separate from React, with **seed/version/roster/arena/preset** completely determining all outcomes. Use a stable seeded PRNG (e.g. PCG32/xoshiro with versioned substreams); do not call `Math.random()` in any gameplay code. Do not let event rendering, UI speed or sorting mutate rolls. Preserve original IDs and run versions in replay metadata. Store periodic state snapshots and an append-only audit ledger.

**Actor model:** 20 static attributes + 5 fictitious tendencies from data; dynamic health, stamina, hydration, hunger, stress, injury effects, supplies/items, perceptual memory, group allegiance/trust, coordinates/heading, active perk cooldowns, intentions, alive/eliminated, counters and survival time.

**Map model:** 32×20 or similarly small logical grid with connected traversable areas, obstacles/cover, resource caches, sightline geometry, weather/special biome, genuinely distinct hazards and traversal costs. Use seeded map variations while retaining coherent landmarks, fair spawn distances, reachable cache paths and nontrapping safe-zone transitions. Wilderness needs a true navigable water feature so Phelps/water specialist perks matter. City/Ruins need actual narrow passages/cover. Frozen needs actual cold/ice hazards.

**Decision model:** actor picks a legal action from limited *perceived* information, not omniscient opponent positions. Intended actions include explore, seek cache, rest, eat, drink, heal, hide, move, flee, watch, approach, negotiate, share, ally, withdraw or briefly confront. Utility should consider own survival and resource status, last known enemy strength, immediate hazard, risk, available escape routes, tendency profile and short lookahead. Seeded weighted choices allow personality variety. No suicidal/random movement with perfect safety information hidden. Capture top alternative choices to explain major decisions.

**Tick algorithm (deterministic):** advance weather/zone → perceive limited environment → every surviving actor selects intent from immutable snapshot → simultaneously resolve movement/claims → group and resolve connected encounters → apply injuries/consumables/alliances/hazards with stable initiative → atomically commit state → validate invariants → append immutable events & state hash → determine single champion. No eliminated athlete acts in later ticks.

**Interaction engine:** CONTACT, RESOURCE_CONTEST, ALLIANCE/NEGOTIATION, CHASE, SKIRMISH, GROUP_HAZARD, GROUP_RETREAT and FINALE. Handle 2–6-person interactions as *actual groups*, not just unrelated simultaneous pair checks: compute each participant's intended role, environmental advantage, allies/nonallies, inventory and relative positions; render all involved. For groups 7–12, allow stable subscene pagination without dropping anyone from the engine's authoritative group state. An interaction is not automatically a fight or kill. Favor evasion when appropriate, especially for sprint specialists facing combat specialists in open space.

**Probabilities:** use weights in `data/ruleset_config.json` per relevant challenge. Effective score = relevant weighted traits + legal context/perk bonuses – contextual stamina/injury penalty, with capped modifiers. If A has score 72 and B has 58, the prototype example uses `logistic((72-58)/T)` where temperature T is 9/14/20 for Realistic/Balanced/Chaos, respectively, giving roughly 82.6%, 73.1%, 66.8%; no guaranteed favorite. Clamp extreme probabilities to avoid inappropriate certainties. Use stable seeded draws and record probabilities, roll and win decision. A pursuit win does not imply an elimination. Match win probability emerges from the **entire simulated tournament**, not from these one-off encounter odds.

**Perks and archetypes:** all 252 signatures, 25 secondaries and contexts supplied need actual execution. Add validation that every `trigger` has a resolver and tests that activate it in an appropriate scenario and verify it doesn't activate elsewhere. Source perks must never directly decide a champion, spawn unlimited goods, invent intelligence about unseen opponents or stack beyond +10 effective check points unless a documented non-score resource effect; track charges and stamina cost. `group_coordination`, `late_finale`, `under_pressure`, `after_observe`, `open_sprint`, `first_contact`, `contact_defense`, `water_crossing`, `urban_evasion`, `contested_supply`, `obstacle`, `long_trek` and `recover_when_low` must all work. Improve sports-grounded, athlete-specific flavor when evidence permits, but do not arbitrarily invent personality flaws. The current reference does NOT exercise every trigger and that's an explicitly required completion item.

**Relationships and story:** alliances should require contact and mutual acceptance, influence future resources/perception/decisions, and dissolve for logged reasons; do not claim the real named athlete is disloyal or violent. Fictional behaviors are explicitly game abstractions. Persist relationship maps.

**Finale:** warn visibly before safe-zone shrink. Rising zone pressure pushes everyone together via navigable paths and hazards. Ensure the last survivors interact through resolved domain-weighted encounters. At hard time cap use a visible rule-governed confrontation, not `sortByOverallRating`, `Math.random winner`, arbitrary hidden damage or silent lethal tie. Every eliminated player must have a causal event and no zero-survivor deadlock.

### C. Build the data layer and art rigorously

- Import all 252 records with run-time schema validation and descriptive errors. Do not silently drop Tyrese, Aaron or any sport group. No character needs a fabricated portrait or third-party image download.
- Preserve `display_number=null` for 250 unverified appearance records; render their sport kit + readable name. Haliburton should wear generic basketball gear with **#0** for the Indiana edition; Judge generic baseball uniform with **#99** for the Yankees edition. Historical kit identifiers may be shown only after source-reviewed edition-specific verification and rights review; sport/club logos are never implicit licensed assets.
- For boxing/MMA/tennis/gymnastics and runner examples, **do not put random player numbers on shirts**. Race bib is event-specific, not permanent. For confirmed numberless events, store explicit null and show name/kit.
- Keep potential real-world physical attributes separate and optional. Do not assign claims of inherent violence, moral failing or psychiatric status to real individuals.
- Add an internal roster review dashboard (source link, review flag, note, data version, rating uncertainty, rights disposition). Treat original 250 draft numbers as candidate **hints only**; no guessing which edition wore a number.
- The supplied 20-stat ratings are **provisional game-designer estimates** including deterministic variation, not a validated population study. Preserve their origin metadata and create a reproducible balance-edit workflow. Improve historical/biographical facts from reputable league/team archives **only when those sources are genuinely accessible**; otherwise leave them marked provisional and provide a concrete review queue. Never pretend all 252 have been deeply researched.

### D. Engine-grounded storytelling and cinematic presentation

The storyteller receives event facts, not vague "tell me who dies" prompts. A fully structured `MatchEvent` includes `{event_id,tick,actors,location,perceptions,intents,contest_weights,raw_scores,state_modifiers,activated_perks,probability,roll,result,effects,causal_parent_ids,narration_key}`. Derive all player-facing copy from it. Critical moments include actor names, actual location, action and resulting consequence; never invent real quotations, gear, alliances or elimination methods. Optional generative narration must be fact-checkable and have template fallback. Add suspense without changing truth, similar to a dramatic live sports broadcast, but keep violence non-graphic.

Interaction close-up sequence: **arrival → intentions → action beats → resolution → "why" breakdown**; pause/speed/skip must never alter engine result. If 3 players meet, show 3 visible stick figures and 3 independent intents. If 7 interact, show all participants via paging without deleting extras. The UI is intentionally minimal 2D, not a 3D simulation.

### E. Mandatory tests and automated quality gates

Create and run modern TypeScript unit/integration tests (Vitest/Jest) and at least one browser smoke test (Playwright if environment allows). Retain Python reference tests as an independent smoke contract; report differences clearly.

Required test categories:

1. Data: 252 unique valid IDs; exactly 20 1–100 ratings, 5 0–100 fictional settings, one valid signature + two secondaries per athlete; Haliburton and Judge selectable; original 250 preserved.
2. Apparel: verified #0 and #99 visible, unverified numbers hidden, boxing/runner no fake permanent numbers; appropriate silhouette per sport. Test 2, 3, 6 and 8 participant scenes.
3. Engine: same seed+roster+map+versions produces identical placements and event/state hashes regardless of 1×/4× or UI frame rate; changing the input order of an equivalent set doesn't change results. Other seeds yield a variety of outcomes.
4. Probabilities: all challenge weights sum 1; monotonic score advantage across temperatures; no invalid probabilities; outcomes binned by predicted win likelihood roughly calibrated in large enough samples; all draws logged and verifiable.
5. Actor state: no eliminated actor moves/acts, no health below 0 or above 100, no negative supplies, no duplicated inventory, no unlogged instant elimination, no spectator influencing rules, no unknown target/gear, no dead alliances.
6. Perks: trigger passes/fails in the correct context for **every** signature/secondary trigger, cost/cooldown tracked, score/perk caps enforced and visible.
7. Environment: connected map, fair spawns, actual traversable rivers/obstacles/cold tiles, pathfinding with occlusion, safe zone shrink appropriately warns and consistently resolves hazard effects.
8. Group encounters: real 3-way contested supplies, up to 12 group participants handled, independent intents, valid relationships and agreements, unique scene IDs; no hidden bystander actors or contradictory inventory.
9. Replay and narrative: every scene matches event participants, HP deltas, location, source and probability; seek displays correct past alive/dead status; every event name in UI is from ledger; champion exactly one; all 12 placed.
10. Statistical QA: at minimum **1,000 seeds per map/preset using multiple roster compositions** before claiming balanced. Report all win rates, confidence intervals, mean survival ticks, elimination causes, average active encounter count, underdog event rate, perk utilization and pathological scenario frequency. If runtime constrained, run a documented subset and flag remaining cells, do not falsely mark complete.
11. Manual browser test: selecting Haliburton + Judge with 10 others → starting → multiple interactions with visible sport jerseys/numbers → narration → one winner → replay same seed → rematch new seed → lab run. Verify no console exceptions or missing asset URLs.

**Do not force an artificially equal 1/12 winning chance across very different athletes.** Diversity of outcomes should arise from context and meaningful uncertainty, not winner equalization or scripted balance.

### F. Milestone execution order (actually code each stage)

**M0 — Audit and plan (brief):** report inspected source files, count roster, available build tools, tech choices and known gaps. Save `IMPLEMENTATION_PLAN.md` and short `SOURCE_INTEGRITY.md`. Do not spend most of your time documenting instead of building.

**M1 — Foundation:** Initialize Vite React TS, lint/test commands, styling, data import validation; render home, draft and athlete inspector with all 252 entries.

**M2 — Deterministic gameplay:** Implement the standalone TS engine, map and actor states, seeded RNG, decisions, encounter engine, perks, event ledger, terminal guarantee. CLI/headless tests first, then batch mode. Compare reference Python concepts carefully rather than copying known simplifications.

**M3 — 2D spectator:** Finish map rendering and sport-aware SVG figure composition. Include actual stick limbs and recognizable kit, readable vetted number labels, movement, encounters for 2–12 participants, reduced-motion and legend.

**M4 — Narrator and results:** Commit-driven story feed, why-inspector, result ranking, replay seek/speed, champion scene, saved matches, new-seed rematch.

**M5 — Hardening:** simulation lab, CSV/JSON export, accessibility, responsive layout, data review editor, test coverage, source-verification flags, documentation and runbook.

At the end, give me **exact terminal commands** to start the app, where the files live, what tests actually passed, what intentionally remains provisional, and a sample seed+roster I can replay. Do not say a command ran if it did not, do not mark tests passing without output, and do not claim licensed assets or researched facts without corresponding sources.

### Definition of done

A user can actually launch `npm run dev`, select **any 12 of all 252**, press Start and watch **a fresh live-simulated battle** on the 2D map. Enlarged sport-appropriate stick figures appear whenever ≥2 interact; a real causal story evolves; opponents chase, avoid, ally, collect resources, suffer conditions or spar according to rated strengths; seed-controlled random variation allows upsets; exactly one champion is crowned with 1–12 standings; the same seed recreates the same game; changing seed can change the winner; the batch laboratory calls the exact same rules; major in-game interactions show a verified number only when legitimate. The app works locally without requiring cloud APIs or commercial licenses for artwork. Data and provenance remain transparently provisional until manually verified.

**Begin by inspecting `README.md`, `data/athletes_252.json`, `data/signature_perks_252.json`, and `engine/simulation.py`. Then implement.**
