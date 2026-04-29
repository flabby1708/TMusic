import {
  CreditCardOutlined,
  DownOutlined,
  GlobalOutlined,
  LockOutlined,
  MenuOutlined,
  MobileOutlined,
  RightOutlined,
  SearchOutlined,
  SettingOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { appPaths } from '../../../app/routes/paths.js'
import { SpotifyIcon } from '../../../shared/icons.jsx'
import AppFooter from '../../footer/AppFooter.jsx'
import { createSupportArticlePath } from '../supportArticleData.js'

const supportSlugs = {
  'Chủ đề đề xuất': 'chu-de-de-xuat',
  'Quản lý thanh toán': 'quan-ly-thanh-toan',
  'Phương thức thanh toán': 'phuong-thuc-thanh-toan',
  'Trợ giúp về tính phí': 'tro-giup-ve-tinh-phi',
  'Đang đăng nhập': 'dang-dang-nhap',
  'Trợ giúp về hồ sơ': 'tro-giup-ve-ho-so',
  'Cài đặt tài khoản': 'cai-dat-tai-khoan',
  'Bảo mật': 'bao-mat',
  'Các gói có sẵn': 'cac-goi-co-san',
  'Cài đặt gói': 'cai-dat-goi',
  'Premium Student': 'premium-student',
  'Bắt đầu': 'bat-dau',
  'Cài đặt ứng dụng': 'cai-dat-ung-dung',
  'Xử lý sự cố': 'xu-ly-su-co',
  Playlist: 'playlist',
  'Tính năng': 'tinh-nang',
  'Các tính năng mạng xã hội': 'cac-tinh-nang-mang-xa-hoi',
  Podcast: 'podcast',
  'Sách nói': 'sach-noi',
  'Sự kiện trực tiếp': 'su-kien-truc-tiep',
  'Quyền riêng tư nghe nhạc': 'quyen-rieng-tu-nghe-nhac',
  Loa: 'loa',
  'Đồng hồ thông minh': 'dong-ho-thong-minh',
  TV: 'tv',
  'Chơi game': 'choi-game',
  'Ô tô': 'o-to',
  'Trợ lý Giọng nói': 'tro-ly-giong-noi',
  'Quyền dữ liệu và lựa chọn về quyền riêng tư': 'quyen-du-lieu-va-lua-chon-ve-quyen-rieng-tu',
  'Hiểu rõ dữ liệu của bạn': 'hieu-ro-du-lieu-cua-ban',
  'Trung tâm an toàn và quyền riêng tư': 'trung-tam-an-toan-va-quyen-rieng-tu',
  'Không thể đăng nhập vào TMusic': 'khong-the-dang-nhap-vao-tmusic',
  'Trợ giúp về thanh toán Premium': 'tro-giup-ve-thanh-toan-premium',
  'Bị tính phí quá nhiều': 'bi-tinh-phi-qua-nhieu',
  'Quản lý thư viện và playlist': 'quan-ly-thu-vien-va-playlist',
  'Tải nhạc lên cổng nghệ sĩ': 'tai-nhac-len-cong-nghe-si',
}

const supportCategories = [
  {
    label: 'Thanh toán và hóa đơn',
    icon: CreditCardOutlined,
    topics: ['Chủ đề đề xuất', 'Quản lý thanh toán', 'Phương thức thanh toán', 'Trợ giúp về tính phí'],
  },
  {
    label: 'Quản lý tài khoản của bạn',
    icon: UserOutlined,
    topics: ['Đang đăng nhập', 'Trợ giúp về hồ sơ', 'Cài đặt tài khoản', 'Bảo mật'],
  },
  {
    label: 'Các gói Premium',
    icon: SettingOutlined,
    topics: ['Các gói có sẵn', 'Cài đặt gói', 'Premium Student'],
  },
  {
    label: 'Tính năng trong ứng dụng',
    icon: MenuOutlined,
    topics: [
      'Bắt đầu',
      'Cài đặt ứng dụng',
      'Xử lý sự cố',
      'Playlist',
      'Tính năng',
      'Các tính năng mạng xã hội',
      'Podcast',
      'Sách nói',
      'Sự kiện trực tiếp',
      'Quyền riêng tư nghe nhạc',
    ],
  },
  {
    label: 'Thiết bị và khắc phục sự cố',
    icon: MobileOutlined,
    topics: ['Loa', 'Đồng hồ thông minh', 'TV', 'Chơi game', 'Ô tô', 'Trợ lý Giọng nói'],
  },
  {
    label: 'An toàn và quyền riêng tư',
    icon: LockOutlined,
    topics: [
      'Quyền dữ liệu và lựa chọn về quyền riêng tư',
      'Hiểu rõ dữ liệu của bạn',
      'Trung tâm an toàn và quyền riêng tư',
    ],
  },
]

const premiumHoverPlans = [
  {
    title: 'Individual',
    description: '1 account - For one person.',
  },
  {
    title: 'Duo',
    description: '2 accounts - For couples under one roof.',
  },
  {
    title: 'Family',
    description: '6 accounts - For family members under one roof.',
  },
  {
    title: 'Student',
    description: '1 account - Discount for eligible students.',
  },
]

const quickHelpLinks = [
  {
    title: 'Không thể đăng nhập vào TMusic',
    description: 'Khôi phục quyền truy cập, kiểm tra email đăng nhập và xử lý lỗi mật khẩu.',
  },
  {
    title: 'Trợ giúp về thanh toán Premium',
    description: 'Xem trạng thái giao dịch, hóa đơn và cách cập nhật phương thức thanh toán.',
  },
  {
    title: 'Bị tính phí quá nhiều',
    description: 'Đối chiếu gói đang dùng, ngày gia hạn và các khoản phí phát sinh.',
  },
  {
    title: 'Quản lý thư viện và playlist',
    description: 'Sắp xếp bài hát yêu thích, playlist cá nhân và nội dung đã lưu.',
  },
  {
    title: 'Tải nhạc lên cổng nghệ sĩ',
    description: 'Chuẩn bị thông tin phát hành, ảnh bìa và theo dõi trạng thái duyệt.',
  },
]

function SupportHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-[color:var(--border-soft)] bg-[color:rgba(9,17,29,0.94)] px-5 py-4 text-[color:var(--text-primary)] shadow-[0_18px_44px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:px-8 lg:px-14">
      <div className="mx-auto flex max-w-[1780px] flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-7 lg:gap-10">
          <a href={appPaths.home} className="flex items-center gap-2.5" aria-label="Trang chủ TMusic">
            <span className="brand-badge h-11 w-11 rounded-[14px]">
              <SpotifyIcon />
            </span>
            <span className="font-display text-[1.85rem] font-extrabold tracking-[-0.06em] text-[color:var(--text-primary)]">
              TMusic
            </span>
          </a>

          <nav className="hidden items-center gap-8 text-[1rem] font-extrabold text-[color:var(--text-secondary)] md:flex">
            <div className="premium-nav-item">
              <a href={appPaths.home} className="transition hover:text-[color:var(--text-primary)]">
                Premium
              </a>

              <div className="premium-hover-panel" aria-label="Explore Premium plans">
                <h3>Explore Premium</h3>
                <div className="premium-hover-list">
                  {premiumHoverPlans.map((plan) => (
                    <a key={plan.title} href={appPaths.home} className="premium-hover-card">
                      <span>
                        <strong>{plan.title}</strong>
                        <small>{plan.description}</small>
                      </span>
                      <RightOutlined />
                    </a>
                  ))}
                </div>
              </div>
            </div>
            <a href={appPaths.home} className="transition hover:text-[color:var(--tertiary)]">
              Cài đặt ứng dụng
            </a>
          </nav>
        </div>

        <div className="flex items-center gap-4 sm:gap-6">
          <button
            type="button"
            className="hidden text-[1.25rem] text-[color:var(--text-secondary)] transition hover:text-[color:var(--text-primary)] sm:inline-flex"
            aria-label="Đổi ngôn ngữ"
          >
            <GlobalOutlined />
          </button>
          <a href={appPaths.auth.register} className="secondary-button hidden sm:inline-flex">
            Đăng ký
          </a>
          <a href={appPaths.auth.login} className="primary-button px-8 py-3.5 sm:px-10">
            Đăng nhập
          </a>
        </div>
      </div>
    </header>
  )
}

