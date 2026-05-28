import { useEffect, useRef, useState } from 'react'
import { fetchArtistReleases, submitArtistSong, updateArtistSong } from '../artistAuthClient.js'
import { useArtistSession } from '../useArtistSession.js'
import {
  ArrowIcon,
  PlayIcon,
  PlusIcon,
  QueueIcon,
  SpeakerIcon,
  SpotifyIcon,
  VideoIcon,
} from '../../../shared/icons.jsx'

const statusMeta = {
  none: {
    label: 'Chưa xác định',
    tone: 'border-white/10 bg-white/[0.04] text-[color:var(--text-secondary)]',
    badge: 'bg-white/[0.08] text-white',
    copy: 'Tài khoản này chưa được đánh dấu là nghệ sĩ.',
  },
  pending: {
    label: 'Chờ duyệt',
    tone: 'border-[color:var(--warning)] bg-[color:rgba(160,0,48,0.16)] text-[color:var(--text-primary)]',
    badge: 'bg-[color:var(--warning)] text-white',
    copy: 'Hồ sơ đang chờ quản trị viên duyệt trước khi mở quyền tải âm thanh lên.',
  },
  approved: {
    label: 'Đã duyệt',
    tone: 'border-[color:var(--primary)] bg-[color:oklch(78.5%_0.115_274.713_/_0.15)] text-[color:var(--primary)]',
    badge: 'bg-[color:var(--primary)] text-[color:var(--text-inverse)]',
    copy: 'Bạn có thể tải bài hát lên và gửi vào hàng chờ admin duyệt.',
  },
  rejected: {
    label: 'Cần cập nhật',
    tone: 'border-[color:var(--danger)] bg-[color:rgba(230,30,50,0.14)] text-white',
    badge: 'bg-[color:var(--danger)] text-white',
    copy: 'Hồ sơ cần bổ sung trước khi được mở lại quyền tải nội dung.',
  },
}

const emptySummary = {
  totalReleases: 0,
  publishedReleases: 0,
  pendingReleases: 0,
  draftReleases: 0,
  songReleases: 0,
  podcastReleases: 0,
}

const initialSongForm = {
  title: '',
  artist: '',
  mood: 'Original',
  duration: '',
  sortOrder: '0',
  audioQuality: 'normal',
  audioFile: null,
  coverFile: null,
  videoFile: null,
}

const initialEditSongForm = {
  title: '',
  artist: '',
  mood: '',
  duration: '',
  sortOrder: '0',
  audioQuality: 'normal',
  audioFile: null,
  coverFile: null,
  videoFile: null,
}

const waveformBars = [42, 64, 38, 76, 52, 92, 46, 68, 34, 84, 58, 72, 44, 88, 50, 62]

const dashboardCards = (summary) => [
  {
    label: 'Tổng bản phát hành',
    value: summary.totalReleases,
    copy: 'Trong studio',
    accent: 'bg-[color:var(--primary)]',
  },
  {
    label: 'Bài hát',
    value: summary.songReleases || 0,
    copy: 'Track đã gửi',
    accent: 'bg-[color:var(--primary)]',
  },
  {
    label: 'Podcast',
    value: summary.podcastReleases || 0,
    copy: 'Episode đã gửi',
    accent: 'bg-[color:var(--primary)]',
  },
  {
    label: 'Chờ admin duyệt',
    value: summary.pendingReleases,
    copy: 'Đợi lên client',
    accent: 'bg-[color:var(--primary)]',
  },
]

const releaseStatusLabel = {
  published: 'Đã xuất bản',
  pending: 'Chờ duyệt',
  draft: 'Bản nháp',
}

const releaseStatusTone = {
  published:
    'border-[color:var(--primary)] bg-[color:oklch(78.5%_0.115_274.713_/_0.15)] text-[color:var(--primary)]',
  pending: 'border-[color:var(--warning)] bg-[color:rgba(160,0,48,0.16)] text-white',
  draft: 'border-white/12 bg-white/[0.06] text-[color:var(--text-secondary)]',
}

const formInputClassName =
  'rounded-[6px] border border-[color:var(--border-soft)] bg-[color:var(--bg-surface-2)] px-3 py-3 text-sm text-[color:var(--text-primary)] outline-none transition placeholder:text-[color:var(--text-dim)] focus:border-[color:var(--primary)]'

const releaseTypeLabel = {
  song: 'Bài hát',
  podcast: 'Podcast',
}

function getReleaseStatusLabel(status) {
  return releaseStatusLabel[status] || status || 'Chưa xác định'
}

function getReleaseTypeLabel(type) {
  return releaseTypeLabel[type] || 'Nội dung'
}

function isSongRelease(release) {
  return release?.contentType === 'song' || (!release?.contentType && !release?.showTitle)
}

function getFileLabel(file, fallback) {
  return file?.name || fallback
}

