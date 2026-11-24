import { useRef, useState } from 'react'
import {
  Alert,
  Button,
  Card,
  Col,
  InputNumber,
  Row,
  Space,
  Typography,
} from 'antd'
import { useQueryClient } from '@tanstack/react-query'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  createOrder,
  getAuthToken,
  toRequestError,
  type OrderCreated,
  type RequestError,
} from '../../api'
import { productKeys } from '../../query'
import {
  clearCart,
  removeItem,
  selectCartItems,
  selectCartTotalCents,
  selectIsLoggedIn,
  selectSessionUser,
  setQuantity,
  useAppDispatch,
  useAppSelector,
} from '../../store'
import { formatPriceFromCents } from '../../utils/formatPrice'
import { formatCheckoutErrorMessage } from './checkoutErrorMessage'
import { createIdempotencyKey } from './idempotencyKey'
import './cart-page.scss'

const { Title, Text, Paragraph } = Typography

export function CartPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useAppDispatch()
  const queryClient = useQueryClient()
  const items = useAppSelector(selectCartItems)
  const totalCents = useAppSelector(selectCartTotalCents)
  const isLoggedIn = useAppSelector(selectIsLoggedIn)
  const user = useAppSelector(selectSessionUser)

  const [checkoutError, setCheckoutError] = useState<RequestError | null>(null)
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const idempotencyKeyRef = useRef<string | null>(null)

  const hasToken = Boolean(getAuthToken())
  const canCheckout = items.length > 0 && isLoggedIn && hasToken

  function ensureIdempotencyKey(): string {
    if (!idempotencyKeyRef.current) {
      idempotencyKeyRef.current = createIdempotencyKey()
    }
    return idempotencyKeyRef.current
  }

  function goToLoginForCheckout() {
    void navigate('/login', { state: { from: location } })
  }

  async function handleCheckout() {
    if (items.length === 0) {
      return
    }
    if (!canCheckout) {
      goToLoginForCheckout()
      return
    }

    setIsCheckingOut(true)
    setCheckoutError(null)

    try {
      const order: OrderCreated = await createOrder({
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        idempotencyKey: ensureIdempotencyKey(),
      })
      // Refresh catalog stock after a successful order (D3-5).
      await queryClient.invalidateQueries({ queryKey: productKeys.all })
      dispatch(clearCart())
      idempotencyKeyRef.current = null
      void navigate(`/orders/${order.id}`)
    } catch (error: unknown) {
      setCheckoutError(toRequestError(error))
    } finally {
      setIsCheckingOut(false)
    }
  }

  const checkoutErrorUi = checkoutError
    ? formatCheckoutErrorMessage(checkoutError, items)
    : null

  return (
    <Row className="cart-page" gutter={[16, 16]}>
      <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
        <Title level={2} className="cart-page__title">
          Cart
        </Title>
      </Col>

      {items.length === 0 ? (
        <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
          <Card className="cart-page__panel" bordered>
            <Paragraph className="cart-page__empty">
              Your cart is empty.{' '}
              <Button
                type="link"
                onClick={() => {
                  void navigate('/')
                }}
              >
                Browse products
              </Button>
            </Paragraph>
          </Card>
        </Col>
      ) : (
        <>
          {items.map((item) => (
            <Col key={item.productId} xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
              <Card className="cart-page__line-card" bordered>
                <Row className="cart-page__line" gutter={[16, 16]} align="middle">
                  <Col xs={24} sm={12} md={10} lg={10} xl={10} xxl={10}>
                    <Space orientation="vertical" size={0}>
                      <Text className="cart-page__name" strong>
                        {item.name}
                      </Text>
                      <Text className="cart-page__meta" type="secondary">
                        {formatPriceFromCents(item.price)} each · {item.stock} in stock
                      </Text>
                    </Space>
                  </Col>
                  <Col xs={12} sm={6} md={6} lg={4} xl={4} xxl={4}>
                    <InputNumber
                      className="cart-page__qty"
                      min={1}
                      max={item.stock}
                      value={item.quantity}
                      aria-label={`Quantity for ${item.name}`}
                      onChange={(value) => {
                        if (typeof value !== 'number') {
                          return
                        }
                        dispatch(setQuantity({ productId: item.productId, quantity: value }))
                        idempotencyKeyRef.current = null
                      }}
                    />
                  </Col>
                  <Col xs={12} sm={6} md={4} lg={4} xl={4} xxl={4}>
                    <Text className="cart-page__summary">
                      {formatPriceFromCents(item.price * item.quantity)}
                    </Text>
                  </Col>
                  <Col xs={24} sm={24} md={4} lg={6} xl={6} xxl={6}>
                    <Button
                      danger
                      onClick={() => {
                        dispatch(removeItem({ productId: item.productId }))
                        idempotencyKeyRef.current = null
                      }}
                    >
                      Remove
                    </Button>
                  </Col>
                </Row>
              </Card>
            </Col>
          ))}

          <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
            <Card className="cart-page__checkout-panel" bordered>
              <Space orientation="vertical" size="middle" className="cart-page__checkout">
                <Text className="cart-page__total" strong>
                  Total: {formatPriceFromCents(totalCents)}
                </Text>
                {!canCheckout ? (
                  <>
                    <Alert
                      className="cart-page__auth"
                      type="info"
                      showIcon
                      message="Sign in to checkout"
                      description="Checkout is protected. You will return here after signing in."
                    />
                    <Button type="primary" onClick={goToLoginForCheckout}>
                      Sign in to checkout
                    </Button>
                  </>
                ) : (
                  <>
                    <Text type="secondary">Signed in as {user?.email}</Text>
                    {checkoutErrorUi ? (
                      <Alert
                        className="cart-page__error"
                        type="error"
                        showIcon
                        message={checkoutErrorUi.title}
                        description={checkoutErrorUi.description}
                        action={
                          checkoutErrorUi.showRetry ? (
                            <Button
                              type="primary"
                              loading={isCheckingOut}
                              disabled={isCheckingOut}
                              onClick={() => {
                                void handleCheckout()
                              }}
                            >
                              Retry checkout
                            </Button>
                          ) : undefined
                        }
                      />
                    ) : (
                      <Button
                        type="primary"
                        loading={isCheckingOut}
                        disabled={isCheckingOut}
                        onClick={() => {
                          void handleCheckout()
                        }}
                      >
                        Checkout
                      </Button>
                    )}
                  </>
                )}
              </Space>
            </Card>
          </Col>
        </>
      )}
    </Row>
  )
}
