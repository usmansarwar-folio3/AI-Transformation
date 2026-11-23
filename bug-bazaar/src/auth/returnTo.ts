import type { Location } from 'react-router-dom'

function readFromLocation(state: unknown): Location | null {
  if (typeof state !== 'object' || state === null || !('from' in state)) {
    return null
  }

  const { from } = state
  if (typeof from !== 'object' || from === null || !('pathname' in from)) {
    return null
  }

  const { pathname, search, hash } = from as {
    pathname: unknown
    search?: unknown
    hash?: unknown
  }

  if (typeof pathname !== 'string') {
    return null
  }

  return {
    pathname,
    search: typeof search === 'string' ? search : '',
    hash: typeof hash === 'string' ? hash : '',
    state: null,
    key: 'return-to',
  }
}

/** Safe in-app path to resume after login (blocks open redirects). */
export function resolveReturnTo(
  state: unknown,
  searchParams?: URLSearchParams,
  fallback = '/',
): string {
  const fromState = readFromLocation(state)

  if (fromState?.pathname) {
    const path = `${fromState.pathname}${fromState.search}${fromState.hash}`
    if (path.startsWith('/') && !path.startsWith('//')) {
      return path
    }
  }

  const fromQuery = searchParams?.get('from')
  if (fromQuery && fromQuery.startsWith('/') && !fromQuery.startsWith('//')) {
    return fromQuery
  }

  return fallback
}
