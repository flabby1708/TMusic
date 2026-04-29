import { useMemo, useState } from 'react'
import { Alert, Button, Empty, Input, Spin, Tag, Typography, theme } from 'antd'
import { CloudUploadOutlined, DeleteOutlined, EditOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons'

const { Text, Title } = Typography

const normalizeSearchValue = (value) => String(value || '').trim().toLowerCase()

function AdminDashboardResourcePanel(props) {
  const {
    activeResource,
    currentResource,
    editingId,
    error,
    items,
    loading,
    onOpenSongImport,
    onCreateNew,
    onDelete,
    onEdit,
    onReload,
    saving,
  } = props
  const [songSearchQuery, setSongSearchQuery] = useState('')
  const {
    token: { borderRadiusLG, colorBorderSecondary, colorTextSecondary },
  } = theme.useToken()
  const isSongsResource = activeResource === 'songs'
  const normalizedSongSearchQuery = normalizeSearchValue(songSearchQuery)
  const filteredSongItems = useMemo(() => {
    if (!isSongsResource || !normalizedSongSearchQuery) {
      return items
    }

    return items.filter((item) => {
      const title = normalizeSearchValue(item.title)
      const artist = normalizeSearchValue(item.artist)

      return title.includes(normalizedSongSearchQuery) || artist.includes(normalizedSongSearchQuery)
    })
  }, [isSongsResource, items, normalizedSongSearchQuery])

  return (
    <section style={{ minWidth: 0 }}>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 16,
          marginBottom: 20,
          padding: 20,
          borderRadius: 24,
          background: 'rgba(255, 255, 255, 0.03)',
          border: `1px solid ${colorBorderSecondary}`,
        }}
      >
        <div>
          <Text
            style={{
              color: colorTextSecondary,
              textTransform: 'uppercase',
              letterSpacing: '0.16em',
              fontSize: 11,
            }}
          >
            Trình duyệt dữ liệu
          </Text>
          <Title level={2} style={{ margin: '8px 0 6px' }}>
            {currentResource.label}
          </Title>
          <Text style={{ color: colorTextSecondary }}>
            Quản lý danh sách, chỉnh sửa nội dung và cập nhật tài nguyên nhanh chóng.
          </Text>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <Tag color="processing" style={{ borderRadius: 999 }}>
            {items.length} mục
          </Tag>
          <Tag color={editingId ? 'warning' : 'success'} style={{ borderRadius: 999 }}>
            {editingId ? 'Đang sửa' : 'Sẵn sàng tạo mới'}
          </Tag>
          {isSongsResource ? (
            <>
              <Button icon={<PlusOutlined />} onClick={onCreateNew} style={{ borderRadius: 12 }}>
                Thêm bài mới
              </Button>
              <Button
                icon={<CloudUploadOutlined />}
                onClick={onOpenSongImport}
                style={{ borderRadius: 12 }}
              >
                Import nhạc hàng loạt
              </Button>
            </>
          ) : null}
          <Button icon={<ReloadOutlined />} onClick={() => void onReload()} style={{ borderRadius: 12 }}>
            Tải lại
          </Button>
        </div>
      </div>

      {error && !loading ? (
        <Alert type="error" message={error} showIcon style={{ marginBottom: 16, borderRadius: 18 }} />
      ) : null}

      {loading ? (
        <div
          style={{
            minHeight: 420,
            display: 'grid',
            placeItems: 'center',
            borderRadius: borderRadiusLG,
            background: 'rgba(255, 255, 255, 0.025)',
            border: `1px solid ${colorBorderSecondary}`,
          }}
        >
          <Spin size="large" tip="Đang tải dữ liệu..." />
        </div>
      ) : items.length === 0 ? (
        <div
          style={{
            minHeight: 420,
            display: 'grid',
            placeItems: 'center',
            borderRadius: borderRadiusLG,
            background: 'rgba(255, 255, 255, 0.025)',
            border: `1px solid ${colorBorderSecondary}`,
          }}
        >
          <Empty description="Chưa có dữ liệu trong nhóm này" />
        </div>
      ) : isSongsResource ? (
        <div style={{ display: 'grid', gap: 14 }}>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              padding: 16,
              borderRadius: 22,
              background: 'rgba(255, 255, 255, 0.025)',
              border: `1px solid ${colorBorderSecondary}`,
            }}
          >
            <div>
              <Title level={4} style={{ margin: 0 }}>
                Danh sách bài đã thêm
              </Title>
              <Text style={{ color: colorTextSecondary }}>
                Chọn một bài để sửa, xóa hoặc quản lý lại sau.
              </Text>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10 }}>
              <Tag color="blue" style={{ borderRadius: 999, margin: 0 }}>
                {filteredSongItems.length}/{items.length} bài
              </Tag>
              <Input.Search
                allowClear
                placeholder="Tìm tên bài hoặc nghệ sĩ"
                value={songSearchQuery}
                onChange={(event) => setSongSearchQuery(event.target.value)}
                style={{ width: 260 }}
              />
            </div>
          </div>

          {filteredSongItems.length === 0 ? (
            <div
              style={{
                minHeight: 260,
                display: 'grid',
                placeItems: 'center',
                borderRadius: borderRadiusLG,
                background: 'rgba(255, 255, 255, 0.025)',
                border: `1px solid ${colorBorderSecondary}`,
              }}
            >
              <Empty description="Không tìm thấy bài hát phù hợp" />
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 10 }}>
              {filteredSongItems.map((item) => {
                const isEditing = item._id === editingId
                const hasCover = Boolean(item.coverUrl)
                const hasAudio = Boolean(item.audioUrl)
                const isPublished = item.releaseStatus === 'published'

                return (
                  <article
                    key={item._id}
                    role="button"
                    tabIndex={0}
                    onClick={() => onEdit(item)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        onEdit(item)
                      }
                    }}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'minmax(0, 1fr) auto',
                      gap: 16,
                      alignItems: 'center',
                      padding: 16,
                      cursor: 'pointer',
                      borderRadius: 22,
                      border: `1px solid ${isEditing ? 'rgba(41, 212, 255, 0.48)' : colorBorderSecondary}`,
                      background: isEditing
                        ? 'linear-gradient(90deg, rgba(41, 212, 255, 0.12), rgba(255, 255, 255, 0.04))'
                        : 'rgba(255, 255, 255, 0.025)',
                      boxShadow: isEditing ? '0 12px 28px rgba(41, 212, 255, 0.1)' : 'none',
                      transition: 'border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease',
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          alignItems: 'center',
                          gap: 8,
                          marginBottom: 6,
                        }}
                      >
                        <Title level={4} style={{ margin: 0, lineHeight: 1.35 }}>
                          {item.title || 'Chưa đặt tên'}
                        </Title>
                        {isEditing ? (
                          <Tag color="cyan" style={{ borderRadius: 999, margin: 0 }}>
                            Đang chọn
                          </Tag>
                        ) : null}
                      </div>

                      <Text style={{ color: colorTextSecondary }}>
                        {item.artist || 'Chưa có nghệ sĩ'}
                      </Text>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
                        <Tag style={{ borderRadius: 999 }}>ID {item._id.slice(-6)}</Tag>
                        <Tag color="default" style={{ borderRadius: 999 }}>
                          Thứ tự {item.sortOrder ?? 0}
                        </Tag>
                        {item.duration ? <Tag style={{ borderRadius: 999 }}>{item.duration}</Tag> : null}
                        <Tag color={isPublished ? 'green' : 'default'} style={{ borderRadius: 999 }}>
                          {isPublished ? 'Đang hiển thị' : 'Đang ẩn'}
                        </Tag>
                        <Tag color={hasCover ? 'green' : 'default'} style={{ borderRadius: 999 }}>
                          {hasCover ? 'Có ảnh bìa' : 'Chưa có ảnh'}
                        </Tag>
                        <Tag color={hasAudio ? 'green' : 'warning'} style={{ borderRadius: 999 }}>
                          {hasAudio ? 'Có file nhạc' : 'Thiếu file nhạc'}
                        </Tag>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 10 }} onClick={(event) => event.stopPropagation()}>
                      <Button icon={<EditOutlined />} onClick={() => onEdit(item)} style={{ borderRadius: 12 }}>
                        Sửa
                      </Button>
                      <Button
                        danger
                        type="primary"
                        icon={<DeleteOutlined />}
                        onClick={() => void onDelete(item)}
                        disabled={saving}
                        style={{ borderRadius: 12 }}
                      >
                        Xóa
                      </Button>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {items.map((item) => {
            const previewImage = item[currentResource.imageField]
            const title = item[currentResource.titleField]
            const subtitle = currentResource.subtitleField ? item[currentResource.subtitleField] : ''
            const isEditing = item._id === editingId

            return (
              <article
                key={item._id}
                style={{
                  overflow: 'hidden',
                  borderRadius: 26,
                  border: `1px solid ${isEditing ? 'rgba(41, 212, 255, 0.36)' : colorBorderSecondary}`,
                  background: isEditing
                    ? 'linear-gradient(180deg, rgba(41, 212, 255, 0.1), rgba(255, 255, 255, 0.04))'
                    : 'linear-gradient(180deg, rgba(255, 255, 255, 0.045), rgba(255, 255, 255, 0.025))',
                  boxShadow: isEditing
                    ? '0 10px 30px rgba(41, 212, 255, 0.1)'
                    : '0 8px 24px rgba(0, 0, 0, 0.1)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
                }}
              >
                {previewImage ? (
                  <div style={{ position: 'relative' }}>
                    <img
                      src={previewImage}
                      alt={title}
                      style={{ width: '100%', height: 190, objectFit: 'cover', display: 'block' }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(180deg, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.18))',
                      }}
                    />
                  </div>
                ) : (
                  <div
                    style={{
                      height: 190,
                      display: 'grid',
                      placeItems: 'center',
                      background:
                        'linear-gradient(135deg, rgba(255, 107, 87, 0.18), rgba(41, 212, 255, 0.14))',
                      fontWeight: 700,
                      fontSize: 16,
                    }}
                  >
                    Chưa có ảnh
                  </div>
                )}

                <div style={{ padding: 18 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      gap: 12,
                      marginBottom: 8,
                    }}
                  >
                    <Title level={4} style={{ margin: 0, lineHeight: 1.35 }}>
                      {title}
                    </Title>

                    {isEditing ? (
                      <Tag color="cyan" style={{ borderRadius: 999, margin: 0 }}>
                        Đang chọn
                      </Tag>
                    ) : null}
                  </div>

                  <Text
                    style={{
                      color: colorTextSecondary,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      minHeight: 44,
                      lineHeight: 1.7,
                    }}
                  >
                    {subtitle}
                  </Text>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
                    <Tag style={{ borderRadius: 999 }}>ID {item._id.slice(-6)}</Tag>
                    <Tag color="default" style={{ borderRadius: 999 }}>
                      Thứ tự {item.sortOrder ?? 0}
                    </Tag>
                  </div>

                  <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
                    <Button
                      icon={<EditOutlined />}
                      onClick={() => onEdit(item)}
                      style={{ flex: 1, borderRadius: 12 }}
                    >
                      Sửa
                    </Button>
                    <Button
                      danger
                      type="primary"
                      icon={<DeleteOutlined />}
                      onClick={() => void onDelete(item)}
                      disabled={saving}
                      style={{ flex: 1, borderRadius: 12 }}
                    >
                      Xóa
                    </Button>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}

export default AdminDashboardResourcePanel
