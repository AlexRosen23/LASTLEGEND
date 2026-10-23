# Autonomous decision and encounter engine — executable design contract

## Authority and deterministic update
The only source of truth is a headless state transition loop. Rendering and AI narration are read-only consumers. State updates are atomic per tick; commit one immutable event batch and snapshot hash per tick.

**Seeded PRNG:** use a stable versioned PRNG (such as PCG32 or xoshiro) with independently derived named streams (`world`, `movement`, `encounter`, `hazard`, `social`). Store seed, PRNG implementation version, simulation ruleset version, athlete ratings version and arena generator version with match. For strict replays, use the stored event ledger AND ability to recompute a hash-equal state from inputs. Never invoke `Math.random()` from gameplay paths.

### Tick pipeline (ordering locked)
0. Read immutable current snapshot, phase, environment, current safe zone.
1. World advances: weather, hazard, supply spawn/removal, visibility, zones.
2. Update limited perception for each living actor, based on line of sight, cover, weather, prior sightings. No telepathy/global map knowledge.
3. Each actor calculates its own action utilities and commits one intent: move, search, rest, eat/drink, heal, hide, approach, flee, signal, negotiate, confront, use discovered equipment. No access to later randomness.
4. Simultaneously reserve and resolve movement; resolve contested paths via stable deterministic priority derived from event seed and action priority, not array insertion order.
5. Detect near-space overlaps/line-of-sight encounters, group connected participants; avoid duplicate groups and double-use of actors/tick.
6. Resolve social negotiations, physical encounters, discoveries, hazards, status effects through explicit sub-phases with finite event steps and stable initiative order.
7. Commit health/resources/positions, eliminations, alliance changes and per-actor stats atomically.
8. Append structured events; emit display scenes and story templates; calculate match termination.
9. Save state hash, integrity checks, update spectator playback positions. Renderer cannot alter outcome.

## Actor decision process
Generate a shortlist of legal actions with actual observable targets. For each action, compute expected utility with features for:
- Staying alive (+ high when injured or vulnerable)
- Water/food needs
- Exposure to hazard/safe-zone pressure
- Available supplies and route distance
- Opportunity value of contested resources
- Known opponents' credible threats and likely reactions
- Trust/alliances/debts and leader instructions
- Energy cost and recovery tradeoff
- Fictional game tendencies (aggression/caution/alliance_drive/loyalty/opportunism)
- Short tactical lookahead (1–2 ticks) based on *perceived* world state.

Utility function can be simple weighted features. Softmax action sampling means similarly good plans vary across seeds; never randomize across patently suicidal actions unless no safe alternative. In Realistic, policy temperature is low; Chaos is slightly higher. Action sampling uses actor ID-derived PRNG stream, not a global random call order. Record alternate top-2 actions and why choice was made to explain the story.

## Relationships
Directed `trust[A][B]` range -100..+100; initial 0 unless expressly chosen rivalry *as a fictional scenario setting*. Alliance requires visibility/contact and successful mutual consent (trust, goal alignment, threat pressure). Alliance ends because of witnessed harmful actions, incompatible objectives, resource scarcity or strategic divergence; never because a narration system whimsically says betrayal.

A player can ally, keep distance, negotiate supplies, lead, defect or coordinate without literal fighting. Temporary teams have shared observation and optional supplies with limits. No global omniscient hive mind.

## Encounter = 2+ agents in interaction range
Triggers: same cache, conversation proximity, confrontation, coordinated rescue, opposed routes, zone bottleneck. A scene must contain **every direct participant**; bystanders remain visible on the map and may enter subsequent linked scenes. Encounter types include:
1. `CONTACT`: spot/avoid/watch/approach.
2. `CONTEST_RESOURCE`: race/negotiation/claim/share.
3. `ALLIANCE`: offer/accept/refuse/exchange/break.
4. `CHASE`: pursue/flee/cutoff/escape.
5. `SKIRMISH`: short non-graphic physical exchange, defense, disengagement, injury, elimination.
6. `HAZARD`: group navigation, shelter/retreat, optional collaboration.
7. `FINAL`: forced proximity as zone contracts; same mechanics, no scripted champion.

### Multiactor scenes
For 3–6 participants, first capture who sees whom and why; independent intents may differ. Group resolution uses coalition intents and local positions, never simple sum of individual "power" ratings. Per encounter create 1–4 beat events and a final consequence. The system supports 7–12 participants through pagination/scrollable scene strips; no actor mysteriously disappears from authoritative state. Attack/defense abstract mechanics must remain PG-13/non-graphic.

