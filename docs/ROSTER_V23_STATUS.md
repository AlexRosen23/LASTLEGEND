# Last Legend — V23 roster expansion audit

## Implemented and tested

- 1,203 unchanged embedded V4 entries.
- 442 **new, non-duplicative named athlete candidates** selected from the existing curated candidate index (`tools/expand_roster.py`), representing **16 sports**.
- 7 previously implemented distinct career editions (V7), yielding **1,652 playable catalog records**.
- Every new athlete has 20 game-balance ratings, five **fictional** behavioral tendencies, one working signature ability, and two secondary traits. Signature IDs match the in-game perk registry.
- New V23 entrants appear in Legends search, sport/team filters, the **New V23 Legends** collection, dossiers, draft selection, deterministic gameplay and post-match records.
- The added records are sourced from the project's candidate list. They are **not certified active-season rosters**. The optional historical affiliation labels are illustrative and need independent citation review.

## Audit boundaries

A named athlete being included is not proof of current team, season, official jersey number, appearance rights, a verified likeness, personal characteristics or historical achievement. Unverified shirt numbers are intentionally left blank. Fictional ratings, aggressiveness, alliances, and abilities are game mechanics rather than claims about the people represented.

The original 1,203 records include multiple legitimately repeated mascot display names across different schools; roster IDs are authoritative and stay unique.

## Still needed for the *complete roster* ambition

1. Obtain licensed or permitted authoritative, season-scoped source data for each specific league and requested college conference. **Do not scrape private/protected player datasets or guess missing names.**
2. Define a snapshot date for each league and ingest official team IDs, roster person IDs, lineup status and history with provenance and duplicate-safe updates.
3. Expand multi-team/multi-era profiles with sourced team + season mappings. Do not collapse separate career editions into one ID.
4. Verify source links, team affiliations, historical uniforms, numbers, identity ambiguity and permissions. Preserve a per-record review state.
5. Add incremental ingestion/QA to handle thousands of athletes without bloating the initial page, while retaining deterministic seeded gameplay and performant search.
6. Keep the current mascot, Bears, Indiana, custom, fantasy and cross-sport collections intact and separately discoverable.

## Verification

`node tests/test_roster_v23.cjs` verifies ID/name deduplication against the original candidate namespace, schema completeness, ability wiring, and seeded 30-player matches in all four biomes.

`python tests/test_browser_roster_v23.py` verifies desktop + phone browse → full dossier → draft → match → champion.

All pre-existing CI tests also run on this release.
