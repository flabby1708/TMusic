import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { appPaths } from '../../../app/routes/paths.js'
import {
  ChevronRightSmallIcon,
  HomeIcon,
  MuteIcon,
  PauseIcon,
  PlayIcon,
  SpeakerIcon,
  SpotifyIcon,
} from '../../../shared/icons.jsx'
import { useHomePageData } from '../useHomePageData.js'
import {
  albumMockImages,
  artistMockImages,
  chartMockImages,
  radioMockImages,
  trackMockImages,
} from '../homeData.js'
import { useAuthSession } from '../../auth/useAuthSession.js'
import GuestPlaybackGateModal from '../components/GuestPlaybackGateModal.jsx'

const sectionConfig = {
  trending: {
    title: 'Những bài hát thịnh hành',
    subtitle: 'Danh sách nổi bật được gom lại để xem nhanh hơn.',
    kind: 'tracks',
    empty: 'Chưa có bài hát nào trong danh sách này.',
  },
  artists: {
    title: 'Nghệ sĩ phổ biến',
    subtitle: 'Khám phá các nghệ sĩ đang được quan tâm nhiều nhất.',
    kind: 'artists',
    empty: 'Chưa có nghệ sĩ nào để hiển thị.',
  },
  albums: {
    title: 'Album và đĩa đơn nổi tiếng',
    subtitle: 'Những bản phát hành và hình bìa đang được ưu tiên.',
    kind: 'albums',
    empty: 'Chưa có album hoặc đĩa đơn nào.',
  },
  radio: {
    title: 'Radio phổ biến',
    subtitle: 'Các đài radio gợi ý theo artist và mood.',
    kind: 'radios',
    empty: 'Chưa có radio nào để gợi ý.',
  },
  charts: {
    title: 'Bảng xếp hạng nổi bật',
    subtitle: 'Các bảng xếp hạng nổi bật được sắp xếp theo khu vực.',
    kind: 'charts',
    empty: 'Chưa có bảng xếp hạng nào.',
  },
}

function getCardImage(kind, item, index) {
  if (kind === 'tracks') {
    return item.coverUrl || trackMockImages[index] || ''
  }

  if (kind === 'artists') {
    return item.imageUrl || artistMockImages[index] || ''
  }

  if (kind === 'albums') {
    return item.coverUrl || albumMockImages[index] || ''
  }

  if (kind === 'radios') {
    return item.imageUrl || radioMockImages[index] || ''
  }

  if (kind === 'charts') {
    return item.coverUrl || chartMockImages[index] || ''
  }

  return ''
}

function formatPlaybackSeconds(value) {
  const safeValue = Number.isFinite(value) && value >= 0 ? Math.floor(value) : 0
  const minutes = Math.floor(safeValue / 60)
  const seconds = String(safeValue % 60).padStart(2, '0')

  return `${minutes}:${seconds}`
}

