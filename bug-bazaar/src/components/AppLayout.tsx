import { useEffect, useState } from 'react'
import {
  ApiOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ShoppingCartOutlined,
  ShopOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { Badge, Button, Col, Drawer, Grid, Image, Layout, Row, Space, Typography } from 'antd'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { getAuthToken, logout as clearAuthToken } from '../api'
import { SidebarFilters } from '../features/browse/SidebarFilters'
import { MiniCart } from '../features/cart/MiniCart'
import {
  clearSession,
  selectCartItemCount,
  selectIsLoggedIn,
  useAppDispatch,
  useAppSelector,
} from '../store'
import './app-layout.scss'

const { Sider, Content, Footer } = Layout
const { Text } = Typography
const { useBreakpoint } = Grid

export function AppLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useAppDispatch()
  const screens = useBreakpoint()
  const cartItemCount = useAppSelector(selectCartItemCount)
  const isLoggedIn = useAppSelector(selectIsLoggedIn)
  const hasToken = Boolean(getAuthToken())
  const signedIn = isLoggedIn && hasToken
  const [leftCollapsed, setLeftCollapsed] = useState(false)
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false)

  const showRightSider = Boolean(screens.lg)
  const hideCartDrawer = showRightSider

  useEffect(() => {
    if (hideCartDrawer) {
      setCartDrawerOpen(false)
    }
  }, [hideCartDrawer])

  function handleLogout() {
    clearAuthToken()
    dispatch(clearSession())
    void navigate('/', { replace: true })
  }

  function openCart() {
    if (showRightSider) {
      return
    }
    setCartDrawerOpen(true)
  }

  return (
    <Layout className="app-layout">
      <Button type="link" className="app-layout__skip-link" href="#main-content">
        Skip to main content
      </Button>

      <Sider
        className="app-layout__sider app-layout__sider--left"
        theme="dark"
        width={280}
        breakpoint="lg"
        collapsedWidth={0}
        collapsed={leftCollapsed}
        onCollapse={(collapsed) => {
          setLeftCollapsed(collapsed)
        }}
        trigger={null}
      >
        <Button
          type="link"
          className="app-layout__brand"
          aria-label="Bug Bazaar home"
          onClick={() => {
            void navigate('/')
          }}
        >
          <Image
            className="app-layout__logo"
            src="/logo.svg"
            alt=""
            preview={false}
            width={36}
            height={36}
          />
          <Text className="app-layout__brand-text">Bug Bazaar</Text>
        </Button>

        <Space className="app-layout__nav" orientation="vertical" size={8}>
          <Button
            type={location.pathname === '/' ? 'primary' : 'default'}
            className="app-layout__nav-button"
            icon={<ShopOutlined />}
            block
            onClick={() => {
              void navigate('/')
            }}
          >
            Shop
          </Button>
          <Button
            type={location.pathname.startsWith('/dev/api') ? 'primary' : 'default'}
            className="app-layout__nav-button"
            icon={<ApiOutlined />}
            block
            onClick={() => {
              void navigate('/dev/api')
            }}
          >
            Mock API
          </Button>
          {signedIn ? (
            <>
              <Button
                type={location.pathname.startsWith('/account') ? 'primary' : 'default'}
                className="app-layout__nav-button"
                icon={<UserOutlined />}
                block
                onClick={() => {
                  void navigate('/account')
                }}
              >
                Account
              </Button>
              <Button
                className="app-layout__nav-button"
                icon={<LogoutOutlined />}
                block
                onClick={handleLogout}
              >
                Log out
              </Button>
            </>
          ) : (
            <Button
              type={location.pathname.startsWith('/login') ? 'primary' : 'default'}
              className="app-layout__nav-button"
              icon={<UserOutlined />}
              block
              onClick={() => {
                void navigate('/login')
              }}
            >
              Sign in
            </Button>
          )}
          <Badge count={cartItemCount} overflowCount={99} className="app-layout__cart-badge">
            <Button
              className="app-layout__nav-button"
              icon={<ShoppingCartOutlined />}
              block
              aria-label={
                cartItemCount === 0
                  ? 'Cart, empty'
                  : `Cart, ${cartItemCount} item${cartItemCount === 1 ? '' : 's'}`
              }
              onClick={openCart}
            >
              Cart
            </Button>
          </Badge>
        </Space>

        <SidebarFilters />
      </Sider>

      <Layout className="app-layout__main">
        <Row className="app-layout__toolbar" gutter={[16, 16]} align="middle">
          <Col xs={12} sm={12} md={12} lg={12} xl={12} xxl={12}>
            <Button
              className="app-layout__menu-toggle"
              icon={leftCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              aria-label={leftCollapsed ? 'Open navigation' : 'Close navigation'}
              onClick={() => {
                setLeftCollapsed((value) => !value)
              }}
            />
          </Col>
          <Col xs={12} sm={12} md={12} lg={12} xl={12} xxl={12} className="app-layout__toolbar-end">
            {showRightSider ? (
              <Text className="app-layout__toolbar-label">The Bug Bazaar</Text>
            ) : (
              <Badge count={cartItemCount} overflowCount={99}>
                <Button
                  icon={<ShoppingCartOutlined />}
                  aria-label={
                    cartItemCount === 0
                      ? 'Cart, empty'
                      : `Cart, ${cartItemCount} item${cartItemCount === 1 ? '' : 's'}`
                  }
                  onClick={() => {
                    setCartDrawerOpen(true)
                  }}
                >
                  Cart
                </Button>
              </Badge>
            )}
          </Col>
        </Row>

        <Content className="app-layout__content" id="main-content" role="main" tabIndex={-1}>
          <Outlet />
        </Content>

        <Footer className="app-layout__footer">The Bug Bazaar</Footer>
      </Layout>

      {showRightSider ? (
        <Sider
          className="app-layout__sider app-layout__sider--right"
          theme="light"
          width={320}
          collapsible={false}
        >
          <MiniCart />
        </Sider>
      ) : null}

      <Drawer
        className="app-layout__cart-drawer"
        title="Cart"
        placement="right"
        open={cartDrawerOpen}
        onClose={() => {
          setCartDrawerOpen(false)
        }}
        size={320}
        destroyOnHidden
      >
        <MiniCart
          onCheckoutNavigate={() => {
            setCartDrawerOpen(false)
          }}
        />
      </Drawer>
    </Layout>
  )
}
