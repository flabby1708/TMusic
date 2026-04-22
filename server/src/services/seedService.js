import bcrypt from 'bcryptjs'
import Album from '../models/Album.js'
import Artist from '../models/Artist.js'
import Chart from '../models/Chart.js'
import Radio from '../models/Radio.js'
import Song from '../models/Song.js'
import User from '../models/User.js'
import {
  albumSeed,
  artistSeed,
  chartSeed,
  radioSeed,
  songSeed,
} from '../data/homeSeed.js'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PASSWORD_MIN_LENGTH = 8
const SALT_ROUNDS = 12

const trimString = (value) => (typeof value === 'string' ? value.trim() : '')
const normalizeEmail = (value) => trimString(value).toLowerCase()

const seedCollectionIfEmpty = async (model, seedData, label) => {
  const count = await model.countDocuments()

  if (count > 0) {
    return
  }

  await model.insertMany(seedData)
  console.log(`Seeded ${label}.`)
}

const replaceCollectionContent = async (model, seedData, label) => {
  await model.deleteMany({})
  await model.insertMany(seedData)
  console.log(`Synchronized ${label}.`)
}

export const seedHomeContent = async () => {
  await seedCollectionIfEmpty(Song, songSeed, 'songs')
  await seedCollectionIfEmpty(Artist, artistSeed, 'artists')
  await seedCollectionIfEmpty(Album, albumSeed, 'albums')
  await seedCollectionIfEmpty(Radio, radioSeed, 'radios')
  await seedCollectionIfEmpty(Chart, chartSeed, 'charts')
}

export const syncHomeContent = async () => {
  await replaceCollectionContent(Song, songSeed, 'songs')
  await replaceCollectionContent(Artist, artistSeed, 'artists')
  await replaceCollectionContent(Album, albumSeed, 'albums')
  await replaceCollectionContent(Radio, radioSeed, 'radios')
  await replaceCollectionContent(Chart, chartSeed, 'charts')
}

export const ensureAdminAccount = async () => {
  const email = normalizeEmail(process.env.ADMIN_EMAIL)
  const password = trimString(process.env.ADMIN_PASSWORD)
  const displayName = trimString(process.env.ADMIN_DISPLAY_NAME) || 'TMusic Admin'

  if (!email && !password) {
    return
  }

  if (!EMAIL_PATTERN.test(email)) {
    console.warn('ADMIN_EMAIL is invalid. Skipping admin bootstrap.')
    return
  }

  if (password.length < PASSWORD_MIN_LENGTH) {
    console.warn(
      `ADMIN_PASSWORD must be at least ${PASSWORD_MIN_LENGTH} characters. Skipping admin bootstrap.`,
    )
    return
  }

  const existingAdmin = await User.findOne({ email }).select('+passwordHash')

  if (existingAdmin) {
    let hasChanges = false

    if (existingAdmin.role !== 'admin') {
      existingAdmin.role = 'admin'
      hasChanges = true
    }

    if (!existingAdmin.passwordHash) {
      existingAdmin.passwordHash = await bcrypt.hash(password, SALT_ROUNDS)
      hasChanges = true
    }

    if (!trimString(existingAdmin.displayName)) {
      existingAdmin.displayName = displayName
      hasChanges = true
    }

    if (hasChanges) {
      await existingAdmin.save()
      console.log(`Admin account synchronized for ${email}.`)
    }

    return
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)

  await User.create({
    displayName,
    email,
    passwordHash,
    role: 'admin',
  })

  console.log(`Admin account created for ${email}.`)
}
