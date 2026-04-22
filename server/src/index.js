import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import { connectDatabase, getDatabaseStatus } from './config/db.js'
import apiRoutes from './routes/index.js'
import { ensureAdminAccount, seedHomeContent } from './services/seedService.js'

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

app.get('/', (_req, res) => {
  res.json({
    message: 'Welcome to TMusic API',
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

  if (getDatabaseStatus() === 'connected') {
    await seedHomeContent()
    await ensureAdminAccount()
  }
}

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`)
  void bootstrap()
})
