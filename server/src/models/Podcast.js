import mongoose from 'mongoose'

const podcastAudioSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      default: '',
      trim: true,
    },
    publicId: {
      type: String,
      default: '',
      trim: true,
    },
    originalFilename: {
      type: String,
      default: '',
      trim: true,
    },
    format: {
      type: String,
      default: '',
      trim: true,
    },
    resourceType: {
      type: String,
      default: 'video',
      trim: true,
    },
    sizeBytes: {
      type: Number,
      default: 0,
      min: 0,
    },
    durationSeconds: {
      type: Number,
      default: 0,
      min: 0,
    },
    uploadedAt: {
      type: Date,
      default: null,
    },
  },
  {
    _id: false,
  },
)

const podcastSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    showTitle: {
      type: String,
      required: true,
      trim: true,
    },
    host: {
      type: String,
      default: '',
      trim: true,
    },
    category: {
      type: String,
      default: 'Podcast',
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    duration: {
      type: String,
      default: '00:00',
      trim: true,
    },
    coverUrl: {
      type: String,
      default: '',
      trim: true,
    },
    coverPublicId: {
      type: String,
      default: '',
      trim: true,
    },
    audioUrl: {
      type: String,
      default: '',
      trim: true,
    },
    audio: {
      type: podcastAudioSchema,
      default: () => ({}),
    },
    sourcePage: {
      type: String,
      default: '',
      trim: true,
    },
    license: {
      type: String,
      default: '',
      trim: true,
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

podcastSchema.index({ releaseStatus: 1, sortOrder: 1, createdAt: -1 })
podcastSchema.index({ showTitle: 1, title: 1 })
podcastSchema.index({ title: 'text', showTitle: 'text', host: 'text', category: 'text' })

const Podcast = mongoose.models.Podcast || mongoose.model('Podcast', podcastSchema)

export default Podcast
