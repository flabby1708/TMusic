import { verifyUserToken } from '../utils/authToken.js'

const getBearerToken = (authorizationHeader = '') => {
  if (!authorizationHeader.startsWith('Bearer ')) {
    return ''
  }

  return authorizationHeader.slice(7).trim()
}

export const requireAuth = (req, res, next) => {
  try {
    const token = getBearerToken(req.headers.authorization)

    if (!token) {
      return res.status(401).json({
        message: 'Bạn cần đăng nhập để tiếp tục.',
      })
    }

    req.auth = verifyUserToken(token)
    return next()
  } catch {
    return res.status(401).json({
      message: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn.',
    })
  }
}
