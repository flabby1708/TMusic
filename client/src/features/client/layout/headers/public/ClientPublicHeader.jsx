import { Link } from 'react-router-dom'
import { SpotifyIcon } from '../../../../../shared/icons.jsx'

function ClientPublicHeader() {
  return (
    <header className="top-shell flex flex-wrap items-center justify-between gap-3 px-4 py-3">
      <Link to="/" className="flex items-center gap-3" aria-label="TMusic home">
        <span className="brand-badge">
          <SpotifyIcon />
        </span>
        <span className="brand-word">TMusic</span>
      </Link>

      <div className="flex items-center gap-2">
        <Link to="/register" className="secondary-button top-action-link">
          Đăng ký
        </Link>
        <Link to="/login" className="primary-button top-action-link">
          Đăng nhập
        </Link>
      </div>
    </header>
  )
}

export default ClientPublicHeader
