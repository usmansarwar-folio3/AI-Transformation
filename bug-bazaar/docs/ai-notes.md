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

## D2-4 — useEffect and cleanup

**Prompt:** Implement D2-4 from docs/ai/browse.md: abort on product switch/unmount, Back to Top with scroll listener cleanup, reset loading so stale then() cannot flash wrong product.

**Kept:**
- `AbortController` cleanup on `productId` change / unmount; aborted catch already skipped `setState`
- `key={productId}` remount on the details body
- Window as scroll target (layout content is not a scroller)

**Changed and why:**
- Relied on `key={productId}` for loading reset (lint forbids sync `setState` in the fetch effect) and added an aborted guard on `then` so a late success cannot paint the previous product
- Added Ant Design “Back to Top” `Button` with window `scroll` listener removed in cleanup; listener extracted to `useBackToTop` in D2-5

## D2-5 — Custom hooks

**Prompt:** Extract at least two typed reusable hooks (debounce + Back to Top); wire into browse; do not hide the HTTP client behind an API hook layer.

**Kept:**
- Typed client calls in page `useEffect`s
- Existing filter URL helpers and AsyncStatusView

**Changed and why:**
- Added `useDebouncedValue` and `useBackToTop` under `src/hooks/` with unit tests
- Search uses a controlled draft + 300ms debounce to commit URL (Enter/Search still immediate)
- Kept `ProductFilters` mounted across keyed list remounts so typing is not wiped when results refetch

## D2-6 — Race conditions

**Prompt:** Latest search always wins; simulate slow/out-of-order list responses; abort and/or ignore stale; keep URL sync; prove with debounce/live search.

**Kept:**
- Debounced URL search commits from D2-5
- Typed `getProducts` via `client.ts` only

**Changed and why:**
- List fetch uses abort cleanup **plus** a request-id guard so aborted/stale responses never `setState`
- Removed results remount-per-query so overlapping in-flight requests are real
- MSW `slow=1` variable delay (documented mock control) for manual out-of-order demos; Vitest race test settles older promises after newer ones
- Debounced search commits only when `debounced === draft`, so a stale `""` cannot wipe a newer URL search

## D3-1 — Redux Toolkit

**Prompt:** Add RTK store for cart and session; derived selectors for count/total; header badge from selector; Provider at root; no full cart UI yet.

**Kept:**
- Auth token in API client memory helpers (not Redux / not localStorage)
- Product list fetching outside Redux (TanStack Query later)

**Changed and why:**
- Added `cart` + `session` slices, `createSelector` count/total, typed hooks, and `Provider` in `main.tsx`
- Header `Badge` reads `selectCartItemCount` so the count is derived, not local state
- Cart actions include stock-aware quantity clamps so D3-2 can reuse them without inventing endpoints

## D3-2 — Cart

**Prompt:** Add/remove/qty cart UI; stock caps; persist cart; checkout via createOrder with idempotency; 409 names item; order confirmation.

**Kept:**
- Redux cart actions/selectors from D3-1
- Typed `createOrder` / `login` through `client.ts`

**Changed and why:**
- Persisted cart only to `localStorage`; session/token still memory-only
- Checkout reuses one idempotency key per attempt (cleared when cart lines change)
- MSW 409 details include `productName`; UI formats a named out-of-stock message
- Minimal cart-page sign-in stub so checkout can call the authenticated orders API before D3-3

## D3-3 — Auth

**Prompt:** Login/logout; protect account + checkout; return-to; memory token + docs/auth.md; 401 clears session; no double-submit.

**Kept:**
- Token helpers on the typed client; Redux session holds user only
- Cart persistence separate from credentials

**Changed and why:**
- Added `/login`, `/account`, `RequireAuth`, and header Sign in / Account / Log out
- Cart checkout redirects to login with return-to instead of an inline form
- 401 on authenticated requests clears token + Redux session via an unauthorized subscriber
- Wrote `docs/auth.md` for the memory vs localStorage trade-off
