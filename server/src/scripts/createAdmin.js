import 'dotenv/config'
import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'
import readline from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'

import User from '../models/User.js'
import { connectDatabase, getDatabaseStatus } from '../config/db.js'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const SALT_ROUNDS = 12

const weakPasswords = new Set([
  'admin',
  'admin123',
  '123456',
  '12345678',
  'password',
  'password123',
  'change-this-secret',
  'change-this-admin-password',
])

const normalizeEmail = (value) => String(value || '').trim().toLowerCase()
const trimString = (value) => String(value || '').trim()

const validatePassword = (password) => {
  if (!password) {
    return 'Vui lòng nhập mật khẩu.'
  }

  if (password.length < 12) {
    return 'Mật khẩu admin phải có ít nhất 12 ký tự.'
  }

  if (weakPasswords.has(password.toLowerCase())) {
    return 'Mật khẩu admin quá yếu hoặc là mật khẩu mặc định.'
  }

  if (!/[a-z]/.test(password)) {
    return 'Mật khẩu admin cần có ít nhất 1 chữ thường.'
  }

  if (!/[A-Z]/.test(password)) {
    return 'Mật khẩu admin cần có ít nhất 1 chữ hoa.'
  }

  if (!/[0-9]/.test(password)) {
    return 'Mật khẩu admin cần có ít nhất 1 chữ số.'
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    return 'Mật khẩu admin cần có ít nhất 1 ký tự đặc biệt.'
  }

  return ''
}

const readAdminInput = async () => {
  const rl = readline.createInterface({ input, output })

  try {
    const displayName = trimString(
      await rl.question('Display name: '),
    )

    const email = normalizeEmail(
      await rl.question('Email: '),
    )

    const password = await rl.question('Password: ')

    return {
      displayName,
      email,
      password,
    }
  } finally {
    rl.close()
  }
}

const createAdmin = async () => {
  await connectDatabase()

  if (getDatabaseStatus() !== 'connected') {
    throw new Error('MongoDB is not connected. Kiem tra MONGODB_URI/MONGODB_DB_NAME.')
  }

  const payload = await readAdminInput()

  if (!payload.displayName || payload.displayName.length < 2) {
    throw new Error('Display name phai co it nhat 2 ky tu.')
  }

  if (!EMAIL_PATTERN.test(payload.email)) {
    throw new Error('Email khong dung dinh dang.')
  }

  const passwordError = validatePassword(payload.password)

  if (passwordError) {
    throw new Error(passwordError)
  }

  const existingUser = await User.findOne({ email: payload.email }).select('+passwordHash')

  if (existingUser) {
    if (existingUser.role === 'admin') {
      console.log(`User ${payload.email} da la admin. Khong tao moi.`)
      return
    }

    existingUser.role = 'admin'
    existingUser.passwordHash = await bcrypt.hash(payload.password, SALT_ROUNDS)
    existingUser.artistStatus = existingUser.artistStatus || 'none'

    await existingUser.save()

    console.log(`Da cap quyen admin cho user co san: ${payload.email}`)
    return
  }

  const passwordHash = await bcrypt.hash(payload.password, SALT_ROUNDS)

  await User.create({
    displayName: payload.displayName,
    email: payload.email,
    passwordHash,
    role: 'admin',
    artistStatus: 'none',
  })

  console.log(`Da tao admin: ${payload.email}`)
}

createAdmin()
  .catch((error) => {
    console.error(error.message)
    process.exitCode = 1
  })
  .finally(async () => {
    await mongoose.disconnect().catch(() => null)
  })