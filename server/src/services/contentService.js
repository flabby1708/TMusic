import Album from '../models/Album.js'
import Artist from '../models/Artist.js'
import Chart from '../models/Chart.js'
import Radio from '../models/Radio.js'
import Song from '../models/Song.js'

const sortByOrder = { sortOrder: 1, createdAt: 1 }

export const getHomeContentData = async () => {
  const [songs, artists, albums, radios, charts] = await Promise.all([
    Song.find().sort(sortByOrder).limit(12).lean(),
    Artist.find().sort(sortByOrder).limit(12).lean(),
    Album.find().sort(sortByOrder).limit(12).lean(),
    Radio.find().sort(sortByOrder).limit(12).lean(),
    Chart.find().sort(sortByOrder).limit(12).lean(),
  ])

  return {
    songs,
    artists,
    albums,
    radios,
    charts,
  }
}

export const getSongList = async () => {
  return Song.find().sort(sortByOrder).limit(12).lean()
}
