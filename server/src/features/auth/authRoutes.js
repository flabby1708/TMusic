import { Router } from 'express'
import {
  completeSocialAuth,
  getMe,
  getSocialAuthStartUrl,
  login,
  register,
  requestPhoneOtp,
  verifyPhoneOtp,
} from './authController.js'
import { requireListener } from '../../middleware/authMiddleware.js'

const authRouter = Router()

authRouter.post('/register', register)
authRouter.post('/login', login)
authRouter.get('/me', requireListener, getMe)

authRouter.post('/phone/request-code', requestPhoneOtp)
authRouter.post('/phone/verify-code', verifyPhoneOtp)

authRouter.get('/oauth/:provider/url', getSocialAuthStartUrl)
authRouter.get('/oauth/:provider/callback', completeSocialAuth)
authRouter.post('/oauth/:provider/callback', completeSocialAuth)

export default authRouter
