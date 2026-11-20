# Day 4 — Harden

Outcome: accessible, fast, live, and tested store. Record choices in `docs/decisions.md`.

## D4-1 Accessibility (3 pts)

Usable with a keyboard and a screen reader. Form errors are announced.

Done when: Lighthouse accessibility is 90 or higher on the home, cart, and login pages.

## D4-2 Performance (3 pts)

Measure the product list, then fix the two slowest spots. Document before and after in `docs/performance.md`.

Done when: `docs/performance.md` shows before and after measurements for each fix.

## D4-3 Memoization / virtualization (3 pts)

Keep the 5,000-item list smooth. Avoid unnecessary re-renders. Justify each optimization in `performance.md`, including one you skipped because it was not needed.

Done when: scrolling stays smooth and the doc justifies each optimization.

## D4-4 WebSockets (3 pts)

Show stock changes live without a page refresh. Polling or SSE is allowed if you can still explain WebSockets and when you would pick them.

Done when: stock updates live, the feed recovers after a disconnect, and it stops when the page closes.

## D4-5 Testing (5 pts)

At least 15 meaningful tests of behavior: cart logic, custom hooks, login, filtering, and checkout, including a successful order and a 409.

Done when: those tests pass and they test behavior rather than implementation details.

## D4-6 Git / CI / CD (3 pts)

Every pull request runs linting, type checking, tests, and a build. A failing test blocks the merge. Bonus: deploy `main` automatically.

Done when: a failing test blocks the merge.

## D4-7 Monitoring (2 pts)

Unexpected errors show a fallback screen and are logged. List three things you would track in `docs/monitoring.md`.

Done when: a thrown error shows a fallback and is logged instead of crashing the app.
