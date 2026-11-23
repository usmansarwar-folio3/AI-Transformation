# The Bug Bazaar — AI and project rules

This is a scored training project (UI engineer → frontend engineer). The engineer must be able to explain any change. Unexplained AI-generated code scores at most half points.

All product work for this store lives in this project (`bug-bazaar/`). Do not edit sibling folders such as `bug-bounty-starter/` or `JSPractice/` from this app’s tasks.

## Commits and docs

- One commit per task. Message starts with the task id, for example `D2-2: persist filters in the URL`.
- Record library choices in `docs/decisions.md` (what you used, what else you considered, why).
- Log notable AI use in `docs/ai-notes.md`: prompt, what you kept, what you changed and why.

## API and TypeScript

- Stay on the shared API contract. Do not invent endpoints. Documented shapes and status codes only.
- Prices stay in cents until the display layer.
- TypeScript strict. No `any`. No `@ts-ignore`. Do not disable lint or tests to get green.
- Components never call `fetch` or `axios`. All HTTP goes through the typed client in `src/api/client.ts`. Hooks and components call that client.

## Security

- No secrets in source or in `VITE_*` env vars.
- Auth token in memory only, never `localStorage`. Cart persistence is allowed because it is not a credential.
- Render product text as text. Never use `dangerouslySetInnerHTML`.
- Validate API payloads at the boundary with Zod.
- Checkout sends an idempotency key so a retry cannot create a second order.
- Do not log tokens or raw API error bodies.

## UI

Before creating or editing any UI, read `UI.md` and follow it. Those rules are mandatory.

## Feature guides

When working on a day theme, also follow the matching guide:

- @docs/ai/foundation.md
- @docs/ai/browse.md
- @docs/ai/buy.md
- @docs/ai/harden.md
- @docs/ai/explain.md
