import mongoose from 'mongoose'

const artistSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    meta: {
      type: String,
      default: 'Nghệ sĩ',
      trim: true,
    },
    aliases: {
      type: [String],
      default: [],
    },
    realName: {
      type: String,
      default: '',
      trim: true,
    },
    bio: {
      type: String,
      default: '',
      trim: true,
    },
    statsLabel: {
      type: String,
      default: '',
      trim: true,
    },
    sourceLabel: {
      type: String,
      default: '',
      trim: true,
    },
    sourceUrl: {
      type: String,
      default: '',
      trim: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    credits: {
      type: [
        {
          name: {
            type: String,
            default: '',
            trim: true,
          },
          role: {
            type: String,
            default: '',
            trim: true,
          },
        },
      ],
      default: [],
    },
    imageUrl: {
      type: String,
      default: '',
      trim: true,
    },
    initials: {
      type: String,
      default: '',
      trim: true,
    },
    artwork: {
      type: String,
      default: '',
      trim: true,
    },
    sortOrder: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  },
)

const Artist = mongoose.models.Artist || mongoose.model('Artist', artistSchema)

export default Artist
