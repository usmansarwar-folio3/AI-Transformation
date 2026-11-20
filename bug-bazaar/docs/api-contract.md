# Shared API contract

Prices are stored in cents. The app mocks this contract with MSW so it runs without a real backend. Every later task builds against these shapes and status codes.

## Types

```ts
type Product = {
  id: string
  name: string
  price: number // cents
  category: 'keyboards' | 'ducks' | 'coffee' | 'stickers'
  stock: number
  rating: number
  imageUrl: string
}

type User = {
  id: string
  email: string
  name: string
}

type ApiError = {
  error: {
    code: string
    message: string
    details?: Record<string, string>
  }
}
```

## Endpoints

| Method | Endpoint | Success | Errors |
| --- | --- | --- | --- |
| GET | `/api/products?search=&category=&sort=&page=` | 200 `{ items: Product[], total: number }` | 500 |
| GET | `/api/products/:id` | 200 `Product` | 404 |
| POST | `/api/login` | 200 `{ token, user }` | 400, 401 |
| GET | `/api/me` | 200 `User` | 401 |
| POST | `/api/orders` | 201 `{ id, status: "queued" }` | 400, 401, 409 when out of stock |
| GET | `/api/orders/:id` | 200 `{ id, status }` | 401, 404 |

### Query notes for `GET /api/products`

- `search` — case-insensitive match on `name`
- `category` — one of `keyboards` \| `ducks` \| `coffee` \| `stickers`
- `sort` — `price-asc` \| `price-desc` \| `name-asc` \| `rating-desc`
- `page` — 1-based page; page size is **20**

### Auth and orders

- Demo login password: `password` (any non-empty email)
- Auth uses `Authorization: Bearer <token>`; the client keeps the token in memory only
- `POST /api/orders` requires an idempotency key (`idempotencyKey` in the body and/or `Idempotency-Key` header)

## Mock catalog

- Seeded size: **5,000** products (`p-0001` … `p-5000`)
- Out-of-stock product for 409 tests: **`p-0002`** (`stock: 0`)

## Triggering each listed error on purpose

These controls are for the MSW mock only. They are not part of a real backend.

| Status | Endpoint | How to trigger |
| --- | --- | --- |
| 500 | `GET /api/products` | Query `forceError=500` (client: `getProducts({ forceError: 500 })`) |
| 404 | `GET /api/products/:id` | Use an unknown id, e.g. `missing` |
| 400 | `POST /api/login` | Omit `email` and/or `password` |
| 401 | `POST /api/login` | Wrong password (anything other than `password`) |
| 401 | `GET /api/me` | Call without a Bearer token |
| 400 | `POST /api/orders` | Empty `items`, missing idempotency key, or invalid line items |
| 401 | `POST /api/orders` | Call without a Bearer token |
| 409 | `POST /api/orders` | Order `p-0002` with quantity ≥ 1 |
| 401 | `GET /api/orders/:id` | Call without a Bearer token |
| 404 | `GET /api/orders/:id` | Unknown order id, e.g. `missing` |

## Client boundary

The typed client in `src/api/client.ts` is the only place that calls `fetch`. Zod schemas in `src/api/schemas.ts` validate success and error payloads at the boundary. Components must not call `fetch` or `axios` directly.

## Request status (D1-3)

Async UI state uses a discriminated union so impossible combinations cannot be typed:

```ts
type RequestStatus<T> =
  | { status: 'idle'; data?: never; error?: never }
  | { status: 'loading'; data?: never; error?: never }
  | { status: 'success'; data: T; error?: never }
  | { status: 'error'; error: RequestError; data?: never }
```

Forbidden fields are `never` so combinations like loading+data or success without data are not representable. See `src/api/requestStatus.ts` and `src/api/requestStatus.proof.ts`.
