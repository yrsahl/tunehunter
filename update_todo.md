# Dependency Update TODO

## Moderate — next sessions

- [ ] **Drizzle** — `drizzle-orm` 0.38→0.45, `drizzle-kit` 0.30→0.31, `@auth/drizzle-adapter` 0.7→1 (do together; casing config moves, array import paths change)
- [ ] **zod** 3→4 — run `@zod/codemod`, then manually fix custom error maps
- [ ] **resend** 4→6 — two major versions; review email sending code
- [ ] **@hookform/resolvers** 3→5 — check resolver signatures
- [ ] **@t3-oss/env-nextjs** 0.9→0.13 — several API tweaks across minor versions
- [ ] **next-seo** 6→7 — minor API cleanup

## Big coordinated upgrades — planned branches

- [ ] **Tailwind 4** — CSS-first config rewrite; also bumps `prettier-plugin-tailwindcss` 0.5→0.8 and `tailwind-merge` 2→3
- [ ] **Next 15 + React 19** — `next` 14→15/16, `react`/`react-dom` 18→19, `@types/react`/`@types/react-dom`; Next 15 makes `params`/`searchParams` async; remove `transpilePackages: ["lucide-react"]` from `next.config.mjs` after this
- [ ] **ESLint flat config** — `eslint` 8→10, `@typescript-eslint/*` 7→8; requires rewriting `.eslintrc` to `eslint.config.js`

## Deliberate decisions needed

- [ ] **nodemailer** 6→8 — license changed to EUPL; also drops templating
- [ ] **@neondatabase/serverless** 0.9→1 — HTTP query syntax change, Node 19+ minimum
- [ ] **typescript** 5→6 — ecosystem still catching up; revisit mid-2026
