import { QueryClient } from '@tanstack/react-query'

/** Fresh client per test — no shared cache bleed. */
export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: false,
        refetchOnWindowFocus: false,
      },
    },
  })
}
