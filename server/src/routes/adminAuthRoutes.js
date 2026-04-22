import { Router } from 'express'
import { getMe, loginAdmin } from '../controllers/authController.js'
import { requireAdmin } from '../middleware/authMiddleware.js'

const adminAuthRouter = Router()

adminAuthRouter.post('/login', loginAdmin)
adminAuthRouter.get('/me', requireAdmin, getMe)

export default adminAuthRouter
