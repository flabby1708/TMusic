import {
  createArtistTrackUploadSignature,
  uploadArtistTrackMasterFile,
} from '../../services/uploadService.js'
import { queueTrackAudioProcessing } from '../../services/audioProcessingService.js'
import {
  confirmArtistTrackMasterUpload,
  createArtistTrackDraft,
  findArtistOwnedTrack,
} from '../../services/trackService.js'

const resolveTrackStatusCode = (errorType) => {
  if (errorType === 'validation') {
    return 400
  }

  if (errorType === 'forbidden') {
    return 403
  }

  if (errorType === 'notFound') {
    return 404
  }

  return 400
}

const sendTrackResult = (res, result, successStatus = 200) => {
  if (result.errorType) {
    return res.status(resolveTrackStatusCode(result.errorType)).json({
      message: result.message,
    })
  }

  const { errorType: _errorType, item, message, ...rest } = result
  const payload = {
    ...rest,
  }

  if (message) {
    payload.message = message
  }

  if (item) {
    payload.item = item
  }

  return res.status(successStatus).json(payload)
}

const attachQueuedProcessingResult = async (result, track) => {
  if (result.errorType || !track) {
    return result
  }

  const queueResult = await queueTrackAudioProcessing({
    track,
  })

  result.processingQueued = queueResult.queued
  result.processingMessage = queueResult.message

  if (queueResult.item) {
    result.item = queueResult.item
  }

  return result
}

export const createArtistTrack = async (req, res, next) => {
  try {
    const result = await createArtistTrackDraft({
      ownerUser: req.artistUser,
      input: req.body,
    })

    return sendTrackResult(res, result, 201)
  } catch (error) {
    return next(error)
  }
}

export const createArtistTrackUpload = async (req, res, next) => {
  try {
    let trackId = ''
    let track = null

    if (req.body?.trackId) {
      const result = await findArtistOwnedTrack({
        trackId: req.body.trackId,
        ownerUserId: req.auth?.sub,
      })

      if (result.errorType) {
        return sendTrackResult(res, result)
      }

      track = result.item
      trackId = track._id.toString()
    }

    const { configError, upload } = createArtistTrackUploadSignature({
      artistId: req.auth?.sub,
      trackId,
    })

    if (configError) {
      return res.status(503).json({
        message: configError,
      })
    }

    return res.json({
      ...upload,
      resource: 'track',
      trackId,
      processingStatus: track?.processingStatus || 'draft',
      artistStatus: req.artistUser?.artistStatus || 'approved',
    })
  } catch (error) {
    return next(error)
  }
}

export const confirmArtistTrackUpload = async (req, res, next) => {
  try {
    const trackResult = await findArtistOwnedTrack({
      trackId: req.params.trackId,
      ownerUserId: req.auth?.sub,
    })

    if (trackResult.errorType) {
      return sendTrackResult(res, trackResult)
    }

    const result = await confirmArtistTrackMasterUpload({
      track: trackResult.item,
      uploadPayload: req.body,
    })

    return sendTrackResult(res, await attachQueuedProcessingResult(result, trackResult.item))
  } catch (error) {
    return next(error)
  }
}

export const uploadArtistTrackFile = async (req, res, next) => {
  try {
    const trackResult = await findArtistOwnedTrack({
      trackId: req.params.trackId,
      ownerUserId: req.auth?.sub,
    })

    if (trackResult.errorType) {
      return sendTrackResult(res, trackResult)
    }

    const uploadPayload = await uploadArtistTrackMasterFile({
      artistId: req.auth?.sub,
      trackId: req.params.trackId,
      file: req.file,
    })
    const result = await confirmArtistTrackMasterUpload({
      track: trackResult.item,
      uploadPayload,
    })

    return sendTrackResult(res, await attachQueuedProcessingResult(result, trackResult.item))
  } catch (error) {
    return next(error)
  }
}

export const processArtistTrack = async (req, res, next) => {
  try {
    const trackResult = await findArtistOwnedTrack({
      trackId: req.params.trackId,
      ownerUserId: req.auth?.sub,
    })

    if (trackResult.errorType) {
      return sendTrackResult(res, trackResult)
    }

    const queueResult = await queueTrackAudioProcessing({
      track: trackResult.item,
    })

    return sendTrackResult(res, {
      item: queueResult.item,
      processingQueued: queueResult.queued,
      processingMessage: queueResult.message,
    })
  } catch (error) {
    return next(error)
  }
}
