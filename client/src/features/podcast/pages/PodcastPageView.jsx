import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { appPaths } from '../../../app/routes/paths.js'
import {
  ChevronRightSmallIcon,
  DownloadIcon,
  HomeIcon,
  LibraryIcon,
  PauseIcon,
  PlayIcon,
  PlusIcon,
  SearchIcon,
  SpotifyIcon,
} from '../../../shared/icons.jsx'
import {
  bulkPodcastDownloads,
  podcastCategories,
  podcastEpisodes,
  podcastImportFields,
  podcastShows,
} from '../podcastData.js'

const normalizeText = (value = '') =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()

function matchesQuery(item, query) {
  const normalizedQuery = normalizeText(query)

  if (!normalizedQuery) {
    return true
  }

  return [item.title, item.host, item.showTitle, item.category, item.description]
    .filter(Boolean)
    .some((value) => normalizeText(value).includes(normalizedQuery))
}

function formatTotalDuration(seconds) {
  const safeSeconds = Math.max(Math.floor(seconds), 0)
  const minutes = Math.floor(safeSeconds / 60)
  const remainingSeconds = String(safeSeconds % 60).padStart(2, '0')

  return `${minutes}:${remainingSeconds}`
}

function buildPodcastImportManifest(items) {
  return {
    source: 'Wikimedia Commons',
    notes: 'All listed files are under 15 minutes. Check attribution requirements before publishing.',
    generatedAt: new Date().toISOString(),
    items: items.map((item, index) => ({
      sortOrder: index,
      title: item.title,
      showTitle: item.showTitle,
      host: item.host,
      category: item.category,
      duration: item.duration,
      durationSeconds: item.durationSeconds,
      license: item.license,
      sourcePage: item.sourcePage,
      audioUrl: item.audioUrl,
    })),
  }
}

async function writeTextToClipboard(text) {
  if (!navigator.clipboard?.writeText) {
    throw new Error('Clipboard API is not available')
  }

  await navigator.clipboard.writeText(text)
}

const bulkPodcastDownloadMap = new Map(bulkPodcastDownloads.map((item) => [item.id, item]))

const getEpisodeId = (episode) => `${episode.showTitle}-${episode.title}`

function buildEpisodeAudioItem(episode, show, sourceItem) {
  if (!sourceItem) {
    return null
  }

  return {
    ...sourceItem,
    id: `episode-${getEpisodeId(episode)}`,
    title: episode.title,
    showTitle: episode.showTitle,
    host: show.host,
    category: episode.category,
    duration: episode.duration,
    status: episode.status,
    sourceTitle: sourceItem.title,
  }
}

function PodcastArtwork({ item, className = '' }) {
  return (
    <div
      className={`relative grid overflow-hidden rounded-[22px] border border-white/8 ${className}`}
      style={{ background: item.artwork }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_18%,rgba(255,255,255,0.35),transparent_26%),linear-gradient(180deg,rgba(255,255,255,0.05),rgba(0,0,0,0.22))]" />
      <div className="relative flex h-full flex-col justify-between p-4">
        <SpotifyIcon />
        <div>
          <span className="font-display text-[2.15rem] font-extrabold leading-none text-white">
            {item.initials}
          </span>
          <p className="mt-2 text-[0.68rem] font-black uppercase tracking-[0.2em] text-white/74">
            Podcast
          </p>
        </div>
      </div>
    </div>
  )
}

