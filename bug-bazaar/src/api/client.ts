import {
  apiErrorSchema,
  loginResponseSchema,
  orderCreatedSchema,
  orderStatusSchema,
  productListSchema,
  productSchema,
  userSchema,
  type ApiErrorBody,
  type LoginResponse,
  type OrderCreated,
  type OrderStatus,
  type Product,
  type ProductList,
  type User,
} from './schemas'

const DEFAULT_BASE_URL = '/api'

/** Auth token stays in memory only — never localStorage. */
let authToken: string | null = null

export function setAuthToken(token: string | null): void {
  authToken = token
}

export function getAuthToken(): string | null {
  return authToken
}

export class ApiClientError extends Error {
  readonly status: number
  readonly body: ApiErrorBody | null

  constructor(status: number, body: ApiErrorBody | null, message?: string) {
    super(message ?? body?.error.message ?? `Request failed with status ${status}`)
    this.name = 'ApiClientError'
    this.status = status
    this.body = body
  }
}

export type ProductQuery = {
  search?: string
  category?: string
  sort?: string
  page?: number
}

export type LoginInput = {
  email: string
  password: string
}

export type CreateOrderInput = {
  items: Array<{ productId: string; quantity: number }>
  idempotencyKey: string
}

function getBaseUrl(): string {
  const fromEnv = import.meta.env.VITE_API_BASE_URL
  return typeof fromEnv === 'string' && fromEnv.length > 0 ? fromEnv : DEFAULT_BASE_URL
}

async function parseJson(response: Response): Promise<unknown> {
  try {
    return await response.json()
  } catch {
    return null
  }
}

async function request<T>(
  path: string,
  schema: { parse: (data: unknown) => T },
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(init.headers)
  if (!headers.has('Content-Type') && init.body) {
    headers.set('Content-Type', 'application/json')
  }
  if (authToken) {
    headers.set('Authorization', `Bearer ${authToken}`)
  }

  const response = await fetch(`${getBaseUrl()}${path}`, {
    ...init,
    headers,
  })

  const payload = await parseJson(response)

  if (!response.ok) {
    const parsedError = apiErrorSchema.safeParse(payload)
    throw new ApiClientError(response.status, parsedError.success ? parsedError.data : null)
  }

  return schema.parse(payload)
}

export function getProducts(
  query: ProductQuery = {},
  signal?: AbortSignal,
): Promise<ProductList> {
  const params = new URLSearchParams()
  if (query.search) params.set('search', query.search)
  if (query.category) params.set('category', query.category)
  if (query.sort) params.set('sort', query.sort)
  if (query.page !== undefined) params.set('page', String(query.page))
  const qs = params.toString()
  return request(`/products${qs ? `?${qs}` : ''}`, productListSchema, { signal })
}

export function getProduct(id: string, signal?: AbortSignal): Promise<Product> {
  return request(`/products/${encodeURIComponent(id)}`, productSchema, { signal })
}

export async function login(input: LoginInput): Promise<LoginResponse> {
  const result = await request('/login', loginResponseSchema, {
    method: 'POST',
    body: JSON.stringify(input),
  })
  setAuthToken(result.token)
  return result
}

export function getMe(signal?: AbortSignal): Promise<User> {
  return request('/me', userSchema, { signal })
}

export function createOrder(input: CreateOrderInput): Promise<OrderCreated> {
  return request('/orders', orderCreatedSchema, {
    method: 'POST',
    body: JSON.stringify({
      items: input.items,
      idempotencyKey: input.idempotencyKey,
    }),
    headers: {
      'Idempotency-Key': input.idempotencyKey,
    },
  })
}

export function getOrder(id: string, signal?: AbortSignal): Promise<OrderStatus> {
  return request(`/orders/${encodeURIComponent(id)}`, orderStatusSchema, { signal })
}

export function logout(): void {
  setAuthToken(null)
}