## Probability and context
See `02_RATINGS_AND_CALIBRATION.md` for the numeric formulas and contest weight matrix. Encounters must log: scenario, challenge type, each actor's weighted stat score, state penalties, environmental modifiers, perk activations, final scores, probability, RNG draw, choice and state effects. This is the complete audit trail.

### Example encounter (illustrative, not predetermined)
Actor A fleeing score = 72; Actor B pursuit score = 58; Balanced temp=14: flee chance ~73%. Seeded roll 0.61 -> escape success. If roll were 0.87 -> the pursuit succeeds and progresses to a positional or contact sub-event; this does **not** automatically imply an elimination. A follow-on fight computes its own relevant contest with fatigue, terrain and combat technique.

### Damage and elimination model
Only skirmishes, environmental hazards and other clearly logged encounters can reduce health to 0. Track `health` separately from `stamina`, hunger and hydration. Injury effects selectively penalize relevant abilities until treated/recovered. Instead of graphically depicting realistic injuries, show hit reaction and abstract UI bars. Damage per successful exchange from generic abstract severity table (e.g., light 6–12 HP, medium 13–22 HP, serious 23–35 HP) tied to item tier, circumstance and defense checks; cap repeated exchange count per scene, allow escape between beats. **No instant permanent elimination on every successful attack.** Explicitly address ties and multi-actor simultaneous knockouts via committed initiative and consistent causal ordering.

### Safe zone and fairness
Contraction happens in coherent phases, publicly warned via map overlays and narration. Hazard severity scales only with phase/tick. It doesn't secretly target the currently strongest player. It can push separated competitors to meet but should not erase hidden players without a narrated hazard resolution. Cap match at 500 ticks then progressively reduce navigable area; still require explicit event(s) for the winner.

## Narrative contract
Narrative is not allowed to introduce facts. `SceneEvent` schema:
```
{
  "event_id": "e-00134", "tick": 33, "type": "CHASE",
  "participant_ids": ["usain-bolt", "kobe-bryant"],
  "location": {"tile_x": 12, "tile_y": 6, "biome": "ruins"},
  "intents": [{"actor":"usain-bolt","action":"FLEE"},{"actor":"kobe-bryant","action":"PURSUE"}],
  "resolution": {"check":"SPRINT_ESCAPE","a_score":72,"b_score":58,
    "probability_a":0.7311,"seed_draw":0.61,"winner":"usain-bolt"},
  "effects": [{"actor":"usain-bolt","stamina_delta":-12},
              {"actor":"kobe-bryant","stamina_delta":-7}],
  "narration_key":"CHASE_ESCAPED", "severity":"major"
}
```
Event generator only uses known fields; optional style model may paraphrase supplied facts under automated factual checking. Every narration can expose "Why this happened" explanation with ratings + probability + rolled result. No unsupported dialogue masquerading as actual athlete quote.

## High-level pseudocode
```
for tick in 0..MAX_TICKS:
  world = advanceWorld(previous.world, rng.world)
  observations = observeForEachAliveActor(previous.actors, world)
  intents = eachActorPlan(observations, previous, rng.decisionStreams)
  positions, contactCandidates = resolveSimultaneousMovement(intents, world, rng.movement)
  encounters = groupInteractions(contactCandidates, positions, world)
  events = resolveInteractions(encounters, previous, world, rng.encounter, rng.social)
  events += resolveHazards(world, positions, previous, rng.hazard)
  next = atomicApply(previous, world, intents, events)
  assert(invariants(next))
  ledger.append(events, checksum(next))
  if countAlive(next) == 1: publishChampionAndStop()
  previous = next
```

## Mandatory invariants
- Every participant on screen exists and is in the canonical world state.
- Dead actors never move, act, narrate new events or join alliances.
- All state deltas conserve supplies and make actor HP/stamina bounded 0–100.
- No athlete is simultaneously in two distinct encounters/tick.
- A chase success changes relative position/route, not automatically a kill.
- No implied inventory item can be used unless actually owned.
- No appearance number shown unless verified for that athlete/edition.
- Results order has 12 unique athletes and exactly one #1 winner.
- Every elimination has an event, source actor/hazard, tick and causal chain.
- Replay same versions + seed + roster + arena reproduces event hash.

### Terminal-safety rule for simultaneous hazards
Resolve lethal events in canonical stable priority order. As soon as exactly one participant remains alive, stop committing additional lethal effects and finalize that survivor as champion. This prevents a zero-survivor tie created only by tick batching. The ordering rule is declared in match metadata and is not biased by athlete rankings or narrative preference.
