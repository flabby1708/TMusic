import { Link } from 'react-router-dom'

function ClientNavLinks({ links, renderSpecialItem }) {
  return (
    <nav className="hidden items-center gap-4 text-[0.92rem] font-semibold text-[color:var(--text-secondary)] lg:flex">
      {links.map((item) => {
        const specialItem = renderSpecialItem?.(item)

        if (specialItem) {
          return specialItem
        }

        return (
          <Link key={item.label} to={item.path} className="top-nav-link">
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

export default ClientNavLinks
