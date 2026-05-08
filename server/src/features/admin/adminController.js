import { getDatabaseStatus } from '../../config/db.js'
import { cleanupUploadedFiles } from '../../middleware/uploadMiddleware.js'
import {
  createAdminResourceItem,
  deleteAdminResourceItem,
  getAdminResourceConfig,
  importAdminSongs,
  listAdminResourceItems,
  updateAdminResourceItem,
} from '../../services/adminService.js'
import {
  getAdminUserById,
  listAdminUsers,
  updateAdminUserRole,
  updateAdminUserStatus,
  updateAdminUserSubscription,
} from '../../services/adminUserService.js'
import {
  approveArtistApplication,
  getArtistApplicationById,
  listArtistApplications,
  rejectArtistApplication,
  suspendArtistApplication,
} from '../../services/adminArtistApplicationService.js'
const ensureDatabaseReady = (res) => {
  if (getDatabaseStatus() === 'connected') {
    return true
  }

  res.status(503).json({
    message: 'MongoDB is not ready yet. Please try again later.',
    items: [],
  })

  return false
}

const ensureKnownResource = (resource, res) => {
  if (getAdminResourceConfig(resource)) {
    return true
  }

  res.status(404).json({
    message: 'Unknown admin resource.',
  })

  return false
}

export const listAdminItems = async (req, res, next) => {
  try {
    if (!ensureDatabaseReady(res) || !ensureKnownResource(req.params.resource, res)) {
      return
    }

    return res.json(await listAdminResourceItems(req.params.resource))
  } catch (error) { 
    return next(error)
  }
}

export const createAdminItem = async (req, res, next) => {
  try {
    if (!ensureDatabaseReady(res) || !ensureKnownResource(req.params.resource, res)) {
      return
    }

    const { item, validationMessage } = await createAdminResourceItem(req.params.resource, req.body)

    if (validationMessage) {
      return res.status(400).json({
        message: validationMessage,
      })
    }

    return res.status(201).json({ item })
  } catch (error) {
    return next(error)
  }
}

export const importAdminSongItems = async (req, res, next) => {
  try {
    if (!ensureDatabaseReady(res)) {
      return
    }

    const payload = await importAdminSongs({
      body: req.body,
      audioFiles: req.files?.audioFiles || [],
      coverFiles: req.files?.coverFiles || [],
    })

    return res.status(201).json(payload)
  } catch (error) {
    return next(error)
  } finally {
    await cleanupUploadedFiles(req.files)
  }
}

export const updateAdminItem = async (req, res, next) => {
  try {
    if (!ensureDatabaseReady(res) || !ensureKnownResource(req.params.resource, res)) {
      return
    }

    const { item, validationMessage } = await updateAdminResourceItem(
      req.params.resource,
      req.params.id,
      req.body,
    )

    if (validationMessage) {
      return res.status(400).json({
        message: validationMessage,
      })
    }

    if (!item) {
      return res.status(404).json({
        message: 'Item not found.',
      })
    }

    return res.json({ item })
  } catch (error) {
    return next(error)
  }
}

export const deleteAdminItem = async (req, res, next) => {
  try {
    if (!ensureDatabaseReady(res) || !ensureKnownResource(req.params.resource, res)) {
      return
    }

    const { item } = await deleteAdminResourceItem(req.params.resource, req.params.id)

    if (!item) {
      return res.status(404).json({
        message: 'Item not found.',
      })
    }

    return res.status(204).send()
  } catch (error) {
    return next(error)
  }
}
export const listAdminUserItems = async (req, res, next) => {
  try {
    if (!ensureDatabaseReady(res)) {
      return
    }

    return res.json(await listAdminUsers({ query: req.query.q }))
  } catch (error) {
    return next(error)
  }
}

export const getAdminUserItem = async (req, res, next) => {
  try {
    if (!ensureDatabaseReady(res)) {
      return
    }

    const item = await getAdminUserById(req.params.id)

    if (!item) {
      return res.status(404).json({
        message: 'Khong tim thay nguoi dung.',
      })
    }

    return res.json({ item })
  } catch (error) {
    return next(error)
  }
}

