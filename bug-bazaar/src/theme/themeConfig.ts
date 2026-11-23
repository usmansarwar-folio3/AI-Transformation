import type { ThemeConfig } from 'antd'
import { themeToken } from './themeToken'

const siderBg = '#ebe0d2'

export const themeConfig: ThemeConfig = {
  token: themeToken,
  components: {
    Layout: {
      siderBg,
      bodyBg: themeToken.colorBgLayout,
      headerBg: siderBg,
      triggerBg: siderBg,
    },
    Card: {
      borderRadiusLG: themeToken.borderRadius,
      paddingLG: 16,
    },
  },
}
