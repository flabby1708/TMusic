import 'antd/dist/reset.css'
import { Navigate, Route, Routes } from 'react-router-dom'
import { appPaths } from '../paths.js'
import AdminAdminsPage from '../../../pages/admin/AdminAdminsPage/index.jsx'
import AdminArtistApplicationsPage from '../../../pages/admin/AdminArtistApplicationsPage/index.jsx'
import AdminArtistAccountsPage from '../../../pages/admin/AdminArtistAccountsPage/index.jsx'
import AdminDashboardPage from '../../../pages/admin/AdminDashboardPage/index.jsx'
import AdminImportPage from '../../../pages/admin/AdminImportPage/index.jsx'
import AdminPodcastImportPage from '../../../pages/admin/AdminPodcastImportPage/index.jsx'
import AdminUsersPage from '../../../pages/admin/AdminUsersPage/index.jsx'

function AdminRoutes() {
  return (
    <Routes>
      <Route index element={<Navigate to={appPaths.admin.songs} replace />} />
      <Route path="songs" element={<AdminDashboardPage initialResource="songs" />} />
      <Route path="artists" element={<AdminDashboardPage initialResource="artists" />} />
      <Route path="podcasts" element={<AdminDashboardPage initialResource="podcasts" />} />
      <Route path="podcasts/import" element={<AdminPodcastImportPage />} />
      <Route path="import" element={<AdminImportPage />} />
      <Route path="users" element={<AdminUsersPage />} />
      <Route path="admins" element={<AdminAdminsPage />} />
      <Route path="artist-accounts" element={<AdminArtistAccountsPage />} />
      <Route path="artist-applications" element={<AdminArtistApplicationsPage />} />
      <Route path="*" element={<Navigate to={appPaths.admin.songs} replace />} />
    </Routes>
  )
}

export default AdminRoutes
