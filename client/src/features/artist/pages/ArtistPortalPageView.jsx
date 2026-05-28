import { useEffect } from 'react'
import heroImage from '../../../assets/hero.png'
import { ArrowIcon, PlayIcon, SpotifyIcon } from '../../../shared/icons.jsx'
import { useArtistSession } from '../useArtistSession.js'

const stats = [
  {
    value: '03',
    label: 'bước lên sóng',
  },
  {
    value: '24h',
    label: 'theo dõi trạng thái',
  },
  {
    value: '01',
    label: 'dashboard riêng',
  },
]

const workflow = [
  {
    step: '01',
    title: 'Tạo hồ sơ',
    copy: 'Điền tên liên hệ, nghệ danh và giới thiệu ngắn để đội ngũ TMusic nhận diện đúng màu sắc âm nhạc.',
  },
  {
    step: '02',
    title: 'Chờ duyệt',
    copy: 'Hồ sơ mới được đưa vào trạng thái chờ duyệt. Nghệ sĩ vẫn có thể đăng nhập để theo dõi tiến độ.',
  },
  {
    step: '03',
    title: 'Mở phát hành',
    copy: 'Khi được chấp thuận, dashboard nghệ sĩ mở quyền tải nhạc lên và quản lý danh sách phát hành.',
  },
]

const benefits = [
  {
    title: 'Phiên nghệ sĩ tách riêng',
    copy: 'Không ghi đè phiên người nghe, phù hợp cho creator vừa nghe nhạc vừa quản lý bản phát hành.',
  },
  {
    title: 'Thông tin duyệt rõ ràng',
    copy: 'Trạng thái hồ sơ nằm ngay trong dashboard, giúp biết bước tiếp theo mà không phải hỏi lại admin.',
  },
  {
    title: 'Sẵn sàng mở rộng',
    copy: 'Luồng đăng ký, đăng nhập và upload được tách sẵn để sau này bổ sung analytics hoặc quyền đội nhóm.',
  },
]

const releaseRows = [
  {
    title: 'Midnight Demo',
    meta: 'Single - đang soát metadata',
    progress: '76%',
  },
  {
    title: 'Neon Session',
    meta: 'EP - chờ ảnh bìa',
    progress: '48%',
  },
  {
    title: 'Live Cut',
    meta: 'Track - sẵn sàng gửi duyệt',
    progress: '92%',
  },
]

const checklist = ['Hồ sơ nghệ danh', 'Email liên hệ', 'Tiểu sử ngắn', 'Ảnh bìa bản phát hành']

