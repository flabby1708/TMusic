import { getDatabaseStatus } from '../config/db.js'
import {
  getAuthenticatedUserById,
  loginUser,
  registerUser,
} from '../services/authService.js'

const ensureDatabaseReady = (res) => {
  if (getDatabaseStatus() === 'connected') {
    return true
  }

  res.status(503).json({
    message: 'MongoDB chưa sẵn sàng. Vui lòng thử lại sau.',
  })

  return false
}

const resolveStatusCode = (errorType) => {
  if (errorType === 'validation') {
    return 400
  }

  if (errorType === 'credentials') {
    return 401
  }

  if (errorType === 'conflict') {
    return 409
  }

  return 400
}

export const register = async (req, res, next) => {
  try {
    if (!ensureDatabaseReady(res)) {
      return
    }

    const result = await registerUser(req.body)

    if (result.errorType) {
      return res.status(resolveStatusCode(result.errorType)).json({
        message: result.message,
      })
    }

    return res.status(201).json(result)
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({
        message: 'Email này đã được sử dụng.',
      })
    }

    return next(error)
  }
}

export const login = async (req, res, next) => {
  try {
    if (!ensureDatabaseReady(res)) {
      return
    }

    const result = await loginUser(req.body)

    if (result.errorType) {
      return res.status(resolveStatusCode(result.errorType)).json({
        message: result.message,
      })
    }

    return res.json(result)
  } catch (error) {
    return next(error)
  }
}

export const getMe = async (req, res, next) => {
  try {
    if (!ensureDatabaseReady(res)) {
      return
    }

    const user = await getAuthenticatedUserById(req.auth?.sub)

    if (!user) {
      return res.status(404).json({
        message: 'Không tìm thấy người dùng.',
      })
    }

    return res.json({
      user,
    })
  } catch (error) {
    return next(error)
  }
}
