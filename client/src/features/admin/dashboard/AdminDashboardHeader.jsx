import { Avatar, Layout, Menu, theme } from 'antd'
import themeConfig from '../../../themeConfig.js'
import { ADMIN_HEADER_HEIGHT, getAdminDisplayName, headerItems } from './adminDashboardTheme'

const { Header } = Layout
const { colors } = themeConfig

function AdminDashboardHeader({ selectedKeys = [], user, onMenuClick }) {
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
            borderRadius: '50%',
            display: 'grid',
            placeItems: 'center',
            background: colors.primaryAccent,
            color: colors.textInverse,
            fontWeight: 700,
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
        selectedKeys={selectedKeys}
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
            background: 'oklch(78.5% 0.115 274.713 / 0.16)',
            color: colors.primaryAccent,
            fontWeight: 700,
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
