import { Component, type ReactNode } from 'react'
import { Button, Col, Result, Row } from 'antd'
import { reportError } from '../monitoring/reportError'
import './app-error-boundary.scss'

type AppErrorBoundaryProps = {
  children: ReactNode
}

type AppErrorBoundaryState = {
  hasError: boolean
}

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = {
    hasError: false,
  }

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error): void {
    reportError(error, 'AppErrorBoundary')
  }

  handleReset = (): void => {
    this.setState({ hasError: false })
  }

  render() {
    if (this.state.hasError) {
      return (
        <Row className="app-error-boundary" gutter={[16, 16]} justify="center">
          <Col xs={24} sm={20} md={16} lg={12} xl={10} xxl={8}>
            <Result
              className="app-error-boundary__result"
              status="error"
              title="Something went wrong"
              subTitle="The page hit an unexpected error. You can try again without reloading the whole app."
              extra={
                <Button type="primary" onClick={this.handleReset}>
                  Try again
                </Button>
              }
            />
          </Col>
        </Row>
      )
    }

    return this.props.children
  }
}
