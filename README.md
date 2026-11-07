# LAST LEGEND

A free browser battle-royale game where athletes, mascots and other legends fight until one is left.

**Status:** Live, playable on GitHub Pages and still evolving · **Stack:** JavaScript, HTML/CSS/SVG, Python · Built with [Claude Code](https://claude.com/claude-code)

**[Play LAST LEGEND](https://alexrosen23.github.io/LASTLEGEND/)**

## What it does

You draft a field of 2 to 100 contestants from a roster of more than 1,200 athletes, mascots and other characters, pick an arena, and watch a seeded match play out. Fights, storms and eliminations are simulated, then replayed with commentary, a live leaderboard and a champion screen.

The same seed always produces the same match, so results can be replayed, shared and tested. The roster holds real-world names, but ratings, personalities and abilities are game design, not factual claims.

## Key features

- 2 to 100 contestants per match, with draft filters (including a mascot-only mode) to make large fields manageable.
- Procedural arenas, storm and zone survival, group encounters and contextual scoring.
- Deterministic simulation with replay controls and a single champion.
- Animated SVG character art, with individualized styling for human athletes and distinct silhouettes for mascots, horses, vehicles and creatures.
- Live top-three leaderboards for HP and eliminations that never spoil future scores.
- Athlete profiles, a Character Identity Lab for inspecting the roster, and public challenges.
- Phone-friendly layout, contrast and reduced-motion options, and an optional captions mode.
- A roster data pipeline with source tracking and identity-review flags for unverified entries.

## How it works

```
index.html, identity-lab.html   the game (static, no build step)
ui/                             browser modules, one per feature version (replay, encounters, rosters, AI...)
data/                           rosters, perks, rulesets and source manifests (JSON/CSV)
engine/                         Python reference simulation and CLI
tools/                          roster building and sync scripts
tests/                          Node and Python tests, including browser tests
docs/                           release notes, roster audits and roadmaps
```

The game itself runs entirely in the browser. The Python engine is a reference model used for batch simulation and balance smoke tests. The site is served from the `gh-pages` branch; `main` holds the source.

## Built with

Vanilla JavaScript, HTML, CSS and SVG for the game; Python for the reference engine and tooling; Node scripts and Python with Playwright for tests. Built with Claude Code as an AI pair programmer: Claude wrote most of the code under Alex's direction and review.

## Run it locally

The game is static files, so open `index.html` in a browser or serve the folder with any static file server.

Reference engine and checks (see the scripts for details):

```bash
python -m engine.cli --seed 42 --out examples/match_42.json   # run one simulated match
python validate_package.py                                    # package validation and smoke suite
node tests/test_v6.cjs                                        # example of a Node feature test
```

Release notes and design docs are in [docs/](docs/).

## Project stats

| | |
|---|---|
| Timeline | 2026-10-23 → 2026-11-04 (first to last commit) |
| Commits | 56 |
| Active Claude Code time | 0.3 hours across 6 sessions (2026-10-25 → 2026-11-03) |
| Claude tokens (new work) | 356 thousand: 132 input, 307 thousand written to cache, 50 thousand output |
| Claude tokens (cache reads) | 15.3 million, counted separately (see below) |
| Models (share of responses) | Claude Opus 5.5 97%, Claude Sonnet 5.5 3% |

<details>
<summary>How these numbers were measured</summary>

Measured from Claude Code session transcripts (the `.jsonl` files Claude Code writes for every session and subagent) with a small read-only script. Each Claude response's `usage` record is counted once. A response counts toward this repo when its working directory is inside the repo (or a git worktree of it); for sessions started from a general folder, when its tool calls point into the repo, or else the project that session was last working on.

- **New-work tokens** = input tokens + tokens written to the prompt cache + output tokens.
- **Cache reads** are the conversation context that Claude re-reads from Anthropic's prompt cache on every turn. They are far larger than new work and are billed at about a tenth of the input price, so they are listed separately rather than added to the total.
- **Active time** joins transcript events that are at most 15 minutes apart into working intervals, then merges overlapping intervals so parallel sessions and subagents are not double counted. Idle gaps longer than 15 minutes are not counted.

All figures are approximate.

</details>

## Part of The Constellation

This project is one world in [The Constellation](https://github.com/AlexRosen23/constellation), Alex's 3D command center for every project.

## Notes

Fictional characters and trademarked mascot depictions are provisional interpretations, not licensed likenesses, and would need rights clearance before any monetization. Some roster entries are flagged in the data as awaiting identity review. See [docs/VALIDATION_AND_LIMITS.md](docs/VALIDATION_AND_LIMITS.md).
