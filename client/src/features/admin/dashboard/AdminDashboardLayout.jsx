import { Breadcrumb, Layout, theme } from 'antd'
import AdminDashboardEditorPanel from './AdminDashboardEditorPanel.jsx'
import AdminDashboardHeader from './AdminDashboardHeader.jsx'
import AdminDashboardResourcePanel from './AdminDashboardResourcePanel.jsx'
import AdminDashboardSidebar from './AdminDashboardSidebar.jsx'
import { panelStyle, shellStyles } from './adminDashboardTheme'

const { Content } = Layout

function AdminDashboardLayout(props) {
  const {
    user,
    activeResource,
    currentResource,
    editingId,
    error,
    formValues,
    handleChange,
    handleDelete,
    handleEdit,
    handleHeaderMenuClick,
    handleAssetUpload,
    handleReset,
    handleSubmit,
    items,
    loading,
    notice,
    onOpenSongImport,
    reloadActiveResource,
    saving,
    setActiveResource,
    uploadingField,
  } = props
  const {
    token: { colorBgContainer, borderRadiusLG, colorBorderSecondary, colorTextSecondary },
  } = theme.useToken()

  return (
    <Layout style={shellStyles}>
      <AdminDashboardHeader user={user} onMenuClick={handleHeaderMenuClick} />

      <Layout style={{ background: 'transparent' }}>
        <AdminDashboardSidebar
          activeResource={activeResource}
          currentResource={currentResource}
          onSelectResource={setActiveResource}
        />

        <Layout style={{ padding: '0 24px 24px', background: 'transparent' }}>
          <Breadcrumb
            items={[
              { title: 'Trang chủ' },
              { title: 'Quản trị' },
              { title: currentResource.label },
            ]}
            style={{ margin: '20px 0 18px', color: colorTextSecondary }}
          />

          <Content
            style={{
              ...panelStyle({
                colorBgContainer,
                colorBorderSecondary,
                borderRadiusLG,
              }),
              padding: 24,
              margin: 0,
              minHeight: 280,
              background:
                'linear-gradient(180deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.015))',
            }}
          >
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_400px]">
              <AdminDashboardResourcePanel
                activeResource={activeResource}
                currentResource={currentResource}
                editingId={editingId}
                error={error}
                items={items}
                loading={loading}
                onOpenSongImport={onOpenSongImport}
                onCreateNew={handleReset}
                onDelete={handleDelete}
                onEdit={handleEdit}
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
          </Content>
        </Layout>
      </Layout>
    </Layout>
  )
}

export default AdminDashboardLayout
