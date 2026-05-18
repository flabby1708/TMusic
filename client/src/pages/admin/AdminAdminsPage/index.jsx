import AdminUsersPageView from '../../../features/admin/pages/AdminUsersPageView.jsx'
import AdminShell from '../../../features/admin/layout/AdminShell.jsx'

function AdminAdminsPage() {
  return (
    <AdminShell
      eyebrow="Access Control"
      title="Quản lý admin"
      subtitle="Theo dõi tài khoản quản trị, trạng thái truy cập và lịch sử tạo tài khoản trong TMusic."
    >
      <AdminUsersPageView
        roleFilter="admin"
        heading="Danh sách quản trị viên"
        description="Tìm kiếm và khóa/mở khóa các tài khoản có quyền truy cập trang quản trị."
        searchPlaceholder="Tìm admin theo tên, email hoặc số điện thoại"
      />
    </AdminShell>
  )
}

export default AdminAdminsPage
