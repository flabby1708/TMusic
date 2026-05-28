import { getDatabaseStatus } from '../../config/db.js'
import { getPublishedPodcastList } from '../../services/contentService.js'

export const getPodcasts = async (req, res, next) => {
  try {
    if (getDatabaseStatus() !== 'connected') {
      return res.status(503).json({
        message: 'MongoDB is not connected yet.',
        items: [],
        page: 1,
        limit: 30,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
      })
    }

    const payload = await getPublishedPodcastList({
      page: req.query.page,
      limit: req.query.limit,
      query: req.query.q,
    })

    return res.json(payload)
  } catch (error) {
    return next(error)
  }
}
