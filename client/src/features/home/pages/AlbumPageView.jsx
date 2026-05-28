import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { appPaths } from '../../../app/routes/paths.js'
import {
  DeviceIcon,
  ExpandIcon,
  HomeIcon,
  LibraryIcon,
  LyricsIcon,
  NextTrackIcon,
  PauseIcon,
  PlayIcon,
  PlusIcon,
  PreviousTrackIcon,
  QueueIcon,
  RepeatIcon,
  SearchIcon,
  ShuffleIcon,
  SpeakerIcon,
  SpotifyIcon,
  VideoIcon,
} from '../../../shared/icons.jsx'
import {
  buildAlbumPath,
  buildAlbumTrackList,
  buildCatalogAlbumItems,
  buildSuggestedRadioItems,
  buildUserAlbumItems,
  buildUserMixItems,
  findAlbumItem,
} from '../albumLibrary.js'
import { useHomePageData } from '../useHomePageData.js'
import { useAuthSession } from '../../auth/useAuthSession.js'

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

function getItemTypeLabel(type) {
  if (type === 'artist') {
    return 'Artist collection'
  }

  if (type === 'album') {
    return 'Album'
  }

  return 'Public Playlist'
}

function getTrackAudioUrl(track) {
  if (track?.audioUrl) {
    return track.audioUrl
  }

  const readyVariant = track?.audioVariants?.find((variant) => variant?.status === 'ready' && variant?.url)

  return readyVariant?.url || ''
}

function getTrackCoverUrl(track) {
  return track?.coverUrl || ''
}

function formatPlaybackSeconds(value) {
  const safeValue = Number.isFinite(value) && value >= 0 ? Math.floor(value) : 0
  const minutes = Math.floor(safeValue / 60)
  const seconds = String(safeValue % 60).padStart(2, '0')

  return `${minutes}:${seconds}`
}

function AlbumCover({ item, className = '' }) {
  if (item?.imageUrl) {
    return <img src={item.imageUrl} alt={item.title} className={className} />
  }

  if (item?.liked) {
    return (
      <div className={`${className} grid place-items-center bg-gradient-to-br from-[#5236ff] to-[#bbf7d0]`}>
        <span className="text-5xl text-white">♥</span>
      </div>
    )
  }

  return (
    <div
      className={`${className} grid place-items-center`}
      style={{ backgroundImage: item?.artwork || 'linear-gradient(135deg, #2f6dff, #102475)' }}
    >
      <span className="font-display text-5xl font-extrabold text-white">
        {(item?.title || 'TM').slice(0, 2).toUpperCase()}
      </span>
    </div>
  )
}

