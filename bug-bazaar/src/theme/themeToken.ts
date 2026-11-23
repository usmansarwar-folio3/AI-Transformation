import type { ThemeConfig } from 'antd'

/**
 * Ant Design design tokens. Keep `src/styles/_variables.scss` aligned with these values.
 * Market-stall palette: warm paper, burnt-orange primary, dark sider.
 */
export const themeToken: NonNullable<ThemeConfig['token']> = {
  colorPrimary: '#c45c26',
  colorSuccess: '#52c41a',
  colorWarning: '#faad14',
  colorError: '#ff4d4f',
  colorInfo: '#1f6f8b',
  colorText: 'rgba(28, 25, 23, 0.88)',
  colorTextSecondary: 'rgba(28, 25, 23, 0.45)',
  colorBgContainer: '#ffffff',
  colorBgLayout: '#f6f1ea',
  borderRadius: 10,
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
}