function ShowCard({ show, featured = false, followed, onToggleFollow }) {
  return (
    <article
      className={`track-card group min-w-0 p-2.5 ${
        featured ? 'grid gap-4 lg:grid-cols-[minmax(170px,0.42fr)_minmax(0,1fr)]' : ''
      }`}
    >
      <PodcastArtwork item={show} className={featured ? 'min-h-[230px]' : 'aspect-square'} />
      <div className={featured ? 'flex min-w-0 flex-col justify-center' : 'mt-3.5'}>
        <span className="section-card-type">{show.category}</span>
        <h3
          className={`mt-3 font-display font-extrabold leading-tight text-[color:var(--text-primary)] ${
            featured ? 'text-[1.7rem]' : 'text-[1.05rem]'
          }`}
        >
          {show.title}
        </h3>
        <p className="mt-2 text-sm font-semibold text-[color:var(--text-secondary)]">
          {show.host}
        </p>
        <p className="mt-3 text-[0.92rem] leading-7 text-[color:var(--text-secondary)]">
          {show.description}
        </p>
        <div className="mt-4 flex flex-wrap gap-2 text-[0.78rem] font-bold text-[color:var(--text-secondary)]">
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1">
            {show.episodeCount} tập
          </span>
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1">
            {show.cadence}
          </span>
        </div>
        <button
          type="button"
          className={`mt-4 w-fit rounded-xl border px-4 py-2 text-sm font-extrabold transition ${
            followed
              ? 'border-[color:rgba(41,212,255,0.34)] bg-[color:rgba(41,212,255,0.12)] text-[color:#dff8ff]'
              : 'border-white/10 bg-white/[0.05] text-[color:var(--text-primary)] hover:border-[color:rgba(255,141,154,0.35)] hover:bg-white/[0.08]'
          }`}
          onClick={() => onToggleFollow(show.title)}
        >
          {followed ? 'Đang theo dõi' : 'Theo dõi'}
        </button>
      </div>
    </article>
  )
}

function EpisodeRow({
  audioItem,
  episode,
  isPlaying,
  isSaved,
  isActive,
  onPlay,
  onToggleSave,
  show,
}) {
  const canPlay = Boolean(audioItem?.audioUrl)

  return (
    <article className="grid gap-3 rounded-[18px] border border-white/8 bg-white/[0.035] p-3.5 sm:grid-cols-[72px_minmax(0,1fr)_auto] sm:items-center">
      <PodcastArtwork item={show} className="h-[72px] w-[72px] rounded-[16px]" />
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="section-card-type">{episode.category}</span>
          <span className="text-xs font-bold uppercase tracking-[0.16em] text-[color:var(--text-dim)]">
            {episode.publishedAt}
          </span>
        </div>
        <h3 className="mt-2 font-display text-[1rem] font-bold text-[color:var(--text-primary)]">
          {episode.title}
        </h3>
        <p className="mt-1 text-sm text-[color:var(--text-secondary)]">
          {episode.showTitle} / {episode.duration}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
        <span
          className={`rounded-full border px-3 py-1 text-xs font-bold ${
            episode.status === 'Sẵn sàng import'
              ? 'border-[color:rgba(41,212,255,0.28)] bg-[color:rgba(41,212,255,0.1)] text-[color:#dff8ff]'
              : 'border-[color:rgba(255,180,84,0.28)] bg-[color:rgba(255,180,84,0.1)] text-[color:#ffe3b0]'
          }`}
        >
          {episode.status}
        </span>
        {audioItem?.sourcePage ? (
          <a
            className="rounded-xl border border-white/10 bg-white/[0.045] px-3 py-2 text-xs font-extrabold text-[color:var(--text-primary)] transition hover:border-[color:rgba(255,141,154,0.34)] hover:bg-white/[0.075]"
            href={audioItem.sourcePage}
            target="_blank"
            rel="noreferrer"
          >
            Nguồn
          </a>
        ) : null}
        <button
          type="button"
          className={`rounded-xl border px-3 py-2 text-xs font-extrabold transition ${
            isSaved
              ? 'border-[color:rgba(255,180,84,0.32)] bg-[color:rgba(255,180,84,0.12)] text-[color:#ffe3b0]'
              : 'border-white/10 bg-white/[0.045] text-[color:var(--text-primary)] hover:border-[color:rgba(255,180,84,0.32)] hover:bg-white/[0.075]'
          }`}
          onClick={() => onToggleSave(getEpisodeId(episode))}
        >
          {isSaved ? 'Đã lưu' : 'Lưu'}
        </button>
        <button
          type="button"
          className={`play-chip static translate-y-0 opacity-100 disabled:cursor-not-allowed disabled:opacity-50 ${
            isActive ? 'ring-2 ring-[color:rgba(41,212,255,0.35)]' : ''
          }`}
          aria-label={canPlay ? `Nghe thử ${episode.title}` : `${episode.title} chưa có audio`}
          disabled={!canPlay}
          onClick={() => onPlay(audioItem)}
          title={canPlay ? 'Nghe thử' : 'Chưa có audio'}
        >
          {isActive && isPlaying ? <PauseIcon /> : <PlayIcon />}
        </button>
      </div>
    </article>
  )
}

