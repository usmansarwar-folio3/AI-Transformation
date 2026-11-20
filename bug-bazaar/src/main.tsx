import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ConfigProvider } from 'antd'
import { themeConfig } from './theme/themeConfig'
import App from './App.tsx'
import './styles/global.scss'

async function enableMockApi(): Promise<void> {
  if (!import.meta.env.DEV) {
    return
  }

  const { network } = await import('virtual:msw')
  const { handlers } = await import('./mocks/handlers')
  network.configure({ handlers })
  await network.enable()
}

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Root element #root was not found')
}

void enableMockApi().then(() => {
  createRoot(rootElement).render(
    <StrictMode>
      <ConfigProvider theme={themeConfig}>
        <App />
      </ConfigProvider>
    </StrictMode>,
  )
})
