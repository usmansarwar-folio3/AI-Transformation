import type { ReactNode } from 'react'
import { Alert, Button, Col, Empty, Space, Spin, Typography } from 'antd'
import { isError, isSuccess, type RequestStatus } from '../api'
import './async-status-view.scss'

const { Text } = Typography

type AsyncStatusViewProps<TData> = {
  status: RequestStatus<TData>
  loadingDescription: string
  emptyTitle?: string
  emptyDescription: string
  isEmpty?: (data: TData) => boolean
  onRetry: () => void
  children: (data: TData) => ReactNode
}

/**
 * Shared loading / empty / error / success chrome for browse pages (D2-3).
 * Empty is only shown after a successful response.
 */
export function AsyncStatusView<TData>({
  status,
  loadingDescription,
  emptyTitle = 'No results',
  emptyDescription,
  isEmpty,
  onRetry,
  children,
}: AsyncStatusViewProps<TData>) {
  if (!isSuccess(status) && !isError(status)) {
    return (
      <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
        <Spin
          className="async-status-view__spin"
          description={loadingDescription}
          size="large"
        />
      </Col>
    )
  }

  if (isError(status)) {
    return (
      <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
        <Alert
          className="async-status-view__error"
          type="error"
          showIcon
          message="Something went wrong"
          description={status.error.message}
          action={
            <Button className="async-status-view__retry" type="primary" onClick={onRetry}>
              Retry
            </Button>
          }
        />
      </Col>
    )
  }

  if (isEmpty?.(status.data)) {
    return (
      <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
        <Empty
          className="async-status-view__empty"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <Space className="async-status-view__empty-copy" orientation="vertical" size={4}>
              <Text className="async-status-view__empty-title" strong>
                {emptyTitle}
              </Text>
              <Text className="async-status-view__empty-description" type="secondary">
                {emptyDescription}
              </Text>
            </Space>
          }
        />
      </Col>
    )
  }

  return <>{children(status.data)}</>
}
