# Decisions

Record library and technique choices here: what you used, what else you considered, and why.

## Baseline (this pass)

| Decision | Chose | Considered | Why |
| --- | --- | --- | --- |
| HTTP client | Native `fetch` wrapper in `src/api/client.ts` | Axios | Six endpoints; week scores status codes, abort, and error mapping. No extra dependency. MSW mocks `fetch` directly. |
| Runtime validation | Zod | Manual type guards | Shared schemas for `Product` and `ApiError` at the API boundary. |
| Server cache (planned) | TanStack Query | Hand-written `useEffect` cache | Covers D3-5 reuse and stock refresh, D2 UI states, abort, and latest-query-wins. |
| Client state (planned) | Redux Toolkit | Context only | Tracker row D3-1; cart and session are client state. |
| Routing (planned) | React Router | Manual history | URL-backed filters (D2-2). |
| UI library | Ant Design + SCSS (BEM) | Raw HTML/CSS | Mandatory project standard in `UI.md`. |
