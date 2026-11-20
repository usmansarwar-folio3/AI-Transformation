import type { ThemeConfig } from 'antd'
import { themeToken } from './themeToken'

export const themeConfig: ThemeConfig = {
  token: themeToken,
  components: {
    Layout: {
      headerBg: themeToken.colorBgContainer,
      bodyBg: themeToken.colorBgLayout,
    },
  },
}
