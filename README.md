# LAST LEGEND

**12 enter. One remains.**

LAST LEGEND is a standalone, mobile-friendly, fictional sports-survival simulator. Pick **exactly 12** athletes from **252 playable profiles** (including Tyrese Haliburton and Aaron Judge). Watch them move around a 2D arena as sport-appropriate stick figures, form temporary alliances, compete for supplies, escape and survive. The story feed and champion are produced from the same seeded, stat-influenced simulation.

## Play the game

**[`index.html`](index.html) is the complete self-contained browser prototype.** Download this file and open it in a current browser. It includes its own CSS, athlete data, perks, simulation logic, and encounter animations; you do not need to start a backend.

**GitHub Pages is NOT enabled.** This repository is public source code, not a launched website. Public web deployment and iPhone home-screen hosting remain separate actions.

## Reference simulation / tests

Install Python 3.10+ and run from repository root:

```bash
python -m unittest discover -s tests -v
python -m engine.cli --seed 20261022 --out examples/my_match.json
```

The Python reference engine is separate from the standalone JavaScript browser prototype. It offers deterministic scenarios, comprehensive event logs and traceable outcomes. See `docs/VALIDATION_AND_LIMITS.md` for details and caveats.

## Repository contents

- `index.html` — self-contained playable phone/desktop experience: 12-athlete draft, 4 arenas, 3 randomness modes, 2D map, stick-figure encounters, story feed, and champion.
- `data/athletes_252.json` — all 252 provisional athlete profiles and 20 gameplay ratings per athlete.
- `data/signature_perks_252.json` and `data/secondary_perks.json` — signature and contextual ability catalogues.
- `data/ruleset_config.json` — probability-weight sets, scenarios and arena data.
- `engine/` and `tests/` — Python reference engine and unit tests.
- `examples/`, `reports/`, `preview/` — recorded simulations, validation outputs, and offline replay viewer.
- `docs/`, `source_v0_1/` — requirements, ratings approach, appearance verification and original design.
- `prompts/CLAUDE_CODE_MASTER_PROMPT.md` — production build / architecture / further QA instructions.
- `docs/REFERENCE_README.md` — original complete design-kit README, preserved for provenance.
- `PACKAGE_MANIFEST.json` — original complete build-kit manifest.

## Important boundaries

- **All sports-ability numbers and behavioral traits are provisional game ratings**, not factual evaluations of real people. In-game events are fictional.
- Source-confirmed jersey numbers currently include Indiana #0 for Haliburton and Yankees #99 for Judge; no unverified athlete numbers should be represented as verified.
- This is a **working prototype**, not a licensed or independently calibrated commercial game. Remaining QA includes mobile browser/device verification, historical uniform and athlete-rights review, broader statistical balancing, and production hardening.
- Publishing to a website has **not** been configured.

## Next steps

1. Review the playable `index.html` build and the recorded-match examples.
2. Run the Python test suite.
3. Read `prompts/CLAUDE_CODE_MASTER_PROMPT.md` to guide the next development pass.
4. Configure a website deployment only when explicitly approved.
