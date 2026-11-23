import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/AppLayout'
import { ProductDetailsPage } from './features/browse/ProductDetailsPage'
import { ProductListPage } from './features/browse/ProductListPage'
import { CartPage } from './features/cart/CartPage'
import { OrderConfirmationPage } from './features/cart/OrderConfirmationPage'

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<ProductListPage />} />
        <Route path="products/:productId" element={<ProductDetailsPage />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="orders/:orderId" element={<OrderConfirmationPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default App
