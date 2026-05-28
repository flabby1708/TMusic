import { Router } from 'express'
import {
  approveArtistApplicationItem,
  approveAdminArtistContent,
  createAdminItem,
  deleteAdminItem,
  importAdminArtistWikiItem,
  getAdminUserItem,
  getArtistApplicationItem,
  listAdminItems,
  listAdminUserItems,
  listArtistApplicationItems,
  rejectArtistApplicationItem,
  updateAdminItem,
  updateAdminUserRoleItem,
  updateAdminUserStatusItem,
  updateAdminUserSubscriptionItem,
  suspendArtistApplicationItem,
} from './adminController.js'
import { createAdminUploadSignature } from '../../controllers/uploadController.js'
import { requireAdmin } from '../../middleware/authMiddleware.js'

const adminRouter = Router()

adminRouter.use(requireAdmin)

adminRouter.post('/uploads/sign', createAdminUploadSignature)
adminRouter.post('/artists/import-wiki', importAdminArtistWikiItem)
adminRouter.get('/users', listAdminUserItems)
adminRouter.get('/users/:id', getAdminUserItem)
adminRouter.patch('/users/:id/status', updateAdminUserStatusItem)
adminRouter.patch('/users/:id/role', updateAdminUserRoleItem)
adminRouter.patch('/users/:id/subscription', updateAdminUserSubscriptionItem) 

adminRouter.get('/artist-applications', listArtistApplicationItems)
adminRouter.get('/artist-applications/:id', getArtistApplicationItem)
adminRouter.patch('/artist-applications/:id/approve', approveArtistApplicationItem)
adminRouter.patch('/artist-applications/:id/reject', rejectArtistApplicationItem)
adminRouter.patch('/artist-applications/:id/suspend', suspendArtistApplicationItem)

adminRouter.get('/:resource', listAdminItems)
adminRouter.post('/:resource', createAdminItem)
adminRouter.patch('/:resource/:id/approve', approveAdminArtistContent)
adminRouter.put('/:resource/:id', updateAdminItem)
adminRouter.delete('/:resource/:id', deleteAdminItem)

export default adminRouter
