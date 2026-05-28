import { Router } from 'express'
import {
  createArtistSongItem,
  importArtistPodcastItems,
  importArtistSongItems,
  listArtistReleases,
  updateArtistSongItem,
} from './artistController.js'
import {
  parseAdminPodcastBulkImport,
  parseAdminSongBulkImport,
  parseArtistSongUpdate,
  parseArtistSongSubmission,
  requireCloudinaryUploadConfig,
} from '../../middleware/uploadMiddleware.js'
import { requireApprovedArtist, requireArtist } from '../../middleware/authMiddleware.js'

const releaseRouter = Router()

releaseRouter.get('/', requireArtist, listArtistReleases)
releaseRouter.post(
  '/songs',
  requireApprovedArtist,
  requireCloudinaryUploadConfig,
  parseArtistSongSubmission,
  createArtistSongItem,
)
releaseRouter.patch(
  '/songs/:songId',
  requireApprovedArtist,
  requireCloudinaryUploadConfig,
  parseArtistSongUpdate,
  updateArtistSongItem,
)
releaseRouter.post(
  '/songs/import',
  requireApprovedArtist,
  requireCloudinaryUploadConfig,
  parseAdminSongBulkImport,
  importArtistSongItems,
)
releaseRouter.post(
  '/podcasts/import',
  requireApprovedArtist,
  requireCloudinaryUploadConfig,
  parseAdminPodcastBulkImport,
  importArtistPodcastItems,
)

export default releaseRouter
