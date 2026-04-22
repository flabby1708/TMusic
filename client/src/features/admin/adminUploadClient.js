import { requestAdminJson } from './adminAuthClient.js'

export const uploadAdminImage = async ({ file, resource }) => {
  const signedUpload = await requestAdminJson('/api/admin/uploads/sign', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ resource }),
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
    throw new Error(payload?.error?.message || 'Tải ảnh lên thất bại.')
  }

  if (!payload?.secure_url) {
    throw new Error('Cloudinary không trả về đường dẫn ảnh hợp lệ.')
  }

  return {
    publicId: payload.public_id || '',
    secureUrl: payload.secure_url,
  }
}
