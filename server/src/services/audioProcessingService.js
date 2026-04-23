import { spawn, spawnSync } from 'node:child_process'
import { createWriteStream } from 'node:fs'
import { mkdtemp, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { Readable } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import Song from '../models/Song.js'
import { uploadCloudinaryAudioFile } from '../config/cloudinary.js'
import { buildInitialAudioVariants, mapTrackRecord } from './trackService.js'

const PROCESSING_TRACK_IDS = new Set()
const DOWNLOAD_TIMEOUT_MS = 120_000
const DEFAULT_FFMPEG_EXECUTABLE = 'ffmpeg'

const trimString = (value) => (typeof value === 'string' ? value.trim() : '')

const resolveFfmpegExecutable = () => trimString(process.env.FFMPEG_PATH) || DEFAULT_FFMPEG_EXECUTABLE

const getTrackVariantPresets = (track) => {
  if (Array.isArray(track?.audioVariants) && track.audioVariants.length > 0) {
    return track.audioVariants.map((variant) => ({
      quality: trimString(variant.quality) || 'normal',
      codec: trimString(variant.codec) || 'mp3',
      format: trimString(variant.format) || 'mp3',
      bitrateKbps: Number(variant.bitrateKbps) || 0,
      vipOnly: Boolean(variant.vipOnly),
    }))
  }

  return buildInitialAudioVariants().map((variant) => ({
    quality: variant.quality,
    codec: variant.codec,
    format: variant.format,
    bitrateKbps: variant.bitrateKbps,
    vipOnly: variant.vipOnly,
  }))
}

const resolveMasterExtension = (track) => {
  const explicitFormat = trimString(track?.masterAudio?.format)

  if (explicitFormat) {
    return explicitFormat
  }

  const originalFilename = trimString(track?.masterAudio?.originalFilename)
  const extension = path.extname(originalFilename).replace('.', '').trim()

  return extension || 'bin'
}

const runFfmpeg = (args) =>
  new Promise((resolve, reject) => {
    const ffmpegExecutable = resolveFfmpegExecutable()
    const child = spawn(ffmpegExecutable, args, {
      stdio: ['ignore', 'pipe', 'pipe'],
    })

    let stderr = ''
    let stdout = ''

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString()
    })

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString()
    })

    child.on('error', (error) => {
      reject(error)
    })

    child.on('close', (code) => {
      if (code === 0) {
        resolve({
          stdout,
          stderr,
        })
        return
      }

      reject(
        new Error(
          stderr.trim() || stdout.trim() || `FFmpeg exited with code ${code ?? 'unknown'}.`,
        ),
      )
    })
  })

const isFfmpegAvailable = () => {
  const ffmpegExecutable = resolveFfmpegExecutable()
  const result = spawnSync(ffmpegExecutable, ['-version'], {
    stdio: 'ignore',
  })

  return result.status === 0
}

const getAudioProcessingAvailability = () => {
  if (!isFfmpegAvailable()) {
    return {
      available: false,
      message:
        'FFmpeg is not available on the server. Install FFmpeg or set FFMPEG_PATH before processing audio variants.',
    }
  }

  return {
    available: true,
    message: '',
  }
}

const markTrackProcessingState = async (track, status, errorMessage = '') => {
  const presets = getTrackVariantPresets(track)

  track.processingStatus = status
  track.audioVariants = presets.map((variant) => ({
    ...variant,
    url: status === 'ready' ? trimString(variant.url) : '',
    publicId: status === 'ready' ? trimString(variant.publicId) : '',
    sizeBytes: status === 'ready' ? Number(variant.sizeBytes) || 0 : 0,
    status,
    errorMessage: status === 'failed' ? errorMessage : '',
  }))

  if (status !== 'ready') {
    track.audioUrl = ''
  }

  await track.save()
}

const applyProcessedVariants = async (track, variants) => {
  track.processingStatus = 'ready'
  track.audioVariants = variants.map((variant) => ({
    quality: variant.quality,
    codec: variant.codec,
    format: variant.format,
    bitrateKbps: variant.bitrateKbps,
    url: variant.url,
    publicId: variant.publicId,
    sizeBytes: variant.sizeBytes,
    vipOnly: variant.vipOnly,
    status: 'ready',
    errorMessage: '',
  }))
  track.audioUrl = variants.find((variant) => variant.quality === 'normal')?.url || variants[0]?.url || ''
  await track.save()
}

