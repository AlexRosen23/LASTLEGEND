# Perks and athlete identity — V1 catalog
**Rule:** each athlete has **one signature perk**, up to **two secondary perks**, and at most **one situational drawback**. No perk wins a match outright. Perks must have visible, testable triggers. One event's total perk score bonus is capped at +10; overall context modifiers bounded by ±20 except documented special mechanics. Activation info recorded in the event ledger.

## Signature athlete perks (provisional fantasy gameplay, not factual personality claims)
| Athlete | Signature | Trigger | Engine effect & tradeoff |
|---|---|---|---|
| LeBron James | The Floor General | Coordinating 1+ consenting allies | +7 tactical_iq effective score on team coordination; no bonus alone |
| Michael Jordan | The Closer | Last 4 alive, first decisive contested event | +7 clutch-derived check, one activation per match |
| Kobe Bryant | Mamba Focus | Behind in a contested objective | +6 composure/check, -6 stamina upon use |
| Tom Brady | Film Room | Has spent a tick observing opponent | +7 threat anticipation next encounter only |
| Usain Bolt | Lightning Start | First 2 actions of an open-lane escape | +9 burst-based contest, additional 7 stamina spent |
| Tyreek Hill | Cheetah Burst | First open-space pursuit/escape exchange | +8 speed contest; immediate recovery penalty next tick |
| Mike Tyson | Explosive Entry | First close-range skirmish beat | +9 striking-based attack; costs 8 stamina |
| Muhammad Ali | Rope-a-Dope | Defense after surviving earlier skirmish beat | +8 defense, no opening-beat attack buff |
| Michael Phelps | Water Mastery | Swimming through a water tile | +10 water traversal and escape; no land bonus |
| Lionel Messi | Tight-Space Control | Narrow urban/ruins passage | +8 agility-based evasion; no open-field sprint bonus |
| Serena Williams | Return of Serve | Ambushed but has line of sight | +7 reflex-based defense, once per encounter |
| Simone Biles | Perfect Landing | Elevated/obstacle terrain | +9 balance/coordination hazard check, no contact-combat bonus |

## Global secondary perks (assign based on reasoned sport capability)
| Key | Name | Trigger and bounded effect |
|---|---|---|
| SECOND_WIND | Second Wind | Below 35 stamina, once per match recover 12 stamina after a successful escape |
| FIELD_VISION | Field Vision | Spotting a known target in open terrain: +5 awareness |
| ENDURANCE_ENGINE | Endurance Engine | Sustained walking/treading: -20% stamina cost |
| QUICK_FIRST_STEP | Quick First Step | First dash out of rest: +5 acceleration-based check |
| IRON_BALANCE | Iron Balance | Slopes/uneven footing: +5 balance hazard check |
| SOFT_HANDS | Soft Hands | Fast supply grab: +5 coordination check |
| CALM_UNDER_FIRE | Calm Under Pressure | Critical high-threat decision: +5 composure |
| COMMAND_VOICE | Command Voice | Allied group coordination: +5 leadership |
| BATTLE_SENSE | Battle Sense | Detect active opponent approach: +5 awareness |
| STAY_READY | Stay Ready | Reaction defense after rest: +4 reflexes |
| DEEP_RESERVES | Deep Reserves | Long travel only: +5 endurance check |
| EFFICIENT_MOVEMENT | Efficient Movement | Route of 3+ tiles: stamina cost -10% |
| FAST_RECOVERY | Fast Recovery | Safe rest zone: +3 extra stamina recovery |
| ADAPT_ON_THE_FLY | Adapt on the Fly | After previous failed attempt at same *type*: +4 adaptability (one use per type) |
| ANCHOR_STANCE | Anchor Stance | Defensive contact on stable ground: +5 balance/strength effective |
| ELUSIVE | Elusive | Evasion in cluttered terrain: +5 agility |
| NAVIGATION_EYE | Navigation Eye | Familiar area after 2 explored visits: +4 awareness |
| TRUST_BUILDER | Trust Builder | Good-faith exchange completed: +8 relationship trust (not encounter outcome score) |
| SUPPLY_DISCIPLINE | Supply Discipline | Prevents 10% food/water loss from hoarding/handling (not magical creation) |
| FOCUS_MODE | Focus Mode | First serious contested objective per day: +4 tactical_iq check |
| LATE_SURGE | Late Surge | Final 3 competitors: +4 one stamina-intensive action, then -4 stamina |
| DEFENSIVE_READ | Defensive Read | After witnessing opponent's technique: +4 combat_defense next relevant check |
| AERIAL_CONTROL | Aerial Control | Crossing small obstacles: +5 coordination/balance check |
| STRONG_GRIP | Strong Grip | Holding contested item: +5 strength-based check |
| QUICK_CALCULATION | Quick Calculation | Detect a nearby safer route: +4 tactical_iq/navigation assessment |

## Contextual tradeoffs (not unfounded personal flaws)
| Key | Mechanical price |
|---|---|
| HIGH_BURST_COST | Extra sprint creates 7 more stamina cost |
| HEAVY_FRAME | Cost +10% stamina on repeated long climbs where size is mechanically relevant |
| SMALL_FRAME | -4 on pure mass-based shoving checks, +3 on cramped-route evasion |
| CONTACT_SPECIALIST | No automatic bonuses for long marches/water crossings |
| WATER_SPECIALIST | Major bonus only in water, not dry-ground contact |
| FOCUS_COST | Signature costs 5–8 stamina |
| OPPORTUNITY_COST | Preparation-based signature requires spending prior tick observing |
| LIMITED_ACTIVATION | Signature only once per match/phase/encounter |

## Perk scoring law
Perks may modify **effective check score, resource/energy cost, or action utility**; they may not directly replace random draws, guarantee a hit, fabricate inventory, transfer knowledge from hidden enemies, or make elimination inevitable. Use cooldowns/duration, log every activation and its impact, and turn perks off if the documented condition isn't satisfied.

## 250-identity expansion procedure
- There are 12 complete illustrative signatures above, NOT 250 falsely researched signatures. The 250-roster CSV is a *candidate list* only.
- Signature expansion requires 250 reviewed contextual perk entries, each with ability rationale, trigger, magnitude, charge/cooldown, drawback, and tests.
- Build secondary ability variations from archetypes but keep uniqueness: no 250 arbitrary +10 buffs with different names.
- Offer a developer admin tool to compare any athlete's effectiveness per arena and identify overpowered perks.