function SupportPageView() {
  return (
    <div className="min-h-screen bg-[color:var(--bg-app)] text-[color:var(--text-primary)]">
      <SupportHeader />

      <main>
        <section className="relative overflow-hidden px-5 pb-16 pt-20 sm:px-8 sm:pb-20 sm:pt-24 lg:px-14">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_24%_0%,rgba(255,107,87,0.16),transparent_34%),radial-gradient(circle_at_78%_8%,rgba(41,212,255,0.13),transparent_30%),linear-gradient(180deg,#0d1525_0%,#08111d_56%,#060b16_100%)]" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/10" />
          <div className="relative mx-auto max-w-[760px]">
            <h1 className="text-center font-display text-[3.1rem] font-extrabold leading-[1.08] tracking-[-0.06em] text-[color:var(--text-primary)] sm:text-[4.4rem] lg:text-[5.2rem]">
              Nhóm hỗ trợ của
              <br />
              TMusic
            </h1>

            <label className="search-shell mt-16 flex h-[60px] rounded-[16px] px-4 shadow-[0_18px_40px_rgba(0,0,0,0.24)]">
              <SearchOutlined className="text-[1.55rem] text-[color:var(--tertiary)]" />
              <input
                type="search"
                placeholder="Tìm kiếm"
                className="search-input text-[1.05rem]"
              />
            </label>

            <section className="mt-12">
              <h2 className="font-display text-[1.95rem] font-extrabold tracking-[-0.04em]">
                Duyệt xem các bài viết trợ giúp
              </h2>

              <div className="mt-6 border-t border-white/12">
                {supportCategories.map((item) => {
                  const Icon = item.icon

                  return (
                    <article key={item.label} className="border-b border-white/12 py-6">
                      <div className="flex items-center gap-5">
                        <Icon className="text-[1.35rem] text-[color:var(--primary)]" />
                        <h3 className="min-w-0 flex-1 text-[1.12rem] font-extrabold leading-7 text-[color:var(--text-primary)]">
                          {item.label}
                        </h3>
                        <DownOutlined className="rotate-180 text-[0.95rem] text-[color:var(--text-secondary)]" />
                      </div>

                      <div className="mt-5 pl-11">
                        {item.topics.map((topic) => (
                          <a
                            key={topic}
                            href={createSupportArticlePath(supportSlugs[topic])}
                            className="group flex items-center gap-4 py-3 text-left text-[1rem] font-extrabold leading-6 text-[color:var(--text-primary)] transition hover:text-[color:var(--primary)]"
                          >
                            <span className="min-w-0 flex-1">{topic}</span>
                            {item.label !== 'An toàn và quyền riêng tư' && (
                              <DownOutlined className="text-[0.9rem] text-[color:var(--text-secondary)] transition group-hover:text-[color:var(--primary)]" />
                            )}
                          </a>
                        ))}
                      </div>
                    </article>
                  )
                })}
              </div>
            </section>
          </div>
        </section>

        <section className="border-y border-white/8 bg-[color:var(--bg-surface)] px-5 py-14 sm:px-8 lg:px-14">
          <div className="mx-auto max-w-[860px]">
            <div className="flex flex-col gap-3">
              <p className="text-sm font-extrabold uppercase tracking-[0.28em] text-[color:var(--primary)]">
                Tài liệu hỗ trợ
              </p>
              <h2 className="font-display text-[2rem] font-extrabold tracking-[-0.04em] sm:text-[2.35rem]">
                Trợ giúp nhanh
              </h2>
              <p className="max-w-[620px] text-[1rem] font-medium leading-7 text-[color:var(--text-secondary)]">
                Những hướng dẫn thường dùng nhất để bạn xử lý nhanh các vấn đề khi nghe nhạc,
                quản lý tài khoản hoặc phát hành nội dung trên TMusic.
              </p>
            </div>

            <div className="mt-8 overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.035] shadow-[0_24px_70px_rgba(0,0,0,0.24)]">
              {quickHelpLinks.map((item) => (
                <a
                  key={item.title}
                  href={createSupportArticlePath(supportSlugs[item.title])}
                  className="group flex items-center gap-5 border-b border-white/10 px-6 py-5 text-left transition last:border-b-0 hover:bg-white/[0.06] sm:px-8 sm:py-6"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block text-[1.08rem] font-extrabold text-[color:var(--text-primary)] transition group-hover:text-[color:var(--primary)]">
                      {item.title}
                    </span>
                    <span className="mt-1.5 block text-sm font-medium leading-6 text-[color:var(--text-secondary)]">
                      {item.description}
                    </span>
                  </span>
                  <RightOutlined className="text-[1.1rem] text-[color:var(--text-secondary)] transition group-hover:translate-x-1 group-hover:text-[color:var(--primary)]" />
                </a>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[color:var(--bg-app)] px-5 py-16 sm:px-8 lg:px-14">
          <div className="mx-auto grid max-w-[960px] gap-5 md:grid-cols-3">
            {['Cộng đồng TMusic', 'Liên hệ hỗ trợ', 'Cập nhật dịch vụ'].map((item) => (
              <article key={item} className="panel-surface p-6">
                <h3 className="font-display text-xl font-extrabold text-[color:var(--text-primary)]">{item}</h3>
                <p className="mt-3 text-sm leading-6 text-[color:var(--text-secondary)]">
                  Tìm câu trả lời nhanh và theo dõi những hướng dẫn mới nhất cho tài khoản của bạn.
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="bg-[color:var(--bg-app)] px-5 pb-16 sm:px-8 lg:px-14">
          <div className="mx-auto max-w-[1320px]">
            <AppFooter compact />
          </div>
        </section>
      </main>
    </div>
  )
}

export default SupportPageView
