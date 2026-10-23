# Athlete ratings, scoring and calibration

## Rating field dictionary
All ratings are integers 1–100. This is a *game balancing system* with approximate sport-grounded inputs, not measured probabilities or scientific cross-sport truth.

| Code | What it represents | Evidence/tuning note |
|---|---|---|
| strength | Force/power in contact and lifting | Sport power feats; don't conflate with size |
| acceleration | First steps and short burst | Sprint splits/film when available |
| top_speed | Maximum open-space straight-line speed | Recorded speed/competitive sprint times where comparable |
| agility | Cutting, rapid directional changes | Sport-specific agility |
| endurance | Sustaining effort over time | Discipline/training; distance ≠ sprint |
| durability | Withstanding gameplay attrition | Conservative proxy; no unsupported medical assumptions |
| reflexes | Rapid response to stimuli | Competitive sport demands |
| coordination | Complex motor precision | Sport-specific skill demands |
| balance | Stable posture on poor terrain | Movement skills |
| recovery | Gameplay stamina return after effort | Broad conditioning, cautious provisional |
| striking | Hand-to-hand striking technique | Strongly rewards verified combat sport expertise |
| grappling | Clinch/wrestling/submission technique | Combat sport expertise; not just brute strength |
| combat_defense | Avoidance/guard positioning | Technique matters independent of size |
| tactical_iq | Analyzing evolving competition | Sport decision-making; extrapolated as a game trait |
| awareness | Detecting cues/surroundings | Field/court vision and reactive awareness |
| composure | Executing under stressful pressure | Competition track record; conservative |
| adaptability | Switching tactics in new situations | Observable versatility where possible |
| resourcefulness | Solving novel logistical problems | All default toward neutral due to limited sporting evidence |
| leadership | Coordinating willing partners | Game analog of sport leadership |
| clutch | Executing decisive actions under pressure | Trait for critical moments, not a guarantee |

### Recommended numerical anchors
- 95–100 = generationally exceptional for THAT trait in the combined athlete population, rare, reviewer required.
- 85–94 = exceptional international/professional standard.
- 70–84 = highly capable among other elite athletes.
- 50–69 = capable but not specialized relative to this uniquely elite roster.
- 30–49 = clear relative limitation compared with specialty competitors.
- 1–29 = very uncommon; needs convincing rationale; avoid stigmatizing.

The model should not force every athlete to have a 95+ stat; sport diversity will naturally create uneven distributions. Each rating stores `rating_value`, `confidence` (low/medium/high), `rationale`, `source_links[]`, `reviewer`, `reviewed_at`, `rating_version` and `is_provisional`. Sample packaged JSON currently stores simplified provisional values only.

## No universal "overall" winner selector
Averages are useful for previews but must NEVER select event winners. Real event resolution selects a domain-specific contest and its relative attributes:

| Contest | Weighted rating ingredients (sum = 100%) |
|---|---|
| Sprint escape | 30% acceleration, 25% top_speed, 20% agility, 15% awareness, 10% endurance |
| Sprint pursuit | 25% acceleration, 25% top_speed, 15% agility, 20% awareness, 15% endurance |
| Sustained trek | 45% endurance, 20% recovery, 15% balance, 10% adaptability, 10% awareness |
| Close contact | 30% striking, 20% combat_defense, 20% reflexes, 15% strength, 10% agility, 5% balance |
| Grappling contact | 35% grappling, 20% strength, 20% combat_defense, 15% balance, 10% endurance |
| Defense/escape contact | 25% combat_defense, 25% agility, 20% reflexes, 15% grappling, 15% awareness |
| Cache contest | 25% awareness, 20% acceleration, 20% coordination, 20% tactical_iq, 15% reflexes |
| Hazard navigation | 25% awareness, 25% balance, 20% coordination, 20% adaptability, 10% composure |
| Tactical ambush detection | 35% awareness, 30% tactical_iq, 20% composure, 15% adaptability |
| Persuasion to ally | 35% leadership, 25% composure, 20% tactical_iq, 20% adaptability, plus relationship state |
| Endgame clutch action | Use underlying event weights, then grant contextual clutch modifier up to +5 score |

For any contested task the engine computes effective score = weighted average + context bonuses - penalties. All context adjustments are explicit in log and **normally bounded to -20..+20 total** before skill score comparison (special events may have documented exceptions). Perks are contained within the context cap and cannot multiply the base rating.

