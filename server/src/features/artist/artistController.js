import { getDatabaseStatus } from '../../config/db.js'
import { getAuthenticatedUserById } from '../../services/authService.js'
import { listArtistReleasesByUserId } from '../../services/artistService.js'

const ensureDatabaseReady = (res) => {
  if (getDatabaseStatus() === 'connected') {
    return true
  }

  res.status(503).json({
    message: 'MongoDB is not connected yet.',
  })

  return false
}

export const getArtistMe = async (req, res, next) => {
  try {
    if (!ensureDatabaseReady(res)) {
      return
    }

    const user = await getAuthenticatedUserById(req.auth?.sub)

    if (!user || user.role !== 'artist') {
      return res.status(404).json({
        message: 'Artist account was not found.',
      })
    }

    return res.json({ user })
  } catch (error) {
    return next(error)
  }
}

export const listArtistReleases = async (req, res, next) => {
  try {
    if (!ensureDatabaseReady(res)) {
      return
    }

    return res.json(await listArtistReleasesByUserId(req.auth?.sub))
  } catch (error) {
    return next(error)
  }
}
