import { message } from 'antd'
import type { Product } from '../../api'
import {
  addItem,
  selectCartQuantityByProductId,
  useAppDispatch,
  useAppSelector,
} from '../../store'

export type AddProductToCartControls = {
  cartQty: number
  outOfStock: boolean
  cartFull: boolean
  disabled: boolean
  buttonLabel: string
  handleAdd: () => void
}

function cartFullWarning(stock: number, cartQty: number): string {
  return `Only ${stock} in stock — you already have ${cartQty} in your cart.`
}

/** Shared Add-to-cart rules for product list cards and details. */
export function useAddProductToCart(product: Product): AddProductToCartControls {
  const dispatch = useAppDispatch()
  const cartQty = useAppSelector(selectCartQuantityByProductId(product.id))
  const outOfStock = product.stock === 0
  const cartFull = !outOfStock && cartQty >= product.stock
  const disabled = outOfStock || cartFull

  let buttonLabel = 'Add to cart'
  if (outOfStock) {
    buttonLabel = 'Out of stock'
  } else if (cartFull) {
    buttonLabel = `Max added (${cartQty})`
  } else if (cartQty > 0) {
    buttonLabel = `Add to cart (${cartQty})`
  }

  function handleAdd() {
    if (outOfStock) {
      return
    }
    if (cartFull) {
      void message.warning(cartFullWarning(product.stock, cartQty))
      return
    }

    dispatch(
      addItem({
        productId: product.id,
        name: product.name,
        price: product.price,
        stock: product.stock,
        quantity: 1,
      }),
    )
    void message.success(`${product.name} added to cart`)
  }

  return {
    cartQty,
    outOfStock,
    cartFull,
    disabled,
    buttonLabel,
    handleAdd,
  }
}
