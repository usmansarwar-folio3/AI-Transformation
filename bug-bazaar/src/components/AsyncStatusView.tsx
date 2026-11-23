import type { ReactNode } from 'react'
import { Alert, Button, Col, Empty, Flex, Space, Spin, Typography } from 'antd'
import { isError, isSuccess, mapApiErrorToUi, type RequestStatus } from '../api'
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
 * Shared loading / empty / error / success chrome.
 * Error copy comes from mapApiErrorToUi (never raw API messages).
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
        <Flex
          className="async-status-view__spin"
          justify="center"
          align="center"
          vertical
        >
          <Spin description={loadingDescription} size="large" />
        </Flex>
      </Col>
    )
  }

  if (isError(status)) {
    const errorUi = mapApiErrorToUi(status.error)
    return (
      <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
        <Alert
          className="async-status-view__error"
          type="error"
          showIcon
          message={errorUi.title}
          description={errorUi.description}
          action={
            errorUi.showRetry ? (
              <Button className="async-status-view__retry" type="primary" onClick={onRetry}>
                Retry
              </Button>
            ) : undefined
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
