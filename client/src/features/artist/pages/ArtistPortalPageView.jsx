import { useEffect } from 'react'
import { useArtistSession } from '../useArtistSession.js'
import { ArrowIcon, SpotifyIcon } from '../../../shared/icons.jsx'

const valueCards = [
  {
    title: 'Đăng ký nhanh',
    description: 'Chỉ cần tên hiển thị, nghệ danh và một đoạn giới thiệu ngắn để bắt đầu.',
  },
  {
    title: 'Duyệt minh bạch',
    description: 'Tài khoản mới vào trạng thái chờ duyệt và thấy ngay tiến độ trong bảng điều khiển.',
  },
  {
    title: 'Quản lý phát hành',
    description: 'Khi đã được duyệt, bạn có thể tiếp tục đến luồng tải nhạc lên và phát hành.',
  },
]

const onboardingSteps = [
  {
    step: '01',
    title: 'Tạo tài khoản',
    copy: 'Bắt đầu ở cổng nghệ sĩ bằng biểu mẫu đăng ký riêng cho nhà sáng tạo.',
  },
  {
    step: '02',
    title: 'Chờ duyệt hồ sơ',
    copy: 'Đội ngũ quản trị sẽ xem xét thông tin trước khi mở quyền tải nhạc lên và phát hành.',
  },
  {
    step: '03',
    title: 'Vào bảng điều khiển',
    copy: 'Theo dõi trạng thái, danh sách phát hành và các bước tiếp theo trong cùng một nơi.',
  },
]

