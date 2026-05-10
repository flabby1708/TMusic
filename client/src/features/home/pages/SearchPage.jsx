import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { appPaths } from '../../../app/routes/paths.js'
import {
  HomeIcon,
  PauseIcon,
  PlayIcon,
  SearchIcon,
  SpeakerIcon,
  MuteIcon,
} from '../../../shared/icons.jsx'
import { useHomePageData } from '../useHomePageData.js'
import {
  albumMockImages,
  artistMockImages,
  trackMockImages,
} from '../homeData.js'
import { useAuthSession } from '../../auth/useAuthSession.js'
import GuestPlaybackGateModal from '../components/GuestPlaybackGateModal.jsx'

const normalizeToken = (value = '') =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()

function matchQuery(values, query) {
  const normalizedQuery = normalizeToken(query)

  if (!normalizedQuery) {
    return false
  }

  return values.some((value) => normalizeToken(value || '').includes(normalizedQuery))
}

function formatPlaybackSeconds(value) {
  const safeValue = Number.isFinite(value) && value >= 0 ? Math.floor(value) : 0
  const minutes = Math.floor(safeValue / 60)
  const seconds = String(safeValue % 60).padStart(2, '0')

  return `${minutes}:${seconds}`
}

function SearchResultCard({ type, item, imageUrl, isTrack, isActive, isPlaying, isBuffering, onPlay }) {
  const title = item.title || item.name
  const subtitle = item.artist || item.meta || item.subtitle || type

  return (
    <article className="track-card section-page-card p-2.5">
      <div className="relative overflow-hidden rounded-[18px]">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
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

        {isTrack ? (
          item.audioUrl ? (
            <button
              type="button"
              className="section-play-button"
              aria-label={`Phát ${title}`}
              title={`Phát ${title}`}
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
        <span className="section-card-type">{type}</span>
        <h3 className="mt-2 font-display text-[0.98rem] font-bold leading-6 text-[color:var(--text-primary)]">
          {title}
        </h3>
        <p className="mt-1 text-[0.88rem] leading-6 text-[color:var(--text-secondary)]">{subtitle}</p>
      </div>
    </article>
  )
}

function SearchPage() {
  const audioRef = useRef(null)
  const lastVolumeRef = useRef(72)
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q')?.trim() || ''
  const { homeContent, health } = useHomePageData()
  const { user, loading: authLoading, isAuthenticated } = useAuthSession()
  const [currentTrack, setCurrentTrack] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isBuffering, setIsBuffering] = useState(false)
  const [playbackError, setPlaybackError] = useState('')
  const [currentTime, setCurrentTime] = useState(0)
  const [durationSeconds, setDurationSeconds] = useState(0)
  const [volumeLevel, setVolumeLevel] = useState(72)
  const [gateTrack, setGateTrack] = useState(null)

  const results = useMemo(
    () => [
      ...homeContent.songs
        .filter((track) => matchQuery([track.title, track.artist, track.tag], query))
        .map((track, index) => ({
          type: 'Bài hát',
          kind: 'track',
          item: track,
          imageUrl: track.coverUrl || trackMockImages[index] || '',
        })),
      ...homeContent.artists
        .filter((artist) => matchQuery([artist.name, artist.meta], query))
        .map((artist, index) => ({
          type: 'Nghệ sĩ',
          kind: 'artist',
          item: artist,
          imageUrl: artist.imageUrl || artistMockImages[index] || '',
        })),
      ...homeContent.albums
        .filter((album) => matchQuery([album.title, album.artist], query))
        .map((album, index) => ({
          type: 'Album',
          kind: 'album',
          item: album,
          imageUrl: album.coverUrl || albumMockImages[index] || '',
        })),
    ],
    [homeContent.albums, homeContent.artists, homeContent.songs, query],
  )

  const isLoading = health.loading || homeContent.loading
  const playableResultTracks = results
    .filter((result) => result.kind === 'track' && result.item.audioUrl)
    .map((result) => result.item)
  const queueTracks = currentTrack
    ? playableResultTracks.filter((track) => track.id !== currentTrack.id).slice(0, 4)
    : playableResultTracks.slice(0, 4)
  const playbackProgress =
    durationSeconds > 0 ? Math.min((currentTime / durationSeconds) * 100, 100) : 0
  const currentTrackCover =
    currentTrack?.coverUrl ||
    trackMockImages[homeContent.songs.findIndex((track) => track.id === currentTrack?.id)] ||
    ''

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

  const openGate = (track) => {
    setPlaybackError('')
    setGateTrack(track)
  }

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
      openGate(track)
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
              <p className="section-kicker">Tìm kiếm</p>
              <h1 className="mt-3 font-display text-[2rem] font-extrabold leading-tight text-[color:var(--text-primary)] sm:text-[2.6rem]">
                {query ? `Kết quả cho "${query}"` : 'Nhập từ khóa để tìm nhạc'}
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-[color:var(--text-secondary)]">
                Tìm trong bài hát, nghệ sĩ và album hiện có trên TMusic.
              </p>
              {user?.email ? (
                <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--text-dim)]">
                  Đang đăng nhập: {user.email}
                </p>
              ) : null}
            </section>

            {isLoading ? (
              <section className="section-page-grid" aria-label="Đang tải kết quả">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div key={index} className="section-skeleton-card">
                    <div className="section-skeleton-art" />
                    <div className="section-skeleton-line section-skeleton-line-strong" />
                    <div className="section-skeleton-line" />
                  </div>
                ))}
              </section>
            ) : results.length > 0 ? (
              <section className="section-page-grid">
                {results.map((result, index) => (
                  <SearchResultCard
                    key={`${result.type}-${result.item.id || result.item.name || result.item.title}-${index}`}
                    {...result}
                    isTrack={result.kind === 'track'}
                    isActive={currentTrack?.id === result.item.id}
                    isPlaying={isPlaying}
                    isBuffering={isBuffering}
                    onPlay={() => void toggleTrack(result.item)}
                  />
                ))}
              </section>
            ) : (
              <section className="section-empty-state">
                <SearchIcon />
                <h2 className="mt-4 font-display text-[1.6rem] font-extrabold text-[color:var(--text-primary)]">
                  Không tìm thấy kết quả
                </h2>
                <p className="mt-2 max-w-xl text-sm leading-7 text-[color:var(--text-secondary)]">
                  Thử tìm bằng tên bài hát, nghệ sĩ hoặc album khác.
                </p>
                <Link to={appPaths.home} className="primary-button mt-5 w-fit">
                  Quay lại trang chủ
                </Link>
              </section>
            )}

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

export default SearchPage
