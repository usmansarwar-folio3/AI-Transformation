import type { StockTick } from './stockTick'

/** Same cadence as the Vite `/stock` WebSocket plugin. */
export const MOCK_STOCK_TICK_INTERVAL_MS = 2500

/**
 * Random tick for the first twenty catalog ids (p-0001…p-0020), stock 1–40.
 * Shared by the Vite WS feed and the production mock poller.
 */
export function nextMockStockTick(): StockTick {
  const n = Math.floor(Math.random() * 20) + 1
  return {
    productId: `p-${String(n).padStart(4, '0')}`,
    stock: Math.floor(Math.random() * 40) + 1,
  }
}
