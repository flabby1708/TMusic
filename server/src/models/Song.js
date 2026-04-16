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
