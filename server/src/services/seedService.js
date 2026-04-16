import Album from '../models/Album.js'
import Artist from '../models/Artist.js'
import Chart from '../models/Chart.js'
import Radio from '../models/Radio.js'
import Song from '../models/Song.js'
import {
  albumSeed,
  artistSeed,
  chartSeed,
  radioSeed,
  songSeed,
} from '../data/homeSeed.js'

const seedCollectionIfEmpty = async (model, seedData, label) => {
  const count = await model.countDocuments()

  if (count > 0) {
    return
  }

  await model.insertMany(seedData)
  console.log(`Seeded ${label}.`)
}

export const seedHomeContent = async () => {
  await seedCollectionIfEmpty(Song, songSeed, 'songs')
  await seedCollectionIfEmpty(Artist, artistSeed, 'artists')
  await seedCollectionIfEmpty(Album, albumSeed, 'albums')
  await seedCollectionIfEmpty(Radio, radioSeed, 'radios')
  await seedCollectionIfEmpty(Chart, chartSeed, 'charts')
}
