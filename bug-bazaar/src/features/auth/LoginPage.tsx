import { useState } from 'react'
import { Alert, Button, Col, Form, Input, Row, Typography } from 'antd'
import { Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { ApiClientError, getAuthToken, login } from '../../api'
import { resolveReturnTo } from '../../auth/returnTo'
import { selectIsLoggedIn, setUser, useAppDispatch, useAppSelector } from '../../store'
import './login-page.scss'

const { Title, Paragraph, Text } = Typography

type LoginFormValues = {
  email: string
  password: string
}

export function LoginPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const isLoggedIn = useAppSelector(selectIsLoggedIn)
  const hasToken = Boolean(getAuthToken())

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const returnTo = resolveReturnTo(location.state, searchParams, '/')

  if (isLoggedIn && hasToken) {
    return <Navigate to={returnTo} replace />
  }

  async function handleFinish(values: LoginFormValues) {
    if (isSubmitting) {
      return
    }

    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      const result = await login({
        email: values.email.trim(),
        password: values.password,
      })
      dispatch(setUser(result.user))
      void navigate(returnTo, { replace: true })
    } catch (error: unknown) {
      if (error instanceof ApiClientError) {
        setErrorMessage(error.message)
      } else {
        setErrorMessage('Could not sign in. Try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Row className="login-page" gutter={[16, 16]} justify="center">
      <Col xs={24} sm={20} md={14} lg={10} xl={8} xxl={6}>
        <Title level={2} className="login-page__title">
          Sign in
        </Title>
        <Paragraph className="login-page__hint">
          Demo password: <Text code>password</Text> (any non-empty email). The session token stays in
          memory only.
        </Paragraph>

        <Form
          className="login-page__form"
          layout="vertical"
          requiredMark={false}
          disabled={isSubmitting}
          initialValues={{ email: 'shopper@bugbazaar.dev', password: '' }}
          onFinish={(values: LoginFormValues) => {
            void handleFinish(values)
          }}
        >
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, message: 'Email is required' }]}
          >
            <Input type="email" autoComplete="username" aria-label="Email" />
          </Form.Item>
          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: 'Password is required' }]}
          >
            <Input.Password autoComplete="current-password" aria-label="Password" />
          </Form.Item>

          {errorMessage ? (
            <Alert
              className="login-page__error"
              type="error"
              showIcon
              message={errorMessage}
            />
          ) : null}

          <Button
            type="primary"
            htmlType="submit"
            className="login-page__submit"
            loading={isSubmitting}
            disabled={isSubmitting}
            block
          >
            Sign in
          </Button>
        </Form>
      </Col>
    </Row>
  )
}
