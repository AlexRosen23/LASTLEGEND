# Roster and evidence audit

## Actual counts

- Basketball: 36
- American Football: 30
- Association Football: 30
- Boxing & MMA: 22
- Baseball: 21
- Track & Field: 18
- Tennis: 16
- Ice Hockey: 15
- Swimming: 12
- Gymnastics: 10
- Golf: 10
- Motorsport: 7
- Cricket: 7
- Cycling: 6
- Snow Sports: 6
- Other Sports: 6

**Total: 252 athletes.** Two official-verified display numbers, 250 awaiting further checking. All 252 individual ratings remain explicitly provisional and require independent review.

## New requested athletes

- **Tyrese Haliburton** — Basketball, Indiana Pacers (2024–25 appearance edition), #0 (NBA official), archetype `point_guard`, designer signature *The Passing Lane* (group coordination). Strong provisional tactical awareness and coordination; not a claim about a future situation.
- **Aaron Judge** — Baseball, New York Yankees (2022 appearance edition), #99 (MLB official), archetype `baseball_power`, designer signature *The Towering Read* (contested supply). Strong provisional game power, not a physical strength measurement.

## How additions affect match mechanics

Draft pool = 250 original + 2 requested = 252. Per-match competitors = 12 unchanged. Both additions inherit full stats, personalities, signature effect, two shared secondary perks, sport-appropriate apparel, and appearance sources. Their signatures use data-backed *context types*, but the numeric bonuses are fictional balance settings.

## Sources for verified numbers

- Haliburton: https://www.nba.com/player/1630169/tyrese-haliburton
- Haliburton: https://www.nba.com/pacers/roster
- Judge: https://www.mlb.com/player/aaron-judge-592450
- Judge: https://www.usabaseball.com/player/aaron-judge

## Review procedure

See `data/athlete_review_queue.csv`. For every unverified record, find authoritative season-and-team uniform evidence, verify number or explicitly mark no permanent number, record valid source URLs and rights disposition. To approve a number, update `appearance.verification_status`, keep `appearance.edition_label`, and set `appearance.display_number` from the vetted source; do not blindly copy `candidate_number`. Ratings separately require a sport-specific research rationale and QA signoff.
