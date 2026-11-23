import { QueryClient } from '@tanstack/react-query'

/** Default: treat product/me data as fresh for 30s so revisits reuse cache. */
export const SERVER_STALE_TIME_MS = 30_000

export function createAppQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: SERVER_STALE_TIME_MS,
        gcTime: 5 * 60_000,
        retry: false,
        refetchOnWindowFocus: false,
      },
    },
  })
}

export const queryClient = createAppQueryClient()
