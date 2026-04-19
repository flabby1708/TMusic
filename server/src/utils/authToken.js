import jwt from 'jsonwebtoken'

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET?.trim()

  if (!secret) {
    throw new Error('JWT_SECRET is not configured.')
  }

  return secret
}

const getJwtExpiresIn = () => process.env.JWT_EXPIRES_IN?.trim() || '7d'

export const signUserToken = (user) =>
  jwt.sign(
    {
      sub: user._id.toString(),
      role: user.role,
      email: user.email,
    },
    getJwtSecret(),
    {
      expiresIn: getJwtExpiresIn(),
    },
  )

export const verifyUserToken = (token) => jwt.verify(token, getJwtSecret())

export const signOAuthState = (provider) =>
  jwt.sign(
    {
      type: 'oauth-state',
      provider,
    },
    getJwtSecret(),
    {
      expiresIn: '10m',
    },
  )

export const verifyOAuthState = (token) => {
  const payload = jwt.verify(token, getJwtSecret())

  if (payload.type !== 'oauth-state' || !payload.provider) {
    throw new Error('Invalid OAuth state.')
  }

  return payload
}
