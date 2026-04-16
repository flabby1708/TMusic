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
