import {
  fallbackAlbums,
  fallbackArtists,
  fallbackCharts,
  fallbackHomeContent,
  fallbackRadios,
  fallbackTracks,
} from './homeData.js'

export function normalizeTrack(song, index) {
  const fallback = fallbackTracks[index % fallbackTracks.length]

  return {
    title: song.title || fallback.title,
    artist: song.artist || fallback.artist,
    duration: song.duration || fallback.duration,
    explicit: song.explicit ?? false,
    coverUrl: song.coverUrl || '',
    tag: song.mood || fallback.tag,
    artwork: song.artwork || fallback.artwork,
  }
}

export function normalizeArtist(artist, index) {
  const fallback = fallbackArtists[index % fallbackArtists.length]

  return {
    name: artist.name || fallback.name,
    meta: artist.meta || fallback.meta,
    initials: artist.initials || fallback.initials,
    imageUrl: artist.imageUrl || '',
    artwork: artist.artwork || fallback.artwork,
  }
}

export function normalizeAlbum(album, index) {
  const fallback = fallbackAlbums[index % fallbackAlbums.length]

  return {
    title: album.title || fallback.title,
    artist: album.artist || fallback.artist,
    coverUrl: album.coverUrl || '',
    artwork: album.artwork || fallback.artwork,
  }
}

export function normalizeRadio(radio, index) {
  const fallback = fallbackRadios[index % fallbackRadios.length]

  return {
    title: radio.title || fallback.title,
    description: radio.description || fallback.description,
    imageUrl: radio.imageUrl || '',
    tone: radio.tone || fallback.tone,
    initials:
      Array.isArray(radio.initials) && radio.initials.length > 0
        ? radio.initials
        : fallback.initials,
  }
}

export function normalizeChart(chart, index) {
  const fallback = fallbackCharts[index % fallbackCharts.length]

  return {
    title: chart.title || fallback.title,
    subtitle: chart.subtitle || fallback.subtitle,
    coverUrl: chart.coverUrl || '',
    artwork: chart.artwork || fallback.artwork,
  }
}

export function normalizeHomePayload(payload) {
  return {
    loading: false,
    songs:
      Array.isArray(payload?.songs) && payload.songs.length > 0
        ? payload.songs.map(normalizeTrack)
        : fallbackHomeContent.songs,
    artists:
      Array.isArray(payload?.artists) && payload.artists.length > 0
        ? payload.artists.map(normalizeArtist)
        : fallbackHomeContent.artists,
    albums:
      Array.isArray(payload?.albums) && payload.albums.length > 0
        ? payload.albums.map(normalizeAlbum)
        : fallbackHomeContent.albums,
    radios:
      Array.isArray(payload?.radios) && payload.radios.length > 0
        ? payload.radios.map(normalizeRadio)
        : fallbackHomeContent.radios,
    charts:
      Array.isArray(payload?.charts) && payload.charts.length > 0
        ? payload.charts.map(normalizeChart)
        : fallbackHomeContent.charts,
  }
}
