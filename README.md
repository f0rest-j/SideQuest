# SideQuest

**Your life is the open world.**

SideQuest turns everyday real-world exploration into a modern urban RPG. Accept a small quest, put the phone away, go do it, then come back to claim XP, level up, build streaks and unlock achievements.

This is the v0.1 MVP: a local-only, mobile-first web app. No account, no backend, no network needed after install.

## Getting started

Requires Node.js 20.9+ (developed on Node 24) and npm.

```bash
npm install
npm run dev        # http://localhost:3000
```

### Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint (Next.js core-web-vitals + TypeScript rules) |
| `npm run typecheck` | Generate Next route types, then `tsc --noEmit` (strict) |
| `npm run test` | Vitest unit + component tests |
| `npm run test:watch` | Vitest in watch mode |
| `npm run test:e2e` | Playwright happy path (run `npm run build` first; first run needs `npx playwright install chromium`) |
| `npm run check` | lint + typecheck + test + build |

## Stack

Next.js 16 (App Router, Turbopack) · React 19 · TypeScript (strict) · Tailwind CSS 4 · Motion · Lucide icons · Space Grotesk (bundled via `@fontsource`, no Google Fonts fetch) · Vitest + Testing Library · Playwright.

## Architecture

```
src/
  app/                  Next.js entry (layout, single page, global styles + design tokens)
  components/
    layout/             App shell, bottom nav, wordmark
    onboarding/         First-run welcome
    quests/             Quest board, quest card, active quest, completion celebration
    hero/               Player profile, stats, recent history
    achievements/       Achievement grid
    settings/           Settings dialog + reset confirmation
    ui/                 Button, accessible Dialog, LevelBar, rarity/category badges, notices
  domain/               Pure game logic — no React, no browser APIs
    types.ts            Domain model
    levels.ts           XP curve, level/progress helpers, titles
    streaks.ts          Local-calendar streak rules
    quests.ts           Weighted, de-duplicated board drawing
    achievements.ts     Deterministic, unlock-once evaluation
    stats.ts            Stats derived from quest history
    transitions.ts      Accept / complete / abandon / reroll / onboard as pure functions
  data/                 Quest library (41 handcrafted quests) and achievement definitions
  state/reducer.ts      UI reducer wrapping the domain transitions
  hooks/use-sidequest.tsx  Provider: hydration, persistence, reduced motion, announcements
  lib/                  dates, seeded RNG, storage adapter, validation, centralized copy
  tests/                Vitest suites
e2e/                    Playwright happy path
```

Key decisions:

- **Pure, deterministic transitions.** Time and randomness are passed in as a `Clock` (`now`, local `today`, numeric `seed`), and a seeded PRNG drives quest selection and ids. Every transition is testable without mocks.
- **XP is awarded exactly once.** `completeQuest` requires the instance id of the *current* active quest; a repeated or stale dispatch is a no-op. The UI additionally guards against double submission.
- **Stats are derived, not counted.** Quest totals, category counts and rarity counts come from history, so they cannot drift. Level is always re-derived from total XP.
- **Abandoning is free.** No XP loss, no streak loss; the quest is logged in history as abandoned.
- **Board rules.** 3 offers (2 shown below an active quest), unique templates, varied categories, rarity weights 45/35/17/3/0 (Legendary is in the library but disabled on the board). Recently offered/completed/abandoned quests are avoided until the pool runs out.
- **Streaks use local calendar days.** Dates are stored as `YYYY-MM-DD` keys and compared as calendar days, so time zones and DST don't break them.
- **Copy** lives in `src/lib/copy.ts` for easy review and later localisation.

## Storage

- One localStorage key: `sidequest:v1`, holding the `AppState` JSON with a `schemaVersion`.
- `lib/storage.ts` exposes a `StateRepository` interface (`load` / `save` / `clear`). The app only talks to that interface, so a backend (e.g. Supabase) can replace it later.
- Loading runs only on the client, after mount; the server render is a neutral loading shell, so there are no hydration mismatches.
- `lib/validation.ts` validates everything by hand (no Zod). Invalid quests are dropped, missing achievements are filled in, the level is re-derived from XP, and an empty board is regenerated. Unreadable JSON is copied to `sidequest:v1:corrupt` and the app starts fresh with a notice. If localStorage is blocked, the app still works for the session and says so.
- Migrations live in `MIGRATIONS` in `lib/storage.ts` (v0 → v1 covers saves without `schemaVersion`).
- **Dev seeding:** in `npm run dev`, Settings shows a "Grant 1,000 XP" button. It is not rendered in production builds.

## Accessibility & motion

Keyboard-operable nav and dialogs (focus trap, Escape, focus restore), visible focus rings, 44px touch targets, rarity shown with text + icon + colour, numeric XP progress, a polite live region for quest actions, and a screen-reader line for XP earned. Motion respects `prefers-reduced-motion` and an in-app "Reduce motion" switch. Layout is checked at 320px wide with no horizontal scroll.

## MVP limitations

- Progress is per browser/device; clearing site data removes it.
- Completion is honour-based: there's no proof, GPS or camera.
- No accounts, sync, social features, notifications or AI quests (out of scope for v0.1).
- Quest history is stored in full; very long histories are not yet compacted.
- English only, though copy is centralized for localisation.
