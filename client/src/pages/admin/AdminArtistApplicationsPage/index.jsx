import AdminArtistApplicationsPageView from '../../../features/admin/pages/AdminArtistApplicationsPageView.jsx'
import AdminShell from '../../../features/admin/layout/AdminShell.jsx'

function AdminArtistApplicationsPage() {
  return (
    <AdminShell
      eyebrow="Artist Network"
      title="Hồ sơ nghệ sĩ"
      subtitle="Duyệt nghệ sĩ, quản lý trạng thái phát hành và giữ chất lượng nội dung trên nền tảng."
    >
      <AdminArtistApplicationsPageView />
    </AdminShell>
  )
}

export default AdminArtistApplicationsPage
