import { useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ConfigProvider, Typography } from 'antd'
import { describe, expect, it, vi } from 'vitest'
import { AppErrorBoundary } from './AppErrorBoundary'

function Boom({ fail }: { fail: boolean }) {
  if (fail) {
    throw new Error('boom')
  }
  return <Typography.Text>Recovered</Typography.Text>
}

function Harness() {
  const [fail, setFail] = useState(true)

  return (
    <ConfigProvider>
      <AppErrorBoundary>
        <Boom fail={fail} />
      </AppErrorBoundary>
      <button type="button" onClick={() => setFail(false)}>
        Heal child
      </button>
    </ConfigProvider>
  )
}

describe('AppErrorBoundary', () => {
  it('shows a fallback when a child throws and recovers after reset', async () => {
    const user = userEvent.setup()
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined)

    render(<Harness />)

    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(spy).toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: 'Heal child' }))
    await user.click(screen.getByRole('button', { name: 'Try again' }))

    expect(screen.getByText('Recovered')).toBeInTheDocument()
    spy.mockRestore()
  })
})
