import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { appPaths } from '../../../app/routes/paths.js'
import { HomeIcon, LibraryIcon, PauseIcon, PlayIcon, SearchIcon, SpotifyIcon } from '../../../shared/icons.jsx'
import { requestJson } from '../../../shared/api.js'

const normalizeText = (value = '') =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()

const buildInitials = (value = '') =>
  value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || 'TM'

function PodcastArtwork({ item, className = '' }) {
  const imageUrl = item.coverUrl || ''
  const title = item.showTitle || item.title

  return (
    <div className={`relative overflow-hidden rounded-[10px] border border-white/8 ${className}`}>
      {imageUrl ? (
        <img src={imageUrl} alt={title} className="h-full w-full object-cover" />
      ) : (
        <div className="grid h-full min-h-32 place-items-center bg-[linear-gradient(135deg,#ff8d9a_0%,#62d8ff_48%,#132238_100%)]">
          <span className="font-display text-4xl font-extrabold text-white">
            {buildInitials(title)}
          </span>
        </div>
      )}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(0,0,0,0.22))]" />
    </div>
  )
}

function PodcastPageView() {
  const audioRef = useRef(null)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeCategory, setActiveCategory] = useState('Tất cả')
  const [query, setQuery] = useState('')
  const [currentItem, setCurrentItem] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackError, setPlaybackError] = useState('')

  useEffect(() => {
    let cancelled = false

    const loadPodcasts = async () => {
      setLoading(true)
      setError('')

      try {
        const payload = await requestJson('/api/podcasts?limit=50')

        if (!cancelled) {
          setItems(payload.items || [])
        }
      } catch (loadError) {
        if (!cancelled) {
          setItems([])
          setError(loadError.message || 'Không thể tải podcast đã duyệt.')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadPodcasts()

    return () => {
      cancelled = true
    }
  }, [])

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
      setPlaybackError('Không phát được tập podcast này.')
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

  const categories = useMemo(
    () => ['Tất cả', ...new Set(items.map((item) => item.category).filter(Boolean))],
    [items],
  )
  const filteredItems = useMemo(() => {
    const normalizedQuery = normalizeText(query)

    return items.filter((item) => {
      const categoryMatches = activeCategory === 'Tất cả' || item.category === activeCategory
      const queryMatches =
        !normalizedQuery ||
        [item.title, item.showTitle, item.host, item.category, item.description]
          .filter(Boolean)
          .some((value) => normalizeText(value).includes(normalizedQuery))

      return categoryMatches && queryMatches
    })
  }, [activeCategory, items, query])
  const featuredItem = filteredItems[0] || items[0] || null

  const handlePlay = async (item) => {
    const audio = audioRef.current
    const audioUrl = item?.audioUrl || item?.audio?.url

    if (!audio || !audioUrl) {
      setPlaybackError('Tập này chưa có audio.')
      return
    }

    setPlaybackError('')

    if (currentItem?._id === item._id) {
      if (audio.paused) {
        await audio.play().catch(() => setPlaybackError('Trình duyệt chưa cho phát audio.'))
      } else {
        audio.pause()
      }
      return
    }

    setCurrentItem(item)
    audio.src = audioUrl
    audio.load()
    await audio.play().catch(() => setPlaybackError('Chưa phát được audio này.'))
  }

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
              placeholder="Tìm podcast đã duyệt"
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
                <h1 className="font-display text-[2.25rem] font-extrabold leading-tight text-[color:var(--text-primary)] sm:text-[3.35rem]">
                  Podcast đã duyệt
                </h1>
                <p className="mt-4 max-w-3xl text-sm leading-7 text-[color:var(--text-secondary)]">
                  Chỉ những tập podcast đã được admin duyệt mới xuất hiện ở đây.
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  {categories.map((category) => (
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

              <aside className="rounded-[12px] border border-white/8 bg-white/[0.035] p-4">
                <p className="section-kicker mb-1">Thư viện</p>
                <h2 className="font-display text-[1.2rem] font-extrabold">
                  {items.length} tập đã phát hành
                </h2>
                <p className="mt-3 text-sm leading-7 text-[color:var(--text-secondary)]">
                  Nội dung được nghệ sĩ gửi từ dashboard và được admin duyệt trước khi phát hành.
                </p>
              </aside>
            </section>

            {error ? (
              <p className="mt-6 rounded-[10px] border border-[color:rgba(255,93,122,0.28)] bg-[color:rgba(255,93,122,0.1)] px-4 py-3 text-sm font-semibold text-[color:#ffd8e1]">
                {error}
              </p>
            ) : null}

            {loading ? (
              <div className="mt-8 rounded-[12px] border border-white/8 bg-white/[0.035] px-4 py-12 text-center text-sm font-semibold text-[color:var(--text-secondary)]">
                Đang tải podcast...
              </div>
            ) : items.length === 0 ? (
              <div className="mt-8 rounded-[12px] border border-dashed border-white/12 bg-white/[0.025] px-4 py-14 text-center">
                <h2 className="font-display text-2xl font-extrabold text-white">
                  Chưa có podcast đã duyệt
                </h2>
                <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[color:var(--text-secondary)]">
                  Khi nghệ sĩ gửi podcast và admin duyệt, các tập sẽ xuất hiện tại đây.
                </p>
              </div>
            ) : (
              <>
                {featuredItem ? (
                  <section className="mt-8 grid gap-5 rounded-[12px] border border-white/8 bg-white/[0.035] p-4 lg:grid-cols-[260px_minmax(0,1fr)]">
                    <PodcastArtwork item={featuredItem} className="aspect-square" />
                    <div className="flex min-w-0 flex-col justify-center">
                      <p className="section-kicker">{featuredItem.category || 'Podcast'}</p>
                      <h2 className="font-display text-3xl font-extrabold leading-tight text-white">
                        {featuredItem.title}
                      </h2>
                      <p className="mt-2 text-sm font-semibold text-[color:var(--text-secondary)]">
                        {[featuredItem.showTitle, featuredItem.host, featuredItem.duration].filter(Boolean).join(' / ')}
                      </p>
                      {featuredItem.description ? (
                        <p className="mt-4 max-w-2xl text-sm leading-7 text-[color:var(--text-secondary)]">
                          {featuredItem.description}
                        </p>
                      ) : null}
                      <button
                        type="button"
                        className="primary-button mt-5 inline-flex w-fit items-center gap-2"
                        onClick={() => void handlePlay(featuredItem)}
                      >
                        {currentItem?._id === featuredItem._id && isPlaying ? <PauseIcon /> : <PlayIcon />}
                        Nghe tập này
                      </button>
                    </div>
                  </section>
                ) : null}

                <section className="mt-8">
                  <div className="mb-5 flex items-center justify-between gap-4">
                    <h2 className="font-display text-[1.65rem] font-extrabold text-[color:var(--text-primary)]">
                      Tất cả tập podcast
                    </h2>
                    <span className="text-sm font-bold text-[color:var(--text-secondary)]">
                      {filteredItems.length} tập
                    </span>
                  </div>

                  <div className="grid gap-3">
                    {filteredItems.map((item) => {
                      const active = currentItem?._id === item._id

                      return (
                        <article
                          key={item._id}
                          className="grid gap-3 rounded-[10px] border border-white/8 bg-white/[0.035] p-3.5 sm:grid-cols-[72px_minmax(0,1fr)_auto] sm:items-center"
                        >
                          <PodcastArtwork item={item} className="h-[72px] w-[72px] rounded-[8px]" />
                          <div className="min-w-0">
                            <p className="section-card-type">{item.category || 'Podcast'}</p>
                            <h3 className="mt-2 font-display text-[1rem] font-bold text-[color:var(--text-primary)]">
                              {item.title}
                            </h3>
                            <p className="mt-1 text-sm text-[color:var(--text-secondary)]">
                              {[item.showTitle, item.host, item.duration].filter(Boolean).join(' / ')}
                            </p>
                          </div>
                          <button
                            type="button"
                            className={`play-chip static translate-y-0 opacity-100 ${
                              active ? 'ring-2 ring-[color:rgba(41,212,255,0.35)]' : ''
                            }`}
                            aria-label={`Phát ${item.title}`}
                            onClick={() => void handlePlay(item)}
                          >
                            {active && isPlaying ? <PauseIcon /> : <PlayIcon />}
                          </button>
                        </article>
                      )
                    })}
                  </div>
                </section>
              </>
            )}
          </div>

          {currentItem ? (
            <div className="pointer-events-none absolute inset-x-3 bottom-3 z-20 sm:inset-x-5">
              <div className="pointer-events-auto mx-auto flex max-w-5xl flex-col gap-3 rounded-[12px] border border-white/10 bg-[color:rgba(12,18,31,0.94)] p-3 shadow-[0_18px_48px_rgba(0,0,0,0.36)] backdrop-blur md:flex-row md:items-center md:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  <button
                    type="button"
                    className="play-chip static shrink-0 translate-y-0 opacity-100"
                    aria-label={isPlaying ? `Tạm dừng ${currentItem.title}` : `Phát ${currentItem.title}`}
                    onClick={() => void handlePlay(currentItem)}
                  >
                    {isPlaying ? <PauseIcon /> : <PlayIcon />}
                  </button>
                  <div className="min-w-0">
                    <p className="truncate font-display text-sm font-extrabold text-[color:var(--text-primary)]">
                      {currentItem.title}
                    </p>
                    <p className="mt-1 truncate text-xs font-bold text-[color:var(--text-secondary)]">
                      {[currentItem.showTitle, currentItem.duration].filter(Boolean).join(' / ')}
                    </p>
                    {playbackError ? (
                      <p className="mt-1 text-xs font-semibold text-[color:#ffb5a8]">{playbackError}</p>
                    ) : null}
                  </div>
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
