import react from '@vitejs/plugin-react'
import { msw } from 'msw/vite'
import { defineConfig } from 'vite'
import { stockFeedPlugin } from './vite.stockFeed.ts'

/**
 * Non-VITE_ name avoids Vercel's "exposed to browser" warning for VITE_* vars.
 * Still public at runtime once baked into the client bundle — never put secrets here.
 */
function readEnableMocksFlag(): string {
  return process.env.BUGBAZAR_ENABLE_MOCKS ?? process.env.VITE_ENABLE_MOCKS ?? ''
}

// https://vite.dev/config/
export default defineConfig({
  define: {
    __BUGBAZAR_ENABLE_MOCKS__: JSON.stringify(readEnableMocksFlag()),
  },
  plugins: [react(), msw(), stockFeedPlugin()],
})

