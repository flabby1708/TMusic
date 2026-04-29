import path from 'node:path'
import { readdir } from 'node:fs/promises'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { connectDatabase, getDatabaseStatus } from '../config/db.js'
import {
  destroyCloudinaryAsset,
  isCloudinaryConfigured,
  uploadCloudinaryFile,
} from '../config/cloudinary.js'
import Song from '../models/Song.js'

dotenv.config()

const ALLOWED_IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif'])

const trimString = (value) => (typeof value === 'string' ? value.trim() : '')

const normalizeLookupToken = (value) =>
  trimString(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()

const getFilenameStem = (filename = '') => path.parse(trimString(filename)).name

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

const parseCliArgs = (argv) => {
  const parsed = {
    coversDir: '',
    limit: 0,
    dryRun: false,
  }

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index]

    if (!argument.startsWith('--')) {
      continue
    }

    const [rawKey, inlineValue] = argument.slice(2).split('=')
    const key = trimString(rawKey)
    const hasSeparateValue = argv[index + 1] && !argv[index + 1].startsWith('--')
    const nextValue =
      inlineValue !== undefined ? inlineValue : hasSeparateValue ? argv[++index] : ''

    if (key === 'covers-dir') {
      parsed.coversDir = trimString(nextValue)
      continue
    }

    if (key === 'limit') {
      const parsedLimit = Number.parseInt(nextValue, 10)
      parsed.limit = Number.isFinite(parsedLimit) && parsedLimit > 0 ? parsedLimit : 0
      continue
    }

    if (key === 'dry-run') {
      parsed.dryRun = true
    }
  }

  return parsed
}

const printUsage = () => {
  console.log('Usage:')
  console.log('  npm run import:song-covers -- --covers-dir="E:\\covers"')
  console.log('')
  console.log('Options:')
  console.log('  --covers-dir   Folder containing cover images to import. Required.')
  console.log('  --limit        Optional limit for the number of missing-cover songs to scan.')
  console.log('  --dry-run      Show matches without uploading to Cloudinary or updating MongoDB.')
}

const getFileIdentity = (file) => `${trimString(file.path)}:${trimString(file.originalname)}`

const isAllowedImageFile = (filename) =>
  ALLOWED_IMAGE_EXTENSIONS.has(path.extname(trimString(filename)).toLowerCase())

const listImageFiles = async (directoryPath) => {
  const entries = await readdir(directoryPath, {
    withFileTypes: true,
  })
  const files = []

  for (const entry of entries) {
    const absolutePath = path.join(directoryPath, entry.name)

    if (entry.isDirectory()) {
      files.push(...(await listImageFiles(absolutePath)))
      continue
    }

    if (!entry.isFile() || !isAllowedImageFile(entry.name)) {
      continue
    }

    files.push({
      path: absolutePath,
      originalname: entry.name,
    })
  }

  return files.sort((left, right) =>
    left.originalname.localeCompare(right.originalname, undefined, {
      numeric: true,
      sensitivity: 'base',
    }),
  )
}

const buildCoverLookupCandidates = (filename) => {
  const stem = cleanupSongFilenameStem(getFilenameStem(filename))
  const candidates = []
  const exactToken = normalizeLookupToken(stem)

  if (exactToken) {
    candidates.push({
      token: exactToken,
      strategy: 'exact-filename',
    })
  }

  const parsedIdentity = splitArtistAndTitleFromStem(stem)
  const titleToken = normalizeLookupToken(parsedIdentity?.title || '')

  if (titleToken && !candidates.some((candidate) => candidate.token === titleToken)) {
    candidates.push({
      token: titleToken,
      strategy: 'title-fallback',
    })
  }

  return candidates
}

const buildCoverFileLookup = (coverFiles = []) => {
  const lookup = new Map()

  for (const file of coverFiles) {
    for (const candidate of buildCoverLookupCandidates(file.originalname)) {
      const filesForToken = lookup.get(candidate.token) || []
      filesForToken.push(file)
      lookup.set(candidate.token, filesForToken)
    }
  }

  return lookup
}

const buildTitleTokenCounts = (songs = []) => {
  const counts = new Map()

  for (const song of songs) {
    const titleToken = normalizeLookupToken(song?.title)

    if (!titleToken) {
      continue
    }

    counts.set(titleToken, (counts.get(titleToken) || 0) + 1)
  }

  return counts
}

const buildSongLookupCandidates = (song, titleTokenCounts) => {
  const candidates = []
  const audioFilenameStem = cleanupSongFilenameStem(getFilenameStem(song.masterAudio?.originalFilename || ''))

  const pushCandidate = (token, strategy) => {
    if (!token || candidates.some((candidate) => candidate.token === token)) {
      return
    }

    candidates.push({
      token,
      strategy,
    })
  }

  pushCandidate(normalizeLookupToken(`${song.artist} - ${song.title}`), 'artist-title')
  pushCandidate(normalizeLookupToken(audioFilenameStem), 'audio-filename')

  const parsedAudioIdentity = splitArtistAndTitleFromStem(audioFilenameStem)
  pushCandidate(normalizeLookupToken(parsedAudioIdentity?.title || ''), 'audio-title')

  const titleToken = normalizeLookupToken(song.title)

  if (titleToken && titleTokenCounts.get(titleToken) === 1) {
    pushCandidate(titleToken, 'title-only')
  }

  return candidates
}

