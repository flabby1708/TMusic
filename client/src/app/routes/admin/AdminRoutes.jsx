import 'antd/dist/reset.css'
import { Navigate, Route, Routes } from 'react-router-dom'
import { appPaths } from '../paths.js'
import AdminArtistApplicationsPage from '../../../pages/admin/AdminArtistApplicationsPage/index.jsx'
import AdminDashboardPage from '../../../pages/admin/AdminDashboardPage/index.jsx'
import AdminImportPage from '../../../pages/admin/AdminImportPage/index.jsx'
import AdminUsersPage from '../../../pages/admin/AdminUsersPage/index.jsx'

function AdminRoutes() {
  return (
    <Routes>
      <Route index element={<AdminDashboardPage />} />
      <Route path="import" element={<AdminImportPage />} />
      <Route path="users" element={<AdminUsersPage />} />
      <Route path="artist-applications" element={<AdminArtistApplicationsPage />} />
      <Route path="*" element={<Navigate to={appPaths.admin.root} replace />} />
    </Routes>
  )
}

export default AdminRoutes
