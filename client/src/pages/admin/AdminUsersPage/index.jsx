import AdminUsersPageView from '../../../features/admin/pages/AdminUsersPageView.jsx'
import AdminShell from '../../../features/admin/layout/AdminShell.jsx'

function AdminUsersPage() {
  return (
    <AdminShell
      eyebrow="Audience"
      title="Quản lý người dùng"
      subtitle="Theo dõi tài khoản, trạng thái nghe nhạc và gói Premium của người dùng TMusic."
    >
      <AdminUsersPageView />
    </AdminShell>
  )
}

export default AdminUsersPage
