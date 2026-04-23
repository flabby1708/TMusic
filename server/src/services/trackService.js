import mongoose from 'mongoose'
import Song from '../models/Song.js'

const TRACK_AUDIO_PRESETS = Object.freeze([
  {
    quality: 'normal',
    codec: 'mp3',
    format: 'mp3',
    bitrateKbps: 128,
    vipOnly: false,
  },
  {
    quality: 'high',
    codec: 'mp3',
    format: 'mp3',
    bitrateKbps: 320,
    vipOnly: true,
  },
])

const trimString = (value) => (typeof value === 'string' ? value.trim() : '')

const toNonNegativeNumber = (value) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0
}

const buildFallbackArtistName = (ownerUser) =>
  trimString(ownerUser?.artistProfile?.stageName) || trimString(ownerUser?.displayName) || 'Artist'

export const buildInitialAudioVariants = () =>
  TRACK_AUDIO_PRESETS.map((preset) => ({
    ...preset,
    url: '',
    publicId: '',
    sizeBytes: 0,
    status: 'pending',
    errorMessage: '',
  }))

const mapAudioVariant = (variant) => ({
  quality: trimString(variant?.quality) || 'normal',
  codec: trimString(variant?.codec) || 'mp3',
  format: trimString(variant?.format) || 'mp3',
  bitrateKbps: toNonNegativeNumber(variant?.bitrateKbps),
  url: trimString(variant?.url),
  publicId: trimString(variant?.publicId),
  sizeBytes: toNonNegativeNumber(variant?.sizeBytes),
  vipOnly: Boolean(variant?.vipOnly),
  status: trimString(variant?.status) || 'pending',
  errorMessage: trimString(variant?.errorMessage),
})

const mapMasterAudio = (masterAudio) => {
  const url = trimString(masterAudio?.url)

  if (!url) {
    return null
  }

  return {
    url,
    publicId: trimString(masterAudio?.publicId),
    originalFilename: trimString(masterAudio?.originalFilename),
    format: trimString(masterAudio?.format),
    resourceType: trimString(masterAudio?.resourceType) || 'raw',
    sizeBytes: toNonNegativeNumber(masterAudio?.sizeBytes),
    uploadedAt: masterAudio?.uploadedAt || null,
  }
}

const buildLegacyVariantFromAudioUrl = (item) => {
  const audioUrl = trimString(item?.audioUrl)

  if (!audioUrl) {
    return []
  }

  return [
    {
      quality: 'normal',
      codec: 'unknown',
      format: '',
      bitrateKbps: 0,
      url: audioUrl,
      publicId: '',
      sizeBytes: 0,
      vipOnly: false,
      status: 'ready',
      errorMessage: '',
    },
  ]
}

export const mapTrackRecord = (item) => {
  const audioVariants =
    Array.isArray(item?.audioVariants) && item.audioVariants.length > 0
      ? item.audioVariants.map(mapAudioVariant)
      : buildLegacyVariantFromAudioUrl(item)
  const readyNormalVariant =
    audioVariants.find((variant) => variant.quality === 'normal' && variant.status === 'ready') ||
    audioVariants.find((variant) => variant.status === 'ready')
  const processingStatus =
    trimString(item?.processingStatus) || (readyNormalVariant?.url ? 'ready' : 'draft')

  return {
    id: item._id.toString(),
    title: item.title,
    artist: item.artist,
    coverUrl: item.coverUrl || '',
    duration: item.duration || '00:00',
    mood: item.mood || '',
    audioUrl: item.audioUrl || readyNormalVariant?.url || '',
    sourceType: item.sourceType || 'catalog',
    releaseStatus: item.releaseStatus || 'draft',
    processingStatus,
    createdAt: item.createdAt || null,
    updatedAt: item.updatedAt || null,
    masterAudio: mapMasterAudio(item.masterAudio),
    audioVariants,
  }
}

export const createArtistTrackDraft = async ({ ownerUser, input }) => {
  const title = trimString(input?.title)

  if (!title) {
    return {
      errorType: 'validation',
      message: 'Track title is required.',
      item: null,
    }
  }

  const song = await Song.create({
    title,
    artist: trimString(input?.artist) || buildFallbackArtistName(ownerUser),
    coverUrl: trimString(input?.coverUrl),
    duration: trimString(input?.duration) || '00:00',
    mood: trimString(input?.mood) || 'Original',
    ownerUserId: ownerUser?._id || null,
    sourceType: 'artist',
    releaseStatus: 'draft',
    processingStatus: 'draft',
    audioUrl: '',
    audioVariants: buildInitialAudioVariants(),
  })

  return {
    errorType: '',
    message: '',
    item: mapTrackRecord(song.toObject()),
  }
}

export const findArtistOwnedTrack = async ({ trackId, ownerUserId }) => {
  if (!mongoose.Types.ObjectId.isValid(trackId)) {
    return {
      errorType: 'validation',
      message: 'Track id is invalid.',
      item: null,
    }
  }

  const item = await Song.findOne({
    _id: trackId,
    ownerUserId,
    sourceType: 'artist',
  })

  if (!item) {
    return {
      errorType: 'notFound',
      message: 'Artist track was not found.',
      item: null,
    }
  }

  return {
    errorType: '',
    message: '',
    item,
  }
}

export const confirmArtistTrackMasterUpload = async ({ track, uploadPayload }) => {
  const url = trimString(uploadPayload?.secureUrl) || trimString(uploadPayload?.url)
  const publicId = trimString(uploadPayload?.publicId)

  if (!url || !publicId) {
    return {
      errorType: 'validation',
      message: 'Upload confirmation requires secureUrl and publicId.',
      item: null,
    }
  }

  track.masterAudio = {
    url,
    publicId,
    originalFilename:
      trimString(uploadPayload?.originalFilename) || trimString(uploadPayload?.original_filename),
    format: trimString(uploadPayload?.format),
    resourceType: trimString(uploadPayload?.resourceType) || 'raw',
    sizeBytes: toNonNegativeNumber(uploadPayload?.sizeBytes ?? uploadPayload?.bytes),
    uploadedAt: new Date(),
  }
  track.processingStatus = 'uploaded'
  track.audioUrl = ''
  track.audioVariants = buildInitialAudioVariants()

  await track.save()

  return {
    errorType: '',
    message: '',
    item: mapTrackRecord(track.toObject()),
  }
}
