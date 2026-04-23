import { getDatabaseStatus } from '../../config/db.js'
import { getSongList } from '../../services/contentService.js'

export const getSongs = async (_req, res, next) => {
  try {
    if (getDatabaseStatus() !== 'connected') {
      return res.status(503).json({
        message: 'MongoDB is not connected yet.',
        items: [],
      })
    }

    const items = await getSongList()

    return res.json({ items })
  } catch (error) {
    return next(error)
  }
}
