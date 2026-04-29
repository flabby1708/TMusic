import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

const DEFAULT_FFMPEG_PATH = 'ffmpeg'
const FFMPEG_CHECK_TIMEOUT_MS = 5000

let cachedStatus = null
let cachedAt = 0

const CACHE_TTL_MS = 30 * 1000

const getFfmpegPath = () => {
  return process.env.FFMPEG_PATH?.trim() || DEFAULT_FFMPEG_PATH
}

const extractVersionLine = (output = '') => {
  const firstLine = output
    .split('\n')
    .map((line) => line.trim())
    .find(Boolean)

  return firstLine || ''
}

const normalizeFfmpegError = (error) => {
  if (error?.code === 'ENOENT') {
    return 'FFmpeg executable was not found. Install FFmpeg or set FFMPEG_PATH correctly.'
  }

  if (error?.code === 'EACCES') {
    return 'FFmpeg executable exists but is not executable. Check file permissions.'
  }

  if (error?.killed || error?.signal === 'SIGTERM') {
    return 'FFmpeg health check timed out.'
  }

  return error?.message || 'Unable to run FFmpeg health check.'
}

export const checkFfmpegAvailability = async ({ force = false } = {}) => {
  const now = Date.now()

  if (!force && cachedStatus && now - cachedAt < CACHE_TTL_MS) {
    return cachedStatus
  }

  const ffmpegPath = getFfmpegPath()

  try {
    const { stdout, stderr } = await execFileAsync(
      ffmpegPath,
      ['-version'],
      {
        timeout: FFMPEG_CHECK_TIMEOUT_MS,
        windowsHide: true,
      },
    )

    const rawOutput = `${stdout || ''}\n${stderr || ''}`.trim()
    const version = extractVersionLine(rawOutput)

    cachedStatus = {
      available: true,
      path: ffmpegPath,
      version,
      checkedAt: new Date().toISOString(),
    }

    cachedAt = now

    return cachedStatus
  } catch (error) {
    cachedStatus = {
      available: false,
      path: ffmpegPath,
      error: normalizeFfmpegError(error),
      code: error?.code || 'FFMPEG_HEALTH_CHECK_FAILED',
      checkedAt: new Date().toISOString(),
    }

    cachedAt = now

    return cachedStatus
  }
}

export const getFfmpegHealthStatus = async () => {
  return checkFfmpegAvailability()
}

export const assertFfmpegAvailable = async () => {
  const status = await checkFfmpegAvailability()

  if (!status.available) {
    const error = new Error(status.error)
    error.name = 'FfmpegUnavailableError'
    error.code = 'FFMPEG_UNAVAILABLE'
    error.details = status
    throw error
  }

  return status
}

export const clearFfmpegHealthCache = () => {
  cachedStatus = null
  cachedAt = 0
}