import bcrypt from 'bcryptjs'
import User from '../models/User.js'
import {
  buildPublicSubscription,
  buildUserEntitlements,
} from '../utils/subscription.js'
import { signUserToken } from '../utils/authToken.js'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_PATTERN = /^\+?[1-9]\d{8,14}$/
const PASSWORD_MIN_LENGTH = 8
const SALT_ROUNDS = 12
const ARTIST_STATUS_PENDING = 'pending'

const SOCIAL_PROVIDER_FIELDS = {
  google: 'googleId',
  facebook: 'facebookId',
  apple: 'appleId',
}

const trimString = (value) => (typeof value === 'string' ? value.trim() : '')
const normalizeEmail = (value) => trimString(value).toLowerCase()

export const normalizePhoneNumber = (value) => {
  const trimmedValue = trimString(value)

  if (!trimmedValue) {
    return ''
  }

  if (trimmedValue.startsWith('+')) {
    return `+${trimmedValue.slice(1).replace(/\D/g, '')}`
  }

  return trimmedValue.replace(/\D/g, '')
}

const isValidEmail = (value) => EMAIL_PATTERN.test(value)
export const isValidPhoneNumber = (value) => PHONE_PATTERN.test(value)

const toPublicUser = (user) => ({
  id: user._id.toString(),
  displayName: user.displayName,
  email: user.email,
  role: user.role,
  artistStatus: user.artistStatus || 'none',
  artistProfile: {
    stageName: user.artistProfile?.stageName || '',
    bio: user.artistProfile?.bio || '',
  },
  avatarUrl: user.avatarUrl || '',
  phoneNumber: user.phoneNumber || '',
  subscription: buildPublicSubscription(user.subscription),
  entitlements: buildUserEntitlements(user.subscription),
  authProviders: {
    google: Boolean(user.authProviders?.googleId),
    facebook: Boolean(user.authProviders?.facebookId),
    apple: Boolean(user.authProviders?.appleId),
    phone: Boolean(user.authProviders?.phoneVerified),
  },
  lastLoginAt: user.lastLoginAt,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
})

const sanitizeRegisterPayload = (payload = {}) => ({
  displayName: trimString(payload.displayName),
  email: normalizeEmail(payload.email),
  password: typeof payload.password === 'string' ? payload.password : '',
})

const sanitizeArtistRegisterPayload = (payload = {}) => ({
  displayName: trimString(payload.displayName),
  email: normalizeEmail(payload.email),
  password: typeof payload.password === 'string' ? payload.password : '',
  stageName: trimString(payload.stageName),
  bio: trimString(payload.bio),
})

const sanitizeLoginPayload = (payload = {}) => ({
  email: normalizeEmail(payload.email),
  password: typeof payload.password === 'string' ? payload.password : '',
})

const buildFailure = (errorType, message) => ({
  errorType,
  message,
  token: '',
  user: null,
})

export const buildAuthSuccess = (message, user) => ({
  errorType: '',
  message,
  token: signUserToken(user),
  user: toPublicUser(user),
})

const validateRegisterPayload = ({ displayName, email, password }) => {
  if (!displayName || !email || !password) {
    return 'Vui long nhap day du ten hien thi, email va mat khau.'
  }

  if (displayName.length < 2) {
    return 'Ten hien thi phai co it nhat 2 ky tu.'
  }

  if (!isValidEmail(email)) {
    return 'Email khong dung dinh dang.'
  }

  if (password.length < PASSWORD_MIN_LENGTH) {
    return `Mat khau phai co it nhat ${PASSWORD_MIN_LENGTH} ky tu.`
  }

  return ''
}

const validateArtistRegisterPayload = ({ displayName, email, password, stageName }) => {
  const registerValidationMessage = validateRegisterPayload({
    displayName,
    email,
    password,
  })

  if (registerValidationMessage) {
    return registerValidationMessage
  }

  if (!stageName) {
    return 'Vui long nhap nghe danh hoac ten nghe si.'
  }

  if (stageName.length < 2) {
    return 'Nghe danh phai co it nhat 2 ky tu.'
  }

  return ''
}

const validateLoginPayload = ({ email, password }) => {
  if (!email || !password) {
    return 'Vui long nhap email va mat khau.'
  }

  if (!isValidEmail(email)) {
    return 'Email khong dung dinh dang.'
  }

  return ''
}

const buildPlaceholderEmail = (prefix, uniqueValue) =>
  `${prefix}-${uniqueValue.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}@tmusic.local`

const getFallbackDisplayName = (displayName, fallbackEmail) =>
  trimString(displayName) || fallbackEmail.split('@')[0]

const buildArtistProfile = ({ displayName, stageName, bio }) => ({
  stageName: stageName || displayName,
  bio,
})

export const registerUser = async (body) => {
  const payload = sanitizeRegisterPayload(body)
  const validationMessage = validateRegisterPayload(payload)

  if (validationMessage) {
    return buildFailure('validation', validationMessage)
  }

  const existingUser = await User.findOne({ email: payload.email }).lean()

  if (existingUser) {
    return buildFailure('conflict', 'Email nay da duoc su dung.')
  }

  const passwordHash = await bcrypt.hash(payload.password, SALT_ROUNDS)
  const user = await User.create({
    displayName: payload.displayName,
    email: payload.email,
    passwordHash,
  })

  return buildAuthSuccess('Dang ky thanh cong.', user)
}

