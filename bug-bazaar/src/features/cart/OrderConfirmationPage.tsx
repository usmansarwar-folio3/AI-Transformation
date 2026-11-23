import { Button, Col, Row, Typography } from 'antd'
import { useNavigate, useParams } from 'react-router-dom'
import { failure } from '../../api'
import { AsyncStatusView } from '../../components/AsyncStatusView'
import { requestStatusFromQuery, useOrderQuery } from '../../query'
import './order-confirmation-page.scss'

const { Title, Text, Paragraph } = Typography

type OrderConfirmationContentProps = {
  orderId: string
}

function OrderConfirmationContent({ orderId }: OrderConfirmationContentProps) {
  const navigate = useNavigate()
  const orderQuery = useOrderQuery(orderId)
  const status = requestStatusFromQuery(orderQuery)

  return (
    <Row className="order-confirmation-page" gutter={[16, 16]}>
      <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
        <Title level={2} className="order-confirmation-page__title">
          Order confirmation
        </Title>
      </Col>

      <AsyncStatusView
        status={status}
        loadingDescription="Loading order"
        emptyTitle="Order unavailable"
        emptyDescription="This order has no details to show."
        isEmpty={() => false}
        onRetry={() => {
          void orderQuery.refetch()
        }}
      >
        {(order) => (
          <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
            <Paragraph>
              <Text className="order-confirmation-page__meta">Order ID: </Text>
              <Text code>{order.id}</Text>
            </Paragraph>
            <Paragraph>
              <Text className="order-confirmation-page__meta">Status: </Text>
              <Text className="order-confirmation-page__status" strong>
                {order.status}
              </Text>
            </Paragraph>
            <Button
              type="primary"
              onClick={() => {
                void navigate('/')
              }}
            >
              Continue shopping
            </Button>
          </Col>
        )}
      </AsyncStatusView>
    </Row>
  )
}

export function OrderConfirmationPage() {
  const { orderId } = useParams<{ orderId: string }>()
  const navigate = useNavigate()

  if (!orderId) {
    return (
      <Row className="order-confirmation-page" gutter={[16, 16]}>
        <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
          <Title level={2} className="order-confirmation-page__title">
            Order confirmation
          </Title>
          <AsyncStatusView
            status={failure({
              httpStatus: 404,
              code: 'NOT_FOUND',
              message: 'Order not found.',
            })}
            loadingDescription="Loading order"
            emptyTitle="Order unavailable"
            emptyDescription="This order has no details to show."
            onRetry={() => {
              void navigate('/')
            }}
          >
            {() => null}
          </AsyncStatusView>
        </Col>
      </Row>
    )
  }

  return <OrderConfirmationContent key={orderId} orderId={orderId} />
}
