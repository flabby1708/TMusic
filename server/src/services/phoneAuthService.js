import bcrypt from 'bcryptjs'
import PhoneOtp from '../models/PhoneOtp.js'
import { findOrCreatePhoneUser, normalizePhoneNumber, isValidPhoneNumber } from './authService.js'

const OTP_LENGTH = 6
const OTP_TTL_MINUTES = 5
const OTP_HASH_ROUNDS = 10

const generateOtpCode = () =>
  String(Math.floor(Math.random() * 10 ** OTP_LENGTH)).padStart(OTP_LENGTH, '0')

const hasTwilioConfig = () =>
  Boolean(
    process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_PHONE_NUMBER,
  )

const sendSmsWithTwilio = async (phoneNumber, code) => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const fromPhoneNumber = process.env.TWILIO_PHONE_NUMBER
  const body = new URLSearchParams({
    To: phoneNumber,
    From: fromPhoneNumber,
    Body: `Ma xac thuc TMusic cua ban la ${code}. Ma co hieu luc trong ${OTP_TTL_MINUTES} phut.`,
  })

  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    },
  )

  if (!response.ok) {
    const payload = await response.json().catch(() => null)
    throw new Error(payload?.message || 'Không thể gửi mã OTP qua SMS.')
  }
}

export const requestPhoneCode = async ({ phoneNumber }) => {
  const normalizedPhoneNumber = normalizePhoneNumber(phoneNumber)

  if (!isValidPhoneNumber(normalizedPhoneNumber)) {
    return {
      errorType: 'validation',
      message: 'Số điện thoại không hợp lệ.',
    }
  }

  const code = generateOtpCode()
  const codeHash = await bcrypt.hash(code, OTP_HASH_ROUNDS)
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000)

  await PhoneOtp.findOneAndUpdate(
    { phoneNumber: normalizedPhoneNumber },
    {
      phoneNumber: normalizedPhoneNumber,
      codeHash,
      expiresAt,
      attemptCount: 0,
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    },
  )

  if (hasTwilioConfig()) {
    await sendSmsWithTwilio(normalizedPhoneNumber, code)

    return {
      errorType: '',
      message: 'Mã xác thực đã được gửi qua SMS.',
      devCode: '',
      phoneNumber: normalizedPhoneNumber,
    }
  }

  return {
    errorType: '',
    message: 'Mã xác thực đã được tạo. Bạn đang ở chế độ dev nên mã được hiển thị ngay trên màn hình.',
    devCode: code,
    phoneNumber: normalizedPhoneNumber,
  }
}

export const verifyPhoneCode = async ({ phoneNumber, code, displayName }) => {
  const normalizedPhoneNumber = normalizePhoneNumber(phoneNumber)
  const normalizedCode = String(code || '').trim()

  if (!isValidPhoneNumber(normalizedPhoneNumber)) {
    return {
      errorType: 'validation',
      message: 'Số điện thoại không hợp lệ.',
    }
  }

  if (!/^\d{6}$/.test(normalizedCode)) {
    return {
      errorType: 'validation',
      message: 'Mã xác thực phải gồm 6 chữ số.',
    }
  }

  const otpRecord = await PhoneOtp.findOne({ phoneNumber: normalizedPhoneNumber }).select(
    '+codeHash',
  )

  if (!otpRecord || otpRecord.expiresAt.getTime() < Date.now()) {
    return {
      errorType: 'validation',
      message: 'Mã xác thực đã hết hạn hoặc không tồn tại.',
    }
  }

  const isCodeValid = await bcrypt.compare(normalizedCode, otpRecord.codeHash)

  if (!isCodeValid) {
    otpRecord.attemptCount += 1
    await otpRecord.save()

    return {
      errorType: 'credentials',
      message: 'Mã xác thực không đúng.',
    }
  }

  await PhoneOtp.deleteOne({ _id: otpRecord._id })

  return findOrCreatePhoneUser({
    phoneNumber: normalizedPhoneNumber,
    displayName,
  })
}
