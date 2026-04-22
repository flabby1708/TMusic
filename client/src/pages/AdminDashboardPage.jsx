import { useEffect } from 'react'
import {
  Alert,
  Avatar,
  Breadcrumb,
  Button,
  ConfigProvider,
  Empty,
  Input,
  Layout,
  Menu,
  Spin,
  Tag,
  Typography,
  Upload,
  theme,
} from 'antd'
import {
  AppstoreOutlined,
  BarChartOutlined,
  DeleteOutlined,
  EditOutlined,
  HomeOutlined,
  LogoutOutlined,
  NotificationOutlined,
  PlusOutlined,
  ReloadOutlined,
  UploadOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { resourceDefinitions } from '../features/admin/adminConfig.js'
import { useAdminDashboard } from '../features/admin/useAdminDashboard.js'
import { useAdminSession } from '../features/admin/useAdminSession.js'

const { Header, Content, Sider } = Layout
const { Text, Title } = Typography
const { TextArea } = Input
const ADMIN_HEADER_HEIGHT = 88

const headerItems = [
  {
    key: 'dashboard',
    icon: <AppstoreOutlined />,
    label: 'Tổng quan',
  },
  {
    key: 'home',
    icon: <HomeOutlined />,
    label: 'Trang chủ',
  },
  {
    key: 'logout',
    icon: <LogoutOutlined />,
    label: 'Đăng xuất',
  },
]

const resourceMenuItems = [
  {
    key: 'sub1',
    icon: <NotificationOutlined />,
    label: 'Thư viện nội dung',
    children: [
      { key: 'songs', label: resourceDefinitions.songs.label },
      { key: 'albums', label: resourceDefinitions.albums.label },
    ],
  },
  {
    key: 'sub2',
    icon: <UserOutlined />,
    label: 'Nghệ sĩ và kênh',
    children: [
      { key: 'artists', label: resourceDefinitions.artists.label },
      { key: 'radios', label: resourceDefinitions.radios.label },
    ],
  },
  {
    key: 'sub3',
    icon: <BarChartOutlined />,
    label: 'Tổng hợp',
    children: [{ key: 'charts', label: resourceDefinitions.charts.label }],
  },
]

const adminTheme = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: '#ff6b57',
    colorInfo: '#29d4ff',
    borderRadius: 16,
    borderRadiusLG: 24,
    colorBgBase: '#070d17',
    colorBgContainer: '#101826',
    colorBgElevated: '#0c1320',
    colorText: '#f5f7fb',
    colorTextSecondary: '#aab8ce',
    colorBorderSecondary: 'rgba(123, 136, 157, 0.18)',
  },
  components: {
    Layout: {
      bodyBg: 'transparent',
      headerBg: 'rgba(8, 16, 28, 0.94)',
      siderBg: '#101826',
      triggerBg: '#101826',
    },
    Menu: {
      darkItemBg: 'transparent',
      darkSubMenuItemBg: 'transparent',
      itemBorderRadius: 14,
      subMenuItemBorderRadius: 12,
      itemSelectedBg: 'rgba(255, 107, 87, 0.18)',
      itemSelectedColor: '#ffffff',
      itemColor: '#aab8ce',
    },
    Button: {
      borderRadius: 14,
      controlHeight: 42,
    },
  },
}

const shellStyles = {
  minHeight: '100vh',
  background:
    'radial-gradient(circle at top left, rgba(41, 212, 255, 0.12), transparent 24%), radial-gradient(circle at bottom right, rgba(255, 107, 87, 0.16), transparent 32%), linear-gradient(180deg, #08111d 0%, #050912 100%)',
}

const panelStyle = (token) => ({
  background: token.colorBgContainer,
  border: `1px solid ${token.colorBorderSecondary}`,
  borderRadius: token.borderRadiusLG,
  boxShadow: '0 24px 60px rgba(0, 0, 0, 0.24)',
})

const fieldLabelStyle = {
  display: 'block',
  marginBottom: 8,
  fontSize: 13,
  fontWeight: 700,
  color: '#aab8ce',
}

const inputStyle = {
  borderRadius: 14,
}

const getAdminDisplayName = (user) => {
  if (user?.displayName) {
    return user.displayName
  }

  if (user?.email) {
    return user.email.split('@')[0]
  }

  return 'Admin'
}

const isImageUploadField = (field) =>
  field.type === 'url' && (field.name === 'coverUrl' || field.name === 'imageUrl')

