import { Alert, Button, Col, Row, Space, Table, Tag, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useNavigate } from 'react-router-dom'
import { useLiveStock } from '../stock'
import { mockEndpoints, type MockEndpoint } from './mockEndpoints'
import './mock-api-page.scss'

const { Title, Paragraph, Text } = Typography

const METHOD_COLOR: Record<MockEndpoint['method'], string> = {
  GET: 'blue',
  POST: 'green',
}

export function MockApiPage() {
  const navigate = useNavigate()
  const liveStatus = useLiveStock(['p-0001'])

  const columns: ColumnsType<MockEndpoint> = [
    {
      title: 'Method',
      dataIndex: 'method',
      key: 'method',
      render: (method: MockEndpoint['method']) => (
        <Tag color={METHOD_COLOR[method]}>{method}</Tag>
      ),
    },
    {
      title: 'Path',
      dataIndex: 'path',
      key: 'path',
      render: (path: string) => (
        <Text className="mock-api-page__path" copyable>
          {path}
        </Text>
      ),
    },
    {
      title: 'Success',
      key: 'success',
      render: (_, row) => (
        <Text>
          {row.successStatus} · {row.successSummary}
        </Text>
      ),
    },
    {
      title: 'Errors',
      key: 'errors',
      render: (_, row) => (
        <Space wrap>
          {row.errors.map((error) => (
            <Tag key={`${row.path}-${error.status}-${error.how}`} color="orange">
              {error.status}
            </Tag>
          ))}
        </Space>
      ),
    },
  ]

  return (
    <Row className="mock-api-page" gutter={[16, 16]}>
      <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
        <Title level={2} className="mock-api-page__title">
          Mock API
        </Title>
        <Alert
          className="mock-api-page__alert"
          type="info"
          showIcon
          title="MSW contract guide"
          description="These are the shared mock endpoints. Prices stay in cents until the display layer. The auth token stays in memory only — never localStorage."
        />
        <Paragraph className="mock-api-page__hint">
          Expand a row for how to trigger each listed error. Buttons open the real shop screen when
          one exists. This page does not call fetch.
        </Paragraph>
      </Col>

      <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
        <Alert
          className="mock-api-page__stock"
          type="success"
          showIcon
          title={
            <Space wrap>
              <Tag color="purple">WS</Tag>
              <Text code>/stock</Text>
              <Text>Live stock feed (not a REST endpoint)</Text>
              <Tag color={liveStatus === 'open' ? 'success' : 'default'}>{liveStatus}</Tag>
            </Space>
          }
          description="Dev WebSocket pushes stock ticks. The shop patches TanStack Query and the in-memory catalog, reconnects after a drop, and closes when the page unmounts."
        />
      </Col>

      <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
        <Table
          className="mock-api-page__table"
          rowKey={(row) => `${row.method}-${row.path}`}
          columns={columns}
          dataSource={mockEndpoints}
          pagination={false}
          expandable={{
            expandedRowRender: (row) => (
              <Space className="mock-api-page__details" orientation="vertical" size="middle">
                {row.errors.map((error) => (
                  <Space
                    key={`${row.path}-${error.status}-${error.how}`}
                    className="mock-api-page__error"
                    orientation="vertical"
                    size={4}
                  >
                    <Text strong>
                      {error.status}: {error.how}
                    </Text>
                    {error.tryPath ? (
                      <Button
                        type="link"
                        className="mock-api-page__try"
                        onClick={() => {
                          void navigate(error.tryPath!)
                        }}
                      >
                        {error.tryLabel ?? `Open ${error.tryPath}`}
                      </Button>
                    ) : null}
                  </Space>
                ))}
              </Space>
            ),
          }}
        />
      </Col>
    </Row>
  )
}
