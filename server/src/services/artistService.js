import Song from '../models/Song.js'
import { mapTrackRecord } from './trackService.js'

const releaseSort = {
  updatedAt: -1,
  createdAt: -1,
}

const mapRelease = (item) => mapTrackRecord(item)

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
