import bcrypt from 'bcryptjs'
import User from '../models/User.js'
import { signUserToken } from '../utils/authToken.js'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PASSWORD_MIN_LENGTH = 8
const SALT_ROUNDS = 12

const trimString = (value) => (typeof value === 'string' ? value.trim() : '')
const normalizeEmail = (value) => trimString(value).toLowerCase()

const toPublicUser = (user) => ({
  id: user._id.toString(),
  displayName: user.displayName,
  email: user.email,
  role: user.role,
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

const buildSuccess = (message, user, token) => ({
  errorType: '',
  message,
  token,
  user,
})

const validateRegisterPayload = ({ displayName, email, password }) => {
  if (!displayName || !email || !password) {
    return 'Vui lòng nhập đầy đủ tên hiển thị, email và mật khẩu.'
  }

  if (displayName.length < 2) {
    return 'Tên hiển thị phải có ít nhất 2 ký tự.'
  }

  if (!EMAIL_PATTERN.test(email)) {
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

  if (!EMAIL_PATTERN.test(email)) {
    return 'Email không đúng định dạng.'
  }

  return ''
}

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

  return buildSuccess(
    'Đăng ký thành công.',
    toPublicUser(user),
    signUserToken(user),
  )
}

export const loginUser = async (body) => {
  const payload = sanitizeLoginPayload(body)
  const validationMessage = validateLoginPayload(payload)

  if (validationMessage) {
    return buildFailure('validation', validationMessage)
  }

  const user = await User.findOne({ email: payload.email }).select('+passwordHash')

  if (!user) {
    return buildFailure('credentials', 'Email hoặc mật khẩu không đúng.')
  }

  const isPasswordValid = await bcrypt.compare(payload.password, user.passwordHash)

  if (!isPasswordValid) {
    return buildFailure('credentials', 'Email hoặc mật khẩu không đúng.')
  }

  user.lastLoginAt = new Date()
  await user.save()

  return buildSuccess(
    'Đăng nhập thành công.',
    toPublicUser(user),
    signUserToken(user),
  )
}

export const getAuthenticatedUserById = async (userId) => {
  const user = await User.findById(userId)

  return user ? toPublicUser(user) : null
}
