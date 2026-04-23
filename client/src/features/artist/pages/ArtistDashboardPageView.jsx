import { useEffect, useState } from 'react'
import { fetchArtistReleases, requestArtistTrackUpload } from '../artistAuthClient.js'
import { useArtistSession } from '../useArtistSession.js'
import { ArrowIcon, SpotifyIcon } from '../../../shared/icons.jsx'

const statusMeta = {
  none: {
    label: 'Chưa xác định',
    tone: 'border-white/10 bg-white/[0.04] text-[color:var(--text-secondary)]',
    copy: 'Tài khoản này chưa được đánh dấu là nghệ sĩ.',
  },
  pending: {
    label: 'Chờ duyệt',
    tone: 'border-[color:rgba(255,188,87,0.26)] bg-[color:rgba(255,188,87,0.1)] text-[color:#ffe4b2]',
    copy: 'Hồ sơ đang chờ quản trị viên duyệt trước khi mở quyền tải âm thanh lên.',
  },
  approved: {
    label: 'Đã duyệt',
    tone: 'border-[color:rgba(41,212,255,0.26)] bg-[color:rgba(41,212,255,0.1)] text-[color:#dff8ff]',
    copy: 'Bạn đã có thể tạo thông tin tải lên và đẩy bản phát hành lên hệ thống.',
  },
  rejected: {
    label: 'Cần cập nhật',
    tone: 'border-[color:rgba(255,93,122,0.28)] bg-[color:rgba(255,93,122,0.1)] text-[color:#ffd8e1]',
    copy: 'Hồ sơ cần bổ sung thêm trước khi được mở lại quyền truy cập.',
  },
}

const dashboardCards = (summary) => [
  {
    label: 'Tổng bản phát hành',
    value: summary.totalReleases,
    tone: 'text-white',
  },
  {
    label: 'Đã xuất bản',
    value: summary.publishedReleases,
    tone: 'text-[color:#dff8ff]',
  },
  {
    label: 'Chờ duyệt',
    value: summary.pendingReleases,
    tone: 'text-[color:#ffe4b2]',
  },
  {
    label: 'Bản nháp',
    value: summary.draftReleases,
    tone: 'text-[color:#ffd7d1]',
  },
]

const releaseStatusLabel = {
  published: 'Đã xuất bản',
  pending: 'Chờ duyệt',
  draft: 'Bản nháp',
}

function getReleaseStatusLabel(status) {
  return releaseStatusLabel[status] || status || 'Chưa xác định'
}

