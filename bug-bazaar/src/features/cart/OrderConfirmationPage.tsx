import { useEffect, useState } from 'react'
import { Button, Col, Row, Typography } from 'antd'
import { useNavigate, useParams } from 'react-router-dom'
import {
  failure,
  getOrder,
  loading,
  success,
  toRequestError,
  type OrderStatus,
  type RequestStatus,
} from '../../api'
import { AsyncStatusView } from '../../components/AsyncStatusView'
import './order-confirmation-page.scss'

const { Title, Text, Paragraph } = Typography

type OrderConfirmationContentProps = {
  orderId: string
}

function OrderConfirmationContent({ orderId }: OrderConfirmationContentProps) {
  const navigate = useNavigate()
  const [status, setStatus] = useState<RequestStatus<OrderStatus>>(loading())
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    void getOrder(orderId, controller.signal)
      .then((result) => {
        if (controller.signal.aborted) {
          return
        }
        setStatus(success(result))
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) {
          return
        }
        setStatus(failure(toRequestError(error)))
      })

    return () => {
      controller.abort()
    }
  }, [orderId, retryCount])

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
          setStatus(loading())
          setRetryCount((count) => count + 1)
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
