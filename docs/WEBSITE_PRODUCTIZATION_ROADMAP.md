# LAST LEGEND — WEBSITE PRODUCTIZATION (next major design phase)

Status: **PLANNED**. This is a forward roadmap, not an implemented feature, and does not replace the existing V7 spectator/UX implementation. The user wants Last Legend to feel like a real, continuously maintained public sports-game website, structurally inspired by GoatLab's product completeness but **not** a clone of its theme, branding or palette.

## Reference and differentiation
- Reference site: GoatLab's public sports-game hub at https://goat-lab.app/ (goatlab.com itself was observed as an uninformative 'beta player' page on 2026-10-23). Study its navigability, sport selector, organized modes, onboarding, multi-page identity, saved results and community features. Do not copy its styles, components, copy, assets, names, layouts pixel-for-pixel, or monetization patterns.
- Own identity: **LAST LEGEND** should feel like a cinematic combat/sports entertainment network. Suggested creative system: midnight graphite, weathered parchment, molten copper/gold accents, deep emerald arena lights; editorial condensed sports display typography, precise data type, striking character silhouettes, stadium-inspired textures and generous whitespace. Distinct from GoatLab's aesthetic.

## Global website information architecture
1. **Home / The Lobby** (`/`): immediate Play button, cinematic hero, featured match, sport shortcuts, recent champions, how-it-works, zero-confusion entry. No separate old project splash that blocks play.
2. **Battle / Arena** (`/play`): current 2–100 player draft, sport→team→player, historical/team-era editions, spectator director, live top-ten, tracking, coherent result; reliable end-battle dialog.
3. **Legends / Roster** (`/legends`): searchable, indexed, paginated catalog of 1,203+ competitors with category/team/era filters, character pages, versioned source provenance and distinct verified/provisional traits. Fast on phones even after league-wide expansion.
4. **Results / Hall of Legends** (`/results`): initially device-local completed-match history and best stats; later optionally linked account cloud-synced history. Explicitly distinguish **local-only** from shared data. No fake global leaderboards.
5. **How to Play** (`/how-to-play`): plain explanation of draft, seeded encounters, game balance, storm logic, spectators, and simulated-only gameplay.
6. **About / FAQ / Credits** (`/about`): site identity, non-endorsement and fictional ratings disclaimer, accessibility, responsible-content settings, data sources, privacy and contact route.
7. **Changelog / What's New** (`/updates`): version history, shipped features, known issues, traceable updates. Keep release credibility.
8. **Optional community modules (later):** daily seeded challenge, shared match links, authenticated rankings/tournaments. Only build real backend-dependent features after security, moderation, rate limiting and real persistent storage. No fake community activity counters or invented match results.

## Layout system and navigation
- Consistent fixed/sticky global header with clickable Last Legend logo and primary nav: Play, Legends, Champions, How to Play. Sport chooser visible where useful, not a random mixture of filters and tabs.
- Proper mobile navigation with accessible menu, focus management, escape-to-close, active page highlights, responsive drawers and touch hit areas.
- Reusable design tokens for spacing, font scales, borders, color, iconography, menu layout, scrollable panes, cards, overlays and state feedback. Accessibility AA color contrast and keyboard/voiceover testing.
- Persistent footer with Help, What's New, credits, policy/rights notices. Respect safe-area insets.
- Fast loading; separate the current 1.56 MB inline HTML into modular assets and asynchronously loaded/paginated roster data, while preserving deterministic simulation. Avoid a disruptive rewrite unless tests prove parity.
- Support user-facing settings: sound toggle, reduced motion, violence intensity, default camera mode, performance mode and data-save clear controls.

## Website UX requirements
- Friendly first-run onboarding: 3 clear steps, sample quick-start battle, help accessible at any time. Guest play without an account.
- Browsing: sport → team → athlete, season/edition chips, verified jersey numbers and source notes. Multi-team variants remain separately selectable; do not fabricate team history.
- Battles: an always-obvious path between lobby/draft/arena/champion, quit confirmation for in-progress matches, sane back/refresh behavior and accessible scrollable leaderboards.
- Empty/loading/error/offline states and skeletons; no dead-end controls. Real working pages rather than navigation placeholders.
- Consistent cards, galleries, scoreboards, badges, dialog language, page headings, scroll behavior, and iconography.
- Publish pages with meaningful URLs, title/meta/OG tags, preview images, sitemap and analytics only with privacy review. Test link previews and Search Console readiness.

## Infrastructure and product readiness
- Establish a deployment pipeline, a staging preview environment, testable GitHub Pages or a future static-host deployment, cache strategy, crash logging and uptime monitoring. Preserve the existing public URL and avoid silent breakage.
- Device-local data can remain for guest mode. Accounts, real global rankings, multiplayer, cross-device saves and user-generated community features require a backend; design schema + consent + abuse prevention first.
- Add real web functional/e2e tests in CI: first-run, draft, follow, mobile menu, exit dialog, champion, back/forward, dynamic filter, records, deep links, failover.
- Publish clearly scoped changelog with tested status. Check rights for team trademarks, player likenesses and images before scaling or monetizing.

## Delivery milestones
A. Foundations: design system, nav shell, responsive IA, shared layout, router, page templates, multi-entrypoint build. Preserve V7 and all roster data.
B. Public home, playable arena route, Legends browsing, Results history, help and FAQ with real working flows.
C. Performance and mobile polish, loading/error states, SEO, accessibility, content labels, deployment pipeline and visual regression coverage.
D. Optional accounts, cross-device history, daily/shared public competitions only after building actual backend and moderation architecture.

## Scheduling relative to other plans
The user's current next-phase list also includes **500 unique contextual encounters, improved storm escape/survival AI, public launch QA, and every current NHL/NFL/NBA/MLB player**. Website productization is a cross-cutting product foundation that should be built before or alongside high-volume content import, to support thousands of athletes gracefully. Do not claim those features ship yet.

## Acceptance criteria
- Navigation leads to real pages and all controls function.
- Game, roster, results and about sections are cohesive and legible on desktop/tablet/phone.
- Existing draft, battle determinism, champion result, V7 camera, leaderboards, histories and multi-era outfits remain intact.
- Public site can be visited, refreshed and deep-linked without losing functionality.
- Clear honest provenance and data privacy claims; no faux account/community backend.
- Visual comparison documents differentiation from GoatLab rather than copied styles.