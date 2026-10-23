# LAST LEGEND

**Twelve legendary athletes enter. One remains.**

**[Play LAST LEGEND on your phone](https://alexrosen23.github.io/LASTLEGEND/)**

## V2 — Cinematic Encounters · October 23, 2026

- Draft **12 athletes from 500** provisional profiles across 16 sports, including Tyrese Haliburton and Aaron Judge.
- Story-first playback is now slower: approximately 1.55 seconds per ordinary tick at 1×, with major encounters allotted approximately 2.85–3.55 seconds. Use ½× Cinematic, 1× Story, 2× or 4×.
- Animated stick-figure interactions show approaches, dodges, impacts, escapes, alliances and eliminations. The encounter camera can stage 2–4 participants, with actual event-log outcomes driving the story.
- Match results remain seeded and statistical rather than chosen by narration. A match ends with exactly one champion.
- Reduced zone-attrition dominance, so encounters cause more eliminations.

Open the live URL in **iPhone Safari → Share → Add to Home Screen** to install a Home Screen shortcut.

## Project files

- `index.html`: fully self-contained playable mobile browser game (data, visuals and simulation bundled).
- `data/athletes_500.json`, `data/signature_perks_500.json`: expanded game profiles and special abilities.
- `data/athletes_500_summary.csv`: sortable summary of the 500 profiles.
- `tools/expand_roster.py`: deterministic expansion generator, preserving the earlier 252-profile source for audit.
- `engine/`, `tests/`, `examples/`, `reports/`, `docs/`, `source_v0_1/`: reference Python simulator, tests, recorded runs and production planning documents.
- `prompts/CLAUDE_CODE_MASTER_PROMPT.md`: older full-scale implementation prompt; use the V2 files as the latest game source.

The deployed website is served from the separate `gh-pages` branch. The source-of-truth remains `main`.

## Verification

The JavaScript test harness completed 81 seeded matches; 11 different champions appeared across 80 standard-roster runs, with group clashes involving three and four athletes. The 390px mobile browser test checked the 500-athlete roster, encounter animations, one winner, and no JavaScript errors or horizontal overflow.

These are **gameplay ratings**, not verified measurements of real athletes, and fictional events are not claims about real behavior. Some historical jersey details and intellectual-property rights need further review before commercial release.
