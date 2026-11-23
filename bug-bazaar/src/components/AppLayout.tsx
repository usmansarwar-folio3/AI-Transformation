import { Badge, Button, Col, Layout, Row } from 'antd'
import { Outlet, useNavigate } from 'react-router-dom'
import { selectCartItemCount, useAppSelector } from '../store'
import './app-layout.scss'

const { Header, Content, Footer } = Layout

export function AppLayout() {
  const navigate = useNavigate()
  const cartItemCount = useAppSelector(selectCartItemCount)

  return (
    <Layout className="app-layout">
      <Header className="app-layout__header">
        <Row className="app-layout__header-row" gutter={[16, 16]} align="middle">
          <Col xs={16} sm={16} md={18} lg={18} xl={18} xxl={18}>
            <Button
              type="link"
              className="app-layout__brand"
              onClick={() => {
                void navigate('/')
              }}
            >
              The Bug Bazaar
            </Button>
          </Col>
          <Col xs={8} sm={8} md={6} lg={6} xl={6} xxl={6} className="app-layout__actions">
            <Badge count={cartItemCount} overflowCount={99} className="app-layout__cart-badge">
              <Button
                className="app-layout__cart"
                aria-label={
                  cartItemCount === 0
                    ? 'Cart, empty'
                    : `Cart, ${cartItemCount} item${cartItemCount === 1 ? '' : 's'}`
                }
                onClick={() => {
                  // Cart route lands in D3-2; badge wiring is the D3-1 deliverable.
                  void navigate('/')
                }}
              >
                Cart
              </Button>
            </Badge>
          </Col>
        </Row>
      </Header>
      <Content className="app-layout__content">
        <Outlet />
      </Content>
      <Footer className="app-layout__footer">The Bug Bazaar</Footer>
    </Layout>
  )
}
