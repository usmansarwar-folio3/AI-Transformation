import { delay, http, HttpResponse, ws } from 'msw'
import type { Product } from '../api/schemas'
import { PRODUCT_COUNT, PRODUCTS_PAGE_SIZE, productCatalog } from './seed'

/** Vitest / MSW: acknowledge the Vite live-stock socket without owning the feed. */
const stockSocket = ws.link('ws://localhost:3000/stock')

const DEMO_PASSWORD = 'password'
const VALID_TOKEN = 'demo-token'

type LoginBody = {
  email?: string
  password?: string
}

type OrderBody = {
  items?: Array<{ productId?: string; quantity?: number }>
  idempotencyKey?: string
}

type StoredOrder = {
  id: string
  status: string
  idempotencyKey: string
}

const ordersById = new Map<string, StoredOrder>()
const ordersByIdempotencyKey = new Map<string, StoredOrder>()

function apiError(status: number, code: string, message: string, details?: Record<string, string>) {
  return HttpResponse.json(
    {
      error: {
        code,
        message,
        ...(details ? { details } : {}),
      },
    },
    { status },
  )
}

function requireAuth(request: Request) {
  const auth = request.headers.get('Authorization')
  if (!auth?.startsWith('Bearer ')) {
    return apiError(401, 'UNAUTHORIZED', 'Authentication required')
  }
  if (auth.slice('Bearer '.length) !== VALID_TOKEN) {
    return apiError(401, 'UNAUTHORIZED', 'Invalid token')
  }
  return null
}

function filterProducts(url: URL): { items: Product[]; total: number } {
  const search = url.searchParams.get('search')?.trim().toLowerCase() ?? ''
  const category = url.searchParams.get('category')?.trim() ?? ''
  const sort = url.searchParams.get('sort')?.trim() ?? ''
  const inStockOnly = url.searchParams.get('inStock') === 'true'
  const page = Math.max(1, Number(url.searchParams.get('page') ?? '1') || 1)

  let items = productCatalog.slice()

  if (search) {
    items = items.filter((product) => product.name.toLowerCase().includes(search))
  }

  if (category) {
    items = items.filter((product) => product.category === category)
  }

  if (inStockOnly) {
    items = items.filter((product) => product.stock > 0)
  }

  switch (sort) {
    case 'price-asc':
      items.sort((a, b) => a.price - b.price)
      break
    case 'price-desc':
      items.sort((a, b) => b.price - a.price)
      break
    case 'name-asc':
      items.sort((a, b) => a.name.localeCompare(b.name))
      break
    case 'rating-desc':
      items.sort((a, b) => b.rating - a.rating)
      break
    default:
      break
  }

  const total = items.length
  const start = (page - 1) * PRODUCTS_PAGE_SIZE
  return { items: items.slice(start, start + PRODUCTS_PAGE_SIZE), total }
}

