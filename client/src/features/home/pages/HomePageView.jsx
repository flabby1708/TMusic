import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { A11y } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import {
  ArrowIcon,
  ChevronLeftSmallIcon,
  ChevronRightSmallIcon,
  DeviceIcon,
  ExpandIcon,
  GlobeIcon,
  LibraryIcon,
  LyricsIcon,
  MuteIcon,
  NextTrackIcon,
  PauseIcon,
  PlayIcon,
  PlusIcon,
  PreviousTrackIcon,
  QueueIcon,
  RepeatIcon,
  RepeatOneIcon,
  SearchIcon,
  ShuffleIcon,
  SpeakerIcon,
  SpotifyIcon,
  VideoIcon,
} from '../../../shared/icons.jsx'
import {
  albumMockImages,
  artistMockImages,
  chartMockImages,
  footerLinks,
  libraryPrompts,
  radioMockImages,
  trackMockImages,
} from '../homeData.js'
import {
  buildAlbumPath,
  buildSuggestedRadioItems,
  buildUserAlbumItems,
  buildUserMixItems,
} from '../albumLibrary.js'
import { useHomePageData } from '../useHomePageData.js'
import { useAuthSession } from '../../auth/useAuthSession.js'
import GuestPlaybackGateModal from '../components/GuestPlaybackGateModal.jsx'
import AppFooter from '../../footer/AppFooter.jsx'
import ClientAppHeader from '../../client/layout/headers/app/ClientAppHeader.jsx'
import ClientAppShell from '../../client/layout/shells/ClientAppShell.jsx'
import 'swiper/css'
import 'swiper/css/navigation'

const userLibraryFilters = [
  { id: 'all', label: 'Tất cả' },
  { id: 'playlist', label: 'Danh sách phát' },
  { id: 'album', label: 'Album' },
  { id: 'artist', label: 'Nghệ sĩ' },
]

function SectionMoreLink({ href }) {
  return (
    <Link
      draggable="false"
      className="FOjXJqlCvEIMzJBF mbwNxmJkaTgwmZSP section-more-link hidden sm:flex"
      to={href}
    >
      <span
        className="e-10310-text encore-text-body-small-bold encore-internal-color-text-subdued"
        data-encore-id="text"
      >
        Hiện tất cả
      </span>
    </Link>
  )
}

function getUserDisplayName(user) {
  if (user?.displayName) {
    return user.displayName
  }

  if (user?.email) {
    return user.email.split('@')[0]
  }

  return 'bạn'
}

function getUserInitials(user) {
  const source = getUserDisplayName(user)
  const segments = source
    .split(' ')
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 2)

  return segments.map((item) => item[0]?.toUpperCase() || '').join('') || 'TM'
}

function getUserPlanMeta(user) {
  const isPremium = Boolean(user?.entitlements?.isPremium)

  if (isPremium) {
    return {
      label: 'Cao cấp',
      detail: 'Không quảng cáo, tải xuống ngoại tuyến và chất lượng lossless đã sẵn sàng.',
      badgeClass:
        'border-[color:rgba(41,212,255,0.28)] bg-[color:rgba(41,212,255,0.12)] text-[color:#dff8ff]',
    }
  }

  return {
    label: 'Miễn phí',
    detail: 'Bạn đang ở gói nghe cơ bản. Luồng nâng cấp gói sẽ được hoàn thiện ở bước tiếp theo.',
    badgeClass:
      'border-[color:rgba(255,255,255,0.12)] bg-[color:rgba(255,255,255,0.05)] text-[color:var(--text-secondary)]',
  }
}

function formatPlaybackSeconds(value) {
  const safeValue = Number.isFinite(value) && value >= 0 ? Math.floor(value) : 0
  const minutes = Math.floor(safeValue / 60)
  const seconds = String(safeValue % 60).padStart(2, '0')

  return `${minutes}:${seconds}`
}

function getPlayerTrackSubtitle(track) {
  if (!track) {
    return ''
  }

  return [track.tag || 'Track', track.artist].filter(Boolean).join(' / ')
}

