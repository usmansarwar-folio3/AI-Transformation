import type { UseQueryResult } from '@tanstack/react-query'
import { failure, loading, success, toRequestError, type RequestStatus } from '../api'

/**
 * Bridge Query results into RequestStatus for AsyncStatusView.
 * Prefer cached `data` so revisits/refetches keep showing known server state.
 */
export function requestStatusFromQuery<T>(
  query: Pick<UseQueryResult<T>, 'isError' | 'error' | 'data'>,
): RequestStatus<T> {
  if (query.data !== undefined) {
    return success(query.data)
  }
  if (query.isError) {
    return failure(toRequestError(query.error))
  }
  return loading()
}
