# Decisions

Record library and technique choices here: what you used, what else you considered, and why.

## Baseline (this pass)

| Decision | Chose | Considered | Why |
| --- | --- | --- | --- |
| HTTP client | Native `fetch` wrapper in `src/api/client.ts` | Axios | Six endpoints; week scores status codes, abort, and error mapping. No extra dependency. MSW mocks `fetch` directly. |
| Runtime validation | Zod | Manual type guards | Shared schemas for `Product` and `ApiError` at the API boundary. |
| Server cache | TanStack Query | Hand-written `useEffect` cache | Covers D3-5 reuse and stock refresh; queries still call `client.ts`. |
| Client state | Redux Toolkit | Context only | Tracker row D3-1; cart and session are client state (confirmed in D3-1). |
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
| Search commit | Debounced draft → URL via `useDebouncedValue` (300ms); Enter/Search still commits immediately | URL update on every keystroke; Search-button only | Shareable URL while typing settles; Enter stays instant. Full latest-query race handling is D2-6. |

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
| Back to Top control | Ant Design `Button` + window scroll listener cleaned up on unmount | `FloatButton.BackTop` | Matches the task’s Button requirement; listener later moved into `useBackToTop` (D2-5). |

## D2-5 Custom hooks

| Decision | Chose | Considered | Why |
| --- | --- | --- | --- |
| Debounce hook | Generic `useDebouncedValue<T>` in `src/hooks/` | `useDebouncedCallback` only; feature-named `useProductSearch` | Reusable for any value; browse search wires draft → debounced → URL commit. |
| Scroll hook | `useBackToTop({ thresholdPx })` → `{ isVisible, scrollToTop }` | Leave listener in the page; bare `useWindowScrollThreshold` | Removes duplicated scroll/cleanup from details; still generic (no product id). |
| HTTP in hooks | Keep `getProducts` / `getProduct` via `client.ts` (later through Query) | Hooks that call `fetch` directly | Hooks must not become a second HTTP stack; D3-5 Query `queryFn`s still call the client. |

## D2-6 Race conditions

| Decision | Chose | Considered | Why |
| --- | --- | --- | --- |
| Latest-query-wins | **Both** abort in-flight `getProducts` on filter change **and** ignore stale `then`/`catch` via a monotonic request id | Abort only; ignore-stale only | Abort stops work early; the id guard still drops a late settle if abort loses a race. |
| Overlapping requests | Keep one `ProductListResults` instance (no remount key) so debounce/URL updates re-run the effect | Remount-per-`filterKey` | Remount already aborted, but same-instance races better match live typing. |
| Slowness simulation | MSW mock query `slow=1`: delay ≈ `max(50, 350 - search.length * 40)` | Fixed client `setTimeout`; always-on MSW delay | Opt-in so normal tests stay fast; shorter searches finish later → out-of-order without a custom backend. |
| Debounce vs URL | Commit debounced search only when `debounced === draft` | Always commit debounced value | Prevents a lagging debounced `""` from clearing a newer URL search (Back/Forward or fast commits). |

## D3-1 Redux Toolkit

| Decision | Chose | Considered | Why |
| --- | --- | --- | --- |
| Client store | Redux Toolkit (`configureStore` + slices) | React Context + `useReducer`; Zustand | Matches the tracker/planned baseline; defined actions only; easy derived selectors. |
| What lives in Redux | Cart lines + session `user` | Also caching product lists | Server lists stay out until TanStack Query (D3-5); token stays in API client memory, not the store/localStorage. |
| Derived values | `createSelector` for item count and total cents | Ad-hoc sums in components | Header badge reads `selectCartItemCount`; totals stay in cents until display. |
| Header badge | Ant Design `Badge` + `useAppSelector(selectCartItemCount)` | Local `useState` count | Done criterion: badge uses a derived store value. |

## D3-2 Cart

| Decision | Chose | Considered | Why |
| --- | --- | --- | --- |
| Cart persistence | `localStorage` key `bug-bazaar.cart` (cart slice only) via hydrate + `store.subscribe` | `redux-persist`; sessionStorage | Cart is not a credential and must survive reload; token/session stay out of storage. |
| Idempotency | One `crypto.randomUUID()` per checkout attempt, kept in a ref and reused on Retry | New key on every click | MSW/API return the same order for the same key; retries cannot create a second order. New key when the cart changes. |
| 409 copy | Format from API `details.productName` / `productId` (+ cart name fallback) | Raw `error.message` only | Done criterion: the out-of-stock item is named. |
| Checkout auth | Dedicated `/login` + return-to; cart redirects for checkout | Inline cart login form only | Full login/account routes land in D3-3; cart stays browsable while checkout is protected. |

