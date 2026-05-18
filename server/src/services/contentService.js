import Album from '../models/Album.js'
import Artist from '../models/Artist.js'
import Chart from '../models/Chart.js'
import Radio from '../models/Radio.js'
import Song from '../models/Song.js'

const sortByOrder = { sortOrder: 1, createdAt: 1 }
const sortByNewest = { createdAt: -1, sortOrder: -1 }
const publishedSongFilter = { releaseStatus: 'published' }
const homeSectionLimit = 12
const homeCacheTtlMs = 60 * 1000
const homeSongFields = 'title artist duration explicit coverUrl audioUrl audioVariants videoUrl musicVideo mood artwork sortOrder'
const homeCache = new Map()

const trimString = (value, fallback = '') => {
  if (typeof value !== 'string') {
    return fallback
  }

  return value.trim()
}

const getCachedHomeSection = async (key, loader) => {
  const cached = homeCache.get(key)

  if (cached && Date.now() - cached.createdAt < homeCacheTtlMs) {
    return cached.data
  }

  const data = await loader()

  homeCache.set(key, {
    createdAt: Date.now(),
    data,
  })

  return data
}

const buildInitials = (value) => {
  const initials = trimString(value)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((item) => item[0]?.toUpperCase() || '')
    .join('')

  return initials || 'TM'
}

const buildSongCountMeta = (count) => {
  const safeCount = Number.isFinite(count) && count > 0 ? count : 0

  return safeCount === 1 ? '1 bài hát' : `${safeCount} bài hát`
}

