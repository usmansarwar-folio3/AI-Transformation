# Day 2 — Browse

Outcome: browsing from product grid to fast, reliable search. Record choices in `docs/decisions.md`.

## D2-1 Product list (4 pts)

Show products in a grid with a details page. Each product shows image, name, price, and stock.

Done when: prices display correctly from cents, and the grid works with a keyboard.

## D2-2 Filters (4 pts)

Search, filter by category, show only in-stock items, and sort, with a result count and a way to clear filters.

Done when: filters survive a refresh, a copied link reproduces the same view, and the Back button works.

## D2-3 UI states (4 pts)

Handle loading, empty, error, and success consistently on list and details pages, with retry after an error.

Done when: each state can be triggered on purpose and looks consistent across pages.

## D2-4 useEffect and cleanup (3 pts)

Clean up side effects on the details page: in-flight requests when the user switches products, and listeners or timers when the page closes. Include a Back to Top button as one such listener.

Done when: switching products quickly never shows the wrong one, and nothing keeps running after the page closes.

## D2-5 Custom hooks (3 pts)

Extract at least two pieces of reusable logic into typed custom hooks (for example debouncing input or syncing state with storage). Hooks are not the HTTP layer; the typed client remains in `src/api/client.ts`.

Done when: each hook is reusable and removes duplicated logic.

## D2-6 Race conditions (3 pts)

Simulate slow, out-of-order responses. Search always shows results for the latest query.

Done when: typing fast never shows results for an old query.
