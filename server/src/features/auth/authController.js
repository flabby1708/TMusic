import { getDatabaseStatus } from '../../config/db.js'
import {
  getAuthenticatedUserById,
  loginAdminUser,
  loginArtistUser,
  loginUser,
  registerArtistUser,
  registerUser,
} from '../../services/authService.js'
import { requestPhoneCode, verifyPhoneCode } from '../../services/phoneAuthService.js'
import {
  buildClientCallbackUrl,
  getSocialAuthUrl,
  getSupportedSocialProviders,
  handleSocialCallback,
} from '../../services/socialAuthService.js'

const ensureDatabaseReady = (res) => {
  if (getDatabaseStatus() === 'connected') {
    return true
  }

  res.status(503).json({
    message: 'MongoDB is not ready yet. Please try again later.',
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

  if (errorType === 'forbidden') {
    return 403
  }

  if (errorType === 'conflict') {
    return 409
  }

  return 400
}

const resolveDuplicateKeyMessage = (error) => {
  if (error?.keyPattern?.email) {
    return 'Email nay da duoc su dung.'
  }

  if (error?.keyPattern?.phoneNumber) {
    return 'So dien thoai nay da duoc su dung.'
  }

  return 'Thong tin nay da duoc su dung.'
}

const sendAuthResult = (res, result, successStatus = 200) => {
  if (result.errorType) {
    return res.status(resolveStatusCode(result.errorType)).json({
      message: result.message,
    })
  }

  return res.status(successStatus).json(result)
}

export const register = async (req, res, next) => {
  try {
    if (!ensureDatabaseReady(res)) {
      return
    }

    const result = await registerUser(req.body)
    return sendAuthResult(res, result, 201)
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({
        message: resolveDuplicateKeyMessage(error),
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
    return sendAuthResult(res, result)
  } catch (error) {
    return next(error)
  }
}

export const registerArtist = async (req, res, next) => {
  try {
    if (!ensureDatabaseReady(res)) {
      return
    }

    const result = await registerArtistUser(req.body)
    return sendAuthResult(res, result, 201)
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({
        message: resolveDuplicateKeyMessage(error),
      })
    }

    return next(error)
  }
}

export const loginArtist = async (req, res, next) => {
  try {
    if (!ensureDatabaseReady(res)) {
      return
    }

    const result = await loginArtistUser(req.body)
    return sendAuthResult(res, result)
  } catch (error) {
    return next(error)
  }
}

export const loginAdmin = async (req, res, next) => {
  try {
    if (!ensureDatabaseReady(res)) {
      return
    }

    const result = await loginAdminUser(req.body)
    return sendAuthResult(res, result)
  } catch (error) {
    return next(error)
  }
}

export const requestPhoneOtp = async (req, res, next) => {
  try {
    if (!ensureDatabaseReady(res)) {
      return
    }

    const result = await requestPhoneCode(req.body)
    return sendAuthResult(res, result)
  } catch (error) {
    return next(error)
  }
}

export const verifyPhoneOtp = async (req, res, next) => {
  try {
    if (!ensureDatabaseReady(res)) {
      return
    }

    const result = await verifyPhoneCode(req.body)
    return sendAuthResult(res, result)
  } catch (error) {
    return next(error)
  }
}

export const getSocialAuthStartUrl = async (req, res, next) => {
  try {
    const { provider } = req.params

    if (!getSupportedSocialProviders().includes(provider)) {
      return res.status(404).json({
        message: 'Unsupported social auth provider.',
      })
    }

    return res.json({
      url: getSocialAuthUrl(provider),
    })
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    })
  }
}

export const completeSocialAuth = async (req, res) => {
  const { provider } = req.params
  const code = req.body?.code || req.query?.code
  const state = req.body?.state || req.query?.state
  const rawAppleUser = req.body?.user || req.query?.user

  try {
    if (!ensureDatabaseReady(res)) {
      return
    }

    if (!getSupportedSocialProviders().includes(provider)) {
      return res.redirect(
        buildClientCallbackUrl({
          provider,
          error: 'Unsupported social auth provider.',
        }),
      )
    }

    const result = await handleSocialCallback({
      provider,
      code,
      state,
      rawAppleUser,
    })

    return res.redirect(
      buildClientCallbackUrl({
        provider,
        token: result.token,
        user: result.user,
      }),
    )
  } catch (error) {
    return res.redirect(
      buildClientCallbackUrl({
        provider,
        error: error.message || 'Khong the hoan tat dang nhap mang xa hoi.',
      }),
    )
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
        message: 'Khong tim thay nguoi dung.',
      })
    }

    return res.json({
      user,
    })
  } catch (error) {
    return next(error)
  }
}
