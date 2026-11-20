import type { KeyboardEvent } from 'react'
import { Card, Image, Space, Typography } from 'antd'
import { useNavigate } from 'react-router-dom'
import type { Product } from '../../api'
import { formatPriceFromCents } from '../../utils/formatPrice'
import './product-card.scss'

const { Text } = Typography

type ProductCardProps = {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const navigate = useNavigate()
  const detailsPath = `/products/${product.id}`
  const priceLabel = formatPriceFromCents(product.price)
  const stockLabel = product.stock === 0 ? 'Out of stock' : `${product.stock} in stock`
  const ariaLabel = `${product.name}, ${priceLabel}, ${stockLabel}`

  function openDetails() {
    void navigate(detailsPath)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      openDetails()
    }
  }

  return (
    <Card
      className="product-card"
      hoverable
      tabIndex={0}
      role="link"
      aria-label={ariaLabel}
      cover={
        <Image
          className="product-card__image"
          src={product.imageUrl}
          alt={product.name}
          preview={false}
        />
      }
      onClick={openDetails}
      onKeyDown={handleKeyDown}
    >
      <Space className="product-card__body" orientation="vertical" size={4}>
        <Text className="product-card__name" strong>
          {product.name}
        </Text>
        <Text className="product-card__price">{priceLabel}</Text>
        <Text className="product-card__stock" type={product.stock === 0 ? 'danger' : 'secondary'}>
          {stockLabel}
        </Text>
      </Space>
    </Card>
  )
}