### Probability rule
For A versus B:

`diff = scoreA - scoreB`  
`P(A wins) = clamp(1 / (1 + exp(-diff / temperature)), 0.03, 0.97)`

For an obstacle with difficulty `D`, replace scoreB with D. `temperature`: Realistic=9, Balanced=14, Chaos=21. These are starting parameters, subject to Monte Carlo tuning. Randomness comes from ONE seeded uniform draw against this probability **per actual contest**. No extra mystery dice roll is applied to the score. Terrain and fatigue change effective scores, not the hidden RNG algorithm. A hard impossibility (blocked wall/no reachable path) is resolved by navigation rules rather than a probabilistic contest.

**Example:** Athlete A has effective escape score 72, athlete B pursuit score 58. With Balanced temperature 14, A succeeds with ~73.1% chance. A very strong favorite might succeed 9 out of 10 in one type of situation, but across a multi-day chain of decisions no one is assured the match.

### Context adjustments (initial tuning examples)
- Severe stamina depletion: -12 on exertion-heavy actions; moderate depletion -5.
- Significant injuries: -4 to -15 on *affected* movement/fighting checks only.
- Familiar shelter/cached intel: +3 to +7 awareness or navigation, but only after in-game discovery.
- Dense forest sprint: -8 top-speed relevance; stronger agility/awareness weights rather than fixed sport prejudice.
- Open paved lane: +4 to +7 for successful acceleration/top-speed-based movement, applied symmetrically.
- Fighting uphill/poor footing: -3 to -8 contact check depending on actual position.
- Strong numerical advantage: +4 to +9 for coordination/positioning, capped to prevent simple pile-on certainty.
- Surprise: temporary +4 attacker opportunity, -5 responder until noticed; must be based on stealth/detection check.
- Rested/healthy vs depleted: reflected via the actual tracked stamina/health/wounds, not vague story text.

Never treat a 15% random factor as a literal universal formula; `temperature` is a more transparent and mathematically testable implementation of varying upset frequency.

## Behavior preferences: not historical factual claims
`aggression`, `caution`, `alliance_drive`, `loyalty`, `opportunism` shape ACTION UTILITY. They are explicitly fictional game personas, must not be presented as claims about personal ethics, criminality, or "who would really kill." Per athlete these begin from neutral profiles, are human-reviewed, and can be randomized with a visible "fictional personas" setting. High ambition in sport should NOT automatically equal real-world aggression.

## Ratings authoring protocol for 250
1. Add identity and versioned appearance, with uniform/number evidence if applicable.
2. Select sport archetype as *starting scaffold only*; never assign all athletes in sport identical ratings.
3. Assign distinctive sport skills, known physical traits and tactical profile, logging low confidence for weakly observable cross-domain traits.
4. Add 1 unique signature, max 2 common secondary perks, plus a bounded drawback from an observable gameplay tradeoff (not moral speculation).
5. Review potential extreme combinations; run 1,000+ seeded matches across mixed sports/arenas; inspect distribution, not preconceived winners.
6. Add regression tests and version stamps. Keep pre-revision replays running against the stored version, not the current balance patch.

## Archetypes should have limits
- Sprinter: great short speed, more stamina consumption during repeated sprints; not necessarily endurance specialist.
- Football power athlete: burst/power/contact durability; no free combat technique.
- Boxer/MMA fighter: highly credible combat skills; may struggle with long navigation or food management.
- Basketball point forward: awareness/coordination/leadership; terrain and smaller opponents still matter.
- Marathon runner: outstanding endurance and economy, not same as short sprint or striking.
- Swimmer: big movement edge in water; no arbitrary advantage on dry land.
- Gymnast: balance/coordination/elevated traversal; not automatic pure strength dominance.
- Soccer dribbler: agility, close control, reactions; not automatic martial arts mastery.
- Tennis player: reflexes/coordination/competitive composure; no fictitious weapon training.
- QB: anticipation/composure/leadership; does not inherit teammates' running speed or size.

## Appearance data model requirement
`appearance_version = { sport, team_or_country, season_or_event, outfit_style, primary_color, secondary_color, display_number: string|null, number_kind: 'jersey'|'racing'|'event_bib'|'none', verification_status, citation_urls[] }`
Use string number because `0`, `00`, and leading zeros are legitimate in sports contexts.
