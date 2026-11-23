import { useRef, useState } from 'react'
import {
  Alert,
  Button,
  Col,
  Divider,
  Form,
  Input,
  InputNumber,
  Row,
  Space,
  Typography,
} from 'antd'
import { useNavigate } from 'react-router-dom'
import {
  ApiClientError,
  createOrder,
  getAuthToken,
  login,
  type OrderCreated,
  type RequestError,
} from '../../api'
import {
  clearCart,
  removeItem,
  selectCartItems,
  selectCartTotalCents,
  selectIsLoggedIn,
  selectSessionUser,
  setQuantity,
  setUser,
  useAppDispatch,
  useAppSelector,
} from '../../store'
import { formatPriceFromCents } from '../../utils/formatPrice'
import { formatCheckoutErrorMessage } from './checkoutErrorMessage'
import { createIdempotencyKey } from './idempotencyKey'
import './cart-page.scss'

const { Title, Text, Paragraph } = Typography

type DemoLoginValues = {
  email: string
  password: string
}

export function CartPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const items = useAppSelector(selectCartItems)
  const totalCents = useAppSelector(selectCartTotalCents)
  const isLoggedIn = useAppSelector(selectIsLoggedIn)
  const user = useAppSelector(selectSessionUser)

  const [checkoutError, setCheckoutError] = useState<RequestError | null>(null)
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)
  const idempotencyKeyRef = useRef<string | null>(null)

  const hasToken = Boolean(getAuthToken())
  const canCheckout = items.length > 0 && isLoggedIn && hasToken

  function ensureIdempotencyKey(): string {
    if (!idempotencyKeyRef.current) {
      idempotencyKeyRef.current = createIdempotencyKey()
    }
    return idempotencyKeyRef.current
  }

  async function handleCheckout() {
    if (items.length === 0) {
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
      dispatch(clearCart())
      idempotencyKeyRef.current = null
      void navigate(`/orders/${order.id}`)
    } catch (error: unknown) {
      if (error instanceof ApiClientError) {
        setCheckoutError(error.toRequestError())
      } else {
        setCheckoutError({
          httpStatus: 0,
          code: 'UNKNOWN',
          message: 'Checkout failed. Try again.',
        })
      }
    } finally {
      setIsCheckingOut(false)
    }
  }

  async function handleDemoLogin(values: DemoLoginValues) {
    setIsSigningIn(true)
    setLoginError(null)
    try {
      const result = await login({
        email: values.email.trim(),
        password: values.password,
      })
      dispatch(setUser(result.user))
    } catch (error: unknown) {
      if (error instanceof ApiClientError) {
        setLoginError(error.message)
      } else {
        setLoginError('Could not sign in.')
      }
    } finally {
      setIsSigningIn(false)
    }
  }

  return (
    <Row className="cart-page" gutter={[16, 16]}>
      <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
        <Title level={2} className="cart-page__title">
          Cart
        </Title>
      </Col>

      {items.length === 0 ? (
        <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
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
        </Col>
      ) : (
        <>
          {items.map((item) => (
            <Col key={item.productId} xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
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
              <Divider />
            </Col>
          ))}

          <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
            <Text className="cart-page__total" strong>
              Total: {formatPriceFromCents(totalCents)}
            </Text>
          </Col>

          {!canCheckout ? (
            <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
              <Alert
                className="cart-page__auth"
                type="info"
                showIcon
                message="Sign in to checkout"
                description="Checkout needs a session (token stays in memory). Demo password: password."
              />
              <Form
                className="cart-page__auth"
                layout="vertical"
                requiredMark={false}
                initialValues={{ email: 'shopper@bugbazaar.dev', password: 'password' }}
                onFinish={(values: DemoLoginValues) => {
                  void handleDemoLogin(values)
                }}
              >
                <Form.Item
                  label="Email"
                  name="email"
                  rules={[{ required: true, message: 'Email is required' }]}
                >
                  <Input type="email" autoComplete="username" aria-label="Email" />
                </Form.Item>
                <Form.Item
                  label="Password"
                  name="password"
                  rules={[{ required: true, message: 'Password is required' }]}
                >
                  <Input.Password autoComplete="current-password" aria-label="Password" />
                </Form.Item>
                {loginError ? (
                  <Alert type="error" showIcon message={loginError} className="cart-page__error" />
                ) : null}
                <Button type="primary" htmlType="submit" loading={isSigningIn}>
                  Sign in
                </Button>
              </Form>
            </Col>
          ) : (
            <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
              <Space orientation="vertical" size="middle">
                <Text type="secondary">Signed in as {user?.email}</Text>
                {checkoutError ? (
                  <Alert
                    className="cart-page__error"
                    type="error"
                    showIcon
                    message="Checkout failed"
                    description={formatCheckoutErrorMessage(checkoutError, items)}
                    action={
                      <Button
                        type="primary"
                        loading={isCheckingOut}
                        onClick={() => {
                          void handleCheckout()
                        }}
                      >
                        Retry checkout
                      </Button>
                    }
                  />
                ) : (
                  <Button
                    type="primary"
                    loading={isCheckingOut}
                    onClick={() => {
                      void handleCheckout()
                    }}
                  >
                    Checkout
                  </Button>
                )}
              </Space>
            </Col>
          )}
        </>
      )}
    </Row>
  )
}
