import { Router } from 'express'
import { getArtistMe } from './artistController.js'
import { requireArtist } from '../../middleware/authMiddleware.js'

const artistRouter = Router()

artistRouter.get('/me', requireArtist, getArtistMe)

export default artistRouter
