# Day 1 — Foundation

Outcome: a typed project with a mock API that every later task builds on. Record choices in `docs/decisions.md`.

## D1-1 Setup (3 pts)

Make the project easy for a teammate to pick up: consistent formatting and linting, clear folder structure, and a README covering scripts and environment variables.

Done when: a teammate can clone and run the app in under 5 minutes using only the README.

## D1-2 HTTP and API contracts (3 pts)

Document the shared contract in `docs/api-contract.md`, then mock it so the app runs without a real backend. Seed 5,000 products. Make each listed error possible to trigger on purpose.

Done when: every endpoint returns the documented shapes and status codes, including each listed error.

## D1-3 TypeScript (5 pts)

Strict mode. Type the shared contract and props. Model request status so impossible states cannot be represented.

Done when: type checking passes with no `any` and no `@ts-ignore`.

## D1-4 Data layer (4 pts)

One place all requests go through: `src/api/client.ts`. Components never make network calls directly.

Done when: components never call `fetch` or `axios`; they use the typed client or hooks that call it.
