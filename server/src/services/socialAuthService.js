import jwt from 'jsonwebtoken'
import { findOrCreateSocialUser } from './authService.js'
import { signOAuthState, verifyOAuthState } from '../utils/authToken.js'

const supportedProviders = ['google', 'facebook', 'apple']

const getClientRedirectBase = () =>
  process.env.AUTH_CLIENT_CALLBACK_URL?.trim() ||
  `${process.env.CLIENT_URL || 'http://localhost:5173'}/auth/callback`

const encodeUser = (user) => Buffer.from(JSON.stringify(user), 'utf8').toString('base64url')

export const buildClientCallbackUrl = ({ error = '', token = '', user = null, provider = '' }) => {
  const url = new URL(getClientRedirectBase())

  if (error) {
    url.searchParams.set('error', error)
  }

  if (token) {
    url.searchParams.set('token', token)
  }

  if (provider) {
    url.searchParams.set('provider', provider)
  }

  if (user) {
    url.searchParams.set('user', encodeUser(user))
  }

  return url.toString()
}

const getGoogleConfig = () => ({
  clientId: process.env.GOOGLE_CLIENT_ID?.trim() || '',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET?.trim() || '',
  callbackUrl:
    process.env.GOOGLE_CALLBACK_URL?.trim() ||
    'http://localhost:5000/api/auth/oauth/google/callback',
})

const getFacebookConfig = () => ({
  clientId: process.env.FACEBOOK_CLIENT_ID?.trim() || '',
  clientSecret: process.env.FACEBOOK_CLIENT_SECRET?.trim() || '',
  callbackUrl:
    process.env.FACEBOOK_CALLBACK_URL?.trim() ||
    'http://localhost:5000/api/auth/oauth/facebook/callback',
})

const getAppleConfig = () => ({
  clientId: process.env.APPLE_CLIENT_ID?.trim() || '',
  teamId: process.env.APPLE_TEAM_ID?.trim() || '',
  keyId: process.env.APPLE_KEY_ID?.trim() || '',
  privateKey: (process.env.APPLE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
  callbackUrl:
    process.env.APPLE_CALLBACK_URL?.trim() ||
    'http://localhost:5000/api/auth/oauth/apple/callback',
})

const assertConfigured = (provider, values) => {
  const missingKeys = Object.entries(values)
    .filter(([, value]) => !value)
    .map(([key]) => key)

  if (missingKeys.length > 0) {
    throw new Error(
      `Nhà cung cấp ${provider} chưa được cấu hình. Thiếu: ${missingKeys.join(', ')}.`,
    )
  }
}

export const getSupportedSocialProviders = () => supportedProviders

export const getSocialAuthUrl = (provider) => {
  if (!supportedProviders.includes(provider)) {
    throw new Error('Nhà cung cấp đăng nhập không được hỗ trợ.')
  }

  const state = signOAuthState(provider)

  if (provider === 'google') {
    const config = getGoogleConfig()
    assertConfigured(provider, config)

    const url = new URL('https://accounts.google.com/o/oauth2/v2/auth')
    url.searchParams.set('client_id', config.clientId)
    url.searchParams.set('redirect_uri', config.callbackUrl)
    url.searchParams.set('response_type', 'code')
    url.searchParams.set('scope', 'openid email profile')
    url.searchParams.set('state', state)
    url.searchParams.set('access_type', 'offline')
    url.searchParams.set('prompt', 'consent')

    return url.toString()
  }

  if (provider === 'facebook') {
    const config = getFacebookConfig()
    assertConfigured(provider, config)

    const url = new URL('https://www.facebook.com/v20.0/dialog/oauth')
    url.searchParams.set('client_id', config.clientId)
    url.searchParams.set('redirect_uri', config.callbackUrl)
    url.searchParams.set('state', state)
    url.searchParams.set('scope', 'email,public_profile')

    return url.toString()
  }

  const config = getAppleConfig()
  assertConfigured(provider, config)

  const url = new URL('https://appleid.apple.com/auth/authorize')
  url.searchParams.set('client_id', config.clientId)
  url.searchParams.set('redirect_uri', config.callbackUrl)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('response_mode', 'form_post')
  url.searchParams.set('scope', 'name email')
  url.searchParams.set('state', state)

  return url.toString()
}

const fetchJson = async (url, options) => {
  const response = await fetch(url, options)
  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(payload?.error_description || payload?.message || 'Yêu cầu tới OAuth provider thất bại.')
  }

  return payload
}

