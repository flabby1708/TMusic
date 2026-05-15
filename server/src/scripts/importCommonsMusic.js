import dotenv from 'dotenv'
import { connectDatabase, getDatabaseStatus } from '../config/db.js'
import Song from '../models/Song.js'

dotenv.config()

const DEFAULT_IMPORT_LIMIT = 36
const COMMONS_API_URL = 'https://commons.wikimedia.org/w/api.php'
const COMMONS_USER_AGENT = 'TMusicDevSeeder/1.0 (local development import; Wikimedia Commons public-domain audio)'
const PUBLIC_LICENSES = new Set(['pd', 'cc-zero'])
const AUDIO_MIME_PREFIX = 'audio/'
const SUPPORTED_AUDIO_MIMES = new Set([
  'audio/mpeg',
  'audio/mp3',
  'audio/ogg',
  'application/ogg',
])

const searchPlans = [
  {
    query: 'Xử án Bàng Quí Phi filetype:audio',
    mood: 'Vietnamese Traditional',
    requireVietnameseMetadata: true,
  },
  {
    query: 'Hát trống quân filetype:audio',
    mood: 'Vietnamese Traditional',
    requireVietnameseMetadata: true,
  },
  {
    query: 'Vietnamese traditional music filetype:audio',
    mood: 'Vietnamese Traditional',
    requireVietnameseMetadata: true,
  },
  {
    query: 'Music of Vietnam filetype:audio',
    mood: 'Vietnamese Traditional',
    requireVietnameseMetadata: true,
  },
  {
    query: 'cải lương filetype:audio',
    mood: 'Cải lương',
    requireVietnameseMetadata: true,
  },
  {
    query: 'Vietnamese music filetype:audio',
    mood: 'Vietnamese',
    requireVietnameseMetadata: true,
  },
  {
    query: 'public domain instrumental music filetype:audio',
    mood: 'Instrumental',
  },
  {
    query: 'CC0 electronic music filetype:audio',
    mood: 'Electronic',
  },
  {
    query: 'public domain piano music filetype:audio',
    mood: 'Piano',
  },
]

const categoryPlans = [
  {
    category: 'Category:Audio files from FreePD',
    mood: 'Public Domain',
  },
]

const trimString = (value, fallback = '') => {
  if (typeof value !== 'string') {
    return fallback
  }

  return value.trim()
}

const stripHtml = (value) =>
  trimString(value)
    .replace(/<[^>]*>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()

const parseImportLimit = () => {
  const rawValue = process.argv[2] || process.env.COMMONS_IMPORT_LIMIT
  const parsed = Number.parseInt(String(rawValue || '').trim(), 10)

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_IMPORT_LIMIT
  }

  return Math.min(parsed, 80)
}

const cleanCommonsUrl = (url) => trimString(url).replace(/\?.*$/, '')

