import { albumMockImages, trackMockImages } from './homeData.js'

export const albumRoutePrefix = '/album'

export function slugifyAlbumValue(value = '') {
  const slug = String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return slug || 'album'
}

export function createAlbumId(type, title, index = 0) {
  return `${type || 'album'}-${slugifyAlbumValue(title)}-${index}`
}

export function buildAlbumPath(item) {
  return `${albumRoutePrefix}/${item.albumId || createAlbumId(item.type, item.title)}`
}

const attachAlbumRoute = (item, index, group) => ({
  ...item,
  albumId: item.albumId || createAlbumId(group || item.type, item.title, index),
  albumKind: group || item.type || 'album',
})

const normalizeLookupValue = (value = '') =>
  String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/Ä‘/g, 'd')
    .replace(/Ä/g, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()

function findTrackForAlbum(album, tracks = []) {
  const albumTitle = normalizeLookupValue(album?.title)
  const albumArtist = normalizeLookupValue(album?.artist)
  const albumCoverUrl = album?.coverUrl || ''

  if (!albumTitle && !albumArtist && !albumCoverUrl) {
    return null
  }

  return (
    tracks.find((track) => {
      const trackArtist = normalizeLookupValue(track.artist)
      const titleMatches = albumTitle && normalizeLookupValue(track.title) === albumTitle
      const artistMatches =
        !albumArtist ||
        trackArtist === albumArtist ||
        trackArtist.includes(albumArtist) ||
        albumArtist.includes(trackArtist)

      return titleMatches && artistMatches
    }) ||
    tracks.find((track) => albumCoverUrl && track.coverUrl === albumCoverUrl) ||
    null
  )
}

export function buildUserAlbumItems({
  homeContent,
  playableTracks = [],
  userDisplayName = 'bạn',
} = {}) {
  const songs = Array.isArray(homeContent?.songs) ? homeContent.songs : []
  const albums = Array.isArray(homeContent?.albums) ? homeContent.albums : []
  const artists = Array.isArray(homeContent?.artists) ? homeContent.artists : []
  const tracks = songs.length > 0 ? songs : playableTracks
  const getDemoTrack = (index = 0) => tracks[index % Math.max(tracks.length, 1)] || null
  const firstTrack = getDemoTrack(0)
  const albumItems = albums.slice(0, 5).map((album, index) => ({
    title: album.title,
    subtitle: album.artist || 'Album',
    type: 'album',
    imageUrl: album.coverUrl || albumMockImages[index % albumMockImages.length] || '',
    artwork: album.artwork,
    track: findTrackForAlbum(album, tracks) || getDemoTrack(index),
    sourceAlbum: album,
  }))
  const artistItems = artists.slice(0, 2).map((artist, index) => ({
    title: artist.name,
    subtitle: artist.meta || 'Nghệ sĩ',
    type: 'artist',
    imageUrl: artist.imageUrl || '',
    artwork: artist.artwork,
    track:
      tracks.find((track) => track.artist?.toLowerCase().includes(artist.name.toLowerCase())) ||
      getDemoTrack(index + 3),
    sourceArtist: artist,
  }))

  return [
    {
      title: `Tuyển tập của ${userDisplayName}`,
      subtitle: `Thư viện cá nhân của ${userDisplayName}`,
      type: 'playlist',
      imageUrl: firstTrack?.coverUrl || trackMockImages[0] || '',
      artwork: firstTrack?.artwork,
      track: firstTrack,
    },
    {
      title: 'Bài hát đã thích',
      subtitle: `${Math.max(songs.length, 1)} bài hát`,
      type: 'playlist',
      liked: true,
      track: firstTrack,
    },
    ...albumItems,
    ...artistItems,
  ].slice(0, 8).map((item, index) => attachAlbumRoute(item, index, item.type))
}

export function buildUserMixItems({ homeContent, playableTracks = [] } = {}) {
  const songs = Array.isArray(homeContent?.songs) ? homeContent.songs : []
  const tracks = songs.length > 0 ? songs : playableTracks

  return Array.from({ length: Math.min(6, Math.max(tracks.length, 4)) }, (_, index) => {
    const track = tracks[index % Math.max(tracks.length, 1)] || {}
    const nextTrack = tracks[(index + 1) % Math.max(tracks.length, 1)] || {}
    const isPrimaryMix = index === 0

    return attachAlbumRoute(
      {
        title: isPrimaryMix ? 'Gợi ý hôm nay' : `Mix ngẫu nhiên ${String(index).padStart(2, '0')}`,
        subtitle: isPrimaryMix
          ? 'Tổng hợp demo từ các bài trend, chờ dữ liệu import thật.'
          : [track.artist, nextTrack.artist, 'và các bài cùng vibe'].filter(Boolean).join(', '),
        type: 'playlist',
        imageUrl:
          track.coverUrl ||
          albumMockImages[index % albumMockImages.length] ||
          trackMockImages[index % trackMockImages.length] ||
          '',
        artwork: track.artwork,
        track,
      },
      index,
      'mix',
    )
  })
}

export function buildSuggestedRadioItems({ homeContent, playableTracks = [] } = {}) {
  const songs = Array.isArray(homeContent?.songs) ? homeContent.songs : []
  const tracks = songs.length > 0 ? songs : playableTracks

  return Array.from({ length: Math.min(5, Math.max(tracks.length, 4)) }, (_, index) => {
    const track = tracks[(index + 2) % Math.max(tracks.length, 1)] || {}

    return attachAlbumRoute(
      {
        title: `${track.artist || 'TMusic'}: phát tiếp`,
        subtitle: `Gợi ý dựa trên ${track.title || 'các bài trend gần đây'}`,
        type: 'playlist',
        imageUrl: track.coverUrl || trackMockImages[index % trackMockImages.length] || '',
        artwork: track.artwork,
        track,
      },
      index,
      'recommended',
    )
  })
}

export function buildCatalogAlbumItems({ homeContent, playableTracks = [] } = {}) {
  const albums = Array.isArray(homeContent?.albums) ? homeContent.albums : []
  const songs = Array.isArray(homeContent?.songs) ? homeContent.songs : []
  const tracks = songs.length > 0 ? songs : playableTracks

  return albums.map((album, index) =>
    attachAlbumRoute(
      {
        title: album.title,
        subtitle: album.artist || 'Album',
        type: 'album',
        imageUrl: album.coverUrl || albumMockImages[index % albumMockImages.length] || '',
        artwork: album.artwork,
        track: findTrackForAlbum(album, tracks) || tracks[index % Math.max(tracks.length, 1)] || null,
        sourceAlbum: album,
      },
      index,
      'catalog-album',
    ),
  )
}

export function buildAlbumTrackList(albumItem, homeContent) {
  const songs = Array.isArray(homeContent?.songs) ? homeContent.songs : []

  if (songs.length === 0) {
    return []
  }

  const primaryTrackId = albumItem?.track?.id
  const orderedSongs = primaryTrackId
    ? [
        ...songs.filter((track) => track.id === primaryTrackId),
        ...songs.filter((track) => track.id !== primaryTrackId),
      ]
    : songs

  return orderedSongs.slice(0, Math.min(12, orderedSongs.length))
}

export function findAlbumItem(albumId, groups = []) {
  return groups.flat().find((item) => item?.albumId === albumId) || null
}
