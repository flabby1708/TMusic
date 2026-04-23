import {
  createCloudinaryImageUploadSignature,
  createCloudinaryRawUploadSignature,
  createCloudinaryVideoUploadSignature,
  isCloudinaryConfigured,
  uploadCloudinaryBuffer,
} from '../config/cloudinary.js'
import path from 'node:path'

const trimString = (value) => {
  if (typeof value !== 'string') {
    return ''
  }

  return value.trim()
}

const sanitizeFolderSegment = (value, fallback = 'misc') => {
  const normalized = trimString(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return normalized || fallback
}

const getOriginalFileExtension = (filename = '') => path.extname(trimString(filename)).replace('.', '')

export const buildArtistTrackMasterFolder = ({ artistId, trackId } = {}) =>
  trackId
    ? `artists/${sanitizeFolderSegment(artistId, 'artist')}/tracks/${sanitizeFolderSegment(trackId, 'track')}/master`
    : `artists/${sanitizeFolderSegment(artistId, 'artist')}/tracks`

export const createAdminImageUploadSignature = ({ resource } = {}) => {
  if (!isCloudinaryConfigured()) {
    return {
      configError:
        'Cloudinary credentials are missing. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.',
      upload: null,
    }
  }

  return {
    configError: '',
    upload: createCloudinaryImageUploadSignature({
      folder: `admin/${sanitizeFolderSegment(resource, 'media')}`,
    }),
  }
}

export const createAdminMediaUploadSignature = ({ resource, assetType } = {}) => {
  if (!isCloudinaryConfigured()) {
    return {
      configError:
        'Cloudinary credentials are missing. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.',
      upload: null,
    }
  }

  const normalizedAssetType = trimString(assetType).toLowerCase()
  const folder = `admin/${sanitizeFolderSegment(resource, 'media')}`

  if (normalizedAssetType === 'audio') {
    return {
      configError: '',
      upload: createCloudinaryVideoUploadSignature({
        folder,
      }),
    }
  }

  return {
    configError: '',
    upload: createCloudinaryImageUploadSignature({
      folder,
    }),
  }
}

export const createArtistTrackUploadSignature = ({ artistId, trackId } = {}) => {
  if (!isCloudinaryConfigured()) {
    return {
      configError:
        'Cloudinary credentials are missing. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.',
      upload: null,
    }
  }

  return {
    configError: '',
    upload: createCloudinaryRawUploadSignature({
      folder: buildArtistTrackMasterFolder({ artistId, trackId }),
    }),
  }
}

export const uploadArtistTrackMasterFile = async ({ artistId, trackId, file } = {}) => {
  if (!file?.buffer) {
    throw new Error('Track upload file is missing.')
  }

  const uploaded = await uploadCloudinaryBuffer({
    buffer: file.buffer,
    folder: buildArtistTrackMasterFolder({ artistId, trackId }),
    publicId: 'master',
    resourceType: 'raw',
  })

  return {
    secureUrl: uploaded?.secure_url || uploaded?.url || '',
    url: uploaded?.url || uploaded?.secure_url || '',
    publicId: uploaded?.public_id || '',
    format: trimString(uploaded?.format) || getOriginalFileExtension(file.originalname),
    resourceType: trimString(uploaded?.resource_type) || 'raw',
    sizeBytes: Number(uploaded?.bytes) || Number(file.size) || 0,
    originalFilename: trimString(file.originalname),
  }
}
