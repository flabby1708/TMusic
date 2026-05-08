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
  CheckCircleOutlined,
  CloseCircleOutlined,
  ReloadOutlined,
  SearchOutlined,
  StopOutlined,
} from '@ant-design/icons'
import {
  approveArtistApplication,
  fetchArtistApplications,
  rejectArtistApplication,
  suspendArtistApplication,
} from '../adminArtistApplicationsClient.js'

const { Title, Text } = Typography

const artistStatusColor = {
  none: 'default',
  pending: 'orange',
  approved: 'green',
  rejected: 'red',
  suspended: 'volcano',
}

const accountStatusColor = {
  active: 'green',
  suspended: 'red',
  deleted: 'default',
}

const statusOptions = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'pending', label: 'Chờ duyệt' },
  { value: 'approved', label: 'Đã duyệt' },
  { value: 'rejected', label: 'Từ chối' },
  { value: 'suspended', label: 'Tạm khóa' },
]

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString('vi-VN') : '-'

const askRequiredReason = (label, defaultValue) => {
  const promptValue = window.prompt(label, defaultValue)

  if (promptValue === null) {
    return null
  }

  return promptValue.trim()
}

function AdminArtistApplicationsPageView() {
  const [items, setItems] = useState([])
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)
  const [actionId, setActionId] = useState('')
  const [error, setError] = useState('')

  const loadApplications = useCallback(async (filters) => {
    setLoading(true)
    setError('')

    try {
      const payload = await fetchArtistApplications(filters)
      setItems(payload.items || [])
    } catch (loadError) {
      setError(loadError.message || 'Không tải được danh sách hồ sơ nghệ sĩ.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadApplications({ query: '', status: '' })
  }, [loadApplications])

  const handleSearch = () => {
    void loadApplications({ query, status })
  }

  const handleStatusChange = (nextStatus) => {
    setStatus(nextStatus)
    void loadApplications({ query, status: nextStatus })
  }

  const runArtistAction = useCallback(async (item, action) => {
    setActionId(`${action}:${item._id}`)

    try {
      if (action === 'approve') {
        await approveArtistApplication(item._id, {
          adminNote: 'Hồ sơ hợp lệ, cho phép nghệ sĩ tham gia nền tảng.',
        })
        message.success('Đã duyệt hồ sơ nghệ sĩ.')
      }

      if (action === 'reject') {
        const rejectionReason = askRequiredReason(
          'Nhập lý do từ chối hồ sơ nghệ sĩ:',
          'Thông tin bản quyền chưa đầy đủ.',
        )

        if (rejectionReason === null) {
          return
        }

        if (!rejectionReason) {
          message.warning('Đã hủy thao tác vì chưa nhập lý do từ chối.')
          return
        }

        await rejectArtistApplication(item._id, {
          rejectionReason,
          adminNote: 'Yêu cầu nghệ sĩ cập nhật thêm thông tin.',
        })
        message.success('Đã từ chối hồ sơ nghệ sĩ.')
      }

      if (action === 'suspend') {
        const suspensionReason = askRequiredReason(
          'Nhập lý do tạm khóa tư cách nghệ sĩ:',
          'Có vấn đề cần admin xác minh thêm.',
        )

        if (suspensionReason === null) {
          return
        }

        if (!suspensionReason) {
          message.warning('Đã hủy thao tác vì chưa nhập lý do tạm khóa.')
          return
        }

        await suspendArtistApplication(item._id, {
          suspensionReason,
          adminNote: 'Tạm khóa quyền nghệ sĩ cho đến khi xử lý xong.',
        })
        message.success('Đã tạm khóa tư cách nghệ sĩ.')
      }

      await loadApplications({ query, status })
    } catch (actionError) {
      message.error(actionError.message || 'Cập nhật hồ sơ nghệ sĩ thất bại.')
    } finally {
      setActionId('')
    }
  }, [loadApplications, query, status])

  const columns = useMemo(
    () => [
      {
        title: 'Nghệ sĩ',
        dataIndex: 'displayName',
        key: 'displayName',
        render: (_, item) => (
          <Space direction="vertical" size={2}>
            <strong>
              {item.artistProfile?.stageName || item.displayName || 'Chưa có tên'}
            </strong>
            <Text type="secondary">{item.email}</Text>
            {item.artistProfile?.bio ? (
              <Text type="secondary" style={{ maxWidth: 360 }}>
                {item.artistProfile.bio}
              </Text>
            ) : null}
          </Space>
        ),
      },
      {
        title: 'Hồ sơ',
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
      {
        title: 'Ghi chú xét duyệt',
        dataIndex: 'artistReview',
        key: 'artistReview',
        render: (artistReview) => {
          const reviewText =
            artistReview?.rejectionReason ||
            artistReview?.suspensionReason ||
            artistReview?.adminNote ||
            ''

          return reviewText ? (
            <Text type="secondary">{reviewText}</Text>
          ) : (
            <Text type="secondary">-</Text>
          )
        },
      },
      {
        title: 'Ngày tạo',
        dataIndex: 'createdAt',
        key: 'createdAt',
        render: formatDate,
      },
      {
        title: 'Hành động',
        key: 'actions',
        render: (_, item) => (
          <Space wrap>
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              loading={actionId === `approve:${item._id}`}
              disabled={item.artistStatus === 'approved'}
              onClick={() => runArtistAction(item, 'approve')}
            >
              Duyệt
            </Button>
            <Button
              icon={<CloseCircleOutlined />}
              loading={actionId === `reject:${item._id}`}
              disabled={item.artistStatus === 'rejected'}
              onClick={() => runArtistAction(item, 'reject')}
            >
              Từ chối
            </Button>
            <Button
              danger
              icon={<StopOutlined />}
              loading={actionId === `suspend:${item._id}`}
              disabled={item.artistStatus === 'suspended'}
              onClick={() => runArtistAction(item, 'suspend')}
            >
              Tạm khóa
            </Button>
          </Space>
        ),
      },
    ],
    [actionId, runArtistAction],
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
            Hồ sơ nghệ sĩ
          </Title>
          <Text type="secondary">
            Duyệt, từ chối hoặc tạm khóa quyền nghệ sĩ trước khi họ phát hành nhạc.
          </Text>
        </Space>
      </div>

      <div style={{ padding: 30 }}>
        <Space direction="vertical" size={22} style={{ width: '100%' }}>
          <Space wrap style={{ width: '100%' }}>
            <Input
              placeholder="Tìm theo tên, email, nghệ danh hoặc tiểu sử"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onPressEnter={handleSearch}
              size="large"
              style={{ width: 360 }}
            />
            <Select
              value={status}
              options={statusOptions}
              onChange={handleStatusChange}
              size="large"
              style={{ width: 190 }}
            />
            <Button
              type="primary"
              icon={<SearchOutlined />}
              size="large"
              onClick={handleSearch}
            >
              Tìm kiếm
            </Button>
            <Button
              icon={<ReloadOutlined />}
              size="large"
              onClick={() => loadApplications({ query, status })}
            >
              Tải lại
            </Button>
          </Space>

          {error ? <Alert type="error" message={error} showIcon /> : null}

          <Table
            rowKey="_id"
            loading={loading}
            columns={columns}
            dataSource={items}
            pagination={{ pageSize: 10 }}
            scroll={{ x: 1100 }}
          />
        </Space>
      </div>
    </Card>
  )
}

export default AdminArtistApplicationsPageView
