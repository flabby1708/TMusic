import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { appPaths } from '../../../../../app/routes/paths.js'

const premiumAccessStatuses = new Set(['active', 'trialing'])

function getSubscriptionMeta(user) {
  const subscription = user?.subscription || {}
  const plan = subscription.plan || user?.entitlements?.plan || 'free'
  const status = subscription.status || (user?.entitlements?.isPremium ? 'active' : 'inactive')
  const hasPremiumAccess =
    Boolean(user?.entitlements?.isPremium) ||
    (plan === 'premium' && premiumAccessStatuses.has(status))

  if (hasPremiumAccess) {
    return {
      label: 'Premium',
      tone: 'premium',
    }
  }

  if (plan === 'premium') {
    return {
      label: 'Premium',
      tone: 'attention',
    }
  }

  return {
    label: 'Miễn phí',
    tone: 'free',
  }
}

function getAccountLevelMeta(user, subscriptionMeta) {
  if (user?.role === 'admin') {
    return {
      label: 'Admin',
      tone: 'admin',
    }
  }

  if (user?.role === 'artist') {
    return {
      label: 'Nghệ sĩ',
      tone: 'artist',
    }
  }

  return {
    label: subscriptionMeta.label,
    tone: subscriptionMeta.tone,
  }
}

function ClientUserChip({ user, initials, displayName, onLogout }) {
  const menuRef = useRef(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [privateSessionEnabled, setPrivateSessionEnabled] = useState(false)
  const subscriptionMeta = useMemo(() => getSubscriptionMeta(user), [user])
  const accountLevelMeta = useMemo(
    () => getAccountLevelMeta(user, subscriptionMeta),
    [subscriptionMeta, user],
  )

  useEffect(() => {
    if (!isMenuOpen) {
      return undefined
    }

    const handlePointerDown = (event) => {
      if (!menuRef.current?.contains(event.target)) {
        setIsMenuOpen(false)
      }
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isMenuOpen])

  const handleLogoutClick = () => {
    setIsMenuOpen(false)
    onLogout?.()
  }

  return (
    <div className="client-user-menu" ref={menuRef}>
      <button
        type="button"
        className="client-user-trigger"
        aria-label="Mở menu tài khoản"
        aria-haspopup="dialog"
        aria-expanded={isMenuOpen}
        onClick={() => setIsMenuOpen((currentValue) => !currentValue)}
      >
        <span className="client-user-avatar" aria-hidden="true">
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt="" draggable="false" />
          ) : (
            initials
          )}
        </span>
      </button>

      {isMenuOpen ? (
        <div className="client-account-popover" role="dialog" aria-label="Menu tài khoản">
          <div className="client-account-head">
            <span className="client-account-avatar" aria-hidden="true">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="" draggable="false" />
              ) : (
                initials
              )}
            </span>
            <span className="client-account-identity">
              <strong>{displayName}</strong>
              {user?.email ? <small>{user.email}</small> : null}
            </span>
            <span className={`client-account-tier client-account-tier-${accountLevelMeta.tone}`}>
              {accountLevelMeta.label}
            </span>
          </div>

          <nav className="client-account-links" aria-label="Tùy chọn tài khoản">
            <Link to={appPaths.plans.individual} onClick={() => setIsMenuOpen(false)}>
              Tài khoản
            </Link>
            <Link
              to={user?.role === 'artist' ? appPaths.artist.dashboard : appPaths.home}
              onClick={() => setIsMenuOpen(false)}
            >
              Hồ sơ
            </Link>
            <Link to={appPaths.home} onClick={() => setIsMenuOpen(false)}>
              Gần đây
            </Link>
            <Link to={appPaths.support} onClick={() => setIsMenuOpen(false)}>
              Hỗ trợ
            </Link>
            <button
              type="button"
              aria-pressed={privateSessionEnabled}
              onClick={() => setPrivateSessionEnabled((currentValue) => !currentValue)}
            >
              <span>Phiên riêng tư</span>
              <span>{privateSessionEnabled ? 'Bật' : 'Tắt'}</span>
            </button>
            <Link to="/support/cai-dat-tai-khoan" onClick={() => setIsMenuOpen(false)}>
              Cài đặt
            </Link>
            <button type="button" onClick={handleLogoutClick}>
              Đăng xuất
            </button>
          </nav>

          <section className="client-account-updates" aria-label="Cập nhật của bạn">
            <p>Cập nhật của bạn</p>
            <strong>Bạn đã cập nhật xong</strong>
            <span>Theo dõi thông báo về hồ sơ, playlist và tài khoản tại đây.</span>
          </section>
        </div>
      ) : null}
    </div>
  )
}

export default ClientUserChip
