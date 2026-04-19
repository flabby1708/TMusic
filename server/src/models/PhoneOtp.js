import mongoose from 'mongoose'

const phoneOtpSchema = new mongoose.Schema(
  {
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    codeHash: {
      type: String,
      required: true,
      select: false,
    },
    expiresAt: {
      type: Date,
      required: true,
      expires: 0,
    },
    attemptCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
)

const PhoneOtp = mongoose.models.PhoneOtp || mongoose.model('PhoneOtp', phoneOtpSchema)

export default PhoneOtp
