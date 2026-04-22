import { Router } from 'express'
import { listArtistReleases } from '../controllers/artistController.js'
import { requireArtist } from '../middleware/authMiddleware.js'

const releaseRouter = Router()

releaseRouter.get('/', requireArtist, listArtistReleases)

export default releaseRouter
