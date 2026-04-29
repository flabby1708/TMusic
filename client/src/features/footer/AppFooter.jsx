import { Link } from 'react-router-dom'
import { footerColumns, footerLinks } from '../home/homeData.js'
import { SpotifyIcon } from '../../shared/icons.jsx'

const socialLinks = [
  { label: 'Instagram', text: 'IG' },
  { label: 'X', text: 'X' },
  { label: 'Facebook', text: 'f' },
]

function AppFooter({ compact = false }) {
  return (
    <footer className={`footer-shell ${compact ? '' : 'mt-8'}`}>
      <div className="footer-grid">
        <Link to="/" className="footer-brand" aria-label="Trang chủ TMusic">
          <span className="brand-badge h-11 w-11 rounded-[14px]">
            <SpotifyIcon />
          </span>
          <span className="font-display text-[1.55rem] font-extrabold tracking-[-0.06em] text-[color:var(--text-primary)]">
            TMusic
          </span>
        </Link>

        {footerColumns.map((column) => (
          <section key={column.title}>
            <h3 className="footer-heading">{column.title}</h3>
            <div className="footer-links">
              {column.links.map((link) => (
                <Link key={link.label} to={link.path} className="footer-link">
                  {link.label}
                </Link>
              ))}
            </div>
          </section>
        ))}

        <div className="footer-socials">
          {socialLinks.map((item) => (
            <button
              key={item.label}
              className="footer-social-button"
              aria-label={item.label}
              title={item.label}
              type="button"
            >
              {item.text}
            </button>
          ))}
        </div>
      </div>

      <div className="footer-bottom footer-bottom-grid">
        <div className="footer-legal-links">
          {footerLinks.map((link) => (
            <Link key={link.label} to={link.path} className="footer-legal-link">
              {link.label}
            </Link>
          ))}
        </div>
        <span>© 2026 TMusic</span>
      </div>
    </footer>
  )
}

export default AppFooter
