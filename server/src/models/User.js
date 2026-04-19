import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    displayName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      default: '',
      select: false,
    },
    phoneNumber: {
      type: String,
      default: undefined,
      unique: true,
      sparse: true,
      trim: true,
      set: (value) => {
        if (typeof value !== 'string') {
          return value
        }

        const trimmedValue = value.trim()
        return trimmedValue ? trimmedValue : undefined
      },
    },
    avatarUrl: {
      type: String,
      default: '',
      trim: true,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    authProviders: {
      googleId: {
        type: String,
        default: '',
        trim: true,
      },
      facebookId: {
        type: String,
        default: '',
        trim: true,
      },
      appleId: {
        type: String,
        default: '',
        trim: true,
      },
      phoneVerified: {
        type: Boolean,
        default: false,
      },
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
)

const User = mongoose.models.User || mongoose.model('User', userSchema)

export default User
