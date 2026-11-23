import react from '@vitejs/plugin-react'
import { msw } from 'msw/vite'
import { defineConfig } from 'vite'
import { stockFeedPlugin } from './vite.stockFeed.ts'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), msw(), stockFeedPlugin()],
})
