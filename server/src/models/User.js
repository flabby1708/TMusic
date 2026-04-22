import mongoose from 'mongoose'
import {
  createDefaultUserSubscription,
  USER_SUBSCRIPTION_PLANS,
  USER_SUBSCRIPTION_STATUSES,
} from '../utils/subscription.js'

const artistProfileSchema = new mongoose.Schema(
  {
    stageName: {
      type: String,
      default: '',
      trim: true,
    },
    bio: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    _id: false,
  },
)

const subscriptionSchema = new mongoose.Schema(
  {
    plan: {
      type: String,
      enum: USER_SUBSCRIPTION_PLANS,
      default: 'free',
    },
    status: {
      type: String,
      enum: USER_SUBSCRIPTION_STATUSES,
      default: 'inactive',
    },
    provider: {
      type: String,
      default: '',
      trim: true,
    },
    customerId: {
      type: String,
      default: '',
      trim: true,
    },
    subscriptionId: {
      type: String,
      default: '',
      trim: true,
    },
    currentPeriodStart: {
      type: Date,
      default: null,
    },
    currentPeriodEnd: {
      type: Date,
      default: null,
    },
    premiumExpiresAt: {
      type: Date,
      default: null,
    },
  },
  {
    _id: false,
  },
)

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
      enum: ['user', 'artist', 'admin'],
      default: 'user',
    },
    artistStatus: {
      type: String,
      enum: ['none', 'pending', 'approved', 'rejected'],
      default: 'none',
    },
    artistProfile: {
      type: artistProfileSchema,
      default: () => ({}),
    },
    subscription: {
      type: subscriptionSchema,
      default: createDefaultUserSubscription,
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
