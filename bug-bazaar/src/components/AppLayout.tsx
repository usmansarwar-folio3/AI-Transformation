import { Button, Col, Layout, Row } from 'antd'
import { Outlet, useNavigate } from 'react-router-dom'
import './app-layout.scss'

const { Header, Content, Footer } = Layout

export function AppLayout() {
  const navigate = useNavigate()

  return (
    <Layout className="app-layout">
      <Header className="app-layout__header">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
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
        </Row>
      </Header>
      <Content className="app-layout__content">
        <Outlet />
      </Content>
      <Footer className="app-layout__footer">The Bug Bazaar</Footer>
    </Layout>
  )
}
