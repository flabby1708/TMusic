import 'dotenv/config'
import mongoose from 'mongoose'
import { connectDatabase, getDatabaseStatus } from '../config/db.js'
import { importArtistWikiProfile } from '../services/artistWikiImportService.js'

const getArgValue = (name) => {
  const prefix = `--${name}=`
  const inlineValue = process.argv.find((item) => item.startsWith(prefix))

  if (inlineValue) {
    return inlineValue.slice(prefix.length)
  }

  const index = process.argv.indexOf(`--${name}`)

  return index >= 0 ? process.argv[index + 1] || '' : ''
}

const main = async () => {
  await connectDatabase()

  if (getDatabaseStatus() !== 'connected') {
    throw new Error('MongoDB is not connected.')
  }

  const payload = await importArtistWikiProfile({
    name: getArgValue('name'),
    sourceUrl: getArgValue('url') || getArgValue('sourceUrl'),
  })

  console.log(
    `${payload.created ? 'created' : 'updated'} artist ${payload.item.name} from ${payload.source.label}: ${payload.source.url}`,
  )
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await mongoose.disconnect().catch(() => null)
  })
