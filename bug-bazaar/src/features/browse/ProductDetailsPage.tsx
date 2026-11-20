import { useEffect, useState } from 'react'
import { Button, Col, Image, Row, Space, Typography } from 'antd'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ApiClientError,
  failure,
  getProduct,
  loading,
  success,
  type Product,
  type RequestStatus,
} from '../../api'
import { AsyncStatusView } from '../../components/AsyncStatusView'
import { formatPriceFromCents } from '../../utils/formatPrice'
import './product-details-page.scss'

const { Title, Text } = Typography

type ProductDetailsContentProps = {
  productId: string
}

function ProductDetailsContent({ productId }: ProductDetailsContentProps) {
  const navigate = useNavigate()
  const [status, setStatus] = useState<RequestStatus<Product>>(loading())
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    void getProduct(productId, controller.signal)
      .then((result) => {
        setStatus(success(result))
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) {
          return
        }
        if (error instanceof ApiClientError) {
          setStatus(failure(error.toRequestError()))
          return
        }
        setStatus(
          failure({
            httpStatus: 0,
            code: 'UNKNOWN',
            message: 'Could not load this product.',
          }),
        )
      })

    return () => {
      controller.abort()
    }
  }, [productId, retryCount])

  function handleRetry() {
    setStatus(loading())
    setRetryCount((count) => count + 1)
  }

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

      <AsyncStatusView
        status={status}
        loadingDescription="Loading product"
        emptyTitle="Product unavailable"
        emptyDescription="This product has no details to show."
        isEmpty={() => false}
        onRetry={handleRetry}
      >
        {(product) => (
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
        )}
      </AsyncStatusView>
    </Row>
  )
}

export function ProductDetailsPage() {
  const { productId } = useParams<{ productId: string }>()
  const navigate = useNavigate()

  if (!productId) {
    return (
      <Row className="product-details-page" gutter={[16, 16]}>
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
        <AsyncStatusView
          status={failure({
            httpStatus: 404,
            code: 'NOT_FOUND',
            message: 'Product not found.',
          })}
          loadingDescription="Loading product"
          emptyTitle="Product unavailable"
          emptyDescription="This product has no details to show."
          onRetry={() => {
            void navigate('/')
          }}
        >
          {() => null}
        </AsyncStatusView>
      </Row>
    )
  }

  return <ProductDetailsContent key={productId} productId={productId} />
}
