import { Router } from 'express'
import adminAuthRouter from './adminAuthRoutes.js'
import adminRouter from './adminRoutes.js'
import artistAuthRouter from './artistAuthRoutes.js'
import artistRouter from './artistRoutes.js'
import authRouter from './authRoutes.js'
import { getHomeContent } from '../controllers/homeController.js'
import releaseRouter from './releaseRoutes.js'
import { getHealth } from '../controllers/systemController.js'
import songRouter from './songRoutes.js'
import trackRouter from './trackRoutes.js'

const router = Router()

router.get('/health', getHealth)
router.get('/home', getHomeContent)
router.use('/auth', authRouter)
router.use('/admin-auth', adminAuthRouter)
router.use('/artist-auth', artistAuthRouter)
router.use('/artists', artistRouter)
router.use('/releases', releaseRouter)
router.use('/tracks', trackRouter)
router.use('/admin', adminRouter)
router.use('/songs', songRouter)

export default router
