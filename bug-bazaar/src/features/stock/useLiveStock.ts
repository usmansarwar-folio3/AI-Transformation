import { useEffect, useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { applyStockUpdate } from '../../mocks/seed'
import { applyStockTickToCache } from './applyStockTickToCache'
import { resolveLiveStockTransport, resolveStockSocketUrl } from './liveStockTransport'
import { MOCK_STOCK_TICK_INTERVAL_MS, nextMockStockTick } from './mockStockTick'
import { stockTickSchema, type StockTick } from './stockTick'

export type LiveStockStatus = 'idle' | 'connecting' | 'open' | 'reconnecting' | 'closed'

function applyTick(
  queryClient: ReturnType<typeof useQueryClient>,
  watchedIds: Set<string>,
  tick: StockTick,
): void {
  applyStockUpdate(tick.productId, tick.stock)
  if (!watchedIds.has(tick.productId)) {
    return
  }
  applyStockTickToCache(queryClient, tick)
}

/**
 * Live stock while mounted: WebSocket in Vite DEV (or VITE_STOCK_WS_URL),
 * in-browser mock poller on static hosts with mocks (e.g. Vercel).
 * Reconnects / remounts recover; unmount stops the feed.
 */
export function useLiveStock(productIds: readonly string[]): LiveStockStatus {
  const queryClient = useQueryClient()
  const transport = resolveLiveStockTransport()
  const [socketStatus, setSocketStatus] = useState<LiveStockStatus>(() =>
    transport === 'socket' ? 'connecting' : 'closed',
  )
  const watchedKey = [...productIds].sort().join(',')
  const watchedIds = useMemo(
    () => new Set(watchedKey === '' ? [] : watchedKey.split(',')),
    [watchedKey],
  )

  useEffect(() => {
    if (typeof window === 'undefined' || watchedIds.size === 0) {
      return
    }

    if (transport !== 'socket') {
      return
    }

    let disposed = false
    let socket: WebSocket | null = null
    let retryAttempt = 0
    let reconnectTimer: number | undefined

    function clearReconnect() {
      if (reconnectTimer !== undefined) {
        window.clearTimeout(reconnectTimer)
        reconnectTimer = undefined
      }
    }

    function scheduleReconnect() {
      if (disposed) {
        return
      }
      const delayMs = Math.min(1000 * 2 ** retryAttempt, 10_000)
      retryAttempt += 1
      reconnectTimer = window.setTimeout(() => {
        setSocketStatus('reconnecting')
        connect()
      }, delayMs)
    }

    function connect() {
      if (disposed) {
        return
      }

      clearReconnect()
      socket = new WebSocket(resolveStockSocketUrl())

      socket.addEventListener('open', () => {
        if (disposed) {
          return
        }
        retryAttempt = 0
        setSocketStatus('open')
      })

      socket.addEventListener('message', (event) => {
        if (disposed || typeof event.data !== 'string') {
          return
        }

        let parsed: unknown
        try {
          parsed = JSON.parse(event.data)
        } catch {
          return
        }

        const tickResult = stockTickSchema.safeParse(parsed)
        if (!tickResult.success) {
          return
        }

        applyTick(queryClient, watchedIds, tickResult.data)
      })

      socket.addEventListener('close', () => {
        if (disposed) {
          return
        }
        scheduleReconnect()
      })

      socket.addEventListener('error', () => {
        socket?.close()
      })
    }

    connect()

    return () => {
      disposed = true
      clearReconnect()
      if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
        socket.close()
      }
    }
  }, [queryClient, transport, watchedIds])

  useEffect(() => {
    if (typeof window === 'undefined' || watchedIds.size === 0) {
      return
    }

    if (transport !== 'poll') {
      return
    }

    let disposed = false
    const timer = window.setInterval(() => {
      if (disposed) {
        return
      }
      applyTick(queryClient, watchedIds, nextMockStockTick())
    }, MOCK_STOCK_TICK_INTERVAL_MS)

    return () => {
      disposed = true
      window.clearInterval(timer)
    }
  }, [queryClient, transport, watchedIds])

  if (watchedIds.size === 0) {
    return 'idle'
  }

  if (transport === 'poll') {
    return 'open'
  }

  if (transport === 'none') {
    return 'closed'
  }

  return socketStatus
}