const quickFacts = [
  {
    label: 'Lối vào',
    value: 'Tách riêng',
  },
  {
    label: 'Trạng thái',
    value: 'Chờ duyệt / Đã duyệt',
  },
  {
    label: 'Bước tiếp theo',
    value: 'Bảng điều khiển + tải nhạc',
  },
]

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
        <div className="rounded-[28px] border border-white/10 bg-white/[0.04] px-6 py-5 text-center">
          Đang mở cổng nghệ sĩ...
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_10%_0%,rgba(255,132,92,0.18),transparent_28%),radial-gradient(circle_at_100%_14%,rgba(48,213,255,0.18),transparent_28%),linear-gradient(180deg,#06101c_0%,#040810_100%)] text-[color:var(--text-primary)]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-8rem] top-20 h-64 w-64 rounded-full bg-[color:rgba(255,107,87,0.13)] blur-3xl" />
        <div className="absolute right-[-5rem] top-28 h-56 w-56 rounded-full bg-[color:rgba(41,212,255,0.12)] blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-[32rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.04),transparent_58%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:120px_120px] opacity-20" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-5 sm:px-6 lg:px-10">
        <header className="flex flex-wrap items-center justify-between gap-3 rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] px-4 py-3 backdrop-blur-xl sm:px-5">
          <a href="/" className="inline-flex items-center gap-3">
            <span className="brand-badge h-11 w-11 rounded-2xl">
              <SpotifyIcon />
            </span>
            <span>
              <span className="block text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--text-dim)]">
                TMusic
              </span>
              <span className="font-display text-lg font-extrabold text-white">Cổng nghệ sĩ</span>
            </span>
          </a>

          <div className="flex flex-wrap gap-3">
            <a href="/artist/login" className="secondary-button">
              Đăng nhập
            </a>
            <a href="/artist/register" className="primary-button gap-2">
              Bắt đầu đăng ký
              <ArrowIcon />
            </a>
          </div>
        </header>

        <main className="py-8 sm:py-10 lg:py-14">
          <section className="grid gap-8 lg:grid-cols-[1.04fr_0.96fr] lg:items-center">
            <div className="max-w-2xl">
              <div className="inline-flex rounded-full border border-[color:rgba(255,255,255,0.12)] bg-white/[0.05] px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-[color:#ffe1d8]">
                Không gian dành cho nhà sáng tạo
              </div>

              <h1 className="mt-6 font-display text-[3.25rem] font-extrabold leading-none tracking-[-0.07em] text-white sm:text-[4.8rem]">
                Một lối vào gọn gàng hơn cho nghệ sĩ phát hành nhạc trên TMusic.
              </h1>
              <p className="mt-6 max-w-xl text-base leading-8 text-[color:var(--text-secondary)] sm:text-lg">
                Trang này chỉ giữ những gì cần cho quá trình bắt đầu của nghệ sĩ: đăng ký nhanh,
                chờ duyệt rõ ràng và đi thẳng vào bảng điều khiển khi tài khoản đã sẵn sàng.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <a href="/artist/register" className="primary-button gap-2">
                  Tạo tài khoản nghệ sĩ
                  <ArrowIcon />
                </a>
                <a href="/artist/login" className="secondary-button">
                  Đã có tài khoản
                </a>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {quickFacts.map((item) => (
                  <article
                    key={item.label}
                    className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] px-4 py-4 backdrop-blur"
                  >
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-[color:var(--text-dim)]">
                      {item.label}
                    </p>
                    <p className="mt-3 font-display text-xl font-extrabold text-white">
                      {item.value}
                    </p>
                  </article>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 translate-x-4 translate-y-5 rounded-[38px] bg-[linear-gradient(180deg,rgba(255,107,87,0.18),rgba(41,212,255,0.12))] blur-2xl" />
              <div className="relative rounded-[38px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,24,38,0.96),rgba(8,14,24,0.98))] p-5 shadow-[0_34px_80px_rgba(0,0,0,0.3)] sm:p-6">
                <div className="rounded-[30px] border border-white/8 bg-white/[0.03] p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--text-dim)]">
                        Luồng khởi tạo nghệ sĩ
                      </p>
                      <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-white">
                        Nhìn nhanh hành trình vào cổng nghệ sĩ
                      </h2>
                    </div>

                    <div className="rounded-full border border-[color:rgba(255,188,87,0.26)] bg-[color:rgba(255,188,87,0.12)] px-3 py-1.5 text-sm font-bold text-[color:#ffe4b2]">
                      Chờ duyệt
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 sm:grid-cols-[1.1fr_0.9fr]">
                    <article className="rounded-[26px] border border-[color:rgba(255,107,87,0.18)] bg-[linear-gradient(180deg,rgba(255,107,87,0.12),rgba(255,107,87,0.04))] p-4">
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[color:#ffd7d1]">
                        Hồ sơ nghệ sĩ
                      </p>
                      <p className="mt-3 font-display text-2xl font-extrabold text-white">
                        Nghệ danh + tiểu sử + định hướng phát hành
                      </p>
                      <p className="mt-3 text-sm leading-7 text-[color:#ffe1d8]">
                        Biểu mẫu đăng ký chỉ giữ lại các thông tin cần thiết để bắt đầu, tránh cảm
                        giác nặng tính nội bộ.
                      </p>
                    </article>

                    <div className="grid gap-4">
                      <article className="rounded-[24px] border border-white/8 bg-white/[0.04] p-4">
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[color:var(--text-dim)]">
                          Hội đồng duyệt
                        </p>
                        <p className="mt-3 text-sm leading-7 text-[color:var(--text-secondary)]">
                          Quản trị viên sẽ duyệt hồ sơ. Khi được chấp thuận, luồng tải nhạc lên và
                          phát hành sẽ được mở.
                        </p>
                      </article>

                      <article className="rounded-[24px] border border-[color:rgba(41,212,255,0.22)] bg-[color:rgba(41,212,255,0.09)] p-4">
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[color:#dff8ff]">
                          Sẵn sàng vào bảng điều khiển
                        </p>
                        <p className="mt-3 text-sm leading-7 text-[color:#dff8ff]">
                          Nếu nghệ sĩ đã đăng nhập, hệ thống sẽ đưa thẳng vào bảng điều khiển để
                          tránh một màn hình trung gian không cần thiết.
                        </p>
                      </article>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    {onboardingSteps.map((item) => (
                      <article
                        key={item.step}
                        className="rounded-[24px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-4"
                      >
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[color:var(--text-dim)]">
                          Bước {item.step}
                        </p>
                        <h3 className="mt-3 font-display text-xl font-extrabold text-white">
                          {item.title}
                        </h3>
                        <p className="mt-2 text-sm leading-7 text-[color:var(--text-secondary)]">
                          {item.copy}
                        </p>
                      </article>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-10 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
            <article className="rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-6 backdrop-blur sm:p-7">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--text-dim)]">
                Vì sao trang này vẫn cần
              </p>
              <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-white">
                Hữu ích cho người mới, không cản đường người đã vào luồng.
              </h2>
              <p className="mt-4 text-sm leading-8 text-[color:var(--text-secondary)] sm:text-base">
                Trang chào mừng vẫn có giá trị với nghệ sĩ mới vì giải thích rất nhanh những gì sẽ
                diễn ra tiếp theo. Nếu đã có phiên đăng nhập, hệ thống sẽ bỏ qua trang này và đưa
                thẳng vào bảng điều khiển.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a href="/artist/register" className="primary-button gap-2">
                  Đăng ký ngay
                  <ArrowIcon />
                </a>
                <a href="/artist/login" className="secondary-button">
                  Vào đăng nhập nghệ sĩ
                </a>
              </div>
            </article>

            <div className="grid gap-4 md:grid-cols-3">
              {valueCards.map((card) => (
                <article
                  key={card.title}
                  className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(11,19,33,0.94),rgba(9,15,25,0.98))] p-6 shadow-[0_20px_44px_rgba(0,0,0,0.18)]"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] font-display text-lg font-extrabold text-white">
                    {card.title.slice(0, 1)}
                  </div>
                  <h3 className="mt-5 font-display text-2xl font-extrabold text-white">
                    {card.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-[color:var(--text-secondary)]">
                    {card.description}
                  </p>
                </article>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}

export default ArtistPortalPage
