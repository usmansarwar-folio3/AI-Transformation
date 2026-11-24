import { afterEach, describe, expect, it, vi } from 'vitest'

describe('resolveLiveStockTransport', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  it('prefers socket in DEV', async () => {
    vi.stubEnv('DEV', true)
    vi.stubEnv('VITE_STOCK_WS_URL', '')
    const { resolveLiveStockTransport } = await import('./liveStockTransport')
    expect(resolveLiveStockTransport()).toBe('socket')
  })

  it('uses poll when not DEV but mocks are enabled', async () => {
    vi.stubEnv('DEV', false)
    vi.stubEnv('VITE_ENABLE_MOCKS', 'true')
    vi.stubEnv('VITE_STOCK_WS_URL', '')
    vi.resetModules()
    // Re-declare the build-time mock flag for this module graph.
    vi.stubGlobal('__BUGBAZAR_ENABLE_MOCKS__', 'false')
    const { resolveLiveStockTransport } = await import('./liveStockTransport')
    expect(resolveLiveStockTransport()).toBe('poll')
  })

  it('uses socket when VITE_STOCK_WS_URL is set', async () => {
    vi.stubEnv('DEV', false)
    vi.stubEnv('VITE_STOCK_WS_URL', 'wss://example.com/stock')
    vi.stubGlobal('__BUGBAZAR_ENABLE_MOCKS__', 'false')
    vi.resetModules()
    const { resolveLiveStockTransport, resolveStockSocketUrl } = await import(
      './liveStockTransport'
    )
    expect(resolveLiveStockTransport()).toBe('socket')
    expect(resolveStockSocketUrl()).toBe('wss://example.com/stock')
  })
})
