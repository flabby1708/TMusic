import { useEffect, useState } from 'react'
import {
  clearAdminSession,
  fetchAuthenticatedAdmin,
  getStoredAdminToken,
  getStoredAdminUser,
  updateStoredAdminUser,
} from './adminAuthClient.js'

const isExpiredAdminSessionError = (error) =>
  error?.status === 401 || error?.status === 403 || error?.status === 404

export function useAdminSession() {
  const [user, setUser] = useState(() => (getStoredAdminToken() ? getStoredAdminUser() : null))
  const [loading, setLoading] = useState(() => Boolean(getStoredAdminToken()))

  useEffect(() => {
    let cancelled = false
    const token = getStoredAdminToken()

    if (!token) {
      setLoading(false)
      setUser(null)
      return undefined
    }

    const refreshSession = async () => {
      try {
        const payload = await fetchAuthenticatedAdmin()

        if (cancelled) {
          return
        }

        if (payload?.user) {
          updateStoredAdminUser(payload.user)
          setUser(payload.user)
        } else {
          clearAdminSession()
          setUser(null)
        }
      } catch (error) {
        if (cancelled) {
          return
        }

        if (isExpiredAdminSessionError(error)) {
          clearAdminSession()
          setUser(null)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void refreshSession()

    return () => {
      cancelled = true
    }
  }, [])

  const logout = () => {
    clearAdminSession()
    setUser(null)
  }

  return {
    user,
    loading,
    isAuthenticated: Boolean(user),
    logout,
  }
}
