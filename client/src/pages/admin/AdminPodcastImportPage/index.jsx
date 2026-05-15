import { ConfigProvider } from 'antd'
import { adminTheme } from '../../../features/admin/dashboard/adminDashboardTheme'
import AdminShell from '../../../features/admin/layout/AdminShell.jsx'
import AdminSongImportPageView from '../../../features/admin/pages/AdminSongImportPageView.jsx'

function AdminPodcastImportPage() {
  return (
    <AdminShell
      eyebrow="Podcast Import"
      title="Import podcast"
      subtitle="Tải nhiều file podcast và ảnh bìa lên hệ thống TMusic trong một lần xử lý."
    >
      <ConfigProvider theme={adminTheme}>
        <AdminSongImportPageView resourceType="podcasts" />
      </ConfigProvider>
    </AdminShell>
  )
}

export default AdminPodcastImportPage
