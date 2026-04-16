import mongoose from 'mongoose'

const CONNECTION_STATES = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting',
}

export const getDatabaseStatus = () =>
  CONNECTION_STATES[mongoose.connection.readyState] ?? 'unknown'

export const connectDatabase = async () => {
  const mongoUri = process.env.MONGODB_URI
  const fallbackUri = process.env.MONGODB_FALLBACK_URI
  const dbName = process.env.MONGODB_DB_NAME || 'tmusic'

  if (!mongoUri) {
    console.warn('MONGODB_URI is not configured. API will start without MongoDB.')
    return
  }

  const connectionCandidates = [mongoUri, fallbackUri].filter(
    (value, index, values) => value && values.indexOf(value) === index,
  )
  let lastError = null

  for (const [index, candidate] of connectionCandidates.entries()) {
    try {
      await mongoose.connect(candidate, {
        dbName,
        serverSelectionTimeoutMS: 5000,
      })
      console.log(`MongoDB connected to database "${dbName}".`)
      return
    } catch (error) {
      lastError = error

      if (index < connectionCandidates.length - 1) {
        console.warn(
          `MongoDB connection attempt failed: ${error.message}. Trying fallback connection...`,
        )
      }
    }
  }

  if (lastError) {
    console.error(`MongoDB connection failed: ${lastError.message}`)
  }
}
