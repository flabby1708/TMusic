import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Button,
  Card,
  Input,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from 'antd'
import {
  fetchAdminUsers,
  updateAdminUserStatus,
  updateAdminUserSubscription,
} from '../adminUsersClient.js'

const { Title, Text } = Typography

const accountStatusColor = {
  active: 'green',
  suspended: 'red',
  deleted: 'default',
}

const roleColor = {
  user: 'blue',
  artist: 'purple',
  admin: 'gold',
}

const artistStatusColor = {
  none: 'default',
  pending: 'orange',
  approved: 'green',
  rejected: 'red',
  suspended: 'red',
}

const rolePageName = {
  user: 'Người dùng',
  artist: 'Nghệ sĩ',
  admin: 'Quản trị viên',
}

function AdminUsersPageView({
  roleFilter = '',
  heading = 'Danh sách tài khoản',
  description = 'Tìm kiếm, khóa/mở khóa tài khoản và cập nhật gói nghe nhạc.',
  searchPlaceholder = 'Tìm theo tên, email hoặc số điện thoại',
}) {
  const [items, setItems] = useState([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const loadUsers = useCallback(async (nextQuery = '') => {
    setLoading(true)
    setError('')

    try {
      const payload = await fetchAdminUsers({
        query: nextQuery,
        role: roleFilter,
      })
      setItems(payload.items || [])
    } catch (loadError) {
      setError(loadError.message || 'Không tải được danh sách tài khoản.')
    } finally {
      setLoading(false)
    }
  }, [roleFilter])

  useEffect(() => {
    setQuery('')
    void loadUsers('')
  }, [loadUsers])

  const handleSearch = () => {
    void loadUsers(query)
  }

  const handleToggleStatus = useCallback(async (user) => {
    const nextStatus = user.accountStatus === 'suspended' ? 'active' : 'suspended'
    let suspendedReason = ''

    if (nextStatus === 'suspended') {
      const promptValue = window.prompt(
        'Nhập lý do khóa tài khoản:',
        'Vi phạm chính sách nền tảng',
      )

      if (promptValue === null) {
        return
      }

      suspendedReason = promptValue.trim()

      if (!suspendedReason) {
        message.warning('Đã hủy thao tác vì chưa nhập lý do khóa tài khoản.')
        return
      }
    }

    try {
      await updateAdminUserStatus(user._id, {
        accountStatus: nextStatus,
        suspendedReason,
      })

      message.success(
        nextStatus === 'suspended'
          ? 'Đã khóa tài khoản.'
          : 'Đã mở khóa tài khoản.',
      )

      await loadUsers(query)
    } catch (statusError) {
      message.error(statusError.message || 'Cập nhật trạng thái thất bại.')
    }
  }, [loadUsers, query])

  const handleSubscriptionChange = useCallback(async (user, plan) => {
    const isPremium = plan === 'premium'

    try {
      await updateAdminUserSubscription(user._id, {
        plan,
        status: isPremium ? 'active' : 'inactive',
        provider: isPremium ? 'manual' : '',
        premiumExpiresAt: isPremium ? '2026-12-31T23:59:59.000Z' : null,
      })

      message.success('Đã cập nhật gói người dùng.')
      await loadUsers(query)
    } catch (subscriptionError) {
      message.error(subscriptionError.message || 'Cập nhật gói thất bại.')
    }
  }, [loadUsers, query])

  const columns = useMemo(
    () => [
      {
        title: roleFilter ? rolePageName[roleFilter] || 'Tài khoản' : 'Người dùng',
        dataIndex: 'displayName',
        key: 'displayName',
        render: (_, item) => (
          <div>
            <strong>{item.displayName || 'Chưa có tên'}</strong>
            <br />
            <Text type="secondary">{item.email}</Text>
            {item.role === 'artist' && item.artistProfile?.stageName ? (
              <>
                <br />
                <Text type="secondary">Nghệ danh: {item.artistProfile.stageName}</Text>
              </>
            ) : null}
          </div>
        ),
      },
      !roleFilter && {
        title: 'Vai trò',
        dataIndex: 'role',
        key: 'role',
        render: (role) => <Tag color={roleColor[role] || 'default'}>{role}</Tag>,
      },
      (!roleFilter || roleFilter === 'artist') && {
        title: 'Nghệ sĩ',
        dataIndex: 'artistStatus',
        key: 'artistStatus',
        render: (artistStatus) => (
          <Tag color={artistStatusColor[artistStatus] || 'default'}>
            {artistStatus || 'none'}
          </Tag>
        ),
      },
      {
        title: 'Tài khoản',
        dataIndex: 'accountStatus',
        key: 'accountStatus',
        render: (accountStatus) => (
          <Tag color={accountStatusColor[accountStatus] || 'default'}>
            {accountStatus || 'active'}
          </Tag>
        ),
      },
      roleFilter !== 'admin' && {
        title: 'Gói',
        dataIndex: ['subscription', 'plan'],
        key: 'subscription',
        render: (_, item) => (
          <Select
            value={item.subscription?.plan || 'free'}
            style={{ width: 130 }}
            onChange={(plan) => handleSubscriptionChange(item, plan)}
            options={[
              { value: 'free', label: 'Free' },
              { value: 'premium', label: 'Premium' },
            ]}
          />
        ),
      },
      {
        title: 'Ngày tạo',
        dataIndex: 'createdAt',
        key: 'createdAt',
        render: (value) => (value ? new Date(value).toLocaleDateString('vi-VN') : '-'),
      },
      {
        title: 'Hành động',
        key: 'actions',
        render: (_, item) => (
          <Button
            danger={item.accountStatus !== 'suspended'}
            onClick={() => handleToggleStatus(item)}
          >
            {item.accountStatus === 'suspended' ? 'Mở khóa' : 'Khóa'}
          </Button>
        ),
      },
    ].filter(Boolean),
    [handleSubscriptionChange, handleToggleStatus, roleFilter],
  )

  return (
    <Card
      bordered={false}
      style={{
        borderRadius: 32,
        background: 'rgba(255, 255, 255, 0.96)',
        boxShadow: '0 24px 80px rgba(0, 0, 0, 0.28)',
        overflow: 'hidden',
      }}
      styles={{
        body: {
          padding: 0,
        },
      }}
    >
      <div
        style={{
          padding: '32px 32px',
          borderBottom: '1px solid rgba(15, 23, 42, 0.08)',
          background:
            'linear-gradient(135deg, rgba(255,107,87,0.14), rgba(41,212,255,0.08), rgba(255,255,255,0.74))',
        }}
      >
        <Space direction="vertical" size={4}>
          <Title level={4} style={{ margin: 0 }}>
            {heading}
          </Title>
          <Text type="secondary">
            {description}
          </Text>
        </Space>
      </div>

      <div style={{ padding: 30 }}>
        <Space direction="vertical" size={22} style={{ width: '100%' }}>
          <Space.Compact style={{ width: '100%' }}>
            <Input
              placeholder={searchPlaceholder}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onPressEnter={handleSearch}
              size="large"
            />
            <Button type="primary" size="large" onClick={handleSearch}>
              Tìm kiếm
            </Button>
          </Space.Compact>

          {error ? <Alert type="error" message={error} showIcon /> : null}

          <Table
            rowKey="_id"
            loading={loading}
            columns={columns}
            dataSource={items}
            pagination={{ pageSize: 10 }}
          />
        </Space>
      </div>
    </Card>
  )
}

export default AdminUsersPageView
