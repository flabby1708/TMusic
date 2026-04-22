import { Router } from 'express'
import { createArtistTrackUpload } from '../controllers/trackController.js'
import { requireApprovedArtist } from '../middleware/authMiddleware.js'

const trackRouter = Router()

trackRouter.post('/upload', requireApprovedArtist, createArtistTrackUpload)

export default trackRouter
