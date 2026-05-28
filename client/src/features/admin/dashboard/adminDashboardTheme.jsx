import { theme } from 'antd'
import {
  BarChartOutlined,
  HomeOutlined,
  LogoutOutlined,
  NotificationOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons'
import themeConfig from '../../../themeConfig.js'
import { resourceDefinitions } from '../adminConfig.js'

const { colors, radii, shadows } = themeConfig

export const ADMIN_HEADER_HEIGHT = 88

export const headerItems = [
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
      { key: 'podcasts', label: resourceDefinitions.podcasts.label },
      { key: 'albums', label: resourceDefinitions.albums.label },
    ],
  },
  {
    key: 'accounts',
    icon: <UserOutlined />,
    label: 'Tài khoản',
    children: [
      { key: 'users', label: 'Người dùng' },
      {
        key: 'artist-accounts',
        icon: <TeamOutlined />,
        label: 'Nghệ sĩ',
      },
      { key: 'admins', label: 'Admin' },
    ],
  },
  {
    key: 'sub2',
    icon: <TeamOutlined />,
    label: 'Nghệ sĩ và kênh',
    children: [
      {
        key: 'artist-applications',
        icon: <TeamOutlined />,
        label: 'Hồ sơ nghệ sĩ',
      },
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
    colorPrimary: colors.primaryAccentHex,
    colorInfo: colors.primaryAccentHex,
    colorError: colors.error,
    colorWarning: colors.warning,
    borderRadius: Number.parseInt(radii.card, 10),
    borderRadiusLG: Number.parseInt(radii.badge, 10),
    colorBgBase: colors.backgroundPrimary,
    colorBgContainer: colors.backgroundSecondary,
    colorBgElevated: colors.backgroundTertiary,
    colorText: colors.textPrimary,
    colorTextSecondary: colors.textSecondary,
    colorTextTertiary: colors.textTertiary,
    colorBorderSecondary: colors.dividerSubtle,
  },
  components: {
    Layout: {
      bodyBg: 'transparent',
      headerBg: colors.backgroundPrimary,
      siderBg: colors.backgroundSecondary,
      triggerBg: colors.backgroundSecondary,
    },
    Menu: {
      darkItemBg: 'transparent',
      darkSubMenuItemBg: 'transparent',
      itemBorderRadius: Number.parseInt(radii.card, 10),
      subMenuItemBorderRadius: Number.parseInt(radii.card, 10),
      itemSelectedBg: 'oklch(78.5% 0.115 274.713 / 0.15)',
      itemSelectedColor: colors.textPrimary,
      itemColor: colors.textSecondary,
    },
    Button: {
      borderRadius: Number.parseInt(radii.pill, 10),
      controlHeight: 48,
    },
  },
}

export const shellStyles = {
  minHeight: '100vh',
  background: colors.backgroundPrimary,
}

export const panelStyle = (token) => ({
  background: token.colorBgContainer,
  border: `1px solid ${token.colorBorderSecondary}`,
  borderRadius: token.borderRadiusLG,
  boxShadow: shadows.raised,
})

export const fieldLabelStyle = {
  display: 'block',
  marginBottom: 8,
  fontSize: 13,
  fontWeight: 700,
  color: colors.textSecondary,
}

export const inputStyle = {
  borderRadius: Number.parseInt(radii.card, 10),
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
