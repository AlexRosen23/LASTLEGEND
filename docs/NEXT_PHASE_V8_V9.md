# NEXT PHASE — LAST LEGEND V8: 500 Encounters, Storm AI, Public Launch, League-wide Rosters

**Status:** Planned after V7 spectator release. This is a design brief, not a claim of implementation.

## Priority order
1. V8.0 — Build 500 distinctive character-aware encounter types.
2. V8.1 — Update the seeded simulator to prioritize survival within the shrinking storm.
3. V8.2 — Complete public launch QA and content/accessibility controls (the Pages URL is already publicly accessible).
4. V9.0 — Add every current NHL, NFL, NBA and MLB roster player using rights-compliant, dated source data.

## 500 encounter types
Exactly 500 unique scenario definitions, each with a stable ID, category, requirements, allowed bodies/roles, sport/equipment constraints, location/biome rules, story beats, animation cues, intensity, and compatibility with existing committed simulation outcomes. A different sentence with identical interaction must not count as a unique type.

- 110 realistic scenarios: pursuit, stealth, resource grabs, clashes, alliances and recoveries.
- 100 comic/absurd scenarios: coherent mascot rivalry, athletic mishaps, improbable but understandable slapstick.
- 100 identity/context scenarios: sport, role, equipment, team/era and signature-move-aware without fabricated biographies.
- 85 nonhuman interactions: distinct horse, mascot, vehicle, aquatic and undead behavior.
- 65 intense/brutal encounters: consequential collisions, impact, hazards and eliminations.
- 40 optional mature-content encounters: clearly labeled, opt-in graphic violence, with a non-graphic default for a public game.

Each template must validate the participants' body types and current state before selection. A car drives, a horse gallops, an aquatic character uses appropriate terrain, and a mascot uses a costume-appropriate motion. Relationships, teams, perks and rivalries come only from game facts. Deterministic seeded selection should avoid repetitive encounters and never overwrite actual combat outcomes, kill counts, positions, or future events. Design for 2–100-player matches. Do not attribute fictitious real-world misconduct or quotes to living athletes.

## Storm-survival AI
Modify the simulation (not just presentation) to evaluate current and next zone radius, detect exposure, and choose feasible safe routes. As the circle shrinks, pursuit of supplies and fights must yield to reachable safe positions. Characters stranded outside should promptly head inward, navigate obstacles, and use stamina intelligently. Keep distinct risk tolerance without irrationally camping in damaging storm zones. Test 2, 12, 24 and 100 entrants across all four biomes and many seeds: verify inward movement when exposed, determinism, event consistency and a single champion. Investigate and report genuinely unreachable edge cases rather than weakening tests.

## Public release gate
GitHub Pages is public already; complete real desktop/mobile browser testing, stable performance, clear mature-content labels and defaults, onboarding, robust controls, privacy-minded feedback, and permission/licensing review before aggressively promoting the release. No invented official endorsements or unlicensed team imagery.

## All-player Big Four roster expansion
Import every current active NHL, NFL, NBA and MLB roster player with source URL, league, team, canonical athlete ID, roster-status scope, retrieval date and edition. Handle trades, two-way/injury lists, alternate names, diacritics, multi-sport IDs and historical character variants without silent merges. Use appropriate official/licensed sources and validate data rights. Keep the existing 1,203 historical/crossover characters. Index, paginate and virtualize the much larger catalog instead of rendering thousands of cards at once. CI must validate dated roster snapshots, duplicate/conflicting IDs, 2–100 match determinism and browser performance.

## Boundaries
- No new replay system in the current V7 feature delivery.
- The 500 encounters, AI changes, and full roster expansion are next-phase commitments, not current release features.
- The current game's original simulation determines events; animations and narratives must remain evidence-grounded.