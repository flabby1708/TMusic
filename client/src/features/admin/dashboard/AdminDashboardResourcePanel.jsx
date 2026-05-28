import { useMemo, useState } from 'react'
import { Alert, Button, Empty, Input, Spin, Tag, Typography, theme } from 'antd'
import { CheckCircleOutlined, DeleteOutlined, EditOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons'

const { Text, Title } = Typography

const normalizeSearchValue = (value) => String(value || '').trim().toLowerCase()

const releaseStatusLabel = {
  draft: 'Bản nháp',
  pending: 'Chờ duyệt',
  published: 'Đã duyệt',
}

const getReleaseStatusColor = (status) => {
  if (status === 'published') {
    return 'green'
  }

  if (status === 'pending') {
    return 'gold'
  }

  return 'default'
}

function AdminDashboardResourcePanel(props) {
  const {
    activeResource,
    currentResource,
    editingId,
    error,
    items,
    loading,
    onApprove,
    onCreateNew,
    onDelete,
    onEdit,
    onReload,
    saving,
  } = props
  const [itemSearchQuery, setItemSearchQuery] = useState('')
  const [failedCoverUrls, setFailedCoverUrls] = useState(() => ({}))
  const {
    token: { borderRadiusLG, colorBorderSecondary, colorTextSecondary },
  } = theme.useToken()
  const isSongsResource = activeResource === 'songs'
  const isPodcastResource = activeResource === 'podcasts'
  const isAudioResource = isSongsResource || isPodcastResource
  const normalizedItemSearchQuery = normalizeSearchValue(itemSearchQuery)
  const filteredAudioItems = useMemo(() => {
    if (!isAudioResource || !normalizedItemSearchQuery) {
      return items
    }

    return items.filter((item) => {
      const title = normalizeSearchValue(item.title)
      const subtitle = isPodcastResource
        ? normalizeSearchValue([item.showTitle, item.host, item.category].filter(Boolean).join(' '))
        : normalizeSearchValue(item.artist)

      return title.includes(normalizedItemSearchQuery) || subtitle.includes(normalizedItemSearchQuery)
    })
  }, [isAudioResource, isPodcastResource, items, normalizedItemSearchQuery])

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
          padding: 22,
          borderRadius: 14,
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
            {isAudioResource
              ? 'Xem nội dung nghệ sĩ gửi lên và duyệt để đưa ra client.'
              : 'Quản lý danh sách, chỉnh sửa nội dung và cập nhật tài nguyên nhanh chóng.'}
          </Text>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <Tag color="processing" style={{ borderRadius: 999 }}>
            {items.length} mục
          </Tag>
          <Tag color={editingId ? 'warning' : 'success'} style={{ borderRadius: 999 }}>
            {isAudioResource ? 'Chế độ duyệt' : editingId ? 'Đang sửa' : 'Sẵn sàng tạo mới'}
          </Tag>
          {isAudioResource ? null : isSongsResource ? (
            <>
              <Button icon={<PlusOutlined />} onClick={onCreateNew} style={{ borderRadius: 12 }}>
                Thêm bài mới
              </Button>
            </>
          ) : (
            <>
              <Button icon={<PlusOutlined />} onClick={onCreateNew} style={{ borderRadius: 12 }}>
                {isPodcastResource ? 'Thêm podcast mới' : 'Thêm mới'}
              </Button>
            </>
          )}
          <Button icon={<ReloadOutlined />} onClick={() => void onReload()} style={{ borderRadius: 12 }}>
            Tải lại
          </Button>
        </div>
      </div>

      {error && !loading ? (
        <Alert type="error" message={error} showIcon style={{ marginBottom: 16, borderRadius: 10 }} />
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
      ) : isAudioResource ? (
        <div style={{ display: 'grid', gap: 14 }}>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              padding: 18,
              borderRadius: 12,
              background: 'rgba(255, 255, 255, 0.035)',
              border: `1px solid ${colorBorderSecondary}`,
            }}
          >
            <div>
              <Title level={4} style={{ margin: 0 }}>
                {isPodcastResource ? 'Podcast nghệ sĩ gửi lên' : 'Bài hát nghệ sĩ gửi lên'}
              </Title>
              <Text style={{ color: colorTextSecondary }}>
                {isPodcastResource
                  ? 'Admin chỉ duyệt podcast để hiển thị ngoài client, thao tác import nằm ở cổng nghệ sĩ.'
                  : 'Admin chỉ duyệt bài hát để hiển thị ngoài client, thao tác import nằm ở cổng nghệ sĩ.'}
              </Text>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10 }}>
              <Tag color="blue" style={{ borderRadius: 999, margin: 0 }}>
                {filteredAudioItems.length}/{items.length} {isPodcastResource ? 'podcast' : 'bài'}
              </Tag>
              <Input.Search
                allowClear
                placeholder={isPodcastResource ? 'Tìm podcast, show hoặc host' : 'Tìm tên bài hoặc nghệ sĩ'}
                value={itemSearchQuery}
                onChange={(event) => setItemSearchQuery(event.target.value)}
                style={{ width: 260 }}
              />
            </div>
          </div>

          {filteredAudioItems.length === 0 ? (
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
              <Empty description={isPodcastResource ? 'Không tìm thấy podcast phù hợp' : 'Không tìm thấy bài hát phù hợp'} />
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 10 }}>
              {filteredAudioItems.map((item) => {
                const isEditing = item._id === editingId
                const coverUrl = item.coverUrl || ''
                const hasCover = Boolean(coverUrl)
                const coverFailed = hasCover && failedCoverUrls[coverUrl]
                const hasAudio = Boolean(item.audioUrl)
                const isPublished = item.releaseStatus === 'published'
                const isPending = item.releaseStatus === 'pending'
                const title = item.title || (isPodcastResource ? 'Chưa đặt tên podcast' : 'Chưa đặt tên')
                const subtitle = isPodcastResource
                  ? [item.showTitle, item.host].filter(Boolean).join(' / ') || 'Chưa có show'
                  : item.artist || 'Chưa có nghệ sĩ'
                const ownerLabel = item.ownerName ? `Nghệ sĩ gửi: ${item.ownerName}` : 'Chưa rõ nghệ sĩ gửi'

                return (
                  <article
                    key={item._id}
                    role={isAudioResource ? undefined : 'button'}
                    tabIndex={isAudioResource ? undefined : 0}
                    onClick={() => {
                      if (!isAudioResource) {
                        onEdit(item)
                      }
                    }}
                    onKeyDown={(event) => {
                      if (isAudioResource) {
                        return
                      }

                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        onEdit(item)
                      }
                    }}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '88px minmax(0, 1fr) auto',
                      gap: 16,
                      alignItems: 'center',
                      padding: 16,
                      cursor: isAudioResource ? 'default' : 'pointer',
                      borderRadius: 12,
                      border: `1px solid ${isEditing ? 'oklch(78.5% 0.115 274.713 / 0.48)' : colorBorderSecondary}`,
                      background: isEditing
                        ? 'oklch(78.5% 0.115 274.713 / 0.12)'
                        : 'rgba(255, 255, 255, 0.025)',
                      boxShadow: isEditing ? '0 12px 28px oklch(78.5% 0.115 274.713 / 0.1)' : 'none',
                      transition: 'border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease',
                    }}
                  >
                    <div
                      style={{
                        width: 88,
                        height: 88,
                        display: 'grid',
                        placeItems: 'center',
                        overflow: 'hidden',
                        borderRadius: 10,
                        border: `1px solid ${colorBorderSecondary}`,
                        background: 'rgba(255, 255, 255, 0.035)',
                        color: colorTextSecondary,
                        fontSize: 12,
                        fontWeight: 700,
                        textAlign: 'center',
                      }}
                    >
                      {hasCover && !coverFailed ? (
                        <img
                          src={coverUrl}
                          alt={title}
                          onError={() => {
                            setFailedCoverUrls((current) => ({
                              ...current,
                              [coverUrl]: true,
                            }))
                          }}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            display: 'block',
                          }}
                        />
                      ) : (
                        <span>{hasCover ? 'Ảnh lỗi' : isPodcastResource ? 'Podcast' : 'No cover'}</span>
                      )}
                    </div>

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
                          {title}
                        </Title>
                        {isEditing ? (
                          <Tag color="cyan" style={{ borderRadius: 999, margin: 0 }}>
                            Đang chọn
                          </Tag>
                        ) : null}
                      </div>

                      <Text style={{ color: colorTextSecondary }}>
                        {subtitle}
                      </Text>
                      <Text style={{ color: colorTextSecondary, display: 'block', marginTop: 4 }}>
                        {ownerLabel}
                      </Text>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
                        <Tag style={{ borderRadius: 999 }}>ID {item._id.slice(-6)}</Tag>
                        <Tag color="default" style={{ borderRadius: 999 }}>
                          Thứ tự {item.sortOrder ?? 0}
                        </Tag>
                        {item.duration ? <Tag style={{ borderRadius: 999 }}>{item.duration}</Tag> : null}
                        <Tag color={getReleaseStatusColor(item.releaseStatus)} style={{ borderRadius: 999 }}>
                          {releaseStatusLabel[item.releaseStatus] || item.releaseStatus || 'Chưa rõ'}
                        </Tag>
                        {isPodcastResource && item.license ? (
                          <Tag color="blue" style={{ borderRadius: 999 }}>
                            {item.license}
                          </Tag>
                        ) : null}
                        <Tag color={hasCover ? 'green' : 'default'} style={{ borderRadius: 999 }}>
                          {hasCover ? 'Có ảnh bìa' : 'Chưa có ảnh'}
                        </Tag>
                        <Tag color={hasAudio ? 'green' : 'warning'} style={{ borderRadius: 999 }}>
                          {hasAudio
                            ? isPodcastResource
                              ? 'Có audio podcast'
                              : 'Có file nhạc'
                            : isPodcastResource
                              ? 'Thiếu audio podcast'
                              : 'Thiếu file nhạc'}
                        </Tag>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 10 }} onClick={(event) => event.stopPropagation()}>
                      {isAudioResource ? (
                        <Button
                          type="primary"
                          icon={<CheckCircleOutlined />}
                          onClick={() => void onApprove(item)}
                          disabled={saving || !isPending}
                          style={{ borderRadius: 12 }}
                        >
                          {isPublished ? 'Đã duyệt' : 'Duyệt'}
                        </Button>
                      ) : (
                        <>
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
                        </>
                      )}
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
                  borderRadius: 14,
                  border: `1px solid ${isEditing ? 'oklch(78.5% 0.115 274.713 / 0.36)' : colorBorderSecondary}`,
                  background: isEditing
                    ? 'oklch(78.5% 0.115 274.713 / 0.1)'
                    : 'rgba(255, 255, 255, 0.035)',
                  boxShadow: isEditing
                    ? '0 10px 30px oklch(78.5% 0.115 274.713 / 0.1)'
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
                      background: 'oklch(78.5% 0.115 274.713 / 0.14)',
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
