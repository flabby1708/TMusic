import { Navigate, Route, Routes, useParams } from 'react-router-dom'
import { appPaths } from './app/routes/paths.js'
import {
  AdminGuestRoute,
  AdminProtectedRoute,
  ArtistGuestRoute,
  ArtistProtectedRoute,
  UserGuestRoute,
} from './app/routes/routeGuards.jsx'
import AdminRoutes from './app/routes/admin/AdminRoutes.jsx'
import ArtistDashboardPage from './pages/client/ArtistDashboardPage/index.jsx'
import ArtistLoginPage from './pages/client/ArtistLoginPage/index.jsx'
import ArtistPortalPage from './pages/client/ArtistPortalPage/index.jsx'
import ArtistRegisterPage from './pages/client/ArtistRegisterPage/index.jsx'
import AuthCallbackPage from './pages/client/AuthCallbackPage/index.jsx'
import HomePage from './pages/client/HomePage/index.jsx'
import HomeSectionPage from './features/home/pages/HomeSectionPage.jsx'
import SearchPage from './features/home/pages/SearchPage.jsx'
import LoginPage from './pages/client/LoginPage/index.jsx'
import RegisterPage from './pages/client/RegisterPage/index.jsx'
import SupportPage from './pages/client/SupportPage/index.jsx'
import AdminLoginPage from './pages/admin/AdminLoginPage/index.jsx'
import FooterInfoPage from './features/footer/FooterInfoPage.jsx'
import SupportArticlePage from './features/support/pages/SupportArticlePage.jsx'
import { footerPageRoutes } from './features/footer/footerPageData.js'

function SupportArticleRoute() {
  const { slug } = useParams()

  return <SupportArticlePage slug={slug} />
}

function App() {
  return (
    <Routes>
      <Route path={appPaths.home} element={<HomePage />} />
      <Route path={appPaths.section} element={<HomeSectionPage />} />
      <Route path={appPaths.search} element={<SearchPage />} />
      <Route path={appPaths.support} element={<SupportPage />} />
      <Route path={appPaths.supportArticle} element={<SupportArticleRoute />} />
      {footerPageRoutes.map((route) => (
        <Route
          key={route.path}
          path={route.path}
          element={<FooterInfoPage pageKey={route.pageKey} />}
        />
      ))}
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
        <Route path={appPaths.admin.root} element={<AdminRoutes />} />
        <Route path={`${appPaths.admin.root}/*`} element={<AdminRoutes />} />
      </Route>

      <Route path="*" element={<Navigate to={appPaths.home} replace />} />
    </Routes>
  )
}

export default App
