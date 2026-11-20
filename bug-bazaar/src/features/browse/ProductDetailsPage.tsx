import { useEffect, useState } from 'react'
import { Button, Col, Image, Row, Space, Spin, Typography } from 'antd'
import { useNavigate, useParams } from 'react-router-dom'
import { ApiClientError, getProduct, type Product } from '../../api'
import { formatPriceFromCents } from '../../utils/formatPrice'
import './product-details-page.scss'

const { Title, Paragraph, Text } = Typography

type ProductDetailsContentProps = {
  productId: string
}

function ProductDetailsContent({ productId }: ProductDetailsContentProps) {
  const navigate = useNavigate()
  const [product, setProduct] = useState<Product | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    void getProduct(productId, controller.signal)
      .then((result) => {
        setProduct(result)
        setErrorMessage(null)
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) {
          return
        }
        setProduct(null)
        if (error instanceof ApiClientError && error.status === 404) {
          setErrorMessage('Product not found.')
        } else {
          setErrorMessage('Could not load this product.')
        }
      })

    return () => {
      controller.abort()
    }
  }, [productId])

  const isLoading = product === null && errorMessage === null

  return (
    <Row className="product-details-page" gutter={[24, 24]}>
      <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
        <Button
          type="link"
          className="product-details-page__back"
          onClick={() => {
            void navigate('/')
          }}
        >
          Back to products
        </Button>
      </Col>

      {isLoading ? (
        <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
          <Spin description="Loading product" size="large" />
        </Col>
      ) : null}

      {errorMessage ? (
        <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
          <Paragraph type="danger">{errorMessage}</Paragraph>
        </Col>
      ) : null}

      {product ? (
        <>
          <Col xs={24} sm={24} md={10} lg={10} xl={8} xxl={8}>
            <Image
              className="product-details-page__image"
              src={product.imageUrl}
              alt={product.name}
              preview={false}
            />
          </Col>
          <Col xs={24} sm={24} md={14} lg={14} xl={16} xxl={16}>
            <Space orientation="vertical" size="middle">
              <Title level={2} className="product-details-page__title">
                {product.name}
              </Title>
              <Text className="product-details-page__price">
                {formatPriceFromCents(product.price)}
              </Text>
              <Text
                className="product-details-page__stock"
                type={product.stock === 0 ? 'danger' : undefined}
              >
                {product.stock === 0 ? 'Out of stock' : `${product.stock} in stock`}
              </Text>
              <Text className="product-details-page__category" type="secondary">
                Category: {product.category}
              </Text>
            </Space>
          </Col>
        </>
      ) : null}
    </Row>
  )
}

export function ProductDetailsPage() {
  const { productId } = useParams<{ productId: string }>()

  if (!productId) {
    return (
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
          <Paragraph type="danger">Product not found.</Paragraph>
        </Col>
      </Row>
    )
  }

  return <ProductDetailsContent key={productId} productId={productId} />
}
