import { Avatar, Button, Layout, Menu, Space, Typography } from 'antd'
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
import { useAdminSession } from '../useAdminSession.js'

const { Content, Header, Sider } = Layout
const { Text, Title } = Typography

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
    <Layout
      className="tmusic-admin-shell"
      style={{
        height: '100vh',
        minHeight: '100vh',
        overflow: 'hidden',
        background:
          'radial-gradient(circle at 8% 0%, rgba(255, 107, 87, 0.2), transparent 34%), radial-gradient(circle at 92% 12%, rgba(41, 212, 255, 0.16), transparent 32%), linear-gradient(145deg, #0d1525 0%, #08111d 46%, #060b16 100%)',
      }}
    >
      <Sider
        width={300}
        theme="dark"
        style={{
          background:
            'linear-gradient(180deg, rgba(15, 24, 40, 0.96) 0%, rgba(8, 17, 29, 0.98) 48%, rgba(6, 11, 22, 0.98) 100%)',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '18px 0 50px rgba(0, 0, 0, 0.24)',
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
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            background:
              'radial-gradient(circle at 18% 8%, rgba(255, 107, 87, 0.1), transparent 36%), radial-gradient(circle at 82% 22%, rgba(41, 212, 255, 0.1), transparent 34%)',
          }}
        >
          <Space align="center" size={14}>
            <div
              style={{
                width: 54,
                height: 54,
                borderRadius: 18,
                display: 'grid',
                placeItems: 'center',
                background: 'linear-gradient(135deg, #ff6b57 0%, #29d4ff 100%)',
                boxShadow: '0 18px 44px rgba(255, 107, 87, 0.22)',
              }}
            >
              <CustomerServiceOutlined style={{ color: '#08101a', fontSize: 26 }} />
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
            background:
              'linear-gradient(90deg, rgba(13, 21, 37, 0.94) 0%, rgba(8, 17, 29, 0.88) 62%, rgba(15, 24, 40, 0.92) 100%)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
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
                color: '#29d4ff',
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
                background: 'linear-gradient(135deg, #ff6b57 0%, #29d4ff 100%)',
                color: '#08101a',
                fontWeight: 900,
              }}
            >
              {displayName.slice(0, 1).toUpperCase()}
            </Avatar>
            <Button icon={<LogoutOutlined />} ghost onClick={handleLogout}>
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
            background:
              'radial-gradient(circle at 0% 0%, rgba(255, 107, 87, 0.06), transparent 28%), radial-gradient(circle at 100% 0%, rgba(41, 212, 255, 0.06), transparent 28%)',
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  )
}

export default AdminShell
