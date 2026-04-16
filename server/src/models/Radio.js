import mongoose from 'mongoose'

const radioSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    imageUrl: {
      type: String,
      default: '',
      trim: true,
    },
    tone: {
      type: String,
      default: '',
      trim: true,
    },
    initials: {
      type: [String],
      default: [],
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

const Radio = mongoose.models.Radio || mongoose.model('Radio', radioSchema)

export default Radio
