import bcrypt from 'bcryptjs'
import User from '../models/User.js'
import { signUserToken } from '../utils/authToken.js'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_PATTERN = /^\+?[1-9]\d{8,14}$/
const PASSWORD_MIN_LENGTH = 8
const SALT_ROUNDS = 12

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
  avatarUrl: user.avatarUrl || '',
  phoneNumber: user.phoneNumber || '',
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
    return 'Vui lòng nhập đầy đủ tên hiển thị, email và mật khẩu.'
  }

  if (displayName.length < 2) {
    return 'Tên hiển thị phải có ít nhất 2 ký tự.'
  }

  if (!isValidEmail(email)) {
    return 'Email không đúng định dạng.'
  }

  if (password.length < PASSWORD_MIN_LENGTH) {
    return `Mật khẩu phải có ít nhất ${PASSWORD_MIN_LENGTH} ký tự.`
  }

  return ''
}

const validateLoginPayload = ({ email, password }) => {
  if (!email || !password) {
    return 'Vui lòng nhập email và mật khẩu.'
  }

  if (!isValidEmail(email)) {
    return 'Email không đúng định dạng.'
  }

  return ''
}

const buildPlaceholderEmail = (prefix, uniqueValue) =>
  `${prefix}-${uniqueValue.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}@tmusic.local`

const getFallbackDisplayName = (displayName, fallbackEmail) =>
  trimString(displayName) || fallbackEmail.split('@')[0]

export const registerUser = async (body) => {
  const payload = sanitizeRegisterPayload(body)
  const validationMessage = validateRegisterPayload(payload)

  if (validationMessage) {
    return buildFailure('validation', validationMessage)
  }

  const existingUser = await User.findOne({ email: payload.email }).lean()

  if (existingUser) {
    return buildFailure('conflict', 'Email này đã được sử dụng.')
  }

  const passwordHash = await bcrypt.hash(payload.password, SALT_ROUNDS)
  const user = await User.create({
    displayName: payload.displayName,
    email: payload.email,
    passwordHash,
  })

  return buildAuthSuccess('Đăng ký thành công.', user)
}

export const loginUser = async (body) => {
  const payload = sanitizeLoginPayload(body)
  const validationMessage = validateLoginPayload(payload)

  if (validationMessage) {
    return buildFailure('validation', validationMessage)
  }

  const user = await User.findOne({ email: payload.email }).select('+passwordHash')

  if (!user || !user.passwordHash) {
    return buildFailure('credentials', 'Email hoặc mật khẩu không đúng.')
  }

  const isPasswordValid = await bcrypt.compare(payload.password, user.passwordHash)

  if (!isPasswordValid) {
    return buildFailure('credentials', 'Email hoặc mật khẩu không đúng.')
  }

  user.lastLoginAt = new Date()
  await user.save()

  return buildAuthSuccess('Đăng nhập thành công.', user)
}

export const findOrCreatePhoneUser = async ({ phoneNumber, displayName }) => {
  const normalizedPhoneNumber = normalizePhoneNumber(phoneNumber)

  if (!isValidPhoneNumber(normalizedPhoneNumber)) {
    return buildFailure('validation', 'Số điện thoại không hợp lệ.')
  }

  const existingUser = await User.findOne({ phoneNumber: normalizedPhoneNumber })

  if (existingUser) {
    existingUser.authProviders.phoneVerified = true
    existingUser.lastLoginAt = new Date()
    await existingUser.save()

    return buildAuthSuccess('Đăng nhập bằng số điện thoại thành công.', existingUser)
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

  return buildAuthSuccess('Xác thực số điện thoại thành công.', user)
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
    return buildFailure('validation', 'Thông tin nhà cung cấp đăng nhập không hợp lệ.')
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

    return buildAuthSuccess(`Đăng nhập bằng ${provider} thành công.`, user)
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

  return buildAuthSuccess(`Đăng nhập bằng ${provider} thành công.`, user)
}

export const getAuthenticatedUserById = async (userId) => {
  const user = await User.findById(userId)

  return user ? toPublicUser(user) : null
}
