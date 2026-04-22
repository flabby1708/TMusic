const ABSOLUTE_URL_PATTERN = /^https?:\/\//i
const LOCAL_API_FALLBACK_ORIGIN = 'http://localhost:5000'

const trimTrailingSlash = (value) => value.replace(/\/+$/, '')

const getConfiguredApiOrigin = () => {
  const rawValue = import.meta.env?.VITE_API_BASE_URL

  if (typeof rawValue !== 'string') {
    return ''
  }

  const trimmedValue = rawValue.trim()
  return trimmedValue ? trimTrailingSlash(trimmedValue) : ''
}

const isLocalhostPage = () => {
  if (typeof window === 'undefined') {
    return false
  }

  return ['localhost', '127.0.0.1'].includes(window.location.hostname)
}

const buildRequestCandidates = (url) => {
  if (ABSOLUTE_URL_PATTERN.test(url)) {
    return [url]
  }

  const candidates = [url]

  if (!url.startsWith('/api')) {
    return candidates
  }

  const configuredApiOrigin = getConfiguredApiOrigin()

  if (configuredApiOrigin) {
    candidates.push(`${configuredApiOrigin}${url}`)
  } else if (isLocalhostPage()) {
    candidates.push(`${LOCAL_API_FALLBACK_ORIGIN}${url}`)
  }

  return [...new Set(candidates)]
}

const readResponsePayload = async (response) => {
  const rawText = await response.text()
  const text = rawText.trim()

  if (!text) {
    return {
      payload: null,
      text: '',
    }
  }

  try {
    return {
      payload: JSON.parse(text),
      text: '',
    }
  } catch {
    return {
      payload: null,
      text: text.startsWith('<') ? '' : text,
    }
  }
}

const buildHttpErrorMessage = (response, payload, text) => {
  if (payload?.message) {
    return payload.message
  }

  if (text) {
    return text
  }

  if ([502, 503, 504].includes(response.status)) {
    return 'API chưa sẵn sàng. Hãy chạy backend ở http://localhost:5000 rồi thử lại.'
  }

  return response.statusText || 'Yêu cầu thất bại.'
}

export const requestJson = async (url, options = {}) => {
  const candidates = buildRequestCandidates(url)
  const isApiRequest = typeof url === 'string' && url.startsWith('/api')
  let lastError = null

  for (const [index, candidate] of candidates.entries()) {
    try {
      const response = await fetch(candidate, options)

      if (response.status === 204) {
        return null
      }

      const { payload, text } = await readResponsePayload(response)

      if (!response.ok) {
        const error = new Error(buildHttpErrorMessage(response, payload, text))
        error.status = response.status
        lastError = error

        if (index < candidates.length - 1 && response.status >= 500) {
          continue
        }

        throw error
      }

      return payload
    } catch (error) {
      const normalizedError =
        error instanceof Error ? error : new Error('Yêu cầu thất bại.')

      lastError =
        isApiRequest && index === candidates.length - 1 && !normalizedError.status
          ? Object.assign(
              new Error(
                'Không kết nối được API. Hãy đảm bảo backend đang chạy ở http://localhost:5000.',
              ),
              {
                cause: normalizedError,
              },
            )
          : normalizedError

      if (index < candidates.length - 1) {
        continue
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Yêu cầu thất bại.')
}
