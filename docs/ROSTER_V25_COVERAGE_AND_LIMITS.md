# Last Legend V25 — Big Four roster integrity gate

## Verified snapshot (2026-10-23)

The public `gh-pages/data/active_rosters_v24.json` feed was captured at `2026-10-23T22:50:55.440339Z`. It includes every team **as reported by ESPN's public team-roster feed**, not independently certified league eligibility.

| League | Franchises | Unique ESPN-listed players | Roster memberships |
| --- | ---: | ---: | ---: |
| NBA | 30 | 517 | 517 |
| NFL | 32 | 2,557 | 2,557 |
| MLB | 30 | 1,119 | 1,119 |
| NHL | 32 | 850 | 850 |
| **Total** | **124** | **5,043** | **5,043** |

Audited fields: `teamCount`, `playerCount`, all 124 team IDs/names, `rosterCount` per team, player IDs, unique membership/team, status, position, team code, source-date metadata. All 124 source team counts match recorded memberships.

## V25 guardrails

1. **Team-scoped reconciliation.** A league cannot pass solely because its total exceeds a minimum. Every team's declared `rosterCount` must match the actual number of recorded memberships. Duplicate player IDs, duplicate memberships, missing affiliation details and team-ID/name/code mismatches fail validation.
2. **Atomic install.** Stage athlete and signature additions before mutating the game catalog, then commit together only after validating unique IDs and one-signature-per-player invariant.
3. **Unambiguous freshness.** If the roster feed is unavailable, the game falls back to existing playable athletes but must not imply the latest league rosters loaded. If the feed is older than 48 hours, the source-date label shows a stale warning.
4. **Regression fixtures.** Synthetic 124-team test coverage includes undercount/overcount, duplicate memberships, mismatched team affiliations, incorrect totals and rollback after an import failure.

## Scope limitations — do not overclaim

- **Not official league eligibility verification.** ESPN's current reported team rosters can lag trades, call-ups and moves. No independent NBA/NFL/MLB/NHL official daily registration reconciliation has yet been completed.
- The feed may exclude certain practice-squad, minor-league, unsigned, contract-only, or otherwise affiliated athletes depending on ESPN's published roster definitions. All 124 teams being represented does **not** prove every eligible player is present.
- Only one active-season game entry is generated per ESPN player ID, using that person's preferred active membership; previously implemented historical/career editions remain separate.
- Jersey numbers, physical appearance, abilities, ratings and behavior require individual review where the product needs biographical accuracy. All generated ratings and personality/game behavior are fictional balance estimates.
- Daily sync and public delivery need ongoing CI monitoring; 48-hour age is a source-freshness alert, not proof that the feed contains every same-day transaction.
- Permissions for names, team marks, art and likeness must be reviewed before commercial use.

## Reproduce / verify

```bash
python tools/sync_active_rosters_v24.py --output data/active_rosters_v24.json
node tests/test_active_rosters_v24.cjs
```

The first command requires network access to ESPN's publicly accessible site API and intentionally fails closed if the source is incomplete. The second command operates on an **offline synthetic fixture**, not on the production snapshot. The GitHub Actions roster-sync workflow separately publishes the dated source JSON to `gh-pages` only after its capture checks pass.

## Next completeness gate

Independently reconcile each league and franchise against a season-dated authoritative league feed, identify missing statuses/sub-rosters, maintain an exception report per player ID, and verify game search/draft/profile reachability for every imported player on desktop and mobile. Do not label absolute player coverage complete until those comparisons pass.