const normalizeTitle = (title) =>
  stripHtml(title)
    .replace(/^File:/i, '')
    .replace(/\.(mp3|ogg|oga|wav|flac|m4a|mid)$/i, '')
    .replace(/[_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const normalizeArtist = (value) => {
  const artist = stripHtml(value)
    .replace(/\[\d+]/g, '')
    .replace(/\s+/g, ' ')
    .trim()

  return artist || 'Wikimedia Commons'
}

const getMetadataValue = (metadata, key) => trimString(metadata?.[key]?.value)

const isSupportedAudio = (mime) => {
  const normalizedMime = trimString(mime).toLowerCase()

  return SUPPORTED_AUDIO_MIMES.has(normalizedMime)
}

const isAllowedLicense = (metadata) => {
  const license = getMetadataValue(metadata, 'License').toLowerCase()
  const licenseShortName = getMetadataValue(metadata, 'LicenseShortName').toLowerCase()
  const usageTerms = getMetadataValue(metadata, 'UsageTerms').toLowerCase()

  return (
    PUBLIC_LICENSES.has(license) ||
    licenseShortName.includes('public domain') ||
    usageTerms.includes('public domain') ||
    usageTerms.includes('cc0')
  )
}

const isVietnameseMetadata = (page, metadata) => {
  const haystack = [
    page?.title,
    getMetadataValue(metadata, 'ObjectName'),
    getMetadataValue(metadata, 'Categories'),
    getMetadataValue(metadata, 'ImageDescription'),
    getMetadataValue(metadata, 'Credit'),
  ]
    .join(' ')
    .toLowerCase()

  return [
    'vietnam',
    'vietnamese',
    'việt',
    'cải lương',
    'cai luong',
    'trống quân',
    'trong quan',
    'đờn ca',
    'don ca',
    'phước cương',
    'phuoc cuong',
  ].some((token) => haystack.includes(token))
}

const buildCommonsApiUrl = ({ query, offset = 0, limit = 20 }) => {
  const params = new URLSearchParams({
    action: 'query',
    format: 'json',
    generator: 'search',
    gsrnamespace: '6',
    gsrsearch: query,
    gsrlimit: String(limit),
    gsroffset: String(offset),
    prop: 'imageinfo',
    iiprop: 'url|mime|extmetadata',
  })

  return `${COMMONS_API_URL}?${params.toString()}`
}

const buildCommonsCategoryApiUrl = ({ category, offset = '', limit = 50 }) => {
  const params = new URLSearchParams({
    action: 'query',
    format: 'json',
    generator: 'categorymembers',
    gcmtitle: category,
    gcmnamespace: '6',
    gcmlimit: String(limit),
    prop: 'imageinfo',
    iiprop: 'url|mime|extmetadata',
  })

  if (offset) {
    params.set('gcmcontinue', offset)
  }

  return `${COMMONS_API_URL}?${params.toString()}`
}

const fetchCommonsSearchPage = async (plan, offset) => {
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    const response = await fetch(buildCommonsApiUrl({ query: plan.query, offset }), {
      headers: {
        'User-Agent': COMMONS_USER_AGENT,
      },
    })

    if (response.ok) {
      return response.json()
    }

    if (response.status === 429 && attempt < 3) {
      await new Promise((resolve) => {
        setTimeout(resolve, 1500 * attempt)
      })
      continue
    }

    throw new Error(`Commons search failed for "${plan.query}" with ${response.status}.`)
  }

  return {}
}

const fetchCommonsCategoryPage = async (plan, offset = '') => {
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    const response = await fetch(buildCommonsCategoryApiUrl({ category: plan.category, offset }), {
      headers: {
        'User-Agent': COMMONS_USER_AGENT,
      },
    })

    if (response.ok) {
      return response.json()
    }

    if (response.status === 429 && attempt < 3) {
      await new Promise((resolve) => {
        setTimeout(resolve, 1500 * attempt)
      })
      continue
    }

    throw new Error(`Commons category fetch failed for "${plan.category}" with ${response.status}.`)
  }

  return {}
}

const mapCommonsPageToSongCandidate = (page, plan) => {
  const imageInfo = page?.imageinfo?.[0]
  const metadata = imageInfo?.extmetadata || {}
  const audioUrl = cleanCommonsUrl(imageInfo?.url)
  const title = normalizeTitle(getMetadataValue(metadata, 'ObjectName') || page?.title)
  const artist = normalizeArtist(getMetadataValue(metadata, 'Artist'))

  if (
    !audioUrl ||
    !title ||
    !isSupportedAudio(imageInfo?.mime) ||
    !isAllowedLicense(metadata) ||
    (plan.requireVietnameseMetadata && !isVietnameseMetadata(page, metadata))
  ) {
    return null
  }

  return {
    title,
    artist,
    coverUrl: '',
    duration: '00:00',
    mood: plan.mood,
    audioUrl,
    masterAudio: {
      url: audioUrl,
      publicId: '',
      originalFilename: normalizeTitle(page?.title),
      format: trimString(imageInfo?.mime),
      resourceType: 'video',
      sizeBytes: 0,
      uploadedAt: null,
    },
    audioVariants: [
      {
        quality: 'normal',
        codec: trimString(imageInfo?.mime).split('/').pop() || 'audio',
        format: trimString(imageInfo?.mime).split('/').pop() || 'audio',
        bitrateKbps: 0,
        url: audioUrl,
        publicId: '',
        sizeBytes: 0,
        vipOnly: false,
        status: 'ready',
        errorMessage: '',
      },
    ],
    processingStatus: 'ready',
    sourceType: 'catalog',
    releaseStatus: 'published',
  }
}

