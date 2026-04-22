import mongoose from 'mongoose'

const songSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    artist: {
      type: String,
      required: true,
      trim: true,
    },
    coverUrl: {
      type: String,
      default: '',
    },
    duration: {
      type: String,
      default: '00:00',
    },
    mood: {
      type: String,
      default: 'Chill',
    },
    audioUrl: {
      type: String,
      default: '',
      trim: true,
    },
    ownerUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    sourceType: {
      type: String,
      enum: ['catalog', 'artist'],
      default: 'catalog',
    },
    releaseStatus: {
      type: String,
      enum: ['draft', 'pending', 'published'],
      default: 'published',
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
)

const Song = mongoose.models.Song || mongoose.model('Song', songSchema)

export default Song
