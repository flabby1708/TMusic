import { createArtistTrackUploadSignature } from '../services/uploadService.js'

export const createArtistTrackUpload = (req, res, next) => {
  try {
    const { configError, upload } = createArtistTrackUploadSignature({
      artistId: req.auth?.sub,
    })

    if (configError) {
      return res.status(503).json({
        message: configError,
      })
    }

    return res.json({
      ...upload,
      resource: 'track',
      artistStatus: req.artistUser?.artistStatus || 'approved',
    })
  } catch (error) {
    return next(error)
  }
}
