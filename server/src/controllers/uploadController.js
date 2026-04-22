import { createAdminImageUploadSignature } from '../services/uploadService.js'

export const createAdminUploadSignature = (req, res, next) => {
  try {
    const { configError, upload } = createAdminImageUploadSignature({
      resource: req.body?.resource,
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
