import Album from '../models/Album.js'
import Artist from '../models/Artist.js'
import Chart from '../models/Chart.js'
import Radio from '../models/Radio.js'
import Song from '../models/Song.js'

const sortByOrder = { sortOrder: 1, createdAt: 1 }
const publishedSongFilter = { releaseStatus: 'published' }
const homeSectionLimit = 12

const trimString = (value, fallback = '') => {
  if (typeof value !== 'string') {
    return fallback
  }

  return value.trim()
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

const normalizeArtistNameKey = (value) => trimString(value).toLowerCase()

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

const listPopularArtists = async () => {
  const [curatedArtists, songArtists] = await Promise.all([
    Artist.find().sort(sortByOrder).limit(homeSectionLimit).lean(),
    getPopularArtistsFromSongs(),
  ])

  const mergedArtists = []
  const seenArtistNames = new Set()

  for (const artist of songArtists) {
    const name = trimString(artist.name)
    const key = normalizeArtistNameKey(name)

    if (!name || seenArtistNames.has(key)) {
      continue
    }

    seenArtistNames.add(key)
    mergedArtists.push({
      name,
      meta: trimString(artist.meta) || buildSongCountMeta(artist.songCount),
      imageUrl: trimString(artist.imageUrl),
      initials: buildInitials(name),
      artwork: '',
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

const listPopularAlbumsAndSingles = async () => {
  const songSingles = await Song.find(publishedSongFilter)
    .sort({
      sortOrder: 1,
      createdAt: -1,
    })
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

  return Album.find().sort(sortByOrder).limit(homeSectionLimit).lean()
}

export const getHomeContentData = async () => {
  const [songs, artists, albums, radios, charts] = await Promise.all([
    Song.find(publishedSongFilter).sort(sortByOrder).limit(homeSectionLimit).lean(),
    listPopularArtists(),
    listPopularAlbumsAndSingles(),
    Radio.find().sort(sortByOrder).limit(homeSectionLimit).lean(),
    Chart.find().sort(sortByOrder).limit(homeSectionLimit).lean(),
  ])

  return {
    songs,
    artists,
    albums,
    radios,
    charts,
  }
}

export const getSongList = async () => {
  return Song.find(publishedSongFilter).sort(sortByOrder).limit(12).lean()
}
