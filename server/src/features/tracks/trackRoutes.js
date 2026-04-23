import { Router } from 'express'
import {
  confirmArtistTrackUpload,
  createArtistTrack,
  createArtistTrackUpload,
  processArtistTrack,
  uploadArtistTrackFile,
} from './trackController.js'
import { requireApprovedArtist } from '../../middleware/authMiddleware.js'
import {
  parseArtistTrackMasterUpload,
  requireCloudinaryUploadConfig,
} from '../../middleware/uploadMiddleware.js'

const trackRouter = Router()

trackRouter.post('/', requireApprovedArtist, createArtistTrack)
trackRouter.post('/upload', requireApprovedArtist, createArtistTrackUpload)
trackRouter.post('/:trackId/confirm-upload', requireApprovedArtist, confirmArtistTrackUpload)
trackRouter.post(
  '/:trackId/upload-file',
  requireApprovedArtist,
  requireCloudinaryUploadConfig,
  parseArtistTrackMasterUpload,
  uploadArtistTrackFile,
)
trackRouter.post('/:trackId/process', requireApprovedArtist, processArtistTrack)

export default trackRouter
