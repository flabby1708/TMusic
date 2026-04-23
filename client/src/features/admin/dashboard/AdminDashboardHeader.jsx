import { Avatar, Layout, Menu, theme } from 'antd'
import { ADMIN_HEADER_HEIGHT, getAdminDisplayName, headerItems } from './adminDashboardTheme'

const { Header } = Layout

function AdminDashboardHeader({ user, onMenuClick }) {
  const {
    token: { colorBorderSecondary, colorTextSecondary },
  } = theme.useToken()

  return (
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
          <div style={{ fontSize: 18, fontWeight: 800, whiteSpace: 'nowrap' }}>Bảng quản trị</div>
        </div>
      </div>

      <Menu
        theme="dark"
        mode="horizontal"
        selectedKeys={['dashboard']}
        items={headerItems}
        onClick={onMenuClick}
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
  )
}

export default AdminDashboardHeader
