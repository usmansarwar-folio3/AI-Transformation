import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Col, Typography } from 'antd'
import { describe, expect, it, vi } from 'vitest'
import { failure, loading, success } from '../api'
import { AsyncStatusView } from './AsyncStatusView'

function renderStatus(
  status: Parameters<typeof AsyncStatusView<string[]>>[0]['status'],
  onRetry: () => void,
) {
  return (
    <AsyncStatusView
      status={status}
      loadingDescription="Loading products"
      emptyTitle="No products found"
      emptyDescription="Nothing here"
      isEmpty={(items) => items.length === 0}
      onRetry={onRetry}
    >
      {(items) => (
        <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
          <Typography.Text>{items.join(',')}</Typography.Text>
        </Col>
      )}
    </AsyncStatusView>
  )
}

describe('AsyncStatusView', () => {
  it('shows loading, empty, mapped error with retry, and success consistently', async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()

    const { rerender } = render(renderStatus(loading(), onRetry))
    expect(screen.getByText('Loading products')).toBeInTheDocument()

    rerender(renderStatus(success([]), onRetry))
    expect(screen.getByText('No products found')).toBeInTheDocument()
    expect(screen.getByText('Nothing here')).toBeInTheDocument()

    rerender(
      renderStatus(
        failure({
          httpStatus: 500,
          code: 'INTERNAL',
          message: 'Forced product list failure',
        }),
        onRetry,
      ),
    )
    expect(screen.getByText('Something went wrong on our side')).toBeInTheDocument()
    expect(screen.queryByText('Forced product list failure')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Retry' }))
    expect(onRetry).toHaveBeenCalledTimes(1)

    rerender(
      renderStatus(
        failure({
          httpStatus: 404,
          code: 'NOT_FOUND',
          message: 'Product not found',
        }),
        onRetry,
      ),
    )
    expect(screen.getByText('Not found')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Retry' })).not.toBeInTheDocument()

    rerender(renderStatus(success(['duck']), onRetry))
    expect(screen.getByText('duck')).toBeInTheDocument()
  })
})
