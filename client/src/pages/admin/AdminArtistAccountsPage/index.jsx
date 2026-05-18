import AdminUsersPageView from '../../../features/admin/pages/AdminUsersPageView.jsx'
import AdminShell from '../../../features/admin/layout/AdminShell.jsx'

function AdminArtistAccountsPage() {
  return (
    <AdminShell
      eyebrow="Artist Network"
      title="Tài khoản nghệ sĩ"
      subtitle="Theo dõi tài khoản nghệ sĩ, trạng thái hồ sơ và quyền truy cập cổng phát hành."
    >
      <AdminUsersPageView
        roleFilter="artist"
        heading="Danh sách tài khoản nghệ sĩ"
        description="Tìm kiếm, khóa/mở khóa tài khoản nghệ sĩ và cập nhật gói nghe nhạc khi cần."
        searchPlaceholder="Tìm nghệ sĩ theo tên, nghệ danh, email hoặc số điện thoại"
      />
    </AdminShell>
  )
}

export default AdminArtistAccountsPage
