import { Button, Card, Col, Image, Row, Space, Tag, Typography } from 'antd'
import { useNavigate, useParams } from 'react-router-dom'
import { failure, type Product } from '../../api'
import { AsyncStatusView } from '../../components/AsyncStatusView'
import { useBackToTop } from '../../hooks'
import { useLiveStock, type LiveStockStatus } from '../stock'
import { requestStatusFromQuery, useProductQuery } from '../../query'
import { formatPriceFromCents } from '../../utils/formatPrice'
import { useAddProductToCart } from './useAddProductToCart'
import './product-details-page.scss'

const { Title, Text } = Typography

type ProductDetailsReadyProps = {
  product: Product
  liveStatus: LiveStockStatus
}

function ProductDetailsReady({ product, liveStatus }: ProductDetailsReadyProps) {
  const { disabled, buttonLabel, handleAdd } = useAddProductToCart(product)

  return (
    <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
      <Card className="product-details-page__panel" bordered>
        <Row gutter={[24, 24]} align="top">
          <Col xs={24} sm={24} md={10} lg={10} xl={8} xxl={8}>
            <Image
              className="product-details-page__image"
              src={product.imageUrl}
              alt={product.name}
              preview={false}
            />
          </Col>
          <Col xs={24} sm={24} md={14} lg={14} xl={16} xxl={16}>
            <Space className="product-details-page__info" orientation="vertical" size="middle">
              <Tag className="product-details-page__category">{product.category}</Tag>
              <Title level={2} className="product-details-page__title">
                {product.name}
              </Title>
              <Text className="product-details-page__price">
                {formatPriceFromCents(product.price)}
              </Text>
              <Space className="product-details-page__stock-row" size="small" wrap>
                <Text
                  className="product-details-page__stock"
                  type={product.stock === 0 ? 'danger' : undefined}
                >
                  {product.stock === 0 ? 'Out of stock' : `${product.stock} in stock`}
                </Text>
                <Tag
                  color={
                    liveStatus === 'open'
                      ? 'success'
                      : liveStatus === 'reconnecting'
                        ? 'warning'
                        : 'default'
                  }
                >
                  Live stock: {liveStatus}
                </Tag>
              </Space>
              <Button
                type="primary"
                className="product-details-page__add-to-cart"
                disabled={disabled}
                onClick={handleAdd}
              >
                {buttonLabel}
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>
    </Col>
  )
}

type ProductDetailsContentProps = {
  productId: string
}

function ProductDetailsContent({ productId }: ProductDetailsContentProps) {
  const navigate = useNavigate()
  const productQuery = useProductQuery(productId)
  const status = requestStatusFromQuery(productQuery)
  const { isVisible: showBackToTop, scrollToTop } = useBackToTop()
  const liveStatus = useLiveStock([productId])

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
        onRetry={() => {
          void productQuery.refetch()
        }}
      >
        {(product) => (
          <ProductDetailsReady
            product={product}
            liveStatus={liveStatus}
          />
        )}
      </AsyncStatusView>

      {showBackToTop ? (
        <Col
          xs={24}
          sm={24}
          md={24}
          lg={24}
          xl={24}
          xxl={24}
          className="product-details-page__back-to-top-slot"
        >
          <Button
            type="primary"
            className="product-details-page__back-to-top"
            onClick={scrollToTop}
          >
            Back to Top
          </Button>
        </Col>
      ) : null}
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
