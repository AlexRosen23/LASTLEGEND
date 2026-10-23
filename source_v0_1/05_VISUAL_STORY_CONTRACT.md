# Stick-figure art, sport uniforms, story-feed and encounter contract

## Visual style
Hand-drawn-clean vector stick figures, readable at tiny map scale and large interaction scale. Round head; simple animated joints; torso overlaid with a *recognizable sport silhouette* (basketball sleeveless jersey, football pads jersey, soccer shirt/shorts, baseball uniform, hockey sweater, boxing trunks/gloves, track singlet, swim kit, tennis kit, gymnastics leotard/singlet, golf polo, cycling jersey, racing suit, ski kit, cricket shirt, judo gi/wrestling kit). Accessibility toggle offers reduced motion/high contrast.

### Number placement rule (important)
Number is placed on torso only if it is historically valid for the chosen athlete appearance edition and source-verified. Non-numbered sports show no numeral. Example: LeBron `23` with explicitly selected Cavaliers appearance; Brady `12` with Patriots appearance; Messi `10` Barcelona era; Tyson plain boxing trunks (no invented jersey); Bolt track singlet **without invented permanent bib number**. Race bib numbers are allowed only for a documented event-specific edition.

### Sprite system
- SVG-based modular renderer, source-of-truth `appearance_version` and event animation state.
- Separate figure layers: head/limbs/torso garment/number/back number/icon/equipment/status ring/shadow/name plate.
- Animations ~0.3–1.2 s: walk, sprint, dodge, guard, lunge, grab, wave, share, retreat, collapse, celebrate, hide, look-around.
- No gore or realistic violent animation. Use swish, impact burst and status bar change to signify contact.
- Colors should be generated from a small high-contrast palette. Avoid copying protected team logos without licensing.
- For crowd overlap: collision-aware label placement and stacked marker badge. All names and numbers readable in expanded encounter.

## When two or more athletes interact
REQUIRED: show enlarged stick figures with their correct sport kits/verified numbers, names and identifiers. This occurs for positive and neutral interactions too (negotiation, resource sharing, competing at a cache, spotting, fleeing). Do not only animate physical conflict.

Encounter card sequence:
1. **Arrival:** camera pans to tile and pops an interaction panel with all participants.
2. **Intent:** speechless icons/short text reveal each actor's attempted move.
3. **Action:** short sprite animation synchronized with a committed encounter beat.
4. **Resolution:** resource transfer/escape/fatigue/injury/alliance/etc appears in text and bars.
5. **Why:** optional expandable stat breakdown, modifiers, success probability and rolled sample; never claim deterministic certainty when probability was less than 100%.
6. **Return:** resume map follow or next high-priority scene.

For 2–4 actors, show them side by side; for 5–6, two rows; for 7+, horizontally paged group strip and focal pair; all participants exist in the scene state. Camera only reacts to already-resolved log events, never triggers them.

## UI wires
- Left rail: 12 athletes, jersey-like icon and `number if verified`, alive status and health/stamina bars.
- Center: 32×20 2D map, terrain legend, avatars, caches, weather, safe-zone ring, encounter pulse.
- Right: story timeline with event icon, tick/day, participant names, decisive sentence, expandable "details".
- Bottom: play/pause, 1× 2× 4× Instant, jump to next major event, camera follow dropdown, labels, audio, reduced motion.
- Top: survivors count, current phase/day, match seed, ruleset, tracked athlete name.
- End modal: winner hero stick figure + full placement order and victory explanation, rematch/replay buttons.

## Narrative production
The writer composes atmospheric text **from actual event facts** only. Suggested templates:
- DISCOVERY: "{A} spots a supply cache in {biome} and changes course."
- AVOIDANCE: "{A} sees {B} nearby. Low on stamina, {A} decides not to risk an encounter."
- CHASE: "{A} races for the tree line. {B} gives chase, but {outcome}."
- ALLIANCE: "After sharing {supply}, {A} and {B} agree to travel together."
- WOUND: "{A} takes a hit and backs away. Movement is now impaired."
- ELIMINATION: "{A} is eliminated near {location} following {last_confirmed_event}."
- FINAL: "Only {A} and {B} remain. The closing zone leaves one route forward."
- CHAMPION: "{winner} survives. Their decisive moments: {list_of_actual_events}."

Do not display unsupported spoken quotations attributed to real people. This is fictional sport-character behavior. TTS narrator optional in post-V1, must read actual event timeline. Use deterministic template IDs for replay consistency.

## Story pacing
At 1×, 1 notable scene every several visual seconds (time compression if necessary). Major scenes interrupt smoothly; insignificant movement stays visible but not narrated. "Instant" sim executes headless, then plays highlights. Feed filtering supports All, Eliminations, Alliances, Highlights and selected athlete. All state-changing events remain available in full replay even if hidden from default feed.

## Screen accessibility and motion
- Color alone never indicates health/teams/status.
- Render outfit/number + name redundantly, high contrast and screenreader labels.
- Toggle jersey-number display and captions.
- Reduced motion replaces fighting actions with static 2–3-frame panels.
- Avoid epilepsy-risk flickers, loud autoplay and gratuitous visual shaking.

## Story-grounding acceptance criteria
1. An event showing Tyson and LeBron together visibly renders boxer trunks vs basketball jersey #23 (after that outfit verified).
2. An event with Bolt shows a track singlet and **no fabricated #1**.
3. Three-actor alliance scenes show all three, not just the initiator and target.
4. Damage/escape text matches health/position deltas exactly.
5. An eliminated athlete is removed from map immediately after event resolves.
6. No unsupported tool, dialogue, location or injury is added by narration.
