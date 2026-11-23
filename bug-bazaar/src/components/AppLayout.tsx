import { useState, type ReactNode } from 'react'
import {
  ApiOutlined,
  DownOutlined,
  ExperimentOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ShoppingCartOutlined,
  ShopOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { Badge, Button, Col, Drawer, Dropdown, Grid, Image, Layout, Row, Space, Typography } from 'antd'
import type { MenuProps } from 'antd'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { getAuthToken, logout as clearAuthToken } from '../api'
import { MiniCart } from '../features/cart/MiniCart'
import {
  clearSession,
  selectCartItemCount,
  selectIsLoggedIn,
  useAppDispatch,
  useAppSelector,
} from '../store'
import { AppErrorBoundary } from './AppErrorBoundary'
import './app-layout.scss'

const { Sider, Content, Footer } = Layout
const { Text } = Typography
const { useBreakpoint } = Grid

const DEMO_TRIGGER_ITEMS: MenuProps['items'] = [
  { key: 'empty', label: 'Empty list (search=__none__)' },
  { key: 'error', label: 'List error (forceError=500)' },
  { key: 'slow', label: 'Out-of-order list (slow=1)' },
  { key: 'missing', label: 'Details 404 (/products/missing)' },
]

type AppNavProps = {
  onNavigate?: () => void
}

function AppNav({ onNavigate }: AppNavProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useAppDispatch()
  const isLoggedIn = useAppSelector(selectIsLoggedIn)
  const hasToken = Boolean(getAuthToken())
  const signedIn = isLoggedIn && hasToken

  function go(path: string) {
    void navigate(path)
    onNavigate?.()
  }

  function handleLogout() {
    clearAuthToken()
    dispatch(clearSession())
    void navigate('/', { replace: true })
    onNavigate?.()
  }

  const handleDemoTriggerClick: MenuProps['onClick'] = ({ key }) => {
    switch (key) {
      case 'empty':
        go('/?search=__none__')
        break
      case 'error':
        go('/?forceError=500')
        break
      case 'slow':
        go('/?slow=1')
        break
      case 'missing':
        go('/products/missing')
        break
      default:
        break
    }
  }

  return (
    <>
      <Button
        type="link"
        className="app-layout__brand"
        aria-label="Bug Bazaar home"
        onClick={() => {
          go('/')
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
            go('/')
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
            go('/dev/api')
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
                go('/account')
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
              go('/login')
            }}
          >
            Sign in
          </Button>
        )}

        <Dropdown
          className="app-layout__demo-dropdown"
          menu={{ items: DEMO_TRIGGER_ITEMS, onClick: handleDemoTriggerClick }}
          trigger={['click']}
        >
          <Button className="app-layout__nav-button" icon={<ExperimentOutlined />} block>
            Demo triggers <DownOutlined />
          </Button>
        </Dropdown>
      </Space>
    </>
  )
}

export function AppLayout() {
  const navigate = useNavigate()
  const screens = useBreakpoint()
  const cartItemCount = useAppSelector(selectCartItemCount)
  const [navOpen, setNavOpen] = useState(false)
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false)

  const isDesktop = Boolean(screens.lg)

  const cartAriaLabel =
    cartItemCount === 0
      ? 'Cart, empty'
      : `Cart, ${cartItemCount} item${cartItemCount === 1 ? '' : 's'}`

  function closeNav() {
    setNavOpen(false)
  }

  let sideChrome: ReactNode = null
  if (isDesktop) {
    sideChrome = (
      <Sider
        className="app-layout__sider app-layout__sider--left"
        theme="light"
        width={280}
        collapsedWidth={280}
        collapsed={false}
        trigger={null}
      >
        <AppNav />
      </Sider>
    )
  }

  return (
    <Layout className="app-layout">
      <Button type="link" className="app-layout__skip-link" href="#main-content">
        Skip to main content
      </Button>

      {sideChrome}

      <Layout className="app-layout__main">
        <Row className="app-layout__toolbar" gutter={[0, 0]} align="middle">
          <Col xs={12} sm={12} md={12} lg={12} xl={12} xxl={12}>
            {isDesktop ? (
              <Text className="app-layout__toolbar-label">The Bug Bazaar</Text>
            ) : (
              <Space className="app-layout__toolbar-start" size="small" align="center">
                <Button
                  className="app-layout__menu-toggle"
                  icon={navOpen ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
                  aria-label={navOpen ? 'Close navigation' : 'Open navigation'}
                  onClick={() => {
                    setNavOpen((value) => !value)
                  }}
                />
                <Button
                  type="link"
                  className="app-layout__header-brand"
                  aria-label="Bug Bazaar home"
                  onClick={() => {
                    void navigate('/')
                  }}
                >
                  <Image
                    className="app-layout__header-logo"
                    src="/logo.svg"
                    alt=""
                    preview={false}
                    width={28}
                    height={28}
                  />
                  <Text className="app-layout__header-brand-text">Bug Bazaar</Text>
                </Button>
              </Space>
            )}
          </Col>
          <Col xs={12} sm={12} md={12} lg={12} xl={12} xxl={12} className="app-layout__toolbar-end">
            <Badge count={cartItemCount} overflowCount={99} className="app-layout__cart-badge">
              <Button
                icon={<ShoppingCartOutlined />}
                aria-label={cartAriaLabel}
                onClick={() => {
                  setCartDrawerOpen(true)
                }}
              >
                Cart
              </Button>
            </Badge>
          </Col>
        </Row>

        <Content className="app-layout__content" id="main-content" role="main" tabIndex={-1}>
          <AppErrorBoundary>
            <Outlet />
          </AppErrorBoundary>
        </Content>

        <Footer className="app-layout__footer">The Bug Bazaar</Footer>
      </Layout>

      <Drawer
        className="app-layout__nav-drawer"
        title="Menu"
        placement="left"
        open={!isDesktop && navOpen}
        onClose={closeNav}
        size={280}
        destroyOnHidden
      >
        <AppNav onNavigate={closeNav} />
      </Drawer>

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
