import { requestJson } from '../../shared/api.js'

export const ADMIN_AUTH_TOKEN_STORAGE_KEY = 'tmusic.admin.auth.token'
export const ADMIN_AUTH_USER_STORAGE_KEY = 'tmusic.admin.auth.user'

const buildJsonRequestOptions = (payload) => ({
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(payload),
})

export const loginAdminWithEmail = (payload) =>
  requestJson('/api/admin-auth/login', buildJsonRequestOptions(payload))

export const storeAdminSession = ({ token, user }) => {
  window.localStorage.setItem(ADMIN_AUTH_TOKEN_STORAGE_KEY, token)
  window.localStorage.setItem(ADMIN_AUTH_USER_STORAGE_KEY, JSON.stringify(user))
}

export const updateStoredAdminUser = (user) => {
  window.localStorage.setItem(ADMIN_AUTH_USER_STORAGE_KEY, JSON.stringify(user))
}

export const clearAdminSession = () => {
  window.localStorage.removeItem(ADMIN_AUTH_TOKEN_STORAGE_KEY)
  window.localStorage.removeItem(ADMIN_AUTH_USER_STORAGE_KEY)
}

export const getStoredAdminToken = () =>
  window.localStorage.getItem(ADMIN_AUTH_TOKEN_STORAGE_KEY) || ''

export const getStoredAdminUser = () => {
  const rawValue = window.localStorage.getItem(ADMIN_AUTH_USER_STORAGE_KEY)

  if (!rawValue) {
    return null
  }

  try {
    return JSON.parse(rawValue)
  } catch {
    clearAdminSession()
    return null
  }
}

export const requestAdminJson = (url, options = {}) => {
  const token = getStoredAdminToken()
  const headers = {
    ...(options.headers || {}),
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  return requestJson(url, {
    ...options,
    headers,
  })
}

export const fetchAuthenticatedAdmin = () => {
  const token = getStoredAdminToken()

  if (!token) {
    return Promise.resolve(null)
  }

  return requestAdminJson('/api/admin-auth/me')
}