function normalizeArtistLookup(value = '') {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function getPrimaryArtistName(value = '') {
  return String(value)
    .split(/\/|,|&|\s+feat\.?\s+|\s+ft\.?\s+/i)
    .map((item) => item.trim())
    .filter(Boolean)[0] || value || 'Nghệ sĩ'
}

function getArtistProfileForTrack(track, artists = []) {
  const artistName = track?.artist || ''
  const lookupKeys = [
    artistName,
    getPrimaryArtistName(artistName),
    ...(artistName.match(/[A-Za-zÀ-ỹ0-9\s]+/g) || []),
  ]
    .map(normalizeArtistLookup)
    .filter(Boolean)

  const primaryArtistName = getPrimaryArtistName(artistName)
  const artistRecord = artists.find((artist) =>
    [artist.name, ...(artist.aliases || [])]
      .map(normalizeArtistLookup)
      .some((artistKey) =>
        lookupKeys.some((lookupKey) => artistKey === lookupKey || lookupKey.includes(artistKey) || artistKey.includes(lookupKey)),
      ),
  )

  if (artistRecord) {
    return {
      ...artistRecord,
      statsLabel: artistRecord.statsLabel || artistRecord.meta || 'Nghệ sĩ',
      credits:
        Array.isArray(artistRecord.credits) && artistRecord.credits.length > 0
          ? artistRecord.credits
          : [{ name: artistRecord.name, role: 'Main Artist' }],
    }
  }

  return {
    name: primaryArtistName,
    aliases: [artistName].filter(Boolean),
    realName: '',
    sourceLabel: 'TMusic',
    sourceUrl: '',
    statsLabel: 'Hồ sơ nghệ sĩ đang chờ import',
    verified: false,
    imageUrl: artistRecord?.imageUrl || '',
    artwork: artistRecord?.artwork,
    bio: 'Thông tin nghệ sĩ chưa có trong DB. Hãy import từ Wiki trong trang quản trị nghệ sĩ.',
    credits: [{ name: primaryArtistName, role: 'Main Artist' }],
  }
}

function isSameArtist(candidateArtist = '', profile, track) {
  const lookupKeys = [
    candidateArtist,
    getPrimaryArtistName(candidateArtist),
  ]
    .map(normalizeArtistLookup)
    .filter(Boolean)
  const profileKeys = [
    profile?.name,
    ...(profile?.aliases || []),
    track?.artist,
    getPrimaryArtistName(track?.artist || ''),
  ]
    .map(normalizeArtistLookup)
    .filter(Boolean)

  return profileKeys.some((profileKey) =>
    lookupKeys.some((lookupKey) => lookupKey === profileKey || lookupKey.includes(profileKey) || profileKey.includes(lookupKey)),
  )
}

function getArtistQueueItems(profile, track, songs = []) {
  return songs
    .filter((candidate) => candidate?.id !== track?.id && isSameArtist(candidate.artist, profile, track))
    .map((candidate) => ({
      ...candidate,
      imageUrl: candidate.coverUrl,
      isPlayable: Boolean(candidate.audioUrl),
    }))
    .slice(0, 8)
}

function getAdjacentPlayableTrack(playableTracks, currentTrackId, direction, shuffleEnabled) {
  if (!Array.isArray(playableTracks) || playableTracks.length === 0) {
    return null
  }

  if (shuffleEnabled && playableTracks.length > 1) {
    const candidateTracks = playableTracks.filter((track) => track.id !== currentTrackId)
    const randomIndex = Math.floor(Math.random() * candidateTracks.length)
    return candidateTracks[randomIndex] || playableTracks[0]
  }

  const currentIndex = playableTracks.findIndex((track) => track.id === currentTrackId)
  const startIndex = currentIndex >= 0 ? currentIndex : direction > 0 ? -1 : 0
  const targetIndex = (startIndex + direction + playableTracks.length) % playableTracks.length

  return playableTracks[targetIndex] || playableTracks[0]
}

function getNextRepeatMode(mode) {
  if (mode === 'all') {
    return 'one'
  }

  if (mode === 'one') {
    return 'off'
  }

  return 'all'
}

function getRepeatModeTooltip(mode) {
  if (mode === 'all') {
    return 'Đang lặp lại danh sách. Bấm để chuyển sang lặp 1 bài'
  }

  if (mode === 'one') {
    return 'Đang lặp lại 1 bài. Bấm để tắt lặp lại'
  }

  return 'Đang tắt lặp lại. Bấm để bật lặp lại danh sách'
}

function getShuffleTooltip(enabled) {
  return enabled ? 'Tắt trộn bài' : 'Bật trộn bài'
}

function getTrackPlaybackTooltip(track, activeTrack, playing, isAuthenticated) {
  if (!track?.audioUrl) {
    return `Bài ${track?.title || ''} chưa có audio`
  }

  if (!isAuthenticated) {
    return `Đăng nhập để phát ${track.title}`
  }

  if (activeTrack?.id === track.id && playing) {
    return `Tạm dừng ${track.title}`
  }

  return `Phát ${track.title}`
}

function getPlayerPlaybackTooltip(playing, track) {
  if (!track) {
    return 'Phát'
  }

  return playing ? `Tạm dừng ${track.title}` : `Phát ${track.title}`
}

function getMuteTooltip(volume) {
  return volume === 0 ? 'Bật âm thanh' : 'Tắt âm thanh'
}

function getTrackMediaUrl(track, mode = 'audio') {
  if (mode === 'video' && track?.videoUrl) {
    return track.videoUrl
  }

  return track?.audioUrl || ''
}

const MUSIC_VIDEO_PREVIEW_SECONDS = 8
const DIRECT_VIDEO_EXTENSION_PATTERN = /\.(mp4|webm|ogg|ogv|mov|m4v)(\?.*)?$/i
const CLOUDINARY_VIDEO_PATTERN = /res\.cloudinary\.com\/.+\/video\/upload\//i

function isDirectVideoUrl(url = '') {
  const normalizedUrl = String(url || '').trim()

  return CLOUDINARY_VIDEO_PATTERN.test(normalizedUrl) || DIRECT_VIDEO_EXTENSION_PATTERN.test(normalizedUrl)
}

function getTrendingNavigationState(swiper) {
  if (!swiper) {
    return {
      isBeginning: true,
      isEnd: true,
    }
  }

  const isLocked = Boolean(swiper.isLocked)

  return {
    isBeginning: isLocked || Boolean(swiper.isBeginning),
    isEnd: isLocked || Boolean(swiper.isEnd),
  }
}

function PlayerIconButton({ active = false, className = '', children, title, 'aria-label': ariaLabel, ...props }) {
  const classes = ['player-icon-button', active ? 'player-icon-button-active' : '', className]
    .filter(Boolean)
    .join(' ')

  return (
    <button type="button" className={classes} aria-label={ariaLabel} title={title ?? ariaLabel} {...props}>
      {children}
    </button>
  )
}

function DemoCover({ item, className = '' }) {
  if (item.imageUrl) {
    return <img src={item.imageUrl} alt={item.title} className={className} />
  }

  if (item.liked) {
    return (
      <div className={`${className} grid place-items-center bg-gradient-to-br from-[#5236ff] to-[#bbf7d0]`}>
        <span className="text-2xl">♥</span>
      </div>
    )
  }

  return (
    <div
      className={`${className} grid place-items-center`}
      style={{ backgroundImage: item.artwork || 'linear-gradient(135deg, #2a2a2a, #101010)' }}
    >
      <span className="font-display text-lg font-extrabold text-white">
        {(item.title || 'TM').slice(0, 2).toUpperCase()}
      </span>
    </div>
  )
}

function DemoPlayBadge({
  item,
  currentTrack,
  isPlaying,
  isBuffering,
  className = '',
  onClick,
}) {
  const isActive = Boolean(item?.track?.id && currentTrack?.id === item.track.id)

  return (
    <button
      type="button"
      className={`grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[color:var(--primary)] text-[#221017] shadow-[0_10px_22px_rgba(255,141,154,0.18)] transition hover:scale-105 hover:bg-[color:var(--primary-hover)] ${className}`}
      aria-label={`${isActive && isPlaying ? 'Tạm dừng' : 'Phát'} ${item.title}`}
      title={`${isActive && isPlaying ? 'Tạm dừng' : 'Phát'} ${item.title}`}
      onClick={(event) => {
        event.stopPropagation()
        onClick?.(event)
      }}
    >
      {isActive && isBuffering ? (
        <span className="player-loading-dot" />
      ) : isActive && isPlaying ? (
        <PauseIcon />
      ) : (
        <PlayIcon />
      )}
    </button>
  )
}

function HomePage() {
  const navigate = useNavigate()
  const artistCarouselRef = useRef(null)
  const audioRef = useRef(null)
  const videoPlayerRef = useRef(null)
  const lastVolumeRef = useRef(72)
  const currentTrackRef = useRef(null)
  const playableTracksRef = useRef([])
  const isShuffleEnabledRef = useRef(false)
  const isPlayingRef = useRef(false)
  const isVideoModeRef = useRef(false)
  const repeatModeRef = useRef('all')
  const trendingSwiperRef = useRef(null)
  const { health, homeContent, isLive } = useHomePageData()
  const { user, loading: authLoading, isAuthenticated, logout } = useAuthSession()
  const [currentTrack, setCurrentTrack] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isBuffering, setIsBuffering] = useState(false)
  const [isVideoMode, setIsVideoMode] = useState(false)
  const [isShuffleEnabled, setIsShuffleEnabled] = useState(false)
  const [repeatMode, setRepeatMode] = useState('all')
  const [playbackError, setPlaybackError] = useState('')
  const [currentTime, setCurrentTime] = useState(0)
  const [durationSeconds, setDurationSeconds] = useState(0)
  const [volumeLevel, setVolumeLevel] = useState(72)
  const [playbackGateTrack, setPlaybackGateTrack] = useState(null)
  const [installPromptEvent, setInstallPromptEvent] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeUserLibraryFilter, setActiveUserLibraryFilter] = useState('all')
  const [showAllArtistCredits, setShowAllArtistCredits] = useState(false)
  const [isArtistQueueExpanded, setIsArtistQueueExpanded] = useState(false)
  const [trendingNavigationState, setTrendingNavigationState] = useState(() => getTrendingNavigationState(null))

  const userDisplayName = useMemo(() => getUserDisplayName(user), [user])
  const userInitials = useMemo(() => getUserInitials(user), [user])
  const userPlanMeta = useMemo(() => getUserPlanMeta(user), [user])
  const playableTracks = useMemo(
    () => homeContent.songs.filter((track) => Boolean(track.audioUrl)),
    [homeContent.songs],
  )
  const userAlbumItems = useMemo(() => {
    return buildUserAlbumItems({
      homeContent,
      playableTracks,
      userDisplayName,
    })
  }, [homeContent, playableTracks, userDisplayName])
  const filteredUserAlbumItems = useMemo(() => {
    if (activeUserLibraryFilter === 'all') {
      return userAlbumItems
    }

    return userAlbumItems.filter((item) => item.type === activeUserLibraryFilter)
  }, [activeUserLibraryFilter, userAlbumItems])
  const userMixItems = useMemo(() => {
    return buildUserMixItems({
      homeContent,
      playableTracks,
    })
  }, [homeContent, playableTracks])
  const suggestedRadioItems = useMemo(() => {
    return buildSuggestedRadioItems({
      homeContent,
      playableTracks,
    })
  }, [homeContent, playableTracks])
  const searchSuggestions = useMemo(
    () => [
      ...homeContent.songs.slice(0, 6).map((track, index) => ({
        type: 'Bài hát',
        title: track.title,
        subtitle: track.artist || track.tag || 'TMusic',
        imageUrl: track.coverUrl || trackMockImages[index % trackMockImages.length] || '',
        query: track.title,
      })),
      ...homeContent.artists.slice(0, 4).map((artist, index) => ({
        type: 'Nghệ sĩ',
        title: artist.name,
        subtitle: artist.meta || 'Nghệ sĩ',
        imageUrl: artist.imageUrl || artistMockImages[index % artistMockImages.length] || '',
        query: artist.name,
      })),
      ...homeContent.albums.slice(0, 4).map((album, index) => ({
        type: 'Album',
        title: album.title,
        subtitle: album.artist || 'Album',
        imageUrl: album.coverUrl || albumMockImages[index % albumMockImages.length] || '',
        query: album.title,
      })),
    ],
    [homeContent.albums, homeContent.artists, homeContent.songs],
  )

  const syncTrendingNavigationState = (swiper) => {
    const nextState = getTrendingNavigationState(swiper)

    setTrendingNavigationState((currentState) => {
      if (
        currentState.isBeginning === nextState.isBeginning &&
        currentState.isEnd === nextState.isEnd
      ) {
        return currentState
      }

      return nextState
    })
  }

  const handleTrendingSwiperMount = (swiper) => {
    trendingSwiperRef.current = swiper
    syncTrendingNavigationState(swiper)
  }

  const handleTrendingNavigation = (direction) => {
    const swiper = trendingSwiperRef.current

    if (!swiper || swiper.destroyed || swiper.isLocked) {
      return
    }

    const nextIndex =
      direction > 0
        ? Math.min(swiper.activeIndex + 3, swiper.slides.length - 1)
        : Math.max(swiper.activeIndex - 3, 0)

    swiper.slideTo(nextIndex)
  }

  const getTrackCover = (track) => track?.coverUrl || ''

  const currentTrackCover = getTrackCover(currentTrack)
  const playbackGateTrackCover = getTrackCover(playbackGateTrack)
  const currentTrackSubtitle = useMemo(() => getPlayerTrackSubtitle(currentTrack), [currentTrack])
  const currentArtistProfile = useMemo(
    () => (currentTrack ? getArtistProfileForTrack(currentTrack, homeContent.artists) : null),
    [currentTrack, homeContent.artists],
  )
  const currentArtistQueueItems = useMemo(
    () => getArtistQueueItems(currentArtistProfile, currentTrack, homeContent.songs),
    [currentArtistProfile, currentTrack, homeContent.songs],
  )
  const visibleArtistCredits = showAllArtistCredits
    ? currentArtistProfile?.credits || []
    : (currentArtistProfile?.credits || []).slice(0, 2)
  const visibleArtistQueueItems = isArtistQueueExpanded
    ? currentArtistQueueItems
    : currentArtistQueueItems.slice(0, 1)
  const hasCurrentTrackVideo = Boolean(currentTrack?.videoUrl)
  const layoutBottomSpacingClass = currentTrack
    ? 'pb-[12.5rem] sm:pb-[8rem]'
    : isAuthenticated
      ? 'pb-0'
      : 'pb-[86px]'
  const contentBottomSpacingClass = currentTrack
    ? 'pb-[11rem] sm:pb-[7rem]'
    : 'pb-10'
  const playbackProgress =
    durationSeconds > 0 ? Math.min((currentTime / durationSeconds) * 100, 100) : 0

  const getActiveMediaElement = () => (isVideoModeRef.current ? videoPlayerRef.current : audioRef.current)

  useEffect(() => {
    currentTrackRef.current = currentTrack
    playableTracksRef.current = playableTracks
    isShuffleEnabledRef.current = isShuffleEnabled
    isPlayingRef.current = isPlaying
    isVideoModeRef.current = isVideoMode
    repeatModeRef.current = repeatMode
  }, [currentTrack, playableTracks, isPlaying, isShuffleEnabled, isVideoMode, repeatMode])

  useEffect(() => {
    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault()
      setInstallPromptEvent(event)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      setPlaybackGateTrack(null)
    }
  }, [isAuthenticated])

  useEffect(() => {
    setShowAllArtistCredits(false)
    setIsArtistQueueExpanded(false)
  }, [currentTrack?.id])

  useEffect(() => {
    const audio = audioRef.current
    const video = videoPlayerRef.current

    if (!audio && !video) {
      return undefined
    }

    const isActiveMediaEvent = (event) => event.currentTarget === getActiveMediaElement()

    const handlePlay = (event) => {
      if (!isActiveMediaEvent(event)) {
        return
      }

      setIsPlaying(true)
      setIsBuffering(false)
      setPlaybackError('')
    }

    const handlePause = (event) => {
      if (!isActiveMediaEvent(event)) {
        return
      }

      setIsPlaying(false)
      setIsBuffering(false)
    }

    const handleEnded = async (event) => {
      if (!isActiveMediaEvent(event)) {
        return
      }

      if (repeatModeRef.current === 'all') {
        const nextTrack = getAdjacentPlayableTrack(
          playableTracksRef.current,
          currentTrackRef.current?.id,
          1,
          isShuffleEnabledRef.current,
        )

        if (nextTrack?.audioUrl) {
          try {
            setPlaybackError('')
            setIsBuffering(true)
            setCurrentTrack(nextTrack)
            setCurrentTime(0)
            setDurationSeconds(0)

            if (currentTrackRef.current?.id === nextTrack.id) {
              audio.currentTime = 0
            } else {
              audio.src = getTrackMediaUrl(nextTrack, 'audio')
            }

            isVideoModeRef.current = false
            setIsVideoMode(false)
            video?.pause()
            await audio.play()
            return
          } catch {
            setPlaybackError('Trình duyệt đã chặn phát tự động. Hãy bấm lại.')
          }
        }
      }

      setIsPlaying(false)
      setCurrentTime(0)
    }

    const handleTimeUpdate = (event) => {
      if (!isActiveMediaEvent(event)) {
        return
      }

      setCurrentTime(event.currentTarget?.currentTime || 0)
    }

    const handleLoadedMetadata = (event) => {
      if (!isActiveMediaEvent(event)) {
        return
      }

      setDurationSeconds(event.currentTarget?.duration || 0)
    }

    const handlePlaybackFailure = (event) => {
      if (!isActiveMediaEvent(event)) {
        return
      }

      setIsBuffering(false)
      setPlaybackError('Không thể phát bài nhạc này lúc này.')
      setIsPlaying(false)
    }

    const handleWaiting = (event) => {
      if (!isActiveMediaEvent(event)) {
        return
      }

      setIsBuffering(true)
    }

    const handlePlaying = (event) => {
      if (!isActiveMediaEvent(event)) {
        return
      }

      setIsBuffering(false)
    }

    const mediaElements = [audio, video].filter(Boolean)

    for (const mediaElement of mediaElements) {
      mediaElement.addEventListener('play', handlePlay)
      mediaElement.addEventListener('pause', handlePause)
      mediaElement.addEventListener('ended', handleEnded)
      mediaElement.addEventListener('timeupdate', handleTimeUpdate)
      mediaElement.addEventListener('loadedmetadata', handleLoadedMetadata)
      mediaElement.addEventListener('waiting', handleWaiting)
      mediaElement.addEventListener('playing', handlePlaying)
      mediaElement.addEventListener('error', handlePlaybackFailure)
    }

    return () => {
      for (const mediaElement of mediaElements) {
        mediaElement.removeEventListener('play', handlePlay)
        mediaElement.removeEventListener('pause', handlePause)
        mediaElement.removeEventListener('ended', handleEnded)
        mediaElement.removeEventListener('timeupdate', handleTimeUpdate)
        mediaElement.removeEventListener('loadedmetadata', handleLoadedMetadata)
        mediaElement.removeEventListener('waiting', handleWaiting)
        mediaElement.removeEventListener('playing', handlePlaying)
        mediaElement.removeEventListener('error', handlePlaybackFailure)
      }
    }
  }, [currentTrack?.id, hasCurrentTrackVideo])

  useEffect(() => {
    const mediaElements = [audioRef.current, videoPlayerRef.current].filter(Boolean)

    for (const mediaElement of mediaElements) {
      mediaElement.loop = repeatMode === 'one'
    }
  }, [currentTrack?.id, hasCurrentTrackVideo, repeatMode])

  useEffect(() => {
    const mediaElements = [audioRef.current, videoPlayerRef.current].filter(Boolean)

    for (const mediaElement of mediaElements) {
      mediaElement.volume = volumeLevel / 100
    }
  }, [currentTrack?.id, hasCurrentTrackVideo, volumeLevel])

  useEffect(() => {
    const previewVideo = videoPlayerRef.current

    if (!previewVideo || !currentTrack?.videoUrl || isVideoMode || !isDirectVideoUrl(currentTrack.videoUrl)) {
      return undefined
    }

    previewVideo.src = currentTrack.videoUrl
    previewVideo.currentTime = 0
    previewVideo.muted = true
    previewVideo.loop = false

    const handlePreviewTimeUpdate = () => {
      if (previewVideo.currentTime >= MUSIC_VIDEO_PREVIEW_SECONDS) {
        previewVideo.currentTime = 0

        if (isPlayingRef.current) {
          void previewVideo.play().catch(() => {})
        }
      }
    }

    previewVideo.addEventListener('timeupdate', handlePreviewTimeUpdate)

    if (isPlayingRef.current) {
      void previewVideo.play().catch(() => {})
    }

    return () => {
      previewVideo.removeEventListener('timeupdate', handlePreviewTimeUpdate)

      if (!isVideoModeRef.current) {
        previewVideo.pause()
        previewVideo.removeAttribute('src')
        previewVideo.load()
      }
    }
  }, [currentTrack?.id, currentTrack?.videoUrl, isVideoMode])

  useEffect(() => {
    const previewVideo = videoPlayerRef.current

    if (!previewVideo || !currentTrack?.videoUrl || isVideoMode || !isDirectVideoUrl(currentTrack.videoUrl)) {
      return
    }

    previewVideo.muted = true

    if (isPlaying) {
      void previewVideo.play().catch(() => {})
    } else {
      previewVideo.pause()
    }
  }, [currentTrack?.id, currentTrack?.videoUrl, isPlaying, isVideoMode])

  const scrollArtistsPrev = () => {
    artistCarouselRef.current?.scrollBy({
      left: -320,
      behavior: 'smooth',
    })
  }

  const scrollArtistsNext = () => {
    artistCarouselRef.current?.scrollBy({
      left: 320,
      behavior: 'smooth',
    })
  }

  const handleLogout = () => {
    logout()
    window.location.assign('/')
  }

  const handleSearchSubmit = (event) => {
    event.preventDefault()

    const query = searchQuery.trim()

    if (!query) {
      return
    }

    navigate(`/search?q=${encodeURIComponent(query)}`)
  }

  const handleSearchSuggestionSelect = (item) => {
    const query = item?.query || item?.title || ''

    if (!query.trim()) {
      return
    }

    setSearchQuery(query)
    navigate(`/search?q=${encodeURIComponent(query)}`)
  }

  const openPlaybackGate = (track) => {
    setPlaybackError('')
    setPlaybackGateTrack(track)
  }

  const handleClosePlaybackGate = () => {
    setPlaybackGateTrack(null)
  }

  const handleInstallApp = async () => {
    if (!installPromptEvent) {
      return
    }

    try {
      installPromptEvent.prompt()
      const choiceResult = await installPromptEvent.userChoice

      if (choiceResult?.outcome === 'accepted') {
        setPlaybackGateTrack(null)
      }
    } finally {
      setInstallPromptEvent(null)
    }
  }

  const playTrack = async (track) => {
    const audio = audioRef.current
    const video = videoPlayerRef.current

    if (!audio || !track?.audioUrl) {
      setPlaybackError('Bài nhạc này chưa có file audio để phát.')
      return
    }

    if (authLoading) {
      setPlaybackError('Đang kiểm tra phiên đăng nhập. Hãy thử lại sau ít giây.')
      return
    }

    if (!isAuthenticated) {
      openPlaybackGate(track)
      return
    }

    const isSameTrack = currentTrack?.id === track.id
    const previousVideoTime = video?.currentTime || currentTime || 0
    const wasVideoMode = isVideoModeRef.current

    setPlaybackError('')
    setIsBuffering(true)
    setCurrentTrack(track)
    isVideoModeRef.current = false
    setIsVideoMode(false)
    video?.pause()

    if (video) {
      video.muted = true
    }

    if (!isSameTrack) {
      setCurrentTime(0)
      setDurationSeconds(0)
      audio.src = getTrackMediaUrl(track, 'audio')
    } else if (wasVideoMode && Number.isFinite(previousVideoTime) && previousVideoTime > 0) {
      audio.currentTime = Math.min(previousVideoTime, audio.duration || previousVideoTime)
      setCurrentTime(audio.currentTime || previousVideoTime)
    }

    try {
      await audio.play()
    } catch {
      setPlaybackError('Trình duyệt đã chặn phát tự động. Hãy bấm lại.')
    }
  }

  const handleToggleTrackPlayback = async (track) => {
    const media = getActiveMediaElement()

    if (!media || !track?.audioUrl) {
      setPlaybackError('Bài nhạc này chưa có file audio để phát.')
      return
    }

    if (authLoading) {
      setPlaybackError('Đang kiểm tra phiên đăng nhập. Hãy thử lại sau ít giây.')
      return
    }

    if (!isAuthenticated) {
      openPlaybackGate(track)
      return
    }

    setPlaybackError('')

    if (currentTrack?.id === track.id) {
      if (media.paused) {
        try {
          setIsBuffering(true)
          await media.play()
        } catch {
          setPlaybackError('Trình duyệt đã chặn phát tự động. Hãy bấm lại.')
        }
      } else {
        media.pause()
      }

      return
    }

    await playTrack(track)
  }

  const handleOpenAlbumItem = (item) => {
    if (authLoading) {
      return
    }

    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    navigate(buildAlbumPath(item), {
      state: {
        albumItem: item,
      },
    })
  }

  const handleDemoPlaybackClick = async (item) => {
    if (!item?.track) {
      setPlaybackError('Mục này chưa có bài hát demo để phát.')
      return
    }

    if (currentTrack?.id === item.track.id && isVideoModeRef.current) {
      await playTrack(item.track)
      return
    }

    await handleToggleTrackPlayback(item.track)
  }

  const handleQueueItemClick = async (item) => {
    if (!item?.audioUrl) {
      setPlaybackError('Bài trong hàng đợi hiện đang là dữ liệu giả. Bạn có thể import audio sau.')
      return
    }

    await playTrack(item)
  }

  const handleToggleVideoMode = async () => {
    const audio = audioRef.current
    const video = videoPlayerRef.current

    if (!audio || !video || !currentTrack?.audioUrl) {
      return
    }

    const nextMode = isVideoMode ? 'audio' : 'video'
    const nextSource = getTrackMediaUrl(currentTrack, nextMode)

    if (!nextSource) {
      setPlaybackError('Bài này chưa có music video.')
      return
    }

    if (nextMode === 'video' && !isDirectVideoUrl(nextSource)) {
      setPlaybackError('Link MV hiện tại không phải file video trực tiếp. Hãy dùng MP4/WebM hoặc upload video lên Cloudinary.')
      return
    }

    const fromMedia = isVideoMode ? video : audio
    const toMedia = nextMode === 'video' ? video : audio
    const previousTime = fromMedia.currentTime || currentTime || 0
    const shouldResume = !fromMedia.paused

    setPlaybackError('')
    setIsBuffering(shouldResume)
    isVideoModeRef.current = nextMode === 'video'
    fromMedia.pause()
    video.muted = nextMode !== 'video'
    toMedia.src = nextSource
    toMedia.load()

    const seekAndMaybePlay = async () => {
      if (Number.isFinite(previousTime) && previousTime > 0) {
        toMedia.currentTime = Math.min(previousTime, toMedia.duration || previousTime)
        setCurrentTime(toMedia.currentTime || previousTime)
      }

      if (shouldResume) {
        try {
          await toMedia.play()
        } catch {
          setPlaybackError('Trình duyệt đã chặn phát tự động. Hãy bấm lại.')
          setIsBuffering(false)
        }
      } else {
        setIsBuffering(false)
      }
    }

    setIsVideoMode(nextMode === 'video')

    if (toMedia.readyState >= 1) {
      await seekAndMaybePlay()
      return
    }

    toMedia.addEventListener('loadedmetadata', () => void seekAndMaybePlay(), { once: true })
  }

  const handleSkipTrack = async (direction) => {
    const targetTrack = getAdjacentPlayableTrack(
      playableTracks,
      currentTrack?.id,
      direction,
      isShuffleEnabled,
    )

    if (!targetTrack) {
      return
    }

    await playTrack(targetTrack)
  }

  const handleCycleRepeatMode = () => {
    setRepeatMode((currentMode) => getNextRepeatMode(currentMode))
  }

  const handleSeekTrack = (event) => {
    const media = getActiveMediaElement()
    const nextTime = Number(event.target.value)

    if (!media || !Number.isFinite(nextTime)) {
      return
    }

    media.currentTime = nextTime
    setCurrentTime(nextTime)
  }

  const handleVolumeChange = (event) => {
    const nextVolume = Number(event.target.value)

    setVolumeLevel(nextVolume)

    if (nextVolume > 0) {
      lastVolumeRef.current = nextVolume
    }
  }

  const handleToggleMute = () => {
    setVolumeLevel((currentValue) => {
      if (currentValue === 0) {
        return lastVolumeRef.current || 72
      }

      lastVolumeRef.current = currentValue
      return 0
    })
  }

  const heroStatusText = authLoading
    ? 'Đang khôi phục phiên đăng nhập...'
    : isAuthenticated
      ? `Chào ${userDisplayName}, tiếp tục khám phá âm nhạc dành cho bạn.`
      : homeContent.loading
        ? 'Đang tải danh sách...'
        : health.error
          ? 'Đang hiển thị dữ liệu mẫu.'
          : 'Không gian phát dành riêng cho bạn'

  return (
    <ClientAppShell
      fullHeight
      header={
        <ClientAppHeader
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          onSearchSubmit={handleSearchSubmit}
          searchSuggestions={searchSuggestions}
          onSearchSuggestionSelect={handleSearchSuggestionSelect}
          isAuthenticated={isAuthenticated}
          user={user}
          userInitials={userInitials}
          userDisplayName={userDisplayName}
          onLogout={handleLogout}
        />
      }
    >
      <div
          className={`grid flex-1 gap-2.5 ${layoutBottomSpacingClass} xl:min-h-0 xl:overflow-hidden ${
            hasCurrentTrackVideo
              ? 'xl:grid-cols-[372px_minmax(0,1fr)_360px]'
              : 'xl:grid-cols-[372px_minmax(0,1fr)]'
          }`}
        >
          <aside className="panel-surface flex min-h-[320px] flex-col overflow-hidden xl:h-full xl:min-h-0">
            <div className="flex items-center justify-between px-5 py-4.5">
              <div className="flex items-center gap-3 text-[color:var(--text-primary)]">
                <LibraryIcon />
                <h2 className="font-display text-[1.3rem] font-extrabold tracking-tight">
                  Thư viện
                </h2>
              </div>

              <button className="secondary-button inline-flex items-center gap-2">
                <PlusIcon />
                Tạo
              </button>
            </div>

            <div className="hide-scrollbar flex-1 overflow-y-auto px-3.5 pb-4">
              {isAuthenticated ? (
                <div className="space-y-2.5">
                  <div className="flex flex-wrap gap-2 px-1 pb-2">
                    <button
                      type="button"
                      className="secondary-button px-4 py-2"
                      aria-pressed={activeUserLibraryFilter === 'playlist'}
                      onClick={() => setActiveUserLibraryFilter('playlist')}
                    >
                      Playlist
                    </button>
                    <button
                      type="button"
                      className="secondary-button px-4 py-2"
                      aria-pressed={activeUserLibraryFilter === 'artist'}
                      onClick={() => setActiveUserLibraryFilter('artist')}
                    >
                      Nghệ sĩ
                    </button>
                  </div>
                  <div className="flex items-center justify-between px-2 py-2 text-[color:var(--text-secondary)]">
                    <SearchIcon />
                    <span className="text-sm font-bold">Gần đây</span>
                  </div>
                  {userAlbumItems.map((item, index) => (
                    <div
                      key={`${item.title}-${index}`}
                      className="flex w-full items-center gap-3 rounded-[8px] p-2 text-left transition hover:bg-white/8"
                    >
                      <button
                        type="button"
                        onClick={() => handleOpenAlbumItem(item)}
                        className="flex min-w-0 flex-1 items-center gap-3 text-left"
                        aria-label={`Mở ${item.title}`}
                      >
                        <DemoCover item={item} className="h-14 w-14 shrink-0 rounded-[6px] object-cover" />
                        <span className="min-w-0">
                          <strong className="block truncate text-[0.98rem] text-[color:var(--text-primary)]">
                            {item.title}
                          </strong>
                          <small className="mt-1 block truncate text-[0.84rem] font-semibold text-[color:var(--text-secondary)]">
                            {item.subtitle}
                          </small>
                        </span>
                      </button>
                      <DemoPlayBadge
                        item={item}
                        currentTrack={currentTrack}
                        isPlaying={isPlaying}
                        isBuffering={isBuffering}
                        className="ml-auto h-8 w-8 opacity-90"
                        onClick={() => void handleDemoPlaybackClick(item)}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3.5">
                  {libraryPrompts.map((item) => (
                    <section key={item.title} className="library-card">
                      <h3 className="font-display text-[1rem] font-bold leading-7 text-[color:var(--text-primary)]">
                        {item.title}
                      </h3>
                      <p className="mt-2.5 max-w-[17rem] text-[0.92rem] leading-7 text-[color:var(--text-secondary)]">
                        {item.description}
                      </p>
                      {item.path ? (
                        <Link to={item.path} className="primary-button mt-6">
                          {item.action}
                        </Link>
                      ) : (
                        <button className="primary-button mt-6">{item.action}</button>
                      )}
                    </section>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-5 px-5 pb-5 pt-2">
              <div className="flex flex-wrap gap-x-4 gap-y-2 text-[0.84rem] leading-6 text-[color:var(--text-secondary)]">
                {footerLinks.map((item) => (
                  <Link
                    key={item.label}
                    to={item.path}
                    className="transition hover:text-[color:var(--text-primary)] hover:underline hover:underline-offset-4"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>

              <button className="language-button" title="Doi ngon ngu hien thi">
                <GlobeIcon />
                Tiếng Việt
              </button>
            </div>
          </aside>

          <main className="panel-surface relative overflow-hidden xl:min-h-0">
            <div className="content-veil" />

            <div
              className={`hide-scrollbar relative h-full overflow-y-auto overscroll-contain px-4 ${contentBottomSpacingClass} pt-6 sm:px-6 lg:px-8`}
            >
              <audio ref={audioRef} preload="none" />

              {isAuthenticated ? (
                <>
                  <section>
                    <div className="mb-6 flex flex-wrap gap-2">
                      {userLibraryFilters.map((filter) => {
                        const isActiveFilter = activeUserLibraryFilter === filter.id

                        return (
                          <button
                            key={filter.id}
                            type="button"
                            aria-pressed={isActiveFilter}
                            onClick={() => setActiveUserLibraryFilter(filter.id)}
                            className={`rounded-[10px] border px-4 py-2 text-sm font-bold transition ${
                              isActiveFilter
                                ? 'border-[color:rgba(255,141,154,0.42)] bg-[color:rgba(255,141,154,0.18)] text-white'
                                : 'border-white/10 bg-white/10 text-[color:var(--text-primary)] hover:bg-white/16'
                            }`}
                          >
                            {filter.label}
                          </button>
                        )
                      })}
                    </div>

                    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                      {filteredUserAlbumItems.map((item, index) => (
                        <div
                          key={`${item.title}-shortcut-${index}`}
                          className="group flex min-h-[3.75rem] items-center overflow-hidden rounded-[6px] bg-white/10 text-left transition hover:bg-white/16"
                        >
                          <button
                            type="button"
                            onClick={() => handleOpenAlbumItem(item)}
                            className="flex min-w-0 flex-1 items-center text-left"
                            aria-label={`Mở ${item.title}`}
                          >
                            <DemoCover item={item} className="h-16 w-16 shrink-0 object-cover" />
                            <span className="min-w-0 px-3">
                              <strong className="block truncate text-[0.98rem] text-[color:var(--text-primary)]">
                                {item.title}
                              </strong>
                              <small className="mt-1 block truncate text-[0.78rem] font-semibold text-[color:var(--text-secondary)]">
                                {item.subtitle}
                              </small>
                            </span>
                          </button>
                          <DemoPlayBadge
                            item={item}
                            currentTrack={currentTrack}
                            isPlaying={isPlaying}
                            isBuffering={isBuffering}
                            className="ml-auto mr-3 opacity-90"
                            onClick={() => void handleDemoPlaybackClick(item)}
                          />
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="mt-9">
                    <div className="mb-5 flex items-end justify-between gap-4">
                      <div>
                        <p className="text-[0.86rem] font-semibold text-[color:var(--text-secondary)]">
                          Không gian của bạn
                        </p>
                        <h1 className="font-display text-[1.9rem] font-extrabold tracking-tight text-[color:var(--text-primary)] sm:text-[2.25rem]">
                          Gợi ý cho {userDisplayName}
                        </h1>
                      </div>
                      <SectionMoreLink href="/section/for-you" />
                    </div>

                    <div className="hide-scrollbar -mx-2 overflow-x-auto pb-4">
                      <div className="flex min-w-max gap-3 px-2">
                        {userMixItems.map((item, index) => (
                          <article
                            key={`${item.title}-${index}`}
                            className="track-card group w-[190px] shrink-0 p-2.5 text-left"
                          >
                            <div className="relative">
                              <button
                                type="button"
                                className="block w-full"
                                onClick={() => handleOpenAlbumItem(item)}
                                aria-label={`Mở ${item.title}`}
                              >
                                <DemoCover
                                  item={item}
                                  className="aspect-square w-full rounded-[8px] object-cover"
                                />
                              </button>
                              <DemoPlayBadge
                                item={item}
                                currentTrack={currentTrack}
                                isPlaying={isPlaying}
                                isBuffering={isBuffering}
                                className="absolute bottom-2 right-2 opacity-95"
                                onClick={() => void handleDemoPlaybackClick(item)}
                              />
                            </div>
                            <button
                              type="button"
                              className="block w-full text-left"
                              onClick={() => handleOpenAlbumItem(item)}
                              aria-label={`Mở ${item.title}`}
                            >
                              <h3 className="mt-3 font-display text-[0.98rem] font-bold leading-6 text-[color:var(--text-primary)]">
                                {item.title}
                              </h3>
                              <p className="mt-1 max-w-[11rem] text-[0.84rem] leading-5 text-[color:var(--text-secondary)]">
                                {item.subtitle}
                              </p>
                            </button>
                          </article>
                        ))}
                      </div>
                    </div>
                  </section>

                  <section className="mt-7">
                    <div className="mb-5 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm text-[color:var(--text-secondary)]">
                          Âm nhạc không ngừng dựa trên những bài hát và nghệ sĩ yêu thích của bạn.
                        </p>
                        <h2 className="font-display text-[1.65rem] font-extrabold tracking-tight text-[color:var(--text-primary)] sm:text-[2rem]">
                          Gợi ý phát tiếp
                        </h2>
                      </div>
                      <SectionMoreLink href="/section/recommended-radio" />
                    </div>

                    <div className="hide-scrollbar -mx-2 overflow-x-auto pb-4">
                      <div className="flex min-w-max gap-3 px-2">
                        {suggestedRadioItems.map((item, index) => (
                          <article
                            key={`${item.title}-${index}`}
                            className="track-card group w-[190px] shrink-0 p-2.5 text-left"
                          >
                            <div className="relative">
                              <button
                                type="button"
                                className="block w-full"
                                onClick={() => handleOpenAlbumItem(item)}
                                aria-label={`Mở ${item.title}`}
                              >
                                <DemoCover
                                  item={item}
                                  className="aspect-square w-full rounded-[8px] object-cover"
                                />
                              </button>
                              <DemoPlayBadge
                                item={item}
                                currentTrack={currentTrack}
                                isPlaying={isPlaying}
                                isBuffering={isBuffering}
                                className="absolute bottom-2 right-2 opacity-95"
                                onClick={() => void handleDemoPlaybackClick(item)}
                              />
                            </div>
                            <button
                              type="button"
                              className="block w-full text-left"
                              onClick={() => handleOpenAlbumItem(item)}
                              aria-label={`Mở ${item.title}`}
                            >
                              <h3 className="mt-3 font-display text-[0.98rem] font-bold leading-6 text-[color:var(--text-primary)]">
                                {item.title}
                              </h3>
                              <p className="mt-1 max-w-[11rem] text-[0.84rem] leading-5 text-[color:var(--text-secondary)]">
                                {item.subtitle}
                              </p>
                            </button>
                          </article>
                        ))}
                      </div>
                    </div>
                  </section>
                </>
              ) : (
                <>
              <section>
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <p className="section-kicker">Dành cho bạn hôm nay</p>
                    <span className="hero-soft-badge">New mix board</span>
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <span className="text-sm text-[color:var(--text-secondary)]">
                        {heroStatusText}
                      </span>
                      {isAuthenticated ? (
                        <span
                          className={`rounded-[8px] border px-3 py-1 text-[0.72rem] font-bold uppercase tracking-[0.16em] ${userPlanMeta.badgeClass}`}
                        >
                          {userPlanMeta.label}
                        </span>
                      ) : null}
                      {isAuthenticated ? (
                        <span className="text-sm text-[color:var(--text-dim)]">
                          {user?.email}
                        </span>
                      ) : null}
                    </div>

                    <h1 className="font-display text-[1.82rem] font-extrabold tracking-tight text-[color:var(--text-primary)] sm:text-[2.45rem]">
                      Những bài hát thịnh hành
                    </h1>
                    {isAuthenticated ? (
                      <p className="mt-3 max-w-3xl text-sm leading-7 text-[color:var(--text-secondary)]">
                        {userPlanMeta.detail}
                      </p>
                    ) : null}
                  </div>

                  <SectionMoreLink href="/section/trending" />
                </div>

                <div className="trending-swiper-shell pb-7">
                    <button
                      type="button"
                      className={`trending-swiper-button trending-swiper-button-prev hidden lg:inline-flex ${
                        trendingNavigationState.isBeginning ? 'trending-swiper-button-disabled' : ''
                      }`}
                    aria-label="Xem bài trước"
                    onClick={() => handleTrendingNavigation(-1)}
                    disabled={trendingNavigationState.isBeginning}
                  >
                    <ChevronLeftSmallIcon />
                  </button>

                  <Swiper
                    modules={[A11y]}
                    className="trending-swiper"
                    watchOverflow
                    grabCursor
                    slidesPerView={1.18}
                    slidesPerGroup={3}
                    spaceBetween={10}
                    onSwiper={handleTrendingSwiperMount}
                    onAfterInit={syncTrendingNavigationState}
                    onSlideChange={syncTrendingNavigationState}
                    onBreakpoint={syncTrendingNavigationState}
                    onResize={syncTrendingNavigationState}
                    onLock={syncTrendingNavigationState}
                    onUnlock={syncTrendingNavigationState}
                    breakpoints={{
                      480: {
                        slidesPerView: 2.1,
                        spaceBetween: 10,
                      },
                      768: {
                        slidesPerView: 3.15,
                        spaceBetween: 12,
                      },
                      1024: {
                        slidesPerView: 4.2,
                        spaceBetween: 12,
                      },
                      1280: {
                        slidesPerView: 5.15,
                        spaceBetween: 14,
                      },
                      1536: {
                        slidesPerView: 6.15,
                        spaceBetween: 14,
                      },
                    }}
                  >
                    {homeContent.songs.map((track, index) => (
                      <SwiperSlide key={track.id || `${track.title}-${index}`} className="trending-swiper-slide">
                        <article className="track-card group p-2.5">
                          <div className="relative overflow-hidden rounded-[8px] border border-white/6">
                            {track.coverUrl ? (
                              <img
                                src={track.coverUrl}
                                alt={track.title}
                                className="aspect-square h-[168px] w-full object-cover"
                              />
                            ) : (
                              <div
                                className="album-art aspect-square h-[168px] w-full"
                                style={{ backgroundImage: track.artwork }}
                              >
                                <div className="album-overlay" />
                                <div className="album-shine" />
                                <div className="album-caption">
                                  <span className="track-pill">{track.tag}</span>
                                  <span className="album-caption-title">{track.title}</span>
                                </div>
                              </div>
                            )}

                            <button
                              type="button"
                              className="play-chip disabled:cursor-not-allowed disabled:opacity-60"
                              aria-label={`Phát ${track.title}`}
                              onClick={() => void handleToggleTrackPlayback(track)}
                              disabled={!track.audioUrl}
                              title={getTrackPlaybackTooltip(track, currentTrack, isPlaying, isAuthenticated)}
                            >
                              {currentTrack?.id === track.id && isBuffering ? (
                                <span className="player-loading-dot" />
                              ) : currentTrack?.id === track.id && isPlaying ? (
                                <PauseIcon />
                              ) : (
                                <PlayIcon />
                              )}
                            </button>
                          </div>

                          <div className="mt-3.5 flex items-start justify-between gap-3">
                            <div>
                              <h3 className="font-display text-[0.98rem] font-bold leading-6 text-[color:var(--text-primary)]">
                                {track.title}
                              </h3>
                              <p className="mt-1 text-[0.88rem] leading-6 text-[color:var(--text-secondary)]">
                                {track.explicit ? (
                                  <span className="mr-2 rounded-[6px] bg-white/12 px-1 py-[1px] text-[0.68rem] font-bold text-[color:var(--text-primary)]">
                                    E
                                  </span>
                                ) : null}
                                {track.artist}
                              </p>
                              {!track.audioUrl ? (
                                <p className="mt-1 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-[color:#ffb5a8]">
                                  Chưa có audio
                                </p>
                              ) : track.videoUrl ? (
                                <p className="mt-1 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-[color:#7be29b]">
                                  Có MV
                                </p>
                              ) : null}
                            </div>

                            <span className="text-[0.78rem] font-semibold text-[color:var(--text-dim)]">
                              {track.duration}
                            </span>
                          </div>
                        </article>
                      </SwiperSlide>
                    ))}
                  </Swiper>

                    <button
                      type="button"
                      className={`trending-swiper-button trending-swiper-button-next hidden lg:inline-flex ${
                        trendingNavigationState.isEnd ? 'trending-swiper-button-disabled' : ''
                      }`}
                    aria-label="Xem bài tiếp theo"
                    onClick={() => handleTrendingNavigation(1)}
                    disabled={trendingNavigationState.isEnd}
                  >
                    <ChevronRightSmallIcon />
                  </button>
                </div>
              </section>

              <section className="mt-5">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <div>
                    <p className="section-kicker">
                      {isLive ? 'Đang đồng bộ từ máy chủ' : 'Gợi ý tuyển chọn'}
                    </p>
                    <h2 className="font-display text-[1.7rem] font-extrabold tracking-tight text-[color:var(--text-primary)] sm:text-[2.1rem]">
                      Nghệ sĩ phổ biến
                    </h2>
                  </div>

                  <SectionMoreLink href="/section/artists" />
                </div>

                <div className="artist-carousel-shell">
                  <button
                    type="button"
                    className="artist-scroll-button artist-scroll-button-left hidden lg:inline-flex"
                    aria-label="Trở về nghệ sĩ trước"
                    onClick={scrollArtistsPrev}
                  >
                    <ChevronLeftSmallIcon />
                  </button>

                  <div ref={artistCarouselRef} className="hide-scrollbar -mx-3 overflow-x-auto">
                    <div className="flex min-w-max gap-2 px-1 pb-2">
                      {homeContent.artists.map((artist, index) => (
                        <article
                          key={artist.name}
                          className="artist-card group w-[186px] shrink-0 p-2.5"
                        >
                          {artist.imageUrl || artistMockImages[index] ? (
                            <img
                              src={artist.imageUrl || artistMockImages[index]}
                              alt={artist.name}
                              className="artist-portrait aspect-square w-full object-cover"
                            />
                          ) : (
                            <div
                              className="artist-portrait aspect-square w-full"
                              style={{ backgroundImage: artist.artwork }}
                            >
                              <div className="artist-glow" />
                              <div className="artist-initials">{artist.initials}</div>
                            </div>
                          )}

                          <h3 className="mt-4 font-display text-[1rem] font-bold text-[color:var(--text-primary)]">
                            {artist.name}
                          </h3>
                          <p className="mt-1 text-[0.88rem] text-[color:var(--text-secondary)]">
                            {artist.meta}
                          </p>
                        </article>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    className="artist-scroll-button artist-scroll-button-right hidden lg:inline-flex"
                    aria-label="Xem thêm nghệ sĩ"
                    onClick={scrollArtistsNext}
                  >
                    <ChevronRightSmallIcon />
                  </button>
                </div>
              </section>

              <section className="mt-8">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <h2 className="font-display text-[1.7rem] font-extrabold tracking-tight text-[color:var(--text-primary)] sm:text-[2.1rem]">
                    Album và đĩa đơn nổi tiếng
                  </h2>
                  <SectionMoreLink href="/section/albums" />
                </div>

                <div className="hide-scrollbar -mx-2 overflow-x-auto pb-4">
                  <div className="flex min-w-max gap-2 px-1">
                    {homeContent.albums.map((album) => (
                      <article
                        key={album.title}
                        className="track-card group w-[186px] shrink-0 p-2.5"
                      >
                        {album.coverUrl ? (
                          <img
                            src={album.coverUrl}
                            alt={album.title}
                            className="aspect-square h-[168px] w-full rounded-[8px] border border-white/6 object-cover"
                          />
                        ) : (
                          <div
                            className="album-art album-cover aspect-square h-[168px] w-full rounded-[8px] border border-white/6"
                            style={{ backgroundImage: album.artwork }}
                          >
                            <div className="album-overlay" />
                            <div className="album-shine" />
                          </div>
                        )}

                        <div className="mt-3.5">
                          <h3 className="font-display text-[0.98rem] font-bold leading-6 text-[color:var(--text-primary)]">
                            {album.title}
                          </h3>
                          <p className="mt-1 text-[0.88rem] leading-6 text-[color:var(--text-secondary)]">
                            {album.artist}
                          </p>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              </section>

              <section className="mt-8">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <h2 className="font-display text-[1.7rem] font-extrabold tracking-tight text-[color:var(--text-primary)] sm:text-[2.1rem]">
                    Radio phổ biến
                  </h2>
                  <SectionMoreLink href="/section/radio" />
                </div>

                <div className="hide-scrollbar -mx-2 overflow-x-auto pb-4">
                  <div className="flex min-w-max gap-2 px-1">
                    {homeContent.radios.map((radio, index) => (
                      <article
                        key={radio.title}
                        className="radio-card group w-[238px] shrink-0 p-2.5"
                      >
                        <div className="radio-surface" style={{ backgroundImage: radio.tone }}>
                          <div className="radio-brand">
                            <SpotifyIcon />
                            <span>RADIO</span>
                          </div>

                          {radio.imageUrl || radioMockImages[index] ? (
                            <img
                              src={radio.imageUrl || radioMockImages[index]}
                              alt={radio.title}
                              className="radio-image"
                            />
                          ) : (
                            <div className="radio-avatars">
                              {radio.initials.map((item, avatarIndex) => (
                                <div
                                  key={`${radio.title}-${item}`}
                                  className={`radio-avatar ${avatarIndex === 1 ? 'radio-avatar-main' : ''}`}
                                >
                                  {item}
                                </div>
                              ))}
                            </div>
                          )}

                          <button className="radio-play" aria-label={`Phát radio ${radio.title}`}>
                            <PlayIcon />
                          </button>

                          <h3 className="radio-title">{radio.title}</h3>
                        </div>

                        <p className="mt-3 text-[0.88rem] leading-6 text-[color:var(--text-secondary)]">
                          {radio.description}
                        </p>
                      </article>
                    ))}
                  </div>
                </div>
              </section>

              <section className="mt-8">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <h2 className="font-display text-[1.7rem] font-extrabold tracking-tight text-[color:var(--text-primary)] sm:text-[2.1rem]">
                    Bảng xếp hạng nổi bật
                  </h2>
                  <SectionMoreLink href="/section/charts" />
                </div>

                <div className="hide-scrollbar -mx-2 overflow-x-auto pb-4">
                  <div className="flex min-w-max gap-2 px-1">
                    {homeContent.charts.map((chart, index) => (
                      <article
                        key={chart.title}
                        className="track-card group w-[218px] shrink-0 p-2.5"
                      >
                        <div
                          className="chart-surface"
                          style={{
                            backgroundImage:
                              chart.coverUrl || chartMockImages[index]
                                ? `url(${chart.coverUrl || chartMockImages[index]})`
                                : chart.artwork,
                          }}
                        >
                          <div className="chart-badge">
                            <SpotifyIcon />
                          </div>
                          <div className="chart-content">
                            <h3>{chart.title}</h3>
                          </div>
                        </div>

                        <p className="mt-3 text-[0.88rem] leading-6 text-[color:var(--text-secondary)]">
                          {chart.subtitle}
                        </p>
                      </article>
                    ))}
                  </div>
                </div>
              </section>
                </>
              )}

              <AppFooter />
            </div>
          </main>

          {hasCurrentTrackVideo ? (
            <aside className="music-video-panel panel-surface hidden overflow-hidden xl:flex xl:min-h-0 xl:flex-col">
              <div className="flex items-center justify-between gap-3 px-5 pb-3 pt-5">
                <div className="min-w-0">
                  <p className="section-kicker mb-1">Music video</p>
                  <h2 className="truncate font-display text-[1.05rem] font-extrabold text-white">
                    {currentTrack.title}
                  </h2>
                </div>
              </div>

              <div className="hide-scrollbar flex-1 overflow-y-auto px-5 pb-5">
                <div className="music-video-preview-shell">
                  {!isDirectVideoUrl(currentTrack.videoUrl) ? (
                    <div className="music-video-preview music-video-preview-placeholder p-4">
                      <p className="text-sm font-bold text-white">Link MV chưa phát trực tiếp được</p>
                      <p className="mt-2 text-xs leading-5 text-[color:var(--text-secondary)]">
                        Dùng file MP4/WebM hoặc upload video lên Cloudinary. Link YouTube dạng watch không chạy trong player HTML5.
                      </p>
                    </div>
                  ) : (
                    <video
                      ref={videoPlayerRef}
                      preload="metadata"
                      muted={!isVideoMode}
                      playsInline
                      poster={currentTrackCover || undefined}
                      className="music-video-preview"
                    />
                  )}
                </div>
              
                <div className="space-y-4 py-5">
                <button
                  type="button"
                  className="music-video-switch-button"
                  onClick={() => void handleToggleVideoMode()}
                  disabled={!isDirectVideoUrl(currentTrack.videoUrl)}
                >
                  <VideoIcon />
                  {isVideoMode ? 'Chuyển sang âm thanh' : 'Chuyển sang video'}
                </button>

                <div>
                  <h3 className="font-display text-[1.35rem] font-extrabold leading-tight text-white">
                    {currentTrack.title}
                  </h3>
                  <p className="mt-1 text-[0.92rem] font-semibold text-[color:var(--text-secondary)]">
                    {currentTrack.artist}
                  </p>
                </div>
                </div>

                {currentArtistProfile ? (
                  <section className="music-video-info-card overflow-hidden p-0">
                    <div
                      className="music-video-artist-hero"
                      style={{
                        backgroundImage: currentArtistProfile.imageUrl
                          ? `linear-gradient(180deg, rgba(0,0,0,0.18), rgba(0,0,0,0.74)), url(${currentArtistProfile.imageUrl})`
                          : currentArtistProfile.artwork || currentTrack.artwork,
                      }}
                    >
                      <h3>About the artist</h3>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <h4 className="flex items-center gap-2 truncate font-display text-[1.25rem] font-extrabold text-white">
                            {currentArtistProfile.name}
                            {currentArtistProfile.verified ? <span className="artist-verified-badge">✓</span> : null}
                          </h4>
                          <p className="mt-2 text-[0.9rem] font-bold text-[color:var(--text-secondary)]">
                            {currentArtistProfile.statsLabel}
                          </p>
                        </div>
                        <button type="button" className="artist-follow-button">
                          Theo dõi
                        </button>
                      </div>
                      <p className="mt-4 text-[0.88rem] font-semibold leading-6 text-[color:var(--text-secondary)]">
                        {currentArtistProfile.bio}
                      </p>
                      {currentArtistProfile.sourceUrl ? (
                        <a
                          href={currentArtistProfile.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-3 inline-flex text-[0.78rem] font-bold text-[color:var(--tertiary)] hover:underline"
                        >
                          Nguồn: {currentArtistProfile.sourceLabel}
                        </a>
                      ) : null}
                    </div>
                  </section>
                ) : null}

                <section className="music-video-info-card mt-4">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <h3 className="font-display text-[1.12rem] font-extrabold text-white">Credits</h3>
                    {(currentArtistProfile?.credits || []).length > 2 ? (
                      <button
                        type="button"
                        className="text-sm font-bold text-[color:var(--text-secondary)] hover:text-white"
                        onClick={() => setShowAllArtistCredits((value) => !value)}
                      >
                        {showAllArtistCredits ? 'Thu gọn' : 'Hiện tất cả'}
                      </button>
                    ) : null}
                  </div>
                  <div className="space-y-3">
                    {visibleArtistCredits.map((credit, index) => (
                      <div
                        key={`${credit.name}-${credit.role}-${index}`}
                        className={`rounded-[8px] ${index === 0 ? 'bg-white/12 p-3' : ''}`}
                      >
                        <p className="font-bold text-white">{credit.name}</p>
                        <p className="mt-1 text-[0.86rem] font-semibold text-[color:var(--text-secondary)]">
                          {credit.role}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="music-video-info-card mt-4">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <h3 className="font-display text-[1.12rem] font-extrabold text-white">Next in queue</h3>
                    {currentArtistQueueItems.length > 1 ? (
                      <button
                        type="button"
                        className="text-sm font-bold text-[color:var(--text-secondary)] hover:text-white"
                        onClick={() => setIsArtistQueueExpanded((value) => !value)}
                      >
                        {isArtistQueueExpanded ? 'Thu gọn' : 'Mở hàng đợi'}
                      </button>
                    ) : null}
                  </div>
                  <div className="space-y-3">
                    {visibleArtistQueueItems.length > 0 ? visibleArtistQueueItems.map((item, index) => (
                      <button
                        key={`${item.title}-${index}`}
                        type="button"
                        className="group flex w-full items-center gap-3 rounded-[10px] text-left transition hover:bg-white/8 disabled:cursor-default disabled:hover:bg-transparent"
                        onClick={() => void handleQueueItemClick(item)}
                      >
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.title} className="h-12 w-12 rounded-[8px] object-cover" />
                        ) : (
                          <div
                            className="queue-cover-fallback h-12 w-12 rounded-[8px]"
                            style={{ backgroundImage: item.artwork || currentTrack.artwork }}
                          >
                            <span>{item.title.slice(0, 2).toUpperCase()}</span>
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="truncate font-bold text-white">{item.title}</p>
                          <p className="mt-1 truncate text-[0.86rem] font-semibold text-[color:var(--text-secondary)]">
                            {item.artist}
                          </p>
                        </div>
                        {item.isPlayable ? (
                          <span className="ml-auto grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[color:var(--primary)] text-[#221017] opacity-0 transition group-hover:opacity-100">
                            <PlayIcon />
                          </span>
                        ) : null}
                      </button>
                    )) : (
                      <p className="text-[0.88rem] font-semibold leading-6 text-[color:var(--text-secondary)]">
                        Chưa có bài khác của nghệ sĩ này trong DB. Import thêm bài cùng artist để tự hiện ở đây.
                      </p>
                    )}
                  </div>
                </section>
              </div>
            </aside>
          ) : null}
        </div>

        {playbackGateTrack ? (
          <GuestPlaybackGateModal
            track={playbackGateTrack}
            coverSrc={playbackGateTrackCover}
            fallbackArtwork={playbackGateTrack.artwork}
            canInstallApp={Boolean(installPromptEvent)}
            onInstallApp={() => void handleInstallApp()}
            onClose={handleClosePlaybackGate}
          />
        ) : null}

        {currentTrack ? (
          <div className="app-player-shell fixed inset-x-3 bottom-3 z-30">
            <section className="app-player-bar">
              <div className="min-w-0">
                <div className="flex items-center gap-3.5">
                  {currentTrackCover ? (
                    <img
                      src={currentTrackCover}
                      alt={currentTrack.title}
                      className="h-14 w-14 shrink-0 rounded-[8px] object-cover shadow-[0_14px_28px_rgba(0,0,0,0.35)]"
                    />
                  ) : (
                    <div className="player-cover-fallback h-14 w-14 shrink-0 rounded-[8px]">
                      <span>{currentTrack.title.slice(0, 2).toUpperCase()}</span>
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[color:#7be29b]">
                      Đang phát
                    </p>
                    <h3 className="truncate text-[1.05rem] font-bold text-white">
                      {currentTrack.title}
                    </h3>
                    <p className="truncate text-[0.82rem] text-white/58">
                      {currentTrackSubtitle}
                    </p>
                  </div>

                  <div className="hidden sm:block">
                    <PlayerIconButton aria-label="Thêm vào thư viện">
                      <PlusIcon />
                    </PlayerIconButton>
                  </div>
                </div>

                {playbackError ? (
                  <p className="mt-2 text-xs text-[color:#ff9e8f]">{playbackError}</p>
                ) : null}
              </div>

              <div className="min-w-0">
                <div className="flex items-center justify-center gap-1.5 sm:gap-2.5">
                  <PlayerIconButton
                    active={isShuffleEnabled}
                    aria-pressed={isShuffleEnabled}
                    aria-label={getShuffleTooltip(isShuffleEnabled)}
                    onClick={() => setIsShuffleEnabled((value) => !value)}
                  >
                    <ShuffleIcon />
                  </PlayerIconButton>
                  <PlayerIconButton
                    aria-label="Bài trước"
                    onClick={() => void handleSkipTrack(-1)}
                    disabled={playableTracks.length === 0}
                  >
                    <PreviousTrackIcon />
                  </PlayerIconButton>
                  <button
                    type="button"
                    className="player-icon-button-primary"
                    aria-label={getPlayerPlaybackTooltip(isPlaying, currentTrack)}
                    title={getPlayerPlaybackTooltip(isPlaying, currentTrack)}
                    onClick={() => void handleToggleTrackPlayback(currentTrack)}
                  >
                    {isBuffering ? (
                      <span className="player-loading-dot" />
                    ) : isPlaying ? (
                      <PauseIcon />
                    ) : (
                      <PlayIcon />
                    )}
                  </button>
                  <PlayerIconButton
                    aria-label="Bài tiếp theo"
                    onClick={() => void handleSkipTrack(1)}
                    disabled={playableTracks.length === 0}
                  >
                    <NextTrackIcon />
                  </PlayerIconButton>
                  <PlayerIconButton
                    active={repeatMode !== 'off'}
                    role="checkbox"
                    aria-checked={repeatMode === 'one' ? 'mixed' : repeatMode === 'all'}
                    aria-label={getRepeatModeTooltip(repeatMode)}
                    onClick={handleCycleRepeatMode}
                  >
                    {repeatMode === 'one' ? <RepeatOneIcon /> : <RepeatIcon />}
                  </PlayerIconButton>
                </div>

                <div className="mt-3 flex items-center gap-3">
                  <span className="player-time-label">{formatPlaybackSeconds(currentTime)}</span>
                  <input
                    type="range"
                    min="0"
                    max={Math.max(durationSeconds, 1)}
                    step="1"
                    value={Math.min(currentTime, Math.max(durationSeconds, 1))}
                    onChange={handleSeekTrack}
                    className="player-slider"
                    style={{ '--player-slider-progress': `${playbackProgress}%` }}
                    aria-label="Tiến độ phát"
                  />
                  <span className="player-time-label">{formatPlaybackSeconds(durationSeconds)}</span>
                </div>
              </div>

              <div className="min-w-0">
                <div className="flex items-center justify-start gap-1.5 sm:justify-end">
                  <div className="hidden lg:block">
                    <PlayerIconButton aria-label="Lời bài hát">
                      <LyricsIcon />
                    </PlayerIconButton>
                  </div>
                  <div className="hidden lg:block">
                    <PlayerIconButton aria-label="Hàng đợi">
                      <QueueIcon />
                    </PlayerIconButton>
                  </div>
                  <PlayerIconButton
                    aria-label={getMuteTooltip(volumeLevel)}
                    onClick={handleToggleMute}
                  >
                    {volumeLevel === 0 ? <MuteIcon /> : <SpeakerIcon />}
                  </PlayerIconButton>
                  {hasCurrentTrackVideo && isDirectVideoUrl(currentTrack.videoUrl) ? (
                    <PlayerIconButton
                      active={isVideoMode}
                      aria-pressed={isVideoMode}
                      aria-label={isVideoMode ? 'Chuyển sang âm thanh' : 'Chuyển sang video'}
                      onClick={() => void handleToggleVideoMode()}
                    >
                      <VideoIcon />
                    </PlayerIconButton>
                  ) : null}
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={volumeLevel}
                    onChange={handleVolumeChange}
                    className="player-slider player-volume-slider"
                    style={{ '--player-slider-progress': `${volumeLevel}%` }}
                    aria-label="Âm lượng"
                  />
                  <div className="hidden sm:block">
                    <a
                      href={currentTrack.audioUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="player-icon-link"
                      aria-label="Mở file audio"
                      title="Mở file audio"
                    >
                      <DeviceIcon />
                    </a>
                  </div>
                  <div className="hidden lg:block">
                    <PlayerIconButton aria-label="Mở rộng player">
                      <ExpandIcon />
                    </PlayerIconButton>
                  </div>
                </div>
              </div>
            </section>
          </div>
        ) : null}

        {!isAuthenticated && !currentTrack ? (
          <div className="promo-bar fixed inset-x-3 bottom-3 z-20 flex flex-col items-start justify-between gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:px-5">
            <div>
              <p className="text-[0.78rem] font-bold uppercase tracking-[0.18em] text-white/80">
                Trải nghiệm TMusic
              </p>
              <p className="mt-2 max-w-4xl font-display text-[1rem] font-bold leading-6 text-[color:var(--text-primary)]">
                Đăng ký để nghe không giới hạn bài hát và podcast. Giao diện mới dịu mắt hơn nhưng
                vẫn giữ điểm nhấn rõ ràng trên từng khu vực nội dung.
              </p>
            </div>

            <a href="/register" className="primary-button inline-flex shrink-0 items-center gap-2">
              Đăng ký miễn phí
              <ArrowIcon />
            </a>
          </div>
        ) : null}
    </ClientAppShell>
  )
}

export default HomePage
