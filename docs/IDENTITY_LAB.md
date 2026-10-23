# Character Identity Lab — V6 integration

The [main game](../index.html) uses the production character art adapter `ui/character-renderer.js` and `ui/character-polish.css` after loading its existing inline simulator. The [Identity Lab](../identity-lab.html) remains an independent searchable QA surface and uses `data/roster_v4.json`.

## Implemented
- Specialized, animated non-stick silhouettes for the current roster's mascots, two horses, two vehicles, aquatic entry and undead wildcard; category-appropriate victory celebrations.
- Human figures retain the featured V5 identity presets, sport uniforms, known jersey numbers and hair/beard variation; subtle animation is added.
- New survival-map icons for nonhuman contestants without modifying location, encounter, scoring, collision or simulation state.
- Winner details (final HP, eliminations, encounters and affiliation), while preserving seeded confetti, standings, rematch and replay.
- Existing sticky live HP/top-elimination panels retained and reinforced on desktop/mobile.
- Character Identity Lab linked from the actual game's draft view.

## Evidence
- V8 runtime evaluation of the production inline simulator with the external renderer: all 1,203 profiles produced accessible SVG without missing/undefined markup.
- Simulations for 2, 12, 24 and 100 competitors: exactly one winner, both leaderboard categories present, final victory stats present.
- Mixed-category runtime scenario: custom map icons, horse leg animation, car wheel animation, aquatic tail animation and undead portrait all render.
- New reproducible Node regression suite: `node tests/test_v6.cjs`.

## Limits and required visual review
- Historical identity research is *not* complete. Most skin/hair/beard, mascot appearance and team details remain provisional. Do not misrepresent randomized styling as biographical evidence or as licensed depictions.
- No live Chromium screenshot or true scroll/resize check has yet been completed for this release. Runtime/markup checks cannot prove actual browser pixel alignment, animation smoothness or sticky behavior; complete a manual visual pass on desktop and phone.
- The encounter pipeline is still a 2D SVG game, not a physically rigged 3D game. Team marks/logos are intentionally omitted.
- GitHub Pages uses `gh-pages`, not `main`; shipping the release requires publishing `index.html`, `identity-lab.html`, `ui/` assets and `data/roster_v4.json` to that branch.

## Browser QA checklist
1. View the draft screen at 1280px and 390px; Character Identity Lab navigation must open.
2. Start a 12-person mixed-category match with a mascot, horse, car, aquatic participant and human.
3. Keep the encounter camera visible; ensure both leaderboards remain readable and current, especially on mobile.
4. Pause/step/seek and verify scoreboard values reflect only the current frame.
5. Verify nonhuman silhouettes are not stick figures, their animations remain smooth, and map icons match their categories.
6. Let the match end; check exact winner, affiliation, final HP, category-specific victory pose, standings, replay and rematch.
7. Enable reduced motion; verify idle/special motion stops while gameplay state and controls remain functional.
8. Run `node tests/test_v5.cjs && node tests/test_v6.cjs` and assess console errors.

This release is integrated in code; visual QA and identity verification are distinct ongoing gates.