function ArtistDashboardPage() {
  const { user, loading: sessionLoading, isAuthenticated, logout } = useArtistSession()
  const [releases, setReleases] = useState([])
  const [summary, setSummary] = useState({
    totalReleases: 0,
    publishedReleases: 0,
    pendingReleases: 0,
    draftReleases: 0,
  })
  const [loadingReleases, setLoadingReleases] = useState(true)
  const [pageError, setPageError] = useState('')
  const [uploadConfig, setUploadConfig] = useState(null)
  const [uploadFeedback, setUploadFeedback] = useState('')
  const [creatingUpload, setCreatingUpload] = useState(false)

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
        setSummary(
          payload.summary || {
            totalReleases: 0,
            publishedReleases: 0,
            pendingReleases: 0,
            draftReleases: 0,
          },
        )
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

  const handleLogout = () => {
    logout()
    window.location.assign('/artist/login')
  }

  const handleCreateUpload = async () => {
    setCreatingUpload(true)
    setUploadFeedback('')
    setUploadConfig(null)

    try {
      const payload = await requestArtistTrackUpload()
      setUploadConfig(payload)
      setUploadFeedback(
        'Thông tin tải lên đã sẵn sàng. Bạn có thể dùng dữ liệu này để đẩy tệp âm thanh lên dịch vụ lưu trữ.',
      )
    } catch (error) {
      setUploadFeedback(error.message || 'Không thể tạo thông tin tải lên lúc này.')
    } finally {
      setCreatingUpload(false)
    }
  }

  if (sessionLoading) {
    return (
      <div className="grid min-h-screen place-items-center bg-[color:var(--bg-app)] px-4 text-[color:var(--text-primary)]">
        <div className="rounded-[28px] border border-white/10 bg-white/[0.04] px-6 py-5 text-center">
          Đang kiểm tra phiên nghệ sĩ...
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  const artistStatus = statusMeta[user?.artistStatus] || statusMeta.none
  const stageName = user?.artistProfile?.stageName || user?.displayName || 'Nghệ sĩ'

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(255,107,87,0.14),transparent_30%),radial-gradient(circle_at_88%_16%,rgba(41,212,255,0.16),transparent_28%),linear-gradient(180deg,#08111d_0%,#050912_100%)] px-3 py-3 text-[color:var(--text-primary)] sm:px-4">
      <div className="mx-auto flex min-h-[calc(100vh-1.5rem)] w-full max-w-[1640px] flex-col gap-3">
        <header className="flex flex-wrap items-center justify-between gap-3 rounded-[28px] border border-white/10 bg-white/[0.04] px-4 py-3 backdrop-blur sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <a href="/artist" className="brand-badge h-11 w-11 rounded-2xl">
              <SpotifyIcon />
            </a>
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--text-dim)]">
                Bảng điều khiển nghệ sĩ TMusic
              </p>
              <h1 className="truncate font-display text-2xl font-extrabold text-white">
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

        <main className="grid flex-1 gap-3 xl:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,28,43,0.96),rgba(10,16,28,0.98))] p-5 shadow-[0_26px_60px_rgba(0,0,0,0.24)] sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="max-w-2xl">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-[color:var(--text-dim)]">
                  Không gian quản lý nghệ sĩ
                </p>
                <h2 className="mt-4 font-display text-4xl font-extrabold tracking-[-0.05em] text-white sm:text-5xl">
                  Theo dõi trạng thái hồ sơ và các bản phát hành của bạn.
                </h2>
                <p className="mt-4 text-base leading-8 text-[color:var(--text-secondary)]">
                  Trang này phục vụ riêng cho nghệ sĩ với thông tin duyệt hồ sơ, danh sách bản
                  phát hành và dữ liệu tải nhạc lên được tách biệt khỏi cổng người nghe.
                </p>
              </div>

              <div className={`rounded-full border px-4 py-2 text-sm font-bold ${artistStatus.tone}`}>
                {artistStatus.label}
              </div>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {dashboardCards(summary).map((card) => (
                <article
                  key={card.label}
                  className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5"
                >
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[color:var(--text-dim)]">
                    {card.label}
                  </p>
                  <p className={`mt-4 font-display text-4xl font-extrabold ${card.tone}`}>
                    {card.value}
                  </p>
                </article>
              ))}
            </div>

            <div className="mt-8 rounded-[28px] border border-white/8 bg-white/[0.03] p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[color:var(--text-dim)]">
                    Danh sách phát hành
                  </p>
                  <h3 className="mt-3 font-display text-2xl font-extrabold text-white">
                    Những bài nhạc thuộc về tài khoản nghệ sĩ này
                  </h3>
                </div>
                <a href="/artist/register" className="secondary-button gap-2">
                  Cập nhật hồ sơ
                  <ArrowIcon />
                </a>
              </div>

              {pageError ? (
                <div className="mt-5 rounded-[20px] border border-[color:rgba(255,93,122,0.28)] bg-[color:rgba(255,93,122,0.1)] px-4 py-3 text-sm leading-6 text-[color:#ffd8e1]">
                  {pageError}
                </div>
              ) : null}

              {loadingReleases ? (
                <div className="mt-5 rounded-[24px] border border-white/8 bg-white/[0.02] px-4 py-10 text-center text-sm text-[color:var(--text-secondary)]">
                  Đang tải danh sách phát hành...
                </div>
              ) : releases.length > 0 ? (
                <div className="mt-5 space-y-3">
                  {releases.map((release) => (
                    <article
                      key={release.id}
                      className="flex flex-col gap-4 rounded-[24px] border border-white/8 bg-white/[0.03] p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <p className="font-display text-xl font-extrabold text-white">
                          {release.title}
                        </p>
                        <p className="mt-1 text-sm text-[color:var(--text-secondary)]">
                          {release.artist} - {release.duration}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2 text-sm">
                        <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5">
                          {getReleaseStatusLabel(release.releaseStatus)}
                        </span>
                        <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5">
                          {release.mood || 'Chưa có chủ đề'}
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="mt-5 rounded-[24px] border border-dashed border-white/12 bg-white/[0.02] px-4 py-10 text-center">
                  <p className="font-display text-2xl font-extrabold text-white">
                    Chưa có bản phát hành nào
                  </p>
                  <p className="mt-3 text-sm leading-7 text-[color:var(--text-secondary)]">
                    Hệ thống đã có endpoint <code>/api/releases</code> cho nghệ sĩ. Bước tiếp theo
                    là thêm biểu mẫu tạo metadata phát hành và tải âm thanh lên sau khi tài khoản
                    được duyệt.
                  </p>
                </div>
              )}
            </div>
          </section>

          <aside className="grid gap-3">
            <section className="rounded-[32px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur sm:p-6">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[color:var(--text-dim)]">
                Trạng thái duyệt
              </p>
              <div className={`mt-4 rounded-[24px] border px-4 py-4 ${artistStatus.tone}`}>
                <p className="font-display text-2xl font-extrabold">{artistStatus.label}</p>
                <p className="mt-2 text-sm leading-7">{artistStatus.copy}</p>
              </div>

              <div className="mt-4 rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
                <p className="text-sm font-bold text-white">Nghệ danh</p>
                <p className="mt-2 text-sm leading-7 text-[color:var(--text-secondary)]">
                  {stageName}
                </p>
              </div>
            </section>

            <section className="rounded-[32px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur sm:p-6">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[color:var(--text-dim)]">
                Tải âm thanh lên
              </p>
              <h3 className="mt-4 font-display text-2xl font-extrabold text-white">
                Tạo thông tin tải lên riêng cho bản nhạc
              </h3>
              <p className="mt-3 text-sm leading-7 text-[color:var(--text-secondary)]">
                Endpoint này map tới <code>/api/tracks/upload</code>. Nghệ sĩ đang chờ duyệt sẽ bị
                chặn, còn nghệ sĩ đã duyệt sẽ nhận được payload ký sẵn để tải âm thanh lên.
              </p>

              <button
                type="button"
                className="mt-5 inline-flex w-full items-center justify-center rounded-[18px] bg-[linear-gradient(180deg,#ff9b72_0%,#ff6b57_100%)] px-4 py-3.5 text-sm font-extrabold text-[#08101a] shadow-[0_18px_36px_rgba(255,107,87,0.22)] transition hover:-translate-y-px disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-65"
                onClick={() => void handleCreateUpload()}
                disabled={creatingUpload || user?.artistStatus !== 'approved'}
              >
                {creatingUpload ? 'Đang tạo thông tin tải lên...' : 'Tạo thông tin tải lên'}
              </button>

              {uploadFeedback ? (
                <div className="mt-4 rounded-[20px] border border-white/10 bg-white/[0.03] px-4 py-3 text-sm leading-6 text-[color:var(--text-secondary)]">
                  {uploadFeedback}
                </div>
              ) : null}

              {uploadConfig ? (
                <div className="mt-4 space-y-3 rounded-[24px] border border-[color:rgba(41,212,255,0.22)] bg-[color:rgba(41,212,255,0.08)] p-4 text-sm text-[color:#dff8ff]">
                  <p>
                    <span className="font-bold text-white">Đường dẫn tải lên:</span>{' '}
                    {uploadConfig.uploadUrl}
                  </p>
                  <p>
                    <span className="font-bold text-white">Thư mục:</span> {uploadConfig.folder}
                  </p>
                  <p>
                    <span className="font-bold text-white">Mốc thời gian:</span>{' '}
                    {uploadConfig.timestamp}
                  </p>
                </div>
              ) : null}
            </section>

            <section className="rounded-[32px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur sm:p-6">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[color:var(--text-dim)]">
                Sơ đồ endpoint
              </p>
              <div className="mt-4 grid gap-3">
                {['/api/artist-auth/login', '/api/artist-auth/me', '/api/releases', '/api/tracks/upload'].map(
                  (item) => (
                    <div
                      key={item}
                      className="rounded-[20px] border border-white/8 bg-white/[0.03] px-4 py-3 font-mono text-sm text-[color:#ffd7d1]"
                    >
                      {item}
                    </div>
                  ),
                )}
              </div>
            </section>
          </aside>
        </main>
      </div>
    </div>
  )
}

export default ArtistDashboardPage