export const updateAdminUserStatusItem = async (req, res, next) => {
  try {
    if (!ensureDatabaseReady(res)) {
      return
    }

    const { item, validationMessage } = await updateAdminUserStatus(
      req.params.id,
      req.body,
    )

    if (validationMessage) {
      return res.status(400).json({
        message: validationMessage,
      })
    }

    if (!item) {
      return res.status(404).json({
        message: 'Khong tim thay nguoi dung.',
      })
    }

    return res.json({ item })
  } catch (error) {
    return next(error)
  }
}

export const updateAdminUserRoleItem = async (req, res, next) => {
  try {
    if (!ensureDatabaseReady(res)) {
      return
    }

    const { item, validationMessage } = await updateAdminUserRole(
      req.params.id,
      req.body,
    )

    if (validationMessage) {
      return res.status(400).json({
        message: validationMessage,
      })
    }

    if (!item) {
      return res.status(404).json({
        message: 'Khong tim thay nguoi dung.',
      })
    }

    return res.json({ item })
  } catch (error) {
    return next(error)
  }
}

export const updateAdminUserSubscriptionItem = async (req, res, next) => {
  try {
    if (!ensureDatabaseReady(res)) {
      return
    }

    const { item, validationMessage } = await updateAdminUserSubscription(
      req.params.id,
      req.body,
    )

    if (validationMessage) {
      return res.status(400).json({
        message: validationMessage,
      })
    }

    if (!item) {
      return res.status(404).json({
        message: 'Khong tim thay nguoi dung.',
      })
    }

    return res.json({ item })
  } catch (error) {
    return next(error)
  }
}
export const listArtistApplicationItems = async (req, res, next) => {
  try {
    if (!ensureDatabaseReady(res)) {
      return
    }

    return res.json(
      await listArtistApplications({
        query: req.query.q,
        status: req.query.status,
      }),
    )
  } catch (error) {
    return next(error)
  }
}

export const getArtistApplicationItem = async (req, res, next) => {
  try {
    if (!ensureDatabaseReady(res)) {
      return
    }

    const item = await getArtistApplicationById(req.params.id)

    if (!item) {
      return res.status(404).json({
        message: 'Khong tim thay ho so nghe si.',
      })
    }

    return res.json({ item })
  } catch (error) {
    return next(error)
  }
}

export const approveArtistApplicationItem = async (req, res, next) => {
  try {
    if (!ensureDatabaseReady(res)) {
      return
    }

    const item = await approveArtistApplication(
      req.params.id,
      req.auth?.sub,
      req.body,
    )

    if (!item) {
      return res.status(404).json({
        message: 'Khong tim thay ho so nghe si.',
      })
    }

    return res.json({ item })
  } catch (error) {
    return next(error)
  }
}

export const rejectArtistApplicationItem = async (req, res, next) => {
  try {
    if (!ensureDatabaseReady(res)) {
      return
    }

    const { item, validationMessage } = await rejectArtistApplication(
      req.params.id,
      req.auth?.sub,
      req.body,
    )

    if (validationMessage) {
      return res.status(400).json({
        message: validationMessage,
      })
    }

    if (!item) {
      return res.status(404).json({
        message: 'Khong tim thay ho so nghe si.',
      })
    }

    return res.json({ item })
  } catch (error) {
    return next(error)
  }
}

export const suspendArtistApplicationItem = async (req, res, next) => {
  try {
    if (!ensureDatabaseReady(res)) {
      return
    }

    const { item, validationMessage } = await suspendArtistApplication(
      req.params.id,
      req.auth?.sub,
      req.body,
    )

    if (validationMessage) {
      return res.status(400).json({
        message: validationMessage,
      })
    }

    if (!item) {
      return res.status(404).json({
        message: 'Khong tim thay ho so nghe si.',
      })
    }

    return res.json({ item })
  } catch (error) {
    return next(error)
  }
}