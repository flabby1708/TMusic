import { getDatabaseStatus } from '../../config/db.js'
import {
  getHomeAlbums,
  getHomeCharts,
  getHomeContentData,
  getHomePopularArtists,
  getHomeRadios,
  getHomeSongs,
} from '../../services/contentService.js'

const ensureDatabaseReady = (res) => {
  if (getDatabaseStatus() === 'connected') {
    return true
  }

  res.status(503).json({
    message: 'MongoDB is not connected yet.',
  })

  return false
}

const createHomeSectionHandler = (loader, responseKey) => async (_req, res, next) => {
  try {
    if (!ensureDatabaseReady(res)) {
      return
    }

    return res.json({
      [responseKey]: await loader(),
    })
  } catch (error) {
    return next(error)
  }
}

export const getHomeContent = async (_req, res, next) => {
  try {
    if (!ensureDatabaseReady(res)) {
      return
    }

    return res.json(await getHomeContentData())
  } catch (error) {
    return next(error)
  }
}

export const getHomeSongItems = createHomeSectionHandler(getHomeSongs, 'songs')
export const getHomePopularArtistItems = createHomeSectionHandler(
  getHomePopularArtists,
  'artists',
)
export const getHomeAlbumItems = createHomeSectionHandler(getHomeAlbums, 'albums')
export const getHomeRadioItems = createHomeSectionHandler(getHomeRadios, 'radios')
export const getHomeChartItems = createHomeSectionHandler(getHomeCharts, 'charts')
