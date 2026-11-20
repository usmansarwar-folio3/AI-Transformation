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

## Mock API

In development, MSW serves the shared contract from `src/mocks/` (5,000 seeded products). See `docs/api-contract.md` for shapes, status codes, and how to trigger each listed error on purpose.

Demo login: any email, password `password`.

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