const findMatchedCoverForSong = (song, coverLookup, usedCoverIds, titleTokenCounts) => {
  for (const candidate of buildSongLookupCandidates(song, titleTokenCounts)) {
    const matchedFiles = (coverLookup.get(candidate.token) || []).filter(
      (file) => !usedCoverIds.has(getFileIdentity(file)),
    )

    if (matchedFiles.length === 1) {
      return {
        file: matchedFiles[0],
        strategy: candidate.strategy,
      }
    }
  }

  return null
}

const buildMissingCoverQuery = () => ({
  audioUrl: {
    $ne: '',
  },
  $or: [
    { coverUrl: { $exists: false } },
    { coverUrl: '' },
    { coverUrl: null },
  ],
})

const formatSummaryLine = (summary) =>
  [
    `songs scanned=${summary.totalSongs}`,
    `matches=${summary.matchedCount}`,
    `updated=${summary.updatedCount}`,
    `skipped=${summary.skippedCount}`,
    `errors=${summary.errorCount}`,
    `dryRun=${summary.dryRun}`,
  ].join(', ')

const main = async () => {
  const { coversDir, limit, dryRun } = parseCliArgs(process.argv.slice(2))

  if (!coversDir) {
    printUsage()
    process.exitCode = 1
    return
  }

  const resolvedCoversDir = path.resolve(coversDir)

  if (!dryRun && !isCloudinaryConfigured()) {
    throw new Error(
      'Cloudinary credentials are missing. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.',
    )
  }

  const coverFiles = await listImageFiles(resolvedCoversDir)

  if (coverFiles.length === 0) {
    throw new Error(`No image files were found in "${resolvedCoversDir}".`)
  }

  await connectDatabase()

  if (getDatabaseStatus() !== 'connected') {
    throw new Error('MongoDB is not connected.')
  }

  let query = Song.find(buildMissingCoverQuery()).sort({
    sortOrder: 1,
    createdAt: 1,
  })

  if (limit > 0) {
    query = query.limit(limit)
  }

  const songs = await query
  const coverLookup = buildCoverFileLookup(coverFiles)
  const titleTokenCounts = buildTitleTokenCounts(songs)
  const usedCoverIds = new Set()
  const batchFolder = `admin/songs/backfill-covers/${Date.now()}`
  const results = []

  for (const song of songs) {
    const matchedCover = findMatchedCoverForSong(song, coverLookup, usedCoverIds, titleTokenCounts)
    const result = {
      songId: String(song._id),
      title: trimString(song.title),
      artist: trimString(song.artist),
      coverFilename: trimString(matchedCover?.file?.originalname),
      matchStrategy: trimString(matchedCover?.strategy),
      status: 'skipped',
      message: '',
    }

    if (!matchedCover?.file) {
      result.message = 'No matching cover file found.'
      results.push(result)
      continue
    }

    usedCoverIds.add(getFileIdentity(matchedCover.file))

    if (dryRun) {
      result.status = 'matched'
      result.message = 'Matched in dry-run mode. No upload performed.'
      results.push(result)
      continue
    }

    let uploadedCover = null

    try {
      uploadedCover = await uploadCloudinaryFile({
        filePath: matchedCover.file.path,
        folder: batchFolder,
        resourceType: 'image',
      })

      const coverUrl = trimString(uploadedCover?.secure_url || uploadedCover?.url)
      const coverPublicId = trimString(uploadedCover?.public_id)

      if (!coverUrl || !coverPublicId) {
        throw new Error(`Cloudinary did not return a valid cover asset for "${matchedCover.file.originalname}".`)
      }

      const previousCoverPublicId = trimString(song.coverPublicId)
      song.coverUrl = coverUrl
      song.coverPublicId = coverPublicId
      await song.save()

      if (previousCoverPublicId && previousCoverPublicId !== coverPublicId) {
        await destroyCloudinaryAsset({
          publicId: previousCoverPublicId,
          resourceType: 'image',
        }).catch(() => null)
      }

      result.status = 'updated'
      result.message = 'Cover imported successfully.'
      results.push(result)
    } catch (error) {
      if (trimString(uploadedCover?.public_id)) {
        await destroyCloudinaryAsset({
          publicId: trimString(uploadedCover.public_id),
          resourceType: 'image',
        }).catch(() => null)
      }

      result.status = 'error'
      result.message = error instanceof Error ? error.message : 'Cover import failed.'
      results.push(result)
    }
  }

  const summary = {
    totalSongs: songs.length,
    totalCoverFiles: coverFiles.length,
    matchedCount: results.filter((item) => item.status === 'matched' || item.status === 'updated').length,
    updatedCount: results.filter((item) => item.status === 'updated').length,
    skippedCount: results.filter((item) => item.status === 'skipped').length,
    errorCount: results.filter((item) => item.status === 'error').length,
    dryRun,
  }

  console.log(`Imported cover folder: ${resolvedCoversDir}`)
  console.log(`Cloudinary batch folder: ${dryRun ? '(dry-run)' : batchFolder}`)
  console.log(formatSummaryLine(summary))

  for (const item of results) {
    console.log(
      `[${item.status}] ${item.artist} - ${item.title} | cover=${item.coverFilename || '-'} | strategy=${item.matchStrategy || '-'} | ${item.message}`,
    )
  }
}

try {
  await main()
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Cover import failed.')
  process.exitCode = 1
} finally {
  await mongoose.disconnect().catch(() => null)
}
