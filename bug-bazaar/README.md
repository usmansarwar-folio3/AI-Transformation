# The Bug Bazaar

A small store that sells developer gear (rubber ducks, mechanical keyboards, coffee, stickers). Built with React, TypeScript, and Vite.

## Quick start

```bash
cd bug-bazaar
npm install
npm run dev
```

A teammate should be able to clone the repo and run the app in under 5 minutes using only this README.

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |
| `npm run format` | Format source with Prettier |
| `npm run test` | Run unit tests with Vitest |

## Environment variables

Copy `.env.example` to `.env` if you need local overrides. Only public values belong in `VITE_*` variables. Never put secrets in the client.

| Variable | Description | Default |
| --- | --- | --- |
| `VITE_API_BASE_URL` | Base URL for the mock API | `/api` |
| `BUGBAZAR_ENABLE_MOCKS` | When `true`, start MSW outside Vite DEV (preferred on Vercel) | unset (DEV-only) |
| `VITE_ENABLE_MOCKS` | Same as above; Vite-prefixed alternative (Vercel may warn it is public) | unset |

## Mock API

In development, MSW serves the shared contract from `src/mocks/` (5,000 seeded products). On Vercel, set `BUGBAZAR_ENABLE_MOCKS=true` so the same mock API runs in Production/Preview (there is no real backend). Vite bakes that flag in at build time. See `docs/api-contract.md` for shapes, status codes, and how to trigger each listed error on purpose.

Demo login: any email, password `password`.

## CI / CD (Vercel)

Delivery flow:

1. Work on `dev`.
2. Open a PR into `main`.
3. GitHub Actions CI runs (lint, typecheck, test, build) via `.github/workflows/ci.yml`.
4. Merge when CI is green.
5. Vercel (Git integration) auto-deploys `bug-bazaar` to a free `*.vercel.app` URL.

**Vercel project checklist** (Settings):

| Setting | Value |
| --- | --- |
| Root Directory | `bug-bazaar` |
| Production Branch | `main` |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Env | `BUGBAZAR_ENABLE_MOCKS=true` (required for the training mock API **and** live-stock poller) |

Optional: `VITE_API_BASE_URL` if the API base is not `/api`. Do **not** set `VITE_STOCK_WS_URL` on Vercel unless you run a separate WebSocket host — production live stock uses an in-browser mock poller (same tick shape as local `/stock`). Custom domains are optional; Vercel provides `*.vercel.app` by default. SPA client routes are handled by `vercel.json` rewrites.

## Routes (D2-1)

| Path | Page |
| --- | --- |
| `/` | Product list (filters in the query string) |
| `/products/:productId` | Product details |

List filters use URL params: `search`, `category`, `sort`, `inStock=true`, `page`.

UI state triggers (D2-3): `?search=__none__` (empty), `?forceError=500` (list error), `/products/missing` (details 404).

## Project layout

- `src/api/` — typed HTTP client (`client.ts` is the only `fetch` call site), Zod schemas, `RequestStatus`
- `src/mocks/` — MSW handlers and product seed
- `src/theme/` — Ant Design ConfigProvider tokens
- `src/styles/` — shared SCSS variables
- `src/features/` — feature modules (browse, cart, auth) as they are built
- `docs/` — API contract, decisions, AI notes, day guides
- `UI.md` — mandatory Ant Design / SCSS standards
- `CLAUDE.md` — AI and project rules (Claude Code and Cursor)
- `.cursor/rules/` — feature-scoped Cursor rules
- `.cursor/skills/react-review/` — senior React review skill
