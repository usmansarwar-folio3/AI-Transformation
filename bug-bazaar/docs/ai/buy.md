# Day 3 — Buy

Outcome: shopping flow from cart to a placed order. Record choices in `docs/decisions.md`.

## D3-1 Redux Toolkit (4 pts)

Manage cart and session in shared global state, with derived values for cart item count and total.

Done when: the header badge uses a derived value, and state only changes through defined updates.

## D3-2 Cart (7 pts)

Add, remove, and change quantities, then check out and see an order confirmation. Retrying checkout must not create a second order (idempotency key).

Done when: quantities cannot exceed stock, the cart survives a reload, a 409 names the item that ran out, and a retried checkout does not create a duplicate order.

## D3-3 Auth (4 pts)

Login and logout. Protect the account page and checkout. Return users to where they were after logging in. Document token storage and the trade-off in `docs/auth.md`. Token stays in memory, never `localStorage`.

Done when: a 401 clears the session, the login form cannot be double-submitted, and `docs/auth.md` explains storage and the trade-off.

## D3-4 Backend errors (3 pts)

Turn every API error into a helpful response: field errors for 400, sign out for 401, Not Found for 404, out-of-stock for 409, retry for 500.

Done when: errors are handled in one consistent way, and raw error messages never reach the screen.

## D3-5 Caching (3 pts)

Avoid refetching data the app already has. Refresh stock after an order. Prefer TanStack Query for server cache; Redux Toolkit owns cart and session only.

Done when: revisiting a page reuses existing data, and the engineer can explain when stale data is acceptable.
