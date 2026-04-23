import { useEffect, useMemo, useRef, useState } from 'react'
import { A11y } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import {
  ArrowIcon,
  ChevronLeftSmallIcon,
  ChevronRightSmallIcon,
  DeviceIcon,
  DownloadIcon,
  ExpandIcon,
  GlobeIcon,
  HomeIcon,
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
  SearchTrailingIcon,
  ShuffleIcon,
  SpeakerIcon,
  SpotifyIcon,
} from '../../../shared/icons.jsx'
import {
  albumMockImages,
  artistMockImages,
  chartMockImages,
  footerColumns,
  footerLinks,
  libraryPrompts,
  menuLinks,
  radioMockImages,
  trackMockImages,
} from '../homeData.js'
import { useHomePageData } from '../useHomePageData.js'
import { useAuthSession } from '../../auth/useAuthSession.js'
import GuestPlaybackGateModal from '../components/GuestPlaybackGateModal.jsx'
import 'swiper/css'
import 'swiper/css/navigation'

function SectionMoreLink({ href }) {
  return (
    <a
      draggable="false"
      className="FOjXJqlCvEIMzJBF mbwNxmJkaTgwmZSP section-more-link hidden sm:flex"
      href={href}
      onClick={(event) => event.preventDefault()}
    >
      <span
        className="e-10310-text encore-text-body-small-bold encore-internal-color-text-subdued"
        data-encore-id="text"
      >
        Hiện tất cả
      </span>
    </a>
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
    return 'Dang lap lai danh sach. Bam de chuyen sang lap 1 bai'
  }

  if (mode === 'one') {
    return 'Dang lap lai 1 bai. Bam de tat lap lai'
  }

  return 'Da tat lap lai. Bam de bat lap lai danh sach'
}

function getShuffleTooltip(enabled) {
  return enabled ? 'Tat tron bai' : 'Bat tron bai'
}

function getTrackPlaybackTooltip(track, activeTrack, playing, isAuthenticated) {
  if (!track?.audioUrl) {
    return `Bai ${track?.title || ''} chua co audio`
  }

  if (!isAuthenticated) {
    return `Dang nhap de phat ${track.title}`
  }

  if (activeTrack?.id === track.id && playing) {
    return `Tam dung ${track.title}`
  }

  return `Phat ${track.title}`
}

function getPlayerPlaybackTooltip(playing, track) {
  if (!track) {
    return 'Phat'
  }

  return playing ? `Tam dung ${track.title}` : `Phat ${track.title}`
}

function getMuteTooltip(volume) {
  return volume === 0 ? 'Bat am thanh' : 'Tat am thanh'
}