const exchangeGoogleCode = async (code) => {
  const config = getGoogleConfig()
  assertConfigured('google', config)

  const tokenPayload = await fetchJson('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      code,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: config.callbackUrl,
      grant_type: 'authorization_code',
    }),
  })

  const profile = await fetchJson('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: {
      Authorization: `Bearer ${tokenPayload.access_token}`,
    },
  })

  return {
    provider: 'google',
    providerUserId: profile.sub,
    email: profile.email,
    displayName: profile.name,
    avatarUrl: profile.picture,
  }
}

const exchangeFacebookCode = async (code) => {
  const config = getFacebookConfig()
  assertConfigured('facebook', config)

  const tokenUrl = new URL('https://graph.facebook.com/v20.0/oauth/access_token')
  tokenUrl.searchParams.set('client_id', config.clientId)
  tokenUrl.searchParams.set('client_secret', config.clientSecret)
  tokenUrl.searchParams.set('redirect_uri', config.callbackUrl)
  tokenUrl.searchParams.set('code', code)

  const tokenPayload = await fetchJson(tokenUrl, {})
  const profileUrl = new URL('https://graph.facebook.com/me')
  profileUrl.searchParams.set('fields', 'id,name,email,picture.type(large)')
  profileUrl.searchParams.set('access_token', tokenPayload.access_token)

  const profile = await fetchJson(profileUrl, {})

  return {
    provider: 'facebook',
    providerUserId: profile.id,
    email: profile.email,
    displayName: profile.name,
    avatarUrl: profile.picture?.data?.url || '',
  }
}

const createAppleClientSecret = () => {
  const config = getAppleConfig()
  assertConfigured('apple', config)

  return jwt.sign(
    {},
    config.privateKey,
    {
      algorithm: 'ES256',
      expiresIn: '180d',
      issuer: config.teamId,
      audience: 'https://appleid.apple.com',
      subject: config.clientId,
      keyid: config.keyId,
    },
  )
}

const exchangeAppleCode = async (code, callbackUser) => {
  const config = getAppleConfig()
  assertConfigured('apple', config)

  const tokenPayload = await fetchJson('https://appleid.apple.com/auth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: config.clientId,
      client_secret: createAppleClientSecret(),
      redirect_uri: config.callbackUrl,
    }),
  })

  const decodedToken = jwt.decode(tokenPayload.id_token)

  if (!decodedToken || decodedToken.aud !== config.clientId) {
    throw new Error('Không thể xác minh phản hồi từ Apple.')
  }

  const resolvedName = callbackUser?.name
    ? [callbackUser.name.firstName, callbackUser.name.lastName].filter(Boolean).join(' ')
    : callbackUser?.fullName || ''

  return {
    provider: 'apple',
    providerUserId: decodedToken.sub,
    email: callbackUser?.email || decodedToken.email || '',
    displayName: resolvedName || decodedToken.email || '',
    avatarUrl: '',
  }
}

const parseAppleUser = (rawUser) => {
  if (!rawUser) {
    return null
  }

  if (typeof rawUser === 'object') {
    return rawUser
  }

  try {
    return JSON.parse(rawUser)
  } catch {
    return null
  }
}

export const handleSocialCallback = async ({ provider, code, state, rawAppleUser }) => {
  const statePayload = verifyOAuthState(state)

  if (statePayload.provider !== provider) {
    throw new Error('OAuth state không hợp lệ.')
  }

  if (!code) {
    throw new Error('Thiếu mã xác thực từ nhà cung cấp đăng nhập.')
  }

  let socialProfile = null

  if (provider === 'google') {
    socialProfile = await exchangeGoogleCode(code)
  } else if (provider === 'facebook') {
    socialProfile = await exchangeFacebookCode(code)
  } else if (provider === 'apple') {
    socialProfile = await exchangeAppleCode(code, parseAppleUser(rawAppleUser))
  } else {
    throw new Error('Nhà cung cấp đăng nhập không được hỗ trợ.')
  }

  return findOrCreateSocialUser(socialProfile)
}
