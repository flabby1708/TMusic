import { DownloadIcon, HomeIcon, SpotifyIcon } from '../../../../../shared/icons.jsx'
import { menuLinks } from '../../../../home/homeData.js'
import ClientNavLinks from '../../navigation/ClientNavLinks.jsx'
import ClientPremiumMenu from './ClientPremiumMenu.jsx'
import ClientSearchBar from './ClientSearchBar.jsx'
import ClientUserChip from './ClientUserChip.jsx'

function isPremiumNavItem(item) {
  return item.label === 'Premium' || item.path?.startsWith('/plans')
}

function ClientAppHeader({
  searchQuery,
  onSearchQueryChange,
  onSearchSubmit,
  searchSuggestions,
  onSearchSuggestionSelect,
  isAuthenticated,
  user,
  userInitials,
  userDisplayName,
  onLogout,
}) {
  return (
    <header className="top-shell flex flex-wrap items-center justify-between gap-2.5 px-3 py-2.5 sm:px-4 xl:flex-none">
      <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
        <a href="/" className="brand-badge hidden sm:inline-flex" aria-label="Trang chủ TMusic">
          <SpotifyIcon />
        </a>
        <a href="/" className="brand-word hidden md:inline-flex" aria-label="TMusic home">
          TMusic
        </a>

        <a href="/" className="icon-frame" aria-label="Trang chủ">
          <HomeIcon />
        </a>

        <ClientSearchBar
          value={searchQuery}
          onChange={onSearchQueryChange}
          onSubmit={onSearchSubmit}
          suggestions={searchSuggestions}
          onSuggestionSelect={onSearchSuggestionSelect}
        />
      </div>

      <div className="flex items-center gap-2.5 sm:gap-3.5">
        <ClientNavLinks
          links={menuLinks}
          renderSpecialItem={(item) =>
            isPremiumNavItem(item) ? <ClientPremiumMenu key={item.label} item={item} /> : null
          }
        />

        <div className="hidden h-7 w-px bg-white/10 lg:block" />

        <button
          className="download-link top-nav-link hidden items-center gap-2 md:inline-flex"
          title="Cài đặt ứng dụng TMusic"
        >
          <DownloadIcon />
          Cài đặt ứng dụng
        </button>

        {isAuthenticated ? (
          <>
            <ClientUserChip
              user={user}
              initials={userInitials}
              displayName={userDisplayName}
              onLogout={onLogout}
            />
          </>
        ) : (
          <>
            <a href="/register" className="secondary-button top-action-link hidden sm:inline-flex">
              Đăng ký
            </a>
            <a href="/login" className="primary-button top-action-link">
              Đăng nhập
            </a>
          </>
        )}
      </div>
    </header>
  )
}

export default ClientAppHeader
