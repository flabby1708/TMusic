import { Avatar, Button, ConfigProvider, Layout, Menu, Space, Typography } from 'antd'
import {
  CustomerServiceOutlined,
  FileProtectOutlined,
  LogoutOutlined,
  SoundOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { useLocation, useNavigate } from 'react-router-dom'
import { appPaths } from '../../../app/routes/paths.js'
import themeConfig from '../../../themeConfig.js'
import { adminTheme } from '../dashboard/adminDashboardTheme.jsx'
import { useAdminSession } from '../useAdminSession.js'

const { Content, Header, Sider } = Layout
const { Text, Title } = Typography
const { colors } = themeConfig

const renderAdminMenuLabel = ({ title, description }) => (
  <span className="tmusic-admin-shell-menu-label">
    <span className="tmusic-admin-shell-menu-title">{title}</span>
    <span className="tmusic-admin-shell-menu-description">{description}</span>
  </span>
)

const adminMenuItems = [
  {
    key: appPaths.admin.songs,
    icon: <SoundOutlined />,
    label: renderAdminMenuLabel({
      title: 'Bài hát',
      description: 'Catalog nhạc',
    }),
  },
  {
    key: appPaths.admin.podcasts,
    icon: <CustomerServiceOutlined />,
    label: renderAdminMenuLabel({
      title: 'Podcast',
      description: 'Show và tập',
    }),
  },
  { type: 'divider' },
  {
    key: appPaths.admin.users,
    icon: <UserOutlined />,
    label: renderAdminMenuLabel({
      title: 'Người dùng',
      description: 'Tài khoản nghe nhạc',
    }),
  },
  {
    key: appPaths.admin.artistAccounts,
    icon: <TeamOutlined />,
    label: renderAdminMenuLabel({
      title: 'Nghệ sĩ',
      description: 'Tài khoản nghệ sĩ',
    }),
  },
  {
    key: appPaths.admin.admins,
    icon: <FileProtectOutlined />,
    label: renderAdminMenuLabel({
      title: 'Admin',
      description: 'Quyền quản trị',
    }),
  },
  {
    key: appPaths.admin.artistApplications,
    icon: <TeamOutlined />,
    label: 'Hồ sơ nghệ sĩ',
  },
  {
    key: '/admin/artist-songs',
    icon: <SoundOutlined />,
    label: 'Bài hát chờ duyệt',
    disabled: true,
  },
  {
    key: '/admin/contracts',
    icon: <FileProtectOutlined />,
    label: 'Hợp đồng',
    disabled: true,
  },
]

const getSelectedKey = (pathname) =>
  adminMenuItems.find(
    (item) =>
      item?.key &&
      pathname.startsWith(item.key),
  )?.key || appPaths.admin.songs

function AdminShell({
  children,
  eyebrow = 'TMusic Control',
  title = 'Admin Studio',
  subtitle = 'Quản lý hệ sinh thái âm nhạc TMusic.',
}) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAdminSession()
  const selectedKey = getSelectedKey(location.pathname)
  const displayName = user?.displayName || user?.email || 'Admin'

  const handleLogout = () => {
    logout()
    window.location.assign(appPaths.admin.login)
  }

  return (
    <ConfigProvider theme={adminTheme}>
      <Layout
        className="tmusic-admin-shell"
        style={{
          height: '100vh',
          minHeight: '100vh',
          overflow: 'hidden',
          background: colors.backgroundPrimary,
        }}
      >
      <Sider
        width={300}
        theme="dark"
        style={{
          background: colors.backgroundSecondary,
          borderRight: `1px solid ${colors.dividerSubtle}`,
          boxShadow: 'none',
          position: 'sticky',
          top: 0,
          height: '100vh',
          flex: '0 0 300px',
          overflow: 'auto',
        }}
      >
        <div
          style={{
            padding: '28px 24px 24px',
            borderBottom: `1px solid ${colors.dividerSubtle}`,
            background: colors.backgroundSecondary,
          }}
        >
          <Space align="center" size={14}>
            <div
              style={{
                width: 54,
                height: 54,
                borderRadius: '50%',
                display: 'grid',
                placeItems: 'center',
                background: colors.primaryAccent,
                boxShadow: 'none',
              }}
            >
              <CustomerServiceOutlined style={{ color: colors.textInverse, fontSize: 26 }} />
            </div>
            <div style={{ minWidth: 0 }}>
              <Title level={3} style={{ color: '#fff', margin: 0, lineHeight: 1.05 }}>
                TMusic
              </Title>
              <Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13 }}>
                Admin Studio
              </Text>
            </div>
          </Space>
        </div>

        <div style={{ padding: '22px 16px' }}>
          <Menu
            className="tmusic-admin-shell-menu"
            theme="dark"
            mode="inline"
            selectedKeys={[selectedKey]}
            items={adminMenuItems}
            onClick={({ key }) => navigate(key)}
            style={{
              borderInlineEnd: 0,
              background: 'transparent',
            }}
          />
        </div>
      </Sider>

      <Layout
        style={{
          minWidth: 0,
          height: '100vh',
          overflow: 'hidden',
          background: 'transparent',
        }}
      >
        <Header
          style={{
            flex: '0 0 auto',
            minHeight: 92,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 18,
            padding: '18px 34px',
            background: colors.backgroundPrimary,
            borderBottom: `1px solid ${colors.dividerSubtle}`,
            backdropFilter: 'blur(18px)',
            position: 'sticky',
            top: 0,
            zIndex: 10,
            lineHeight: 1.2,
          }}
        >
          <div style={{ minWidth: 0 }}>
            <Text
              style={{
                color: colors.primaryAccent,
                display: 'block',
                fontSize: 12,
                fontWeight: 800,
                marginBottom: 6,
                textTransform: 'uppercase',
              }}
            >
              {eyebrow}
            </Text>
            <Title level={2} style={{ color: '#fff', margin: 0, lineHeight: 1.12 }}>
              {title}
            </Title>
            <Text
              style={{
                color: 'rgba(255,255,255,0.58)',
                display: 'block',
                marginTop: 7,
                lineHeight: 1.45,
              }}
            >
              {subtitle}
            </Text>
          </div>

          <Space size={12}>
            <Avatar
              size={42}
              style={{
                background: colors.primaryAccent,
                color: colors.textInverse,
                fontWeight: 900,
              }}
            >
              {displayName.slice(0, 1).toUpperCase()}
            </Avatar>
            <Button
              className="tmusic-admin-logout-button"
              icon={<LogoutOutlined />}
              onClick={handleLogout}
            >
              Đăng xuất
            </Button>
          </Space>
        </Header>

        <Content
          style={{
            minHeight: 0,
            padding: 32,
            overflowY: 'auto',
            overflowX: 'hidden',
            overscrollBehavior: 'contain',
            background: colors.backgroundPrimary,
          }}
        >
          {children}
        </Content>
      </Layout>
      </Layout>
    </ConfigProvider>
  )
}

export default AdminShell
