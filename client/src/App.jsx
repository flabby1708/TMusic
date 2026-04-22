import { Navigate, Route, Routes } from 'react-router-dom'
import { appPaths } from './app/routes/paths.js'
import {
  AdminGuestRoute,
  AdminProtectedRoute,
  ArtistGuestRoute,
  ArtistProtectedRoute,
  UserGuestRoute,
} from './app/routes/routeGuards.jsx'
import AdminPage from './AdminPage.jsx'
import ArtistDashboardPage from './pages/ArtistDashboardPage.jsx'
import ArtistLoginPage from './pages/ArtistLoginPage.jsx'
import ArtistPortalPage from './pages/ArtistPortalPage.jsx'
import ArtistRegisterPage from './pages/ArtistRegisterPage.jsx'
import AuthCallbackPage from './pages/AuthCallbackPage.jsx'
import HomePage from './pages/HomePage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import AdminLoginPage from './pages/AdminLoginPage.jsx'

function App() {
  return (
    <Routes>
      <Route path={appPaths.home} element={<HomePage />} />
      <Route path={appPaths.auth.callback} element={<AuthCallbackPage />} />
      <Route path={appPaths.artist.portal} element={<ArtistPortalPage />} />

      <Route element={<UserGuestRoute />}>
        <Route path={appPaths.auth.login} element={<LoginPage />} />
        <Route path={appPaths.auth.register} element={<RegisterPage />} />
      </Route>

      <Route element={<ArtistGuestRoute />}>
        <Route path={appPaths.artist.login} element={<ArtistLoginPage />} />
        <Route path={appPaths.artist.register} element={<ArtistRegisterPage />} />
      </Route>

      <Route element={<ArtistProtectedRoute />}>
        <Route path={appPaths.artist.dashboard} element={<ArtistDashboardPage />} />
      </Route>

      <Route element={<AdminGuestRoute />}>
        <Route path={appPaths.admin.login} element={<AdminLoginPage />} />
      </Route>

      <Route element={<AdminProtectedRoute />}>
        <Route path={appPaths.admin.root} element={<AdminPage />} />
        <Route path={`${appPaths.admin.root}/*`} element={<AdminPage />} />
      </Route>

      <Route path="*" element={<Navigate to={appPaths.home} replace />} />
    </Routes>
  )
}

export default App
