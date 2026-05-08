import { Router } from 'express'
import {
  completeSocialAuth,
  getMe,
  getSocialAuthStartUrl,
  login,
  loginAdmin,
  loginArtist,
  register,
  registerArtist,
} from './authController.js'
import { requireListener } from '../../middleware/authMiddleware.js'

const authRouter = Router()

authRouter.post('/register', register)
authRouter.post('/login', login)

authRouter.post('/artist/register', registerArtist)
authRouter.post('/artist/login', loginArtist)

authRouter.post('/admin/login', loginAdmin)

authRouter.get('/me', requireListener, getMe)

authRouter.get('/oauth/:provider/url', getSocialAuthStartUrl)
authRouter.get('/oauth/:provider/callback', completeSocialAuth)
authRouter.post('/oauth/:provider/callback', completeSocialAuth)

export default authRouter