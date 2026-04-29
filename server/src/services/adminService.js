import path from 'node:path'
import Album from '../models/Album.js'
import Artist from '../models/Artist.js'
import Chart from '../models/Chart.js'
import Radio from '../models/Radio.js'
import Song from '../models/Song.js'
import { destroyCloudinaryAsset, uploadCloudinaryFile } from '../config/cloudinary.js'

const sortByOrder = { sortOrder: 1, createdAt: 1 }

const trimString = (value, fallback = '') => {
  if (typeof value !== 'string') {
    return fallback
  }

  return value.trim()
}

const parseSortOrder = (value) => {
  const parsed = Number.parseInt(value, 10)

  return Number.isFinite(parsed) ? parsed : 0
}

const parseInitials = (value) => {
  if (Array.isArray(value)) {
    return value
      .map((item) => trimString(item))
      .filter(Boolean)
  }

  return trimString(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

const toNonNegativeNumber = (value) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0
}

const formatDurationFromSeconds = (value) => {
  const safeValue = Math.floor(toNonNegativeNumber(value))

  if (safeValue <= 0) {
    return ''
  }

  const hours = Math.floor(safeValue / 3600)
  const minutes = Math.floor((safeValue % 3600) / 60)
  const seconds = String(safeValue % 60).padStart(2, '0')

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${seconds}`
  }

  return `${minutes}:${seconds}`
}

const parseDurationToSeconds = (value) => {
  const normalizedValue = trimString(value)

  if (!normalizedValue) {
    return null
  }

  const parts = normalizedValue.split(':').map((part) => part.trim())

  if (parts.length === 0 || parts.length > 3 || parts.some((part) => !/^\d+$/.test(part))) {
    return null
  }

  const units = parts.map((part) => Number.parseInt(part, 10))

  if (parts.length === 1) {
    return units[0]
  }

  if (parts.length === 2) {
    return units[0] * 60 + units[1]
  }

  return units[0] * 3600 + units[1] * 60 + units[2]
}

const normalizeDurationString = (value, fallback = '00:00') => {
  const parsedSeconds = parseDurationToSeconds(value)

  if (parsedSeconds == null) {
    return trimString(value, fallback) || fallback
  }

  return formatDurationFromSeconds(parsedSeconds) || fallback
}

const normalizeLookupToken = (value) =>
  trimString(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()

const getFilenameStem = (filename = '') => path.parse(trimString(filename)).name

const formatSlugWords = (value) =>
  trimString(value)
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const cleanupSongFilenameStem = (value) =>
  trimString(value)
    .replace(/^\d+\s*[-_. )]+/, '')
    .replace(/\s+/g, ' ')
    .trim()

const splitArtistAndTitleFromStem = (stem) => {
  const match = cleanupSongFilenameStem(stem).match(/^(.+?)\s+-\s+(.+)$/)

  if (!match) {
    return null
  }

  return {
    artist: trimString(match[1]),
    title: trimString(match[2]),
  }
}

const resolveSongIdentityFromFilename = (filename, defaultArtist = '') => {
  const stem = cleanupSongFilenameStem(getFilenameStem(filename))
  const parsedIdentity = splitArtistAndTitleFromStem(stem)

  if (parsedIdentity?.artist && parsedIdentity?.title) {
    return {
      artist: parsedIdentity.artist,
      title: parsedIdentity.title,
      inferredFromFilename: true,
      errorMessage: '',
    }
  }

  const hyphenParts = stem
    .split('-')
    .map((part) => trimString(part))
    .filter(Boolean)

  if (hyphenParts.length >= 2) {
    const artist = formatSlugWords(hyphenParts[0])
    const titleParts = [...hyphenParts.slice(1)]

    if (titleParts.length > 1 && /^\d{3,}$/.test(titleParts[titleParts.length - 1])) {
      titleParts.pop()
    }

    const title = formatSlugWords(titleParts.join(' '))

    if (artist && title) {
      return {
        artist,
        title,
        inferredFromFilename: true,
        errorMessage: '',
      }
    }
  }

  if (stem && trimString(defaultArtist)) {
    return {
      artist: trimString(defaultArtist),
      title: formatSlugWords(stem),
      inferredFromFilename: false,
      errorMessage: '',
    }
  }

  return {
    artist: '',
    title: stem,
    inferredFromFilename: false,
    errorMessage:
      'Could not detect artist from filename. Rename files as "Artist - Title.ext" or provide a default artist.',
  }
}

const buildCoverLookupCandidates = (filename) => {
  const stem = cleanupSongFilenameStem(getFilenameStem(filename))
  const tokens = new Set()
  const fullToken = normalizeLookupToken(stem)

  if (fullToken) {
    tokens.add(fullToken)
  }

  const parsedIdentity = splitArtistAndTitleFromStem(stem)
  const titleToken = normalizeLookupToken(parsedIdentity?.title || '')

  if (titleToken) {
    tokens.add(titleToken)
  }

  return [...tokens]
}

const buildCoverFileLookup = (coverFiles = []) => {
  const lookup = new Map()

  for (const file of coverFiles) {
    for (const token of buildCoverLookupCandidates(file?.originalname)) {
      if (!token) {
        continue
      }

      const filesForToken = lookup.get(token) || []
      filesForToken.push(file)
      lookup.set(token, filesForToken)
    }
  }

  return lookup
}

const getFileIdentity = (file) =>
  trimString(file?.path) ||
  trimString(file?.originalname) ||
  trimString(file?.filename) ||
  `${trimString(file?.name)}:${toNonNegativeNumber(file?.lastModified)}:${toNonNegativeNumber(file?.size)}`

const sortFilesByName = (files = [], getName) =>
  [...files].sort((left, right) =>
    getName(left).localeCompare(getName(right), undefined, {
      numeric: true,
      sensitivity: 'base',
    }),
  )

const findNamedCoverFileForAudio = (audioFile, coverLookup, usedCoverIds) => {
  for (const token of buildCoverLookupCandidates(audioFile?.originalname)) {
    const matchedFiles = coverLookup.get(token) || []

    if (matchedFiles.length === 1 && !usedCoverIds.has(getFileIdentity(matchedFiles[0]))) {
      return {
        file: matchedFiles[0],
        strategy: 'name',
      }
    }
  }

  return null
}

const assignCoverFilesToAudio = (audioFiles = [], coverFiles = []) => {
  const coverLookup = buildCoverFileLookup(coverFiles)
  const assignments = new Map()
  const usedCoverIds = new Set()

  for (const audioFile of audioFiles) {
    const namedMatch = findNamedCoverFileForAudio(audioFile, coverLookup, usedCoverIds)

    if (!namedMatch) {
      continue
    }

    assignments.set(getFileIdentity(audioFile), namedMatch)
    usedCoverIds.add(getFileIdentity(namedMatch.file))
  }

  const remainingCovers = sortFilesByName(
    coverFiles.filter((file) => !usedCoverIds.has(getFileIdentity(file))),
    (file) => trimString(file?.originalname),
  )

  for (const audioFile of audioFiles) {
    const audioId = getFileIdentity(audioFile)

    if (assignments.has(audioId)) {
      continue
    }

    const nextCover = remainingCovers.shift()

    if (!nextCover) {
      break
    }

    assignments.set(audioId, {
      file: nextCover,
      strategy: 'order',
    })
    usedCoverIds.add(getFileIdentity(nextCover))
  }

  return assignments
}

const allowedSongReleaseStatuses = new Set(['draft', 'pending', 'published'])

const normalizeSongReleaseStatus = (value) => {
  const releaseStatus = trimString(value, 'published') || 'published'

  return allowedSongReleaseStatuses.has(releaseStatus) ? releaseStatus : 'published'
}

const parseBooleanFlag = (value, fallback = false) => {
  if (typeof value === 'boolean') {
    return value
  }

  const normalizedValue = trimString(value).toLowerCase()

  if (!normalizedValue) {
    return fallback
  }

  if (['1', 'true', 'yes', 'on'].includes(normalizedValue)) {
    return true
  }

  if (['0', 'false', 'no', 'off'].includes(normalizedValue)) {
    return false
  }

  return fallback
}

const createDefaultSongAudioVariant = (payload) => {
  if (!payload.audioUrl) {
    return []
  }

  return [
    {
      quality: 'normal',
      codec: trimString(payload.masterAudioFormat || 'mp3') || 'mp3',
      format: trimString(payload.masterAudioFormat || 'mp3') || 'mp3',
      bitrateKbps: 0,
      url: payload.audioUrl,
      publicId: trimString(payload.masterAudioPublicId),
      sizeBytes: toNonNegativeNumber(payload.masterAudioSizeBytes),
      vipOnly: false,
      status: 'ready',
      errorMessage: '',
    },
  ]
}

const sanitizeSongPayload = (payload) => {
  const audioUrl = trimString(payload.audioUrl)
  const masterAudioPublicId = trimString(payload.masterAudioPublicId)
  const masterAudioDurationSeconds = toNonNegativeNumber(payload.masterAudioDurationSeconds)
  const masterAudioFormat = trimString(payload.masterAudioFormat)
  const masterAudioResourceType = trimString(payload.masterAudioResourceType || 'video') || 'video'
  const masterAudioOriginalFilename = trimString(payload.masterAudioOriginalFilename)
  const masterAudioSizeBytes = toNonNegativeNumber(payload.masterAudioSizeBytes)
  const providedDuration = trimString(payload.duration)
  const inferredDuration = formatDurationFromSeconds(masterAudioDurationSeconds)

  return {
    title: trimString(payload.title),
    artist: trimString(payload.artist),
    coverUrl: trimString(payload.coverUrl),
    coverPublicId: trimString(payload.coverPublicId),
    duration: providedDuration ? normalizeDurationString(providedDuration, '00:00') : inferredDuration || '00:00',
    mood: trimString(payload.mood, 'Chill') || 'Chill',
    sortOrder: parseSortOrder(payload.sortOrder),
    audioUrl,
    masterAudio: audioUrl
      ? {
          url: audioUrl,
          publicId: masterAudioPublicId,
          originalFilename: masterAudioOriginalFilename,
          format: masterAudioFormat,
          resourceType: masterAudioResourceType,
          sizeBytes: masterAudioSizeBytes,
          uploadedAt: new Date(),
        }
      : {
          url: '',
          publicId: '',
          originalFilename: '',
          format: '',
          resourceType: 'video',
          sizeBytes: 0,
          uploadedAt: null,
        },
    audioVariants: createDefaultSongAudioVariant({
      audioUrl,
      masterAudioPublicId,
      masterAudioFormat,
      masterAudioSizeBytes,
    }),
    processingStatus: audioUrl ? 'ready' : 'draft',
    sourceType: 'catalog',
    releaseStatus: normalizeSongReleaseStatus(payload.releaseStatus),
    ownerUserId: null,
  }
}

const collectSongCloudinaryAssets = (item) => {
  const assets = []

  if (trimString(item?.coverPublicId)) {
    assets.push({
      publicId: trimString(item.coverPublicId),
      resourceType: 'image',
    })
  }

  if (trimString(item?.masterAudio?.publicId)) {
    assets.push({
      publicId: trimString(item.masterAudio.publicId),
      resourceType: trimString(item.masterAudio.resourceType || 'video') || 'video',
    })
  }

  if (Array.isArray(item?.audioVariants)) {
    for (const variant of item.audioVariants) {
      const publicId = trimString(variant?.publicId)

      if (!publicId) {
        continue
      }

      assets.push({
        publicId,
        resourceType: 'video',
      })
    }
  }

  return assets.filter(
    (asset, index, collection) =>
      collection.findIndex(
        (candidate) =>
          candidate.publicId === asset.publicId && candidate.resourceType === asset.resourceType,
      ) === index,
  )
}

const collectStaleSongAssets = (previousItem, nextItem) => {
  const previousAssets = collectSongCloudinaryAssets(previousItem)
  const nextAssets = new Set(
    collectSongCloudinaryAssets(nextItem).map((asset) => `${asset.resourceType}:${asset.publicId}`),
  )

  return previousAssets.filter((asset) => !nextAssets.has(`${asset.resourceType}:${asset.publicId}`))
}

const cleanupCloudinaryAssets = async (assets) => {
  await Promise.allSettled(
    assets.map(async (asset) => {
      try {
        await destroyCloudinaryAsset(asset)
      } catch (error) {
        console.error(`Cloudinary cleanup failed for ${asset.resourceType}:${asset.publicId}`, error)
      }
    }),
  )
}

const resourceConfig = {
  songs: {
    model: Song,
    sanitize: sanitizeSongPayload,
    validate(payload) {
      if (!payload.title || !payload.artist) {
        return 'Song title and artist are required.'
      }

      return ''
    },
  },
  artists: {
    model: Artist,
    sanitize(payload) {
      return {
        name: trimString(payload.name),
        meta: trimString(payload.meta, 'Nghe si') || 'Nghe si',
        imageUrl: trimString(payload.imageUrl),
        initials: trimString(payload.initials),
        artwork: trimString(payload.artwork),
        sortOrder: parseSortOrder(payload.sortOrder),
      }
    },
    validate(payload) {
      if (!payload.name) {
        return 'Artist name is required.'
      }

      return ''
    },
  },
  albums: {
    model: Album,
    sanitize(payload) {
      return {
        title: trimString(payload.title),
        artist: trimString(payload.artist),
        coverUrl: trimString(payload.coverUrl),
        artwork: trimString(payload.artwork),
        sortOrder: parseSortOrder(payload.sortOrder),
      }
    },
    validate(payload) {
      if (!payload.title || !payload.artist) {
        return 'Album title and artist are required.'
      }

      return ''
    },
  },
  radios: {
    model: Radio,
    sanitize(payload) {
      return {
        title: trimString(payload.title),
        description: trimString(payload.description),
        imageUrl: trimString(payload.imageUrl),
        tone: trimString(payload.tone),
        initials: parseInitials(payload.initials),
        sortOrder: parseSortOrder(payload.sortOrder),
      }
    },
    validate(payload) {
      if (!payload.title || !payload.description) {
        return 'Radio title and description are required.'
      }

      return ''
    },
  },
  charts: {
    model: Chart,
    sanitize(payload) {
      return {
        title: trimString(payload.title),
        subtitle: trimString(payload.subtitle),
        coverUrl: trimString(payload.coverUrl),
        artwork: trimString(payload.artwork),
        sortOrder: parseSortOrder(payload.sortOrder),
      }
    },
    validate(payload) {
      if (!payload.title || !payload.subtitle) {
        return 'Chart title and subtitle are required.'
      }

      return ''
    },
  },
}

export const getAdminResourceConfig = (resource) => resourceConfig[resource]

export const listAdminResourceItems = async (resource) => {
  const config = getAdminResourceConfig(resource)

  if (!config) {
    return null
  }

  const items = await config.model.find().sort(sortByOrder).lean()

  return {
    items,
  }
}

export const createAdminResourceItem = async (resource, body) => {
  const config = getAdminResourceConfig(resource)

  if (!config) {
    return null
  }

  const payload = config.sanitize(body)
  const validationMessage = config.validate(payload)

  return {
    validationMessage,
    item: validationMessage ? null : await config.model.create(payload),
  }
}

const createImportedSongItem = async (payload) => {
  const created = await createAdminResourceItem('songs', payload)

  if (!created) {
    throw new Error('Songs resource is not available.')
  }

  if (created.validationMessage) {
    throw new Error(created.validationMessage)
  }

  if (!created.item) {
    throw new Error('Song could not be created.')
  }

  return created.item
}

export const importAdminSongs = async ({ body, audioFiles = [], coverFiles = [] } = {}) => {
  const defaultArtist = trimString(body?.defaultArtist)
  const mood = trimString(body?.mood, 'Chill') || 'Chill'
  const skipDuplicates = parseBooleanFlag(body?.skipDuplicates, true)
  const sortOrderStart = parseSortOrder(body?.sortOrderStart)
  const coverAssignments = assignCoverFilesToAudio(audioFiles, coverFiles)
  const batchFolder = `admin/songs/imports/${Date.now()}`
  const results = []

  for (const [index, audioFile] of audioFiles.entries()) {
    const identity = resolveSongIdentityFromFilename(audioFile?.originalname, defaultArtist)
    const coverAssignment = coverAssignments.get(getFileIdentity(audioFile)) || null
    const matchedCoverFile = coverAssignment?.file || null
    const result = {
      index,
      status: 'error',
      title: identity.title || cleanupSongFilenameStem(getFilenameStem(audioFile?.originalname)),
      artist: identity.artist || trimString(defaultArtist),
      audioFilename: trimString(audioFile?.originalname),
      coverFilename: trimString(matchedCoverFile?.originalname),
      coverMatched: Boolean(matchedCoverFile),
      coverMatchStrategy: coverAssignment?.strategy || '',
      itemId: '',
      message: '',
    }

    if (identity.errorMessage) {
      result.message = identity.errorMessage
      results.push(result)
      continue
    }

    if (skipDuplicates) {
      const existingSong = await Song.findOne({
        title: identity.title,
        artist: identity.artist,
        sourceType: 'catalog',
      }).collation({ locale: 'en', strength: 2 })

      if (existingSong) {
        result.status = 'skipped'
        result.itemId = String(existingSong._id)
        result.message = 'Skipped because a song with the same title and artist already exists.'
        results.push(result)
        continue
      }
    }

    const uploadedAssets = []

    try {
      const uploadedAudio = await uploadCloudinaryFile({
        filePath: audioFile.path,
        folder: `${batchFolder}/audio`,
        resourceType: 'video',
      })

      if (!trimString(uploadedAudio?.secure_url || uploadedAudio?.url)) {
        throw new Error(`Cloudinary did not return a valid URL for "${audioFile.originalname}".`)
      }

      uploadedAssets.push({
        publicId: trimString(uploadedAudio?.public_id),
        resourceType: trimString(uploadedAudio?.resource_type || 'video') || 'video',
      })

      let uploadedCover = null

      if (matchedCoverFile?.path) {
        uploadedCover = await uploadCloudinaryFile({
          filePath: matchedCoverFile.path,
          folder: `${batchFolder}/covers`,
          resourceType: 'image',
        })

        if (!trimString(uploadedCover?.secure_url || uploadedCover?.url)) {
          throw new Error(`Cloudinary did not return a valid cover URL for "${matchedCoverFile.originalname}".`)
        }

        uploadedAssets.push({
          publicId: trimString(uploadedCover?.public_id),
          resourceType: trimString(uploadedCover?.resource_type || 'image') || 'image',
        })
      }

      const durationSeconds = toNonNegativeNumber(uploadedAudio?.duration)
      const createdSong = await createImportedSongItem({
        title: identity.title,
        artist: identity.artist,
        duration: formatDurationFromSeconds(durationSeconds) || '00:00',
        mood,
        sortOrder: sortOrderStart + index,
        coverUrl: trimString(uploadedCover?.secure_url || uploadedCover?.url),
        coverPublicId: trimString(uploadedCover?.public_id),
        audioUrl: trimString(uploadedAudio?.secure_url || uploadedAudio?.url),
        masterAudioPublicId: trimString(uploadedAudio?.public_id),
        masterAudioDurationSeconds: durationSeconds,
        masterAudioFormat: trimString(uploadedAudio?.format) || path.extname(audioFile.originalname).replace('.', ''),
        masterAudioResourceType: trimString(uploadedAudio?.resource_type || 'video') || 'video',
        masterAudioOriginalFilename: trimString(audioFile.originalname),
        masterAudioSizeBytes: toNonNegativeNumber(uploadedAudio?.bytes ?? audioFile?.size),
      })

      result.status = 'created'
      result.itemId = String(createdSong._id)
      result.message = matchedCoverFile
        ? coverAssignment?.strategy === 'order'
          ? 'Song imported successfully with cover assigned by file order.'
          : 'Song imported successfully with matched cover art.'
        : 'Song imported successfully.'
      results.push(result)
    } catch (error) {
      await cleanupCloudinaryAssets(uploadedAssets.filter((asset) => asset.publicId))
      result.message = error instanceof Error ? error.message : 'Song import failed.'
      results.push(result)
    }
  }

  const createdCount = results.filter((item) => item.status === 'created').length
  const skippedCount = results.filter((item) => item.status === 'skipped').length
  const errorCount = results.filter((item) => item.status === 'error').length
  const matchedCoverCount = results.filter((item) => item.coverMatched).length
  const orderMatchedCoverCount = results.filter((item) => item.coverMatchStrategy === 'order').length

  return {
    summary: {
      totalAudioFiles: audioFiles.length,
      totalCoverFiles: coverFiles.length,
      createdCount,
      skippedCount,
      errorCount,
      matchedCoverCount,
      orderMatchedCoverCount,
      unmatchedCoverCount: Math.max(audioFiles.length - matchedCoverCount, 0),
      skipDuplicates,
      defaultArtist,
      mood,
      sortOrderStart,
    },
    results,
  }
}

export const updateAdminResourceItem = async (resource, id, body) => {
  const config = getAdminResourceConfig(resource)

  if (!config) {
    return null
  }

  const payload = config.sanitize(body)
  const validationMessage = config.validate(payload)

  if (validationMessage) {
    return {
      validationMessage,
      item: null,
    }
  }

  if (resource === 'songs') {
    const existingItem = await config.model.findById(id)

    if (!existingItem) {
      return {
        validationMessage: '',
        item: null,
      }
    }

    const previousSnapshot = existingItem.toObject()

    existingItem.set(payload)
    await existingItem.save()
    await cleanupCloudinaryAssets(collectStaleSongAssets(previousSnapshot, existingItem.toObject()))

    return {
      validationMessage: '',
      item: existingItem,
    }
  }

  const item = await config.model.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  })

  return {
    validationMessage: '',
    item,
  }
}

export const deleteAdminResourceItem = async (resource, id) => {
  const config = getAdminResourceConfig(resource)

  if (!config) {
    return null
  }

  const item = await config.model.findByIdAndDelete(id)

  if (resource === 'songs' && item) {
    await cleanupCloudinaryAssets(collectSongCloudinaryAssets(item.toObject()))
  }

  return { item }
}
