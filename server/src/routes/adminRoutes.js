import { Router } from 'express'
import {
  createAdminItem,
  deleteAdminItem,
  listAdminItems,
  updateAdminItem,
} from '../controllers/adminController.js'

const adminRouter = Router()

adminRouter.get('/:resource', listAdminItems)
adminRouter.post('/:resource', createAdminItem)
adminRouter.put('/:resource/:id', updateAdminItem)
adminRouter.delete('/:resource/:id', deleteAdminItem)

export default adminRouter
