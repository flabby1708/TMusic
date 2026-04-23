import { useEffect } from 'react'
import { ConfigProvider } from 'antd'
import { appPaths } from '../app/routes/paths.js'
import AdminDashboardLayout from '../features/admin/dashboard/AdminDashboardLayout.jsx'
import AdminDashboardLoadingState from '../features/admin/dashboard/AdminDashboardLoadingState.jsx'
import { adminTheme } from '../features/admin/dashboard/adminDashboardTheme'
import { useAdminDashboard } from '../features/admin/useAdminDashboard'
import { useAdminSession } from '../features/admin/useAdminSession'

function AdminDashboardPage() {
  const { user, loading: sessionLoading, isAuthenticated, logout } = useAdminSession()
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
    setActiveResource,
    uploadingField,
  } = useAdminDashboard({ enabled: adminReady })

  useEffect(() => {
    if (!sessionLoading && !isAuthenticated) {
      window.location.replace('/admin/login')
    }
  }, [isAuthenticated, sessionLoading])

  const handleLogout = () => {
    logout()
    window.location.assign('/admin/login')
  }

  const handleHeaderMenuClick = ({ key }) => {
    if (key === 'home') {
      window.location.assign('/')
      return
    }

    if (key === 'logout') {
      handleLogout()
    }
  }

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
    <ConfigProvider theme={adminTheme}>
      <AdminDashboardLayout
        user={user}
        activeResource={activeResource}
        currentResource={currentResource}
        editingId={editingId}
        error={error}
        formValues={formValues}
        handleChange={handleChange}
        handleDelete={handleDelete}
        handleEdit={handleEdit}
        handleHeaderMenuClick={handleHeaderMenuClick}
        handleAssetUpload={handleAssetUpload}
        handleReset={handleReset}
        handleSubmit={handleSubmit}
        items={items}
        loading={loading}
        notice={notice}
        onOpenSongImport={handleOpenSongImport}
        reloadActiveResource={reloadActiveResource}
        saving={saving}
        setActiveResource={setActiveResource}
        uploadingField={uploadingField}
      />
    </ConfigProvider>
  )
}

export default AdminDashboardPage