function getReleaseAudioQuality(release) {
  const readyVariant =
    release?.audioVariants?.find((variant) => variant.status === 'ready') ||
    release?.audioVariants?.[0]

  return readyVariant?.quality === 'high' ? 'high' : 'normal'
}

function getAudioQualityLabel(value) {
  return value === 'high' ? 'Cao - VIP' : 'Chuẩn'
}

function getInitials(value) {
  const words = String(value || 'TMusic')
    .trim()
    .split(/\s+/)
    .filter(Boolean)

  return words
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join('')
}

function getFeaturedRelease(releases, stageName) {
  const release = releases.find((item) => isSongRelease(item)) || releases[0]

  if (!release) {
    return {
      title: 'Bản mới đang chờ bạn',
      artist: stageName,
      mood: 'Original',
      coverUrl: '',
      releaseStatus: 'draft',
    }
  }

  return release
}

function StatCard({ card }) {
  return (
    <article className="overflow-hidden rounded-[6px] border border-[color:var(--border-soft)] bg-[color:var(--bg-elevated)] p-4 shadow-[0_2px_4px_rgba(0,0,0,0.2)]">
      <div className={`h-1.5 w-16 rounded-full ${card.accent}`} />
      <p className="mt-4 text-xs font-bold uppercase text-[color:var(--text-dim)]">{card.label}</p>
      <div className="mt-3 flex items-end justify-between gap-3">
        <p className="font-display text-[32px] font-bold leading-[40px] text-[color:var(--text-primary)]">{card.value}</p>
        <p className="pb-1 text-right text-xs text-[color:var(--text-secondary)]">
          {card.copy}
        </p>
      </div>
    </article>
  )
}

function Waveform({ className = '' }) {
  return (
    <div className={`flex h-16 items-end gap-1.5 ${className}`} aria-hidden="true">
      {waveformBars.map((height, index) => (
        <span
          key={`${height}-${index}`}
          className="w-full rounded-full bg-[color:var(--primary)]"
          style={{ height: `${height}%` }}
        />
      ))}
    </div>
  )
}

