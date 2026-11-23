import type { ApiErrorBody } from './schemas'

/**
 * Request lifecycle as a discriminated union on `status`.
 * Forbidden fields are typed as `never` so combinations like
 * `{ status: 'loading'; data }` or `{ status: 'success' }` (no data)
 * cannot be represented — see `requestStatus.proof.ts`.
 */
export type RequestStatus<TData> =
  | { status: 'idle'; data?: never; error?: never }
  | { status: 'loading'; data?: never; error?: never }
  | { status: 'success'; data: TData; error?: never }
  | { status: 'error'; error: RequestError; data?: never }

/** API failure shaped for UI/state — aligns with docs/api-contract.md ApiError + HTTP status. */
export type RequestError = {
  httpStatus: number
  code: string
  message: string
  details?: Record<string, string>
}

export function idle<TData = never>(): RequestStatus<TData> {
  return { status: 'idle' }
}

export function loading<TData = never>(): RequestStatus<TData> {
  return { status: 'loading' }
}

export function success<TData>(data: TData): RequestStatus<TData> {
  return { status: 'success', data }
}

export function failure<TData = never>(error: RequestError): RequestStatus<TData> {
  return { status: 'error', error }
}

export function requestErrorFromApi(
  httpStatus: number,
  body: ApiErrorBody | null,
  fallbackMessage = `Request failed with status ${httpStatus}`,
): RequestError {
  return {
    httpStatus,
    code: body?.error.code ?? 'UNKNOWN',
    message: body?.error.message ?? fallbackMessage,
    ...(body?.error.details ? { details: body.error.details } : {}),
  }
}

export function isIdle<TData>(
  state: RequestStatus<TData>,
): state is Extract<RequestStatus<TData>, { status: 'idle' }> {
  return state.status === 'idle'
}

export function isLoading<TData>(
  state: RequestStatus<TData>,
): state is Extract<RequestStatus<TData>, { status: 'loading' }> {
  return state.status === 'loading'
}

export function isSuccess<TData>(
  state: RequestStatus<TData>,
): state is Extract<RequestStatus<TData>, { status: 'success' }> {
  return state.status === 'success'
}

export function isError<TData>(
  state: RequestStatus<TData>,
): state is Extract<RequestStatus<TData>, { status: 'error' }> {
  return state.status === 'error'
}
