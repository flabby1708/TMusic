import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { appPaths } from '../../../app/routes/paths.js'
import { SearchIcon } from '../../../shared/icons.jsx'
import ClientPublicHeader from '../layout/headers/public/ClientPublicHeader.jsx'
import ClientPublicShell from '../layout/shells/ClientPublicShell.jsx'

function NotFoundPageView() {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchInput, setSearchInput] = useState('')

  const handleSearchSubmit = (event) => {
    event.preventDefault()

    const query = searchInput.trim()

    if (!query) {
      navigate(appPaths.search)
      return
    }

    navigate(`${appPaths.search}?q=${encodeURIComponent(query)}`)
  }

  return (
    <ClientPublicShell header={<ClientPublicHeader />}>
      <main className="grid min-h-[calc(100vh-5rem)] place-items-center px-4 py-12 text-[color:var(--text-primary)] sm:px-8">
        <section className="w-full max-w-[760px] text-center">
          <p className="font-display text-[7rem] font-extrabold leading-none text-[color:var(--primary)] sm:text-[10rem]">
            404
          </p>
          <h1 className="mt-6 font-display text-[2.3rem] font-extrabold leading-tight tracking-[-0.04em] sm:text-[3.6rem]">
            Trang này không tồn tại
          </h1>
          <p className="mx-auto mt-5 max-w-[560px] text-[1rem] font-medium leading-7 text-[color:var(--text-secondary)] sm:text-[1.08rem]">
            Đường dẫn bạn vừa mở không có trên TMusic. Kiểm tra lại địa chỉ hoặc quay về trang chủ để tiếp tục nghe nhạc.
          </p>

          <div className="mx-auto mt-8 inline-flex max-w-full items-center gap-3 rounded-[8px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-[color:var(--text-secondary)]">
            <SearchIcon />
            <span className="truncate">{location.pathname}</span>
          </div>

          <form className="not-found-search mx-auto mt-6" onSubmit={handleSearchSubmit}>
            <SearchIcon />
            <input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Tìm bài hát, nghệ sĩ hoặc album"
              aria-label="Tìm kiếm trên TMusic"
            />
            <button type="submit">Tìm kiếm</button>
          </form>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to={appPaths.home} className="primary-button min-h-12 px-8">
              Về trang chủ
            </Link>
            <Link to={appPaths.search} className="secondary-button min-h-12 px-8">
              Tìm kiếm nhạc
            </Link>
          </div>
        </section>
      </main>
    </ClientPublicShell>
  )
}

export default NotFoundPageView
