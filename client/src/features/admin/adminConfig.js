const songHiddenFields = [
  'coverPublicId',
  'masterAudioPublicId',
  'masterAudioDurationSeconds',
  'masterAudioFormat',
  'masterAudioResourceType',
  'masterAudioOriginalFilename',
  'masterAudioSizeBytes',
]

const podcastHiddenFields = [
  'coverPublicId',
  'audioPublicId',
  'audioDurationSeconds',
  'audioFormat',
  'audioResourceType',
  'audioOriginalFilename',
  'audioSizeBytes',
]

export const resourceDefinitions = {
  songs: {
    label: 'Bài hát',
    titleField: 'title',
    subtitleField: 'artist',
    imageField: 'coverUrl',
    fields: [
      { name: 'title', label: 'Tên bài hát', type: 'text', required: true },
      { name: 'artist', label: 'Nghệ sĩ', type: 'text', required: true },
      {
        name: 'duration',
        label: 'Thời lượng',
        type: 'text',
        helper: 'Tự động điền khi upload file nhạc. Vẫn có thể sửa tay nếu cần.',
      },
      { name: 'mood', label: 'Chủ đề', type: 'text' },
      {
        name: 'releaseStatus',
        label: 'Trạng thái hiển thị',
        type: 'select',
        options: [
          { value: 'published', label: 'Hiển thị' },
          { value: 'draft', label: 'Ẩn bài hát' },
        ],
        defaultValue: 'published',
        helper: 'Chỉ bài hát hiển thị mới xuất hiện ở trang nghe nhạc.',
      },
      { name: 'coverUrl', label: 'Link ảnh bìa', type: 'url', uploadAssetType: 'image' },
      {
        name: 'audioUrl',
        label: 'Link file nhạc',
        type: 'url',
        uploadAssetType: 'audio',
        helper: 'Hỗ trợ upload mp3, wav, flac, m4a, aac, ogg lên Cloudinary.',
      },
      { name: 'sortOrder', label: 'Thứ tự', type: 'number' },
    ],
  },
  podcasts: {
    label: 'Podcast',
    titleField: 'title',
    subtitleField: 'showTitle',
    imageField: 'coverUrl',
    fields: [
      { name: 'title', label: 'Tên tập podcast', type: 'text', required: true },
      { name: 'showTitle', label: 'Tên chương trình', type: 'text', required: true },
      { name: 'host', label: 'Host / tác giả', type: 'text' },
      { name: 'category', label: 'Chủ đề', type: 'text', defaultValue: 'Podcast' },
      { name: 'description', label: 'Mô tả', type: 'textarea' },
      {
        name: 'duration',
        label: 'Thời lượng',
        type: 'text',
        helper: 'Tự động điền khi upload audio. Có thể sửa tay nếu import bằng URL ngoài.',
      },
      {
        name: 'releaseStatus',
        label: 'Trạng thái hiển thị',
        type: 'select',
        options: [
          { value: 'published', label: 'Hiển thị' },
          { value: 'draft', label: 'Ẩn podcast' },
          { value: 'pending', label: 'Chờ duyệt' },
        ],
        defaultValue: 'published',
      },
      { name: 'coverUrl', label: 'Link ảnh podcast', type: 'url', uploadAssetType: 'image' },
      {
        name: 'audioUrl',
        label: 'Link file podcast',
        type: 'url',
        uploadAssetType: 'audio',
        helper: 'Hỗ trợ upload mp3, wav, flac, m4a, aac, ogg lên Cloudinary.',
      },
      { name: 'sourcePage', label: 'Trang nguồn / license', type: 'url' },
      { name: 'license', label: 'Giấy phép', type: 'text' },
      { name: 'sortOrder', label: 'Thứ tự', type: 'number' },
    ],
  },
  artists: {
    label: 'Nghệ sĩ',
    titleField: 'name',
    subtitleField: 'meta',
    imageField: 'imageUrl',
    fields: [
      { name: 'name', label: 'Tên nghệ sĩ', type: 'text', required: true },
      { name: 'meta', label: 'Loại', type: 'text' },
      { name: 'initials', label: 'Viết tắt', type: 'text' },
      { name: 'imageUrl', label: 'Link ảnh', type: 'url', uploadAssetType: 'image' },
      { name: 'artwork', label: 'Gradient dự phòng', type: 'textarea' },
      { name: 'sortOrder', label: 'Thứ tự', type: 'number' },
    ],
  },
  albums: {
    label: 'Album',
    titleField: 'title',
    subtitleField: 'artist',
    imageField: 'coverUrl',
    fields: [
      { name: 'title', label: 'Tên album', type: 'text', required: true },
      { name: 'artist', label: 'Nghệ sĩ', type: 'text', required: true },
      { name: 'coverUrl', label: 'Link ảnh bìa', type: 'url', uploadAssetType: 'image' },
      { name: 'artwork', label: 'Gradient dự phòng', type: 'textarea' },
      { name: 'sortOrder', label: 'Thứ tự', type: 'number' },
    ],
  },
  radios: {
    label: 'Radio',
    titleField: 'title',
    subtitleField: 'description',
    imageField: 'imageUrl',
    fields: [
      { name: 'title', label: 'Tên radio', type: 'text', required: true },
      { name: 'description', label: 'Mô tả', type: 'textarea', required: true },
      { name: 'imageUrl', label: 'Link ảnh', type: 'url', uploadAssetType: 'image' },
      { name: 'tone', label: 'Gradient nền', type: 'textarea' },
      {
        name: 'initials',
        label: 'Avatar fallback',
        type: 'text',
        helper: 'Nhập cách nhau bởi dấu phẩy.',
      },
      { name: 'sortOrder', label: 'Thứ tự', type: 'number' },
    ],
  },
  charts: {
    label: 'Bảng xếp hạng',
    titleField: 'title',
    subtitleField: 'subtitle',
    imageField: 'coverUrl',
    fields: [
      { name: 'title', label: 'Tên chart', type: 'text', required: true },
      { name: 'subtitle', label: 'Mô tả', type: 'textarea', required: true },
      { name: 'coverUrl', label: 'Link ảnh', type: 'url', uploadAssetType: 'image' },
      { name: 'artwork', label: 'Gradient dự phòng', type: 'textarea' },
      { name: 'sortOrder', label: 'Thứ tự', type: 'number' },
    ],
  },
}

