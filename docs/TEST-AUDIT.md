# Test audit — Cozy AI Studio

**Date:** 2026-09-05  
**Host:** Windows 10 / Node v24.19.0 / npm 12.0.2  
**Auth:** `VITE_AUTH_ENABLED=false` (localStorage only)

## Gate results (post-fix)

| Gate | Command | Exit | Notes |
|------|---------|------|-------|
| Typecheck | `npm run typecheck` | **0** | |
| Lint | `npm run lint` | **0** | 3 warnings (non-blocking) |
| Unit | `npm run test:unit` / `npm test` | **0** | 60 tests, 15 suites |
| E2E | `npm run test:e2e` | **0** | 3 passed (~11s) |
| Smoke | `npm run test:smoke` | **0** | desktop + mobile; BRAND NOTE (no `public/og.jpg`) |
| Auth invariant | `npm run check:auth` | **0** | sign-in off (dev = build) |

`npm run test:audit` = typecheck + lint + unit + e2e.

## Baseline (before fixes)

| Gate | Finding |
|------|---------|
| `npm test` on Windows | Quoted glob `'scripts/**/*.test.mjs'` matched **0** files — only 4 src TS files ran |
| Symlink tests | `EPERM` without Developer Mode |
| Smoke | Failed: screenshot path must be under `/workspace` |
| E2E | Missing — only ad-hoc `tmp-cs*` scripts |
| Orphan | `dom-patch.test.ts` not wired into `npm test` |

## What was added / fixed

### Unit / runner
- [`scripts/run-unit-tests.mjs`](../scripts/run-unit-tests.mjs) — cross-platform runner (core vs platform split)
- Wired `dom-patch.test.ts` + new tests into the suite
- Windows symlink `EPERM` → `t.skip` in `with-app-env` / `check-auth-invariant`
- New tests: `starters`, `local-templates`, `recents`, `profile`
- Relative `./cozy-elements.ts` import in `local-templates.ts` for Node runner

### E2E
- [`playwright.config.mjs`](../playwright.config.mjs) + `@playwright/test`
- [`e2e/landing.spec.mjs`](../e2e/landing.spec.mjs) — `/` → studio / account
- [`e2e/studio-flow.spec.mjs`](../e2e/studio-flow.spec.mjs) — Kanban → Generate locally (offline) → iframe → export → New
- [`e2e/account-flow.spec.mjs`](../e2e/account-flow.spec.mjs) — pinned recent → studio → profile rename persist
- Fixture + helpers under `e2e/`

### Smoke / npm scripts
- `SMOKE_OUTPUT_DIRS` allows `/workspace` **and** repo `screenshots/`
- Scripts: `test:unit`, `test:platform`, `test:e2e`, `test:smoke`, `test:audit`

### Misc
- Tailwind canonical classes on `AccountPage` (`aspect-16/10`, `sm:pl-35`)
- `.gitignore`: `screenshots/`, `tmp-*`, `debug-*.log`

## Platform tests (optional)

`npm run test:platform` forces brand / grok-pwa / write-atomic tests.  
Skipped by default when `.grok/skills/og` is absent (this Windows checkout). Those suites expect Grok sandbox layout and baked OG fixtures.

## Known warnings (out of scope)

1. `StudioShell.tsx` — `react-hooks/exhaustive-deps` (`openRecent`)
2. `button.tsx` — `react-refresh/only-export-components`
3. `use-current-user.ts` — unused eslint-disable
4. Smoke **BRAND NOTE** — no custom `public/og.jpg`

## Still out of scope

- Live AI generation in CI (studio E2E uses offline local templates)
- Auth-on / login routes
- React Testing Library component tests
- Built-output smoke on `:8081` (optional follow-up: `preview:restart` + baseline)
- Deleting ad-hoc `tmp-cs*` artifacts from disk
