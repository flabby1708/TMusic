const songHiddenFields = [
  'coverPublicId',
  'masterAudioPublicId',
  'masterAudioDurationSeconds',
  'masterAudioFormat',
  'masterAudioResourceType',
  'masterAudioOriginalFilename',
  'masterAudioSizeBytes',
]

export const resourceDefinitions = {
  songs: {
    label: 'Bai hat',
    titleField: 'title',
    subtitleField: 'artist',
    imageField: 'coverUrl',
    fields: [
      { name: 'title', label: 'Ten bai hat', type: 'text', required: true },
      { name: 'artist', label: 'Nghe si', type: 'text', required: true },
      {
        name: 'duration',
        label: 'Thoi luong',
        type: 'text',
        helper: 'Tu dong dien khi upload file nhac. Van co the sua tay neu can.',
      },
      { name: 'mood', label: 'Chu de', type: 'text' },
      {
        name: 'releaseStatus',
        label: 'Trang thai hien thi',
        type: 'select',
        options: [
          { value: 'published', label: 'Hien thi' },
          { value: 'draft', label: 'An bai hat' },
        ],
        defaultValue: 'published',
        helper: 'Chi bai hat Hien thi moi xuat hien o trang nghe nhac.',
      },
      { name: 'coverUrl', label: 'Link anh bia', type: 'url', uploadAssetType: 'image' },
      {
        name: 'audioUrl',
        label: 'Link file nhac',
        type: 'url',
        uploadAssetType: 'audio',
        helper: 'Ho tro upload mp3, wav, flac, m4a, aac, ogg len Cloudinary.',
      },
      { name: 'sortOrder', label: 'Thu tu', type: 'number' },
    ],
  },
  artists: {
    label: 'Nghe si',
    titleField: 'name',
    subtitleField: 'meta',
    imageField: 'imageUrl',
    fields: [
      { name: 'name', label: 'Ten nghe si', type: 'text', required: true },
      { name: 'meta', label: 'Loai', type: 'text' },
      { name: 'initials', label: 'Viet tat', type: 'text' },
      { name: 'imageUrl', label: 'Link anh', type: 'url', uploadAssetType: 'image' },
      { name: 'artwork', label: 'Gradient du phong', type: 'textarea' },
      { name: 'sortOrder', label: 'Thu tu', type: 'number' },
    ],
  },
  albums: {
    label: 'Album',
    titleField: 'title',
    subtitleField: 'artist',
    imageField: 'coverUrl',
    fields: [
      { name: 'title', label: 'Ten album', type: 'text', required: true },
      { name: 'artist', label: 'Nghe si', type: 'text', required: true },
      { name: 'coverUrl', label: 'Link anh bia', type: 'url', uploadAssetType: 'image' },
      { name: 'artwork', label: 'Gradient du phong', type: 'textarea' },
      { name: 'sortOrder', label: 'Thu tu', type: 'number' },
    ],
  },
  radios: {
    label: 'Radio',
    titleField: 'title',
    subtitleField: 'description',
    imageField: 'imageUrl',
    fields: [
      { name: 'title', label: 'Ten radio', type: 'text', required: true },
      { name: 'description', label: 'Mo ta', type: 'textarea', required: true },
      { name: 'imageUrl', label: 'Link anh', type: 'url', uploadAssetType: 'image' },
      { name: 'tone', label: 'Gradient nen', type: 'textarea' },
      {
        name: 'initials',
        label: 'Avatar fallback',
        type: 'text',
        helper: 'Nhap cach nhau boi dau phay',
      },
      { name: 'sortOrder', label: 'Thu tu', type: 'number' },
    ],
  },
  charts: {
    label: 'Bang xep hang',
    titleField: 'title',
    subtitleField: 'subtitle',
    imageField: 'coverUrl',
    fields: [
      { name: 'title', label: 'Ten chart', type: 'text', required: true },
      { name: 'subtitle', label: 'Mo ta', type: 'textarea', required: true },
      { name: 'coverUrl', label: 'Link anh', type: 'url', uploadAssetType: 'image' },
      { name: 'artwork', label: 'Gradient du phong', type: 'textarea' },
      { name: 'sortOrder', label: 'Thu tu', type: 'number' },
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

  if (resource === 'songs') {
    for (const fieldName of songHiddenFields) {
      values[fieldName] = ''
    }
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

  return values
}