export const resourceKeys = Object.keys(resourceDefinitions)

export const buildEmptyFormValues = (resource) => {
  const fields = resourceDefinitions[resource].fields
  const values = fields.reduce((accumulator, field) => {
    accumulator[field.name] = field.name === 'sortOrder' ? '0' : field.defaultValue || ''
    return accumulator
  }, {})

  const hiddenFields = resource === 'songs' ? songHiddenFields : resource === 'podcasts' ? podcastHiddenFields : []

  for (const fieldName of hiddenFields) {
    values[fieldName] = ''
  }

  return values
}

export const toFormValues = (resource, item) => {
  const values = buildEmptyFormValues(resource)

  for (const field of resourceDefinitions[resource].fields) {
    const rawValue = item[field.name]

    if (field.name === 'initials' && Array.isArray(rawValue)) {
      values[field.name] = rawValue.join(', ')
      continue
    }

    values[field.name] = rawValue == null ? values[field.name] : String(rawValue)
  }

  if (resource === 'songs') {
    values.coverPublicId = item.coverPublicId || ''
    values.masterAudioPublicId = item.masterAudio?.publicId || ''
    values.masterAudioDurationSeconds =
      item.masterAudio?.durationSeconds == null ? '' : String(item.masterAudio.durationSeconds)
    values.masterAudioFormat = item.masterAudio?.format || ''
    values.masterAudioResourceType = item.masterAudio?.resourceType || ''
    values.masterAudioOriginalFilename = item.masterAudio?.originalFilename || ''
    values.masterAudioSizeBytes =
      item.masterAudio?.sizeBytes == null ? '' : String(item.masterAudio.sizeBytes)
  }

  if (resource === 'podcasts') {
    values.coverPublicId = item.coverPublicId || ''
    values.audioPublicId = item.audio?.publicId || ''
    values.audioDurationSeconds =
      item.audio?.durationSeconds == null ? '' : String(item.audio.durationSeconds)
    values.audioFormat = item.audio?.format || ''
    values.audioResourceType = item.audio?.resourceType || ''
    values.audioOriginalFilename = item.audio?.originalFilename || ''
    values.audioSizeBytes = item.audio?.sizeBytes == null ? '' : String(item.audio.sizeBytes)
  }

  return values
}
