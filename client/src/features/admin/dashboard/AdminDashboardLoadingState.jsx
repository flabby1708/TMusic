import { Layout, Spin, Typography } from 'antd'
import { panelStyle, shellStyles } from './adminDashboardTheme'

const { Text, Title } = Typography

function AdminDashboardLoadingState() {
  return (
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
  )
}

export default AdminDashboardLoadingState
