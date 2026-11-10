#!/usr/bin/env python3
"""Copy the game files GitHub Pages serves from a `main` checkout into a `gh-pages` checkout.

GitHub Pages for this repo is served from the `gh-pages` branch, not from `main`. This script is the
one place that says which files make up the playable site, so a deploy copies all of them (and only
them). It never commits or pushes; `.github/workflows/deploy-pages.yml` does that, and only when the
owner runs it by hand with "publish" ticked. See docs/DEPLOY.md.

Usage:
    python tools/pages_deploy.py --check                         # every page reference is deployable
    python tools/pages_deploy.py --source . --site <gh-pages-dir>  # copy the game files across
"""
from __future__ import annotations

import argparse
import filecmp
import pathlib
import re
import shutil
import sys

# Files copied from main. `ui/` is mirrored: modules deleted on main are deleted on the site too.
GAME_FILES = ("index.html", "identity-lab.html", "data/roster_v4.json")
GAME_DIRS = ("ui",)
# Paths other publishers own on gh-pages. A deploy never writes or deletes them.
#   data/active_rosters_v24.json  written daily by .github/workflows/roster-sync-v24.yml
#   preview-v*/                    frozen historical previews, kept only on gh-pages
PRESERVED_FILES = ("data/active_rosters_v24.json",)
PRESERVED_PREFIXES = ("preview-v",)
PAGES = ("index.html", "identity-lab.html")

_ATTR = re.compile(r"""\b(?:src|href)\s*=\s*["']([^"'#?]+)""", re.I)
_FETCH = re.compile(r"""fetch\(\s*['"]([^'"#?]+)""")


def _local(ref: str) -> str | None:
    """Return a site-relative path for a same-site reference, or None for external/inline ones."""
    ref = ref.strip()
    if not ref or re.match(r"^[a-z][a-z0-9+.-]*:", ref, re.I) or ref.startswith(("//", "#", "/")):
        return None
    while ref.startswith("./"):
        ref = ref[2:]
    return ref or None


def referenced_paths(source: pathlib.Path) -> set[str]:
    """Same-site files the pages load: <script src>, <link href>, links to other pages, fetch() targets."""
    texts = [(source / page).read_text(encoding="utf-8") for page in PAGES]
    texts += [p.read_text(encoding="utf-8") for d in GAME_DIRS for p in sorted((source / d).glob("*.js"))]
    refs = set()
    for text in texts:
        for pattern in (_ATTR, _FETCH):
            for match in pattern.findall(text):
                path = _local(match)
                if path and "${" not in path and "'+" not in path:
                    refs.add(path)
    return refs


def deployable(path: str) -> bool:
    return (
        path in GAME_FILES
        or any(path.startswith(d + "/") for d in GAME_DIRS)
        or path in PRESERVED_FILES
        or path.startswith(PRESERVED_PREFIXES)
    )


def check(source: pathlib.Path) -> list[str]:
    """Problems that would make a deploy publish a broken site (empty list = fine)."""
    problems = [f"missing on main: {f}" for f in GAME_FILES if not (source / f).is_file()]
    problems += [f"missing on main: {d}/" for d in GAME_DIRS if not (source / d).is_dir()]
    if problems:
        return problems
    for ref in sorted(referenced_paths(source)):
        if not deployable(ref):
            problems.append(f"referenced by the site but not in the deploy list: {ref}")
    return problems


def deploy(source: pathlib.Path, site: pathlib.Path) -> list[str]:
    """Copy the game files into `site`. Returns the site-relative paths written or deleted."""
    source, site = source.resolve(), site.resolve()
    if source == site:
        raise SystemExit("refusing to deploy a checkout onto itself")
    if not site.is_dir():
        raise SystemExit(f"site directory not found: {site}")
    problems = check(source)
    if problems:
        raise SystemExit("deploy blocked:\n  " + "\n  ".join(problems))
    changed: list[str] = []

    def copy(rel: str) -> None:
        src, dst = source / rel, site / rel
        if dst.is_file() and filecmp.cmp(src, dst, shallow=False):
            return
        dst.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(src, dst)
        changed.append(rel)

    for rel in GAME_FILES:
        copy(rel)
    for d in GAME_DIRS:
        wanted = {p.relative_to(source).as_posix() for p in (source / d).rglob("*") if p.is_file()}
        for rel in sorted(wanted):
            copy(rel)
        if (site / d).is_dir():
            for p in sorted((site / d).rglob("*")):
                rel = p.relative_to(site).as_posix()
                if p.is_file() and rel not in wanted:
                    p.unlink()
                    changed.append(rel)
    nojekyll = site / ".nojekyll"
    if not nojekyll.exists():
        nojekyll.write_text("")
        changed.append(".nojekyll")
    return changed


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--source", default=".", type=pathlib.Path, help="main checkout (default: .)")
    parser.add_argument("--site", type=pathlib.Path, help="gh-pages checkout to copy into")
    parser.add_argument("--check", action="store_true", help="only check that every page reference is deployable")
    args = parser.parse_args(argv)
    if args.check or args.site is None:
        problems = check(args.source)
        for p in problems:
            print("ERROR", p)
        if not problems:
            print(f"ok: {len(referenced_paths(args.source))} same-site references, all deployable")
        return 1 if problems else 0
    changed = deploy(args.source, args.site)
    print("\n".join(changed) if changed else "gh-pages already has the same game files as main")
    return 0


if __name__ == "__main__":
    sys.exit(main())