function SectionCard({ sectionKey, item, index, isActive, isPlaying, isBuffering, onPlay }) {
  const kind = sectionConfig[sectionKey]?.kind
  const imageUrl = getCardImage(kind, item, index)

  if (sectionKey === 'artists') {
    return (
      <article className="track-card section-page-card p-2.5">
        {imageUrl ? (
          <img src={imageUrl} alt={item.name} className="aspect-square w-full rounded-[18px] object-cover" />
        ) : (
          <div className="artist-portrait aspect-square w-full" style={{ backgroundImage: item.artwork }}>
            <div className="artist-glow" />
            <div className="artist-initials">{item.initials}</div>
          </div>
        )}
        <h3 className="mt-3.5 font-display text-[1rem] font-bold text-[color:var(--text-primary)]">
          {item.name}
        </h3>
        <p className="mt-1 text-[0.88rem] text-[color:var(--text-secondary)]">{item.meta}</p>
      </article>
    )
  }

  if (sectionKey === 'radio') {
    return (
      <article className="radio-card section-page-card p-2.5">
        <div className="radio-surface" style={{ backgroundImage: item.tone }}>
          <div className="radio-brand">
            <SpotifyIcon />
            <span>RADIO</span>
          </div>
          {imageUrl ? (
            <img src={imageUrl} alt={item.title} className="radio-image" />
          ) : (
            <div className="radio-avatars">
              {item.initials.map((initials, avatarIndex) => (
                <div
                  key={`${item.title}-${initials}`}
                  className={`radio-avatar ${avatarIndex === 1 ? 'radio-avatar-main' : ''}`}
                >
                  {initials}
                </div>
              ))}
            </div>
          )}
          <button className="radio-play" aria-label={`Phát radio ${item.title}`}>
            <PlayIcon />
          </button>
          <h3 className="radio-title">{item.title}</h3>
        </div>
        <p className="mt-3 text-[0.88rem] leading-6 text-[color:var(--text-secondary)]">
          {item.description}
        </p>
      </article>
    )
  }

  return (
    <article className="track-card section-page-card p-2.5">
      <div className="relative overflow-hidden rounded-[18px]">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={item.title}
            className="aspect-square h-[168px] w-full rounded-[18px] object-cover"
          />
        ) : (
          <div
            className="album-art album-cover aspect-square h-[168px] w-full rounded-[18px]"
            style={{ backgroundImage: item.artwork }}
          >
            <div className="album-overlay" />
            <div className="album-shine" />
          </div>
        )}

        {kind === 'tracks' ? (
          item.audioUrl ? (
            <button
              type="button"
              className="section-play-button"
              aria-label={`Phát ${item.title}`}
              title={`Phát ${item.title}`}
              onClick={onPlay}
            >
              {isActive && isBuffering ? (
                <span className="player-loading-dot" />
              ) : isActive && isPlaying ? (
                <PauseIcon />
              ) : (
                <PlayIcon />
              )}
            </button>
          ) : (
            <span className="section-card-status">Chưa có audio</span>
          )
        ) : null}
      </div>

      <div className="mt-3.5">
        <h3 className="font-display text-[0.98rem] font-bold leading-6 text-[color:var(--text-primary)]">
          {item.title}
        </h3>
        <p className="mt-1 text-[0.88rem] leading-6 text-[color:var(--text-secondary)]">
          {item.artist || item.subtitle}
        </p>
      </div>
    </article>
  )
}

function SectionSkeletonGrid() {
  return (
    <section className="section-page-grid" aria-label="Đang tải nội dung">
      {Array.from({ length: 10 }).map((_, index) => (
        <div key={index} className="section-skeleton-card">
          <div className="section-skeleton-art" />
          <div className="section-skeleton-line section-skeleton-line-strong" />
          <div className="section-skeleton-line" />
        </div>
      ))}
    </section>
  )
}

function SectionEmptyState({ message }) {
  return (
    <section className="section-empty-state">
      <p className="section-kicker">Chưa có dữ liệu</p>
      <h2 className="font-display text-[1.6rem] font-extrabold text-[color:var(--text-primary)]">
        Danh sách đang trống
      </h2>
      <p className="mt-2 max-w-xl text-sm leading-7 text-[color:var(--text-secondary)]">{message}</p>
      <Link to={appPaths.home} className="primary-button mt-5 w-fit">
        Quay lại trang chủ
      </Link>
    </section>
  )
}

