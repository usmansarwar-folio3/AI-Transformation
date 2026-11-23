# Architecture glossary

Definitions in the context of The Bug Bazaar. Rewrite these in your own words before the walkthrough.

## Latency

How long a request or UI update takes end to end. Example: time from typing a search to the product grid updating after the debounced URL change and `getProducts` response.

## Idempotency

Doing the same operation twice has the same effect as doing it once. Example: checkout sends one `idempotencyKey` and reuses it on Retry so MSW / the order API returns the same order instead of creating a duplicate.

## Horizontal scaling

Adding more instances of a service to handle load, rather than making one machine bigger. Example: more Node processes behind the API, or more inventory workers draining the same order queue.

## CDN

A content delivery network that caches static assets near users. Example: serving `/products/*.svg` and the Vite build from an edge cache so product images are not fetched from a single origin every time.

## Cache invalidation

Marking cached data as stale so the next read fetches fresh data. Example: after a successful `createOrder`, the app calls `invalidateQueries(productKeys.all)` so stock is not left wrong for 30 seconds.

## Eventual consistency

Replicas or caches catch up over time rather than updating everywhere in one lockstep write. Example: live stock ticks patch the Query cache immediately, while another tab might still show older stock until its socket tick or refetch arrives.
