import mongoose from 'mongoose'

const masterAudioSchema = new mongoose.Schema(
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
      default: 'raw',
      trim: true,
    },
    sizeBytes: {
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

const audioVariantSchema = new mongoose.Schema(
  {
    quality: {
      type: String,
      enum: ['normal', 'high'],
      required: true,
    },
    codec: {
      type: String,
      default: 'mp3',
      trim: true,
    },
    format: {
      type: String,
      default: 'mp3',
      trim: true,
    },
    bitrateKbps: {
      type: Number,
      default: 0,
      min: 0,
    },
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
    sizeBytes: {
      type: Number,
      default: 0,
      min: 0,
    },
    vipOnly: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'ready', 'failed'],
      default: 'pending',
    },
    errorMessage: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    _id: false,
  },
)

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
    coverPublicId: {
      type: String,
      default: '',
      trim: true,
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
    masterAudio: {
      type: masterAudioSchema,
      default: () => ({}),
    },
    audioVariants: {
      type: [audioVariantSchema],
      default: [],
    },
    processingStatus: {
      type: String,
      enum: ['draft', 'uploaded', 'processing', 'ready', 'failed'],
      default: 'ready',
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