function BulkDownloadRow({
  isActive,
  isPlaying,
  isSaved,
  item,
  onPlay,
  onToggle,
  onToggleSave,
  selected,
}) {
  return (
    <article className="grid gap-3 rounded-[18px] border border-white/8 bg-white/[0.035] p-3.5 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-center">
      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onToggle(item.id)}
          className="h-4 w-4 accent-[color:var(--primary)]"
          aria-label={`Chọn ${item.title}`}
        />
        <span className="section-card-type">{item.license}</span>
      </label>

      <div className="min-w-0">
        <h3 className="font-display text-[1rem] font-bold text-[color:var(--text-primary)]">
          {item.title}
        </h3>
        <p className="mt-1 text-sm text-[color:var(--text-secondary)]">
          {item.showTitle} / {item.host}
        </p>
        <div className="mt-2 flex flex-wrap gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[color:var(--text-dim)]">
          <span>{item.duration}</span>
          <span>{item.sizeMb.toFixed(2)} MB</span>
          <span>{item.category}</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 lg:justify-end">
        <button
          type="button"
          className={`play-chip static translate-y-0 opacity-100 ${
            isActive ? 'ring-2 ring-[color:rgba(41,212,255,0.35)]' : ''
          }`}
          aria-label={isActive && isPlaying ? `Tạm dừng ${item.title}` : `Nghe thử ${item.title}`}
          onClick={() => onPlay(item)}
        >
          {isActive && isPlaying ? <PauseIcon /> : <PlayIcon />}
        </button>
        <button
          type="button"
          className={`rounded-xl border px-3 py-2 text-xs font-extrabold transition ${
            isSaved
              ? 'border-[color:rgba(255,180,84,0.32)] bg-[color:rgba(255,180,84,0.12)] text-[color:#ffe3b0]'
              : 'border-white/10 bg-white/[0.045] text-[color:var(--text-primary)] hover:border-[color:rgba(255,180,84,0.32)] hover:bg-white/[0.075]'
          }`}
          onClick={() => onToggleSave(item.id)}
        >
          {isSaved ? 'Đã lưu' : 'Lưu'}
        </button>
        <a
          className="secondary-button inline-flex items-center gap-2"
          href={item.sourcePage}
          target="_blank"
          rel="noreferrer"
        >
          Nguồn
        </a>
        <a
          className="primary-button inline-flex items-center gap-2"
          href={item.audioUrl}
          download
          target="_blank"
          rel="noreferrer"
        >
          <DownloadIcon />
          Tải audio
        </a>
      </div>
    </article>
  )
}