function ArtworkTile({ title, artist, imageUrl = '', compact = false, size = 'large' }) {
  const initials = getInitials(title || artist)
  const sizeClass = compact
    ? 'h-14 w-14'
    : size === 'medium'
      ? 'h-36 w-36'
      : 'h-44 w-44 sm:h-52 sm:w-52'

  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-[6px] border border-[color:var(--border-soft)] bg-[color:var(--primary)] shadow-[0_4px_8px_rgba(0,0,0,0.3)] ${
        sizeClass
      }`}
    >
      {imageUrl ? (
        <img src={imageUrl} alt="" className="h-full w-full object-cover" />
      ) : (
        <>
          <div className="absolute inset-x-0 top-0 h-1/2 bg-white/15" />
          <div className="absolute inset-0 grid place-items-center">
            <span className={`${compact ? 'text-lg' : 'text-[32px]'} font-display font-bold text-[color:var(--text-inverse)]`}>
              {initials}
            </span>
          </div>
        </>
      )}
    </div>
  )
}

function StudioPreview({ release, stageName, statusBadge }) {
  return (
    <div className="relative overflow-hidden rounded-[6px] border border-[color:var(--border-soft)] bg-[color:var(--bg-surface-2)] p-4">
      <div className="flex items-center gap-4">
        <ArtworkTile
          title={release.title}
          artist={release.artist || release.showTitle || stageName}
          imageUrl={release.coverUrl}
        />
        <div className="min-w-0 flex-1">
          <div className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${statusBadge}`}>
            Studio live
          </div>
          <h3 className="mt-4 line-clamp-2 font-display text-2xl font-bold leading-8 text-[color:var(--text-primary)]">
            {release.title}
          </h3>
          <p className="mt-2 truncate text-sm text-[color:var(--text-secondary)]">
            {release.artist || release.showTitle || stageName}
          </p>
          <div className="mt-5 flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-[color:var(--primary)] text-[color:var(--text-inverse)]">
              <PlayIcon />
            </span>
            <div className="min-w-0 flex-1">
              <Waveform />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function FileDropTile({ title, copy, file, inputRef, accept, disabled, icon, onChange }) {
  return (
    <label
      className={`group grid gap-3 rounded-[6px] border border-dashed p-4 transition ${
        disabled
          ? 'cursor-not-allowed border-white/10 bg-white/[0.025] opacity-60'
          : 'cursor-pointer border-white/16 bg-white/[0.055] hover:border-[color:var(--primary)] hover:bg-white/[0.08]'
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={onChange}
        disabled={disabled}
      />
      <span className="flex items-center gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/[0.08] text-[color:var(--primary)] transition group-hover:bg-[color:var(--primary)] group-hover:text-[color:var(--text-inverse)]">
          {icon}
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-bold text-[color:var(--text-primary)]">{title}</span>
          <span className="mt-1 block truncate text-xs text-[color:var(--text-secondary)]">
            {getFileLabel(file, copy)}
          </span>
        </span>
      </span>
    </label>
  )
}

function ArtistDashboardPage() {
  const { user, loading: sessionLoading, isAuthenticated, logout } = useArtistSession()
  const [releases, setReleases] = useState([])
  const [summary, setSummary] = useState(emptySummary)
  const [loadingReleases, setLoadingReleases] = useState(true)
  const [pageError, setPageError] = useState('')
  const [songForm, setSongForm] = useState(initialSongForm)
  const [editingRelease, setEditingRelease] = useState(null)
  const [editSongForm, setEditSongForm] = useState(initialEditSongForm)
  const [coverPreviewUrl, setCoverPreviewUrl] = useState('')
  const [submitSubmitting, setSubmitSubmitting] = useState(false)
  const [editSubmitting, setEditSubmitting] = useState(false)
  const [submitFeedback, setSubmitFeedback] = useState('')
  const [submitError, setSubmitError] = useState('')
  const audioInputRef = useRef(null)
  const coverInputRef = useRef(null)
  const videoInputRef = useRef(null)
  const editAudioInputRef = useRef(null)
  const editCoverInputRef = useRef(null)
  const editVideoInputRef = useRef(null)
  const artistStatus = statusMeta[user?.artistStatus] || statusMeta.none
  const stageName = user?.artistProfile?.stageName || user?.displayName || 'Nghệ sĩ'
  const uploadDisabled = user?.artistStatus !== 'approved' || submitSubmitting
  const editDisabled = user?.artistStatus !== 'approved' || editSubmitting || !editingRelease
  const featuredRelease = getFeaturedRelease(releases, stageName)

  useEffect(() => {
    if (!sessionLoading && !isAuthenticated) {
      window.location.replace('/artist/login')
    }
  }, [isAuthenticated, sessionLoading])

  useEffect(() => {
    let cancelled = false

    if (sessionLoading || !isAuthenticated) {
      return undefined
    }

    const loadReleases = async () => {
      setLoadingReleases(true)
      setPageError('')

      try {
        const payload = await fetchArtistReleases()

        if (cancelled) {
          return
        }

        setReleases(payload.items || [])
        setSummary(payload.summary || emptySummary)
      } catch (error) {
        if (!cancelled) {
          setPageError(error.message || 'Không thể tải bảng điều khiển nghệ sĩ.')
        }
      } finally {
        if (!cancelled) {
          setLoadingReleases(false)
        }
      }
    }

    void loadReleases()

    return () => {
      cancelled = true
    }
  }, [isAuthenticated, sessionLoading])

  useEffect(() => {
    if (!songForm.coverFile) {
      setCoverPreviewUrl('')
      return undefined
    }

    const nextPreviewUrl = URL.createObjectURL(songForm.coverFile)
    setCoverPreviewUrl(nextPreviewUrl)

    return () => {
      URL.revokeObjectURL(nextPreviewUrl)
    }
  }, [songForm.coverFile])

  const handleLogout = () => {
    logout()
    window.location.assign('/artist/login')
  }

  const resetFileInput = (ref) => {
    if (ref.current) {
      ref.current.value = ''
    }
  }

  const clearSubmitResult = () => {
    setSubmitFeedback('')
    setSubmitError('')
  }

  const refreshReleases = async () => {
    const payload = await fetchArtistReleases()
    setReleases(payload.items || [])
    setSummary(payload.summary || emptySummary)
  }

  const updateSongForm = (field, value) => {
    setSongForm((current) => ({
      ...current,
      [field]: value,
    }))
    clearSubmitResult()
  }

  const updateEditSongForm = (field, value) => {
    setEditSongForm((current) => ({
      ...current,
      [field]: value,
    }))
    clearSubmitResult()
  }

  const handleFileChange = (field, ref) => (event) => {
    const file = event.target.files?.[0] || null
    updateSongForm(field, file)
    resetFileInput(ref)
  }

  const handleEditFileChange = (field, ref) => (event) => {
    const file = event.target.files?.[0] || null
    updateEditSongForm(field, file)
    resetFileInput(ref)
  }

  const resetSongForm = () => {
    setSongForm(initialSongForm)
    resetFileInput(audioInputRef)
    resetFileInput(coverInputRef)
    resetFileInput(videoInputRef)
  }

  const resetEditSongForm = () => {
    setEditingRelease(null)
    setEditSongForm(initialEditSongForm)
    resetFileInput(editAudioInputRef)
    resetFileInput(editCoverInputRef)
    resetFileInput(editVideoInputRef)
  }

  const startEditRelease = (release) => {
    if (!isSongRelease(release)) {
      setSubmitError('Hiện chỉ hỗ trợ sửa bài hát.')
      return
    }

    setEditingRelease(release)
    setEditSongForm({
      title: release.title || '',
      artist: release.artist || stageName,
      mood: release.mood || 'Original',
      duration: release.duration || '',
      sortOrder: String(release.sortOrder ?? 0),
      audioQuality: getReleaseAudioQuality(release),
      audioFile: null,
      coverFile: null,
      videoFile: null,
    })
    clearSubmitResult()
  }

  const handleSongSubmit = async (event) => {
    event.preventDefault()

    const title = songForm.title.trim()

    if (user?.artistStatus !== 'approved') {
      setSubmitError('Hồ sơ nghệ sĩ cần được admin duyệt trước khi tải bài hát.')
      return
    }

    if (!title) {
      setSubmitError('Hãy nhập tên bài hát.')
      return
    }

    if (!songForm.audioFile) {
      setSubmitError('Hãy chọn file MP3/audio cho bài hát.')
      return
    }

    setSubmitSubmitting(true)
    setSubmitError('')
    setSubmitFeedback('')

    try {
      const formData = new FormData()

      formData.append('title', title)
      formData.append('artist', songForm.artist.trim() || stageName)
      formData.append('mood', songForm.mood.trim() || 'Original')
      formData.append('duration', songForm.duration.trim())
      formData.append('sortOrder', songForm.sortOrder.trim() || '0')
      formData.append('audioQuality', songForm.audioQuality)
      formData.append('audioFile', songForm.audioFile)

      if (songForm.coverFile) {
        formData.append('coverFile', songForm.coverFile)
      }

      if (songForm.videoFile) {
        formData.append('videoFile', songForm.videoFile)
      }

      const payload = await submitArtistSong(formData)

      setSubmitFeedback(payload.message || 'Bài hát đã được gửi vào hàng chờ admin duyệt.')
      resetSongForm()
      await refreshReleases().catch((refreshError) => {
        setPageError(refreshError.message || 'Đã gửi bài hát nhưng chưa tải lại được danh sách phát hành.')
      })
    } catch (error) {
      setSubmitError(error.message || 'Không thể gửi bài hát vào hàng chờ duyệt.')
    } finally {
      setSubmitSubmitting(false)
    }
  }

  const handleEditSongSubmit = async (event) => {
    event.preventDefault()

    if (!editingRelease) {
      return
    }

    const title = editSongForm.title.trim()

    if (user?.artistStatus !== 'approved') {
      setSubmitError('Hồ sơ nghệ sĩ cần được admin duyệt trước khi sửa bài hát.')
      return
    }

    if (!title) {
      setSubmitError('Hãy nhập tên bài hát.')
      return
    }

    setEditSubmitting(true)
    setSubmitError('')
    setSubmitFeedback('')

    try {
      const formData = new FormData()

      formData.append('title', title)
      formData.append('artist', editSongForm.artist.trim() || stageName)
      formData.append('mood', editSongForm.mood.trim() || 'Original')
      formData.append('duration', editSongForm.duration.trim())
      formData.append('sortOrder', editSongForm.sortOrder.trim() || '0')
      formData.append('audioQuality', editSongForm.audioQuality)

      if (editSongForm.audioFile) {
        formData.append('audioFile', editSongForm.audioFile)
      }

      if (editSongForm.coverFile) {
        formData.append('coverFile', editSongForm.coverFile)
      }

      if (editSongForm.videoFile) {
        formData.append('videoFile', editSongForm.videoFile)
      }

      const payload = await updateArtistSong(editingRelease.id, formData)

      setSubmitFeedback(payload.message || 'Bài hát đã được cập nhật và gửi lại vào hàng chờ.')
      resetEditSongForm()
      await refreshReleases().catch((refreshError) => {
        setPageError(refreshError.message || 'Đã cập nhật bài hát nhưng chưa tải lại được danh sách phát hành.')
      })
    } catch (error) {
      setSubmitError(error.message || 'Không thể cập nhật bài hát.')
    } finally {
      setEditSubmitting(false)
    }
  }

  if (sessionLoading) {
    return (
      <div className="grid min-h-screen place-items-center bg-[color:var(--bg-app)] px-4 text-[color:var(--text-primary)]">
        <div className="rounded-[6px] border border-[color:var(--border-soft)] bg-[color:var(--bg-elevated)] px-6 py-5 text-center">
          Đang kiểm tra phiên nghệ sĩ...
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[color:var(--bg-app)] px-3 py-3 text-[color:var(--text-primary)] sm:px-4">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[color:var(--bg-app)]" />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100vh-1.5rem)] w-full max-w-[1640px] flex-col gap-3">
        <header className="flex flex-wrap items-center justify-between gap-3 rounded-[6px] border border-[color:var(--border-soft)] bg-[color:var(--bg-elevated)] px-4 py-3 shadow-[0_4px_8px_rgba(0,0,0,0.3)] sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <a href="/artist" className="brand-badge h-11 w-11 rounded-[8px]">
              <SpotifyIcon />
            </a>
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase text-[color:var(--primary)]">
                Artist Studio
              </p>
              <h1 className="truncate font-display text-2xl font-bold text-[color:var(--text-primary)]">
                {stageName}
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <a href="/" className="secondary-button">
              Về trang chủ
            </a>
            <button type="button" className="secondary-button" onClick={handleLogout}>
              Đăng xuất
            </button>
          </div>
        </header>

        <main className="grid flex-1 gap-3 xl:grid-cols-[minmax(0,1fr)_31rem]">
          <section className="grid gap-3">
            <div className="overflow-hidden rounded-[6px] border border-[color:var(--border-soft)] bg-[color:var(--bg-elevated)] p-5 shadow-[0_4px_8px_rgba(0,0,0,0.3)] sm:p-6">
              <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,0.82fr)] lg:items-end">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className={`rounded-full px-3 py-1.5 text-xs font-bold ${artistStatus.badge}`}>
                      {artistStatus.label}
                    </span>
                    <span className="rounded-full border border-[color:var(--border-soft)] bg-white/[0.06] px-3 py-1.5 text-xs font-bold text-[color:var(--text-secondary)]">
                      Nội dung chỉ lên client sau khi admin duyệt
                    </span>
                  </div>
                  <h2 className="mt-6 max-w-3xl font-display text-[32px] font-bold leading-[40px] text-[color:var(--text-primary)]">
                    Không gian phát hành của {stageName}
                  </h2>
                  <p className="mt-4 max-w-2xl text-base leading-8 text-[color:var(--text-secondary)]">
                    Tải bài hát mới, theo dõi hàng chờ duyệt và giữ mọi bản phát hành của bạn trong một studio riêng.
                  </p>

                  <div className="mt-7 grid gap-3 sm:grid-cols-3">
                    {[
                      ['01', 'Chuẩn bị metadata'],
                      ['02', 'Upload audio và artwork'],
                      ['03', 'Admin duyệt lên client'],
                    ].map(([step, label]) => (
                      <div
                        key={step}
                        className="rounded-[6px] border border-[color:var(--border-soft)] bg-white/[0.055] px-4 py-3"
                      >
                        <p className="text-xs font-bold text-[color:var(--primary)]">{step}</p>
                        <p className="mt-1 text-sm font-bold text-[color:var(--text-primary)]">{label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <StudioPreview
                  release={featuredRelease}
                  stageName={stageName}
                  statusBadge={artistStatus.badge}
                />
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {dashboardCards(summary).map((card) => (
                <StatCard key={card.label} card={card} />
              ))}
            </div>

            <section className="rounded-[6px] border border-[color:var(--border-soft)] bg-[color:var(--bg-elevated)] p-5 shadow-[0_4px_8px_rgba(0,0,0,0.3)] sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase text-[color:var(--primary)]">
                    Hàng chờ phát hành
                  </p>
                  <h3 className="mt-3 font-display text-2xl font-bold text-[color:var(--text-primary)]">
                    Những bản nhạc thuộc về tài khoản này
                  </h3>
                </div>
                <a href="/artist/register" className="secondary-button gap-2">
                  Cập nhật hồ sơ
                  <ArrowIcon />
                </a>
              </div>

              {pageError ? (
                <div className="mt-5 rounded-[6px] border border-[color:var(--danger)] bg-[color:rgba(230,30,50,0.14)] px-4 py-3 text-sm leading-6 text-white">
                  {pageError}
                </div>
              ) : null}

              {loadingReleases ? (
                <div className="mt-5 rounded-[6px] border border-[color:var(--border-soft)] bg-white/[0.03] px-4 py-10 text-center text-sm text-[color:var(--text-secondary)]">
                  Đang tải danh sách phát hành...
                </div>
              ) : releases.length > 0 ? (
                <div className="mt-5 grid gap-3">
                  {releases.map((release) => (
                    <article
                      key={release.id}
                      className="grid gap-4 rounded-[6px] border border-[color:var(--border-soft)] bg-white/[0.045] p-4 transition hover:border-[color:var(--primary)] hover:bg-white/[0.065] sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center"
                    >
                      <ArtworkTile
                        compact
                        title={release.title}
                        artist={release.artist || release.showTitle}
                        imageUrl={release.coverUrl}
                      />
                      <div className="min-w-0">
                        <p className="truncate font-display text-xl font-bold text-[color:var(--text-primary)]">
                          {release.title}
                        </p>
                        <p className="mt-1 truncate text-sm text-[color:var(--text-secondary)]">
                          {[release.artist || release.showTitle, release.duration].filter(Boolean).join(' - ')}
                        </p>
                        {isSongRelease(release) ? (
                          <button
                            type="button"
                            className="mt-3 inline-flex min-h-10 items-center justify-center rounded-[500px] border border-[color:var(--primary)] bg-[color:var(--primary)] px-4 py-2 text-sm font-bold text-[color:var(--text-inverse)] transition hover:bg-[color:var(--primary-hover)] disabled:cursor-not-allowed disabled:opacity-60"
                            onClick={() => startEditRelease(release)}
                            disabled={uploadDisabled}
                          >
                            Sửa bài hát
                          </button>
                        ) : null}
                      </div>

                      <div className="flex flex-wrap gap-2 text-sm sm:justify-end">
                        <span className="rounded-full border border-[color:var(--border-soft)] bg-white/[0.05] px-3 py-1.5">
                          {getReleaseTypeLabel(release.contentType)}
                        </span>
                        <span
                          className={`rounded-full border px-3 py-1.5 ${
                            releaseStatusTone[release.releaseStatus] || releaseStatusTone.draft
                          }`}
                        >
                          {getReleaseStatusLabel(release.releaseStatus)}
                        </span>
                        {isSongRelease(release) ? (
                          <>
                            <span className="rounded-full border border-[color:var(--border-soft)] bg-white/[0.05] px-3 py-1.5">
                              {getAudioQualityLabel(getReleaseAudioQuality(release))}
                            </span>
                            {release.videoUrl ? (
                              <span className="rounded-full border border-[color:var(--primary)] bg-[color:oklch(78.5%_0.115_274.713_/_0.15)] px-3 py-1.5 text-[color:var(--primary)]">
                                Có MP4
                              </span>
                            ) : null}
                          </>
                        ) : null}
                        <span className="rounded-full border border-[color:var(--border-soft)] bg-white/[0.05] px-3 py-1.5">
                          {release.mood || release.category || 'Chưa có chủ đề'}
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="mt-5 overflow-hidden rounded-[6px] border border-dashed border-white/16 bg-white/[0.035] px-5 py-10">
                  <div className="mx-auto max-w-md text-center">
                    <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[color:var(--primary)] text-[color:var(--text-inverse)]">
                      <PlusIcon />
                    </span>
                    <p className="mt-5 font-display text-2xl font-bold text-[color:var(--text-primary)]">
                      Chưa có bản phát hành nào
                    </p>
                    <p className="mt-3 text-sm leading-7 text-[color:var(--text-secondary)]">
                      Bắt đầu bằng bản nhạc đầu tiên ở khung upload bên cạnh.
                    </p>
                  </div>
                </div>
              )}
            </section>
          </section>

          <aside className="grid content-start gap-3">
            <section className="rounded-[6px] border border-[color:var(--border-soft)] bg-[color:var(--bg-elevated)] p-5 shadow-[0_4px_8px_rgba(0,0,0,0.3)] sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase text-[color:var(--primary)]">
                    Hồ sơ nghệ sĩ
                  </p>
                  <h3 className="mt-3 font-display text-2xl font-bold text-[color:var(--text-primary)]">
                    {stageName}
                  </h3>
                </div>
                <span className={`rounded-full px-3 py-1.5 text-xs font-bold ${artistStatus.badge}`}>
                  {artistStatus.label}
                </span>
              </div>
              <div className={`mt-5 rounded-[6px] border px-4 py-4 ${artistStatus.tone}`}>
                <p className="text-sm leading-7">{artistStatus.copy}</p>
              </div>
            </section>

            {editingRelease ? (
              <section className="overflow-hidden rounded-[6px] border border-[color:var(--primary)] bg-[color:var(--bg-elevated)] p-5 shadow-[0_4px_8px_rgba(0,0,0,0.3)] sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase text-[color:var(--primary)]">
                      Sửa bài hát
                    </p>
                    <h3 className="mt-3 font-display text-2xl font-bold text-[color:var(--text-primary)]">
                      {editingRelease.title}
                    </h3>
                    <p className="mt-2 text-sm text-[color:var(--text-secondary)]">
                      Thay file MP4, audio, ảnh bìa hoặc chất lượng. Bản sửa sẽ quay lại hàng chờ admin duyệt.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="rounded-full border border-[color:var(--border-soft)] bg-white/[0.08] px-3 py-1.5 text-sm font-bold transition hover:border-[color:var(--primary)] hover:text-[color:var(--primary)]"
                    onClick={resetEditSongForm}
                  >
                    Đóng
                  </button>
                </div>

                <form className="mt-6 grid gap-4" onSubmit={handleEditSongSubmit}>
                  <label className="grid gap-2">
                    <span className="text-sm font-bold text-[color:var(--text-primary)]">Tên bài hát</span>
                    <input
                      value={editSongForm.title}
                      onChange={(event) => updateEditSongForm('title', event.target.value)}
                      className={formInputClassName}
                      disabled={editDisabled}
                    />
                  </label>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="grid gap-2">
                      <span className="text-sm font-bold text-[color:var(--text-primary)]">Nghệ sĩ</span>
                      <input
                        value={editSongForm.artist}
                        onChange={(event) => updateEditSongForm('artist', event.target.value)}
                        className={formInputClassName}
                        disabled={editDisabled}
                      />
                    </label>
                    <label className="grid gap-2">
                      <span className="text-sm font-bold text-[color:var(--text-primary)]">Mood</span>
                      <input
                        value={editSongForm.mood}
                        onChange={(event) => updateEditSongForm('mood', event.target.value)}
                        className={formInputClassName}
                        disabled={editDisabled}
                      />
                    </label>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="grid gap-2">
                      <span className="text-sm font-bold text-[color:var(--text-primary)]">Thời lượng</span>
                      <input
                        value={editSongForm.duration}
                        onChange={(event) => updateEditSongForm('duration', event.target.value)}
                        className={formInputClassName}
                        placeholder="03:30"
                        disabled={editDisabled}
                      />
                    </label>
                    <label className="grid gap-2">
                      <span className="text-sm font-bold text-[color:var(--text-primary)]">Chất lượng bài</span>
                      <select
                        value={editSongForm.audioQuality}
                        onChange={(event) => updateEditSongForm('audioQuality', event.target.value)}
                        className={formInputClassName}
                        disabled={editDisabled}
                      >
                        <option value="normal">Chuẩn - mọi tài khoản</option>
                        <option value="high">Cao - VIP</option>
                      </select>
                    </label>
                  </div>

                  <div className="grid gap-3">
                    <FileDropTile
                      title="Thay file audio"
                      copy={editingRelease.masterAudio?.originalFilename || 'Giữ audio hiện tại nếu không chọn file'}
                      file={editSongForm.audioFile}
                      inputRef={editAudioInputRef}
                      accept="audio/*"
                      disabled={editDisabled}
                      icon={<SpeakerIcon />}
                      onChange={handleEditFileChange('audioFile', editAudioInputRef)}
                    />
                    <FileDropTile
                      title="Thay ảnh bìa"
                      copy="Giữ ảnh hiện tại nếu không chọn file"
                      file={editSongForm.coverFile}
                      inputRef={editCoverInputRef}
                      accept="image/*"
                      disabled={editDisabled}
                      icon={<QueueIcon />}
                      onChange={handleEditFileChange('coverFile', editCoverInputRef)}
                    />
                    <FileDropTile
                      title="Thay video MP4"
                      copy={editingRelease.musicVideo?.originalFilename || 'Chọn MP4 / video mới'}
                      file={editSongForm.videoFile}
                      inputRef={editVideoInputRef}
                      accept="video/mp4,video/webm,video/quicktime"
                      disabled={editDisabled}
                      icon={<VideoIcon />}
                      onChange={handleEditFileChange('videoFile', editVideoInputRef)}
                    />
                  </div>

                  <button
                    type="submit"
                    className="inline-flex min-h-12 w-full items-center justify-center rounded-[500px] bg-[color:var(--primary)] px-4 py-3.5 text-sm font-bold text-[color:var(--text-inverse)] transition hover:bg-[color:var(--primary-hover)] disabled:cursor-not-allowed disabled:opacity-65"
                    disabled={editDisabled}
                  >
                    {editSubmitting ? 'Đang cập nhật...' : 'Cập nhật và gửi duyệt'}
                  </button>
                </form>
              </section>
            ) : null}

            <section className="overflow-hidden rounded-[6px] border border-[color:var(--border-soft)] bg-[color:var(--bg-elevated)] p-5 shadow-[0_4px_8px_rgba(0,0,0,0.3)] sm:p-6">
              <div className="grid gap-5 sm:grid-cols-[9rem_minmax(0,1fr)] sm:items-center">
                <ArtworkTile
                  title={songForm.title || 'Bản nhạc mới'}
                  artist={songForm.artist || stageName}
                  imageUrl={coverPreviewUrl}
                  size="medium"
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase text-[color:var(--primary)]">
                    Upload nhạc
                  </p>
                  <h3 className="mt-3 truncate font-display text-2xl font-bold text-[color:var(--text-primary)]">
                    {songForm.title || 'Bản nhạc mới'}
                  </h3>
                  <p className="mt-2 truncate text-sm text-[color:var(--text-secondary)]">
                    {songForm.artist || stageName}
                  </p>
                  <Waveform className="mt-4 h-12" />
                </div>
              </div>

              <form className="mt-6 grid gap-4" onSubmit={handleSongSubmit}>
                <label className="grid gap-2">
                  <span className="text-sm font-bold text-[color:var(--text-primary)]">Tên bài hát</span>
                  <input
                    value={songForm.title}
                    onChange={(event) => updateSongForm('title', event.target.value)}
                    className={formInputClassName}
                    placeholder="Ví dụ: Neon Night"
                    disabled={uploadDisabled}
                  />
                </label>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="grid gap-2">
                    <span className="text-sm font-bold text-[color:var(--text-primary)]">Nghệ sĩ</span>
                    <input
                      value={songForm.artist}
                      onChange={(event) => updateSongForm('artist', event.target.value)}
                      className={formInputClassName}
                      placeholder={stageName}
                      disabled={uploadDisabled}
                    />
                  </label>
                  <label className="grid gap-2">
                    <span className="text-sm font-bold text-[color:var(--text-primary)]">Mood</span>
                    <input
                      value={songForm.mood}
                      onChange={(event) => updateSongForm('mood', event.target.value)}
                      className={formInputClassName}
                      placeholder="Original"
                      disabled={uploadDisabled}
                    />
                  </label>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="grid gap-2">
                    <span className="text-sm font-bold text-[color:var(--text-primary)]">Thời lượng</span>
                    <input
                      value={songForm.duration}
                      onChange={(event) => updateSongForm('duration', event.target.value)}
                      className={formInputClassName}
                      placeholder="03:30"
                      disabled={uploadDisabled}
                    />
                  </label>
                  <label className="grid gap-2">
                    <span className="text-sm font-bold text-[color:var(--text-primary)]">Sort order</span>
                    <input
                      value={songForm.sortOrder}
                      onChange={(event) => updateSongForm('sortOrder', event.target.value)}
                      className={formInputClassName}
                      inputMode="numeric"
                      placeholder="0"
                      disabled={uploadDisabled}
                    />
                  </label>
                </div>

                <label className="grid gap-2">
                  <span className="text-sm font-bold text-[color:var(--text-primary)]">Chất lượng bài</span>
                  <select
                    value={songForm.audioQuality}
                    onChange={(event) => updateSongForm('audioQuality', event.target.value)}
                    className={formInputClassName}
                    disabled={uploadDisabled}
                  >
                    <option value="normal">Chuẩn - mọi tài khoản</option>
                    <option value="high">Cao - VIP</option>
                  </select>
                </label>

                <div className="grid gap-3">
                  <FileDropTile
                    title="File MP3 / audio"
                    copy="Chọn file audio bắt buộc"
                    file={songForm.audioFile}
                    inputRef={audioInputRef}
                    accept="audio/*"
                    disabled={uploadDisabled}
                    icon={<SpeakerIcon />}
                    onChange={handleFileChange('audioFile', audioInputRef)}
                  />
                  <FileDropTile
                    title="Ảnh bìa"
                    copy="Chọn ảnh bìa nếu có"
                    file={songForm.coverFile}
                    inputRef={coverInputRef}
                    accept="image/*"
                    disabled={uploadDisabled}
                    icon={<QueueIcon />}
                    onChange={handleFileChange('coverFile', coverInputRef)}
                  />
                  <FileDropTile
                    title="Video MP4"
                    copy="Chọn MP4 / video nếu có"
                    file={songForm.videoFile}
                    inputRef={videoInputRef}
                    accept="video/mp4,video/webm,video/quicktime"
                    disabled={uploadDisabled}
                    icon={<VideoIcon />}
                    onChange={handleFileChange('videoFile', videoInputRef)}
                  />
                </div>

                <button
                  type="submit"
                  className="inline-flex min-h-12 w-full items-center justify-center rounded-[500px] bg-[color:var(--primary)] px-4 py-3.5 text-sm font-bold text-[color:var(--text-inverse)] transition hover:bg-[color:var(--primary-hover)] disabled:cursor-not-allowed disabled:opacity-65"
                  disabled={uploadDisabled}
                >
                  {submitSubmitting ? 'Đang gửi vào hàng chờ...' : 'Gửi admin duyệt'}
                </button>
              </form>

              {user?.artistStatus !== 'approved' ? (
                <div className="mt-4 rounded-[6px] border border-[color:var(--warning)] bg-[color:rgba(160,0,48,0.16)] px-4 py-3 text-sm leading-6 text-[color:var(--text-primary)]">
                  Hồ sơ cần được admin duyệt trước khi bắt đầu upload nhạc.
                </div>
              ) : null}

              {submitError ? (
                <div className="mt-4 rounded-[6px] border border-[color:var(--danger)] bg-[color:rgba(230,30,50,0.14)] px-4 py-3 text-sm leading-6 text-white">
                  {submitError}
                </div>
              ) : null}

              {submitFeedback ? (
                <div className="mt-4 rounded-[6px] border border-[color:var(--primary)] bg-[color:oklch(78.5%_0.115_274.713_/_0.15)] px-4 py-3 text-sm leading-6 text-[color:var(--primary)]">
                  {submitFeedback}
                </div>
              ) : null}
            </section>
          </aside>
        </main>
      </div>
    </div>
  )
}

export default ArtistDashboardPage
