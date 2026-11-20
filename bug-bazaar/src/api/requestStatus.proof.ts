/**
 * Compile-time proofs for RequestStatus<T>.
 * Uses assignability checks (no @ts-ignore). Invalid states must not extend RequestStatus.
 */
import {
  failure,
  idle,
  loading,
  success,
  type RequestError,
  type RequestStatus,
} from './requestStatus'
import type { Product } from './schemas'

type Extends<T, U> = [T] extends [U] ? true : false
type AssertTrue<T extends true> = T
type AssertFalse<T extends false> = T

declare const product: Product
declare const requestError: RequestError

const idleState: RequestStatus<Product> = idle()
const loadingState: RequestStatus<Product> = loading()
const successState: RequestStatus<Product> = success(product)
const errorState: RequestStatus<Product> = failure(requestError)

export const validStates = [idleState, loadingState, successState, errorState] as const

type _validIdle = AssertTrue<Extends<{ status: 'idle' }, RequestStatus<Product>>>
type _validLoading = AssertTrue<Extends<{ status: 'loading' }, RequestStatus<Product>>>
type _validSuccess = AssertTrue<
  Extends<{ status: 'success'; data: Product }, RequestStatus<Product>>
>
type _validError = AssertTrue<
  Extends<{ status: 'error'; error: RequestError }, RequestStatus<Product>>
>

type _successNeedsData = AssertFalse<Extends<{ status: 'success' }, RequestStatus<Product>>>
type _errorNeedsPayload = AssertFalse<Extends<{ status: 'error' }, RequestStatus<Product>>>
type _loadingCannotCarryData = AssertFalse<
  Extends<{ status: 'loading'; data: Product }, RequestStatus<Product>>
>
type _idleCannotCarryData = AssertFalse<
  Extends<{ status: 'idle'; data: Product }, RequestStatus<Product>>
>
type _idleCannotCarryError = AssertFalse<
  Extends<{ status: 'idle'; error: RequestError }, RequestStatus<Product>>
>
type _successCannotCarryError = AssertFalse<
  Extends<
    { status: 'success'; data: Product; error: RequestError },
    RequestStatus<Product>
  >
>
type _errorCannotCarryData = AssertFalse<
  Extends<
    { status: 'error'; error: RequestError; data: Product },
    RequestStatus<Product>
  >
>

function readProductName(state: RequestStatus<Product>): string | null {
  if (state.status === 'success') {
    return state.data.name
  }
  return null
}

export const narrowedName: string | null = readProductName(successState)

/** Exported so `tsc` keeps the assignability proofs under `--noUnusedLocals`. */
export type RequestStatusProofs = [
  _validIdle,
  _validLoading,
  _validSuccess,
  _validError,
  _successNeedsData,
  _errorNeedsPayload,
  _loadingCannotCarryData,
  _idleCannotCarryData,
  _idleCannotCarryError,
  _successCannotCarryError,
  _errorCannotCarryData,
]
