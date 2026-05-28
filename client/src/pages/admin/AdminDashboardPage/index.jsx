import { useEffect } from 'react'
import { ConfigProvider } from 'antd'
import AdminDashboardEditorPanel from '../../../features/admin/dashboard/AdminDashboardEditorPanel.jsx'
import AdminDashboardLoadingState from '../../../features/admin/dashboard/AdminDashboardLoadingState.jsx'
import AdminDashboardResourcePanel from '../../../features/admin/dashboard/AdminDashboardResourcePanel.jsx'
import { adminTheme } from '../../../features/admin/dashboard/adminDashboardTheme'
import AdminShell from '../../../features/admin/layout/AdminShell.jsx'
import { useAdminDashboard } from '../../../features/admin/useAdminDashboard'
import { useAdminSession } from '../../../features/admin/useAdminSession'

function AdminDashboardPage({ initialResource = 'songs' }) {
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
    handleApprove,
    handleArtistWikiImport,
    handleAssetUpload,
    handleReset,
    handleSubmit,
    items,
    loading,
    notice,
    reloadActiveResource,
    saving,
    uploadingField,
  } = useAdminDashboard({ enabled: adminReady, initialResource })

  useEffect(() => {
    if (!sessionLoading && !isAuthenticated) {
      window.location.replace('/admin/login')
    }
  }, [isAuthenticated, sessionLoading])

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

  const isPodcastResource = activeResource === 'podcasts'
  const isReviewOnlyResource = activeResource === 'songs' || activeResource === 'podcasts'
  const shellSubtitle = isReviewOnlyResource
    ? isPodcastResource
      ? 'Xem podcast nghệ sĩ gửi lên và duyệt để hiển thị ngoài client.'
      : 'Xem bài hát nghệ sĩ gửi lên và duyệt để hiển thị ngoài client.'
    : 'Quản lý dữ liệu thư viện và tài nguyên hiển thị.'

  return (
    <AdminShell
      eyebrow={isPodcastResource ? 'Podcast Ops' : 'Library Ops'}
      title={currentResource.label}
      subtitle={shellSubtitle}
    >
      <ConfigProvider theme={adminTheme}>
        <div
          style={{
            borderRadius: 14,
            padding: 26,
            background:
              'linear-gradient(180deg, rgba(255, 255, 255, 0.055), rgba(255, 255, 255, 0.028))',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 24px 80px rgba(0, 0, 0, 0.26)',
          }}
        >
          <div
            className={
              isReviewOnlyResource
                ? 'grid items-start gap-6'
                : 'grid items-start gap-6 2xl:grid-cols-[minmax(0,1fr)_minmax(360px,440px)]'
            }
          >
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
              onApprove={handleApprove}
              onReload={reloadActiveResource}
              saving={saving}
            />

            {isReviewOnlyResource ? null : (
              <AdminDashboardEditorPanel
                currentResource={currentResource}
                activeResource={activeResource}
                editingId={editingId}
                formValues={formValues}
                handleAssetUpload={handleAssetUpload}
                handleArtistWikiImport={handleArtistWikiImport}
                handleChange={handleChange}
                handleReset={handleReset}
                handleSubmit={handleSubmit}
                notice={notice}
                saving={saving}
                uploadingField={uploadingField}
              />
            )}
          </div>
        </div>
      </ConfigProvider>
    </AdminShell>
  )
}

export default AdminDashboardPage
