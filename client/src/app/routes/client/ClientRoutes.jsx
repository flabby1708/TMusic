import { Route, useParams } from 'react-router-dom'
import { footerPageRoutes } from '../../../features/footer/footerPageData.js'
import FooterInfoPage from '../../../features/footer/FooterInfoPage.jsx'
import HomeSectionPage from '../../../features/home/pages/HomeSectionPage.jsx'
import SearchPage from '../../../features/home/pages/SearchPage.jsx'
import SupportArticlePage from '../../../features/support/pages/SupportArticlePage.jsx'
import AlbumPage from '../../../pages/client/AlbumPage/index.jsx'
import ArtistDashboardPage from '../../../pages/client/ArtistDashboardPage/index.jsx'
import ArtistLoginPage from '../../../pages/client/ArtistLoginPage/index.jsx'
import ArtistPortalPage from '../../../pages/client/ArtistPortalPage/index.jsx'
import ArtistRegisterPage from '../../../pages/client/ArtistRegisterPage/index.jsx'
import AuthCallbackPage from '../../../pages/client/AuthCallbackPage/index.jsx'
import HomePage from '../../../pages/client/HomePage/index.jsx'
import LoginPage from '../../../pages/client/LoginPage/index.jsx'
import NotFoundPage from '../../../pages/client/NotFoundPage/index.jsx'
import PodcastPage from '../../../pages/client/PodcastPage/index.jsx'
import RegisterPage from '../../../pages/client/RegisterPage/index.jsx'
import SupportPage from '../../../pages/client/SupportPage/index.jsx'
import { appPaths } from '../paths.js'
import {
  ArtistGuestRoute,
  ArtistProtectedRoute,
  UserGuestRoute,
  UserProtectedRoute,
} from '../routeGuards.jsx'

const publicRoutes = [
  { path: appPaths.home, element: <HomePage /> },
  { path: appPaths.podcast, element: <PodcastPage /> },
  { path: appPaths.section, element: <HomeSectionPage /> },
  { path: appPaths.search, element: <SearchPage /> },
  { path: appPaths.support, element: <SupportPage /> },
  { path: appPaths.auth.callback, element: <AuthCallbackPage /> },
  { path: appPaths.artist.portal, element: <ArtistPortalPage /> },
]

const userGuestRoutes = [
  { path: appPaths.auth.login, element: <LoginPage /> },
  { path: appPaths.auth.register, element: <RegisterPage /> },
]

const userProtectedRoutes = [{ path: appPaths.album, element: <AlbumPage /> }]

const artistGuestRoutes = [
  { path: appPaths.artist.login, element: <ArtistLoginPage /> },
  { path: appPaths.artist.register, element: <ArtistRegisterPage /> },
]

const artistProtectedRoutes = [
  { path: appPaths.artist.dashboard, element: <ArtistDashboardPage /> },
]

function SupportArticleRoute() {
  const { slug } = useParams()

  return <SupportArticlePage slug={slug} />
}

function renderRoute(route) {
  return <Route key={route.path} path={route.path} element={route.element} />
}

export default function ClientRoutes() {
  return (
    <>
      {publicRoutes.map(renderRoute)}
      <Route path={appPaths.supportArticle} element={<SupportArticleRoute />} />
      {footerPageRoutes.map((route) => (
        <Route
          key={route.path}
          path={route.path}
          element={<FooterInfoPage pageKey={route.pageKey} />}
        />
      ))}

      <Route element={<UserGuestRoute />}>{userGuestRoutes.map(renderRoute)}</Route>

      <Route element={<UserProtectedRoute />}>{userProtectedRoutes.map(renderRoute)}</Route>

      <Route element={<ArtistGuestRoute />}>{artistGuestRoutes.map(renderRoute)}</Route>

      <Route element={<ArtistProtectedRoute />}>
        {artistProtectedRoutes.map(renderRoute)}
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </>
  )
}
