import 'antd/dist/reset.css'
import { Navigate, Route, Routes } from 'react-router-dom'
import { appPaths } from './app/routes/paths.js'
import AdminDashboardPage from './pages/AdminDashboardPage.jsx'
import AdminImportPage from './pages/AdminImportPage.jsx'

function AdminPage() {
  return (
    <Routes>
      <Route index element={<AdminDashboardPage />} />
      <Route path="import" element={<AdminImportPage />} />
      <Route path="*" element={<Navigate to={appPaths.admin.root} replace />} />
    </Routes>
  )
}

export default AdminPage
