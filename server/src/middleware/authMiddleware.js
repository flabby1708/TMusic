import User from '../models/User.js'
import { verifyUserToken } from '../utils/authToken.js'

const getBearerToken = (authorizationHeader = '') => {
  if (!authorizationHeader.startsWith('Bearer ')) {
    return ''
  }

  return authorizationHeader.slice(7).trim()
}

const getRequestAuth = (req) => {
  const token = getBearerToken(req.headers.authorization)

  if (!token) {
    return null
  }

  return verifyUserToken(token)
}

const sendUnauthorized = (res) =>
  res.status(401).json({
    message: 'Ban can dang nhap de tiep tuc.',
  })

const sendInvalidSession = (res) =>
  res.status(401).json({
    message: 'Phien dang nhap khong hop le hoac da het han.',
  })

const findCurrentUser = async (auth) =>
  User.findById(auth.sub).select('displayName role artistStatus artistProfile')

export const requireAuth = (req, res, next) => {
  try {
    const auth = getRequestAuth(req)

    if (!auth) {
      return sendUnauthorized(res)
    }

    req.auth = auth
    return next()
  } catch {
    return sendInvalidSession(res)
  }
}

const createRoleGuard = (role, message) => async (req, res, next) => {
  try {
    const auth = getRequestAuth(req)

    if (!auth) {
      return sendUnauthorized(res)
    }

    const currentUser = await findCurrentUser(auth)

    if (!currentUser) {
      return res.status(404).json({
        message: 'Khong tim thay tai khoan dang nhap.',
      })
    }

    if (currentUser.role !== role) {
      return res.status(403).json({
        message,
      })
    }

    req.auth = auth
    req.currentUser = currentUser
    return next()
  } catch {
    return sendInvalidSession(res)
  }
}

export const requireListener = createRoleGuard(
  'user',
  'Ban khong co quyen truy cap cong nguoi nghe.',
)

export const requireArtist = createRoleGuard(
  'artist',
  'Ban khong co quyen truy cap cong nghe si.',
)

export const requireAdmin = createRoleGuard(
  'admin',
  'Ban khong co quyen truy cap khu vuc quan tri.',
)

export const requireApprovedArtist = async (req, res, next) => {
  try {
    const auth = getRequestAuth(req)

    if (!auth) {
      return sendUnauthorized(res)
    }

    if (auth.role !== 'artist') {
      return res.status(403).json({
        message: 'Ban khong co quyen truy cap cong nghe si.',
      })
    }

    const artistUser = await findCurrentUser(auth)

    if (!artistUser || artistUser.role !== 'artist') {
      return res.status(404).json({
        message: 'Khong tim thay tai khoan nghe si.',
      })
    }

    if (artistUser.artistStatus !== 'approved') {
      return res.status(403).json({
        message: 'Tai khoan nghe si chua duoc duyet upload.',
      })
    }

    req.auth = auth
    req.artistUser = artistUser
    return next()
  } catch {
    return sendInvalidSession(res)
  }
}
