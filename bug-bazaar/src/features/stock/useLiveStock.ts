import { useEffect, useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { applyStockUpdate } from '../../mocks/seed'
import { applyStockTickToCache } from './applyStockTickToCache'
import { stockTickSchema } from './stockTick'

export type LiveStockStatus = 'idle' | 'connecting' | 'open' | 'reconnecting' | 'closed'

function stockSocketUrl(): string {
  const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws'
  return `${protocol}://${window.location.host}/stock`
}

/**
 * Subscribe to the Vite `/stock` WebSocket while the caller is mounted.
 * Patches the in-memory catalog and TanStack Query cache for watched ids.
 * Reconnects with backoff; closes on unmount.
 */
export function useLiveStock(productIds: readonly string[]): LiveStockStatus {
  const queryClient = useQueryClient()
  const [status, setStatus] = useState<LiveStockStatus>('connecting')
  const watchedKey = [...productIds].sort().join(',')
  const watchedIds = useMemo(
    () => new Set(watchedKey === '' ? [] : watchedKey.split(',')),
    [watchedKey],
  )

  useEffect(() => {
    if (typeof window === 'undefined' || watchedIds.size === 0) {
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
        setStatus('reconnecting')
        connect()
      }, delayMs)
    }

    function connect() {
      if (disposed) {
        return
      }

      clearReconnect()
      socket = new WebSocket(stockSocketUrl())

      socket.addEventListener('open', () => {
        if (disposed) {
          return
        }
        retryAttempt = 0
        setStatus('open')
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

        const tick = tickResult.data
        applyStockUpdate(tick.productId, tick.stock)

        if (!watchedIds.has(tick.productId)) {
          return
        }

        applyStockTickToCache(queryClient, tick)
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
  }, [queryClient, watchedIds])

  if (watchedIds.size === 0) {
    return 'idle'
  }

  return status
}
