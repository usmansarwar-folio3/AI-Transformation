import { Col, Layout, Row, Typography } from 'antd'
import './app.scss'

const { Header, Content, Footer } = Layout
const { Title, Paragraph } = Typography

function App() {
  return (
    <Layout className="app">
      <Header className="app__header">
        <Title level={3} className="app__title">
          The Bug Bazaar
        </Title>
      </Header>
      <Content className="app__content">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
            <Paragraph>
              Developer gear store starter. Product browsing, cart, and auth land in later day
              tasks. All HTTP goes through the typed API client.
            </Paragraph>
          </Col>
        </Row>
      </Content>
      <Footer className="app__footer">The Bug Bazaar</Footer>
    </Layout>
  )
}

export default App
