import { Button, Col, Image, Row, Space, Tag, Typography, message } from 'antd'
import { useNavigate, useParams } from 'react-router-dom'
import { failure } from '../../api'
import { AsyncStatusView } from '../../components/AsyncStatusView'
import { useBackToTop } from '../../hooks'
import { useLiveStock } from '../stock'
import { requestStatusFromQuery, useProductQuery } from '../../query'
import { addItem, useAppDispatch } from '../../store'
import { formatPriceFromCents } from '../../utils/formatPrice'
import './product-details-page.scss'

const { Title, Text } = Typography

type ProductDetailsContentProps = {
  productId: string
}

function ProductDetailsContent({ productId }: ProductDetailsContentProps) {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
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
                <Tag color={liveStatus === 'open' ? 'success' : 'default'}>
                  Live stock: {liveStatus}
                </Tag>
                <Text className="product-details-page__category" type="secondary">
                  Category: {product.category}
                </Text>
                <Button
                  type="primary"
                  className="product-details-page__add-to-cart"
                  disabled={product.stock === 0}
                  onClick={() => {
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
                  }}
                >
                  {product.stock === 0 ? 'Out of stock' : 'Add to cart'}
                </Button>
              </Space>
            </Col>
          </>
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
