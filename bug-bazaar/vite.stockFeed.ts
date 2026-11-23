import type { IncomingMessage } from 'node:http'
import type { Duplex } from 'node:stream'
import type { Plugin } from 'vite'
import { WebSocketServer, type WebSocket } from 'ws'

type StockTick = {
  productId: string
  stock: number
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

        const n = Math.floor(Math.random() * 20) + 1
        const tick: StockTick = {
          productId: `p-${String(n).padStart(4, '0')}`,
          stock: Math.floor(Math.random() * 40) + 1,
        }
        const payload = JSON.stringify(tick)

        for (const client of clients) {
          if (client.readyState === client.OPEN) {
            client.send(payload)
          }
        }
      }, 2500)

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
