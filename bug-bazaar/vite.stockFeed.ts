import type { IncomingMessage } from 'node:http'
import type { Duplex } from 'node:stream'
import type { Plugin } from 'vite'
import { WebSocketServer, type WebSocket } from 'ws'

/** Keep in sync with `src/features/stock/mockStockTick.ts` (Vite node config cannot import that module graph). */
const MOCK_STOCK_TICK_INTERVAL_MS = 2500

function nextMockStockTick(): { productId: string; stock: number } {
  const n = Math.floor(Math.random() * 20) + 1
  return {
    productId: `p-${String(n).padStart(4, '0')}`,
    stock: Math.floor(Math.random() * 40) + 1,
  }
}

/**
 * Dev-only WebSocket at `/stock` that pushes stock ticks for the first
 * twenty catalog ids. The browser catalog + Query cache apply the values.
 */
export function stockFeedPlugin(): Plugin {
  return {
    name: 'bug-bazaar-stock-feed',
    configureServer(server) {
      const wss = new WebSocketServer({ noServer: true })
      const clients = new Set<WebSocket>()

      server.httpServer?.on(
        'upgrade',
        (request: IncomingMessage, socket: Duplex, head: Buffer) => {
          const host = request.headers.host ?? 'localhost'
          const { pathname } = new URL(request.url ?? '/', `http://${host}`)
          if (pathname !== '/stock') {
            return
          }

          wss.handleUpgrade(request, socket, head, (ws) => {
            clients.add(ws)
            ws.on('close', () => {
              clients.delete(ws)
            })
          })
        },
      )

      const timer = setInterval(() => {
        if (clients.size === 0) {
          return
        }

        const payload = JSON.stringify(nextMockStockTick())

        for (const client of clients) {
          if (client.readyState === client.OPEN) {
            client.send(payload)
          }
        }
      }, MOCK_STOCK_TICK_INTERVAL_MS)

      server.httpServer?.on('close', () => {
        clearInterval(timer)
        for (const client of clients) {
          client.close()
        }
        wss.close()
      })
    },
  }
}
