import { requestAdminJson } from './adminAuthClient.js'

const jsonRequestOptions = (method, payload = {}) => ({
  method,
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(payload),
})

export const fetchArtistApplications = ({ query = '', status = '' } = {}) => {
  const searchParams = new URLSearchParams()

  if (query) {
    searchParams.set('q', query)
  }

  if (status) {
    searchParams.set('status', status)
  }

  const suffix = searchParams.toString() ? `?${searchParams.toString()}` : ''

  return requestAdminJson(`/api/admin/artist-applications${suffix}`)
}

export const fetchArtistApplicationDetail = (applicationId) =>
  requestAdminJson(`/api/admin/artist-applications/${applicationId}`)

export const approveArtistApplication = (applicationId, payload) =>
  requestAdminJson(
    `/api/admin/artist-applications/${applicationId}/approve`,
    jsonRequestOptions('PATCH', payload),
  )

export const rejectArtistApplication = (applicationId, payload) =>
  requestAdminJson(
    `/api/admin/artist-applications/${applicationId}/reject`,
    jsonRequestOptions('PATCH', payload),
  )

export const suspendArtistApplication = (applicationId, payload) =>
  requestAdminJson(
    `/api/admin/artist-applications/${applicationId}/suspend`,
    jsonRequestOptions('PATCH', payload),
  )
