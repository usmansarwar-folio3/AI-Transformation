import { useState, type ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createTestQueryClient } from './createTestQueryClient'

export function TestQueryProvider({
  children,
  client,
}: {
  children: ReactNode
  client?: QueryClient
}) {
  const [fallbackClient] = useState(() => createTestQueryClient())
  return (
    <QueryClientProvider client={client ?? fallbackClient}>{children}</QueryClientProvider>
  )
}
