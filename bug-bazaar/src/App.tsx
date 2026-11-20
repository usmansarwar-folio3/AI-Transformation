import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/AppLayout'
import { ProductDetailsPage } from './features/browse/ProductDetailsPage'
import { ProductListPage } from './features/browse/ProductListPage'

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<ProductListPage />} />
        <Route path="products/:productId" element={<ProductDetailsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default App
