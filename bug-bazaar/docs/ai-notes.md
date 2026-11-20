# AI notes

Log notable AI uses here for D5-7.

For each use, record:

1. The prompt (or a short summary).
2. What you kept.
3. What you changed and why.

Also record:

- One AI mistake and how you caught it.
- One thing you would not hand to AI.

## D1-2 — Mock API (MSW)

**Prompt:** Implement D1-2 from docs/ai/foundation.md against docs/api-contract.md:
seed 5,000 products, mock every endpoint, make each listed error triggerable on purpose.
Use MSW; no real backend.

**Kept:**
- Shared handlers in `src/mocks/handlers.ts` covering products, login, me, orders
- Seeded catalog (`p-0001`…`p-5000`) with `p-0002` always out of stock for 409
- `forceError=500` on the product list for a deliberate 500
- Same handlers usable from the app and Vitest setup

**Changed and why:**
- Tightened error shapes to match `ApiError` in the contract exactly
- Made the seed deterministic so ids and the 409 case stay stable in tests
- Limited mock enablement to DEV so production builds don’t start the worker

## Product list pagination

**Prompt:** Add numbered Ant Design Pagination on the product list; wire to URL `page`; “Showing X–Y of Z” copy; no infinite scroll / Load more; keep page size 20.

**Kept:**
- `Pagination` in success children only (`total > 0`); `current` / `pageSize` / `total` from filters + API
- `handlePageChange` via `replaceFilters` (preserves other filters); `patchFilters` still resets `page` to 1
- `formatProductResultRange` for count copy; `PRODUCTS_PAGE_SIZE` in `src/api/pagination.ts`

**Changed and why:**
- Shared page-size constant so mock, query, and range string stay aligned without inventing a new size
- Range helper returns “Showing 0 results” when `total` is 0 so the filters bar never implies 5000 cards on screen
