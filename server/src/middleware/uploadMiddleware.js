import crypto from 'node:crypto'
import { mkdirSync } from 'node:fs'
import { rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import multer from 'multer'
import { isCloudinaryConfigured } from '../config/cloudinary.js'

const DEFAULT_TRACK_UPLOAD_MAX_MB = 100
const DEFAULT_IMPORT_IMAGE_MAX_MB = 20
const DEFAULT_ADMIN_IMPORT_MAX_FILES = 200
const ALLOWED_AUDIO_MIME_TYPES = new Set([
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/x-wav',
  'audio/wave',
  'audio/vnd.wave',
  'audio/flac',
  'audio/x-flac',
  'audio/mp4',
  'audio/aac',
  'audio/x-aac',
  'audio/ogg',
])
const ALLOWED_AUDIO_EXTENSIONS = new Set(['.mp3', '.wav', '.flac', '.m4a', '.aac', '.ogg'])
const ALLOWED_IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
])
const ALLOWED_IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif'])

const trimString = (value) => (typeof value === 'string' ? value.trim() : '')
const adminImportTempDirectory = path.join(os.tmpdir(), 'tmusic-admin-import')

const getTrackUploadMaxBytes = () => {
  const configuredMb = Number.parseInt(process.env.TRACK_UPLOAD_MAX_MB || '', 10)
  const maxMb =
    Number.isFinite(configuredMb) && configuredMb > 0 ? configuredMb : DEFAULT_TRACK_UPLOAD_MAX_MB

  return maxMb * 1024 * 1024
}

const getImportImageMaxBytes = () => {
  const configuredMb = Number.parseInt(process.env.IMPORT_IMAGE_MAX_MB || '', 10)
  const maxMb =
    Number.isFinite(configuredMb) && configuredMb > 0 ? configuredMb : DEFAULT_IMPORT_IMAGE_MAX_MB

  return maxMb * 1024 * 1024
}

const getAdminImportMaxFiles = () => {
  const configuredMaxFiles = Number.parseInt(process.env.ADMIN_IMPORT_MAX_FILES || '', 10)

  return Number.isFinite(configuredMaxFiles) && configuredMaxFiles > 0
    ? configuredMaxFiles
    : DEFAULT_ADMIN_IMPORT_MAX_FILES
}

const isAllowedAudioFile = (file) => {
  const mimeType = trimString(file?.mimetype).toLowerCase()

  if (mimeType && ALLOWED_AUDIO_MIME_TYPES.has(mimeType)) {
    return true
  }

  const extension = path.extname(trimString(file?.originalname)).toLowerCase()
  return Boolean(extension && ALLOWED_AUDIO_EXTENSIONS.has(extension))
}

const isAllowedImageFile = (file) => {
  const mimeType = trimString(file?.mimetype).toLowerCase()

  if (mimeType && ALLOWED_IMAGE_MIME_TYPES.has(mimeType)) {
    return true
  }

  const extension = path.extname(trimString(file?.originalname)).toLowerCase()
  return Boolean(extension && ALLOWED_IMAGE_EXTENSIONS.has(extension))
}

const createTrackUploadMiddleware = () =>
  multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: getTrackUploadMaxBytes(),
      files: 1,
    },
    fileFilter: (_req, file, callback) => {
      if (isAllowedAudioFile(file)) {
        callback(null, true)
        return
      }

      callback(
        new Error('Only audio files in mp3, wav, flac, m4a, aac, or ogg format are allowed.'),
      )
    },
  })

