import { Button, Col, Empty, InputNumber, Row, Space, Typography } from 'antd'
import { useNavigate } from 'react-router-dom'
import {
  removeItem,
  selectCartItems,
  selectCartTotalCents,
  setQuantity,
  useAppDispatch,
  useAppSelector,
} from '../../store'
import { formatPriceFromCents } from '../../utils/formatPrice'
import './mini-cart.scss'

const { Title, Text } = Typography

type MiniCartProps = {
  onCheckoutNavigate?: () => void
}

export function MiniCart({ onCheckoutNavigate }: MiniCartProps) {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const items = useAppSelector(selectCartItems)
  const totalCents = useAppSelector(selectCartTotalCents)

  function goToCheckout() {
    onCheckoutNavigate?.()
    void navigate('/cart')
  }

  return (
    <Row className="mini-cart" gutter={[12, 12]}>
      <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
        <Title level={4} className="mini-cart__title">
          Cart
        </Title>
      </Col>

      {items.length === 0 ? (
        <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
          <Empty
            className="mini-cart__empty"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Your cart is empty"
          />
        </Col>
      ) : (
        <>
          {items.map((item) => (
            <Col key={item.productId} xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
              <Space className="mini-cart__line" orientation="vertical" size={4}>
                <Text className="mini-cart__name" strong>
                  {item.name}
                </Text>
                <Text className="mini-cart__meta" type="secondary">
                  {formatPriceFromCents(item.price)} each
                </Text>
                <Row gutter={[8, 8]} align="middle">
                  <Col xs={12} sm={12} md={12} lg={12} xl={12} xxl={12}>
                    <InputNumber
                      className="mini-cart__qty"
                      min={1}
                      max={item.stock}
                      value={item.quantity}
                      size="small"
                      aria-label={`Quantity for ${item.name}`}
                      onChange={(value) => {
                        if (typeof value !== 'number') {
                          return
                        }
                        dispatch(setQuantity({ productId: item.productId, quantity: value }))
                      }}
                    />
                  </Col>
                  <Col xs={12} sm={12} md={12} lg={12} xl={12} xxl={12}>
                    <Text className="mini-cart__line-total">
                      {formatPriceFromCents(item.price * item.quantity)}
                    </Text>
                  </Col>
                </Row>
                <Button
                  danger
                  type="link"
                  size="small"
                  className="mini-cart__remove"
                  onClick={() => {
                    dispatch(removeItem({ productId: item.productId }))
                  }}
                >
                  Remove
                </Button>
              </Space>
            </Col>
          ))}

          <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
            <Text className="mini-cart__total" strong>
              Total: {formatPriceFromCents(totalCents)}
            </Text>
          </Col>

          <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
            <Button type="primary" block className="mini-cart__checkout" onClick={goToCheckout}>
              Checkout
            </Button>
          </Col>
        </>
      )}
    </Row>
  )
}
