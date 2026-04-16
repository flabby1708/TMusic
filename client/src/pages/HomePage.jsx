import { useRef } from 'react'
import {
  ArrowIcon,
  ChevronLeftSmallIcon,
  ChevronRightSmallIcon,
  DownloadIcon,
  GlobeIcon,
  HomeIcon,
  LibraryIcon,
  PlayIcon,
  PlusIcon,
  SearchIcon,
  SearchTrailingIcon,
  SpotifyIcon,
} from '../shared/icons.jsx'
import {
  albumMockImages,
  artistMockImages,
  chartMockImages,
  footerColumns,
  footerLinks,
  libraryPrompts,
  menuLinks,
  radioMockImages,
  trackMockImages,
} from '../features/home/homeData.js'
import { useHomePageData } from '../features/home/useHomePageData.js'

function SectionMoreLink({ href }) {
  return (
    <a
      draggable="false"
      className="FOjXJqlCvEIMzJBF mbwNxmJkaTgwmZSP section-more-link hidden sm:flex"
      href={href}
      onClick={(event) => event.preventDefault()}
    >
      <span
        className="e-10310-text encore-text-body-small-bold encore-internal-color-text-subdued"
        data-encore-id="text"
      >
        Hien tat ca
      </span>
    </a>
  )
}

