import mongoose from 'mongoose'

const albumSchema = new mongoose.Schema(
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

const Album = mongoose.models.Album || mongoose.model('Album', albumSchema)

export default Album
