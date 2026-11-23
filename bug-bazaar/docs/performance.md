# Performance — product list

Measurements for D4-2 / D4-3. Focus: the home product grid (20 cards per page) and what happens when the cart badge updates.

## Method

1. **Re-render count** — mount 20 `ProductCard`s under a parent that re-renders when Redux cart changes (same pattern as `AppLayout` + `Outlet`). Count how many card function bodies run on a cart `addItem`.
2. **Home load** — Lighthouse performance category against `npm run dev` (local SVGs, MSW). Absolute Lighthouse scores on a cold Vite transform are noisy; use them as relative signals, not as production SLOs.

## Before (D4-2 baseline)

| Metric | Value | Notes |
| --- | --- | --- |
| Product cards on a page | 20 | API page size |
| Card body runs after cart `addItem` (parent re-render) | **20** | Every card re-renders even though product props are unchanged |
| Images per page | 20 local `/products/*.svg` | Same-origin; no third-party `placehold.co` |
| Lighthouse performance (dev, cold) | ~0.20 | Dominated by Vite/MSW startup + JS parse; not the list algorithm |

### Slow spots identified

1. **Cart-driven parent re-renders** — `AppLayout` selects `cartItemCount`. Updating the cart re-renders the layout and the active route. Without memoization, all 20 product cards re-render.
2. **Card work on each re-render** — each card rebuilds labels, `aria-label`, and Ant Design `Card` / `Image` / `Tag` trees even when the `product` prop is referentially equal.

## Planned fixes (D4-3)

- Wrap `ProductCard` in `React.memo` so unchanged product props skip the card body.
- Keep pagination at 20 (already local images). Do **not** virtualize all 5,000 rows — the contract is paged; a window over 5,000 DOM nodes would fight the API and the Ant Design `Row`/`Col` layout rule.

## After (filled in D4-3)

| Metric | Value | Notes |
| --- | --- | --- |
| Card body runs after cart `addItem` (parent re-render) | _pending_ | Expect **0** when props are unchanged |
| Skipped optimization | Full-catalog virtualization | Pagination already limits the DOM to 20 cards |
