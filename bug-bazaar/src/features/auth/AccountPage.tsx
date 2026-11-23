import { Button, Col, Row, Typography } from 'antd'
import { useNavigate } from 'react-router-dom'
import { logout as clearAuthToken } from '../../api'
import { AsyncStatusView } from '../../components/AsyncStatusView'
import { requestStatusFromQuery, useMeQuery } from '../../query'
import { clearSession, selectSessionUser, useAppDispatch, useAppSelector } from '../../store'
import './account-page.scss'

const { Title, Text, Paragraph } = Typography

export function AccountPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const sessionUser = useAppSelector(selectSessionUser)
  const meQuery = useMeQuery()
  const status = requestStatusFromQuery(meQuery)

  function handleLogout() {
    clearAuthToken()
    dispatch(clearSession())
    void navigate('/', { replace: true })
  }

  return (
    <Row className="account-page" gutter={[16, 16]}>
      <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
        <Title level={2} className="account-page__title">
          Account
        </Title>
      </Col>

      <AsyncStatusView
        status={status}
        loadingDescription="Loading account"
        emptyTitle="Account unavailable"
        emptyDescription="No account details to show."
        isEmpty={() => false}
        onRetry={() => {
          void meQuery.refetch()
        }}
      >
        {(user) => (
          <Col xs={24} sm={24} md={16} lg={12} xl={10} xxl={8}>
            <Paragraph>
              <Text className="account-page__label" type="secondary">
                Name:{' '}
              </Text>
              <Text className="account-page__value">{user.name}</Text>
            </Paragraph>
            <Paragraph>
              <Text className="account-page__label" type="secondary">
                Email:{' '}
              </Text>
              <Text className="account-page__value">{user.email}</Text>
            </Paragraph>
            {sessionUser ? (
              <Paragraph type="secondary" className="account-page__hint">
                Session is in memory for this tab only. Refreshing signs you out.
              </Paragraph>
            ) : null}
            <Button danger className="account-page__logout" onClick={handleLogout}>
              Log out
            </Button>
          </Col>
        )}
      </AsyncStatusView>
    </Row>
  )
}
