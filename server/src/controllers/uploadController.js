import { createAdminMediaUploadSignature } from '../services/uploadService.js'

export const createAdminUploadSignature = (req, res, next) => {
  try {
    const { configError, upload } = createAdminMediaUploadSignature({
      resource: req.body?.resource,
      assetType: req.body?.assetType,
    })

    if (configError) {
      return res.status(503).json({
        message: configError,
      })
    }

    return res.json(upload)
  } catch (error) {
    return next(error)
  }
}
