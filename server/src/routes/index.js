import { Router } from 'express'
import adminAuthRouter from '../features/admin/adminAuthRoutes.js'
import adminRouter from '../features/admin/adminRoutes.js'
import artistAuthRouter from '../features/artist/artistAuthRoutes.js'
import artistRouter from '../features/artist/artistRoutes.js'
import authRouter from '../features/auth/authRoutes.js'
import {
  getHomeAlbumItems,
  getHomeChartItems,
  getHomeContent,
  getHomePopularArtistItems,
  getHomeRadioItems,
  getHomeSongItems,
} from '../features/home/homeController.js'
import releaseRouter from '../features/artist/releaseRoutes.js'
import podcastRouter from '../features/podcasts/podcastRoutes.js'
import { getHealth } from '../features/system/systemController.js'
import songRouter from '../features/songs/songRoutes.js'
import trackRouter from '../features/tracks/trackRoutes.js'

const router = Router()

router.get('/health', getHealth)
router.get('/home/songs', getHomeSongItems)
router.get('/home/popular-artists', getHomePopularArtistItems)
router.get('/home/albums', getHomeAlbumItems)
router.get('/home/radios', getHomeRadioItems)
router.get('/home/charts', getHomeChartItems)
router.get('/home', getHomeContent)
router.use('/auth', authRouter)
router.use('/admin-auth', adminAuthRouter)
router.use('/artist-auth', artistAuthRouter)
router.use('/artists', artistRouter)
router.use('/releases', releaseRouter)
router.use('/tracks', trackRouter)
router.use('/admin', adminRouter)
router.use('/songs', songRouter)
router.use('/podcasts', podcastRouter)

export default router