function getFooterSocialTooltip(item) {
  if (item === 'IG') {
    return 'Instagram'
  }

  if (item === 'X') {
    return 'X'
  }

  return 'Facebook'
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

function HomePage() {
  const artistCarouselRef = useRef(null)
  const audioRef = useRef(null)
  const lastVolumeRef = useRef(72)
  const currentTrackRef = useRef(null)
  const playableTracksRef = useRef([])
  const isShuffleEnabledRef = useRef(false)
  const repeatModeRef = useRef('all')
  const trendingSwiperRef = useRef(null)
  const { health, homeContent, isLive } = useHomePageData()
  const { user, loading: authLoading, isAuthenticated, logout } = useAuthSession()
  const [currentTrack, setCurrentTrack] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isShuffleEnabled, setIsShuffleEnabled] = useState(false)
  const [repeatMode, setRepeatMode] = useState('all')
  const [playbackError, setPlaybackError] = useState('')
  const [currentTime, setCurrentTime] = useState(0)
  const [durationSeconds, setDurationSeconds] = useState(0)
  const [volumeLevel, setVolumeLevel] = useState(72)
  const [playbackGateTrack, setPlaybackGateTrack] = useState(null)
  const [installPromptEvent, setInstallPromptEvent] = useState(null)
  const [trendingNavigationState, setTrendingNavigationState] = useState(() => getTrendingNavigationState(null))

  const userDisplayName = useMemo(() => getUserDisplayName(user), [user])
  const userInitials = useMemo(() => getUserInitials(user), [user])
  const userPlanMeta = useMemo(() => getUserPlanMeta(user), [user])
  const playableTracks = useMemo(
    () => homeContent.songs.filter((track) => Boolean(track.audioUrl)),
    [homeContent.songs],
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

  const getTrackCover = (track) => {
    if (!track) {
      return ''
    }

    if (track.coverUrl) {
      return track.coverUrl
    }

    const trackIndex = homeContent.songs.findIndex((item) => item.id === track.id)

    return trackIndex >= 0 ? trackMockImages[trackIndex] : ''
  }

  const currentTrackCover = getTrackCover(currentTrack)
  const playbackGateTrackCover = getTrackCover(playbackGateTrack)
  const currentTrackSubtitle = useMemo(() => getPlayerTrackSubtitle(currentTrack), [currentTrack])
  const layoutBottomSpacingClass = currentTrack
    ? 'pb-[12.5rem] sm:pb-[8rem]'
    : isAuthenticated
      ? 'pb-0'
      : 'pb-[86px]'
  const contentBottomSpacingClass = currentTrack ? 'pb-[11rem] sm:pb-[7rem]' : 'pb-10'
  const playbackProgress =
    durationSeconds > 0 ? Math.min((currentTime / durationSeconds) * 100, 100) : 0

  useEffect(() => {
    currentTrackRef.current = currentTrack
    playableTracksRef.current = playableTracks
    isShuffleEnabledRef.current = isShuffleEnabled
    repeatModeRef.current = repeatMode
  }, [currentTrack, playableTracks, isShuffleEnabled, repeatMode])

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
    const audio = audioRef.current

    if (!audio) {
      return undefined
    }

    const handlePlay = () => {
      setIsPlaying(true)
      setPlaybackError('')
    }

    const handlePause = () => {
      setIsPlaying(false)
    }

    const handleEnded = async () => {
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
            setCurrentTrack(nextTrack)
            setCurrentTime(0)
            setDurationSeconds(0)

            if (currentTrackRef.current?.id === nextTrack.id) {
              audio.currentTime = 0
            } else {
              audio.src = nextTrack.audioUrl
            }

            await audio.play()
            return
          } catch {
            setPlaybackError('Trinh duyet da chan phat tu dong. Hay bam lai.')
          }
        }
      }

      setIsPlaying(false)
      setCurrentTime(0)
    }

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime || 0)
    }

    const handleLoadedMetadata = () => {
      setDurationSeconds(audio.duration || 0)
    }

    const handlePlaybackFailure = () => {
      setPlaybackError('Khong the phat bai nhac nay luc nay.')
      setIsPlaying(false)
    }

    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('error', handlePlaybackFailure)

    return () => {
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('error', handlePlaybackFailure)
    }
  }, [])

  useEffect(() => {
    const audio = audioRef.current

    if (!audio) {
      return
    }

    audio.loop = repeatMode === 'one'
  }, [repeatMode])

  useEffect(() => {
    const audio = audioRef.current

    if (!audio) {
      return
    }

    audio.volume = volumeLevel / 100
  }, [volumeLevel])

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

    if (!audio || !track?.audioUrl) {
      setPlaybackError('Bai nhac nay chua co file audio de phat.')
      return
    }

    if (authLoading) {
      setPlaybackError('Dang kiem tra phien dang nhap. Hay thu lai sau it giay.')
      return
    }

    if (!isAuthenticated) {
      openPlaybackGate(track)
      return
    }

    const isSameTrack = currentTrack?.id === track.id

    setPlaybackError('')
    setCurrentTrack(track)

    if (!isSameTrack) {
      setCurrentTime(0)
      setDurationSeconds(0)
      audio.src = track.audioUrl
    }

    try {
      await audio.play()
    } catch {
      setPlaybackError('Trinh duyet da chan phat tu dong. Hay bam lai.')
    }
  }

  const handleToggleTrackPlayback = async (track) => {
    const audio = audioRef.current

    if (!audio || !track?.audioUrl) {
      setPlaybackError('Bai nhac nay chua co file audio de phat.')
      return
    }

    if (authLoading) {
      setPlaybackError('Dang kiem tra phien dang nhap. Hay thu lai sau it giay.')
      return
    }

    if (!isAuthenticated) {
      openPlaybackGate(track)
      return
    }

    setPlaybackError('')

    if (currentTrack?.id === track.id) {
      if (audio.paused) {
        try {
          await audio.play()
        } catch {
          setPlaybackError('Trinh duyet da chan phat tu dong. Hay bam lai.')
        }
      } else {
        audio.pause()
      }

      return
    }

    await playTrack(track)
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
    const audio = audioRef.current
    const nextTime = Number(event.target.value)

    if (!audio || !Number.isFinite(nextTime)) {
      return
    }

    audio.currentTime = nextTime
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
    <div className="min-h-screen bg-[color:var(--bg-app)] px-2.5 py-2.5 text-[color:var(--text-primary)]">
      <div className="mx-auto flex min-h-[calc(100vh-1.25rem)] w-full max-w-[1920px] flex-col gap-2.5">
        <header className="top-shell flex flex-wrap items-center justify-between gap-2.5 px-3 py-2.5 sm:px-4">
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
            <a href="/" className="brand-badge hidden sm:inline-flex" aria-label="Trang chủ TMusic">
              <SpotifyIcon />
            </a>

            <a href="/" className="icon-frame" aria-label="Trang chủ">
              <HomeIcon />
            </a>

            <div className="search-shell min-w-0 flex-1">
              <SearchIcon />
              <input
                className="search-input"
                type="text"
                placeholder="Bạn muốn phát nội dung gì?"
              />
              <div className="search-divider" />
              <button
                className="text-[color:var(--text-secondary)] transition hover:text-[color:var(--text-primary)]"
                aria-label="Tìm kiếm nâng cao"
              >
                <SearchTrailingIcon />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3.5">
            <nav className="hidden items-center gap-4 text-[0.92rem] font-semibold text-[color:var(--text-secondary)] lg:flex">
              {menuLinks.map((item) => (
                <a
                  key={item}
                  href="/"
                  onClick={(event) => event.preventDefault()}
                  className="transition hover:text-[color:var(--text-primary)]"
                >
                  {item}
                </a>
              ))}
            </nav>

            <div className="hidden h-7 w-px bg-white/10 lg:block" />

            <button
              className="download-link hidden items-center gap-2 md:inline-flex"
              title="Cai dat ung dung TMusic"
            >
              <DownloadIcon />
              Cài đặt ứng dụng
            </button>

            {isAuthenticated ? (
              <>
                <div className="hidden items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-2 py-1.5 md:flex">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[color:rgba(255,107,87,0.22)] font-display text-sm font-extrabold text-[color:var(--text-primary)]">
                    {userInitials}
                  </div>
                  <div className="max-w-[11rem] pr-1">
                    <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[color:var(--text-dim)]">
                      Đang đăng nhập
                    </p>
                    <p className="truncate text-sm font-bold text-[color:var(--text-primary)]">
                      {userDisplayName}
                    </p>
                    <p className="mt-1 truncate text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[color:var(--text-dim)]">
                      Gói {userPlanMeta.label}
                    </p>
                  </div>
                </div>

                <button type="button" className="secondary-button" onClick={handleLogout}>
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <a href="/register" className="secondary-button hidden sm:inline-flex">
                  Đăng ký
                </a>
                <a href="/login" className="primary-button">
                  Đăng nhập
                </a>
              </>
            )}
          </div>
        </header>

        <div className={`grid flex-1 gap-2.5 ${layoutBottomSpacingClass} xl:grid-cols-[372px_minmax(0,1fr)]`}>
          <aside className="panel-surface flex min-h-[320px] flex-col overflow-hidden">
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

            <div className="hide-scrollbar flex-1 space-y-3.5 overflow-y-auto px-3.5 pb-4">
              {libraryPrompts.map((item) => (
                <section key={item.title} className="library-card">
                  <h3 className="font-display text-[1rem] font-bold leading-7 text-[color:var(--text-primary)]">
                    {item.title}
                  </h3>
                  <p className="mt-2.5 max-w-[17rem] text-[0.92rem] leading-7 text-[color:var(--text-secondary)]">
                    {item.description}
                  </p>
                  <button className="primary-button mt-6">{item.action}</button>
                </section>
              ))}
            </div>

            <div className="space-y-5 px-5 pb-5 pt-2">
              <div className="flex flex-wrap gap-x-4 gap-y-2 text-[0.84rem] leading-6 text-[color:var(--text-secondary)]">
                {footerLinks.map((item) => (
                  <a
                    key={item}
                    href="/"
                    onClick={(event) => event.preventDefault()}
                    className="transition hover:text-[color:var(--text-primary)]"
                  >
                    {item}
                  </a>
                ))}
              </div>

              <button className="language-button" title="Doi ngon ngu hien thi">
                <GlobeIcon />
                Tiếng Việt
              </button>
            </div>
          </aside>

          <main className="panel-surface relative overflow-hidden">
            <div className="content-veil" />

            <div
              className={`hide-scrollbar relative h-full overflow-y-auto px-4 ${contentBottomSpacingClass} pt-6 sm:px-6 lg:px-8`}
            >
              <audio ref={audioRef} preload="none" />

              <section>
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <p className="section-kicker">Dành cho bạn hôm nay</p>
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <span className="text-sm text-[color:var(--text-secondary)]">
                        {heroStatusText}
                      </span>
                      {isAuthenticated ? (
                        <span
                          className={`rounded-full border px-3 py-1 text-[0.72rem] font-bold uppercase tracking-[0.16em] ${userPlanMeta.badgeClass}`}
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
                    aria-label="Xem bai truoc"
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
                        <article className="track-card group h-full p-2.5">
                          <div className="relative overflow-hidden rounded-[18px] border border-white/6">
                            {track.coverUrl || trackMockImages[index] ? (
                              <img
                                src={track.coverUrl || trackMockImages[index]}
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
                              {currentTrack?.id === track.id && isPlaying ? <PauseIcon /> : <PlayIcon />}
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
                                  Chua co audio
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
                    aria-label="Xem bai tiep theo"
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
                    {homeContent.albums.map((album, index) => (
                      <article
                        key={album.title}
                        className="track-card group w-[186px] shrink-0 p-2.5"
                      >
                        {album.coverUrl || albumMockImages[index] ? (
                          <img
                            src={album.coverUrl || albumMockImages[index]}
                            alt={album.title}
                            className="aspect-square h-[168px] w-full rounded-[18px] border border-white/6 object-cover"
                          />
                        ) : (
                          <div
                            className="album-art album-cover aspect-square h-[168px] w-full rounded-[18px] border border-white/6"
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

              <footer className="footer-shell mt-8">
                <div className="footer-grid">
                  {footerColumns.map((column) => (
                    <section key={column.title}>
                      <h3 className="footer-heading">{column.title}</h3>
                      <div className="footer-links">
                        {column.links.map((link) => (
                          <a
                            key={link}
                            href="/"
                            onClick={(event) => event.preventDefault()}
                            className="footer-link"
                          >
                            {link}
                          </a>
                        ))}
                      </div>
                    </section>
                  ))}

                  <div className="footer-socials">
                    {['IG', 'X', 'f'].map((item) => (
                      <button
                        key={item}
                        className="footer-social-button"
                        aria-label={getFooterSocialTooltip(item)}
                        title={getFooterSocialTooltip(item)}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="footer-bottom">
                  <span>© 2026 TMusic</span>
                </div>
              </footer>
            </div>
          </main>
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
                      className="h-14 w-14 shrink-0 rounded-[14px] object-cover shadow-[0_14px_28px_rgba(0,0,0,0.35)]"
                    />
                  ) : (
                    <div className="player-cover-fallback h-14 w-14 shrink-0 rounded-[14px]">
                      <span>{currentTrack.title.slice(0, 2).toUpperCase()}</span>
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[color:#7be29b]">
                      Dang phat
                    </p>
                    <h3 className="truncate text-[1.05rem] font-bold text-white">
                      {currentTrack.title}
                    </h3>
                    <p className="truncate text-[0.82rem] text-white/58">
                      {currentTrackSubtitle}
                    </p>
                  </div>

                  <div className="hidden sm:block">
                    <PlayerIconButton aria-label="Them vao thu vien">
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
                    aria-label="Bai truoc"
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
                    {isPlaying ? <PauseIcon /> : <PlayIcon />}
                  </button>
                  <PlayerIconButton
                    aria-label="Bai tiep theo"
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
                    aria-label="Tien do phat"
                  />
                  <span className="player-time-label">{formatPlaybackSeconds(durationSeconds)}</span>
                </div>
              </div>

              <div className="min-w-0">
                <div className="flex items-center justify-start gap-1.5 sm:justify-end">
                  <div className="hidden lg:block">
                    <PlayerIconButton aria-label="Loi bai hat">
                      <LyricsIcon />
                    </PlayerIconButton>
                  </div>
                  <div className="hidden lg:block">
                    <PlayerIconButton aria-label="Hang doi">
                      <QueueIcon />
                    </PlayerIconButton>
                  </div>
                  <PlayerIconButton
                    aria-label={getMuteTooltip(volumeLevel)}
                    onClick={handleToggleMute}
                  >
                    {volumeLevel === 0 ? <MuteIcon /> : <SpeakerIcon />}
                  </PlayerIconButton>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={volumeLevel}
                    onChange={handleVolumeChange}
                    className="player-slider player-volume-slider"
                    style={{ '--player-slider-progress': `${volumeLevel}%` }}
                    aria-label="Am luong"
                  />
                  <div className="hidden sm:block">
                    <a
                      href={currentTrack.audioUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="player-icon-link"
                      aria-label="Mo file audio"
                      title="Mo file audio"
                    >
                      <DeviceIcon />
                    </a>
                  </div>
                  <div className="hidden lg:block">
                    <PlayerIconButton aria-label="Mo rong player">
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
      </div>
    </div>
  )
}

export default HomePage
