# Shared API contract

Prices are stored in cents. Mock this contract however you like; every later task builds against it.

## Types

```ts
type Product = {
  id: string
  name: string
  price: number
  category: 'keyboards' | 'ducks' | 'coffee' | 'stickers'
  stock: number
  rating: number
  imageUrl: string
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
| GET | `/api/me` | 200 user | 401 |
| POST | `/api/orders` | 201 `{ id, status: "queued" }` | 400, 401, 409 when out of stock |
| GET | `/api/orders/:id` | 200 `{ id, status }` | 401, 404 |

The typed client in `src/api/client.ts` is the only place that calls `fetch`. Zod schemas in `src/api/schemas.ts` validate payloads at the boundary.
