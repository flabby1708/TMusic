import dotenv from 'dotenv'
import { connectDatabase, getDatabaseStatus } from '../config/db.js'
import { syncHomeContent } from '../services/seedService.js'

dotenv.config()

const run = async () => {
  await connectDatabase()

  if (getDatabaseStatus() !== 'connected') {
    throw new Error('MongoDB is not connected.')
  }

  await syncHomeContent()
}

run()
  .then(() => {
    console.log('Home content synchronization completed.')
    process.exit(0)
  })
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
