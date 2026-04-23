import { Layout, Menu, Typography, theme } from 'antd'
import { ADMIN_HEADER_HEIGHT, resourceMenuItems } from './adminDashboardTheme'

const { Sider } = Layout
const { Text, Title } = Typography

function AdminDashboardSidebar({ activeResource, currentResource, onSelectResource }) {
  const {
    token: { colorBorderSecondary, colorTextSecondary },
  } = theme.useToken()

  return (
    <Sider
      width={300}
      style={{
        background: 'rgba(255, 255, 255, 0.04)',
        borderRight: `1px solid ${colorBorderSecondary}`,
        minHeight: `calc(100vh - ${ADMIN_HEADER_HEIGHT}px)`,
        backdropFilter: 'blur(14px)',
      }}
    >
      <div
        style={{
          padding: '28px 24px 22px',
          borderBottom: `1px solid ${colorBorderSecondary}`,
          background:
            'linear-gradient(180deg, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.01))',
        }}
      >
        <Text
          style={{
            color: colorTextSecondary,
            display: 'block',
            marginBottom: 10,
            fontSize: 13,
          }}
        >
          Chọn nhóm dữ liệu để quản trị
        </Text>
        <Title level={4} style={{ margin: 0 }}>
          {currentResource.label}
        </Title>
      </div>

      <div style={{ padding: 14 }}>
        <Menu
          mode="inline"
          theme="dark"
          selectedKeys={[activeResource]}
          defaultOpenKeys={['sub1', 'sub2', 'sub3']}
          style={{
            borderInlineEnd: 0,
            background: 'transparent',
            paddingInline: 6,
          }}
          items={resourceMenuItems}
          onClick={({ key }) => onSelectResource(String(key))}
        />
      </div>
    </Sider>
  )
}

export default AdminDashboardSidebar