function HomePage() {
  const artistCarouselRef = useRef(null)
  const { homeContent, isLive, statusClassName, statusText } = useHomePageData()

  const scrollArtistsPrev = () => {
    artistCarouselRef.current?.scrollBy({
      left: -320,
      behavior: 'smooth',
    })
  }

  const scrollArtistsNext = () => {
    artistCarouselRef.current?.scrollBy({
      left: 320,
      behavior: 'smooth',
    })
  }

  return (
    <div className="min-h-screen bg-[color:var(--bg-app)] px-2.5 py-2.5 text-[color:var(--text-primary)]">
      <div className="mx-auto flex min-h-[calc(100vh-1.25rem)] w-full max-w-[1920px] flex-col gap-2.5">
        <header className="top-shell flex flex-wrap items-center justify-between gap-2.5 px-3 py-2.5 sm:px-4">
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
            <button className="brand-badge hidden sm:inline-flex" aria-label="TMusic home">
              <SpotifyIcon />
            </button>

            <button className="icon-frame" aria-label="Trang chu">
              <HomeIcon />
            </button>

            <div className="search-shell min-w-0 flex-1">
              <SearchIcon />
              <input className="search-input" type="text" placeholder="Ban muon phat noi dung gi?" />
              <div className="search-divider" />
              <button className="text-[color:var(--text-secondary)] transition hover:text-[color:var(--text-primary)]" aria-label="Thu vien">
                <SearchTrailingIcon />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3.5">
            <nav className="hidden items-center gap-4 text-[0.92rem] font-semibold text-[color:var(--text-secondary)] lg:flex">
              {menuLinks.map((item) => (
                <a key={item} href="/" onClick={(event) => event.preventDefault()} className="transition hover:text-[color:var(--text-primary)]">
                  {item}
                </a>
              ))}
            </nav>

            <div className="hidden h-7 w-px bg-white/10 lg:block" />

            <a href="/admin" className="secondary-button hidden md:inline-flex">
              Admin
            </a>

            <button className="download-link hidden items-center gap-2 md:inline-flex">
              <DownloadIcon />
              Cai dat ung dung
            </button>

            <button className="secondary-button hidden sm:inline-flex">Dang ky</button>
            <button className="primary-button">Dang nhap</button>
          </div>
        </header>

        <div className="grid flex-1 gap-2.5 pb-[86px] xl:grid-cols-[372px_minmax(0,1fr)]">
          <aside className="panel-surface flex min-h-[320px] flex-col overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4.5">
              <div className="flex items-center gap-3 text-[color:var(--text-primary)]">
                <LibraryIcon />
                <h2 className="font-display text-[1.3rem] font-extrabold tracking-tight">Thu vien</h2>
              </div>

              <button className="secondary-button inline-flex items-center gap-2">
                <PlusIcon />
                Tao
              </button>
            </div>

            <div className="hide-scrollbar flex-1 space-y-3.5 overflow-y-auto px-3.5 pb-4">
              {libraryPrompts.map((item) => (
                <section key={item.title} className="library-card">
                  <h3 className="font-display text-[1rem] font-bold leading-7 text-[color:var(--text-primary)]">{item.title}</h3>
                  <p className="mt-2.5 max-w-[17rem] text-[0.92rem] leading-7 text-[color:var(--text-secondary)]">{item.description}</p>
                  <button className="primary-button mt-6">{item.action}</button>
                </section>
              ))}
            </div>

            <div className="space-y-5 px-5 pb-5 pt-2">
              <div className="flex flex-wrap gap-x-4 gap-y-2 text-[0.84rem] leading-6 text-[color:var(--text-secondary)]">
                {footerLinks.map((item) => (
                  <a key={item} href="/" onClick={(event) => event.preventDefault()} className="transition hover:text-[color:var(--text-primary)]">
                    {item}
                  </a>
                ))}
              </div>

              <button className="language-button">
                <GlobeIcon />
                Tieng Viet
              </button>
            </div>
          </aside>

          <main className="panel-surface relative overflow-hidden">
            <div className="content-veil" />

            <div className="hide-scrollbar relative h-full overflow-y-auto px-4 pb-10 pt-6 sm:px-6 lg:px-8">
              <section>
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <p className="section-kicker">Amber Earth & Electric Blue</p>
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <span className={statusClassName}>
                        <span className="status-dot" />
                        {statusText}
                      </span>
                      <span className="text-sm text-[color:var(--text-secondary)]">
                        {homeContent.loading ? 'Dang tai danh sach...' : 'Khong gian phat danh cho ban'}
                      </span>
                    </div>

                    <h1 className="font-display text-[1.82rem] font-extrabold tracking-tight text-[color:var(--text-primary)] sm:text-[2.45rem]">
                      Nhung bai hat thinh hanh
                    </h1>
                  </div>

                  <SectionMoreLink href="/section/trending" />
                </div>

                <div className="hide-scrollbar -mx-2 overflow-x-auto pb-7">
                  <div className="flex min-w-max gap-2 px-1">
                    {homeContent.songs.map((track, index) => (
                      <article key={`${track.title}-${index}`} className="track-card group w-[176px] shrink-0 p-2.5">
                        <div className="relative overflow-hidden rounded-[18px] border border-white/6">
                          {track.coverUrl || trackMockImages[index] ? (
                            <img src={track.coverUrl || trackMockImages[index]} alt={track.title} className="aspect-square h-[168px] w-full object-cover" />
                          ) : (
                            <div className="album-art aspect-square h-[168px] w-full" style={{ backgroundImage: track.artwork }}>
                              <div className="album-overlay" />
                              <div className="album-shine" />
                              <div className="album-caption">
                                <span className="track-pill">{track.tag}</span>
                                <span className="album-caption-title">{track.title}</span>
                              </div>
                            </div>
                          )}

                          <button className="play-chip" aria-label={`Phat ${track.title}`}>
                            <PlayIcon />
                          </button>
                        </div>

                        <div className="mt-3.5 flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-display text-[0.98rem] font-bold leading-6 text-[color:var(--text-primary)]">{track.title}</h3>
                            <p className="mt-1 text-[0.88rem] leading-6 text-[color:var(--text-secondary)]">
                              {track.explicit ? (
                                <span className="mr-2 rounded-[6px] bg-white/12 px-1 py-[1px] text-[0.68rem] font-bold text-[color:var(--text-primary)]">
                                  E
                                </span>
                              ) : null}
                              {track.artist}
                            </p>
                          </div>

                          <span className="text-[0.78rem] font-semibold text-[color:var(--text-dim)]">{track.duration}</span>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              </section>

              <section className="mt-5">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <div>
                    <p className="section-kicker">{isLive ? 'Blue state active' : 'Curated picks'}</p>
                    <h2 className="font-display text-[1.7rem] font-extrabold tracking-tight text-[color:var(--text-primary)] sm:text-[2.1rem]">
                      Nghe si pho bien
                    </h2>
                  </div>

                  <SectionMoreLink href="/section/artists" />
                </div>

                <div className="artist-carousel-shell">
                  <button type="button" className="artist-scroll-button artist-scroll-button-left hidden lg:inline-flex" aria-label="Tro ve nghe si truoc" onClick={scrollArtistsPrev}>
                    <ChevronLeftSmallIcon />
                  </button>

                  <div ref={artistCarouselRef} className="hide-scrollbar -mx-3 overflow-x-auto">
                    <div className="flex min-w-max gap-2 px-1 pb-2">
                      {homeContent.artists.map((artist, index) => (
                        <article key={artist.name} className="artist-card group w-[186px] shrink-0 p-2.5">
                          {artist.imageUrl || artistMockImages[index] ? (
                            <img src={artist.imageUrl || artistMockImages[index]} alt={artist.name} className="artist-portrait aspect-square w-full object-cover" />
                          ) : (
                            <div className="artist-portrait aspect-square w-full" style={{ backgroundImage: artist.artwork }}>
                              <div className="artist-glow" />
                              <div className="artist-initials">{artist.initials}</div>
                            </div>
                          )}

                          <h3 className="mt-4 font-display text-[1rem] font-bold text-[color:var(--text-primary)]">{artist.name}</h3>
                          <p className="mt-1 text-[0.88rem] text-[color:var(--text-secondary)]">{artist.meta}</p>
                        </article>
                      ))}
                    </div>
                  </div>

                  <button type="button" className="artist-scroll-button artist-scroll-button-right hidden lg:inline-flex" aria-label="Xem them nghe si" onClick={scrollArtistsNext}>
                    <ChevronRightSmallIcon />
                  </button>
                </div>
              </section>

              <section className="mt-8">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <h2 className="font-display text-[1.7rem] font-extrabold tracking-tight text-[color:var(--text-primary)] sm:text-[2.1rem]">Album va dia don noi tieng</h2>
                  <SectionMoreLink href="/section/albums" />
                </div>

                <div className="hide-scrollbar -mx-2 overflow-x-auto pb-4">
                  <div className="flex min-w-max gap-2 px-1">
                    {homeContent.albums.map((album, index) => (
                      <article key={album.title} className="track-card group w-[186px] shrink-0 p-2.5">
                        {album.coverUrl || albumMockImages[index] ? (
                          <img src={album.coverUrl || albumMockImages[index]} alt={album.title} className="aspect-square h-[168px] w-full rounded-[18px] border border-white/6 object-cover" />
                        ) : (
                          <div className="album-art album-cover aspect-square h-[168px] w-full rounded-[18px] border border-white/6" style={{ backgroundImage: album.artwork }}>
                            <div className="album-overlay" />
                            <div className="album-shine" />
                          </div>
                        )}

                        <div className="mt-3.5">
                          <h3 className="font-display text-[0.98rem] font-bold leading-6 text-[color:var(--text-primary)]">{album.title}</h3>
                          <p className="mt-1 text-[0.88rem] leading-6 text-[color:var(--text-secondary)]">{album.artist}</p>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              </section>

              <section className="mt-8">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <h2 className="font-display text-[1.7rem] font-extrabold tracking-tight text-[color:var(--text-primary)] sm:text-[2.1rem]">Radio pho bien</h2>
                  <SectionMoreLink href="/section/radio" />
                </div>

                <div className="hide-scrollbar -mx-2 overflow-x-auto pb-4">
                  <div className="flex min-w-max gap-2 px-1">
                    {homeContent.radios.map((radio, index) => (
                      <article key={radio.title} className="radio-card group w-[238px] shrink-0 p-2.5">
                        <div className="radio-surface" style={{ backgroundImage: radio.tone }}>
                          <div className="radio-brand">
                            <SpotifyIcon />
                            <span>RADIO</span>
                          </div>

                          {radio.imageUrl || radioMockImages[index] ? (
                            <img src={radio.imageUrl || radioMockImages[index]} alt={radio.title} className="radio-image" />
                          ) : (
                            <div className="radio-avatars">
                              {radio.initials.map((item, avatarIndex) => (
                                <div key={`${radio.title}-${item}`} className={`radio-avatar ${avatarIndex === 1 ? 'radio-avatar-main' : ''}`}>
                                  {item}
                                </div>
                              ))}
                            </div>
                          )}

                          <button className="radio-play" aria-label={`Phat radio ${radio.title}`}>
                            <PlayIcon />
                          </button>

                          <h3 className="radio-title">{radio.title}</h3>
                        </div>

                        <p className="mt-3 text-[0.88rem] leading-6 text-[color:var(--text-secondary)]">{radio.description}</p>
                      </article>
                    ))}
                  </div>
                </div>
              </section>

              <section className="mt-8">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <h2 className="font-display text-[1.7rem] font-extrabold tracking-tight text-[color:var(--text-primary)] sm:text-[2.1rem]">Bang xep hang noi bat</h2>
                  <SectionMoreLink href="/section/charts" />
                </div>

                <div className="hide-scrollbar -mx-2 overflow-x-auto pb-4">
                  <div className="flex min-w-max gap-2 px-1">
                    {homeContent.charts.map((chart, index) => (
                      <article key={chart.title} className="track-card group w-[218px] shrink-0 p-2.5">
                        <div
                          className="chart-surface"
                          style={{
                            backgroundImage: chart.coverUrl || chartMockImages[index]
                              ? `url(${chart.coverUrl || chartMockImages[index]})`
                              : chart.artwork,
                          }}
                        >
                          <div className="chart-badge">
                            <SpotifyIcon />
                          </div>
                          <div className="chart-content">
                            <h3>{chart.title}</h3>
                          </div>
                        </div>

                        <p className="mt-3 text-[0.88rem] leading-6 text-[color:var(--text-secondary)]">{chart.subtitle}</p>
                      </article>
                    ))}
                  </div>
                </div>
              </section>

              <footer className="footer-shell mt-8">
                <div className="footer-grid">
                  {footerColumns.map((column) => (
                    <section key={column.title}>
                      <h3 className="footer-heading">{column.title}</h3>
                      <div className="footer-links">
                        {column.links.map((link) => (
                          <a key={link} href="/" onClick={(event) => event.preventDefault()} className="footer-link">
                            {link}
                          </a>
                        ))}
                      </div>
                    </section>
                  ))}

                  <div className="footer-socials">
                    {['IG', 'X', 'f'].map((item) => (
                      <button key={item} className="footer-social-button" aria-label={item}>
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="footer-bottom">
                  <span>© 2026 Spotify AB</span>
                </div>
              </footer>
            </div>
          </main>
        </div>

        <div className="promo-bar fixed inset-x-3 bottom-3 z-20 flex flex-col items-start justify-between gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:px-5">
          <div>
            <p className="text-[0.78rem] font-bold uppercase tracking-[0.18em] text-white/80">Xem truoc TMusic</p>
            <p className="mt-2 max-w-4xl font-display text-[1rem] font-bold leading-6 text-[color:var(--text-primary)]">
              Dang ky de nghe khong gioi han bai hat va podcast. Tong mau moi giup giao dien em hon cho mat nhung van giu diem nhan ro rang.
            </p>
          </div>

          <button className="primary-button inline-flex shrink-0 items-center gap-2">
            Dang ky mien phi
            <ArrowIcon />
          </button>
        </div>
      </div>
    </div>
  )
}

export default HomePage
