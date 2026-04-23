import { Router } from 'express'
import {
  createAdminItem,
  deleteAdminItem,
  importAdminSongItems,
  listAdminItems,
  updateAdminItem,
} from './adminController.js'
import { createAdminUploadSignature } from '../../controllers/uploadController.js'
import {
  parseAdminSongBulkImport,
  requireCloudinaryUploadConfig,
} from '../../middleware/uploadMiddleware.js'
import { requireAdmin } from '../../middleware/authMiddleware.js'

const adminRouter = Router()

adminRouter.use(requireAdmin)

adminRouter.post('/uploads/sign', createAdminUploadSignature)
adminRouter.post(
  '/songs/import',
  requireCloudinaryUploadConfig,
  parseAdminSongBulkImport,
  importAdminSongItems,
)
adminRouter.get('/:resource', listAdminItems)
adminRouter.post('/:resource', createAdminItem)
adminRouter.put('/:resource/:id', updateAdminItem)
adminRouter.delete('/:resource/:id', deleteAdminItem)

export default adminRouter
