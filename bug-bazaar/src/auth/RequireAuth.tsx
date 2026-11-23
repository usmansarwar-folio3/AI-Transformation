import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { getAuthToken } from '../api'
import { selectIsLoggedIn, useAppSelector } from '../store'

type RequireAuthProps = {
  children: ReactNode
}

/**
 * Redirects unauthenticated users to login, preserving the attempted location for return-to.
 */
export function RequireAuth({ children }: RequireAuthProps) {
  const location = useLocation()
  const isLoggedIn = useAppSelector(selectIsLoggedIn)
  const hasToken = Boolean(getAuthToken())

  if (!isLoggedIn || !hasToken) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return children
}