function HomeSectionPage() {
  const audioRef = useRef(null)
  const lastVolumeRef = useRef(72)
  const { sectionKey } = useParams()
  const { homeContent, health } = useHomePageData()
  const { loading: authLoading, isAuthenticated } = useAuthSession()
  const [currentTrack, setCurrentTrack] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isBuffering, setIsBuffering] = useState(false)
  const [playbackError, setPlaybackError] = useState('')
  const [currentTime, setCurrentTime] = useState(0)
  const [durationSeconds, setDurationSeconds] = useState(0)
  const [volumeLevel, setVolumeLevel] = useState(72)
  const [gateTrack, setGateTrack] = useState(null)
  const config = sectionConfig[sectionKey]
  const sectionKind = config?.kind || 'tracks'
  const items = config ? homeContent[sectionKind] || [] : []
  const playableTracks = sectionKind === 'tracks' ? items.filter((item) => Boolean(item.audioUrl)) : []
  const isLoading = health.loading || homeContent.loading
  const liveLabel = isLoading ? 'Đang tải' : health.error ? 'Dữ liệu mẫu' : 'Dữ liệu trực tiếp'
  const playbackProgress =
    durationSeconds > 0 ? Math.min((currentTime / durationSeconds) * 100, 100) : 0
  const currentTrackCover =
    currentTrack?.coverUrl ||
    trackMockImages[homeContent.songs.findIndex((track) => track.id === currentTrack?.id)] ||
    ''
  const queueTracks = currentTrack
    ? playableTracks.filter((track) => track.id !== currentTrack.id).slice(0, 4)
    : playableTracks.slice(0, 4)

  useEffect(() => {
    const audio = audioRef.current

    if (!audio) {
      return undefined
    }

    const handlePlay = () => {
      setIsPlaying(true)
      setIsBuffering(false)
      setPlaybackError('')
    }

    const handlePause = () => {
      setIsPlaying(false)
      setIsBuffering(false)
    }

    const handleWaiting = () => {
      setIsBuffering(true)
    }

    const handlePlaying = () => {
      setIsBuffering(false)
    }

    const handleLoadedMetadata = () => {
      setDurationSeconds(audio.duration || 0)
      setIsBuffering(false)
    }

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime || 0)
    }

    const handleError = () => {
      setIsBuffering(false)
      setPlaybackError('Không thể phát bài này lúc này.')
      setIsPlaying(false)
    }

    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)
    audio.addEventListener('waiting', handleWaiting)
    audio.addEventListener('playing', handlePlaying)
    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('error', handleError)

    return () => {
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
      audio.removeEventListener('waiting', handleWaiting)
      audio.removeEventListener('playing', handlePlaying)
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('error', handleError)
    }
  }, [])

  useEffect(() => {
    const audio = audioRef.current

    if (!audio) {
      return
    }

    audio.volume = volumeLevel / 100
  }, [volumeLevel])

  const closeGate = () => {
    setGateTrack(null)
  }

  const playTrack = async (track) => {
    const audio = audioRef.current

    if (!audio || !track?.audioUrl) {
      setPlaybackError('Bài này chưa có file audio để phát.')
      return
    }

    if (authLoading) {
      setPlaybackError('Đang kiểm tra phiên đăng nhập. Hãy thử lại sau ít giây.')
      return
    }

    if (!isAuthenticated) {
      setPlaybackError('')
      setGateTrack(track)
      return
    }

    const isSameTrack = currentTrack?.id === track.id
    setPlaybackError('')
    setIsBuffering(true)
    setCurrentTrack(track)

    if (!isSameTrack) {
      setCurrentTime(0)
      setDurationSeconds(0)
      audio.src = track.audioUrl
    }

    try {
      await audio.play()
    } catch {
      setPlaybackError('Trình duyệt đã chặn phát tự động. Hãy bấm lại.')
      setIsBuffering(false)
    }
  }

  const toggleTrack = async (track) => {
    const audio = audioRef.current

    if (!audio || !track?.audioUrl) {
      setPlaybackError('Bài này chưa có file audio để phát.')
      return
    }

    if (currentTrack?.id === track.id && audio.paused) {
      setIsBuffering(true)
      try {
        await audio.play()
      } catch {
        setPlaybackError('Trình duyệt đã chặn phát tự động. Hãy bấm lại.')
        setIsBuffering(false)
      }
      return
    }

    if (currentTrack?.id === track.id && !audio.paused) {
      audio.pause()
      return
    }

    await playTrack(track)
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

  if (!config) {
    return <Navigate to={appPaths.home} replace />
  }

  return (
    <div className="client-cute-theme min-h-screen bg-[color:var(--bg-app)] px-2.5 py-2.5 text-[color:var(--text-primary)]">
      <div className="mx-auto flex min-h-[calc(100vh-1.25rem)] w-full max-w-[1920px] flex-col gap-2.5">
        <header className="top-shell flex items-center justify-between gap-3 px-4 py-3">
          <Link to={appPaths.home} className="brand-word inline-flex" aria-label="TMusic home">
            TMusic
          </Link>
          <Link to={appPaths.home} className="icon-frame" aria-label="Trang chủ">
            <HomeIcon />
          </Link>
        </header>

        <main className="panel-surface flex-1 overflow-hidden">
          <div className="content-veil" />
          <div
            className={`relative h-full overflow-y-auto px-4 pt-6 sm:px-6 lg:px-8 ${
              currentTrack ? 'pb-[18rem] sm:pb-[14rem]' : 'pb-10'
            }`}
          >
            <audio ref={audioRef} preload="none" />
            <section className="mb-6">
              <div className="flex flex-wrap items-center gap-3">
                <p className="section-kicker mb-0">{liveLabel}</p>
                <span className="hero-soft-badge">{items.length} mục</span>
              </div>
              <h1 className="mt-3 font-display text-[2rem] font-extrabold leading-tight text-[color:var(--text-primary)] sm:text-[2.6rem]">
                {config.title}
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-[color:var(--text-secondary)]">
                {config.subtitle}
              </p>
            </section>

            {isLoading ? (
              <SectionSkeletonGrid />
            ) : items.length > 0 ? (
              <section className={`section-page-grid section-page-grid-${config.kind}`}>
                {items.map((item, index) => (
                  <SectionCard
                    key={item.id || item.name || item.title || index}
                    sectionKey={sectionKey}
                    item={item}
                    index={index}
                    isActive={currentTrack?.id === item.id}
                    isPlaying={isPlaying}
                    isBuffering={isBuffering}
                    onPlay={() => void toggleTrack(item)}
                  />
                ))}
              </section>
            ) : (
              <SectionEmptyState message={config.empty} />
            )}

            <div className="mt-6 flex justify-between gap-4 border-t border-white/8 pt-5 text-sm text-[color:var(--text-secondary)]">
              <span>{items.length} mục</span>
              <Link to={appPaths.home} className="inline-flex items-center gap-2 text-[color:var(--tertiary)]">
                Quay lại trang chủ
                <ChevronRightSmallIcon />
              </Link>
            </div>

            {playbackError ? (
              <p className="mt-5 text-sm font-medium text-[color:#ffb5a8]">{playbackError}</p>
            ) : null}

            {currentTrack ? (
              <div className="app-player-shell fixed inset-x-3 bottom-3 z-30">
                <section className="app-player-bar app-player-bar-with-queue">
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
                      <div className="min-w-0">
                        <p className="text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[color:#8fdfff]">
                          Đang phát
                        </p>
                        <h3 className="truncate text-[1rem] font-bold text-white">{currentTrack.title}</h3>
                        <p className="truncate text-[0.82rem] text-white/58">{currentTrack.artist}</p>
                      </div>
                    </div>
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center justify-center gap-2.5">
                      <button
                        type="button"
                        className="player-icon-button-primary"
                        aria-label={isPlaying ? `Tạm dừng ${currentTrack.title}` : `Phát ${currentTrack.title}`}
                        onClick={() => void toggleTrack(currentTrack)}
                      >
                        {isBuffering ? (
                          <span className="player-loading-dot" />
                        ) : isPlaying ? (
                          <PauseIcon />
                        ) : (
                          <PlayIcon />
                        )}
                      </button>
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
                      <button
                        type="button"
                        className="player-icon-button"
                        aria-label={volumeLevel === 0 ? 'Bật âm thanh' : 'Tắt âm thanh'}
                        onClick={handleToggleMute}
                      >
                        {volumeLevel === 0 ? <MuteIcon /> : <SpeakerIcon />}
                      </button>
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
                    </div>

                    {queueTracks.length > 0 ? (
                      <div className="player-queue-mini">
                        <p>Tiếp theo</p>
                        {queueTracks.map((track) => (
                          <button key={track.id || track.title} type="button" onClick={() => void playTrack(track)}>
                            {track.title}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </section>
              </div>
            ) : null}
          </div>
        </main>
      </div>

      {gateTrack ? (
        <GuestPlaybackGateModal
          track={gateTrack}
          coverSrc={gateTrack.coverUrl}
          fallbackArtwork={gateTrack.artwork}
          canInstallApp={false}
          onInstallApp={() => {}}
          onClose={closeGate}
        />
      ) : null}
    </div>
  )
}

export default HomeSectionPage
