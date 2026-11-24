# Reflection — The Bug Bazaar

Personal notes for the Day 5 walkthrough. Scores are my honest read of the work as shipped; adjust if you disagree before presenting.

## What this store is

A Vite + React + TypeScript storefront against a shared MSW contract: browse with URL filters, cart/checkout with idempotency, memory-only auth, TanStack Query for server cache, Redux for cart/session, live stock over a WebSocket, and CI that lint/typechecks/tests/builds on every PR.

## Self-score (rough)

| Area | Score (1–5) | Why |
| --- | --- | --- |
| Typed API / contract | 5 | One `client.ts`, Zod at the boundary, `RequestStatus` forbids impossible UI states |
| Browse + URL state | 5 | Filters/page survive refresh and Back; empty/error/retry are deliberate |
| Cart + checkout | 4 | Stock caps, persistence, named 409, idempotency key — cart UX is solid, not fancy |
| Auth | 4 | Memory token + return-to + 401 clears session; trade-off is written in `docs/auth.md` |
| Caching | 4 | Query reuse + post-order invalidate; stale policy is documented and defensible |
| Harden (a11y / perf / live stock / CI) | 4 | Lighthouse a11y bar met, memo justified, WS recovers/closes, CI covers the four gates |
| Explain / docs | 4 | Architecture, orders, glossary, decisions, AI notes exist; partner review depends on the swap |

Overall: I can defend the main design choices (fetch vs axios, Redux vs Query, memory token, no virtualization of 5k rows) without reading from a script.

## What went well

- Keeping **one HTTP boundary** forced every later feature (Query, races, 401) through the same place.
- Splitting **server vs client vs URL** state early avoided stuffing product lists into Redux.
- **Idempotency + mapped errors** made checkout failures explainable instead of raw API text.
- Measuring before memoizing (`docs/performance.md`) meant I skipped virtualization for a reason, not by habit.

## Gaps / what I would improve next

- Partner **architecture/code review** still depends on the Day 5 swap — this file does not replace that.
- Live stock uses Vite `/stock` WebSocket locally and an in-browser mock poller on Vercel (`BUGBAZAR_ENABLE_MOCKS`); a real multi-user push feed would still need an external WS/SSE host.
- Search races moved from explicit request-id guards to Query cancel; I would add one more integration test that proves UI under `slow=1` without relying only on unit-level abort.
- Deploy/monitoring are “good enough for training” (Vercel + error boundary + `docs/monitoring.md`), not a full observability stack.

## Hardest bug (walkthrough story)

**Symptom:** Typing in search sometimes wiped the URL back to an empty query, or showed results for an older string after a newer one had already committed.

**Cause (two layers):**

1. Debounced search always wrote the debounced value into the URL. After a fast commit (Enter) or Back/Forward, a lagging debounced `""` could clear a newer search.
2. Overlapping `getProducts` calls could finish out of order. Abort alone was not enough if a late `then` still ran.

**Fix:**

- Commit the debounced value only when `debounced === draft`.
- Abort in-flight list requests on filter change **and** ignore stale completions (request id, later Query’s cancel via `signal`).
- Opt-in MSW `slow=1` so out-of-order responses are easy to demo.

**How I caught it:** Reproducing with live typing + the race Vitest (resolve older after newer) and watching the URL flip empty while the draft still had text.

## Second bug (false Add-to-cart success)

**Symptom:** On product list/details, clicking Add to cart after the cart already held all available stock still showed a success toast, even though quantity did not increase.

**Cause:** UI always toasted success after `dispatch(addItem)`. The Redux reducer correctly clamped to stock (no-op at the cap), so the store was honest and the feedback lied. Live stock could raise `product.stock` later, but the button did not show in-cart count or a clear “full” state.

**Fix:**

- Shared `useAddProductToCart`: compare cart qty to current product stock.
- Labels `Add to cart (N)` / disabled `Max added (N)`; warning copy if a full-cart click fires; success only when qty increases.
- When live stock rises above cart qty, the control enables again without a refresh.

**How I caught it:** Filling a low-stock product to the cap on the card, clicking again, and watching success toast + unchanged cart badge.

## AI workflow (honest)

AI was useful for scaffolding MSW handlers, wiring Ant Design layout, and first-pass Query migration. I kept the contract and scoring rules as the source of truth and rewrote anything I could not explain (error copy, stale policy, idempotency key lifetime).

I would **not** hand the evaluator a reflection or a live bug story written entirely by AI — half credit if I cannot walk it. The useful AI mistakes (for example sync `setState` in `useEffect` for live stock) showed up in lint; that is the bar I trust more than “it compiled.”

## Demo script (5 minutes)

1. Home: filters in the URL, empty (`search=__none__`), error (`forceError=500`), retry.
2. Details → add to cart → badge count + **Add to cart (N)**; at stock show **Max added (N)** (no fake success); reload keeps cart, not session.
3. Checkout without login → return-to → place order → stock/list refresh; retry same idempotency key does not double-create.
4. Force a 409 on an out-of-stock line and show the **named** item.
5. Optional: `slow=1` search race, live stock flicker (button re-enables if stock rises), CI green on the PR.