const collectSongCandidates = async (limit) => {
  const candidates = []
  const seenAudioUrls = new Set()
  const seenTitleArtists = new Set()

  const pushCandidate = (candidate) => {
    if (!candidate) {
      return false
    }

    const titleArtistKey = `${candidate.title.toLowerCase()}::${candidate.artist.toLowerCase()}`

    if (seenAudioUrls.has(candidate.audioUrl) || seenTitleArtists.has(titleArtistKey)) {
      return false
    }

    seenAudioUrls.add(candidate.audioUrl)
    seenTitleArtists.add(titleArtistKey)
    candidates.push(candidate)

    return true
  }

  for (const plan of searchPlans) {
    for (const offset of [0, 20, 40]) {
      if (candidates.length >= limit) {
        return candidates
      }

      await new Promise((resolve) => {
        setTimeout(resolve, 350)
      })

      let payload = null

      try {
        payload = await fetchCommonsSearchPage(plan, offset)
      } catch (error) {
        console.warn(`Skipped Commons query "${plan.query}" at offset ${offset}: ${error.message}`)
        break
      }

      const pages = Object.values(payload?.query?.pages || {}).sort(
        (left, right) => (left.index || 0) - (right.index || 0),
      )

      for (const page of pages) {
        pushCandidate(mapCommonsPageToSongCandidate(page, plan))

        if (candidates.length >= limit) {
          return candidates
        }
      }
    }
  }

  for (const plan of categoryPlans) {
    let offset = ''

    for (let pageIndex = 0; pageIndex < 8; pageIndex += 1) {
      if (candidates.length >= limit) {
        return candidates
      }

      await new Promise((resolve) => {
        setTimeout(resolve, 350)
      })

      let payload = null

      try {
        payload = await fetchCommonsCategoryPage(plan, offset)
      } catch (error) {
        console.warn(`Skipped Commons category "${plan.category}": ${error.message}`)
        break
      }

      const pages = Object.values(payload?.query?.pages || {})

      for (const page of pages) {
        pushCandidate(mapCommonsPageToSongCandidate(page, plan))

        if (candidates.length >= limit) {
          return candidates
        }
      }

      offset = payload?.continue?.gcmcontinue || ''

      if (!offset) {
        break
      }
    }
  }

  return candidates
}

const getNextSortOrder = async () => {
  const lastSong = await Song.findOne().sort({ sortOrder: -1 }).select('sortOrder').lean()

  return Number.isFinite(lastSong?.sortOrder) ? lastSong.sortOrder + 1 : 0
}

const importCandidates = async (candidates) => {
  let createdCount = 0
  let skippedCount = 0
  let sortOrder = await getNextSortOrder()

  for (const candidate of candidates) {
    const existingSong = await Song.findOne({
      $or: [
        { audioUrl: candidate.audioUrl },
        {
          title: candidate.title,
          artist: candidate.artist,
          sourceType: 'catalog',
        },
      ],
    }).collation({ locale: 'en', strength: 2 })

    if (existingSong) {
      skippedCount += 1
      continue
    }

    await Song.create({
      ...candidate,
      sortOrder,
    })

    sortOrder += 1
    createdCount += 1
  }

  return {
    createdCount,
    skippedCount,
  }
}

const run = async () => {
  const limit = parseImportLimit()

  await connectDatabase()

  if (getDatabaseStatus() !== 'connected') {
    throw new Error('MongoDB is not connected.')
  }

  const candidates = await collectSongCandidates(limit)
  const result = await importCandidates(candidates)

  console.log(
    `Commons music import completed. Found ${candidates.length}, created ${result.createdCount}, skipped ${result.skippedCount}.`,
  )
}

run()
  .then(() => {
    process.exit(0)
  })
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
