# Last Legend — Storm Survival V9

Status: implementation candidate, CI required before merge or public deployment.

- Actors forecast a shrinking zone three ticks ahead with a small safety buffer.
- Unsafe actors select ESCAPE_ZONE before healing, resting, supply hunting, combat, alliances or pursuit.
- Escape moves toward the reachable map center and spends stamina to run when urgent.
- New ZONE_RETREAT entries explain actual movement decisions; no fictitious winner, HP or KO changes.
- Seeded outcomes remain reproducible for identical match inputs; results may change relative to earlier V8 matches because real gameplay behavior changed.
- The current map engine models terrain visually and through scores, not impassable collision meshes, so obstacle pathfinding is not implied.
- Test command: node tests/test_zone_v9.cjs (in addition to the existing CI suite).

Next: 500 grounded contextual encounter templates with sport/body safety, 18+ optional graphic mode, and user-configurable content intensity; full league roster import remains later work.
