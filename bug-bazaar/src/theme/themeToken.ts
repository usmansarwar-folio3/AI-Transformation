import type { ThemeConfig } from 'antd'

/**
 * Ant Design design tokens. Keep `src/styles/_variables.scss` aligned with these values.
 */
export const themeToken: NonNullable<ThemeConfig['token']> = {
  colorPrimary: '#1677ff',
  colorSuccess: '#52c41a',
  colorWarning: '#faad14',
  colorError: '#ff4d4f',
  colorInfo: '#1677ff',
  colorText: '#000000e0',
  colorTextSecondary: '#00000073',
  colorBgContainer: '#ffffff',
  colorBgLayout: '#f5f5f5',
  borderRadius: 6,
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
}
