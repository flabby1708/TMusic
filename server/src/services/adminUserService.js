import User from '../models/User.js'
import { normalizeUserSubscription } from '../utils/subscription.js'

const trimString = (value) => (typeof value === 'string' ? value.trim() : '')

const allowedRoles = new Set(['user', 'artist', 'admin'])
const allowedAccountStatuses = new Set(['active', 'suspended', 'deleted'])

const serializeUser = (user) => {
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
    suspendedReason: user.suspendedReason || '',
    suspendedAt: user.suspendedAt || null,
    artistStatus: user.artistStatus,
    artistProfile: user.artistProfile || {},
    subscription: normalizeUserSubscription(user.subscription),
    authProviders: user.authProviders || {},
    lastLoginAt: user.lastLoginAt || null,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }
}

export const listAdminUsers = async ({ query = '', role = '' } = {}) => {
  const normalizedQuery = trimString(query)
  const normalizedRole = trimString(role)
  const filter = {}

  if (normalizedRole && allowedRoles.has(normalizedRole)) {
    filter.role = normalizedRole
  }

  if (normalizedQuery) {
    filter.$or = [
      { displayName: { $regex: normalizedQuery, $options: 'i' } },
      { email: { $regex: normalizedQuery, $options: 'i' } },
      { phoneNumber: { $regex: normalizedQuery, $options: 'i' } },
      { 'artistProfile.stageName': { $regex: normalizedQuery, $options: 'i' } },
      { 'artistProfile.bio': { $regex: normalizedQuery, $options: 'i' } },
    ]
  }

  const users = await User.find(filter)
    .sort({ createdAt: -1 })
    .lean()

  return {
    items: users.map(serializeUser),
  }
}

export const getAdminUserById = async (id) => {
  const user = await User.findById(id).lean()
  return serializeUser(user)
}

export const updateAdminUserStatus = async (id, payload = {}) => {
  const accountStatus = trimString(payload.accountStatus)

  if (!allowedAccountStatuses.has(accountStatus)) {
    return {
      validationMessage: 'Trang thai tai khoan khong hop le.',
      item: null,
    }
  }

  const update = {
    accountStatus,
  }

  if (accountStatus === 'suspended') {
    update.suspendedReason = trimString(payload.suspendedReason)
    update.suspendedAt = new Date()
  } else {
    update.suspendedReason = ''
    update.suspendedAt = null
  }

  const user = await User.findByIdAndUpdate(id, update, {
    new: true,
    runValidators: true,
  }).lean()

  return {
    validationMessage: '',
    item: serializeUser(user),
  }
}

export const updateAdminUserRole = async (id, payload = {}) => {
  const role = trimString(payload.role)

  if (!allowedRoles.has(role)) {
    return {
      validationMessage: 'Vai tro khong hop le.',
      item: null,
    }
  }

  const update = { role }

  if (role === 'artist') {
    update.artistStatus = payload.artistStatus || 'pending'
  }

  if (role === 'user') {
    update.artistStatus = 'none'
  }

  const user = await User.findByIdAndUpdate(id, update, {
    new: true,
    runValidators: true,
  }).lean()

  return {
    validationMessage: '',
    item: serializeUser(user),
  }
}

export const updateAdminUserSubscription = async (id, payload = {}) => {
  const subscription = normalizeUserSubscription(payload.subscription || payload)

  const user = await User.findByIdAndUpdate(
    id,
    {
      subscription,
    },
    {
      new: true,
      runValidators: true,
    },
  ).lean()

  return {
    validationMessage: '',
    item: serializeUser(user),
  }
}
