import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { ConfigProvider } from 'antd'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { subscribeUnauthorized } from './auth/unauthorized'
import { queryClient } from './query'
import { clearSession, store } from './store'
import { themeConfig } from './theme/themeConfig'
import App from './App.tsx'
import './styles/global.scss'

subscribeUnauthorized(() => {
  store.dispatch(clearSession())
})

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
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <ConfigProvider theme={themeConfig}>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </ConfigProvider>
        </QueryClientProvider>
      </Provider>
    </StrictMode>,
  )
})
