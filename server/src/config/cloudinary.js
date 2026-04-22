import { v2 as cloudinary } from 'cloudinary'

const trimString = (value) => {
  if (typeof value !== 'string') {
    return ''
  }

  return value.trim()
}

const normalizeFolderPath = (value) =>
  trimString(value)
    .replace(/\\/g, '/')
    .split('/')
    .map((segment) => segment.trim())
    .filter(Boolean)
    .join('/')

const getCloudinaryCredentials = () => ({
  cloudName: trimString(process.env.CLOUDINARY_CLOUD_NAME),
  apiKey: trimString(process.env.CLOUDINARY_API_KEY),
  apiSecret: trimString(process.env.CLOUDINARY_API_SECRET),
  baseFolder: normalizeFolderPath(process.env.CLOUDINARY_UPLOAD_FOLDER || 'tmusic'),
})

const configureCloudinaryClient = () => {
  const credentials = getCloudinaryCredentials()

  if (!credentials.cloudName || !credentials.apiKey || !credentials.apiSecret) {
    return credentials
  }

  cloudinary.config({
    cloud_name: credentials.cloudName,
    api_key: credentials.apiKey,
    api_secret: credentials.apiSecret,
    secure: true,
  })

  return credentials
}

export const isCloudinaryConfigured = () => {
  const credentials = getCloudinaryCredentials()

  return Boolean(credentials.cloudName && credentials.apiKey && credentials.apiSecret)
}

export const buildCloudinaryFolder = (folder = '') => {
  const { baseFolder } = getCloudinaryCredentials()
  const nestedFolder = normalizeFolderPath(folder)

  if (!nestedFolder) {
    return baseFolder
  }

  return `${baseFolder}/${nestedFolder}`
}

const createCloudinaryUploadSignature = ({ folder = '', resourceType = 'image' } = {}) => {
  const credentials = configureCloudinaryClient()

  if (!credentials.cloudName || !credentials.apiKey || !credentials.apiSecret) {
    return null
  }

  const timestamp = Math.floor(Date.now() / 1000)
  const normalizedFolder = buildCloudinaryFolder(folder)
  const paramsToSign = {
    folder: normalizedFolder,
    timestamp,
  }

  return {
    apiKey: credentials.apiKey,
    cloudName: credentials.cloudName,
    folder: normalizedFolder,
    signature: cloudinary.utils.api_sign_request(paramsToSign, credentials.apiSecret),
    timestamp,
    uploadUrl: `https://api.cloudinary.com/v1_1/${credentials.cloudName}/${resourceType}/upload`,
  }
}

export const createCloudinaryImageUploadSignature = ({ folder = '' } = {}) =>
  createCloudinaryUploadSignature({
    folder,
    resourceType: 'image',
  })

export const createCloudinaryRawUploadSignature = ({ folder = '' } = {}) =>
  createCloudinaryUploadSignature({
    folder,
    resourceType: 'raw',
  })
