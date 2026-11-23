import { Badge, Button, Col, Layout, Row, Space } from 'antd'
import { Outlet, useNavigate } from 'react-router-dom'
import { getAuthToken, logout as clearAuthToken } from '../api'
import {
  clearSession,
  selectCartItemCount,
  selectIsLoggedIn,
  useAppDispatch,
  useAppSelector,
} from '../store'
import './app-layout.scss'

const { Header, Content, Footer } = Layout

export function AppLayout() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const cartItemCount = useAppSelector(selectCartItemCount)
  const isLoggedIn = useAppSelector(selectIsLoggedIn)
  const hasToken = Boolean(getAuthToken())
  const signedIn = isLoggedIn && hasToken

  function handleLogout() {
    clearAuthToken()
    dispatch(clearSession())
    void navigate('/', { replace: true })
  }

  return (
    <Layout className="app-layout">
      <Header className="app-layout__header">
        <Row className="app-layout__header-row" gutter={[16, 16]} align="middle">
          <Col xs={12} sm={12} md={12} lg={12} xl={12} xxl={12}>
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
          <Col xs={12} sm={12} md={12} lg={12} xl={12} xxl={12} className="app-layout__actions">
            <Space className="app-layout__nav" wrap>
              {signedIn ? (
                <>
                  <Button
                    type="link"
                    className="app-layout__link"
                    onClick={() => {
                      void navigate('/account')
                    }}
                  >
                    Account
                  </Button>
                  <Button type="link" className="app-layout__link" onClick={handleLogout}>
                    Log out
                  </Button>
                </>
              ) : (
                <Button
                  type="link"
                  className="app-layout__link"
                  onClick={() => {
                    void navigate('/login')
                  }}
                >
                  Sign in
                </Button>
              )}
              <Badge count={cartItemCount} overflowCount={99} className="app-layout__cart-badge">
                <Button
                  className="app-layout__cart"
                  aria-label={
                    cartItemCount === 0
                      ? 'Cart, empty'
                      : `Cart, ${cartItemCount} item${cartItemCount === 1 ? '' : 's'}`
                  }
                  onClick={() => {
                    void navigate('/cart')
                  }}
                >
                  Cart
                </Button>
              </Badge>
            </Space>
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
