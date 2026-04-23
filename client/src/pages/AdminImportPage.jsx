import { ConfigProvider } from 'antd'
import AdminSongImportPageView from '../features/admin/pages/AdminSongImportPageView.jsx'
import { adminTheme } from '../features/admin/dashboard/adminDashboardTheme'

function AdminImportPage() {
  return (
    <ConfigProvider theme={adminTheme}>
      <AdminSongImportPageView />
    </ConfigProvider>
  )
}

export default AdminImportPage
