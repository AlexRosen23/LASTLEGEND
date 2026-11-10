# How LAST LEGEND is deployed

The live game at https://alexrosen23.github.io/LASTLEGEND/ is served by GitHub Pages from the **`gh-pages`
branch** (root folder, legacy "deploy from a branch" mode). It is **not** built from `main`.

**Merging a PR into `main` does not change the live site.** Someone has to copy the game files to `gh-pages`.
Until November 2026 that copy was done by hand, so a fix could be merged and never reach players.
[#28](https://github.com/AlexRosen23/LASTLEGEND/pull/28) is the example: it was merged to `main`, and the live
site kept rejecting every roster snapshot until the same file was committed to `gh-pages` separately (`650ec6c`).

## What is published, from where, by what

| Path on `gh-pages` | Comes from | Written by | When |
|---|---|---|---|
| `index.html`, `identity-lab.html` | `main` | [`deploy-pages.yml`](../.github/workflows/deploy-pages.yml) | Only when the owner runs it with **publish** ticked |
| `ui/` (all modules and stylesheets, mirrored: files deleted on `main` are deleted here) | `main` | `deploy-pages.yml` | Same |
| `data/roster_v4.json` (read by the Identity Lab) | `main` | `deploy-pages.yml` | Same |
| `.nojekyll` | created if missing | `deploy-pages.yml` | Same |
| `data/active_rosters_v24.json` (current NBA/NFL/MLB/NHL team rosters) | ESPN's public feed, captured in CI | [`roster-sync-v24.yml`](../.github/workflows/roster-sync-v24.yml) | Daily schedule, manual run, or a push to `main` that changes the sync code; committed only if the data changed |
| `preview-v8/` … `preview-v30/` | historical review builds, kept only on `gh-pages` | nobody (frozen) | Never changed by either workflow |

Nothing else on `main` (tests, tools, docs, the Python engine, `data/` except `roster_v4.json`) is published.

The list of game files lives in one place, [`tools/pages_deploy.py`](../tools/pages_deploy.py). Its `--check`
mode reads every `<script src>`, `<link href>`, page link and `fetch()` target in `index.html`,
`identity-lab.html` and `ui/*.js`, and fails if the site loads anything the deploy would not copy.
[`tests/test_pages_deploy.py`](../tests/test_pages_deploy.py) runs that check on the real pages and tests the copy
itself (mirroring `ui/`, keeping the roster snapshot and previews, refusing a blocked deploy).

## Deploying a change (owner step)

1. Merge the PR into `main` and wait for **Last Legend gameplay regressions** to pass on the `main` commit.
   A commit message containing `[skip ci]` skips that run; don't deploy such a commit until the tests have run
   (locally or in a later run).
2. Open **Actions → Deploy game files to GitHub Pages (manual) → Run workflow**, branch `main`.
3. Leave **publish** unticked first. That is a dry run: the job runs every Node feature test (`tests/*.cjs`),
   the roster unit tests and the deploy-list check, copies the files into a `gh-pages` checkout, and prints
   `git diff --stat` of what would change. Nothing is pushed.
4. If the diff is what you expect, run it again with **publish** ticked. The job commits
   `deploy: game files from main <sha>` to `gh-pages` as `github-actions[bot]` and pushes. If `gh-pages` already
   matches, it says so and pushes nothing.
5. GitHub's **pages-build-deployment** run then publishes the branch (usually within a minute or two). Hard-refresh
   the site and check the browser console.

The workflow only runs from `main` (`if: github.ref == 'refs/heads/main'`), and it shares a concurrency group
with the roster sync, so the two never push to `gh-pages` at the same time.

### Doing the same by hand

```bash
git fetch origin
git worktree add --detach ../ll-pages origin/gh-pages
python tools/pages_deploy.py --source . --site ../ll-pages   # prints what changed; does not commit
cd ../ll-pages && git status --short                         # review, then commit and push to gh-pages
```

## Rollback

`gh-pages` is an ordinary branch with one commit per deploy, so `git revert <deploy commit>` on `gh-pages`
(pushed by the owner) restores the previous game files. Reverting a deploy never touches the roster snapshot,
which has its own commits.

## Approvals

- Running `deploy-pages.yml` with **publish** ticked, pushing to `gh-pages` by hand, and changing the Pages
  settings are owner decisions. Automated sessions may open PRs and run the dry run's logic locally
  (`tools/pages_deploy.py` against a scratch worktree), but do not publish.
- `roster-sync-v24.yml` publishes the roster snapshot on its own; that was set up and approved when the
  workflow was added (V24, PR [#17](https://github.com/AlexRosen23/LASTLEGEND/pull/17)).
