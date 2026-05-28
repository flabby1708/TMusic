import { Link } from 'react-router-dom'
import { ChevronRightSmallIcon } from '../../../../../shared/icons.jsx'

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

function ClientPremiumMenu({ item }) {
  return (
    <div className="premium-nav-item">
      <Link to={item.path} className="top-nav-link">
        {item.label}
      </Link>

      <div className="premium-hover-panel" aria-label="Explore Premium plans">
        <h3>Explore Premium</h3>
        <div className="premium-hover-list">
          {premiumHoverPlans.map((plan) => (
            <Link key={plan.title} to={item.path} className="premium-hover-card">
              <span>
                <strong>{plan.title}</strong>
                <small>{plan.description}</small>
              </span>
              <ChevronRightSmallIcon />
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ClientPremiumMenu
