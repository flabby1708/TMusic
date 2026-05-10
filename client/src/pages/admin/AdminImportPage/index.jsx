import { ConfigProvider } from 'antd'
import { adminTheme } from '../../../features/admin/dashboard/adminDashboardTheme'
import AdminShell from '../../../features/admin/layout/AdminShell.jsx'
import AdminSongImportPageView from '../../../features/admin/pages/AdminSongImportPageView.jsx'

function AdminImportPage() {
  return (
    <AdminShell
      eyebrow="Import Studio"
      title="Import bài hát"
      subtitle="Tải nhiều file nhạc và ảnh bìa lên hệ thống TMusic trong một lần xử lý."
    >
      <ConfigProvider theme={adminTheme}>
        <AdminSongImportPageView />
      </ConfigProvider>
    </AdminShell>
  )
}

export default AdminImportPage