## D3-3 Auth

| Decision | Chose | Considered | Why |
| --- | --- | --- | --- |
| Token storage | In-memory via API client helpers | `localStorage` / cookies | Contract + security trade-off documented in `docs/auth.md`. |
| 401 handling | Clear token in `client.ts` when a Bearer was sent; notify Redux via `subscribeUnauthorized` | Clear on every 401 including failed login | Failed login must not wipe an unrelated session; expired tokens must. |
| Route protection | `RequireAuth` for `/account` (and order confirmation); checkout redirects to login with `state.from` | Protect entire `/cart` | Cart browsing stays public; checkout and account require a session; return-to restores the attempt. |
| Double-submit | `loading` + `disabled` on Sign in while pending | Ignore only via ref | Meets done-when; form also uses Ant Design `disabled={isSubmitting}`. |

## D3-4 Backend errors

| Decision | Chose | Considered | Why |
| --- | --- | --- | --- |
| Mapping layer | `mapApiErrorToUi(RequestError)` → title/description/fieldErrors/showRetry | Per-page `error.message` strings; show API `message` | One status→copy table; raw API messages/codes never primary UI text. |
| 400 | Friendly field copy from known keys (not API detail strings) | Pass through `details` values | Field errors without leaking server wording. |
| 401 / 404 / 409 / 500 | Fixed titles + descriptions; 409 names item from details/cart; Retry only when `showRetry` | Always show Retry | Matches buy.md: sign-out already in client; Not Found; named OOS; retry for server faults. |
| Wiring | AsyncStatusView + login form fields + checkout alert all call the mapper | Duplicate switch statements | List/details/account/order/login/checkout stay consistent. |

## D3-5 Caching

| Decision | Chose | Considered | Why |
| --- | --- | --- | --- |
| Server cache | TanStack Query (`QueryClientProvider` + feature hooks) | Keep per-page `useEffect` fetches; put lists in Redux | Revisit reuse + invalidation without a second HTTP stack; Redux stays cart/session only. |
| HTTP boundary | Query `queryFn` calls `src/api/client.ts` only | Fetch inside Query hooks | Same Zod/auth/abort path; ESLint “no fetch in components” still holds. |
| Stale policy | `staleTime` 30s for products/me; orders `Infinity`; no refetch-on-focus | Always fresh; long multi-minute stale | Brief catalog lag is OK for browse; stock must refresh after checkout via invalidate. |
| Stock after order | `invalidateQueries(productKeys.all)` on successful `createOrder` | Manual stock patch in Redux | Catalog is server truth; invalidation refetches list/detail on next read. |
| Search races | Rely on Query cancel via `signal` when the list key changes | Keep a parallel request-id guard in the page | Abort/latest-wins still holds; Query drops cancelled results. |

### When stale data is acceptable

Product list/detail (and `/me`) may show cached data for up to **30 seconds** without a background refetch. That is acceptable for browse: prices and copy rarely change mid-session, and a short lag beats a spinner on every revisit. **Not** acceptable to keep stale stock after checkout — successful orders invalidate all product queries so the next visit refetches. Placed orders are treated as immutable (`staleTime: Infinity`). Cart and session never go through Query.

## D4-3 Memoization / virtualization

| Decision | Chose | Considered | Why |
| --- | --- | --- | --- |
| List re-renders | `React.memo` on `ProductCard` | Virtualize 5,000 rows; Context to isolate cart badge | Cart badge lives in `AppLayout`; memo stops 20 unchanged cards from re-rendering. |
| Catalog window | Keep page size 20 | `react-window` over full catalog | API is paged; virtualizing 5k fights the contract and Ant Design grid. Documented in `docs/performance.md`. |

## D4-4 Live stock

| Decision | Chose | Considered | Why |
| --- | --- | --- | --- |
| Transport | Dev WebSocket at `/stock` (Vite plugin + `ws`) | Polling every N seconds; SSE | Bidirectional-ready, low latency for many clients; teaches when WebSockets fit. |
| Cache update | Patch TanStack Query lists/details + mutate `productCatalog` | Invalidate on every tick | Instant UI without a refetch storm; catalog stays aligned for the next HTTP read. |
| Lifecycle | `useLiveStock` reconnect with backoff; close on unmount | Leave socket open in a global singleton | Meets “recovers after disconnect” and “stops when the page closes”. |

When polling would be better: rare stock checks, no server push support, or many short-lived tabs where a socket per tab is costly. When SSE would be better: one-way server→client only and you want automatic reconnect over HTTP without a WS upgrade path.
