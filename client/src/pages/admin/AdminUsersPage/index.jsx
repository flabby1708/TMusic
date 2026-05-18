import AdminUsersPageView from '../../../features/admin/pages/AdminUsersPageView.jsx'
import AdminShell from '../../../features/admin/layout/AdminShell.jsx'

function AdminUsersPage() {
  return (
    <AdminShell
      eyebrow="Audience"
      title="Quản lý người dùng"
      subtitle="Theo dõi tài khoản, trạng thái nghe nhạc và gói Premium của người dùng TMusic."
    >
      <AdminUsersPageView
        roleFilter="user"
        heading="Danh sách người dùng"
        description="Tìm kiếm, khóa/mở khóa tài khoản người nghe và cập nhật gói nghe nhạc."
        searchPlaceholder="Tìm người dùng theo tên, email hoặc số điện thoại"
      />
    </AdminShell>
  )
}

export default AdminUsersPage
