/**
 * Typed HTTP boundary for The Bug Bazaar (D1-4).
 * This is the only module allowed to call `fetch`. Components and hooks must
 * import these methods instead of talking to the network directly.
 */
import type { ZodType } from 'zod'
import {
  apiErrorSchema,
  loginResponseSchema,
  orderCreatedSchema,
  orderStatusSchema,
  productListSchema,
  productSchema,
  userSchema,
  type ApiError,
  type LoginResponse,
  type OrderCreated,
  type OrderStatus,
  type Product,
  type ProductCategory,
  type ProductList,
  type ProductSort,
  type User,
} from './schemas'
import { requestErrorFromApi, type RequestError } from './requestStatus'

export type {
  ApiError,
  OrderCreated,
  OrderStatus,
  Product,
  ProductCategory,
  ProductList,
  ProductSort,
  User,
}
export type { RequestError, RequestStatus } from './requestStatus'
export {
  failure,
  idle,
  isError,
  isIdle,
  isLoading,
  isSuccess,
  loading,
  requestErrorFromApi,
  success,
} from './requestStatus'

const DEFAULT_BASE_URL = '/api'

/** Auth token stays in memory only — never localStorage / sessionStorage. */
let authToken: string | null = null

export function setAuthToken(token: string | null): void {
  authToken = token
}

export function getAuthToken(): string | null {
  return authToken
}

export function logout(): void {
  authToken = null
}

export class ApiClientError extends Error {
  readonly status: number
  readonly body: ApiError | null

  constructor(status: number, body: ApiError | null, message?: string) {
    super(message ?? body?.error.message ?? `Request failed with status ${status}`)
    this.name = 'ApiClientError'
    this.status = status
    this.body = body
  }

  toRequestError(): RequestError {
    return requestErrorFromApi(this.status, this.body, this.message)
  }
}

export type ProductQuery = {
  search?: string
  category?: ProductCategory
  sort?: ProductSort
  page?: number
  /** When true, only products with stock > 0. Documented mock/API query extension (D2-2). */
  inStock?: boolean
  /** Mock-only control documented in docs/api-contract.md. Not part of the real API. */
  forceError?: 500
  /**
   * Mock-only: variable list delay so shorter searches finish later than longer ones.
   * Used to demo D2-6 out-of-order responses. Not part of the real API.
   */
  slow?: boolean
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
  schema: ZodType<T>,
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(init.headers)

  if (!headers.has('Content-Type') && init.body !== undefined && init.body !== null) {
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

/** GET /api/products — prices remain in cents. */
export function getProducts(
  query: ProductQuery = {},
  signal?: AbortSignal,
): Promise<ProductList> {
  const params = new URLSearchParams()
  if (query.search) params.set('search', query.search)
  if (query.category) params.set('category', query.category)
  if (query.sort) params.set('sort', query.sort)
  if (query.page !== undefined) params.set('page', String(query.page))
  if (query.inStock) params.set('inStock', 'true')
  if (query.forceError !== undefined) params.set('forceError', String(query.forceError))
  if (query.slow) params.set('slow', '1')
  const qs = params.toString()
  return request(`/products${qs ? `?${qs}` : ''}`, productListSchema, { signal })
}

/** GET /api/products/:id */
export function getProduct(id: string, signal?: AbortSignal): Promise<Product> {
  return request(`/products/${encodeURIComponent(id)}`, productSchema, { signal })
}

/** POST /api/login — stores token in memory on success. */
export async function login(input: LoginInput, signal?: AbortSignal): Promise<LoginResponse> {
  const result = await request('/login', loginResponseSchema, {
    method: 'POST',
    body: JSON.stringify(input),
    signal,
  })
  setAuthToken(result.token)
  return result
}

/** GET /api/me */
export function getMe(signal?: AbortSignal): Promise<User> {
  return request('/me', userSchema, { signal })
}

/** POST /api/orders — sends idempotency key so retries can be safe later (D3-2). */
export function createOrder(
  input: CreateOrderInput,
  signal?: AbortSignal,
): Promise<OrderCreated> {
  return request('/orders', orderCreatedSchema, {
    method: 'POST',
    body: JSON.stringify({
      items: input.items,
      idempotencyKey: input.idempotencyKey,
    }),
    headers: {
      'Idempotency-Key': input.idempotencyKey,
    },
    signal,
  })
}

/** GET /api/orders/:id */
export function getOrder(id: string, signal?: AbortSignal): Promise<OrderStatus> {
  return request(`/orders/${encodeURIComponent(id)}`, orderStatusSchema, { signal })
}
