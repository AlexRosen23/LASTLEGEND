# Validation, balancing, acceptance and implementation order

## Unit tests
- Rating weights in each contest add to 1.00.
- Sigmoid(0)=0.5; monotonic advantage; correctly configurable 9/14/21 temperatures; floating-point precision.
- Every RNG draw seeded and versioned; no `Math.random()` gameplay usage.
- Effect bonuses have correct stacking/caps and do not fire outside trigger.
- Uniform is sport-correct; no number if appearance unverified; numbers treated as strings.
- Non-numbered sports correctly omit fake jersey numerals.
- Same roster+seed+versions+arena yields identical event hashes/results.
- New seed can change outcomes; changing renderer FPS cannot change engine results.
- Invariants: no negative HP; no acted-after-elimination; no duplicated inventory; no duplicated athlete IDs; exactly 1 winner.
- Invalid use of an item/teleport across impassable cell fails safely.
- Navigation routes maintain reachable path; collapse closes logical zones, not invisible forced death.

## Scenario integration tests
1. Bolt outruns a slower pursuit on open tiles more often than on waterlogged forest; may still be caught.
2. Tyson has a credible close-combat advantage over an untrained opponent, but can lose due to fatigue, distance or group dynamics.
3. Phelps has genuine water advantage; on land his water signature doesn't activate.
4. Brady can gain value by observing; should not outstrike trained fighters by a "high IQ" magic boost.
5. LeBron coordinating willing allies beats his isolated coordination performance; no automatic guaranteed win.
6. Jordan/Mamba clutch only in documented late-stage or adverse checks; no universal win bias.
7. An alliance affects communication, supplies, relationship and possible future choices; cannot form between unseen distant actors.
8. Simultaneous 3-way cache approach displays all actors and correctly logs winner/transfer.
9. Encounter where both choose retreat produces no fictitious fight.
10. Collapse and hazards cause explicitly narrated impacts; multi-actor tie resolved by canonical order.
11. Replay is identical at 1×, 4× and Instant mode.
12. Winner story cites only valid ledger event IDs; output shows full 1st–12th rankings and consistent elimination counts.

## Batch simulation QA
- Run >=1,000 seeds for each major arena/preset with mixed-sport 12-person rosters and several all-sport rosters. More where confidence intervals require it.
- Report win rate (with confidence interval), top-3 %, average finish, eliminations, time alive, successful escape %, alliance frequency, perk activations, fatigue at death, hazards, average pace.
- Repeat using mirrored spawn positions and controlled equipment allocation to detect map-spawn and cache-placement bias.
- Expected general direction: specialist excels when specialty is tested. No blanket winner guarantee. Look for implausibly dominant athletes/perks, runaway team behavior, early total wipes or excessive stalemates.
- Measure p calibration in resolution buckets: events predicted at 0.7 should succeed ~70% over large samples, independent of athlete identity.
- For each category, expose toggles to disable perk, terrain and injuries and compare outcomes to isolate unintended bias.
- 1st-pass guardrails (diagnostic, NOT predetermined winners): <=1% match failures/no-winner; no deterministic 100% win rate across diversified seed runs without investigation; >=90% encounters have a human-readable causal explanation; <=5% narration QA flags; <=500 tick match completion for all test seeds. Balance criteria should be revised based on statistical power and real playtesting.

## Roster-data quality gates
**Current CSV has 250 curated CANDIDATES. Numbers are DRAFT even if familiar.** All `appearance_verification`, `rating_verification`, `perks_verification`, and `rights_review` flags are intentionally pending. Do NOT market as "250 accurate verified profiles" yet.

Each candidate needs verified identity/sport, chosen outfit edition, credible number-or-null, uniform permission strategy, 20 scored ratings with rationale and uncertainty tags, 5 clearly fictional behavior scores, signature perk, common perk(s), balance simulation, and reviewer signoff. A future sourcing workflow may use league archives, official player pages, trustworthy sport statistics and credible biographies. Don't scrape photographs for publication without permission.

## Performance / UI targets
- 12 active actors; 2D map updates should maintain smooth interaction on common desktop browsers; optimize for usable mobile viewing of match playback.
- Batch-mode 1,000 runs is headless and doesn't render sprites.
- Rendering loop interpolates state; engine tick rate independent.
- Story feed virtualized; event ledger compact and exportable as JSON.
- Deterministic snapshots saved periodically; clean pause/resume and replay seek.

## Engineering order (recommended)
**Milestone 0 — source data and legal**: Validate 250 roster candidates; 12 prototype rated profiles; appearance-verified jerseys for featured athletes, rights review.
**Milestone 1 — deterministic headless engine**: versioned PRNG, typed states, map generator, basic movement, decisions, supplies, hazards, collision, win conditions, event ledger.
**Milestone 2 — meaningful encounters**: spot/detect, negotiations, resource contests, chases, abstract skirmishes, probability and conditions, alliances and injuries.
**Milestone 3 — 12 prototype athlete perks + calibration**: integrate signatures, contexts, fatigue, balanced/realistic/chaos; 1,000-seed tests and logs.
**Milestone 4 — 2D visuals**: simple map and CSS/SVG stick-figure composer with actual outfit editions; multi-actor encounter scenes; pauses/speed/replay.
**Milestone 5 — storytelling and results**: event-locked narration, timelines, eliminated cards, finals and rematches.
**Milestone 6 — 250-person data curation**: expand from 12 tested to 250 verified profiles, no unsupported auto-filled traits; stress test roster diversity.
**Milestone 7 — usability/release**: accessibility, mobile layout, profiling, editor/rights/policy review, QA and distribution.

## Completion criteria for V1
12 distinct, fully reviewed athlete profiles are playable in a simulated battle; deterministic engine produces a valid sole champion; 12 sport-correct SVG figures; encounters show correct attire and verified numbers; event feed and optional why-inspector can explain each critical decision; rematch with new seed can produce upsets; repeat seed replays exactly. 250 candidate names are searchable, but publication of unreviewed entries must stay disabled until the data-quality gates pass.
