import User from '../models/User.js'

const trimString = (value) => (typeof value === 'string' ? value.trim() : '')

const artistStatuses = new Set(['pending', 'approved', 'rejected', 'suspended'])

const serializeArtistApplication = (user) => {
  if (!user) {
    return null
  }

  return {
    _id: String(user._id),
    displayName: user.displayName,
    email: user.email,
    phoneNumber: user.phoneNumber || '',
    avatarUrl: user.avatarUrl || '',
    role: user.role,
    accountStatus: user.accountStatus || 'active',
    artistStatus: user.artistStatus || 'none',
    artistProfile: user.artistProfile || {},
    artistReview: user.artistReview || {},
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }
}

export const listArtistApplications = async ({ query = '', status = '' } = {}) => {
  const normalizedQuery = trimString(query)
  const normalizedStatus = trimString(status)

  const filter = {
    role: 'artist',
  }

  if (normalizedStatus && artistStatuses.has(normalizedStatus)) {
    filter.artistStatus = normalizedStatus
  }

  if (normalizedQuery) {
    filter.$or = [
      { displayName: { $regex: normalizedQuery, $options: 'i' } },
      { email: { $regex: normalizedQuery, $options: 'i' } },
      { 'artistProfile.stageName': { $regex: normalizedQuery, $options: 'i' } },
      { 'artistProfile.bio': { $regex: normalizedQuery, $options: 'i' } },
    ]
  }

  const users = await User.find(filter).sort({ createdAt: -1 }).lean()

  return {
    items: users.map(serializeArtistApplication),
  }
}

export const getArtistApplicationById = async (id) => {
  const user = await User.findOne({
    _id: id,
    role: 'artist',
  }).lean()

  return serializeArtistApplication(user)
}

export const approveArtistApplication = async (id, adminId, payload = {}) => {
  const adminNote = trimString(payload.adminNote)

  const user = await User.findOneAndUpdate(
    {
      _id: id,
      role: 'artist',
    },
    {
      artistStatus: 'approved',
      'artistReview.reviewedBy': adminId || null,
      'artistReview.reviewedAt': new Date(),
      'artistReview.rejectionReason': '',
      'artistReview.suspensionReason': '',
      'artistReview.adminNote': adminNote,
    },
    {
      new: true,
      runValidators: true,
    },
  ).lean()

  return serializeArtistApplication(user)
}

export const rejectArtistApplication = async (id, adminId, payload = {}) => {
  const rejectionReason = trimString(payload.rejectionReason)
  const adminNote = trimString(payload.adminNote)

  if (!rejectionReason) {
    return {
      validationMessage: 'Vui long nhap ly do tu choi nghe si.',
      item: null,
    }
  }

  const user = await User.findOneAndUpdate(
    {
      _id: id,
      role: 'artist',
    },
    {
      artistStatus: 'rejected',
      'artistReview.reviewedBy': adminId || null,
      'artistReview.reviewedAt': new Date(),
      'artistReview.rejectionReason': rejectionReason,
      'artistReview.suspensionReason': '',
      'artistReview.adminNote': adminNote,
    },
    {
      new: true,
      runValidators: true,
    },
  ).lean()

  return {
    validationMessage: '',
    item: serializeArtistApplication(user),
  }
}

export const suspendArtistApplication = async (id, adminId, payload = {}) => {
  const suspensionReason = trimString(payload.suspensionReason)
  const adminNote = trimString(payload.adminNote)

  if (!suspensionReason) {
    return {
      validationMessage: 'Vui long nhap ly do tam khoa nghe si.',
      item: null,
    }
  }

  const user = await User.findOneAndUpdate(
    {
      _id: id,
      role: 'artist',
    },
    {
      artistStatus: 'suspended',
      'artistReview.reviewedBy': adminId || null,
      'artistReview.reviewedAt': new Date(),
      'artistReview.suspensionReason': suspensionReason,
      'artistReview.adminNote': adminNote,
    },
    {
      new: true,
      runValidators: true,
    },
  ).lean()

  return {
    validationMessage: '',
    item: serializeArtistApplication(user),
  }
}