const createAdminSongImportUploadMiddleware = () => {
  mkdirSync(adminImportTempDirectory, { recursive: true })

  return multer({
    storage: multer.diskStorage({
      destination: (_req, _file, callback) => {
        callback(null, adminImportTempDirectory)
      },
      filename: (_req, file, callback) => {
        callback(
          null,
          `${Date.now()}-${crypto.randomUUID()}${path.extname(trimString(file?.originalname)).toLowerCase()}`,
        )
      },
    }),
    limits: {
      fileSize: getTrackUploadMaxBytes(),
      files: getAdminImportMaxFiles(),
    },
    fileFilter: (_req, file, callback) => {
      if (file.fieldname === 'audioFiles') {
        if (isAllowedAudioFile(file)) {
          callback(null, true)
          return
        }

        callback(
          new Error('Only audio files in mp3, wav, flac, m4a, aac, or ogg format are allowed.'),
        )
        return
      }

      if (file.fieldname === 'coverFiles') {
        if (isAllowedImageFile(file)) {
          callback(null, true)
          return
        }

        callback(new Error('Only image files in jpg, png, webp, gif, or avif format are allowed.'))
        return
      }

      callback(new Error('Unexpected upload field.'))
    },
  })
}

const flattenUploadedFiles = (files) => {
  if (!files) {
    return []
  }

  if (Array.isArray(files)) {
    return files
  }

  return Object.values(files).flat()
}

export const cleanupUploadedFiles = async (files) => {
  const uploadedFiles = flattenUploadedFiles(files)

  await Promise.allSettled(
    uploadedFiles.map(async (file) => {
      if (!trimString(file?.path)) {
        return
      }

      await rm(file.path, {
        force: true,
      })
    }),
  )
}

export const requireCloudinaryUploadConfig = (_req, res, next) => {
  if (isCloudinaryConfigured()) {
    next()
    return
  }

  res.status(503).json({
    message:
      'Cloudinary credentials are missing. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.',
  })
}

export const parseArtistTrackMasterUpload = (req, res, next) => {
  createTrackUploadMiddleware().single('file')(req, res, (error) => {
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        res.status(400).json({
          message: `Track file is too large. Maximum size is ${Math.floor(getTrackUploadMaxBytes() / (1024 * 1024))}MB.`,
        })
        return
      }

      res.status(400).json({
        message: error.message || 'Track upload payload is invalid.',
      })
      return
    }

    if (error) {
      res.status(400).json({
        message: error.message || 'Track upload payload is invalid.',
      })
      return
    }

    if (!req.file) {
      res.status(400).json({
        message: 'Track upload file is required.',
      })
      return
    }

    next()
  })
}

export const parseAdminSongBulkImport = (req, res, next) => {
  createAdminSongImportUploadMiddleware().fields([
    { name: 'audioFiles', maxCount: getAdminImportMaxFiles() },
    { name: 'coverFiles', maxCount: getAdminImportMaxFiles() },
  ])(req, res, (error) => {
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        void cleanupUploadedFiles(req.files)
        res.status(400).json({
          message: `Import file is too large. Audio files can be up to ${Math.floor(getTrackUploadMaxBytes() / (1024 * 1024))}MB and cover images up to ${Math.floor(getImportImageMaxBytes() / (1024 * 1024))}MB.`,
        })
        return
      }

      if (error.code === 'LIMIT_FILE_COUNT') {
        void cleanupUploadedFiles(req.files)
        res.status(400).json({
          message: `Too many files were uploaded. Maximum total files is ${getAdminImportMaxFiles()}.`,
        })
        return
      }

      void cleanupUploadedFiles(req.files)
      res.status(400).json({
        message: error.message || 'Song import payload is invalid.',
      })
      return
    }

    if (error) {
      void cleanupUploadedFiles(req.files)
      res.status(400).json({
        message: error.message || 'Song import payload is invalid.',
      })
      return
    }

    if (!Array.isArray(req.files?.audioFiles) || req.files.audioFiles.length === 0) {
      void cleanupUploadedFiles(req.files)
      res.status(400).json({
        message: 'At least one audio file is required for bulk import.',
      })
      return
    }

    const oversizedCover = flattenUploadedFiles(req.files?.coverFiles).find(
      (file) => Number(file?.size) > getImportImageMaxBytes(),
    )

    if (oversizedCover) {
      void cleanupUploadedFiles(req.files)
      res.status(400).json({
        message: `Cover image "${oversizedCover.originalname}" is too large. Maximum size is ${Math.floor(getImportImageMaxBytes() / (1024 * 1024))}MB.`,
      })
      return
    }

    next()
  })
}
