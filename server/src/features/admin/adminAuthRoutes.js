import { Router } from 'express'
import { getMe, loginAdmin } from '../auth/authController.js'
import { requireAdmin } from '../../middleware/authMiddleware.js'

const adminAuthRouter = Router()

adminAuthRouter.post('/login', loginAdmin)
adminAuthRouter.get('/me', requireAdmin, getMe)

export default adminAuthRouter
