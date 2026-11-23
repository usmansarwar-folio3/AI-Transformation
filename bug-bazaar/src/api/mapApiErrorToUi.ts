import { ApiClientError } from './client'
import type { RequestError } from './requestStatus'

export type ApiErrorUiKind =
  | 'validation'
  | 'unauthorized'
  | 'notFound'
  | 'outOfStock'
  | 'server'
  | 'unknown'

/** User-facing error model — never expose raw API `message` / `code` as primary copy. */
export type ApiErrorUi = {
  kind: ApiErrorUiKind
  title: string
  description: string
  /** Form field → friendly message (400). */
  fieldErrors?: Record<string, string>
  showRetry: boolean
}

export type MapApiErrorOptions = {
  /** Optional name lookup for 409 `details.productId` (e.g. cart lines). */
  resolveItemName?: (productId: string) => string | undefined
}

const FIELD_ERROR_COPY: Record<string, string> = {
  email: 'Enter a valid email.',
  password: 'Enter your password.',
  items: 'Check the items in your cart.',
  idempotencyKey: 'Checkout could not start. Try again.',
  productId: 'One of the products is invalid.',
  quantity: 'Enter a valid quantity.',
}

function mapFieldErrors(details?: Record<string, string>): Record<string, string> | undefined {
  if (!details || Object.keys(details).length === 0) {
    return undefined
  }

  const fieldErrors: Record<string, string> = {}
  for (const key of Object.keys(details)) {
    fieldErrors[key] = FIELD_ERROR_COPY[key] ?? 'Please check this field.'
  }
  return fieldErrors
}

function outOfStockDescription(
  error: RequestError,
  resolveItemName?: (productId: string) => string | undefined,
): string {
  const productId = error.details?.productId
  const labeled =
    error.details?.productName ??
    error.details?.name ??
    (productId ? resolveItemName?.(productId) : undefined) ??
    productId

  if (!labeled) {
    return 'One or more items are out of stock. Update your cart and try again.'
  }

  const available = error.details?.available
  if (available !== undefined) {
    return `${labeled} is out of stock (${available} available). Update your cart and try again.`
  }
  return `${labeled} is out of stock. Update your cart and try again.`
}

/**
 * Maps a RequestError to stable UI copy by HTTP status.
 * Does not surface raw API `message` or `code` strings as the primary text.
 */
export function mapApiErrorToUi(
  error: RequestError,
  options: MapApiErrorOptions = {},
): ApiErrorUi {
  switch (error.httpStatus) {
    case 400:
      return {
        kind: 'validation',
        title: 'Check your input',
        description: 'Some fields need attention before you can continue.',
        fieldErrors: mapFieldErrors(error.details),
        showRetry: false,
      }
    case 401:
      return {
        kind: 'unauthorized',
        title: 'Sign in required',
        description: 'Your session ended or the credentials were not accepted. Please sign in again.',
        showRetry: false,
      }
    case 404:
      return {
        kind: 'notFound',
        title: 'Not found',
        description: 'We could not find what you were looking for.',
        showRetry: false,
      }
    case 409:
      return {
        kind: 'outOfStock',
        title: 'Out of stock',
        description: outOfStockDescription(error, options.resolveItemName),
        showRetry: false,
      }
    case 500:
      return {
        kind: 'server',
        title: 'Something went wrong on our side',
        description: 'Please try again in a moment.',
        showRetry: true,
      }
    default:
      return {
        kind: 'unknown',
        title: 'Something went wrong',
        description: 'Please try again. If it keeps happening, come back later.',
        showRetry: error.httpStatus >= 500 || error.httpStatus === 0,
      }
  }
}

/** Normalize unknown catch values into RequestError for mapping. */
export function toRequestError(error: unknown): RequestError {
  if (error instanceof ApiClientError) {
    return error.toRequestError()
  }

  return {
    httpStatus: 0,
    code: 'UNKNOWN',
    message: 'Unexpected error',
  }
}
