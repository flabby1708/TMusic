import { Link, Navigate } from 'react-router-dom'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { appPaths } from '../../../app/routes/paths.js'
import { SpotifyIcon } from '../../../shared/icons.jsx'
import AppFooter from '../../footer/AppFooter.jsx'
import { supportArticleData } from '../supportArticleData.js'

function SupportArticleHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-[color:var(--border-soft)] bg-[color:rgba(9,17,29,0.94)] px-5 py-4 text-[color:var(--text-primary)] shadow-[0_18px_44px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:px-8 lg:px-14">
      <div className="mx-auto flex max-w-[1320px] flex-wrap items-center justify-between gap-4">
        <Link to={appPaths.home} className="flex items-center gap-2.5" aria-label="Trang chủ TMusic">
          <span className="brand-badge h-11 w-11 rounded-[14px]">
            <SpotifyIcon />
          </span>
          <span className="font-display text-[1.7rem] font-extrabold tracking-[-0.06em]">
            TMusic
          </span>
        </Link>

        <nav className="flex items-center gap-5 text-sm font-extrabold text-[color:var(--text-secondary)] sm:text-base">
          <Link to={appPaths.support} className="transition hover:text-[color:var(--text-primary)]">
            Trung tâm hỗ trợ
          </Link>
          <Link to={appPaths.auth.login} className="primary-button px-5 py-2.5">
            Đăng nhập
          </Link>
        </nav>
      </div>
    </header>
  )
}

function SupportArticlePage({ slug }) {
  const article = supportArticleData[slug]

  if (!article) {
    return <Navigate to={appPaths.support} replace />
  }

  return (
    <div className="min-h-screen bg-[color:var(--bg-app)] text-[color:var(--text-primary)]">
      <SupportArticleHeader />

      <main>
        <section className="relative overflow-hidden px-5 py-16 sm:px-8 sm:py-20 lg:px-14">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(255,107,87,0.14),transparent_34%),radial-gradient(circle_at_82%_6%,rgba(41,212,255,0.12),transparent_30%),linear-gradient(180deg,#0d1525_0%,#08111d_60%,#060b16_100%)]" />
          <div className="relative mx-auto max-w-[900px]">
            <Link
              to={appPaths.support}
              className="inline-flex items-center gap-2 text-sm font-extrabold text-[color:var(--text-secondary)] transition hover:text-[color:var(--primary)]"
            >
              <ArrowLeftOutlined />
              Quay lại hỗ trợ
            </Link>
            <p className="section-kicker mt-10">{article.category}</p>
            <h1 className="mt-3 font-display text-[2.8rem] font-extrabold leading-[1.05] tracking-[-0.06em] sm:text-[4.2rem]">
              {article.title}
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-[color:var(--text-secondary)]">
              {article.intro}
            </p>
          </div>
        </section>

        <section className="px-5 pb-16 sm:px-8 lg:px-14">
          <div className="mx-auto grid max-w-[900px] gap-5">
            {article.sections.map((section) => (
              <article key={section.heading} className="panel-surface p-6 sm:p-8">
                <h2 className="font-display text-2xl font-extrabold tracking-[-0.04em]">
                  {section.heading}
                </h2>
                {section.body ? (
                  <p className="mt-4 text-base leading-8 text-[color:var(--text-secondary)]">
                    {section.body}
                  </p>
                ) : null}
                {section.list ? (
                  <ul className="mt-4 grid gap-3 text-base leading-7 text-[color:var(--text-secondary)]">
                    {section.list.map((item) => (
                      <li key={item} className="flex gap-3">
                        <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[color:var(--primary)]" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </article>
            ))}
          </div>
        </section>

        <section className="px-5 pb-16 sm:px-8 lg:px-14">
          <div className="mx-auto max-w-[1320px]">
            <AppFooter compact />
          </div>
        </section>
      </main>
    </div>
  )
}

export default SupportArticlePage