const normalizeArtistNameKey = (value) =>
  trimString(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
const getArtistLookupKeys = (value) =>
  [
    value,
    ...trimString(value)
      .split(/\/|,|&|\s+feat\.?\s+|\s+ft\.?\s+/i)
      .map((item) => item.trim()),
  ]
    .map(normalizeArtistNameKey)
    .filter(Boolean)
const artistProfileFields = 'name meta aliases realName bio statsLabel sourceLabel sourceUrl verified credits imageUrl initials artwork sortOrder'

const queryHomeSongs = () =>
  Song.find(publishedSongFilter)
    .sort(sortByNewest)
    .limit(homeSectionLimit)
    .select(homeSongFields)
    .lean()

const getPopularArtistsFromSongs = async () => {
  return Song.aggregate([
    {
      $match: {
        ...publishedSongFilter,
        artist: { $type: 'string', $ne: '' },
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $group: {
        _id: '$artist',
        songCount: { $sum: 1 },
        latestSongAt: { $max: '$createdAt' },
        coverUrls: { $push: '$coverUrl' },
      },
    },
    {
      $project: {
        _id: 0,
        name: '$_id',
        meta: {
          $cond: [
            { $eq: ['$songCount', 1] },
            '1 bài hát',
            { $concat: [{ $toString: '$songCount' }, ' bài hát'] },
          ],
        },
        imageUrl: {
          $ifNull: [
            {
              $first: {
                $filter: {
                  input: '$coverUrls',
                  as: 'coverUrl',
                  cond: { $ne: ['$$coverUrl', ''] },
                },
              },
            },
            '',
          ],
        },
        initials: '',
        artwork: '',
        songCount: 1,
        latestSongAt: 1,
      },
    },
    {
      $sort: {
        songCount: -1,
        latestSongAt: -1,
        name: 1,
      },
    },
    {
      $limit: homeSectionLimit,
    },
  ])
}

const queryPopularArtists = async () => {
  const songArtists = await getPopularArtistsFromSongs()
  const curatedArtists = await Artist.find()
    .sort(sortByOrder)
    .limit(homeSectionLimit * 4)
    .select(artistProfileFields)
    .lean()
  const findCuratedArtist = (name) => {
    const lookupKeys = getArtistLookupKeys(name)

    return curatedArtists.find((artist) => {
      const artistKeys = getArtistLookupKeys(artist.name)
      artistKeys.push(
        ...(Array.isArray(artist.aliases) ? artist.aliases.map(normalizeArtistNameKey).filter(Boolean) : []),
      )

      return artistKeys.some((artistKey) =>
        lookupKeys.some((lookupKey) =>
          artistKey === lookupKey ||
          (artistKey.length >= 3 && lookupKey.includes(artistKey)) ||
          (lookupKey.length >= 3 && artistKey.includes(lookupKey)),
        ),
      )
    })
  }
  const mergedArtists = []
  const seenArtistNames = new Set()

  for (const artist of songArtists) {
    const name = trimString(artist.name)
    const key = normalizeArtistNameKey(name)

    if (!name || seenArtistNames.has(key)) {
      continue
    }

    seenArtistNames.add(key)
    const curatedArtist = findCuratedArtist(name)
    const displayName = trimString(curatedArtist?.name) || name
    mergedArtists.push({
      ...(curatedArtist || {}),
      name: displayName,
      meta: trimString(curatedArtist?.meta) || trimString(artist.meta) || buildSongCountMeta(artist.songCount),
      imageUrl: trimString(curatedArtist?.imageUrl) || trimString(artist.imageUrl),
      initials: trimString(curatedArtist?.initials) || buildInitials(displayName),
      artwork: trimString(curatedArtist?.artwork),
    })
  }

  if (mergedArtists.length > 0) {
    return mergedArtists.slice(0, homeSectionLimit)
  }

  for (const artist of curatedArtists) {
    const name = trimString(artist.name)
    const key = normalizeArtistNameKey(name)

    if (!name || seenArtistNames.has(key)) {
      continue
    }

    seenArtistNames.add(key)
    mergedArtists.push({
      ...artist,
      name,
      meta: trimString(artist.meta, 'Nghệ sĩ') || 'Nghệ sĩ',
      initials: trimString(artist.initials) || buildInitials(name),
    })
  }

  return mergedArtists.slice(0, homeSectionLimit)
}

const queryPopularAlbumsAndSingles = async () => {
  const songSingles = await Song.find(publishedSongFilter)
    .sort(sortByNewest)
    .limit(homeSectionLimit)
    .select('title artist coverUrl sortOrder createdAt')
    .lean()

  if (songSingles.length > 0) {
    return songSingles.map((song) => ({
      title: trimString(song.title),
      artist: trimString(song.artist),
      coverUrl: trimString(song.coverUrl),
      artwork: '',
      sortOrder: song.sortOrder,
      sourceType: 'single',
    }))
  }

  return Album.find()
    .sort(sortByOrder)
    .limit(homeSectionLimit)
    .select('title artist coverUrl artwork sortOrder')
    .lean()
}

const queryHomeRadios = () =>
  Radio.find()
    .sort(sortByOrder)
    .limit(homeSectionLimit)
    .select('title description imageUrl tone initials sortOrder')
    .lean()

const queryHomeCharts = () =>
  Chart.find()
    .sort(sortByOrder)
    .limit(homeSectionLimit)
    .select('title subtitle coverUrl artwork sortOrder')
    .lean()

export const getHomeSongs = () => getCachedHomeSection('home:songs', queryHomeSongs)

export const getHomePopularArtists = () =>
  getCachedHomeSection('home:popular-artists', queryPopularArtists)

export const getHomeAlbums = () =>
  getCachedHomeSection('home:albums', queryPopularAlbumsAndSingles)

export const getHomeRadios = () => getCachedHomeSection('home:radios', queryHomeRadios)

export const getHomeCharts = () => getCachedHomeSection('home:charts', queryHomeCharts)

export const getHomeContentData = async () => {
  const [songs, artists, albums, radios, charts] = await Promise.all([
    getHomeSongs(),
    getHomePopularArtists(),
    getHomeAlbums(),
    getHomeRadios(),
    getHomeCharts(),
  ])

  return {
    songs,
    artists,
    albums,
    radios,
    charts,
  }
}

export const getSongList = () => getHomeSongs()

const parsePositiveInteger = (value, fallback) => {
  const parsed = Number.parseInt(String(value || '').trim(), 10)

  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

export const getPaginatedSongList = async ({ page = 1, limit = 30, query = '' } = {}) => {
  const currentPage = parsePositiveInteger(page, 1)
  const pageSize = Math.min(parsePositiveInteger(limit, 30), 50)
  const skip = (currentPage - 1) * pageSize
  const normalizedQuery = trimString(query)
  const filter = { ...publishedSongFilter }

  if (normalizedQuery) {
    filter.$text = { $search: normalizedQuery }
  }

  const sort = normalizedQuery
    ? { score: { $meta: 'textScore' }, sortOrder: 1, createdAt: -1 }
    : { sortOrder: 1, createdAt: -1 }
  const projection = normalizedQuery ? { score: { $meta: 'textScore' } } : {}

  const [items, total] = await Promise.all([
    Song.find(filter, projection).sort(sort).skip(skip).limit(pageSize).lean(),
    Song.countDocuments(filter),
  ])

  return {
    items,
    page: currentPage,
    limit: pageSize,
    total,
    totalPages: Math.ceil(total / pageSize),
    hasNextPage: currentPage * pageSize < total,
  }
}
