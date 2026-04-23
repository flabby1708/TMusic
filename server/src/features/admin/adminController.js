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

const ensureDatabaseReady = (res) => {
  if (getDatabaseStatus() === 'connected') {
    return true
  }

  res.status(503).json({
    message: 'MongoDB is not connected yet.',
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
