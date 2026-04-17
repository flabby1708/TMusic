import { requestJson } from '../../shared/api.js'

export const AUTH_TOKEN_STORAGE_KEY = 'tmusic.auth.token'
export const AUTH_USER_STORAGE_KEY = 'tmusic.auth.user'

const buildJsonRequestOptions = (payload) => ({
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(payload),
})

export const loginWithEmail = (payload) =>
  requestJson('/api/auth/login', buildJsonRequestOptions(payload))

export const registerWithEmail = (payload) =>
  requestJson('/api/auth/register', buildJsonRequestOptions(payload))

export const storeAuthSession = ({ token, user }) => {
  window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token)
  window.localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(user))
}

export const updateStoredAuthUser = (user) => {
  window.localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(user))
}

export const clearAuthSession = () => {
  window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY)
  window.localStorage.removeItem(AUTH_USER_STORAGE_KEY)
}

export const getStoredAuthToken = () => window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY) || ''

export const getStoredAuthUser = () => {
  const rawValue = window.localStorage.getItem(AUTH_USER_STORAGE_KEY)

  if (!rawValue) {
    return null
  }

  try {
    return JSON.parse(rawValue)
  } catch {
    clearAuthSession()
    return null
  }
}

export const fetchAuthenticatedUser = () => {
  const token = getStoredAuthToken()

  if (!token) {
    return Promise.resolve(null)
  }

  return requestJson('/api/auth/me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}