function PodcastPageView() {
  const audioRef = useRef(null)
  const [activeCategory, setActiveCategory] = useState('Tất cả')
  const [query, setQuery] = useState('')
  const [selectedDownloadIds, setSelectedDownloadIds] = useState(() =>
    bulkPodcastDownloads.map((item) => item.id),
  )
  const [manifestNotice, setManifestNotice] = useState('')
  const [followedShowTitles, setFollowedShowTitles] = useState([])
  const [savedAudioIds, setSavedAudioIds] = useState([])
  const [currentAudioItem, setCurrentAudioItem] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackError, setPlaybackError] = useState('')

  const filteredShows = useMemo(
    () =>
      podcastShows.filter(
        (show) =>
          (activeCategory === 'Tất cả' || show.category === activeCategory) &&
          matchesQuery(show, query),
      ),
    [activeCategory, query],
  )
  const filteredEpisodes = useMemo(
    () =>
      podcastEpisodes.filter(
        (episode) =>
          (activeCategory === 'Tất cả' || episode.category === activeCategory) &&
          matchesQuery(episode, query),
      ),
    [activeCategory, query],
  )
  const featuredShow = filteredShows[0] || podcastShows[0]
  const readyEpisodeCount = podcastEpisodes.filter((episode) => episode.status === 'Sẵn sàng import').length
  const filteredDownloads = useMemo(
    () => bulkPodcastDownloads.filter((item) => matchesQuery(item, query)),
    [query],
  )
  const selectedDownloads = useMemo(
    () => bulkPodcastDownloads.filter((item) => selectedDownloadIds.includes(item.id)),
    [selectedDownloadIds],
  )
  const totalDownloadDuration = selectedDownloads.reduce(
    (total, item) => total + item.durationSeconds,
    0,
  )
  const totalDownloadSize = selectedDownloads.reduce((total, item) => total + item.sizeMb, 0)
  const filteredSelectedDownloadCount = filteredDownloads.filter((item) =>
    selectedDownloadIds.includes(item.id),
  ).length

  useEffect(() => {
    const audio = audioRef.current

    if (!audio) {
      return undefined
    }

    const handlePlay = () => {
      setIsPlaying(true)
      setPlaybackError('')
    }
    const handlePause = () => setIsPlaying(false)
    const handleEnded = () => setIsPlaying(false)
    const handleError = () => {
      setIsPlaying(false)
      setPlaybackError('Không phát được file này. Bạn vẫn có thể mở nguồn hoặc tải audio.')
    }

    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('error', handleError)

    return () => {
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('error', handleError)
    }
  }, [])

  const handleToggleShowFollow = (showTitle) => {
    setFollowedShowTitles((currentTitles) =>
      currentTitles.includes(showTitle)
        ? currentTitles.filter((title) => title !== showTitle)
        : [...currentTitles, showTitle],
    )
  }

  const handleToggleSavedAudio = (itemId) => {
    setSavedAudioIds((currentIds) =>
      currentIds.includes(itemId)
        ? currentIds.filter((id) => id !== itemId)
        : [...currentIds, itemId],
    )
  }

  const handlePlayAudio = async (item) => {
    const audio = audioRef.current

    if (!audio || !item?.audioUrl) {
      setPlaybackError('Tập này chưa có audio để nghe thử.')
      return
    }

    setPlaybackError('')

    if (currentAudioItem?.id === item.id) {
      if (audio.paused) {
        try {
          await audio.play()
        } catch {
          setPlaybackError('Trình duyệt chưa cho phát tự động. Bấm lại nút nghe thử một lần nữa nhé.')
        }
      } else {
        audio.pause()
      }

      return
    }

    setCurrentAudioItem(item)
    audio.src = item.audioUrl
    audio.load()

    try {
      await audio.play()
    } catch {
      setIsPlaying(false)
      setPlaybackError('Chưa phát được audio này. Hãy thử mở nguồn hoặc tải file về kiểm tra.')
    }
  }

  const handleToggleDownload = (itemId) => {
    setManifestNotice('')
    setSelectedDownloadIds((currentIds) =>
      currentIds.includes(itemId)
        ? currentIds.filter((id) => id !== itemId)
        : [...currentIds, itemId],
    )
  }

  const handleSelectAllDownloads = () => {
    setManifestNotice('')
    setSelectedDownloadIds(filteredDownloads.map((item) => item.id))
  }

  const handleClearDownloads = () => {
    setManifestNotice('')
    setSelectedDownloadIds([])
  }

  const handleCopyManifest = async () => {
    const manifestText = JSON.stringify(buildPodcastImportManifest(selectedDownloads), null, 2)

    try {
      await writeTextToClipboard(manifestText)
      setManifestNotice(`Đã copy manifest ${selectedDownloads.length} file vào clipboard.`)
    } catch {
      setManifestNotice('Trình duyệt không cho copy tự động. Hãy tải manifest bằng nút bên cạnh.')
    }
  }

  const handleCopyAudioUrls = async () => {
    const audioUrls = selectedDownloads.map((item) => item.audioUrl).join('\n')

    try {
      await writeTextToClipboard(audioUrls)
      setManifestNotice(`Đã copy ${selectedDownloads.length} link audio vào clipboard.`)
    } catch {
      setManifestNotice('Trình duyệt không cho copy tự động. Hãy tải manifest để lấy danh sách URL.')
    }
  }

  const manifestDownloadUrl = useMemo(() => {
    const manifestText = JSON.stringify(buildPodcastImportManifest(selectedDownloads), null, 2)
    return `data:application/json;charset=utf-8,${encodeURIComponent(manifestText)}`
  }, [selectedDownloads])

  return (
    <div className="client-cute-theme min-h-screen bg-[color:var(--bg-app)] px-2.5 py-2.5 text-[color:var(--text-primary)]">
      <div className="mx-auto flex min-h-[calc(100vh-1.25rem)] w-full max-w-[1920px] flex-col gap-2.5">
        <header className="top-shell flex flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <Link to={appPaths.home} className="brand-badge" aria-label="Trang chủ TMusic">
              <SpotifyIcon />
            </Link>
            <Link to={appPaths.home} className="brand-word hidden sm:inline-flex" aria-label="TMusic home">
              TMusic
            </Link>
            <Link to={appPaths.home} className="icon-frame" aria-label="Trang chủ">
              <HomeIcon />
            </Link>
          </div>

          <form
            className="search-shell order-3 w-full sm:order-none sm:max-w-xl"
            onSubmit={(event) => event.preventDefault()}
          >
            <SearchIcon />
            <input
              className="search-input"
              type="text"
              placeholder="Tìm show, host hoặc chủ đề podcast"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </form>

          <Link to={appPaths.home} className="secondary-button inline-flex items-center gap-2">
            <LibraryIcon />
            Thư viện
          </Link>
        </header>

        <main className="panel-surface relative flex-1 overflow-hidden">
          <audio ref={audioRef} preload="none" />
          <div className="content-veil" />
          <div className="hide-scrollbar relative h-full overflow-y-auto overscroll-contain px-4 pb-36 pt-6 sm:px-6 lg:px-8">
            <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
              <div className="min-w-0">
                <p className="section-kicker">Podcast</p>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="font-display text-[2.25rem] font-extrabold leading-tight text-[color:var(--text-primary)] sm:text-[3.35rem]">
                    Không gian podcast
                  </h1>
                  <span className="hero-soft-badge">{readyEpisodeCount} tập sẵn sàng</span>
                </div>
                <p className="mt-4 max-w-3xl text-sm leading-7 text-[color:var(--text-secondary)]">
                  Một mặt bằng riêng cho show, episode, cover và trạng thái import trước khi đưa vào thư viện chính.
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  {podcastCategories.map((category) => (
                    <button
                      key={category}
                      type="button"
                      className={`rounded-full border px-4 py-2 text-sm font-extrabold transition ${
                        activeCategory === category
                          ? 'border-[color:rgba(255,141,154,0.42)] bg-[color:rgba(255,141,154,0.18)] text-white'
                          : 'border-white/10 bg-white/[0.035] text-[color:var(--text-secondary)] hover:text-white'
                      }`}
                      onClick={() => setActiveCategory(category)}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              <aside className="rounded-[24px] border border-white/8 bg-white/[0.035] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="section-kicker mb-1">Import map</p>
                    <h2 className="font-display text-[1.2rem] font-extrabold">Trường cần có</h2>
                  </div>
                  <PlusIcon />
                </div>
                <div className="mt-4 grid gap-2">
                  {podcastImportFields.map((field) => (
                    <div
                      key={field.label}
                      className="rounded-[14px] border border-white/8 bg-black/10 px-3 py-2"
                    >
                      <p className="text-xs font-black uppercase tracking-[0.16em] text-[color:var(--text-dim)]">
                        {field.label}
                      </p>
                      <p className="mt-1 text-sm font-bold text-[color:var(--text-primary)]">
                        {field.value}
                      </p>
                    </div>
                  ))}
                </div>
              </aside>
            </section>

            <section className="mt-8">
              <div className="mb-5 flex items-center justify-between gap-4">
                <h2 className="font-display text-[1.65rem] font-extrabold text-[color:var(--text-primary)]">
                  Chương trình nổi bật
                </h2>
                <span className="hidden items-center gap-1 text-sm font-bold text-[color:var(--text-secondary)] sm:inline-flex">
                  {filteredShows.length} show
                  <ChevronRightSmallIcon />
                </span>
              </div>

              <div className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)]">
                <ShowCard
                  show={featuredShow}
                  featured
                  followed={followedShowTitles.includes(featuredShow.title)}
                  onToggleFollow={handleToggleShowFollow}
                />
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                  {filteredShows.slice(1, 4).map((show) => (
                    <ShowCard
                      key={show.title}
                      show={show}
                      followed={followedShowTitles.includes(show.title)}
                      onToggleFollow={handleToggleShowFollow}
                    />
                  ))}
                </div>
              </div>
            </section>

            <section className="mt-8">
              <div className="mb-5 flex items-center justify-between gap-4">
                <h2 className="font-display text-[1.65rem] font-extrabold text-[color:var(--text-primary)]">
                  Tập mới chờ import
                </h2>
                <span className="text-sm font-bold text-[color:var(--text-secondary)]">
                  {filteredEpisodes.length} tập
                </span>
              </div>

              <div className="grid gap-3">
                {filteredEpisodes.map((episode) => {
                  const show = podcastShows.find((item) => item.title === episode.showTitle) || podcastShows[0]
                  const audioSource = bulkPodcastDownloadMap.get(episode.previewAudioId)
                  const episodeAudioItem = buildEpisodeAudioItem(episode, show, audioSource)
                  const episodeId = getEpisodeId(episode)

                  return (
                    <EpisodeRow
                      key={episodeId}
                      audioItem={episodeAudioItem}
                      episode={episode}
                      isActive={Boolean(episodeAudioItem && currentAudioItem?.id === episodeAudioItem.id)}
                      isPlaying={isPlaying}
                      isSaved={savedAudioIds.includes(episodeId)}
                      onPlay={handlePlayAudio}
                      onToggleSave={handleToggleSavedAudio}
                      show={show}
                    />
                  )
                })}
              </div>
            </section>

            <section className="mt-8">
              <div className="mb-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
                <div>
                  <p className="section-kicker">Bulk download</p>
                  <h2 className="font-display text-[1.65rem] font-extrabold text-[color:var(--text-primary)]">
                    Nguồn podcast ngắn để import hàng loạt
                  </h2>
                  <p className="mt-2 max-w-3xl text-sm leading-7 text-[color:var(--text-secondary)]">
                    File lấy từ Wikimedia Commons, mỗi episode dưới 15 phút, có audio URL trực tiếp và source page để kiểm tra license.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button type="button" className="secondary-button" onClick={handleSelectAllDownloads}>
                    Chọn kết quả
                  </button>
                  <button type="button" className="secondary-button" onClick={handleClearDownloads}>
                    Bỏ chọn
                  </button>
                  <button
                    type="button"
                    className="secondary-button disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={() => void handleCopyAudioUrls()}
                    disabled={selectedDownloads.length === 0}
                  >
                    Copy audio URL
                  </button>
                  <button
                    type="button"
                    className="primary-button disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={() => void handleCopyManifest()}
                    disabled={selectedDownloads.length === 0}
                  >
                    Copy manifest
                  </button>
                  <a
                    className={`secondary-button ${selectedDownloads.length === 0 ? 'pointer-events-none opacity-50' : ''}`}
                    href={manifestDownloadUrl}
                    download="tmusic-podcast-import-manifest.json"
                  >
                    Tải manifest
                  </a>
                </div>
              </div>

              <div className="mb-4 flex flex-wrap gap-2 text-sm font-bold text-[color:var(--text-secondary)]">
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1">
                  {filteredSelectedDownloadCount}/{filteredDownloads.length} file đang lọc
                </span>
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1">
                  {selectedDownloads.length} file trong manifest
                </span>
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1">
                  Tổng thời lượng {formatTotalDuration(totalDownloadDuration)}
                </span>
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1">
                  Khoảng {totalDownloadSize.toFixed(2)} MB
                </span>
              </div>

              {manifestNotice ? (
                <p className="mb-4 rounded-[16px] border border-[color:rgba(41,212,255,0.22)] bg-[color:rgba(41,212,255,0.08)] px-4 py-3 text-sm font-semibold text-[color:#dff8ff]">
                  {manifestNotice}
                </p>
              ) : null}

              <div className="grid gap-3">
                {filteredDownloads.map((item) => (
                  <BulkDownloadRow
                    key={item.id}
                    isActive={currentAudioItem?.id === item.id}
                    isPlaying={isPlaying}
                    isSaved={savedAudioIds.includes(item.id)}
                    item={item}
                    onPlay={handlePlayAudio}
                    onToggle={handleToggleDownload}
                    onToggleSave={handleToggleSavedAudio}
                    selected={selectedDownloadIds.includes(item.id)}
                  />
                ))}
              </div>
            </section>
          </div>

          {currentAudioItem ? (
            <div className="pointer-events-none absolute inset-x-3 bottom-3 z-20 sm:inset-x-5">
              <div className="pointer-events-auto mx-auto flex max-w-5xl flex-col gap-3 rounded-[22px] border border-white/10 bg-[color:rgba(12,18,31,0.94)] p-3 shadow-[0_18px_48px_rgba(0,0,0,0.36)] backdrop-blur md:flex-row md:items-center md:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  <button
                    type="button"
                    className="play-chip static shrink-0 translate-y-0 opacity-100"
                    aria-label={isPlaying ? `Tạm dừng ${currentAudioItem.title}` : `Phát ${currentAudioItem.title}`}
                    onClick={() => void handlePlayAudio(currentAudioItem)}
                  >
                    {isPlaying ? <PauseIcon /> : <PlayIcon />}
                  </button>
                  <div className="min-w-0">
                    <p className="truncate font-display text-sm font-extrabold text-[color:var(--text-primary)]">
                      {currentAudioItem.title}
                    </p>
                    <p className="mt-1 truncate text-xs font-bold text-[color:var(--text-secondary)]">
                      {currentAudioItem.showTitle} / {currentAudioItem.duration}
                    </p>
                    {playbackError ? (
                      <p className="mt-1 text-xs font-semibold text-[color:#ffb5a8]">
                        {playbackError}
                      </p>
                    ) : null}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 md:justify-end">
                  {currentAudioItem.sourceTitle ? (
                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-bold text-[color:var(--text-secondary)]">
                      Nguồn: {currentAudioItem.sourceTitle}
                    </span>
                  ) : null}
                  <a
                    className="secondary-button inline-flex items-center gap-2"
                    href={currentAudioItem.sourcePage}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Nguồn
                  </a>
                  <a
                    className="primary-button inline-flex items-center gap-2"
                    href={currentAudioItem.audioUrl}
                    download
                    target="_blank"
                    rel="noreferrer"
                  >
                    <DownloadIcon />
                    Tải audio
                  </a>
                </div>
              </div>
            </div>
          ) : null}
        </main>
      </div>
    </div>
  )
}

export default PodcastPageView
