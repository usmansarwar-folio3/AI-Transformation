/** Whether browser mocks are enabled (same flags as main.tsx). */
export function areMocksEnabled(): boolean {
  return (
    import.meta.env.DEV ||
    __BUGBAZAR_ENABLE_MOCKS__ === 'true' ||
    import.meta.env.VITE_ENABLE_MOCKS === 'true'
  )
}

export type LiveStockTransport = 'socket' | 'poll' | 'none'

/**
 * DEV / explicit WS URL → WebSocket.
 * Static hosts (Vercel) with mocks → in-browser poller.
 */
export function resolveLiveStockTransport(): LiveStockTransport {
  const configuredUrl = import.meta.env.VITE_STOCK_WS_URL?.trim()
  if (configuredUrl || import.meta.env.DEV) {
    return 'socket'
  }
  if (areMocksEnabled()) {
    return 'poll'
  }
  return 'none'
}

export function resolveStockSocketUrl(): string {
  const configured = import.meta.env.VITE_STOCK_WS_URL?.trim()
  if (configured) {
    return configured
  }
  const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws'
  return `${protocol}://${window.location.host}/stock`
}