export const registerArtistUser = async (body) => {
  const payload = sanitizeArtistRegisterPayload(body)
  const validationMessage = validateArtistRegisterPayload(payload)

  if (validationMessage) {
    return buildFailure('validation', validationMessage)
  }

  const existingUser = await User.findOne({ email: payload.email }).lean()

  if (existingUser) {
    return buildFailure('conflict', 'Email nay da duoc su dung.')
  }

  const passwordHash = await bcrypt.hash(payload.password, SALT_ROUNDS)
  const user = await User.create({
    displayName: payload.displayName,
    email: payload.email,
    passwordHash,
    role: 'artist',
    artistStatus: ARTIST_STATUS_PENDING,
    artistProfile: buildArtistProfile(payload),
  })

  return buildAuthSuccess('Dang ky nghe si thanh cong. Ho so dang cho duyet.', user)
}

const loginUserByRole = async (
  body,
  {
    requiredRole = '',
    forbiddenMessage = 'Tai khoan nay khong dung vai tro.',
    successMessage = 'Dang nhap thanh cong.',
  } = {},
) => {
  const payload = sanitizeLoginPayload(body)
  const validationMessage = validateLoginPayload(payload)

  if (validationMessage) {
    return buildFailure('validation', validationMessage)
  }

  const user = await User.findOne({ email: payload.email }).select('+passwordHash')

  if (!user || !user.passwordHash) {
    return buildFailure('credentials', 'Email hoac mat khau khong dung.')
  }

  const isPasswordValid = await bcrypt.compare(payload.password, user.passwordHash)

  if (!isPasswordValid) {
    return buildFailure('credentials', 'Email hoac mat khau khong dung.')
  }

  if (requiredRole && user.role !== requiredRole) {
    return buildFailure('forbidden', forbiddenMessage)
  }

  user.lastLoginAt = new Date()
  await user.save()

  return buildAuthSuccess(successMessage, user)
}

export const loginUser = async (body) =>
  loginUserByRole(body, {
    requiredRole: 'user',
    forbiddenMessage: 'Tai khoan nay khong thuoc cong nguoi nghe.',
    successMessage: 'Dang nhap thanh cong.',
  })

export const loginArtistUser = async (body) =>
  loginUserByRole(body, {
    requiredRole: 'artist',
    forbiddenMessage: 'Tai khoan nay khong thuoc cong nghe si.',
    successMessage: 'Dang nhap nghe si thanh cong.',
  })

export const loginAdminUser = async (body) =>
  loginUserByRole(body, {
    requiredRole: 'admin',
    forbiddenMessage: 'Tai khoan nay khong co quyen truy cap trang quan tri.',
    successMessage: 'Dang nhap quan tri thanh cong.',
  })

export const findOrCreatePhoneUser = async ({ phoneNumber, displayName }) => {
  const normalizedPhoneNumber = normalizePhoneNumber(phoneNumber)

  if (!isValidPhoneNumber(normalizedPhoneNumber)) {
    return buildFailure('validation', 'So dien thoai khong hop le.')
  }

  const existingUser = await User.findOne({ phoneNumber: normalizedPhoneNumber })

  if (existingUser) {
    existingUser.authProviders.phoneVerified = true
    existingUser.lastLoginAt = new Date()
    await existingUser.save()

    return buildAuthSuccess('Dang nhap bang so dien thoai thanh cong.', existingUser)
  }

  const fallbackEmail = buildPlaceholderEmail('phone', normalizedPhoneNumber)
  const user = await User.create({
    displayName: getFallbackDisplayName(displayName, fallbackEmail),
    email: fallbackEmail,
    phoneNumber: normalizedPhoneNumber,
    authProviders: {
      phoneVerified: true,
    },
    lastLoginAt: new Date(),
  })

  return buildAuthSuccess('Xac thuc so dien thoai thanh cong.', user)
}

export const findOrCreateSocialUser = async ({
  provider,
  providerUserId,
  email,
  displayName,
  avatarUrl,
}) => {
  const providerField = SOCIAL_PROVIDER_FIELDS[provider]
  const providerQueryField = `authProviders.${providerField}`

  if (!providerField || !providerUserId) {
    return buildFailure('validation', 'Thong tin nha cung cap dang nhap khong hop le.')
  }

  const normalizedEmail = normalizeEmail(email)
  const safeEmail = isValidEmail(normalizedEmail)
    ? normalizedEmail
    : buildPlaceholderEmail(provider, providerUserId)
  const safeDisplayName = getFallbackDisplayName(displayName, safeEmail)

  let user = await User.findOne({ [providerQueryField]: providerUserId })

  if (!user && isValidEmail(normalizedEmail)) {
    user = await User.findOne({ email: normalizedEmail })
  }

  if (!user) {
    user = await User.create({
      displayName: safeDisplayName,
      email: safeEmail,
      avatarUrl: trimString(avatarUrl),
      authProviders: {
        [providerField]: providerUserId,
      },
      lastLoginAt: new Date(),
    })

    return buildAuthSuccess(`Dang nhap bang ${provider} thanh cong.`, user)
  }

  user.displayName = safeDisplayName || user.displayName
  user.avatarUrl = trimString(avatarUrl) || user.avatarUrl

  if (!user.authProviders?.[providerField]) {
    user.set(`authProviders.${providerField}`, providerUserId)
  }

  if (isValidEmail(normalizedEmail) && user.email !== normalizedEmail) {
    user.email = normalizedEmail
  }

  user.lastLoginAt = new Date()
  await user.save()

  return buildAuthSuccess(`Dang nhap bang ${provider} thanh cong.`, user)
}

export const getAuthenticatedUserById = async (userId) => {
  const user = await User.findById(userId)

  return user ? toPublicUser(user) : null
}
