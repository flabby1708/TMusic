import { getDatabaseStatus } from '../config/db.js'
import { getHomeContentData } from '../services/contentService.js'

export const getHomeContent = async (_req, res, next) => {
  try {
    if (getDatabaseStatus() !== 'connected') {
      return res.status(503).json({
        message: 'MongoDB is not connected yet.',
      })
    }

    return res.json(await getHomeContentData())
  } catch (error) {
    return next(error)
  }
}
