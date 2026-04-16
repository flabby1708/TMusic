import mongoose from 'mongoose'

const chartSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    subtitle: {
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

const Chart = mongoose.models.Chart || mongoose.model('Chart', chartSchema)

export default Chart
