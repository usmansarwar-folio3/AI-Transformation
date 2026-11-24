/// <reference types="vite/client" />
/// <reference types="msw/vite/client" />

/** Baked at build time from BUGBAZAR_ENABLE_MOCKS or VITE_ENABLE_MOCKS (see vite.config.ts). */
declare const __BUGBAZAR_ENABLE_MOCKS__: string

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string
  readonly VITE_ENABLE_MOCKS?: string
  /** Optional external WebSocket URL for live stock (skip same-origin /stock). */
  readonly VITE_STOCK_WS_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
