import { Route, Routes } from 'react-router-dom'
import AdminLoginPage from '../../pages/admin/AdminLoginPage/index.jsx'
import AdminRoutes from './admin/AdminRoutes.jsx'
import ClientRoutes from './client/ClientRoutes.jsx'
import { appPaths } from './paths.js'
import { AdminGuestRoute, AdminProtectedRoute } from './routeGuards.jsx'

const adminGuestRoutes = [{ path: appPaths.admin.login, element: <AdminLoginPage /> }]

const adminProtectedRoutes = [
  { path: appPaths.admin.root, element: <AdminRoutes /> },
  { path: `${appPaths.admin.root}/*`, element: <AdminRoutes /> },
]

function renderRoute(route) {
  return <Route key={route.path} path={route.path} element={route.element} />
}

function AppRoutes() {
  return (
    <Routes>
      {ClientRoutes()}

      <Route element={<AdminGuestRoute />}>{adminGuestRoutes.map(renderRoute)}</Route>

      <Route element={<AdminProtectedRoute />}>
        {adminProtectedRoutes.map(renderRoute)}
      </Route>
    </Routes>
  )
}

export default AppRoutes