function StudioPreview({ className = '' }) {
  return (
    <div className={`relative ${className}`}>
      <div className="relative overflow-hidden rounded-[6px] border border-white/16 bg-[color:var(--bg-elevated)] p-4 shadow-[0_8px_16px_rgba(0,0,0,0.4)] sm:p-5">
        <div className="absolute inset-x-0 top-0 h-28 bg-white/[0.04]" />
        <div className="relative grid gap-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-[color:oklch(78.5%_0.115_274.713_/_0.15)] text-[color:var(--primary)]">
                <SpotifyIcon />
              </div>
              <div>
                <p className="text-sm font-bold text-[color:var(--text-primary)]">Studio nghệ sĩ</p>
                <p className="text-xs text-[color:var(--text-secondary)]">Không gian TMusic</p>
              </div>
            </div>
            <span className="rounded-full border border-[color:var(--primary)] bg-[color:oklch(78.5%_0.115_274.713_/_0.15)] px-3 py-1 text-xs font-bold text-[color:var(--primary)]">
              Sẵn sàng
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-[0.9fr_1.1fr]">
            <div className="relative min-h-56 overflow-hidden rounded-[6px] border border-white/16 bg-[color:var(--bg-surface-2)] p-4">
              <img
                src={heroImage}
                alt=""
                className="absolute bottom-[-2.4rem] right-[-1.8rem] h-56 w-56 object-contain opacity-90"
              />
              <div className="relative">
                <p className="text-xs font-bold text-[color:var(--primary)]">Hồ sơ nổi bật</p>
                <h2 className="mt-3 max-w-56 font-display text-2xl font-bold leading-8 text-[color:var(--text-primary)]">
                  Lên lịch phát hành đầu tiên
                </h2>
                <p className="mt-3 max-w-44 text-sm leading-6 text-[color:var(--text-secondary)]">
                  Kiểm tra hồ sơ và chuẩn bị bản nhạc trước khi gửi duyệt.
                </p>
              </div>
              <button
                type="button"
                className="absolute bottom-4 left-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-[color:var(--primary)] text-black"
                aria-label="Xem trước bản phát hành"
              >
                <PlayIcon />
              </button>
            </div>

            <div className="grid gap-3">
              {releaseRows.map((row) => (
                <div
                  key={row.title}
                  className="rounded-[8px] border border-white/12 bg-white/[0.065] p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-[color:var(--text-primary)]">{row.title}</p>
                      <p className="mt-1 text-xs text-[color:var(--text-secondary)]">
                        {row.meta}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-[color:var(--primary)]">{row.progress}</span>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/[0.08]">
                    <div
                      className="h-full rounded-full bg-[color:var(--primary)]"
                      style={{ width: row.progress }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-4">
            {checklist.map((item) => (
              <div
                key={item}
                className="rounded-[8px] border border-white/12 bg-white/[0.055] px-3 py-3 text-xs font-bold text-[color:var(--text-secondary)]"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function ArtistPortalPage() {
  const { isAuthenticated, loading } = useArtistSession()

  useEffect(() => {
    if (!loading && isAuthenticated) {
      window.location.replace('/artist/dashboard')
    }
  }, [isAuthenticated, loading])

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-[color:var(--bg-app)] px-4 text-[color:var(--text-primary)]">
        <div className="rounded-[8px] border border-white/10 bg-white/[0.04] px-6 py-5 text-center">
          Đang mở cổng nghệ sĩ...
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[color:var(--bg-app)] text-[color:var(--text-primary)]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 top-0 h-[36rem] bg-white/[0.02]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-[color:var(--bg-app)] px-4 py-3">
          <a href="/" className="inline-flex items-center gap-3">
            <span className="brand-badge h-11 w-11 rounded-[8px]">
              <SpotifyIcon />
            </span>
            <span>
              <span className="block text-xs font-bold uppercase tracking-normal text-[color:var(--text-dim)]">
                TMusic
              </span>
              <span className="font-display text-lg font-bold text-[color:var(--text-primary)]">Cổng nghệ sĩ</span>
            </span>
          </a>

          <nav className="flex flex-wrap gap-3" aria-label="Điều hướng nghệ sĩ">
            <a href="/artist/login" className="secondary-button">
              Đăng nhập
            </a>
            <a href="/artist/register" className="primary-button gap-2">
              Đăng ký
              <ArrowIcon />
            </a>
          </nav>
        </header>

        <main>
          <section className="relative min-h-[calc(100vh-6.5rem)] overflow-hidden py-12 sm:py-16 lg:py-20">
            <StudioPreview className="absolute right-[-20rem] top-16 hidden w-[50rem] rotate-[-2deg] lg:block xl:right-[-11rem]" />

            <div className="relative z-10 max-w-3xl pt-6 lg:pt-16">
              <p className="inline-flex rounded-full border border-[color:var(--primary)] bg-[color:oklch(78.5%_0.115_274.713_/_0.15)] px-4 py-2 text-sm font-bold text-[color:var(--primary)]">
                Không gian phát hành cho nhà sáng tạo
              </p>
              <h1 className="mt-6 font-display text-[32px] font-bold leading-[40px] tracking-normal text-[color:var(--text-primary)] sm:text-[32px] lg:text-[32px]">
                Cổng nghệ sĩ TMusic
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-[color:var(--text-secondary)] sm:text-lg">
                Một trang vào gọn hơn cho nghệ sĩ đăng ký, theo dõi trạng thái duyệt và đi tiếp vào
                dashboard phát hành khi hồ sơ đã sẵn sàng.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <a href="/artist/register" className="primary-button gap-2">
                  Tạo hồ sơ nghệ sĩ
                  <ArrowIcon />
                </a>
                <a href="/artist/login" className="secondary-button">
                  Tôi đã có tài khoản
                </a>
              </div>

              <div className="mt-10 grid max-w-2xl gap-3 sm:grid-cols-3">
                {stats.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-[8px] border border-white/12 bg-white/[0.065] px-4 py-4 backdrop-blur"
                  >
                    <p className="font-display text-[32px] font-bold leading-[40px] text-[color:var(--text-primary)]">{item.value}</p>
                    <p className="mt-1 text-sm text-[color:var(--text-secondary)]">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <StudioPreview className="relative z-10 mt-10 lg:hidden" />
          </section>

          <section className="grid gap-6 py-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div>
              <p className="text-sm font-bold text-[color:var(--primary)]">Luồng bắt đầu</p>
              <h2 className="mt-3 font-display text-[32px] font-bold leading-[40px] tracking-normal text-[color:var(--text-primary)]">
                Từ hồ sơ mới đến bản phát hành đầu tiên.
              </h2>
              <p className="mt-4 max-w-lg text-base leading-8 text-[color:var(--text-secondary)]">
                Trang chào mừng giải thích nhanh quy trình, rồi điều hướng thẳng đến đăng ký hoặc
                đăng nhập.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {workflow.map((item) => (
                <article
                  key={item.step}
                  className="rounded-[6px] border border-white/12 bg-white/[0.06] p-5"
                >
                  <p className="text-sm font-bold text-[color:var(--primary)]">Bước {item.step}</p>
                  <h3 className="mt-4 font-display text-2xl font-bold text-[color:var(--text-primary)]">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[color:var(--text-secondary)]">{item.copy}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="grid gap-4 py-8 md:grid-cols-3">
            {benefits.map((card) => (
              <article
                key={card.title}
                className="rounded-[6px] border border-white/12 bg-[color:var(--bg-elevated)] p-5"
              >
                <div className="h-1.5 w-16 rounded-full bg-[color:var(--primary)]" />
                <h3 className="mt-5 font-display text-2xl font-bold text-[color:var(--text-primary)]">{card.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[color:var(--text-secondary)]">{card.copy}</p>
              </article>
            ))}
          </section>

          <section className="pb-12 pt-8">
            <div className="grid gap-5 overflow-hidden rounded-[6px] border border-white/14 bg-[color:var(--bg-elevated)] p-5 sm:p-7 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <p className="text-sm font-bold text-[color:var(--primary)]">Sẵn sàng phát hành</p>
                <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-normal text-[color:var(--text-primary)] sm:text-[32px] sm:leading-[40px]">
                  Đưa nghệ danh của bạn vào TMusic bằng một hồ sơ ngắn.
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-[color:var(--text-secondary)] sm:text-base">
                  Nghệ sĩ đã đăng nhập sẽ được chuyển thẳng vào dashboard, còn người mới có thể bắt
                  đầu bằng form đăng ký riêng.
                </p>
              </div>

              <div className="flex flex-wrap gap-3 lg:justify-end">
                <a href="/artist/register" className="primary-button gap-2">
                  Đăng ký ngay
                  <ArrowIcon />
                </a>
                <a href="/artist/login" className="secondary-button">
                  Vào đăng nhập
                </a>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}

export default ArtistPortalPage
