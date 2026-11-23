import type { ThemeConfig } from 'antd'
import { themeToken } from './themeToken'

export const themeConfig: ThemeConfig = {
  token: themeToken,
  components: {
    Layout: {
      siderBg: '#1c1917',
      bodyBg: themeToken.colorBgLayout,
      headerBg: '#1c1917',
      triggerBg: '#1c1917',
    },
    Card: {
      borderRadiusLG: themeToken.borderRadius,
      paddingLG: 16,
    },
  },
}
