export const requestJson = async (url, options = {}) => {
  const response = await fetch(url, options)

  if (response.status === 204) {
    return null
  }

  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(payload?.message || 'Request failed.')
  }

  return payload
}
