import { theme } from 'antd'
import {
  AppstoreOutlined,
  BarChartOutlined,
  HomeOutlined,
  LogoutOutlined,
  NotificationOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { resourceDefinitions } from '../adminConfig.js'

export const ADMIN_HEADER_HEIGHT = 88

export const headerItems = [
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

export const resourceMenuItems = [
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

export const adminTheme = {
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

export const shellStyles = {
  minHeight: '100vh',
  background:
    'radial-gradient(circle at top left, rgba(41, 212, 255, 0.12), transparent 24%), radial-gradient(circle at bottom right, rgba(255, 107, 87, 0.16), transparent 32%), linear-gradient(180deg, #08111d 0%, #050912 100%)',
}

export const panelStyle = (token) => ({
  background: token.colorBgContainer,
  border: `1px solid ${token.colorBorderSecondary}`,
  borderRadius: token.borderRadiusLG,
  boxShadow: '0 24px 60px rgba(0, 0, 0, 0.24)',
})

export const fieldLabelStyle = {
  display: 'block',
  marginBottom: 8,
  fontSize: 13,
  fontWeight: 700,
  color: '#aab8ce',
}

export const inputStyle = {
  borderRadius: 14,
}

export function getAdminDisplayName(user) {
  if (user?.displayName) {
    return user.displayName
  }

  if (user?.email) {
    return user.email.split('@')[0]
  }

  return 'Admin'
}

export const isUploadField = (field) => field.type === 'url' && Boolean(field.uploadAssetType)
