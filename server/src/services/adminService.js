import Album from '../models/Album.js'
import Artist from '../models/Artist.js'
import Chart from '../models/Chart.js'
import Radio from '../models/Radio.js'
import Song from '../models/Song.js'

const sortByOrder = { sortOrder: 1, createdAt: 1 }

const trimString = (value, fallback = '') => {
  if (typeof value !== 'string') {
    return fallback
  }

  return value.trim()
}

const parseSortOrder = (value) => {
  const parsed = Number.parseInt(value, 10)

  return Number.isFinite(parsed) ? parsed : 0
}

const parseInitials = (value) => {
  if (Array.isArray(value)) {
    return value
      .map((item) => trimString(item))
      .filter(Boolean)
  }

  return trimString(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

const resourceConfig = {
  songs: {
    model: Song,
    sanitize(payload) {
      return {
        title: trimString(payload.title),
        artist: trimString(payload.artist),
        coverUrl: trimString(payload.coverUrl),
        duration: trimString(payload.duration, '00:00') || '00:00',
        mood: trimString(payload.mood, 'Chill') || 'Chill',
        sortOrder: parseSortOrder(payload.sortOrder),
      }
    },
    validate(payload) {
      if (!payload.title || !payload.artist) {
        return 'Song title and artist are required.'
      }

      return ''
    },
  },
  artists: {
    model: Artist,
    sanitize(payload) {
      return {
        name: trimString(payload.name),
        meta: trimString(payload.meta, 'Nghe si') || 'Nghe si',
        imageUrl: trimString(payload.imageUrl),
        initials: trimString(payload.initials),
        artwork: trimString(payload.artwork),
        sortOrder: parseSortOrder(payload.sortOrder),
      }
    },
    validate(payload) {
      if (!payload.name) {
        return 'Artist name is required.'
      }

      return ''
    },
  },
  albums: {
    model: Album,
    sanitize(payload) {
      return {
        title: trimString(payload.title),
        artist: trimString(payload.artist),
        coverUrl: trimString(payload.coverUrl),
        artwork: trimString(payload.artwork),
        sortOrder: parseSortOrder(payload.sortOrder),
      }
    },
    validate(payload) {
      if (!payload.title || !payload.artist) {
        return 'Album title and artist are required.'
      }

      return ''
    },
  },
  radios: {
    model: Radio,
    sanitize(payload) {
      return {
        title: trimString(payload.title),
        description: trimString(payload.description),
        imageUrl: trimString(payload.imageUrl),
        tone: trimString(payload.tone),
        initials: parseInitials(payload.initials),
        sortOrder: parseSortOrder(payload.sortOrder),
      }
    },
    validate(payload) {
      if (!payload.title || !payload.description) {
        return 'Radio title and description are required.'
      }

      return ''
    },
  },
  charts: {
    model: Chart,
    sanitize(payload) {
      return {
        title: trimString(payload.title),
        subtitle: trimString(payload.subtitle),
        coverUrl: trimString(payload.coverUrl),
        artwork: trimString(payload.artwork),
        sortOrder: parseSortOrder(payload.sortOrder),
      }
    },
    validate(payload) {
      if (!payload.title || !payload.subtitle) {
        return 'Chart title and subtitle are required.'
      }

      return ''
    },
  },
}

export const getAdminResourceConfig = (resource) => resourceConfig[resource]

export const listAdminResourceItems = async (resource) => {
  const config = getAdminResourceConfig(resource)

  if (!config) {
    return null
  }

  const items = await config.model.find().sort(sortByOrder).lean()

  return {
    items,
  }
}

export const createAdminResourceItem = async (resource, body) => {
  const config = getAdminResourceConfig(resource)

  if (!config) {
    return null
  }

  const payload = config.sanitize(body)
  const validationMessage = config.validate(payload)

  return {
    validationMessage,
    item: validationMessage ? null : await config.model.create(payload),
  }
}

export const updateAdminResourceItem = async (resource, id, body) => {
  const config = getAdminResourceConfig(resource)

  if (!config) {
    return null
  }

  const payload = config.sanitize(body)
  const validationMessage = config.validate(payload)

  if (validationMessage) {
    return {
      validationMessage,
      item: null,
    }
  }

  const item = await config.model.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  })

  return {
    validationMessage: '',
    item,
  }
}

export const deleteAdminResourceItem = async (resource, id) => {
  const config = getAdminResourceConfig(resource)

  if (!config) {
    return null
  }

  const item = await config.model.findByIdAndDelete(id)

  return { item }
}
