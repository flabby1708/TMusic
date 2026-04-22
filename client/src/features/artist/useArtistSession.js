import { useEffect, useState } from 'react'
import {
  clearArtistSession,
  fetchAuthenticatedArtist,
  getStoredArtistToken,
  getStoredArtistUser,
  updateStoredArtistUser,
} from './artistAuthClient.js'

const isExpiredArtistSessionError = (error) =>
  error?.status === 401 || error?.status === 403 || error?.status === 404

export function useArtistSession() {
  const [user, setUser] = useState(() =>
    getStoredArtistToken() ? getStoredArtistUser() : null,
  )
  const [loading, setLoading] = useState(() => Boolean(getStoredArtistToken()))

  useEffect(() => {
    let cancelled = false
    const token = getStoredArtistToken()

    if (!token) {
      setLoading(false)
      setUser(null)
      return undefined
    }

    const refreshSession = async () => {
      try {
        const payload = await fetchAuthenticatedArtist()

        if (cancelled) {
          return
        }

        if (payload?.user) {
          updateStoredArtistUser(payload.user)
          setUser(payload.user)
        } else {
          clearArtistSession()
          setUser(null)
        }
      } catch (error) {
        if (cancelled) {
          return
        }

        if (isExpiredArtistSessionError(error)) {
          clearArtistSession()
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
    clearArtistSession()
    setUser(null)
  }

  return {
    user,
    loading,
    isAuthenticated: Boolean(user),
    logout,
  }
}
