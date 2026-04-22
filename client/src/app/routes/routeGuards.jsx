import { Navigate, Outlet } from 'react-router-dom'
import { useAdminSession } from '../../features/admin/useAdminSession.js'
import { useArtistSession } from '../../features/artist/useArtistSession.js'
import { useAuthSession } from '../../features/auth/useAuthSession.js'
import { appPaths } from './paths.js'

function RouteLoader({ message }) {
  return (
    <div className="grid min-h-screen place-items-center bg-[color:var(--bg-app)] px-4 text-[color:var(--text-primary)]">
      <div className="rounded-[28px] border border-white/10 bg-white/[0.04] px-6 py-5 text-center">
        {message}
      </div>
    </div>
  )
}

function GuestRoute({ loading, isAuthenticated, redirectTo, loadingMessage }) {
  if (loading) {
    return <RouteLoader message={loadingMessage} />
  }

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />
  }

  return <Outlet />
}

function ProtectedRoute({ loading, isAuthenticated, redirectTo, loadingMessage }) {
  if (loading) {
    return <RouteLoader message={loadingMessage} />
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />
  }

  return <Outlet />
}

export function UserGuestRoute() {
  const { loading, isAuthenticated } = useAuthSession()

  return (
    <GuestRoute
      loading={loading}
      isAuthenticated={isAuthenticated}
      redirectTo={appPaths.home}
      loadingMessage="Đang kiểm tra phiên người dùng..."
    />
  )
}

export function ArtistGuestRoute() {
  const { loading, isAuthenticated } = useArtistSession()

  return (
    <GuestRoute
      loading={loading}
      isAuthenticated={isAuthenticated}
      redirectTo={appPaths.artist.dashboard}
      loadingMessage="Đang kiểm tra phiên nghệ sĩ..."
    />
  )
}

export function ArtistProtectedRoute() {
  const { loading, isAuthenticated } = useArtistSession()

  return (
    <ProtectedRoute
      loading={loading}
      isAuthenticated={isAuthenticated}
      redirectTo={appPaths.artist.login}
      loadingMessage="Đang kiểm tra phiên nghệ sĩ..."
    />
  )
}

export function AdminGuestRoute() {
  const { loading, isAuthenticated } = useAdminSession()

  return (
    <GuestRoute
      loading={loading}
      isAuthenticated={isAuthenticated}
      redirectTo={appPaths.admin.root}
      loadingMessage="Đang kiểm tra phiên quản trị..."
    />
  )
}

export function AdminProtectedRoute() {
  const { loading, isAuthenticated } = useAdminSession()

  return (
    <ProtectedRoute
      loading={loading}
      isAuthenticated={isAuthenticated}
      redirectTo={appPaths.admin.login}
      loadingMessage="Đang kiểm tra phiên quản trị..."
    />
  )
}
