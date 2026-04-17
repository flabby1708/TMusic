import { Router } from 'express'
import adminRouter from './adminRoutes.js'
import authRouter from './authRoutes.js'
import { getHomeContent } from '../controllers/homeController.js'
import { getHealth } from '../controllers/systemController.js'
import songRouter from './songRoutes.js'

const router = Router()

router.get('/health', getHealth)
router.get('/home', getHomeContent)
router.use('/auth', authRouter)
router.use('/admin', adminRouter)
router.use('/songs', songRouter)

export default router
