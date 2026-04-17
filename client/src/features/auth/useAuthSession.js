import { useEffect, useState } from 'react'
import {
  clearAuthSession,
  fetchAuthenticatedUser,
  getStoredAuthToken,
  getStoredAuthUser,
  updateStoredAuthUser,
} from './authClient.js'

export function useAuthSession() {
  const [user, setUser] = useState(() => getStoredAuthUser())
  const [loading, setLoading] = useState(() => Boolean(getStoredAuthToken()))

  useEffect(() => {
    let cancelled = false
    const token = getStoredAuthToken()

    if (!token) {
      setLoading(false)
      setUser(null)
      return undefined
    }

    const refreshSession = async () => {
      try {
        const payload = await fetchAuthenticatedUser()

        if (cancelled) {
          return
        }

        if (payload?.user) {
          updateStoredAuthUser(payload.user)
          setUser(payload.user)
        } else {
          clearAuthSession()
          setUser(null)
        }
      } catch (error) {
        if (cancelled) {
          return
        }

        const message = error?.message || ''
        const shouldClearSession =
          message.includes('hết hạn') ||
          message.includes('không hợp lệ') ||
          message.includes('Không tìm thấy người dùng') ||
          message.includes('Bạn cần đăng nhập')

        if (shouldClearSession) {
          clearAuthSession()
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
    clearAuthSession()
    setUser(null)
  }

  return {
    user,
    loading,
    isAuthenticated: Boolean(user),
    logout,
  }
}
