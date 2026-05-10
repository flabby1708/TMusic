import { useEffect } from 'react'
import { ConfigProvider } from 'antd'
import { appPaths } from '../../../app/routes/paths.js'
import AdminDashboardEditorPanel from '../../../features/admin/dashboard/AdminDashboardEditorPanel.jsx'
import AdminDashboardLoadingState from '../../../features/admin/dashboard/AdminDashboardLoadingState.jsx'
import AdminDashboardResourcePanel from '../../../features/admin/dashboard/AdminDashboardResourcePanel.jsx'
import { adminTheme } from '../../../features/admin/dashboard/adminDashboardTheme'
import AdminShell from '../../../features/admin/layout/AdminShell.jsx'
import { useAdminDashboard } from '../../../features/admin/useAdminDashboard'
import { useAdminSession } from '../../../features/admin/useAdminSession'

function AdminDashboardPage() {
  const { loading: sessionLoading, isAuthenticated } = useAdminSession()
  const adminReady = !sessionLoading && isAuthenticated
  const {
    activeResource,
    currentResource,
    editingId,
    error,
    formValues,
    handleChange,
    handleDelete,
    handleEdit,
    handleAssetUpload,
    handleReset,
    handleSubmit,
    items,
    loading,
    notice,
    reloadActiveResource,
    saving,
    uploadingField,
  } = useAdminDashboard({ enabled: adminReady })

  useEffect(() => {
    if (!sessionLoading && !isAuthenticated) {
      window.location.replace('/admin/login')
    }
  }, [isAuthenticated, sessionLoading])

  const handleOpenSongImport = () => {
    window.location.assign(appPaths.admin.importSongs)
  }

  if (sessionLoading) {
    return (
      <ConfigProvider theme={adminTheme}>
        <AdminDashboardLoadingState />
      </ConfigProvider>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <AdminShell
      eyebrow="Library Ops"
      title="Tổng quan nội dung"
      subtitle="Quản lý bài hát, album, nghệ sĩ và những khu vực nội dung chính của TMusic."
    >
      <ConfigProvider theme={adminTheme}>
        <div
          style={{
            borderRadius: 32,
            padding: 26,
            background:
              'linear-gradient(180deg, rgba(255, 255, 255, 0.055), rgba(255, 255, 255, 0.028))',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 24px 80px rgba(0, 0, 0, 0.26)',
          }}
        >
          <div className="grid items-start gap-6 2xl:grid-cols-[minmax(0,1fr)_minmax(360px,440px)]">
            <AdminDashboardResourcePanel
              activeResource={activeResource}
              currentResource={currentResource}
              editingId={editingId}
              error={error}
              items={items}
              loading={loading}
              onCreateNew={handleReset}
              onDelete={handleDelete}
              onEdit={handleEdit}
              onOpenSongImport={handleOpenSongImport}
              onReload={reloadActiveResource}
              saving={saving}
            />

            <AdminDashboardEditorPanel
              currentResource={currentResource}
              editingId={editingId}
              formValues={formValues}
              handleAssetUpload={handleAssetUpload}
              handleChange={handleChange}
              handleReset={handleReset}
              handleSubmit={handleSubmit}
              notice={notice}
              saving={saving}
              uploadingField={uploadingField}
            />
          </div>
        </div>
      </ConfigProvider>
    </AdminShell>
  )
}

export default AdminDashboardPage
