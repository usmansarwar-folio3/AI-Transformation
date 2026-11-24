import { memo, type KeyboardEvent } from 'react'
import { Button, Card, Image, Space, Tag, Typography } from 'antd'
import { useNavigate } from 'react-router-dom'
import type { Product, ProductCategory } from '../../api'
import { formatPriceFromCents } from '../../utils/formatPrice'
import { useAddProductToCart } from './useAddProductToCart'
import './product-card.scss'

const { Text } = Typography

const CATEGORY_TAG_COLOR: Record<ProductCategory, string> = {
  keyboards: 'orange',
  ducks: 'gold',
  coffee: 'green',
  stickers: 'blue',
}

type ProductCardProps = {
  product: Product
}

function ProductCardComponent({ product }: ProductCardProps) {
  const navigate = useNavigate()
  const { disabled, buttonLabel, handleAdd } = useAddProductToCart(product)
  const detailsPath = `/products/${product.id}`
  const priceLabel = formatPriceFromCents(product.price)
  const stockLabel = product.stock === 0 ? 'Out of stock' : `${product.stock} in stock`
  const outOfStock = product.stock === 0
  const detailsAriaLabel = `${product.name}, ${priceLabel}, ${stockLabel}`

  function openDetails() {
    void navigate(detailsPath)
  }

  function handleDetailsKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      openDetails()
    }
  }

  return (
    <Card
      className="product-card"
      hoverable
      cover={
        <Button
          type="link"
          className="product-card__cover-button"
          aria-label={detailsAriaLabel}
          onClick={openDetails}
        >
          <Image
            className="product-card__image"
            src={product.imageUrl}
            alt={product.name}
            preview={false}
          />
        </Button>
      }
      actions={[
        <Button
          key="add-to-cart"
          type="primary"
          className="product-card__add-to-cart"
          block
          disabled={disabled}
          onClick={handleAdd}
        >
          {buttonLabel}
        </Button>,
      ]}
    >
      <Space
        className="product-card__body"
        orientation="vertical"
        size={4}
        role="link"
        tabIndex={0}
        aria-label={detailsAriaLabel}
        onClick={openDetails}
        onKeyDown={handleDetailsKeyDown}
      >
        <Tag className="product-card__category" color={CATEGORY_TAG_COLOR[product.category]}>
          {product.category}
        </Tag>
        <Text className="product-card__name" strong>
          {product.name}
        </Text>
        <Text className="product-card__price">{priceLabel}</Text>
        <Text className="product-card__stock" type={outOfStock ? 'danger' : 'secondary'}>
          {stockLabel}
        </Text>
      </Space>
    </Card>
  )
}

/** Memoized so cart badge updates in AppLayout do not re-render unchanged cards. */
export const ProductCard = memo(ProductCardComponent)