function SidebarAlbumButton({ item, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-[8px] p-2 text-left transition ${
        active ? 'bg-white/14' : 'hover:bg-white/8'
      }`}
    >
      <AlbumCover item={item} className="h-14 w-14 shrink-0 rounded-[6px] object-cover" />
      <span className="min-w-0">
        <strong className="block truncate text-[0.98rem] text-[color:var(--text-primary)]">
          {item.title}
        </strong>
        <small className="mt-1 block truncate text-[0.84rem] font-semibold text-[color:var(--text-secondary)]">
          {item.subtitle}
        </small>
      </span>
    </button>
  )
}

function AlbumTrackRow({
  track,
  index,
  albumTitle,
  currentTrack,
  isPlaying,
  isBuffering,
  onPlay,
}) {
  const isActive = currentTrack?.id === track.id
  const canPlay = Boolean(getTrackAudioUrl(track))

  return (
    <tr
      className={`group cursor-pointer border-b border-white/7 text-[color:var(--text-secondary)] transition hover:bg-white/[0.055] ${
        isActive ? 'bg-white/[0.045]' : ''
      }`}
      onClick={() => onPlay(track)}
    >
      <td className="w-12 px-3 py-3 text-center text-sm align-middle">
        <div className="relative mx-auto h-8 w-8">
          <span
            className={`absolute inset-0 grid place-items-center transition-opacity ${
              isActive ? 'opacity-0' : 'opacity-100 group-hover:opacity-0'
            }`}
          >
            {index + 1}
          </span>
          <button
            type="button"
            className={`absolute inset-0 grid place-items-center rounded-full text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-45 ${
              isActive
                ? 'opacity-100'
                : 'pointer-events-none opacity-0 group-hover:pointer-events-auto group-hover:opacity-100'
            }`}
          aria-label={`${isActive && isPlaying ? 'Tạm dừng' : 'Phát'} ${track.title}`}
            disabled={!canPlay}
            onClick={(event) => {
              event.stopPropagation()
              onPlay(track)
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
        </div>
      </td>
      <td className="px-3 py-3 align-middle">
        <div className="flex min-w-0 items-center gap-3">
          {track.coverUrl ? (
            <img src={track.coverUrl} alt="" className="h-11 w-11 rounded-[6px] object-cover" />
          ) : (
            <div
              className="h-11 w-11 rounded-[6px]"
              style={{ backgroundImage: track.artwork || 'linear-gradient(135deg,#334155,#0f172a)' }}
            />
          )}
          <span className="min-w-0">
            <strong className="block truncate text-[0.98rem] text-[color:var(--text-primary)]">
              {track.title}
            </strong>
            <small className="mt-0.5 block truncate text-sm">
              {canPlay ? track.artist || 'TMusic' : `${track.artist || 'TMusic'} • chưa có audio`}
            </small>
          </span>
        </div>
      </td>
      <td className="hidden px-3 py-3 align-middle text-sm md:table-cell">{albumTitle}</td>
      <td className="hidden px-3 py-3 align-middle text-sm lg:table-cell">Oct 7, 2025</td>
      <td className="px-3 py-3 text-right align-middle text-sm">{track.duration || '0:00'}</td>
    </tr>
  )
}

function AlbumPageView() {
  const { albumId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const audioRef = useRef(null)
  const { user, logout } = useAuthSession()
  const { homeContent } = useHomePageData()
  const [currentTrack, setCurrentTrack] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isBuffering, setIsBuffering] = useState(false)
  const [playbackError, setPlaybackError] = useState('')
  const [currentTime, setCurrentTime] = useState(0)
  const [durationSeconds, setDurationSeconds] = useState(0)
  const [playbackAlbumId, setPlaybackAlbumId] = useState('')
  const [volumeLevel, setVolumeLevel] = useState(72)
  const [isShuffleEnabled, setIsShuffleEnabled] = useState(false)
  const [isRepeatEnabled, setIsRepeatEnabled] = useState(false)
  const userDisplayName = useMemo(() => getUserDisplayName(user), [user])
  const userInitials = useMemo(() => getUserInitials(user), [user])
  const playableTracks = useMemo(
    () => homeContent.songs.filter((track) => Boolean(track.audioUrl)),
    [homeContent.songs],
  )
  const libraryItems = useMemo(
    () =>
      buildUserAlbumItems({
        homeContent,
        playableTracks,
        userDisplayName,
      }),
    [homeContent, playableTracks, userDisplayName],
  )
  const mixItems = useMemo(
    () =>
      buildUserMixItems({
        homeContent,
        playableTracks,
      }),
    [homeContent, playableTracks],
  )
  const suggestedItems = useMemo(
    () =>
      buildSuggestedRadioItems({
        homeContent,
        playableTracks,
      }),
    [homeContent, playableTracks],
  )
  const catalogAlbumItems = useMemo(
    () =>
      buildCatalogAlbumItems({
        homeContent,
        playableTracks,
      }),
    [homeContent, playableTracks],
  )
  const albumItem = useMemo(() => {
    const stateAlbum = location.state?.albumItem

    if (stateAlbum?.albumId === albumId) {
      return stateAlbum
    }

    return (
      findAlbumItem(albumId, [libraryItems, mixItems, suggestedItems, catalogAlbumItems]) ||
      libraryItems[0] ||
      null
    )
  }, [albumId, catalogAlbumItems, libraryItems, location.state, mixItems, suggestedItems])
  const albumTracks = useMemo(
    () => buildAlbumTrackList(albumItem, homeContent),
    [albumItem, homeContent],
  )
  const playbackProgress =
    durationSeconds > 0 ? Math.min((currentTime / durationSeconds) * 100, 100) : 0
  const activePlayerTrack = playbackAlbumId === albumId ? currentTrack : null

  useEffect(() => {
    const audio = audioRef.current

    if (!audio) {
      return undefined
    }

    const handlePlay = () => {
      setIsPlaying(true)
      setIsBuffering(false)
    }
    const handlePause = () => {
      setIsPlaying(false)
      setIsBuffering(false)
    }
    const handleWaiting = () => {
      setIsBuffering(true)
    }
    const handleCanPlay = () => {
      setIsBuffering(false)
    }
    const handleLoadedMetadata = () => {
      setDurationSeconds(Number.isFinite(audio.duration) ? audio.duration : 0)
    }
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime || 0)
    }
    const handleEnded = () => {
      setIsPlaying(false)
      setIsBuffering(false)
      setCurrentTime(0)
    }
    const handleError = () => {
      setIsPlaying(false)
      setIsBuffering(false)
      setPlaybackError('Không thể phát file audio của bài này.')
    }

    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('waiting', handleWaiting)
    audio.addEventListener('canplay', handleCanPlay)
    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('durationchange', handleLoadedMetadata)
    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('error', handleError)

    return () => {
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('waiting', handleWaiting)
      audio.removeEventListener('canplay', handleCanPlay)
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('durationchange', handleLoadedMetadata)
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('error', handleError)
    }
  }, [])

  useEffect(() => {
    const audio = audioRef.current

    if (audio) {
      audio.pause()
      audio.removeAttribute('src')
      audio.load()
    }
  }, [albumId])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.loop = isRepeatEnabled
    }
  }, [isRepeatEnabled])

  const handleLogout = () => {
    logout()
    navigate(appPaths.auth.login)
  }

  const handleAlbumNavigation = (item) => {
    navigate(buildAlbumPath(item), {
      state: {
        albumItem: item,
      },
    })
  }

  const handleTrackPlayback = async (track) => {
    const audio = audioRef.current
    const audioUrl = getTrackAudioUrl(track)

    if (!audioUrl) {
      setPlaybackError('Bài này chưa có file audio để phát.')
      return
    }

    if (!audio) {
      return
    }

    setPlaybackError('')

    if (currentTrack?.id === track.id) {
      if (audio.paused) {
        try {
          setIsBuffering(true)
          audio.volume = volumeLevel / 100
          await audio.play()
        } catch {
          setIsBuffering(false)
          setPlaybackError('Trình duyệt đã chặn phát tự động. Hãy bấm lại.')
        }
      } else {
        audio.pause()
      }

      return
    }

    setCurrentTrack(track)
    setPlaybackAlbumId(albumId || '')
    setCurrentTime(0)
    setDurationSeconds(0)
    audio.pause()
    audio.volume = volumeLevel / 100
    audio.src = audioUrl
    audio.load()

    try {
      setIsBuffering(true)
      await audio.play()
    } catch {
      setIsBuffering(false)
      setIsPlaying(false)
      setPlaybackError('Không thể phát bài này. Hãy kiểm tra file audio.')
    }
  }

  const handleSkipTrack = (direction) => {
    const playableAlbumTracks = albumTracks.filter((track) => getTrackAudioUrl(track))

    if (playableAlbumTracks.length === 0) {
      setPlaybackError('Album này chưa có bài nào có audio để phát.')
      return
    }

    const currentIndex = playableAlbumTracks.findIndex((track) => track.id === currentTrack?.id)
    let nextIndex = currentIndex

    if (currentIndex === -1) {
      nextIndex = direction > 0 ? 0 : playableAlbumTracks.length - 1
    } else if (isShuffleEnabled && direction > 0 && playableAlbumTracks.length > 1) {
      const randomOffset = Math.floor(Math.random() * (playableAlbumTracks.length - 1)) + 1
      nextIndex = (currentIndex + randomOffset) % playableAlbumTracks.length
    } else {
      nextIndex = (currentIndex + direction + playableAlbumTracks.length) % playableAlbumTracks.length
    }

    void handleTrackPlayback(playableAlbumTracks[nextIndex])
  }

  const handleAlbumPlay = () => {
    const firstPlayableTrack = albumTracks.find((track) => getTrackAudioUrl(track))

    if (!firstPlayableTrack) {
      setPlaybackError('Album này chưa có bài nào có audio để phát.')
      return
    }

    void handleTrackPlayback(firstPlayableTrack)
  }

  const handleSeekChange = (event) => {
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
    const safeVolume = Number.isFinite(nextVolume) ? Math.min(Math.max(nextVolume, 0), 100) : 72

    setVolumeLevel(safeVolume)

    if (audioRef.current) {
      audioRef.current.volume = safeVolume / 100
    }
  }

  if (!albumItem) {
    return null
  }

  return (
    <div className="client-cute-theme flex min-h-screen flex-col bg-[color:var(--bg-app)] px-2.5 py-2.5 text-[color:var(--text-primary)] xl:h-screen xl:overflow-hidden">
      <audio ref={audioRef} preload="none" />
      <header className="mb-2.5 flex flex-wrap items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-3">
          <Link
            to={appPaths.home}
            className="grid h-[3.25rem] w-[3.25rem] place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/16"
            aria-label="Trang chủ"
          >
            <HomeIcon />
          </Link>
          <Link
            to={appPaths.search}
            className="flex min-h-[3.25rem] min-w-[18rem] items-center gap-3 rounded-full bg-white/10 px-5 text-[color:var(--text-secondary)] transition hover:bg-white/16"
          >
            <SearchIcon />
            <span className="font-semibold">What do you want to play?</span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-white/12 font-display text-sm font-extrabold text-white">
            {userInitials}
          </span>
          <button type="button" className="secondary-button" onClick={handleLogout}>
            Đăng xuất
          </button>
        </div>
      </header>

      <div className="grid flex-1 gap-2.5 xl:min-h-0 xl:grid-cols-[372px_minmax(0,1fr)] xl:overflow-hidden">
        <aside className="panel-surface flex min-h-[280px] flex-col overflow-hidden xl:h-full xl:min-h-0">
          <div className="flex items-center justify-between px-5 py-4.5">
            <div className="flex items-center gap-3">
              <LibraryIcon />
              <h2 className="font-display text-[1.3rem] font-extrabold tracking-tight">
                Thư viện
              </h2>
            </div>
            <button type="button" className="secondary-button inline-flex items-center gap-2">
              <PlusIcon />
              Tạo
            </button>
          </div>

          <div className="hide-scrollbar flex-1 space-y-2.5 overflow-y-auto px-3.5 pb-4">
            {libraryItems.map((item) => (
              <SidebarAlbumButton
                key={item.albumId}
                item={item}
                active={item.albumId === albumItem.albumId}
                onClick={() => handleAlbumNavigation(item)}
              />
            ))}
          </div>
        </aside>

        <main className="panel-surface relative overflow-hidden xl:min-h-0">
          <div className="hide-scrollbar h-full overflow-y-auto overscroll-contain">
            <section className="bg-[linear-gradient(180deg,#3d80ff_0%,#14389f_76%,#101114_100%)] px-5 pb-8 pt-6 sm:px-8">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-end">
                <AlbumCover
                  item={albumItem}
                  className="aspect-square w-52 shrink-0 rounded-[6px] object-cover shadow-[0_24px_72px_rgba(0,0,0,0.36)]"
                />
                <div className="min-w-0 pb-1">
                  <p className="text-sm font-extrabold text-white">
                    {getItemTypeLabel(albumItem.type)}
                  </p>
                  <h1 className="mt-3 break-words font-display text-[3.5rem] font-extrabold leading-none text-white sm:text-[5.5rem]">
                    {albumItem.title}
                  </h1>
                  <p className="mt-5 flex flex-wrap items-center gap-2 text-sm font-bold text-white/82">
                    <SpotifyIcon />
                    <span>{userDisplayName}</span>
                    <span>•</span>
                    <span>{Math.max(albumTracks.length, 1)} songs</span>
                    <span>•</span>
                    <span>system album</span>
                  </p>
                </div>
              </div>
            </section>

            <section className="bg-[linear-gradient(180deg,rgba(20,56,159,0.34),rgba(18,18,18,0.98)_18rem)] px-5 py-7 sm:px-8">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    className="grid h-16 w-16 place-items-center rounded-full bg-[color:var(--primary)] text-[#221017] shadow-[0_18px_34px_rgba(255,141,154,0.25)] transition hover:scale-105"
                    aria-label="Phát album"
                    onClick={handleAlbumPlay}
                  >
                    <PlayIcon />
                  </button>
                  <button
                    type="button"
                    className="player-icon-button player-icon-button-active"
                    aria-label="Trộn bài"
                  >
                    <ShuffleIcon />
                  </button>
                  <button
                    type="button"
                    className="player-icon-button"
                    aria-label="Tùy chọn album"
                  >
                    <QueueIcon />
                  </button>
                </div>
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-bold text-[color:var(--text-secondary)]">
                  Custom order
                </span>
              </div>

              {playbackError ? (
                <div className="mt-5 rounded-[10px] border border-[color:rgba(255,93,122,0.28)] bg-[color:rgba(255,93,122,0.1)] px-4 py-3 text-sm font-semibold text-[color:#ffd8e1]">
                  {playbackError}
                </div>
              ) : null}

              <div className="mt-7 overflow-hidden rounded-[10px]">
                <table className="w-full min-w-[720px] border-collapse text-left">
                  <thead className="border-b border-white/12 text-sm text-[color:var(--text-secondary)]">
                    <tr>
                      <th className="w-12 px-3 py-3 text-center font-bold">#</th>
                      <th className="px-3 py-3 font-bold">Title</th>
                      <th className="hidden px-3 py-3 font-bold md:table-cell">Album</th>
                      <th className="hidden px-3 py-3 font-bold lg:table-cell">Date added</th>
                      <th className="px-3 py-3 text-right font-bold">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {albumTracks.length > 0 ? (
                      albumTracks.map((track, index) => (
                        <AlbumTrackRow
                          key={track.id || `${track.title}-${index}`}
                          track={track}
                          index={index}
                          albumTitle={albumItem.title}
                          currentTrack={activePlayerTrack}
                          isPlaying={isPlaying}
                          isBuffering={isBuffering}
                          onPlay={handleTrackPlayback}
                        />
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-3 py-12 text-center text-[color:var(--text-secondary)]">
                          Album page đã sẵn sàng. Bạn có thể thêm danh sách bài hát thật sau.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </main>
      </div>

      {activePlayerTrack ? (
      <section className="app-player-bar album-player-bar mt-2.5">
        <div className="flex min-w-0 items-center gap-3">
          {getTrackCoverUrl(activePlayerTrack) ? (
            <img
              src={getTrackCoverUrl(activePlayerTrack)}
              alt=""
              className="h-16 w-16 rounded-[10px] object-cover"
            />
          ) : (
            <div
              className="h-16 w-16 rounded-[10px]"
              style={{ backgroundImage: activePlayerTrack.artwork || 'linear-gradient(135deg,#334155,#0f172a)' }}
            />
          )}
          <div className="min-w-0">
            <p className="truncate text-[0.72rem] font-black uppercase tracking-[0.24em] text-[#7dffad]">
              Đang phát
            </p>
            <p className="mt-2 truncate text-[1rem] font-extrabold text-white">
              {activePlayerTrack.title}
            </p>
            <p className="mt-1 truncate text-sm font-semibold text-[color:var(--text-secondary)]">
              {[activePlayerTrack.tag, activePlayerTrack.artist || 'TMusic'].filter(Boolean).join(' / ')}
            </p>
          </div>
          <button
            type="button"
            className="ml-auto hidden h-10 w-10 place-items-center rounded-full text-[color:var(--text-secondary)] transition hover:bg-white/10 hover:text-white sm:grid"
            aria-label="Thêm vào thư viện"
          >
            <PlusIcon />
          </button>
        </div>

        <div className="grid min-w-0 gap-3">
          <div className="flex items-center justify-center gap-4">
            <button
              type="button"
              className={`player-icon-button${isShuffleEnabled ? ' player-icon-button-active' : ''}`}
              aria-label="Trộn bài"
              aria-pressed={isShuffleEnabled}
              onClick={() => setIsShuffleEnabled((value) => !value)}
            >
              <ShuffleIcon />
            </button>
            <button
              type="button"
              className="player-icon-button"
              aria-label="Bài trước"
              onClick={() => handleSkipTrack(-1)}
            >
              <PreviousTrackIcon />
            </button>
            <button
              type="button"
              className="album-player-play-button"
              aria-label={isPlaying ? 'Tạm dừng' : 'Phát'}
              disabled={!activePlayerTrack}
              onClick={() => {
                if (activePlayerTrack) {
                  void handleTrackPlayback(activePlayerTrack)
                }
              }}
            >
              {isBuffering ? <span className="player-loading-dot" /> : isPlaying ? <PauseIcon /> : <PlayIcon />}
            </button>
            <button
              type="button"
              className="player-icon-button"
              aria-label="Bài tiếp theo"
              onClick={() => handleSkipTrack(1)}
            >
              <NextTrackIcon />
            </button>
            <button
              type="button"
              className={`player-icon-button${isRepeatEnabled ? ' player-icon-button-active' : ''}`}
              aria-label="Lặp lại"
              aria-pressed={isRepeatEnabled}
              onClick={() => setIsRepeatEnabled((value) => !value)}
            >
              <RepeatIcon />
            </button>
          </div>
          <div className="flex min-w-0 items-center gap-2">
            <span className="player-time-label">{formatPlaybackSeconds(currentTime)}</span>
            <input
              type="range"
              min="0"
              max={Math.max(durationSeconds, 1)}
              step="1"
              value={Math.min(currentTime, Math.max(durationSeconds, 1))}
              className="player-slider"
              style={{ '--player-slider-progress': `${playbackProgress}%` }}
              disabled={!activePlayerTrack || durationSeconds <= 0}
              aria-label="Tua bài đang phát"
              onChange={handleSeekChange}
            />
            <span className="player-time-label">
              {durationSeconds > 0
                ? formatPlaybackSeconds(durationSeconds)
                : activePlayerTrack?.duration || '--:--'}
            </span>
          </div>
          {playbackError ? (
            <p className="text-center text-xs font-semibold text-[color:#ffd8e1]">{playbackError}</p>
          ) : null}
        </div>

        <div className="hidden min-w-0 items-center justify-end gap-2 text-[color:var(--text-secondary)] lg:flex">
          <button type="button" className="player-icon-button" aria-label="Lời bài hát">
            <LyricsIcon />
          </button>
          <button type="button" className="player-icon-button" aria-label="Hàng đợi">
            <QueueIcon />
          </button>
          <button type="button" className="player-icon-button" aria-label="Âm lượng">
            <SpeakerIcon />
          </button>
          <button type="button" className="player-icon-button" aria-label="Video">
            <VideoIcon />
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
          <button type="button" className="player-icon-button" aria-label="Thiết bị">
            <DeviceIcon />
          </button>
          <button type="button" className="player-icon-button" aria-label="Mở rộng player">
            <ExpandIcon />
          </button>
        </div>
      </section>
      ) : null}
    </div>
  )
}

export default AlbumPageView