export const handlers = [
  http.get('/api/products', async ({ request }) => {
    const url = new URL(request.url)
    if (url.searchParams.get('forceError') === '500') {
      return apiError(500, 'INTERNAL', 'Forced product list failure')
    }

    // Mock-only race demo (`slow=1`): shorter searches wait longer so an older
    // request can finish after a newer one if the client does not cancel/ignore it.
    if (url.searchParams.get('slow') === '1') {
      const search = url.searchParams.get('search') ?? ''
      const ms = Math.max(50, 350 - search.length * 40)
      await delay(ms)
    }

    const result = filterProducts(url)
    return HttpResponse.json(result, { status: 200 })
  }),

  http.get('/api/products/:id', ({ params }) => {
    const id = String(params.id)
    const product = productCatalog.find((item) => item.id === id)
    if (!product) {
      return apiError(404, 'NOT_FOUND', 'Product not found')
    }
    return HttpResponse.json(product, { status: 200 })
  }),

  http.post('/api/login', async ({ request }) => {
    const body = (await request.json()) as LoginBody
    const details: Record<string, string> = {}
    if (!body.email?.trim()) details.email = 'Email is required'
    if (!body.password?.trim()) details.password = 'Password is required'
    if (Object.keys(details).length > 0) {
      return apiError(400, 'VALIDATION', 'Invalid login payload', details)
    }

    if (body.password !== DEMO_PASSWORD) {
      return apiError(401, 'UNAUTHORIZED', 'Invalid credentials')
    }

    return HttpResponse.json(
      {
        token: VALID_TOKEN,
        user: {
          id: 'u-1',
          email: body.email!.trim(),
          name: 'Bug Bazaar Shopper',
        },
      },
      { status: 200 },
    )
  }),

  http.get('/api/me', ({ request }) => {
    const authError = requireAuth(request)
    if (authError) return authError

    return HttpResponse.json(
      {
        id: 'u-1',
        email: 'shopper@bugbazaar.dev',
        name: 'Bug Bazaar Shopper',
      },
      { status: 200 },
    )
  }),

  http.post('/api/orders', async ({ request }) => {
    const authError = requireAuth(request)
    if (authError) return authError

    const body = (await request.json()) as OrderBody
    const headerKey = request.headers.get('Idempotency-Key')?.trim()
    const idempotencyKey = body.idempotencyKey?.trim() || headerKey || ''

    if (!idempotencyKey) {
      return apiError(400, 'VALIDATION', 'Invalid order payload', {
        idempotencyKey: 'Idempotency key is required',
      })
    }

    if (!Array.isArray(body.items) || body.items.length === 0) {
      return apiError(400, 'VALIDATION', 'Invalid order payload', {
        items: 'At least one item is required',
      })
    }

    const existing = ordersByIdempotencyKey.get(idempotencyKey)
    if (existing) {
      return HttpResponse.json(
        { id: existing.id, status: existing.status },
        { status: 201 },
      )
    }

    for (const item of body.items) {
      if (!item.productId || typeof item.quantity !== 'number' || item.quantity < 1) {
        return apiError(400, 'VALIDATION', 'Invalid order payload', {
          items: 'Each item needs productId and quantity >= 1',
        })
      }

      const product = productCatalog.find((entry) => entry.id === item.productId)
      if (!product) {
        return apiError(400, 'VALIDATION', 'Invalid order payload', {
          items: `Unknown product ${item.productId}`,
        })
      }

      if (item.quantity > product.stock) {
        return apiError(409, 'OUT_OF_STOCK', 'One or more items are out of stock', {
          productId: product.id,
          productName: product.name,
          available: String(product.stock),
        })
      }
    }

    const order: StoredOrder = {
      id: `o-${ordersById.size + 1}`,
      status: 'queued',
      idempotencyKey,
    }
    ordersById.set(order.id, order)
    ordersByIdempotencyKey.set(idempotencyKey, order)

    return HttpResponse.json({ id: order.id, status: order.status }, { status: 201 })
  }),

  http.get('/api/orders/:id', ({ params, request }) => {
    const authError = requireAuth(request)
    if (authError) return authError

    const id = String(params.id)
    const order = ordersById.get(id)
    if (!order) {
      return apiError(404, 'NOT_FOUND', 'Order not found')
    }

    return HttpResponse.json({ id: order.id, status: order.status }, { status: 200 })
  }),

  stockSocket.addEventListener('connection', () => {
    // Live stock is driven by the Vite plugin in the browser; tests only silence MSW.
  }),
]

export const mockMeta = {
  productCount: PRODUCT_COUNT,
  pageSize: PRODUCTS_PAGE_SIZE,
  demoPassword: DEMO_PASSWORD,
  outOfStockProductId: 'p-0002',
  validToken: VALID_TOKEN,
}

/** Test helper: clear in-memory orders between cases. */
export function resetMockOrders(): void {
  ordersById.clear()
  ordersByIdempotencyKey.clear()
}