const markTrackProcessingFailed = async (track, error) => {
  const message = trimString(error?.message) || 'Audio processing failed.'
  const presets = getTrackVariantPresets(track)

  track.processingStatus = 'failed'
  track.audioUrl = ''
  track.audioVariants = presets.map((variant) => ({
    quality: variant.quality,
    codec: variant.codec,
    format: variant.format,
    bitrateKbps: variant.bitrateKbps,
    url: '',
    publicId: '',
    sizeBytes: 0,
    vipOnly: variant.vipOnly,
    status: 'failed',
    errorMessage: message,
  }))
  await track.save()
}

const downloadMasterAudio = async ({ url, filePath }) => {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(DOWNLOAD_TIMEOUT_MS),
  })

  if (!response.ok || !response.body) {
    throw new Error(`Could not download master audio from "${url}".`)
  }

  await pipeline(Readable.fromWeb(response.body), createWriteStream(filePath))
}

const transcodeVariant = async ({ inputPath, outputPath, bitrateKbps }) => {
  await runFfmpeg([
    '-y',
    '-i',
    inputPath,
    '-vn',
    '-map_metadata',
    '-1',
    '-c:a',
    'libmp3lame',
    '-b:a',
    `${bitrateKbps}k`,
    outputPath,
  ])
}

const processTrackAudioInBackground = async (trackId) => {
  const track = await Song.findById(trackId)

  if (!track || !track.masterAudio?.url) {
    PROCESSING_TRACK_IDS.delete(trackId)
    return
  }

  const tempDirectory = await mkdtemp(path.join(os.tmpdir(), 'tmusic-audio-'))

  try {
    const inputPath = path.join(tempDirectory, `master.${resolveMasterExtension(track)}`)

    await downloadMasterAudio({
      url: track.masterAudio.url,
      filePath: inputPath,
    })

    const uploadFolder = `artists/${track.ownerUserId}/tracks/${track._id}/variants`
    const processedVariants = []

    for (const preset of getTrackVariantPresets(track)) {
      const outputPath = path.join(
        tempDirectory,
        `${preset.quality}-${preset.bitrateKbps || 'audio'}.mp3`,
      )

      await transcodeVariant({
        inputPath,
        outputPath,
        bitrateKbps: preset.bitrateKbps || 128,
      })

      const uploadedVariant = await uploadCloudinaryAudioFile({
        filePath: outputPath,
        folder: uploadFolder,
        publicId: `${preset.quality}-${preset.bitrateKbps || 128}k`,
      })

      processedVariants.push({
        quality: preset.quality,
        codec: 'mp3',
        format: 'mp3',
        bitrateKbps: preset.bitrateKbps || 128,
        url: uploadedVariant.secure_url || uploadedVariant.url || '',
        publicId: uploadedVariant.public_id || '',
        sizeBytes: Number(uploadedVariant.bytes) || 0,
        vipOnly: Boolean(preset.vipOnly),
      })
    }

    await applyProcessedVariants(track, processedVariants)
  } catch (error) {
    console.error(`Track audio processing failed for ${trackId}:`, error)
    await markTrackProcessingFailed(track, error)
  } finally {
    PROCESSING_TRACK_IDS.delete(trackId)
    await rm(tempDirectory, {
      recursive: true,
      force: true,
    })
  }
}

export const queueTrackAudioProcessing = async ({ track }) => {
  const trackId = track?._id?.toString?.() || ''

  if (!trackId) {
    return {
      queued: false,
      message: 'Track id is missing.',
      item: null,
    }
  }

  if (!track.masterAudio?.url) {
    return {
      queued: false,
      message: 'Master audio has not been uploaded yet.',
      item: mapTrackRecord(track.toObject()),
    }
  }

  if (PROCESSING_TRACK_IDS.has(trackId)) {
    return {
      queued: false,
      message: 'Audio processing is already running for this track.',
      item: mapTrackRecord(track.toObject()),
    }
  }

  const availability = getAudioProcessingAvailability()

  if (!availability.available) {
    return {
      queued: false,
      message: availability.message,
      item: mapTrackRecord(track.toObject()),
    }
  }

  PROCESSING_TRACK_IDS.add(trackId)
  await markTrackProcessingState(track, 'processing')

  setTimeout(() => {
    void processTrackAudioInBackground(trackId)
  }, 0)

  return {
    queued: true,
    message: 'Audio processing has been queued.',
    item: mapTrackRecord(track.toObject()),
  }
}
