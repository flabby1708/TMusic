import {
  fallbackAlbums,
  fallbackArtists,
  fallbackCharts,
  fallbackRadios,
  fallbackTracks,
} from './homeData.js'

export function normalizeTrack(song, index) {
  const fallback = fallbackTracks[index % fallbackTracks.length]
  const audioVariants = Array.isArray(song.audioVariants) ? song.audioVariants : []
  const readyAudioVariant =
    audioVariants.find((variant) => variant?.quality === 'normal' && variant?.status === 'ready' && variant?.url) ||
    audioVariants.find((variant) => variant?.status === 'ready' && variant?.url)

  return {
    id: song._id || song.id || `fallback-track-${index}`,
    title: song.title || fallback.title,
    artist: song.artist || fallback.artist,
    duration: song.duration || fallback.duration,
    explicit: song.explicit ?? false,
    coverUrl: song.coverUrl || '',
    audioUrl: song.audioUrl || readyAudioVariant?.url || '',
    audioVariants,
    videoUrl: song.videoUrl || song.musicVideo?.url || '',
    tag: song.mood || fallback.tag,
    artwork: song.artwork || fallback.artwork,
    sourceType: song.sourceType || '',
    releaseStatus: song.releaseStatus || '',
    processingStatus: song.processingStatus || '',
  }
}

export function normalizeArtist(artist, index) {
  const fallback = fallbackArtists[index % fallbackArtists.length]

  return {
    id: artist._id || artist.id || `artist-${index}`,
    name: artist.name || fallback.name,
    meta: artist.meta || fallback.meta,
    aliases: Array.isArray(artist.aliases) ? artist.aliases : [],
    realName: artist.realName || '',
    bio: artist.bio || '',
    statsLabel: artist.statsLabel || '',
    sourceLabel: artist.sourceLabel || '',
    sourceUrl: artist.sourceUrl || '',
    verified: Boolean(artist.verified),
    credits: Array.isArray(artist.credits) ? artist.credits : [],
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
  const songs = Array.isArray(payload?.songs)
    ? payload.songs
        .filter((song) => song?.sourceType === 'artist' && song?.releaseStatus === 'published')
        .map(normalizeTrack)
    : []

  return {
    loading: false,
    songs,
    artists: Array.isArray(payload?.artists) ? payload.artists.map(normalizeArtist) : [],
    albums: Array.isArray(payload?.albums) ? payload.albums.map(normalizeAlbum) : [],
    radios: Array.isArray(payload?.radios) ? payload.radios.map(normalizeRadio) : [],
    charts: Array.isArray(payload?.charts) ? payload.charts.map(normalizeChart) : [],
  }
}
