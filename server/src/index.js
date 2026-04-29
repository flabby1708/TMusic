import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import { connectDatabase, getDatabaseStatus } from './config/db.js'
import apiRoutes from './routes/index.js'
import { getFfmpegHealthStatus } from './services/ffmpegHealthService.js'
-
dotenv.config()

const app = express()
const port = process.env.PORT || 5000
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173'

app.use(
  cors({
    origin: clientUrl,
  }),
)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/api/health', async (req, res) => {
  const services = {}

  try {
    services.database = {
      status: getDatabaseStatus(),
    }
  } catch (error) {
    services.database = {
      status: 'unknown',
      error: error.message,
    }
  }

  try {
    services.ffmpeg = await getFfmpegHealthStatus()
  } catch (error) {
    services.ffmpeg = {
      available: false,
      path: process.env.FFMPEG_PATH || 'ffmpeg',
      code: 'FFMPEG_HEALTH_CHECK_FAILED',
      error: error.message,
      checkedAt: new Date().toISOString(),
    }
  }

  res.json({
    ok: true,
    services,
  })
})

app.use('/api', apiRoutes)

app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(500).json({
    message: 'Internal server error',
  })
})

const bootstrap = async () => {
  await connectDatabase()
}

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`)
  void bootstrap()
})
