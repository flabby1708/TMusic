import { requestAdminJson } from './adminAuthClient.js'

const jsonRequestOptions = (method, payload) => ({
  method,
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(payload),
})

export const fetchAdminUsers = (query = '') => {
  const searchParams = new URLSearchParams()

  if (query) {
    searchParams.set('q', query)
  }

  const suffix = searchParams.toString() ? `?${searchParams.toString()}` : ''

  return requestAdminJson(`/api/admin/users${suffix}`)
}

export const fetchAdminUserDetail = (userId) =>
  requestAdminJson(`/api/admin/users/${userId}`)

export const updateAdminUserStatus = (userId, payload) =>
  requestAdminJson(
    `/api/admin/users/${userId}/status`,
    jsonRequestOptions('PATCH', payload),
  )

export const updateAdminUserRole = (userId, payload) =>
  requestAdminJson(
    `/api/admin/users/${userId}/role`,
    jsonRequestOptions('PATCH', payload),
  )

export const updateAdminUserSubscription = (userId, payload) =>
  requestAdminJson(
    `/api/admin/users/${userId}/subscription`,
    jsonRequestOptions('PATCH', payload),
  )