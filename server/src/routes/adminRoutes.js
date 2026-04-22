import { Router } from 'express'
import {
  createAdminItem,
  deleteAdminItem,
  listAdminItems,
  updateAdminItem,
} from '../controllers/adminController.js'
import { createAdminUploadSignature } from '../controllers/uploadController.js'
import { requireAdmin } from '../middleware/authMiddleware.js'

const adminRouter = Router()

adminRouter.use(requireAdmin)

adminRouter.post('/uploads/sign', createAdminUploadSignature)
adminRouter.get('/:resource', listAdminItems)
adminRouter.post('/:resource', createAdminItem)
adminRouter.put('/:resource/:id', updateAdminItem)
adminRouter.delete('/:resource/:id', deleteAdminItem)

export default adminRouter
