# Performance — product list

Measurements for D4-2 / D4-3. Focus: the home product grid (20 cards per page) and what happens when the cart badge updates.

## Method

1. **Re-render count** — mount 20 `ProductCard`s under a parent that re-renders when Redux cart changes (same pattern as `AppLayout` + `Outlet`). Count how many card function bodies run on a cart `addItem`.
2. **Home load** — Lighthouse performance category against `npm run dev` (local SVGs, MSW). Absolute Lighthouse scores on a cold Vite transform are noisy; use them as relative signals, not as production SLOs.

## Before (D4-2 baseline)

| Metric | Value | Notes |
| --- | --- | --- |
| Product cards on a page | 20 | API page size |
| Card body runs after cart `addItem` (parent re-render) | **20** | Every card re-rendered even though product props were unchanged |
| Images per page | 20 local `/products/*.svg` | Same-origin; no third-party `placehold.co` |
| Lighthouse performance (dev, cold) | ~0.20 | Dominated by Vite/MSW startup + JS parse; not the list algorithm |

### Slow spots identified

1. **Cart-driven parent re-renders** — `AppLayout` selects `cartItemCount`. Updating the cart re-renders the layout and the active route. Without memoization, all 20 product cards re-rendered.
2. **Card work on each re-render** — each card rebuilt labels, `aria-label`, and Ant Design `Card` / `Image` / `Tag` trees even when the `product` prop was unchanged.

## After (D4-3)

| Metric | Value | Notes |
| --- | --- | --- |
| Card body runs after cart `addItem` with same product props | **0** | `React.memo(ProductCard)` skips the card body |
| Card body runs when product props change | 1 per changed card | Stock live updates still re-render that card |
| Images per page | 20 local SVGs | Unchanged from catalog pass |

### Fixes applied

1. **`React.memo` on `ProductCard`** — cart badge updates no longer rebuild the grid.
2. **Local product images** — already done in `UI catalog`; kept as the second slow-spot fix (third-party placeholders removed).

### Skipped optimization

**Do not virtualize all 5,000 products.** The API returns pages of 20 (`PRODUCTS_PAGE_SIZE`). A virtual window over 5,000 rows would fight the shared contract and the mandatory Ant Design `Row`/`Col` grid. Pagination is the list strategy; memoization is the re-render strategy.
