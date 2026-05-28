import { getDatabaseStatus } from '../../config/db.js'
import { cleanupUploadedFiles } from '../../middleware/uploadMiddleware.js'
import {
  createArtistSongSubmission,
  importArtistPodcasts,
  importArtistSongs,
  updateArtistSongSubmission,
} from '../../services/adminService.js'
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

export const importArtistSongItems = async (req, res, next) => {
  try {
    if (!ensureDatabaseReady(res)) {
      return
    }

    const payload = await importArtistSongs({
      body: req.body,
      audioFiles: req.files?.audioFiles || [],
      coverFiles: req.files?.coverFiles || [],
      ownerUser: req.artistUser,
    })

    return res.status(201).json(payload)
  } catch (error) {
    return next(error)
  } finally {
    await cleanupUploadedFiles(req.files)
  }
}

export const createArtistSongItem = async (req, res, next) => {
  try {
    if (!ensureDatabaseReady(res)) {
      return
    }

    const result = await createArtistSongSubmission({
      body: req.body,
      ownerUser: req.artistUser,
      audioFile: req.files?.audioFile?.[0] || null,
      coverFile: req.files?.coverFile?.[0] || null,
      videoFile: req.files?.videoFile?.[0] || null,
    })

    if (result.validationMessage) {
      return res.status(400).json({
        message: result.validationMessage,
      })
    }

    return res.status(201).json({
      item: result.item,
      message: result.message,
    })
  } catch (error) {
    return next(error)
  } finally {
    await cleanupUploadedFiles(req.files)
  }
}

export const updateArtistSongItem = async (req, res, next) => {
  try {
    if (!ensureDatabaseReady(res)) {
      return
    }

    const result = await updateArtistSongSubmission({
      songId: req.params.songId,
      body: req.body,
      ownerUser: req.artistUser,
      audioFile: req.files?.audioFile?.[0] || null,
      coverFile: req.files?.coverFile?.[0] || null,
      videoFile: req.files?.videoFile?.[0] || null,
    })

    if (result?.notFound) {
      return res.status(404).json({
        message: 'Không tìm thấy bài hát thuộc tài khoản nghệ sĩ này.',
      })
    }

    if (result.validationMessage) {
      return res.status(400).json({
        message: result.validationMessage,
      })
    }

    return res.json({
      item: result.item,
      message: result.message,
    })
  } catch (error) {
    return next(error)
  } finally {
    await cleanupUploadedFiles(req.files)
  }
}

export const importArtistPodcastItems = async (req, res, next) => {
  try {
    if (!ensureDatabaseReady(res)) {
      return
    }

    const payload = await importArtistPodcasts({
      body: req.body,
      audioFiles: req.files?.audioFiles || [],
      coverFiles: req.files?.coverFiles || [],
      ownerUser: req.artistUser,
    })

    return res.status(201).json(payload)
  } catch (error) {
    return next(error)
  } finally {
    await cleanupUploadedFiles(req.files)
  }
}