function AdminContentLayout(props) {
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
    handleImageUpload,
    handleReset,
    handleSubmit,
    items,
    loading,
    notice,
    reloadActiveResource,
    saving,
    setActiveResource,
    uploadingField,
  } = props
  const {
    token: { colorBgContainer, borderRadiusLG, colorBorderSecondary, colorTextSecondary },
  } = theme.useToken()

  const createUploadRequest = (fieldName) => async ({ file, onError, onSuccess }) => {
    try {
      await handleImageUpload(fieldName, file)
      onSuccess?.({}, file)
    } catch (uploadError) {
      onError?.(uploadError)
    }
  }

  return (
    <Layout style={shellStyles}>
      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 20,
          height: ADMIN_HEADER_HEIGHT,
          lineHeight: 1,
          paddingInline: 24,
          paddingBlock: 14,
          borderBottom: `1px solid ${colorBorderSecondary}`,
          position: 'sticky',
          top: 0,
          zIndex: 10,
          backdropFilter: 'blur(16px)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            minWidth: 260,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            color: '#fff',
            lineHeight: 1.1,
          }}
        >
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 16,
              display: 'grid',
              placeItems: 'center',
              background: 'linear-gradient(180deg, #ff8a78 0%, #ff6b57 100%)',
              color: '#08101a',
              fontWeight: 900,
            }}
          >
            TM
          </div>
          <div style={{ display: 'grid', gap: 4 }}>
            <div
              style={{
                fontSize: 11,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: colorTextSecondary,
                whiteSpace: 'nowrap',
              }}
            >
              Trung tâm điều hành TMusic
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, whiteSpace: 'nowrap' }}>
              Bảng quản trị
            </div>
          </div>
        </div>

        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={['dashboard']}
          items={headerItems}
          onClick={handleHeaderMenuClick}
          style={{
            flex: 1,
            minWidth: 0,
            background: 'transparent',
            borderBottom: 'none',
            lineHeight: 'normal',
            alignSelf: 'stretch',
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, lineHeight: 1.15 }}>
          <Avatar
            size={42}
            style={{
              background: 'rgba(41, 212, 255, 0.16)',
              color: '#dff8ff',
              fontWeight: 800,
            }}
          >
            {getAdminDisplayName(user).slice(0, 2).toUpperCase()}
          </Avatar>
          <div style={{ minWidth: 0, display: 'grid', gap: 6 }}>
            <div
              style={{
                fontSize: 12,
                color: colorTextSecondary,
                whiteSpace: 'nowrap',
              }}
            >
              Đăng nhập với quyền quản trị
            </div>
            <div
              style={{
                maxWidth: 220,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                fontWeight: 700,
                fontSize: 15,
              }}
            >
              {user?.email}
            </div>
          </div>
        </div>
      </Header>

      <Layout style={{ background: 'transparent' }}>
        <Sider
          width={280}
          style={{
            background: colorBgContainer,
            borderRight: `1px solid ${colorBorderSecondary}`,
            minHeight: `calc(100vh - ${ADMIN_HEADER_HEIGHT}px)`,
          }}
        >
          <div style={{ padding: '28px 24px 20px' }}>
            <Text style={{ color: colorTextSecondary, display: 'block', marginBottom: 8 }}>
              Chọn nhóm dữ liệu để quản trị.
            </Text>
            <Title level={4} style={{ margin: 0 }}>
              {currentResource.label}
            </Title>
          </div>

          <Menu
            mode="inline"
            theme="dark"
            selectedKeys={[activeResource]}
            defaultOpenKeys={['sub1', 'sub2', 'sub3']}
            style={{
              height: '100%',
              borderInlineEnd: 0,
              background: 'transparent',
              paddingInline: 12,
              paddingBottom: 24,
            }}
            items={resourceMenuItems}
            onClick={({ key }) => setActiveResource(String(key))}
          />
        </Sider>

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
              padding: 30,
              margin: 0,
              minHeight: 280,
            }}
          >
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
              <section style={{ minWidth: 0 }}>
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                    marginBottom: 20,
                  }}
                >
                  <div>
                    <Text
                      style={{
                        color: colorTextSecondary,
                        textTransform: 'uppercase',
                        letterSpacing: '0.18em',
                        fontSize: 11,
                      }}
                    >
                      Trình duyệt dữ liệu
                    </Text>
                    <Title level={2} style={{ margin: '8px 0 0' }}>
                      {currentResource.label}
                    </Title>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    <Tag color="processing">{items.length} mục</Tag>
                    <Tag color="default">{editingId ? 'Đang sửa' : 'Sẵn sàng tạo mới'}</Tag>
                    <Button icon={<ReloadOutlined />} onClick={() => void reloadActiveResource()}>
                      Tải lại
                    </Button>
                  </div>
                </div>

                {error && !loading ? (
                  <Alert
                    type="error"
                    message={error}
                    showIcon
                    style={{ marginBottom: 16, borderRadius: 16 }}
                  />
                ) : null}

                {loading ? (
                  <div
                    style={{
                      minHeight: 380,
                      display: 'grid',
                      placeItems: 'center',
                      borderRadius: borderRadiusLG,
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: `1px solid ${colorBorderSecondary}`,
                    }}
                  >
                    <Spin size="large" tip="Đang tải dữ liệu..." />
                  </div>
                ) : items.length === 0 ? (
                  <div
                    style={{
                      minHeight: 380,
                      display: 'grid',
                      placeItems: 'center',
                      borderRadius: borderRadiusLG,
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: `1px solid ${colorBorderSecondary}`,
                    }}
                  >
                    <Empty description="Chưa có dữ liệu trong nhóm này" />
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
                    {items.map((item) => {
                      const previewImage = item[currentResource.imageField]
                      const title = item[currentResource.titleField]
                      const subtitle = item[currentResource.subtitleField]
                      const isEditing = item._id === editingId

                      return (
                        <article
                          key={item._id}
                          style={{
                            overflow: 'hidden',
                            borderRadius: 24,
                            border: `1px solid ${
                              isEditing ? 'rgba(41, 212, 255, 0.32)' : colorBorderSecondary
                            }`,
                            background: isEditing
                              ? 'rgba(41, 212, 255, 0.08)'
                              : 'rgba(255, 255, 255, 0.03)',
                          }}
                        >
                          {previewImage ? (
                            <img
                              src={previewImage}
                              alt={title}
                              style={{ width: '100%', height: 180, objectFit: 'cover' }}
                            />
                          ) : (
                            <div
                              style={{
                                height: 180,
                                display: 'grid',
                                placeItems: 'center',
                                background:
                                  'linear-gradient(135deg, rgba(255,107,87,0.16), rgba(41,212,255,0.12))',
                                fontWeight: 700,
                              }}
                            >
                              Chưa có ảnh
                            </div>
                          )}

                          <div style={{ padding: 18 }}>
                            <Title level={4} style={{ marginTop: 0, marginBottom: 8 }}>
                              {title}
                            </Title>
                            <Text
                              style={{
                                color: colorTextSecondary,
                                display: 'block',
                                minHeight: 44,
                                lineHeight: 1.6,
                              }}
                            >
                              {subtitle}
                            </Text>

                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
                              <Tag>ID {item._id.slice(-6)}</Tag>
                              <Tag color="default">Thứ tự {item.sortOrder ?? 0}</Tag>
                            </div>

                            <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
                              <Button
                                icon={<EditOutlined />}
                                onClick={() => handleEdit(item)}
                                style={{ flex: 1 }}
                              >
                                Sửa
                              </Button>
                              <Button
                                danger
                                type="primary"
                                icon={<DeleteOutlined />}
                                onClick={() => void handleDelete(item)}
                                disabled={saving}
                                style={{ flex: 1 }}
                              >
                                Xóa
                              </Button>
                            </div>
                          </div>
                        </article>
                      )
                    })}
                  </div>
                )}
              </section>

              <aside style={{ minWidth: 0 }}>
                <div
                  style={{
                    ...panelStyle({
                      colorBgContainer: 'rgba(255, 255, 255, 0.02)',
                      colorBorderSecondary,
                      borderRadiusLG,
                    }),
                    padding: 20,
                    height: '100%',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 12,
                      marginBottom: 20,
                    }}
                  >
                    <div>
                      <Text
                        style={{
                          color: colorTextSecondary,
                          textTransform: 'uppercase',
                          letterSpacing: '0.18em',
                          fontSize: 11,
                        }}
                      >
                        Trình chỉnh sửa
                      </Text>
                      <Title level={3} style={{ margin: '8px 0 0' }}>
                        {editingId ? 'Cập nhật mục đã chọn' : 'Thêm mới'}
                      </Title>
                    </div>

                    <Button icon={<PlusOutlined />} onClick={handleReset}>
                      Mới
                    </Button>
                  </div>

                  {notice ? (
                    <Alert
                      type="success"
                      message={notice}
                      showIcon
                      style={{ marginBottom: 16, borderRadius: 16 }}
                    />
                  ) : null}

                  <form className="space-y-4" onSubmit={handleSubmit}>
                    {currentResource.fields.map((field) => (
                      <div key={field.name} style={{ display: 'block' }}>
                        <span style={fieldLabelStyle}>
                          {field.label}
                          {field.required ? ' *' : ''}
                        </span>

                        {field.type === 'textarea' ? (
                          <TextArea
                            value={formValues[field.name]}
                            onChange={(event) => handleChange(field.name, event.target.value)}
                            rows={4}
                            style={inputStyle}
                          />
                        ) : isImageUploadField(field) ? (
                          <div style={{ display: 'grid', gap: 12 }}>
                            <Input
                              type={field.type}
                              value={formValues[field.name]}
                              onChange={(event) => handleChange(field.name, event.target.value)}
                              style={inputStyle}
                            />

                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                              <Upload
                                accept="image/*"
                                customRequest={createUploadRequest(field.name)}
                                showUploadList={false}
                                disabled={saving || Boolean(uploadingField)}
                              >
                                <Button
                                  icon={<UploadOutlined />}
                                  loading={uploadingField === field.name}
                                  disabled={saving || Boolean(uploadingField)}
                                >
                                  Tải ảnh lên Cloudinary
                                </Button>
                              </Upload>

                              {formValues[field.name] ? (
                                <Button
                                  htmlType="button"
                                  onClick={() =>
                                    window.open(
                                      formValues[field.name],
                                      '_blank',
                                      'noopener,noreferrer',
                                    )
                                  }
                                >
                                  Xem ảnh
                                </Button>
                              ) : null}
                            </div>

                            {formValues[field.name] ? (
                              <div
                                style={{
                                  overflow: 'hidden',
                                  borderRadius: 18,
                                  border: `1px solid ${colorBorderSecondary}`,
                                  background: 'rgba(255, 255, 255, 0.03)',
                                }}
                              >
                                <img
                                  src={formValues[field.name]}
                                  alt={field.label}
                                  style={{ width: '100%', height: 180, objectFit: 'cover' }}
                                />
                              </div>
                            ) : null}
                          </div>
                        ) : (
                          <Input
                            type={field.type}
                            value={formValues[field.name]}
                            onChange={(event) => handleChange(field.name, event.target.value)}
                            style={inputStyle}
                          />
                        )}

                        {field.helper ? (
                          <Text
                            style={{ color: colorTextSecondary, display: 'block', marginTop: 8 }}
                          >
                            {field.helper}
                          </Text>
                        ) : null}
                      </div>
                    ))}

                    <div style={{ display: 'flex', gap: 10, paddingTop: 8 }}>
                      <Button
                        type="primary"
                        htmlType="submit"
                        loading={saving}
                        style={{ flex: 1 }}
                      >
                        {editingId ? 'Cập nhật' : 'Tạo mới'}
                      </Button>
                      <Button htmlType="button" onClick={handleReset} style={{ flex: 1 }}>
                        Đặt lại
                      </Button>
                    </div>
                  </form>
                </div>
              </aside>
            </div>
          </Content>
        </Layout>
      </Layout>
    </Layout>
  )
}

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
    handleImageUpload,
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

  if (sessionLoading) {
    return (
      <ConfigProvider theme={adminTheme}>
        <Layout style={shellStyles}>
          <div
            style={{
              minHeight: '100vh',
              display: 'grid',
              placeItems: 'center',
              padding: 24,
            }}
          >
            <div
              style={{
                ...panelStyle({
                  colorBgContainer: '#101826',
                  colorBorderSecondary: 'rgba(123, 136, 157, 0.18)',
                  borderRadiusLG: 24,
                }),
                width: 'min(100%, 520px)',
                padding: 32,
                textAlign: 'center',
              }}
            >
              <Spin size="large" />
              <Title level={3} style={{ marginTop: 20, marginBottom: 8 }}>
                Đang kiểm tra phiên quản trị...
              </Title>
              <Text style={{ color: '#aab8ce' }}>
                Hệ thống đang xác thực token quản trị trước khi mở bảng điều khiển.
              </Text>
            </div>
          </div>
        </Layout>
      </ConfigProvider>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <ConfigProvider theme={adminTheme}>
      <AdminContentLayout
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
        handleImageUpload={handleImageUpload}
        handleReset={handleReset}
        handleSubmit={handleSubmit}
        items={items}
        loading={loading}
        notice={notice}
        reloadActiveResource={reloadActiveResource}
        saving={saving}
        setActiveResource={setActiveResource}
        uploadingField={uploadingField}
      />
    </ConfigProvider>
  )
}

export default AdminDashboardPage
