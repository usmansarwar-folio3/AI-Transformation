# Monitoring

Unexpected render errors are caught by `AppErrorBoundary` and logged through `reportError` (message + name only — never tokens or raw API bodies).

## Three things to track

1. **Uncaught UI exceptions** — count of `AppErrorBoundary` / `reportError` hits, tagged by route if available. Spikes mean a release broke a screen.
2. **Checkout failures by HTTP status** — rates for 400, 401, 409, and 500 on `POST /api/orders`. Separates validation, auth, stock, and server faults.
3. **Product-query error rate** — failed `getProducts` / `getProduct` requests (especially forced 500s in demos vs real 5xx). Shows whether browse is healthy independent of checkout.

## Fallback behavior

A thrown render error shows an Ant Design `Result` with “Try again” instead of a blank page. Resetting clears the boundary state so the outlet can render again.
