import { Router } from 'express'
import { getMe, login, register } from '../controllers/authController.js'
import { requireAuth } from '../middleware/authMiddleware.js'

const authRouter = Router()

authRouter.post('/register', register)
authRouter.post('/login', login)
authRouter.get('/me', requireAuth, getMe)

export default authRouter
