import { requestJson } from '../../shared/api.js'

export const ARTIST_AUTH_TOKEN_STORAGE_KEY = 'tmusic.artist.auth.token'
export const ARTIST_AUTH_USER_STORAGE_KEY = 'tmusic.artist.auth.user'

const buildJsonRequestOptions = (payload) => ({
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(payload),
})

export const registerArtistWithEmail = (payload) =>
  requestJson('/api/artist-auth/register', buildJsonRequestOptions(payload))

export const loginArtistWithEmail = (payload) =>
  requestJson('/api/artist-auth/login', buildJsonRequestOptions(payload))

export const storeArtistSession = ({ token, user }) => {
  window.localStorage.setItem(ARTIST_AUTH_TOKEN_STORAGE_KEY, token)
  window.localStorage.setItem(ARTIST_AUTH_USER_STORAGE_KEY, JSON.stringify(user))
}

export const updateStoredArtistUser = (user) => {
  window.localStorage.setItem(ARTIST_AUTH_USER_STORAGE_KEY, JSON.stringify(user))
}

export const clearArtistSession = () => {
  window.localStorage.removeItem(ARTIST_AUTH_TOKEN_STORAGE_KEY)
  window.localStorage.removeItem(ARTIST_AUTH_USER_STORAGE_KEY)
}

export const getStoredArtistToken = () =>
  window.localStorage.getItem(ARTIST_AUTH_TOKEN_STORAGE_KEY) || ''

export const getStoredArtistUser = () => {
  const rawValue = window.localStorage.getItem(ARTIST_AUTH_USER_STORAGE_KEY)

  if (!rawValue) {
    return null
  }

  try {
    return JSON.parse(rawValue)
  } catch {
    clearArtistSession()
    return null
  }
}

export const requestArtistJson = (url, options = {}) => {
  const token = getStoredArtistToken()
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

export const fetchAuthenticatedArtist = () => {
  const token = getStoredArtistToken()

  if (!token) {
    return Promise.resolve(null)
  }

  return requestArtistJson('/api/artist-auth/me')
}

export const fetchArtistReleases = () => requestArtistJson('/api/releases')

export const requestArtistTrackUpload = () =>
  requestArtistJson('/api/tracks/upload', {
    method: 'POST',
  })
