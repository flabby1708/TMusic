import { requestAdminJson } from './adminAuthClient.js'

const getUploadErrorMessage = (assetType) =>
  assetType === 'audio' ? 'Tai file nhac len that bai.' : 'Tai anh len that bai.'

const getInvalidResponseMessage = (assetType) =>
  assetType === 'audio'
    ? 'Cloudinary khong tra ve duong dan audio hop le.'
    : 'Cloudinary khong tra ve duong dan anh hop le.'

const toPositiveFiniteNumber = (value) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0
}

const parseAudioDurationSeconds = (payload) => toPositiveFiniteNumber(payload?.duration)

const readAudioDurationFromFile = (file) =>
  new Promise((resolve) => {
    if (typeof window === 'undefined' || typeof window.Audio !== 'function' || !file) {
      resolve(0)
      return
    }

    const objectUrl = URL.createObjectURL(file)
    const audio = new window.Audio()
    let settled = false

    const finalize = (value = 0) => {
      if (settled) {
        return
      }

      settled = true
      audio.onloadedmetadata = null
      audio.onerror = null
      audio.src = ''
      URL.revokeObjectURL(objectUrl)
      resolve(toPositiveFiniteNumber(value))
    }

    audio.preload = 'metadata'
    audio.onloadedmetadata = () => finalize(audio.duration)
    audio.onerror = () => finalize(0)
    audio.src = objectUrl
  })

export const uploadAdminAsset = async ({ file, resource, assetType = 'image' }) => {
  const signedUpload = await requestAdminJson('/api/admin/uploads/sign', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ resource, assetType }),
  })

  const formData = new FormData()
  formData.append('file', file)
  formData.append('api_key', signedUpload.apiKey)
  formData.append('timestamp', String(signedUpload.timestamp))
  formData.append('signature', signedUpload.signature)
  formData.append('folder', signedUpload.folder)

  const response = await fetch(signedUpload.uploadUrl, {
    method: 'POST',
    body: formData,
  })
  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(payload?.error?.message || getUploadErrorMessage(assetType))
  }

  if (!payload?.secure_url) {
    throw new Error(getInvalidResponseMessage(assetType))
  }

  const durationSeconds =
    assetType === 'audio'
      ? parseAudioDurationSeconds(payload) || (await readAudioDurationFromFile(file))
      : 0

  return {
    publicId: payload.public_id || '',
    secureUrl: payload.secure_url,
    resourceType: payload.resource_type || signedUpload.resourceType || '',
    format: payload.format || '',
    sizeBytes: Number(payload.bytes) || 0,
    originalFilename: file?.name || '',
    durationSeconds,
  }
}

export const uploadAdminImage = ({ file, resource }) =>
  uploadAdminAsset({
    file,
    resource,
    assetType: 'image',
  })

export const uploadAdminAudio = ({ file, resource }) =>
  uploadAdminAsset({
    file,
    resource,
    assetType: 'audio',
  })
