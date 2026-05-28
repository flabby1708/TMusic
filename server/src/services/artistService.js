import Podcast from '../models/Podcast.js'
import Song from '../models/Song.js'
import { mapTrackRecord } from './trackService.js'

const releaseSort = {
  updatedAt: -1,
  createdAt: -1,
}

const mapRelease = (item) => ({
  ...mapTrackRecord(item),
  contentType: 'song',
})

const mapPodcastRelease = (item) => ({
  id: item._id.toString(),
  contentType: 'podcast',
  title: item.title,
  showTitle: item.showTitle,
  artist: item.showTitle,
  host: item.host || '',
  category: item.category || 'Podcast',
  coverUrl: item.coverUrl || '',
  duration: item.duration || '00:00',
  audioUrl: item.audioUrl || item.audio?.url || '',
  releaseStatus: item.releaseStatus || 'draft',
  sourceType: item.sourceType || 'catalog',
  createdAt: item.createdAt || null,
  updatedAt: item.updatedAt || null,
})

export const listArtistReleasesByUserId = async (userId) => {
  const [songReleases, podcastReleases] = await Promise.all([
    Song.find({ ownerUserId: userId, sourceType: 'artist' }).sort(releaseSort).lean(),
    Podcast.find({ ownerUserId: userId, sourceType: 'artist' }).sort(releaseSort).lean(),
  ])
  const songs = songReleases.map(mapRelease)
  const podcasts = podcastReleases.map(mapPodcastRelease)
  const items = [...songs, ...podcasts].sort((left, right) => {
    const leftTime = new Date(left.updatedAt || left.createdAt || 0).getTime()
    const rightTime = new Date(right.updatedAt || right.createdAt || 0).getTime()

    return rightTime - leftTime
  })

  return {
    items,
    songs,
    podcasts,
    summary: {
      totalReleases: items.length,
      publishedReleases: items.filter((item) => item.releaseStatus === 'published').length,
      pendingReleases: items.filter((item) => item.releaseStatus === 'pending').length,
      draftReleases: items.filter((item) => item.releaseStatus === 'draft').length,
      songReleases: songs.length,
      podcastReleases: podcasts.length,
    },
  }
}
