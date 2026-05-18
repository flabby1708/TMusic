import { Alert, Button, Input, Select, Typography, Upload, theme } from 'antd'
import { PlusOutlined, UploadOutlined } from '@ant-design/icons'
import {
  fieldLabelStyle,
  inputStyle,
  isUploadField,
  panelStyle,
} from './adminDashboardTheme'

const { Text, Title } = Typography
const { TextArea } = Input

function AdminDashboardEditorPanel(props) {
  const {
    activeResource,
    currentResource,
    editingId,
    formValues,
    handleArtistWikiImport,
    handleAssetUpload,
    handleChange,
    handleReset,
    handleSubmit,
    notice,
    saving,
    uploadingField,
  } = props
  const {
    token: { borderRadiusLG, colorBorderSecondary, colorTextSecondary },
  } = theme.useToken()
  const isSongResource = activeResource === 'songs'
  const isPodcastResource = activeResource === 'podcasts'
  const isArtistResource = activeResource === 'artists'
  let editorTitle = editingId ? 'Cập nhật mục đã chọn' : 'Thêm mới'
  let editorDescription = 'Điền thông tin để tạo mới hoặc chỉnh sửa mục hiện tại.'

  if (isSongResource) {
    editorTitle = editingId ? 'Đang chỉnh sửa bài hát' : 'Thêm bài mới'
    editorDescription = 'Chọn bài ở danh sách bên trái để sửa, hoặc tạo bài mới tại đây.'
  }

  if (isPodcastResource) {
    editorTitle = editingId ? 'Đang chỉnh sửa podcast' : 'Thêm podcast mới'
    editorDescription = 'Quản lý metadata, audio, cover và nguồn license cho từng tập podcast.'
  }

  const getUploadAccept = (field) => {
    if (field.uploadAssetType === 'audio') {
      return 'audio/*'
    }

    if (field.uploadAssetType === 'video') {
      return 'video/*'
    }

    return 'image/*'
  }

  const getUploadButtonLabel = (field) => {
    if (field.uploadAssetType === 'audio') {
      return isPodcastResource ? 'Tải podcast lên Cloudinary' : 'Tải file nhạc lên Cloudinary'
    }

    if (field.uploadAssetType === 'video') {
      return 'Tải music video lên Cloudinary'
    }

    return 'Tải ảnh lên Cloudinary'
  }

  const createUploadRequest = (field) => async ({ file, onError, onSuccess }) => {
    try {
      await handleAssetUpload(field, file)
      onSuccess?.({}, file)
    } catch (uploadError) {
      onError?.(uploadError)
    }
  }

  return (
    <aside style={{ minWidth: 0 }}>
      <div
        style={{
          ...panelStyle({
            colorBgContainer: 'rgba(255, 255, 255, 0.03)',
            colorBorderSecondary,
            borderRadiusLG,
          }),
          padding: 24,
          height: '100%',
          position: 'sticky',
          top: 20,
          background:
            'linear-gradient(180deg, rgba(255, 255, 255, 0.055), rgba(255, 255, 255, 0.025))',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 12,
            marginBottom: 20,
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
              Trình chỉnh sửa
            </Text>
            <Title level={3} style={{ margin: '8px 0 6px' }}>
              {editorTitle}
            </Title>
            <Text style={{ color: colorTextSecondary }}>
              {editorDescription}
            </Text>
          </div>

          <Button icon={<PlusOutlined />} onClick={handleReset} style={{ borderRadius: 12 }}>
            Mới
          </Button>
        </div>

        {notice ? (
          <Alert type="success" message={notice} showIcon style={{ marginBottom: 16, borderRadius: 16 }} />
        ) : null}

        {isSongResource && editingId ? (
          <div
            style={{
              marginBottom: 16,
              padding: 14,
              borderRadius: 18,
              border: `1px solid ${colorBorderSecondary}`,
              background: 'rgba(41, 212, 255, 0.08)',
            }}
          >
            <Text style={{ color: colorTextSecondary, display: 'block', marginBottom: 4 }}>
              Bài đang chọn
            </Text>
            <Title level={5} style={{ margin: 0 }}>
              {formValues.title || 'Chưa đặt tên'}
            </Title>
            <Text style={{ color: colorTextSecondary }}>
              {[formValues.artist, formValues.duration].filter(Boolean).join(' • ') || 'Chưa có thông tin phụ'}
            </Text>
          </div>
        ) : null}

        {isArtistResource ? (
          <div
            style={{
              marginBottom: 16,
              padding: 14,
              borderRadius: 18,
              border: `1px solid ${colorBorderSecondary}`,
              background: 'rgba(98, 216, 255, 0.08)',
            }}
          >
            <Text style={{ color: colorTextSecondary, display: 'block', marginBottom: 10 }}>
              Điền tên nghệ sĩ hoặc Link Wiki/source, rồi import để lấy bio, ảnh, alias và credits vào DB thật.
            </Text>
            <Button
              htmlType="button"
              onClick={() => void handleArtistWikiImport?.()}
              loading={saving}
              disabled={saving || (!formValues.name && !formValues.sourceUrl)}
              style={{ borderRadius: 12 }}
            >
              Import từ Wiki
            </Button>
          </div>
        ) : null}

        <form className="space-y-4" onSubmit={handleSubmit}>
          {currentResource.fields.map((field) => (
            <div key={field.name} style={{ display: 'block' }}>
              <span style={{ ...fieldLabelStyle, marginBottom: 8, display: 'inline-block' }}>
                {field.label}
                {field.required ? ' *' : ''}
              </span>

              {field.type === 'textarea' ? (
                <TextArea
                  value={formValues[field.name]}
                  onChange={(event) => handleChange(field.name, event.target.value)}
                  rows={4}
                  style={{ ...inputStyle, borderRadius: 14 }}
                />
              ) : field.type === 'select' ? (
                <Select
                  value={formValues[field.name]}
                  onChange={(value) => handleChange(field.name, value)}
                  options={field.options || []}
                  style={{ width: '100%' }}
                />
              ) : field.uploadAssetType === 'audio' || field.uploadAssetType === 'video' ? (
                <div style={{ display: 'grid', gap: 12 }}>
                  <Input
                    type={field.type}
                    value={formValues[field.name]}
                    onChange={(event) => handleChange(field.name, event.target.value)}
                    style={{ ...inputStyle, borderRadius: 14 }}
                  />

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                    <Upload
                      accept={getUploadAccept(field)}
                      customRequest={createUploadRequest(field)}
                      showUploadList={false}
                      disabled={saving || Boolean(uploadingField)}
                    >
                      <Button
                        icon={<UploadOutlined />}
                        loading={uploadingField === field.name}
                        disabled={saving || Boolean(uploadingField)}
                        style={{ borderRadius: 12 }}
                      >
                        {getUploadButtonLabel(field)}
                      </Button>
                    </Upload>

                    {formValues[field.name] ? (
                      <Button
                        htmlType="button"
                        style={{ borderRadius: 12 }}
                        onClick={() => window.open(formValues[field.name], '_blank', 'noopener,noreferrer')}
                      >
                        {field.uploadAssetType === 'video'
                          ? 'Mở video'
                          : isPodcastResource
                            ? 'Mở podcast'
                            : 'Mở file nhạc'}
                      </Button>
                    ) : null}
                  </div>

                  {formValues[field.name] ? (
                    <div
                      style={{
                        overflow: 'hidden',
                        borderRadius: 18,
                        border: `1px solid ${colorBorderSecondary}`,
                        background: 'rgba(255, 255, 255, 0.03)',
                        padding: 14,
                      }}
                    >
                      {field.uploadAssetType === 'video' ? (
                        <video controls src={formValues[field.name]} style={{ width: '100%' }} />
                      ) : (
                        <audio controls src={formValues[field.name]} style={{ width: '100%' }} />
                      )}
                    </div>
                  ) : null}
                </div>
              ) : isUploadField(field) ? (
                <div style={{ display: 'grid', gap: 12 }}>
                  <Input
                    type={field.type}
                    value={formValues[field.name]}
                    onChange={(event) => handleChange(field.name, event.target.value)}
                    style={{ ...inputStyle, borderRadius: 14 }}
                  />

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                    <Upload
                      accept={getUploadAccept(field)}
                      customRequest={createUploadRequest(field)}
                      showUploadList={false}
                      disabled={saving || Boolean(uploadingField)}
                    >
                      <Button
                        icon={<UploadOutlined />}
                        loading={uploadingField === field.name}
                        disabled={saving || Boolean(uploadingField)}
                        style={{ borderRadius: 12 }}
                      >
                        Tải ảnh lên Cloudinary
                      </Button>
                    </Upload>

                    {formValues[field.name] ? (
                      <Button
                        htmlType="button"
                        style={{ borderRadius: 12 }}
                        onClick={() => window.open(formValues[field.name], '_blank', 'noopener,noreferrer')}
                      >
                        Xem ảnh
                      </Button>
                    ) : null}
                  </div>

                  {formValues[field.name] ? (
                    <div
                      style={{
                        overflow: 'hidden',
                        borderRadius: 18,
                        border: `1px solid ${colorBorderSecondary}`,
                        background: 'rgba(255, 255, 255, 0.03)',
                      }}
                    >
                      <img
                        src={formValues[field.name]}
                        alt={field.label}
                        style={{ width: '100%', height: 190, objectFit: 'cover' }}
                      />
                    </div>
                  ) : null}
                </div>
              ) : (
                <Input
                  type={field.type}
                  value={formValues[field.name]}
                  onChange={(event) => handleChange(field.name, event.target.value)}
                  style={{ ...inputStyle, borderRadius: 14 }}
                />
              )}

              {field.helper ? (
                <Text
                  style={{
                    color: colorTextSecondary,
                    display: 'block',
                    marginTop: 8,
                    fontSize: 13,
                  }}
                >
                  {field.helper}
                </Text>
              ) : null}
            </div>
          ))}

          <div style={{ display: 'flex', gap: 10, paddingTop: 8 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={saving}
              style={{ flex: 1, borderRadius: 14, height: 44 }}
            >
              {editingId ? 'Cập nhật' : 'Tạo mới'}
            </Button>
            <Button
              htmlType="button"
              onClick={handleReset}
              style={{ flex: 1, borderRadius: 14, height: 44 }}
            >
              Đặt lại
            </Button>
          </div>
        </form>
      </div>
    </aside>
  )
}

export default AdminDashboardEditorPanel
