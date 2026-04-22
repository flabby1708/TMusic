import Song from '../models/Song.js'

const releaseSort = {
  updatedAt: -1,
  createdAt: -1,
}

const mapRelease = (item) => ({
  id: item._id.toString(),
  title: item.title,
  artist: item.artist,
  coverUrl: item.coverUrl || '',
  duration: item.duration || '00:00',
  mood: item.mood || '',
  audioUrl: item.audioUrl || '',
  releaseStatus: item.releaseStatus || 'draft',
  createdAt: item.createdAt,
  updatedAt: item.updatedAt,
})

export const listArtistReleasesByUserId = async (userId) => {
  const releases = await Song.find({ ownerUserId: userId }).sort(releaseSort).lean()
  const items = releases.map(mapRelease)

  return {
    items,
    summary: {
      totalReleases: items.length,
      publishedReleases: items.filter((item) => item.releaseStatus === 'published').length,
      pendingReleases: items.filter((item) => item.releaseStatus === 'pending').length,
      draftReleases: items.filter((item) => item.releaseStatus === 'draft').length,
    },
  }
}
