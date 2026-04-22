import {
  createCloudinaryImageUploadSignature,
  createCloudinaryRawUploadSignature,
  isCloudinaryConfigured,
} from '../config/cloudinary.js'

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

export const createArtistTrackUploadSignature = ({ artistId } = {}) => {
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
      folder: `artists/${sanitizeFolderSegment(artistId, 'artist')}/tracks`,
    }),
  }
}
