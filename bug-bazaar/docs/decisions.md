# Decisions

Record library and technique choices here: what you used, what else you considered, and why.

## Baseline (this pass)

| Decision | Chose | Considered | Why |
| --- | --- | --- | --- |
| HTTP client | Native `fetch` wrapper in `src/api/client.ts` | Axios | Six endpoints; week scores status codes, abort, and error mapping. No extra dependency. MSW mocks `fetch` directly. |
| Runtime validation | Zod | Manual type guards | Shared schemas for `Product` and `ApiError` at the API boundary. |
| Server cache (planned) | TanStack Query | Hand-written `useEffect` cache | Covers D3-5 reuse and stock refresh, D2 UI states, abort, and latest-query-wins. |
| Client state (planned) | Redux Toolkit | Context only | Tracker row D3-1; cart and session are client state. |
| Routing | React Router | Manual history / Next-style file routes | Needed for list + details now; URL filter sync comes in D2-2. |
| UI library | Ant Design + SCSS (BEM) | Raw HTML/CSS | Mandatory project standard in `UI.md`. |

## D1-2 HTTP and API contracts

| Decision | Chose | Considered | Why |
| --- | --- | --- | --- |
| Mock API | MSW 3 with shared handlers in `src/mocks/` | json-server, custom Express mock, in-memory Vite middleware | Same handlers for Vitest (`msw/node`) and the Vite app (`msw/vite` + `virtual:msw`). No separate backend process. |
| Product seed | Deterministic 5,000-item in-memory catalog | Lazy generation per request, JSON fixture file | Fast, stable ids (`p-0001`…`p-5000`), easy 409 via `p-0002` with `stock: 0`. |
| Error triggers | Documented mock controls (`forceError`, bad credentials, out-of-stock id) | Always-random failures | Evaluators and tests can hit every listed status on purpose without guessing. |

## D1-3 TypeScript

| Decision | Chose | Considered | Why |
| --- | --- | --- | --- |
| Contract types | Zod schemas in `src/api/schemas.ts` as the single source; TypeScript types via `z.infer` | Hand-written interfaces duplicated from the doc | Runtime validation and compile-time types stay aligned with `docs/api-contract.md`. |
| Request lifecycle | Discriminated `RequestStatus<T>` on `status`, with forbidden fields typed as `never` | `{ loading, data, error }` boolean bag | Impossible combos (success without data, loading+data, error+data) fail assignability. Proofs in `requestStatus.proof.ts` use `Extends` asserts — no `any` / `@ts-ignore`. |
| Query params | `ProductCategory` / `ProductSort` unions on `ProductQuery` | Plain `string` | Invalid category/sort values fail at compile time before they hit MSW. |

## D1-4 Data layer

| Decision | Chose | Considered | Why |
| --- | --- | --- | --- |
| Single HTTP boundary | Keep one module `src/api/client.ts` with typed methods per contract endpoint | Per-feature fetch helpers, axios instance | Matches the scoring rule and keeps Zod validation, auth header, and AbortSignal in one place. |
| Enforce “no fetch in components” | ESLint `no-restricted-globals` / `no-restricted-imports` for everything under `src/` except `client.ts` | Convention-only README note | Prevents accidental `fetch`/`axios` when Day 2/3 UI lands. |
| Auth storage | In-memory token via `setAuthToken` / `getAuthToken` / `logout` | `localStorage`, cookies | Credentials must not persist; cart persistence later is separate and non-credential. |
| Cancellation | Optional `AbortSignal` on reads (and mutations for symmetry) | Always-on timeout wrapper | Day 2 product switching and search races need cancel without inventing a second HTTP stack. |

## D2-1 Product list

| Decision | Chose | Considered | Why |
| --- | --- | --- | --- |
| Routing | `react-router-dom` with `/` list and `/products/:productId` details | Window location only, hash routes | Clean list/details navigation without inventing a router; filter query sync deferred to D2-2. |
| Price display | `formatPriceFromCents` in `src/utils/formatPrice.ts` | Format inside the API client | Keeps cents in the data layer; dollars only at the display boundary. |
| Keyboard grid | Focusable Ant Design `Card` (`tabIndex={0}`, Enter/Space) | Raw `<a>` wrappers, mouse-only `onClick` | Meets “grid works with a keyboard” without leaving Ant Design for the card chrome. |

## D2-2 Filters

| Decision | Chose | Considered | Why |
| --- | --- | --- | --- |
| URL sync | React Router `useSearchParams` as source of truth (`search`, `category`, `sort`, `inStock`, `page`) | Local React state + optional sync | Refresh, copy-link, and Back/Forward restore the same view without a second store. |
| In-stock filter | Extend `GET /api/products` with `inStock=true` in mock + client | Client-only filter of the current 20-item page | Keeps `total` honest across the full catalog; no new endpoint. |
| Search commit | `Input.Search` writes the URL on Search/Enter (not every keystroke) | Debounced URL updates (later D2-5/D2-6) | Avoids flooding history while still making the committed query shareable. |

## D2-3 UI states

| Decision | Chose | Considered | Why |
| --- | --- | --- | --- |
| Shared chrome | `AsyncStatusView` + `RequestStatus<T>` for list and details | Parallel `isLoading` / `errorMessage` booleans per page | One Spin / Empty / Alert+Retry look; impossible loading+error combos stay unrepresentable. |
| Empty vs error | Empty only after `success` with no items; errors use `failure(...)` | Treating 404/empty as the same screen | Matches “no results” vs “failed request”; Retry re-fetches. |
| Intentional triggers | URL `forceError=500` (list), `search=__none__` (empty), `/products/missing` (details 404) | Hidden debug menu | Evaluators can hit each state on purpose without extra UI. |

## Product list pagination

| Decision | Chose | Considered | Why |
| --- | --- | --- | --- |
| Pagination UI | Ant Design numbered `Pagination` (page size fixed at 20) | Infinite scroll / “Load more” | Matches the API’s `page` + `total`; keeps URL shareable; no Intersection Observer. |
| Page size constant | `PRODUCTS_PAGE_SIZE` in `src/api/pagination.ts` | Hard-coding `20` in the UI only | Same value for mock, client queries, and range copy; changing it still requires api-contract + decisions. |

## D2-4 useEffect and cleanup

| Decision | Chose | Considered | Why |
| --- | --- | --- | --- |
| Scroll target for Back to Top | `window` (`scroll` + `scrollTo`) | `app-layout__content` as a scroll container | Layout content is not an overflow scroller (`min-height: 100vh` on the page); the document/window scrolls. |
| Stale product flash | Abort in-flight fetch + ignore aborted `then`/`catch` + `key={productId}` remount (fresh `loading()` state) | `setStatus(loading())` inside the fetch effect | Remount resets UI without `set-state-in-effect`; aborted paths never call `setState`. |
| Back to Top control | Ant Design `Button` + window scroll listener cleaned up on unmount | `FloatButton.BackTop`, extracting a D2-5 hook now | Matches the task’s Button requirement; cleanup-first before reusable hooks. |
